/* ════════════════════════════════════════════
   app.js  –  Core App Controller
   ════════════════════════════════════════════ */

'use strict';

/* ── STATE ── */
const AppState = {
  currentPage: 'analytics',
};

function showToast(message, type = 'info') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(20px)';
  }, 2800);

  setTimeout(() => {
    toast.remove();
  }, 3200);
}

/* ── BOOT ── */
document.addEventListener('DOMContentLoaded', () => {
  // Load analytics page
  renderAnalytics();
});

function renderScheduler() {
  const el = document.getElementById('schedulerContent');
  if (!el || el.dataset.rendered) return;
  el.dataset.rendered = '1';
  const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  const posts = [
    { day: 1, time: '9:00 AM', type: 'Post', emoji: '🌅' },
    { day: 1, time: '6:00 PM', type: 'Story', emoji: '🎬' },
    { day: 3, time: '12:00 PM', type: 'Reel', emoji: '🎵' },
    { day: 4, time: '8:00 PM', type: 'Post', emoji: '🌙' },
    { day: 5, time: '10:00 AM', type: 'Carousel', emoji: '🎠' },
  ];
  el.innerHTML = `
    <div class="card">
      <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:12px;">
        ${days.map((d, i) => {
          const dayPosts = posts.filter(p => p.day === i);
          return `
            <div style="background:var(--bg-hover);border-radius:var(--radius-md);padding:12px;min-height:120px;">
              <div style="font-size:0.78rem;font-weight:700;color:var(--text-muted);text-transform:uppercase;margin-bottom:10px;">${d}</div>
              ${dayPosts.map(p => `
                <div style="background:var(--bg-card);border:1px solid var(--border);border-radius:8px;padding:7px 9px;margin-bottom:6px;font-size:0.76rem;">
                  <div style="font-weight:600;">${p.emoji} ${p.type}</div>
                  <div style="color:var(--text-muted);margin-top:2px;">${p.time}</div>
                </div>
              `).join('')}
            </div>
          `;
        }).join('')}
      </div>
    </div>`;
}

function renderComments() {
  const el = document.getElementById('commentsContent');
  if (!el || el.dataset.rendered) return;
  el.dataset.rendered = '1';
  const comments = [
    { user: 'sarah.d', avatar: 'https://i.pravatar.cc/36?img=5', text: 'This is absolutely stunning! 😍', time: '2m', post: 'Sunset series', unread: true },
    { user: 'marco.v', avatar: 'https://i.pravatar.cc/36?img=8', text: 'Can you share the settings?', time: '10m', post: 'Morning light', unread: true },
    { user: 'julia.k', avatar: 'https://i.pravatar.cc/36?img=14', text: 'Incredible composition, love it!', time: '1h', post: 'Urban shoot', unread: false },
    { user: 'alex.n', avatar: 'https://i.pravatar.cc/36?img=20', text: 'Is this edited in Lightroom?', time: '3h', post: 'Reel #42', unread: false },
  ];
  el.innerHTML = `
    <div class="card">
      ${comments.map(c => `
        <div style="display:flex;gap:14px;padding:14px 0;border-bottom:1px solid var(--border-light);${c.unread ? 'background:rgba(220,39,67,0.03);border-radius:var(--radius-md);padding:14px;' : ''}">
          <img src="${c.avatar}" style="width:40px;height:40px;border-radius:50%;flex-shrink:0;" />
          <div style="flex:1;">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;">
              <strong style="font-size:0.85rem;">@${c.user}</strong>
              ${c.unread ? '<span style="width:6px;height:6px;border-radius:50%;background:var(--accent-2);display:inline-block;"></span>' : ''}
              <span style="font-size:0.75rem;color:var(--text-muted);margin-left:auto;">${c.time} ago · ${c.post}</span>
            </div>
            <p style="font-size:0.86rem;color:var(--text-secondary);">${c.text}</p>
            <div style="display:flex;gap:12px;margin-top:8px;">
              <button onclick="showToast('Reply sent!','success')" style="font-size:0.78rem;color:var(--accent-2);font-weight:600;background:none;border:none;cursor:pointer;">Reply</button>
              <button onclick="showToast('Comment liked','info')" style="font-size:0.78rem;color:var(--text-muted);background:none;border:none;cursor:pointer;">Like</button>
              <button onclick="showToast('Comment deleted','error')" style="font-size:0.78rem;color:var(--text-muted);background:none;border:none;cursor:pointer;">Delete</button>
            </div>
          </div>
        </div>
      `).join('')}
    </div>`;
}

function renderSettings() {
  const el = document.getElementById('settingsContent');
  if (!el || el.dataset.rendered) return;
  el.dataset.rendered = '1';
  el.innerHTML = `
    <div style="display:grid;grid-template-columns:200px 1fr;gap:24px;max-width:800px;">
      <div class="card" style="padding:12px;">
        ${['Profile','Account','Privacy','Notifications','Linked Apps','Help'].map((item, i) => `
          <div class="nav-item ${i===0?'active':''}" style="border-radius:var(--radius-md);" onclick="this.parentNode.querySelectorAll('.nav-item').forEach(n=>n.classList.remove('active'));this.classList.add('active')">
            <span>${item}</span>
          </div>
        `).join('')}
      </div>
      <div class="card">
        <h3 style="font-family:var(--font-display);font-size:1.05rem;margin-bottom:20px;">Profile Settings</h3>
        ${[
          ['Display Name', 'Alex Creates', 'text'],
          ['Username', '@alex.creates', 'text'],
          ['Bio', 'Digital creator & photographer 📸', 'text'],
          ['Website', 'alexcreates.io', 'text'],
        ].map(([label, val, type]) => `
          <div style="margin-bottom:16px;">
            <label style="display:block;font-size:0.8rem;font-weight:600;color:var(--text-muted);margin-bottom:6px;">${label}</label>
            <input type="${type}" value="${val}" style="width:100%;background:var(--bg-hover);border:1px solid var(--border);border-radius:var(--radius-md);padding:10px 14px;color:var(--text-primary);font-size:0.88rem;font-family:var(--font-body);" />
          </div>
        `).join('')}
        <button class="btn-primary" onclick="showToast('Settings saved!','success')">Save Changes</button>
      </div>
    </div>`;
}
