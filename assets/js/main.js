const header = document.querySelector('[data-header]');
const menuButton = document.querySelector('[data-menu-button]');
const nav = document.querySelector('.nav');
const lightbox = document.querySelector('[data-lightbox]');
const lightboxImg = lightbox?.querySelector('img');
const closeLightbox = lightbox?.querySelector('.lightbox-close');
const yearEl = document.querySelector('[data-year]');

if (yearEl) yearEl.textContent = new Date().getFullYear();

const onScroll = () => header?.classList.toggle('is-scrolled', window.scrollY > 16);
onScroll();
window.addEventListener('scroll', onScroll, { passive: true });

menuButton?.addEventListener('click', () => {
  if (!nav) return;
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

const calendarRoot = document.querySelector('[data-calendar]');

if (calendarRoot) {
  const serviceButtons = Array.from(calendarRoot.querySelectorAll('[data-service]'));
  const calendarGrid = calendarRoot.querySelector('[data-calendar-grid]');
  const calendarTitle = calendarRoot.querySelector('[data-calendar-title]');
  const selectedDayEl = calendarRoot.querySelector('[data-selected-day]');
  const slotGrid = calendarRoot.querySelector('[data-slot-grid]');
  const bookingSummary = calendarRoot.querySelector('[data-booking-summary]');
  const bookingForm = calendarRoot.querySelector('[data-calendar-form]');
  const bookingSubmit = calendarRoot.querySelector('[data-booking-submit]');
  const bookingMessage = calendarRoot.querySelector('[data-booking-message]');
  const prevButton = calendarRoot.querySelector('[data-calendar-prev]');
  const nextButton = calendarRoot.querySelector('[data-calendar-next]');

  const services = {
    tint: { name: 'Тонировка авто', duration: '2-3 часа' },
    polish: { name: 'Полировка кузова и фар', duration: '4-6 часов' },
    ppf: { name: 'Бронеплёнка кузова / фар / экранов', duration: '3-8 часов' },
    clean: { name: 'Химчистка салона', duration: '5-7 часов' },
    promo: { name: 'Акция: хамелеон + второй слой', duration: '3 часа' }
  };
  const serviceOrder = Object.keys(services);
  const workSlots = ['10:00', '11:30', '13:00', '14:30', '16:00', '17:30', '19:00'];
  const monthFormatter = new Intl.DateTimeFormat('ru-RU', { month: 'long', year: 'numeric' });
  const dateFormatter = new Intl.DateTimeFormat('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' });
  const fullDateFormatter = new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let activeService = serviceButtons.find(button => button.classList.contains('is-active'))?.dataset.service || 'tint';
  let visibleMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  let selectedDate = null;
  let selectedSlot = '';

  const capitalize = value => value ? value.charAt(0).toUpperCase() + value.slice(1) : value;
  const isSameDate = (first, second) => first && second
    && first.getFullYear() === second.getFullYear()
    && first.getMonth() === second.getMonth()
    && first.getDate() === second.getDate();
  const isPastDate = date => date.getTime() < today.getTime();

  const getSlots = (date, serviceKey) => {
    const serviceIndex = serviceOrder.indexOf(serviceKey);
    const weekday = date.getDay();
    const fullyBookedDay = (date.getDate() + serviceIndex * 2 + date.getMonth()) % 13 === 0;

    return workSlots.map((time, index) => {
      const longServiceLateSlot = ['polish', 'ppf', 'clean'].includes(serviceKey) && index >= 5;
      const saturdayLateSlot = weekday === 6 && index >= 5;
      const closedDay = weekday === 0;
      const hash = date.getDate() * 11 + (date.getMonth() + 1) * 7 + index * 5 + serviceIndex * 17;
      const bookedBySchedule = hash % 6 === 0 || hash % 10 === 0;
      const busy = isPastDate(date) || closedDay || fullyBookedDay || longServiceLateSlot || saturdayLateSlot || bookedBySchedule;

      return {
        time,
        busy,
        reason: isPastDate(date) ? 'прошло' : closedDay ? 'выходной' : busy ? 'занято' : 'свободно'
      };
    });
  };

  const getDaySummary = (date) => {
    if (isPastDate(date)) return { state: 'muted', label: 'Прошло', count: 'недоступно', free: 0 };

    const slots = getSlots(date, activeService);
    const free = slots.filter(slot => !slot.busy).length;

    if (free > 0) {
      return { state: 'available', label: 'Свободно', count: `${free} окон`, free };
    }

    return { state: 'busy', label: date.getDay() === 0 ? 'Выходной' : 'Занято', count: 'нет окон', free: 0 };
  };

  const findFirstAvailableDate = () => {
    for (let offset = 0; offset < 90; offset += 1) {
      const date = new Date(today);
      date.setDate(today.getDate() + offset);
      if (getDaySummary(date).free > 0) return date;
    }

    return new Date(today);
  };

  const renderCalendar = () => {
    if (!calendarGrid || !calendarTitle) return;

    calendarTitle.textContent = capitalize(monthFormatter.format(visibleMonth));
    calendarGrid.innerHTML = '';

    const year = visibleMonth.getFullYear();
    const month = visibleMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const firstWeekday = (firstDay.getDay() + 6) % 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    for (let index = 0; index < firstWeekday; index += 1) {
      const emptyCell = document.createElement('div');
      emptyCell.className = 'calendar-empty';
      calendarGrid.appendChild(emptyCell);
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
      const date = new Date(year, month, day);
      const summary = getDaySummary(date);
      const button = document.createElement('button');

      button.type = 'button';
      button.className = `calendar-day is-${summary.state}`;
      if (isSameDate(date, selectedDate)) button.classList.add('is-selected');
      if (summary.state === 'muted') button.disabled = true;
      button.setAttribute('aria-label', `${fullDateFormatter.format(date)}: ${summary.label}, ${summary.count}`);
      button.innerHTML = `
        <span class="day-number">${day}</span>
        <span class="day-status"><span>${summary.label}</span></span>
        <span class="day-count">${summary.count}</span>
      `;

      button.addEventListener('click', () => {
        if (summary.state === 'muted') return;
        selectedDate = date;
        selectedSlot = '';
        renderCalendar();
        renderSlots();
        updateBookingSummary();
      });

      calendarGrid.appendChild(button);
    }
  };

  const renderSlots = () => {
    if (!slotGrid || !selectedDayEl) return;

    if (!selectedDate) {
      selectedDayEl.textContent = 'Выберите дату в календаре';
      slotGrid.innerHTML = '';
      return;
    }

    selectedDayEl.textContent = `${capitalize(dateFormatter.format(selectedDate))} — ${services[activeService].name}`;
    slotGrid.innerHTML = '';

    getSlots(selectedDate, activeService).forEach(slot => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = `time-slot ${slot.busy ? 'is-busy' : 'is-free'}`;
      if (selectedSlot === slot.time) button.classList.add('is-selected');
      button.disabled = slot.busy;
      button.setAttribute('aria-label', `${slot.time}: ${slot.reason}`);
      button.innerHTML = `<span>${slot.time}</span><small>${slot.reason}</small>`;

      button.addEventListener('click', () => {
        selectedSlot = slot.time;
        renderSlots();
        updateBookingSummary();
      });

      slotGrid.appendChild(button);
    });
  };

  const updateBookingSummary = () => {
    if (!bookingSummary || !bookingSubmit || !bookingMessage) return;

    if (!selectedDate) {
      bookingSummary.innerHTML = '<span>Выбранный слот</span><strong>Пока не выбран</strong><p>Сначала выберите дату в календаре.</p>';
      bookingSubmit.disabled = true;
      bookingSubmit.textContent = 'Выберите свободное время';
      return;
    }

    if (!selectedSlot) {
      bookingSummary.innerHTML = `<span>Выбранный слот</span><strong>${services[activeService].name}</strong><p>${capitalize(dateFormatter.format(selectedDate))}: выберите зелёное время.</p>`;
      bookingSubmit.disabled = true;
      bookingSubmit.textContent = 'Выберите свободное время';
      return;
    }

    bookingSummary.innerHTML = `<span>Выбранный слот</span><strong>${selectedSlot}, ${capitalize(dateFormatter.format(selectedDate))}</strong><p>${services[activeService].name}, ориентировочно ${services[activeService].duration}.</p>`;
    bookingSubmit.disabled = false;
    bookingSubmit.textContent = 'Отправить заявку';
    bookingMessage.textContent = 'После отправки администратор подтвердит время и подготовит запись.';
  };

  serviceButtons.forEach(button => {
    button.addEventListener('click', () => {
      activeService = button.dataset.service || activeService;
      selectedSlot = '';
      serviceButtons.forEach(item => {
        const isActive = item === button;
        item.classList.toggle('is-active', isActive);
        item.setAttribute('aria-pressed', String(isActive));
      });
      renderCalendar();
      renderSlots();
      updateBookingSummary();
    });
  });

  prevButton?.addEventListener('click', () => {
    visibleMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() - 1, 1);
    renderCalendar();
  });

  nextButton?.addEventListener('click', () => {
    visibleMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 1);
    renderCalendar();
  });

  bookingForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!selectedDate || !selectedSlot || !bookingSubmit || !bookingMessage) return;

    bookingSubmit.disabled = true;
    bookingSubmit.textContent = 'Заявка подготовлена';
    bookingMessage.textContent = `Заявка на ${services[activeService].name}: ${selectedSlot}, ${capitalize(dateFormatter.format(selectedDate))}. Мы свяжемся для подтверждения.`;
    setTimeout(() => {
      bookingSubmit.disabled = false;
      bookingSubmit.textContent = 'Отправить заявку';
      bookingForm.reset();
    }, 2600);
  });

  selectedDate = findFirstAvailableDate();
  visibleMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
  renderCalendar();
  renderSlots();
  updateBookingSummary();
}
