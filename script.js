/* ════════════════════════════════════════════════
   script.js — Eduardo's Birthday Page
   ════════════════════════════════════════════════ */

/* ──────────────────────────────────────────────
   1. LANGUAGE SYSTEM
   All text is stored in data-en / data-es
   attributes on each element in the HTML.
   setLang() reads those and swaps the content.
────────────────────────────────────────────── */
let currentLang = 'en';

function setLang(lang) {
  currentLang = lang;

  // Update all translatable elements
  document.querySelectorAll('[data-en]').forEach(el => {
    const text = el.getAttribute('data-' + lang);
    if (!text) return;

    // Some elements use innerHTML (they contain <strong>, <br> tags)
    if (el.classList.contains('message-text')) {
      el.innerHTML = text;
    } else {
      el.textContent = text;
    }
  });

  // Update active button style
  document.getElementById('btn-en').classList.toggle('active', lang === 'en');
  document.getElementById('btn-es').classList.toggle('active', lang === 'es');

  // Update the html lang attribute
  document.documentElement.lang = lang === 'es' ? 'es' : 'en';

  // Re-run countdown label update so the banner also translates
  updateCountdown();
}


/* ──────────────────────────────────────────────
   2. STARS CANVAS
   Draws softly twinkling stars in the background.
────────────────────────────────────────────── */
(function initStars() {
  const canvas = document.getElementById('stars-canvas');
  const ctx = canvas.getContext('2d');
  let stars = [];

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function buildStars() {
    stars = [];
    const count = Math.floor((canvas.width * canvas.height) / 5000);
    for (let i = 0; i < count; i++) {
      stars.push({
        x:     Math.random() * canvas.width,
        y:     Math.random() * canvas.height,
        r:     Math.random() * 1.5 + 0.3,
        alpha: Math.random(),
        speed: Math.random() * 0.004 + 0.001
      });
    }
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    stars.forEach(s => {
      s.alpha += s.speed;
      if (s.alpha > 1 || s.alpha < 0) s.speed *= -1;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(130,177,255,${s.alpha.toFixed(2)})`;
      ctx.fill();
    });
    requestAnimationFrame(draw);
  }

  resize();
  buildStars();
  draw();
  window.addEventListener('resize', () => { resize(); buildStars(); });
})();


/* ──────────────────────────────────────────────
   3. FLOATING PARTICLES
   Gentle blue/gold bubbles drifting upward.
────────────────────────────────────────────── */
(function initParticles() {
  const container = document.getElementById('particles');
  const colors = ['#2979ff', '#448aff', '#82b1ff', '#bbdefb', '#f5c842'];

  for (let i = 0; i < 25; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    const size = Math.random() * 6 + 2;
    Object.assign(p.style, {
      width:             size + 'px',
      height:            size + 'px',
      left:              Math.random() * 100 + 'vw',
      background:        colors[Math.floor(Math.random() * colors.length)],
      animationDuration: (Math.random() * 12 + 8) + 's',
      animationDelay:    (Math.random() * 10) + 's'
    });
    container.appendChild(p);
  }
})();


/* ──────────────────────────────────────────────
   4. SCROLL REVEAL
   Elements with class .reveal animate in when
   they enter the viewport.
────────────────────────────────────────────── */
(function initReveal() {
  const elements = document.querySelectorAll('.reveal');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  elements.forEach(el => observer.observe(el));
})();


/* ──────────────────────────────────────────────
   5. VIDEO PLAYER
────────────────────────────────────────────── */

const video = document.getElementById('birthdayVideo');
const overlay = document.getElementById('videoOverlay');
const placeholder = document.getElementById('videoPlaceholder');
const playBtn = document.getElementById('playBtn');


/* PLAY VIDEO */
function playVideo() {

  video.controls = true;

  video.play()
    .then(() => {

      overlay.classList.add('hidden');

    })
    .catch(err => {

      console.log('Playback blocked:', err);

    });
}


/* CLICK EVENTS */
overlay.addEventListener('click', playVideo);

playBtn.addEventListener('click', (e) => {

  e.stopPropagation();

  playVideo();

});


/* VIDEO LOADED */
video.addEventListener('loadeddata', () => {

  placeholder.classList.add('hidden');

});


/* VIDEO ERROR */
video.addEventListener('error', () => {

  placeholder.classList.remove('hidden');

  overlay.classList.add('hidden');

});


/* SHOW OVERLAY WHEN PAUSED */
video.addEventListener('pause', () => {

  if (!video.ended && video.currentTime > 0) {

    overlay.classList.remove('hidden');

  }

});


/* HIDE OVERLAY WHILE PLAYING */
video.addEventListener('play', () => {

  overlay.classList.add('hidden');

});

/* ──────────────────────────────────────────────
   6. COUNTDOWN TIMER
   Counts down to May 26th of the current year
   (or next year if that date has already passed).
   On the actual birthday, shows a celebration banner
   and fires confetti.
────────────────────────────────────────────── */
function updateCountdown() {
  const now  = new Date();
  const isToday = now.getMonth() === 4 && now.getDate() === 26;

  if (isToday) {
    // It's his birthday! Show celebration banner
    document.getElementById('countdownGrid').style.display = 'none';
    const banner = document.getElementById('birthdayBanner');
    banner.style.display = 'flex';
    // Re-translate the banner text
    const bannerText = banner.querySelector('p');
    bannerText.textContent = bannerText.getAttribute('data-' + currentLang);
    launchConfetti();
    return;
  }

  // Figure out the next May 26
  const year = (now.getMonth() > 4 || (now.getMonth() === 4 && now.getDate() > 26))
    ? now.getFullYear() + 1
    : now.getFullYear();

  const birthday = new Date(year, 4, 26, 0, 0, 0); // Month 4 = May (0-indexed)
  const diff     = birthday - now;

  const days  = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const mins  = Math.floor((diff % 3600000)  / 60000);
  const secs  = Math.floor((diff % 60000)    / 1000);

  document.getElementById('cd-days').textContent  = String(days).padStart(2, '0');
  document.getElementById('cd-hours').textContent = String(hours).padStart(2, '0');
  document.getElementById('cd-mins').textContent  = String(mins).padStart(2, '0');
  document.getElementById('cd-secs').textContent  = String(secs).padStart(2, '0');
}

// Run immediately, then update every second
updateCountdown();
setInterval(updateCountdown, 1000);


/* ──────────────────────────────────────────────
   7. CONFETTI
   Fires 120 coloured pieces from the top of
   the screen. Only runs on May 26th.
────────────────────────────────────────────── */
function launchConfetti() {
  const colors = ['#2979ff', '#448aff', '#82b1ff', '#f5c842', '#ffffff', '#bbdefb'];

  for (let i = 0; i < 120; i++) {
    setTimeout(() => {
      const piece = document.createElement('div');
      piece.className = 'confetti-piece';
      const size = Math.random() * 10 + 6;

      Object.assign(piece.style, {
        left:              Math.random() * 100 + 'vw',
        width:             size + 'px',
        height:            size + 'px',
        background:        colors[Math.floor(Math.random() * colors.length)],
        borderRadius:      Math.random() > 0.5 ? '50%' : '2px',
        animationDuration: (Math.random() * 3 + 2) + 's',
        animationDelay:    '0s'
      });

      document.body.appendChild(piece);
      // Clean up after animation finishes
      setTimeout(() => piece.remove(), 5500);
    }, i * 50);
  }
}