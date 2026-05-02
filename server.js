const express = require('express');
const path = require('path');
const axios = require('axios');

const app = express();
const publicDir = path.join(__dirname);

// Middleware
app.use(express.static(publicDir));
app.use(express.json());

app.get('/', (req, res) => {
  res.sendFile(path.join(publicDir, 'index.html'));
});

function parseInstagramNumber(value) {
  if (!value) return null;
  const normalized = String(value).trim().replace(/,/g, '').toUpperCase();
  const match = normalized.match(/^([\d.]+)([KM])?$/);
  if (!match) return parseInt(normalized.replace(/[^\d]/g, ''), 10) || null;
  let num = parseFloat(match[1]);
  if (match[2] === 'K') num *= 1000;
  if (match[2] === 'M') num *= 1000000;
  return Math.round(num);
}

function parseInstagramUserData(user, username) {
  return {
    username,
    full_name: user.full_name ?? null,
    biography: user.biography ?? null,
    posts: user.edge_owner_to_timeline_media?.count ?? null,
    followers: user.edge_followed_by?.count ?? null,
    following: user.edge_follow?.count ?? null,
    profile_pic_url: user.profile_pic_url_hd || user.profile_pic_url || null,
    is_verified: user.is_verified || false,
    external_url: user.external_url || null,
  };
}

async function fetchInstagramProfile(username) {
  const jsonEndpoint = `https://i.instagram.com/api/v1/users/web_profile_info/?username=${encodeURIComponent(username)}`;

  try {
    const response = await axios.get(jsonEndpoint, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36',
        Accept: 'application/json, text/javascript, */*; q=0.01',
        'x-ig-app-id': '936619743392459',
      },
      responseType: 'json',
    });

    const user = response.data?.data?.user;
    if (user) {
      return parseInstagramUserData(user, username);
    }
  } catch (err) {
    console.warn('Instagram web_profile_info fallback:', err.message || err);
  }

  const response = await axios.get(`https://www.instagram.com/${username}/`, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36',
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    },
  });

  return parseInstagramProfileHtml(response.data, username);
}

function parseInstagramProfileHtml(html, username) {
  const profile = {
    username,
    full_name: null,
    biography: null,
    posts: null,
    followers: null,
    following: null,
    profile_pic_url: null,
    is_verified: false,
    external_url: null,
  };

  const sharedDataMatch = html.match(/window\._sharedData\s*=\s*({[\s\S]*?});<\/script>/);
  if (sharedDataMatch) {
    try {
      const sharedData = JSON.parse(sharedDataMatch[1]);
      const user = sharedData.entry_data?.ProfilePage?.[0]?.graphql?.user;
      if (user) {
        profile.full_name = user.full_name;
        profile.biography = user.biography;
        profile.posts = user.edge_owner_to_timeline_media?.count ?? null;
        profile.followers = user.edge_followed_by?.count ?? null;
        profile.following = user.edge_follow?.count ?? null;
        profile.profile_pic_url = user.profile_pic_url_hd || user.profile_pic_url;
        profile.is_verified = user.is_verified;
        profile.external_url = user.external_url;
        return profile;
      }
    } catch (err) {
      // ignore parse error
    }
  }

  const ldMatch = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
  if (ldMatch) {
    try {
      const ldData = JSON.parse(ldMatch[1]);
      profile.full_name = profile.full_name || ldData.name;
      profile.biography = profile.biography || ldData.description;
      profile.profile_pic_url = profile.profile_pic_url || ldData.image;
    } catch (err) {
      // ignore parse error
    }
  }

  const metaDesc = html.match(/<meta property="og:description" content="([^"]+)"/);
  if (metaDesc) {
    const desc = metaDesc[1];
    const counts = desc.match(/([\d.,KM]+)\s+Followers?,\s+([\d.,KM]+)\s+Following,\s+([\d.,KM]+)\s+Posts?/i);
    if (counts) {
      profile.followers = profile.followers ?? parseInstagramNumber(counts[1]);
      profile.following = profile.following ?? parseInstagramNumber(counts[2]);
      profile.posts = profile.posts ?? parseInstagramNumber(counts[3]);
    }
  }

  return profile;
}

app.get('/api/instagram/public', async (req, res) => {
  const url = req.query.url;
  if (!url) {
    return res.status(400).json({ error: 'Missing url parameter' });
  }

  try {
    const normalizedUrl = url.startsWith('http') ? url : `https://${url}`;
    const parsed = new URL(normalizedUrl);
    if (!parsed.hostname.includes('instagram.com')) {
      return res.status(400).json({ error: 'URL must be an Instagram profile' });
    }

    const pathParts = parsed.pathname.split('/').filter(Boolean);
    const username = pathParts[0];
    if (!username) {
      return res.status(400).json({ error: 'Invalid Instagram profile URL' });
    }

    const profile = await fetchInstagramProfile(username);
    if (profile.followers == null && profile.posts == null) {
      return res.status(500).json({ error: 'Failed to parse public Instagram profile data' });
    }

    res.json(profile);
  } catch (error) {
    console.error('Public profile fetch error:', error.message || error);
    res.status(500).json({ error: 'Failed to fetch Instagram profile. The page may be private or Instagram may be blocking requests.' });
  }
});

app.get('/api/image', async (req, res) => {
  const imageUrl = req.query.url;
  if (!imageUrl) {
    return res.status(400).json({ error: 'Missing url parameter' });
  }

  try {
    const response = await axios.get(imageUrl, {
      responseType: 'stream',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36',
      },
    });

    res.setHeader('Content-Type', response.headers['content-type']);
    res.setHeader('Cache-Control', 'public, max-age=3600');
    response.data.pipe(res);
  } catch (error) {
    console.error('Image proxy error:', error.message || error);
    res.status(500).json({ error: 'Failed to fetch image' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
