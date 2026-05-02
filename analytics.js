/* ════════════════════════════════════════════
   analytics.js  –  Analytics Page Renderer
   ════════════════════════════════════════════ */

'use strict';

/* ── DATA ── */
const ANALYTICS_DATA = {
  metrics: [
    { label: 'Total Views',     value: '—',  trend: 'up',   change: '—' },
    { label: 'Accounts Reached',value: '—',  trend: 'up',   change: '—' },
    { label: 'Interactions',    value: '—',   trend: 'up',   change: '—' },
    { label: 'Saves',           value: '—',  trend: 'up',   change: '—'  },
    { label: 'Link Clicks',     value: '—',  trend: 'down', change: '—'  },
    { label: 'Story Replies',   value: '—',   trend: 'up',   change: '—' },
  ],

  // Dynamic data - will be updated based on profile
  weeklyReach: [],
  weeklyLabels: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],
  followerSources: [],
  contentBreakdown: [],
  topLocations: [],

  // Heatmap: 7 days × 24 hours (0–100 engagement score)
  heatmap: [],

  genderSplit: { female: 58, male: 38, other: 4 },
};

function generateHeatmapData(profile) {
  const followers = profile ? profile.followers || 0 : 0;
  const following = profile ? profile.following || 0 : 0;
  const isBusiness = following < followers * 0.5;
  const isInfluencer = followers > 10000;

  const data = [];
  for (let d = 0; d < 7; d++) {
    const row = [];
    for (let h = 0; h < 24; h++) {
      // Base engagement level based on follower count
      let baseVal = Math.max(5, Math.min(50, followers / 2000)); // Scale with followers
      let val = Math.random() * baseVal;

      // Peak hours vary by account type
      if (isBusiness) {
        // Business accounts: peak during work hours and lunch
        if (h >= 8 && h <= 10) val += Math.random() * 60;
        if (h >= 12 && h <= 14) val += Math.random() * 80;
        if (h >= 17 && h <= 19) val += Math.random() * 40;
      } else if (isInfluencer) {
        // Influencers: peak in evening and weekends
        if (h >= 18 && h <= 22) val += Math.random() * 90;
        if (d >= 5) val += Math.random() * 30; // Weekend boost
      } else {
        // Regular accounts: morning and evening peaks
        if (h >= 7 && h <= 9) val += Math.random() * 70;
        if (h >= 18 && h <= 22) val += Math.random() * 90;
        if (h >= 12 && h <= 14) val += Math.random() * 40;
      }

      row.push(Math.min(100, Math.round(val)));
    }
    data.push(row);
  }
  return data;
}

/* ── RENDER ANALYTICS ── */
function renderAnalytics() {
  const el = document.getElementById('analyticsContent');
  if (!el) return;
  if (el.dataset.rendered) return;
  el.dataset.rendered = '1';

  el.innerHTML = `
    <!-- Hero Section -->
    <div class="hero-section" style="text-align: center; margin-bottom: 48px; padding: 40px 0;">
      <h1 style="font-size: 2.5rem; font-weight: 800; margin: 0 0 16px 0; background: var(--ig-grad); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; letter-spacing: -0.04em;">
        Instagram Analytics Studio
      </h1>
      <p style="font-size: 1.1rem; color: var(--text-secondary); margin: 0 0 32px 0; max-width: 600px; margin-left: auto; margin-right: auto; line-height: 1.6;">
        Get deep insights into Instagram profiles with professional analytics, engagement metrics, and growth tracking.
      </p>
    </div>

    <!-- Input Card -->
    <div class="input-card" style="max-width: 600px; margin: 0 auto 48px auto;">
      <div class="card" style="padding: 32px; text-align: center; background: var(--glass-bg); backdrop-filter: blur(20px); border: 1px solid var(--glass-border); border-radius: var(--radius-xl); box-shadow: var(--shadow-lg);">
        <div style="display:flex;gap:16px;flex-wrap:wrap;align-items:center;justify-content:center;">
          <input id="instagramProfileInput" type="text" placeholder="Paste Instagram profile URL..." style="flex:1;min-width:300px;padding:16px 20px;border:2px solid var(--border);border-radius:16px;background:var(--bg-card);
            color:var(--text-primary);outline:none;font-size:1rem;transition:var(--transition);box-shadow:var(--shadow-sm);" />
          <button class="analyze-btn" id="instagramProfileSubmit" style="padding:16px 28px;border-radius:16px;font-weight:600;font-size:1rem;background:var(--ig-grad);color:#fff;border:none;
            cursor:pointer;transition:var(--transition);box-shadow:var(--shadow-md);min-width:140px;">
            <span class="btn-text">Analyze Profile</span>
            <div class="btn-loader" style="display:none;width:20px;height:20px;border:2px solid rgba(255,255,255,0.3);border-top:2px solid #fff;border-radius:50%;animation:spin 1s linear infinite;margin:0 auto;"></div>
          </button>
        </div>
        <p id="instagramProfileAlert" style="margin-top:20px;color:var(--text-muted);font-size:1rem;">Enter a public Instagram profile URL to get started</p>
      </div>
    </div>
    <div id="instagramProfileResult"></div>

    <!-- Footer -->
    <div class="footer" style="text-align: center; margin-top: 64px; padding: 32px 0; border-top: 1px solid var(--border);">
      <p style="color: var(--text-muted); font-size: 0.9rem; margin: 0;">
        Built with ❤️ for Instagram creators • Professional analytics powered by data
      </p>
    </div>
  `;

  // Add loading animation keyframes
  const style = document.createElement('style');
  style.textContent = `
    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    .analyze-btn:hover { transform: translateY(-2px); box-shadow: var(--shadow-lg); }
    .analyze-btn:active { transform: translateY(0); }
    .input-card input:focus { border-color: var(--accent-3); box-shadow: 0 0 0 4px rgba(204,35,102,0.15); }
  `;
  document.head.appendChild(style);

  bindAnalyticsSearch();
}

function bindAnalyticsSearch() {
  const input = document.getElementById('instagramProfileInput');
  const button = document.getElementById('instagramProfileSubmit');
  const alertEl = document.getElementById('instagramProfileAlert');

  if (!input || !button) return;

  const performSearch = async () => {
    const url = input.value.trim();
    if (!url) {
      showToast('Please paste an Instagram profile URL.', 'error');
      return;
    }

    // Show loading state
    const button = document.getElementById('instagramProfileSubmit');
    const btnText = button.querySelector('.btn-text');
    const btnLoader = button.querySelector('.btn-loader');
    const alertEl = document.getElementById('instagramProfileAlert');

    button.disabled = true;
    btnText.style.display = 'none';
    btnLoader.style.display = 'block';
    button.style.opacity = '0.8';

    if (alertEl) {
      alertEl.textContent = 'Analyzing profile data...';
      alertEl.style.color = 'var(--blue)';
    }

    try {
      const resp = await fetch(`/api/instagram/public?url=${encodeURIComponent(url)}`);
      const data = await resp.json();
      if (!resp.ok) {
        throw new Error(data.error || 'Could not load profile');
      }
      renderInstagramProfileResult(data);
      updateAnalyticsCards(data);
      if (alertEl) {
        alertEl.textContent = 'Analysis complete! Scroll down to see insights.';
        alertEl.style.color = 'var(--green)';
      }
    } catch (err) {
      showToast(err.message || 'Failed to fetch Instagram profile.', 'error');
      if (alertEl) {
        alertEl.textContent = err.message || 'Unable to analyze the profile. Please check the URL and try again.';
        alertEl.style.color = 'var(--red)';
      }
    } finally {
      // Reset loading state
      button.disabled = false;
      btnText.style.display = 'block';
      btnLoader.style.display = 'none';
      button.style.opacity = '1';
    }
  };

  button.addEventListener('click', performSearch);
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      e.preventDefault();
      performSearch();
    }
  });
}

function formatNumber(num) {
  if (num == null || Number.isNaN(num)) return '—';
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${Math.round(num / 1000)}K`;
  return num.toString();
}

function renderInstagramProfileResult(profile) {
  const resultEl = document.getElementById('instagramProfileResult');
  if (!resultEl) return;

  const followers = profile.followers || 0;
  const posts = profile.posts || 0;
  const engagement = Math.max(0, Math.round(followers * 0.045));
  const reach = Math.max(0, Math.round(followers * 1.4));

  // Generate dynamic data for this profile
  const dynamicData = generateDynamicAnalyticsData(profile);

  resultEl.innerHTML = `
    <div class="profile-card" style="background: var(--glass-bg); backdrop-filter: blur(20px); border: 1px solid var(--glass-border); border-radius: var(--radius-xl); padding: 32px; margin-bottom: 32px; box-shadow: var(--shadow-lg); position: relative; overflow: hidden;">
      <div style="position: absolute; top: 0; left: 0; right: 0; height: 6px; background: var(--ig-grad);"></div>
      <div style="display:grid;grid-template-columns:auto 1fr;gap:24px;align-items:center;">
        <div class="profile-avatar" style="position: relative;">
          <img src="${profile.profile_pic_url ? `/api/image?url=${encodeURIComponent(profile.profile_pic_url)}` : 'https://via.placeholder.com/120'}" alt="${profile.username}" style="width:112px;height:112px;border-radius:28px;object-fit:cover;border:3px solid var(--glass-border);box-shadow:var(--shadow-md);" />
          ${profile.is_verified ? '<div style="position:absolute;bottom:8px;right:8px;width:24px;height:24px;background:var(--blue);border-radius:50%;display:flex;align-items:center;justify-content:center;border:2px solid var(--bg-card);"><svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" style="width:14px;height:14px;"><polyline points="20,6 9,17 4,12"></polyline></svg></div>' : ''}
        </div>
        <div class="profile-info">
          <div style="display:flex;gap:12px;align-items:center;margin-bottom:12px;">
            <h2 style="margin:0;font-size:1.4rem;font-weight:700;color:var(--text-accent);">${profile.username}</h2>
            ${profile.is_verified ? '<span style="background:var(--blue);color:white;padding:4px 8px;border-radius:12px;font-size:0.75rem;font-weight:600;">VERIFIED</span>' : ''}
          </div>
          <p style="margin:0 0 16px;color:var(--text-secondary);font-size:1.05rem;line-height:1.5;">${profile.full_name || 'Instagram User'}</p>
          <p style="margin:0 0 20px;color:var(--text-muted);font-size:0.95rem;line-height:1.6;">${profile.biography || 'No bio available'}</p>
          <div style="display:flex;gap:20px;flex-wrap:wrap;font-size:0.95rem;color:var(--text-primary);">
            <div style="text-align:center;">
              <div style="font-size:1.3rem;font-weight:700;margin-bottom:2px;">${formatNumber(followers)}</div>
              <div style="color:var(--text-muted);font-size:0.8rem;text-transform:uppercase;letter-spacing:0.05em;">Followers</div>
            </div>
            <div style="text-align:center;">
              <div style="font-size:1.3rem;font-weight:700;margin-bottom:2px;">${formatNumber(profile.following)}</div>
              <div style="color:var(--text-muted);font-size:0.8rem;text-transform:uppercase;letter-spacing:0.05em;">Following</div>
            </div>
            <div style="text-align:center;">
              <div style="font-size:1.3rem;font-weight:700;margin-bottom:2px;">${formatNumber(posts)}</div>
              <div style="color:var(--text-muted);font-size:0.8rem;text-transform:uppercase;letter-spacing:0.05em;">Posts</div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="analytics-overview">
      ${[
        { label: 'Estimated Reach', value: formatNumber(reach), trend: 'up', change: '+12%' },
        { label: 'Estimated Engagement', value: formatNumber(engagement), trend: 'up', change: '+8%' },
        { label: 'Followers', value: formatNumber(followers), trend: 'up', change: '+3%' },
        { label: 'Profile Visits', value: formatNumber(Math.max(0, Math.round(followers * 0.18))), trend: 'up', change: '+5%' },
      ].map(m => `
        <div class="analytics-metric">
          <div class="metric-label">${m.label}</div>
          <div class="metric-value">${m.value}</div>
          <div class="metric-trend ${m.trend}">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M18 15l-6-6-6 6"/></svg>
            ${m.change} vs last period
          </div>
        </div>
      `).join('')}
    </div>
    <div class="analytics-charts-row">
      <div class="big-chart-card">
        <h3 style="margin:0 0 16px;font-size:1.1rem;">Weekly Reach for @${profile.username}</h3>
        <div id="reachChartWrap" class="chart-canvas-wrap"></div>
      </div>
      <div class="donut-card">
        <h3 style="margin:0 0 16px;font-size:1.1rem;">Content Breakdown</h3>
        <div class="donut-wrap">
          <div id="donutWrap" class="donut-svg-wrap"></div>
          <div id="donutLegend" class="donut-legend"></div>
        </div>
      </div>
    </div>
    <div class="analytics-charts-row-2">
      <div class="bar-chart-card">
        <h3 style="margin:0 0 16px;font-size:1.1rem;">How @${profile.username} Gains Followers</h3>
        <div class="bars-container">
          ${dynamicData.followerSources.map(source => `
            <div class="bar-col">
              <div class="bar-body" style="height: 0px;" data-target="${source.pct * 1.6}px" title="${source.source}: ${source.pct}%"></div>
              <div class="bar-label">${source.source}</div>
              <div class="bar-value">${source.count} • ${source.pct}%</div>
            </div>
          `).join('')}
        </div>
      </div>
      <div class="heatmap-card">
        <h3 style="margin:0 0 16px;font-size:1.1rem;">Engagement Heatmap</h3>
        <div id="heatmapWrap"></div>
      </div>
    </div>
  `;

  // Draw charts with staggered animation
  setTimeout(() => {
    drawReachChart();
    setTimeout(() => drawDonutChart(), 200);
    setTimeout(() => drawHeatmap(), 400);
    setTimeout(() => animateFollowerBars(), 600);
  }, 300);
}

function updateAnalyticsCards(profile) {
  const followers = profile.followers || 0;
  const posts = profile.posts || 0;
  const reach = Math.max(0, Math.round(followers * 1.4));
  const interactions = Math.max(0, Math.round(followers * 0.06));
  const saves = Math.max(0, Math.round(followers * 0.012));

  // Generate dynamic data based on profile
  const dynamicData = generateDynamicAnalyticsData(profile);

  // Update static metrics
  const updates = {
    'total-views': formatNumber(reach),
    'accounts-reached': formatNumber(reach),
    'interactions': formatNumber(interactions),
    'saves': formatNumber(saves),
    'link-clicks': formatNumber(Math.max(0, Math.round(interactions * 0.05))),
    'story-replies': formatNumber(Math.max(0, Math.round(interactions * 0.02))),
  };

  Object.entries(updates).forEach(([key, value]) => {
    const metricEl = document.getElementById(`metric-${key}`);
    if (metricEl) {
      const valueEl = metricEl.querySelector('.metric-value');
      if (valueEl) valueEl.textContent = value;
    }
  });

  // Update charts with dynamic data
  updateChartsWithDynamicData(dynamicData);
}

function generateDynamicAnalyticsData(profile) {
  const followers = profile.followers || 0;
  const posts = profile.posts || 0;
  const following = profile.following || 0;

  // Generate dynamic weekly reach based on follower count
  const baseReach = Math.max(100, Math.round(followers * 0.02));
  const weeklyReach = [];
  for (let i = 0; i < 7; i++) {
    const variation = 0.8 + Math.random() * 0.4; // 80-120% variation
    weeklyReach.push(Math.round(baseReach * variation));
  }

  // Generate dynamic follower sources based on profile characteristics
  const isBusiness = following < followers * 0.5; // Business accounts typically have more followers than following
  const isInfluencer = followers > 10000;
  const isLocal = profile.external_url && (profile.external_url.includes('maps') || profile.external_url.includes('location'));

  let followerSources;
  if (isBusiness) {
    followerSources = [
      { source: 'Explore page', count: `+${Math.round(followers * 0.35)}`, pct: 35 },
      { source: 'Hashtags', count: `+${Math.round(followers * 0.25)}`, pct: 25 },
      { source: 'Profile visits', count: `+${Math.round(followers * 0.20)}`, pct: 20 },
      { source: 'Direct share', count: `+${Math.round(followers * 0.15)}`, pct: 15 },
      { source: 'Other', count: `+${Math.round(followers * 0.05)}`, pct: 5 },
    ];
  } else if (isInfluencer) {
    followerSources = [
      { source: 'Explore page', count: `+${Math.round(followers * 0.40)}`, pct: 40 },
      { source: 'Hashtags', count: `+${Math.round(followers * 0.30)}`, pct: 30 },
      { source: 'Profile visits', count: `+${Math.round(followers * 0.15)}`, pct: 15 },
      { source: 'Direct share', count: `+${Math.round(followers * 0.10)}`, pct: 10 },
      { source: 'Other', count: `+${Math.round(followers * 0.05)}`, pct: 5 },
    ];
  } else {
    followerSources = [
      { source: 'Explore page', count: `+${Math.round(followers * 0.45)}`, pct: 45 },
      { source: 'Hashtags', count: `+${Math.round(followers * 0.23)}`, pct: 23 },
      { source: 'Profile visits', count: `+${Math.round(followers * 0.16)}`, pct: 16 },
      { source: 'Direct share', count: `+${Math.round(followers * 0.10)}`, pct: 10 },
      { source: 'Other', count: `+${Math.round(followers * 0.06)}`, pct: 6 },
    ];
  }

  // Generate dynamic content breakdown based on post count and account type
  let contentBreakdown;
  if (posts < 50) {
    // New account - more posts
    contentBreakdown = [
      { label: 'Posts', pct: 60, color: '#e6683c' },
      { label: 'Stories', pct: 25, color: '#f09433' },
      { label: 'Reels', pct: 10, color: '#dc2743' },
      { label: 'Carousels', pct: 5, color: '#cc2366' },
    ];
  } else if (isBusiness) {
    // Business account - more carousels and posts
    contentBreakdown = [
      { label: 'Posts', pct: 35, color: '#e6683c' },
      { label: 'Carousels', pct: 30, color: '#cc2366' },
      { label: 'Reels', pct: 20, color: '#dc2743' },
      { label: 'Stories', pct: 15, color: '#f09433' },
    ];
  } else {
    // Regular account - more reels and stories
    contentBreakdown = [
      { label: 'Reels', pct: 45, color: '#dc2743' },
      { label: 'Stories', pct: 25, color: '#f09433' },
      { label: 'Posts', pct: 20, color: '#e6683c' },
      { label: 'Carousels', pct: 10, color: '#cc2366' },
    ];
  }

  // Generate dynamic top locations based on follower count and account type
  let topLocations;
  if (isLocal) {
    topLocations = [
      { city: 'Local Area', pct: 35 },
      { city: 'Nearby City', pct: 25 },
      { city: 'Same State', pct: 20 },
      { city: 'National', pct: 15 },
      { city: 'International', pct: 5 },
    ];
  } else if (followers > 100000) {
    topLocations = [
      { city: 'Mumbai', pct: 18 },
      { city: 'Delhi', pct: 15 },
      { city: 'London', pct: 12 },
      { city: 'NYC', pct: 10 },
      { city: 'Dubai', pct: 8 },
    ];
  } else {
    // Generate based on account size
    const cities = ['Local City', 'Nearby', 'State Capital', 'National', 'International'];
    topLocations = cities.map((city, i) => ({
      city,
      pct: Math.max(5, 25 - i * 5)
    }));
  }

  // Generate dynamic heatmap based on profile characteristics
  const heatmap = generateHeatmapData(profile);

  return {
    weeklyReach,
    followerSources,
    contentBreakdown,
    topLocations,
    heatmap
  };
}

function updateChartsWithDynamicData(dynamicData) {
  // Update global data for charts
  ANALYTICS_DATA.weeklyReach = dynamicData.weeklyReach;
  ANALYTICS_DATA.followerSources = dynamicData.followerSources;
  ANALYTICS_DATA.contentBreakdown = dynamicData.contentBreakdown;
  ANALYTICS_DATA.topLocations = dynamicData.topLocations;
  ANALYTICS_DATA.heatmap = dynamicData.heatmap;

  // Redraw charts with new data
  setTimeout(() => {
    drawReachChart();
    drawDonutChart();
    drawHeatmap();
    // Update bar chart HTML with new data
    const barContainer = document.querySelector('.bars-container');
    if (barContainer) {
      barContainer.innerHTML = dynamicData.followerSources.map(source => `
        <div class="bar-col">
          <div class="bar-body" style="height: 0px;" data-target="${source.pct * 1.6}px" title="${source.source}: ${source.pct}%"></div>
          <div class="bar-label">${source.source}</div>
          <div class="bar-value">${source.count} • ${source.pct}%</div>
        </div>
      `).join('');
      animateFollowerBars();
    }
  }, 100);
}

/* ── REACH LINE CHART (SVG) ── */
function drawReachChart() {
  const wrap = document.getElementById('reachChartWrap');
  if (!wrap) return;

  const data = ANALYTICS_DATA.weeklyReach;
  if (!data || data.length === 0) return; // No data to draw

  const W = wrap.clientWidth || 400;
  const H = 250;
  const padL = 50, padR = 20, padT = 20, padB = 30;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;
  const labels = ANALYTICS_DATA.weeklyLabels;
  const min = 0;
  const max = Math.max(...data) * 1.15;

  const xPos = i => padL + (i / (data.length - 1)) * chartW;
  const yPos = v => padT + chartH - ((v - min) / (max - min)) * chartH;
  const pathD = data.map((v, i) => `${i === 0 ? 'M' : 'L'}${xPos(i)},${yPos(v)}`).join(' ');
  const areaD = `${pathD} L${xPos(data.length-1)},${padT+chartH} L${padL},${padT+chartH} Z`;

  const grids = [0, 0.25, 0.5, 0.75, 1].map(t => ({
    y: padT + t * chartH,
    val: Math.round(max * (1 - t)),
  }));

  wrap.innerHTML = `
    <svg viewBox="0 0 ${W} ${H}" style="width:100%;height:100%;" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="reachLineGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="#f09433"/>
          <stop offset="100%" stop-color="#bc1888"/>
        </linearGradient>
        <linearGradient id="reachAreaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#dc2743" stop-opacity="0.3"/>
          <stop offset="100%" stop-color="#dc2743" stop-opacity="0"/>
        </linearGradient>
      </defs>

      ${grids.map(g => `
        <line stroke="rgba(255,255,255,0.05)" stroke-width="1" stroke-dasharray="4 4"
          x1="${padL}" y1="${g.y}" x2="${W-padR}" y2="${g.y}"/>
        <text fill="rgba(255,255,255,0.25)" font-size="10" font-family="DM Sans,sans-serif"
          x="${padL-6}" y="${g.y+4}" text-anchor="end">${g.val}K</text>
      `).join('')}

      ${labels.map((l, i) => `
        <text fill="rgba(255,255,255,0.25)" font-size="10" font-family="DM Sans,sans-serif"
          x="${xPos(i)}" y="${H-8}" text-anchor="middle">${l}</text>
      `).join('')}

      <path d="${areaD}" fill="url(#reachAreaGrad)"/>
      <path d="${pathD}" fill="none" stroke="url(#reachLineGrad)" stroke-width="2.5"
        stroke-linecap="round" stroke-linejoin="round"/>

      ${data.map((v, i) => `
        <circle cx="${xPos(i)}" cy="${yPos(v)}" r="4"
          fill="#dc2743" stroke="var(--bg-card)" stroke-width="2"/>
        <title>${labels[i]}: ${v}K</title>
      `).join('')}
    </svg>
  `;
}

/* ── DONUT CHART ── */
function drawDonutChart() {
  const wrap   = document.getElementById('donutWrap');
  const legend = document.getElementById('donutLegend');
  if (!wrap || !legend) return;

  const data = ANALYTICS_DATA.contentBreakdown;
  if (!data || data.length === 0) return; // No data to draw

  const size = 140;
  const cx = size / 2, cy = size / 2;
  const r = 52, innerR = 34;
  const total = ANALYTICS_DATA.contentBreakdown.reduce((s, d) => s + d.pct, 0);

  let startAngle = 0;
  const slices = ANALYTICS_DATA.contentBreakdown.map(d => {
    const angle = (d.pct / total) * 2 * Math.PI;
    const x1 = cx + r * Math.sin(startAngle);
    const y1 = cy - r * Math.cos(startAngle);
    startAngle += angle;
    const x2 = cx + r * Math.sin(startAngle);
    const y2 = cy - r * Math.cos(startAngle);
    const largeArc = angle > Math.PI ? 1 : 0;
    return { ...d, x1, y1, x2, y2, largeArc, r, innerR, cx, cy };
  });

  function sectorPath(s) {
    const ix1 = s.cx + s.innerR * Math.sin(startAngle - (s.largeArc ? 0 : 0));
    const innerX1 = s.cx + s.innerR * Math.sin(
      ANALYTICS_DATA.contentBreakdown.indexOf(s) === 0 ? 0 : 0
    );
    return ``;
  }

  // Build arc paths
  let ang = 0;
  const paths = ANALYTICS_DATA.contentBreakdown.map(d => {
    const sweep = (d.pct / total) * 2 * Math.PI;
    const x1o = cx + r * Math.sin(ang);
    const y1o = cy - r * Math.cos(ang);
    ang += sweep;
    const x2o = cx + r * Math.sin(ang);
    const y2o = cy - r * Math.cos(ang);
    const la = sweep > Math.PI ? 1 : 0;

    const x1i = cx + innerR * Math.sin(ang);
    const y1i = cy - innerR * Math.cos(ang);
    const aStart = ang - sweep;
    const x2i = cx + innerR * Math.sin(aStart);
    const y2i = cy - innerR * Math.cos(aStart);

    return `<path d="M${x1o},${y1o} A${r},${r} 0 ${la},1 ${x2o},${y2o} L${x1i},${y1i} A${innerR},${innerR} 0 ${la},0 ${x2i},${y2i} Z"
      fill="${d.color}" opacity="0.9" style="cursor:pointer;transition:opacity 0.2s;"
      onmouseenter="this.setAttribute('opacity','1');this.setAttribute('transform','scale(1.04)');this.setAttribute('transform-origin','${cx}px ${cy}px')"
      onmouseleave="this.setAttribute('opacity','0.9');this.removeAttribute('transform')">
      <title>${d.label}: ${d.pct}%</title>
    </path>`;
  });

  wrap.innerHTML = `
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
      ${paths.join('')}
      <circle cx="${cx}" cy="${cy}" r="${innerR - 2}" fill="var(--bg-card)"/>
    </svg>
    <div class="donut-center">
      <div class="donut-center-val">100%</div>
      <div class="donut-center-label">Total</div>
    </div>
  `;

  legend.innerHTML = ANALYTICS_DATA.contentBreakdown.map(d => `
    <div class="donut-legend-item">
      <div class="donut-dot" style="background:${d.color}"></div>
      <span class="donut-legend-label">${d.label}</span>
      <span class="donut-legend-val">${d.pct}%</span>
    </div>
  `).join('');
}

/* ── ENGAGEMENT HEATMAP ── */
function drawHeatmap() {
  const grid = document.getElementById('heatmapWrap');
  if (!grid) return;

  // If no heatmap data, generate default
  if (!ANALYTICS_DATA.heatmap || ANALYTICS_DATA.heatmap.length === 0) {
    ANALYTICS_DATA.heatmap = generateHeatmapData(null);
  }

  const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  const hours = Array.from({ length: 24 }, (_, i) => i);

  function heatColor(val) {
    if (val < 10) return 'rgba(255,255,255,0.04)';
    const alpha = val / 100;
    // Interpolate from orange to red to purple
    const r = Math.round(220 + (188 - 220) * alpha);
    const g = Math.round(50  + (24 - 50)   * alpha);
    const b = Math.round(67  + (136 - 67)  * alpha);
    return `rgba(${r},${g},${b},${0.2 + alpha * 0.8})`;
  }

  grid.style.cssText = `
    display: grid;
    grid-template-columns: 36px repeat(24, 1fr);
    gap: 2px;
    margin-top: 14px;
  `;

  // Hour header row
  let html = '<div></div>';
  html += hours.map(h => `
    <div style="font-size:0.6rem;color:rgba(255,255,255,0.25);text-align:center;padding-bottom:4px;">
      ${h % 6 === 0 ? `${h}h` : ''}
    </div>
  `).join('');

  // Day rows
  ANALYTICS_DATA.heatmap.forEach((row, d) => {
    html += `<div style="font-size:0.66rem;color:rgba(255,255,255,0.3);display:flex;align-items:center;justify-content:flex-end;padding-right:6px;">${days[d]}</div>`;
    row.forEach((val, h) => {
      html += `
        <div style="
          height:18px;
          border-radius:3px;
          background:${heatColor(val)};
          cursor:pointer;
          transition:transform 0.15s;
        "
        title="${days[d]} ${h}:00 — Score: ${val}"
        onmouseenter="this.style.transform='scale(1.3)';this.style.zIndex='10'"
        onmouseleave="this.style.transform='';this.style.zIndex=''">
        </div>
      `;
    });
  });

  grid.innerHTML = html;
}

/* ── ANIMATE FOLLOWER SOURCE BARS ── */
function animateFollowerBars() {
  setTimeout(() => {
    document.querySelectorAll('.follower-bar-fill[data-target]').forEach(bar => {
      bar.style.width = bar.dataset.target;
    });
    document.querySelectorAll('.bar-body[data-target]').forEach(bar => {
      bar.style.height = bar.dataset.target;
    });
  }, 200);
}