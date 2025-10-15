// app.js - frontend logic for tracking + auth + create shipments
const API = (function(){
  // put your backend URL here or use relative path when served from same host
  const BASE = window.API_BASE || ''; // empty => same origin
  async function post(path, data, token){
    const res = await fetch(BASE + '/api' + path, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: 'Bearer ' + token } : {})
      },
      body: JSON.stringify(data)
    });
    return res.json();
  }
  async function get(path, token){
    const res = await fetch(BASE + '/api' + path, {
      headers: { ...(token ? { Authorization: 'Bearer ' + token } : {}) }
    });
    if (!res.ok) throw new Error('Fetch error');
    return res.json();
  }
  return { post, get };
})();

/* Helper to clear tracking input (you said do not display the number in the search after) */
function clearTrackingInput(inputEl){
  if(!inputEl) return;
  inputEl.value = '';
  inputEl.placeholder = 'Search sent — results shown below';
}

/* Track function used by both pages */
async function trackShipmentUI(trackingId, targetEl){
  targetEl.innerText = 'Looking up...';
  try {
    const res = await fetch(`/api/shipments/track/${encodeURIComponent(trackingId)}`);
    if (!res.ok) {
      targetEl.innerText = 'Shipment not found';
      return;
    }
    const data = await res.json();
    // render a card (no auto-populate the search bar)
    targetEl.innerHTML = `
      <strong>Tracking: ${data.tracking}</strong>
      <div>Status: <b>${data.status}</b></div>
      <div>Sender: ${data.sender?.name || '—'} (${data.sender?.phone||'—'})</div>
      <div>Receiver: ${data.receiver?.name||'—'} (${data.receiver?.phone||'—'})</div>
      <div>Location: ${data.location?.name || '—'}</div>
      <div>ETA: ${data.eta || '—'}</div>
      <div class="small">Updated: ${data.updatedAt ? new Date(data.updatedAt).toLocaleString() : '—'}</div>
    `;
    // populate media section if track page
    const media = document.getElementById('media');
    if (media) {
      media.innerHTML = '';
      (data.package?.photos || []).forEach(url => {
        const img = document.createElement('img'); img.src = url; img.style.width='120px'; img.style.margin='6px';
        media.appendChild(img);
      });
    }
  } catch (err) {
    targetEl.innerText = 'Error — try again';
    console.error(err);
  }
}

/* Bind UI on DOM load */
document.addEventListener('DOMContentLoaded', () => {
  const homeTrackBtn = document.getElementById('btnTrack');
  const homeInput = document.getElementById('trackingInput');
  const homeResult = document.getElementById('trackResult');

  if (homeTrackBtn) {
    homeTrackBtn.addEventListener('click', () => {
      const t = (homeInput && homeInput.value.trim());
      if (!t) { homeResult.innerText = 'Enter a tracking number'; return; }
      trackShipmentUI(t, homeResult);
      clearTrackingInput(homeInput); // important: clear input so it doesn't show
    });
  }

  const goTrack = document.getElementById('goTrack');
  if (goTrack) {
    const input = document.getElementById('trackingField');
    const card = document.getElementById('trackingCard');
    goTrack.addEventListener('click', ()=>{
      const t = input.value.trim();
      if (!t) { card.style.display='block'; card.innerText='Enter tracking'; return; }
      trackShipmentUI(t, card);
      clearTrackingInput(input);
      card.style.display='block';
    });
  }

  // login
  const btnLogin = document.getElementById('btnLogin');
  if (btnLogin) {
    btnLogin.addEventListener('click', async ()=>{
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      const msg = document.getElementById('loginMsg');
      try {
        const res = await API.post('/auth/login', { email, password });
        if (res.token) {
          localStorage.setItem('shipex_token', res.token);
          localStorage.setItem('shipex_user', JSON.stringify(res.user));
          msg.innerText = 'Logged in — redirecting...';
          setTimeout(()=> location.href = '/dashboard.html', 800);
        } else { msg.innerText = res.message || 'Login failed'; }
      } catch (err) { msg.innerText = 'Error'; console.error(err); }
    });
  }

  // signup (if page exists)
  const btnSignup = document.getElementById('btnSignup');
  if (btnSignup) {
    btnSignup.addEventListener('click', async ()=>{
      const name = document.getElementById('su_name').value;
      const email = document.getElementById('su_email').value;
      const password = document.getElementById('su_password').value;
      const res = await API.post('/auth/register', { name, email, password });
      if (res.token) {
        localStorage.setItem('shipex_token', res.token);
        localStorage.setItem('shipex_user', JSON.stringify(res.user));
        location.href = '/dashboard.html';
      } else {
        alert(res.message || 'Signup failed');
      }
    });
  }

  // other bindings: create demo shipment, create form etc. You can extend per page
});
