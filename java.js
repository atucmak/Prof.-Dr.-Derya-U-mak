// Header: mobil menü
const hamburger = document.getElementById('hamburger');
const menu = document.getElementById('menu');
if (hamburger && menu) {
  hamburger.addEventListener('click', () => {
    const open = menu.style.display === 'flex';
    menu.style.display = open ? 'none' : 'flex';
    hamburger.setAttribute('aria-expanded', String(!open));
  });
}

// Yıl
const yilEl = document.getElementById('yil');
if (yilEl) yilEl.textContent = new Date().getFullYear();

// Yukarı çık butonu
const toTop = document.getElementById('toTop');
window.addEventListener('scroll', () => {
  if (window.scrollY > 400) toTop.classList.add('show');
  else toTop.classList.remove('show');
});
if (toTop) toTop.addEventListener('click', () => window.scrollTo({top: 0, behavior: 'smooth'}));

// Slider basit
const slider = document.querySelector('.slider');
if (slider) {
  const track = slider.querySelector('.slides');
  const slides = Array.from(slider.querySelectorAll('.t-card'));
  const prev = slider.querySelector('.prev');
  const next = slider.querySelector('.next');
  const dotsWrap = slider.querySelector('.dots');
  let index = 0;

  function goto(i){
    index = (i + slides.length) % slides.length;
    track.scrollTo({left: slider.clientWidth * index, behavior: 'smooth'});
    updateDots();
  }
  function updateDots(){
    dotsWrap.querySelectorAll('button').forEach((d,di)=>{
      d.classList.toggle('active', di===index);
    });
  }
  // dots
  slides.forEach((_,i)=>{
    const b = document.createElement('button');
    b.addEventListener('click', ()=>goto(i));
    dotsWrap.appendChild(b);
  });
  updateDots();

  prev.addEventListener('click', ()=>goto(index-1));
  next.addEventListener('click', ()=>goto(index+1));

  // autoplay
  const delay = Number(slider.dataset.autoplay || 0);
  if (delay > 0){ setInterval(()=>goto(index+1), delay); }
}

// Form doğrulama + submit
const form = document.getElementById('appointmentForm');
if (form){
  const err = document.getElementById('formError');
  const ok = document.getElementById('formSuccess');
  form.addEventListener('submit', async (e)=>{
    e.preventDefault();
    err.hidden = true; ok.hidden = true;

    const reqIds = ['name','phone','service','kvkk'];
    let valid = true;
    reqIds.forEach(id=>{
      const el = document.getElementById(id);
      if (id==='kvkk') { if(!el.checked) valid=false; }
      else if (!el.value.trim()) { valid=false; el.setAttribute('aria-invalid','true'); }
      else { el.removeAttribute('aria-invalid'); }
    });
    const phone = document.getElementById('phone').value.replace(/\s/g,'');
    if(!/^0?5\d{9}$/.test(phone)) valid=false;

    if(!valid){ err.hidden=false; return; }

    try{
      const res = await fetch(form.action, { method:'POST', body: new FormData(form) });
      if(!res.ok) throw new Error('Gönderim hatası');
      form.reset();
      ok.hidden = false;
    }catch(_){ err.hidden=false; }
  });
}

(function () {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function animateCount(el) {
    const target = parseFloat(el.dataset.target || '0');
    const start  = parseFloat(el.dataset.start  || '0');
    const suffix = el.dataset.suffix || '';
    const prefix = el.dataset.prefix || '';
    const decimals = parseInt(el.dataset.decimals || (String(target).includes('.') ? 1 : 0), 10);
    const duration = prefersReduced ? 0 : parseInt(el.dataset.duration || '1200', 10);

    if (duration === 0) {
      el.textContent = prefix + target.toLocaleString('tr-TR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) + suffix;
      return;
    }

    const t0 = performance.now();
    const easeOutCubic = (x) => 1 - Math.pow(1 - x, 3);

    function frame(t) {
      const progress = Math.min((t - t0) / duration, 1);
      const eased = easeOutCubic(progress);
      const val = start + (target - start) * eased;

      el.textContent =
        prefix +
        Number(val).toLocaleString('tr-TR', {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals
        }) +
        suffix;

      if (progress < 1) requestAnimationFrame(frame);
    }

    requestAnimationFrame(frame);
  }

  // Yalnızca ekrana girince tetikle
  const io = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animateCount(entry.target);
        obs.unobserve(entry.target); // bir kere çalışsın
      }
    });
  }, { threshold: 0.4 });

  document.querySelectorAll('.counter').forEach((el) => io.observe(el));
})();

(function () {
  const header = document.querySelector('.site-header');
  const menu   = document.getElementById('menu');
  const burger = document.getElementById('hamburger');

  function headerH() {
    return header ? header.getBoundingClientRect().height : 0;
  }

  function smoothTo(target) {
    const el = document.querySelector(target);
    if (!el) return;

    const top = el.getBoundingClientRect().top + window.scrollY - headerH() - 8; // 8px tampon
    window.scrollTo({ top, behavior: 'smooth' });

    // mobil menüyü kapat
    if (menu && getComputedStyle(menu).position === 'absolute') {
      menu.style.display = 'none';
      if (burger) burger.setAttribute('aria-expanded', 'false');
    }
  }

  // Sadece sayfa içi (#) linkleri yakala
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;

    const hash = a.getAttribute('href');
    if (!hash || hash === '#') return;

    // sayfa içi hedefe kaydır
    if (document.querySelector(hash)) {
      e.preventDefault();
      history.pushState(null, '', hash); // URL’de hash kalsın
      smoothTo(hash);
    }
  });
})();