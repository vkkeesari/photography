const categoryButtons = Array.from(document.querySelectorAll('.category-trigger'));
const galleryPanels = Array.from(document.querySelectorAll('.gallery-panel'));
const sliderHandle = document.getElementById('slider-handle');
const sliderTrack = document.getElementById('slider-track');
const heroBackground = document.getElementById('hero-background');
const transitionOverlay = document.querySelector('.transition-overlay');
const lightbox = document.getElementById('lightbox');
const lightboxImage = document.getElementById('lightbox-image');
const lightboxClose = document.querySelector('.lightbox-close');
const lightboxPrev = document.querySelector('.lightbox-prev');
const lightboxNext = document.querySelector('.lightbox-next');

let activeCategory = 'cars';
let lightboxItems = [];
let currentLightboxIndex = 0;

function updateHandlePosition(category) {
  const button = document.querySelector(`.category-trigger[data-category="${category}"]`);
  if (!button || !sliderTrack) return;

  const trackRect = sliderTrack.getBoundingClientRect();
  const buttonRect = button.getBoundingClientRect();
  const left = buttonRect.left - trackRect.left + buttonRect.width / 2;
  sliderHandle.style.left = `${Math.max(18, Math.min(trackRect.width - 18, left))}px`;
}

function updateHeroBackground(category) {
  const backgroundMap = {
    cars: 'Car16.jpg',
    scenery: 'Scenery1.jpg',
    portraits: 'Event1.jpg',
  };

  if (heroBackground) {
    heroBackground.style.backgroundImage = `url('${backgroundMap[category] || 'Scenery1.jpg'}')`;
  }
}

function setActiveCategory(category, { animate = true, scroll = true } = {}) {
  activeCategory = category;

  categoryButtons.forEach((button) => {
    button.classList.toggle('is-active', button.dataset.category === category);
  });

  galleryPanels.forEach((panel) => {
    panel.classList.toggle('is-active', panel.dataset.panel === category || (category === 'portraits' && panel.dataset.panel === 'portraits'));
  });

  updateHandlePosition(category);
  updateHeroBackground(category);

  if (animate) {
    transitionOverlay.classList.add('is-active');
    globalThis.setTimeout(() => {
      transitionOverlay.classList.remove('is-active');
      if (scroll) {
        document.getElementById('work').scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 650);
  }

  lightboxItems = Array.from(document.querySelectorAll(`[data-lightbox="${category === 'portraits' ? 'portraits' : category}"]`));
}

categoryButtons.forEach((button) => {
  button.addEventListener('click', () => {
    setActiveCategory(button.dataset.category);
  });
});

function handleTrackInteraction(clientX) {
  const rect = sliderTrack.getBoundingClientRect();
  const clamped = Math.min(Math.max(clientX - rect.left, 0), rect.width);
  const ratio = clamped / rect.width;

  let nextCategory = 'cars';
  if (ratio > 0.66) {
    nextCategory = 'portraits';
  } else if (ratio > 0.33) {
    nextCategory = 'scenery';
  }

  setActiveCategory(nextCategory, { animate: false, scroll: false });
}

sliderHandle.addEventListener('pointerdown', (event) => {
  event.preventDefault();
  sliderHandle.setPointerCapture(event.pointerId);
  handleTrackInteraction(event.clientX);
});

sliderHandle.addEventListener('pointermove', (event) => {
  if (event.buttons === 1) {
    handleTrackInteraction(event.clientX);
  }
});

sliderTrack.addEventListener('pointerdown', (event) => {
  if (event.target === sliderTrack || event.target === sliderHandle) {
    handleTrackInteraction(event.clientX);
  }
});

function openLightbox(group, index) {
  const items = Array.from(document.querySelectorAll(`[data-lightbox="${group}"]`));
  if (!items.length) return;

  currentLightboxIndex = index;
  const currentItem = items[index];
  const image = currentItem.querySelector('img');
  lightboxImage.src = image.src;
  lightboxImage.alt = image.alt;
  lightbox.classList.add('is-open');
  document.body.classList.add('lightbox-open');
  lightbox.setAttribute('aria-hidden', 'false');
}

function closeLightbox() {
  lightbox.classList.remove('is-open');
  document.body.classList.remove('lightbox-open');
  lightbox.setAttribute('aria-hidden', 'true');
}

function showLightboxRelative(step) {
  if (!lightboxItems.length) return;
  currentLightboxIndex = (currentLightboxIndex + step + lightboxItems.length) % lightboxItems.length;
  const item = lightboxItems[currentLightboxIndex];
  const image = item.querySelector('img');
  lightboxImage.src = image.src;
  lightboxImage.alt = image.alt;
}

document.querySelectorAll('.gallery-card').forEach((card) => {
  card.addEventListener('click', (event) => {
    event.preventDefault();
    const group = card.dataset.lightbox;
    const index = Number(card.dataset.index);
    openLightbox(group, index);
  });
});

lightboxClose.addEventListener('click', closeLightbox);
lightbox.addEventListener('click', (event) => {
  if (event.target === lightbox) {
    closeLightbox();
  }
});

lightboxPrev.addEventListener('click', () => showLightboxRelative(-1));
lightboxNext.addEventListener('click', () => showLightboxRelative(1));

document.addEventListener('keydown', (event) => {
  if (!lightbox.classList.contains('is-open')) return;
  if (event.key === 'Escape') {
    closeLightbox();
  } else if (event.key === 'ArrowRight') {
    showLightboxRelative(1);
  } else if (event.key === 'ArrowLeft') {
    showLightboxRelative(-1);
  }
});

window.addEventListener('resize', () => updateHandlePosition(activeCategory));
window.addEventListener('orientationchange', () => updateHandlePosition(activeCategory));
window.addEventListener('load', () => {
  setActiveCategory('cars', { animate: false, scroll: false });
});
