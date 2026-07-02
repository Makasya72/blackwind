const header = document.querySelector('[data-header]');
const menuButton = document.querySelector('[data-menu-button]');
const nav = document.querySelector('.nav');
const lightbox = document.querySelector('[data-lightbox]');
const lightboxImg = lightbox?.querySelector('img');
const closeLightbox = lightbox?.querySelector('.lightbox-close');

document.querySelector('[data-year]').textContent = new Date().getFullYear();

const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 16);
onScroll();
window.addEventListener('scroll', onScroll, { passive: true });

menuButton?.addEventListener('click', () => {
  const open = nav.classList.toggle('is-open');
  document.body.classList.toggle('menu-open', open);
  menuButton.setAttribute('aria-expanded', String(open));
});

nav?.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
  nav.classList.remove('is-open');
  document.body.classList.remove('menu-open');
  menuButton?.setAttribute('aria-expanded', 'false');
}));

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.14 });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

document.querySelectorAll('[data-gallery] .gallery-item').forEach(btn => {
  btn.addEventListener('click', () => {
    const src = btn.getAttribute('data-full');
    if (!src || !lightbox || !lightboxImg) return;
    lightboxImg.src = src;
    lightbox.classList.add('is-open');
    lightbox.setAttribute('aria-hidden', 'false');
  });
});

const closeGallery = () => {
  if (!lightbox || !lightboxImg) return;
  lightbox.classList.remove('is-open');
  lightbox.setAttribute('aria-hidden', 'true');
  setTimeout(() => { lightboxImg.src = ''; }, 200);
};
closeLightbox?.addEventListener('click', closeGallery);
lightbox?.addEventListener('click', (event) => {
  if (event.target === lightbox) closeGallery();
});
window.addEventListener('keydown', event => {
  if (event.key === 'Escape') closeGallery();
});

document.querySelectorAll('[data-compare]').forEach(compare => {
  const input = compare.querySelector('input');
  if (!input) return;
  const update = () => compare.style.setProperty('--pos', `${input.value}%`);
  input.addEventListener('input', update);
  update();
});

const glow = document.querySelector('.cursor-glow');
window.addEventListener('pointermove', (event) => {
  if (!glow) return;
  glow.style.setProperty('--x', `${event.clientX}px`);
  glow.style.setProperty('--y', `${event.clientY}px`);
}, { passive: true });

document.querySelector('[data-form]')?.addEventListener('submit', (event) => {
  event.preventDefault();
  const button = event.currentTarget.querySelector('button');
  const oldText = button.textContent;
  button.textContent = 'Заявка подготовлена';
  button.disabled = true;
  setTimeout(() => {
    button.textContent = oldText;
    button.disabled = false;
    event.currentTarget.reset();
  }, 2200);
});
