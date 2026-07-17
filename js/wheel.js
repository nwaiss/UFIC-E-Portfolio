/* ==========================================================================
   WHEEL.JS — Photo Wheel Component for pictures.html

   INTERACTION MODEL:
     • Click + drag on the wheel area to spin it (like a physical wheel).
       The ring follows the mouse angle relative to its center.
     • Release the mouse/touch to snap to the nearest photo and load it.
       (Photo does NOT load during drag — only on release.)
     • Click directly on an icon (without dragging) to jump to it.
     • Prev / Next buttons step one item at a time.
     • Mouse-scroll over the wheel area steps one item at a time.
     • Arrow keys navigate (left/up = prev, right/down = next).

   ROTATION MATH:
     Icon i sits at baseAngle = i × step on the ring.
     When the ring is at totalRotation degrees, icon i is at screen angle
       (totalRotation + baseAngle). The photo at index k is "selected"
       (at angle 0 = rightmost) when totalRotation = -k × step.
     Each icon is counter-rotated by -(totalRotation + baseAngle) to stay
     visually upright at all times.

   SIZING (must match WHEEL_CONFIG values and pictures.css dimensions):
     RADIUS   208 px — icon center distance from ring center
     ICON_SIZE 68 px — icon element size
   ========================================================================== */

'use strict';


/* --------------------------------------------------------------------------
   PHOTO DATA
   All 17 photos from the Photos/ directory, with descriptions.
   Replace descriptions and icon emojis as needed.
   -------------------------------------------------------------------------- */
/* Photos already featured on other pages are excluded from the wheel:
   Lionhead Aura (home), Garden (home), Princess Vlei Site (lessons),
   Final Presentation (lessons), Roommate (reflections), Gold Bongo (reflections). */
const PHOTO_ITEMS = [
  {
    icon: '🏔️',
    title: 'Table Mountain',
    description: 'The iconic flat-topped massif that watches over Cape Town. One of the most recognizable natural landmarks on earth — and even more striking in person.',
    photo: 'Photos/Table Mountain.jpeg'
  },
  {
    icon: '⛰️',
    title: "Lion's Head Peak",
    description: "Standing at the summit of Lion's Head after the chain-and-ladder hike. At 669 meters, the view takes in Table Mountain, the Twelve Apostles, and the whole of Cape Town spread out below.",
    photo: 'Photos/Lionhead Peak.jpeg'
  },
  {
    icon: '🧗',
    title: "Lion's Head Ascent",
    description: "The lower slopes of Lion's Head on the approach to the summit, winding through Cape fynbos before the technical sections begin.",
    photo: 'Photos/Lionhead Base.jpeg'
  },
  {
    icon: '🍳',
    title: 'Cooking Class',
    description: "A hands-on cooking class exploring Cape Town's Cape Malay culinary tradition — one of the most distinctive food cultures in the world.",
    photo: 'Photos/Cooking Experience.jpeg'
  },
  {
    icon: '🦒',
    title: 'Safari',
    description: 'A wildlife encounter in the South African bush. Seeing these animals in their natural habitat is one of those experiences that permanently shifts your sense of scale.',
    photo: 'Photos/Safari.jpeg'
  },
  {
    icon: '🚢',
    title: 'Seal Island',
    description: 'A boat excursion from Hout Bay to Seal Island, home to thousands of Cape fur seals and dramatic scenery along the way.',
    photo: 'Photos/Seal Isalnd Boat.jpeg'
  },
  {
    icon: '🎿',
    title: 'Ziplining',
    description: 'An adventure day combining ziplining through the South African landscape with a traditional African massage.',
    photo: 'Photos/Ziplinning African Massage.jpeg'
  },
  {
    icon: '💻',
    title: 'Amazon Skill Center',
    description: 'A visit to the Amazon Skill Center — a community technology education program operating in Cape Town. Useful context for our own work at the Forum.',
    photo: 'Photos/Amazon Skill Center.jpeg'
  },
  {
    icon: '🎪',
    title: 'Taiwan Festival',
    description: 'Cape Town hosts cultural festivals from communities worldwide. The Taiwan Festival added another layer to understanding how cosmopolitan the city truly is.',
    photo: 'Photos/Taiwan Festical.jpeg'
  },
  {
    icon: '🏫',
    title: 'High School Visit',
    description: 'A visit to a local Cape Town high school. Connecting with students gave us important context about the community our chatbot was ultimately built to serve.',
    photo: 'Photos/High School Experience.jpeg'
  },
  {
    icon: '💥',
    title: 'Historic Cannon',
    description: "A historic Cape Town cannon — one of many reminders of the city's long strategic importance as a waypoint between Europe, Africa, and Asia.",
    photo: 'Photos/Cannon.jpeg'
  }
];


/* --------------------------------------------------------------------------
   WHEEL CONFIGURATION
   RADIUS and ICON_SIZE must match the CSS dimensions in pictures.css.
   -------------------------------------------------------------------------- */
const WHEEL_CONFIG = {
  RADIUS:              208,    /* px: icon center distance from ring center */
  ICON_SIZE:            68,    /* px: icon element size                     */
  TRANSITION_DURATION: '0.45s',
  TRANSITION_EASING:   'cubic-bezier(0.4, 0, 0.2, 1)',
  DRAG_THRESHOLD:        5,    /* px: min movement before treating as drag  */
};


/* ==========================================================================
   PhotoWheel CLASS
   ========================================================================== */
class PhotoWheel {

  constructor() {
    this.items         = PHOTO_ITEMS;
    this.current       = 0;     /* index of the selected item */
    this.totalRotation = 0;     /* accumulated ring rotation (degrees) */

    /* DOM references cached once at startup */
    this.ringEl          = null;
    this.wheelAreaEl     = null;
    this.photoEl         = null;
    this.titleEl         = null;
    this.descEl          = null;
    this.counterEl       = null;    /* right panel counter */
    this.wheelCounterEl  = null;    /* controls-row counter */
    this.selectionIconEl = null;
    this.iconEls         = [];

    this._cacheElements();
    this._buildIcons();
    this._bindButtons();     /* Prev/Next buttons + keyboard + scroll wheel */
    this._bindDrag();        /* Click-drag to rotate + click to select       */
    this._render(false);     /* Initial render — no transition animation     */
  }


  /* ------------------------------------------------------------------------
     _cacheElements — Store references to frequently updated DOM nodes.
     ------------------------------------------------------------------------ */
  _cacheElements() {
    this.ringEl          = document.getElementById('wheelRing');
    this.wheelAreaEl     = document.getElementById('wheelArea');
    this.photoEl         = document.getElementById('displayPhoto');
    this.titleEl         = document.getElementById('displayTitle');
    this.descEl          = document.getElementById('displayDescription');
    this.counterEl       = document.getElementById('displayCounter');
    this.wheelCounterEl  = document.getElementById('wheelCounter');
    this.selectionIconEl = document.getElementById('selectionIconDisplay');
  }


  /* ------------------------------------------------------------------------
     _buildIcons — Create and append a .wheel-icon element for each photo.
     Icons are click-handled by the drag system (_bindDrag), not here.
     Keyboard activation is added here for accessibility.
     ------------------------------------------------------------------------ */
  _buildIcons() {
    this.items.forEach((item, i) => {
      const el = document.createElement('div');
      el.className = 'wheel-icon';
      el.setAttribute('data-index', String(i));    /* drag handler uses this */
      el.setAttribute('role', 'button');
      el.setAttribute('tabindex', '0');
      el.setAttribute('aria-label', item.title);

      const symbol = document.createElement('span');
      symbol.className = 'wheel-icon-symbol';
      symbol.textContent = item.icon;
      symbol.setAttribute('aria-hidden', 'true');
      el.appendChild(symbol);

      /* Keyboard: Enter or Space jumps to this icon */
      el.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.goTo(i);
        }
      });

      this.ringEl.appendChild(el);
      this.iconEls.push(el);
    });
  }


  /* ========================================================================
     CORE RENDER METHODS
     ======================================================================== */

  /* ------------------------------------------------------------------------
     _render — Full render: rotate ring, position icons, update photo panel.
     animate: false skips CSS transitions (used on initial load).
     ------------------------------------------------------------------------ */
  _render(animate = true) {
    const { RADIUS, TRANSITION_DURATION, TRANSITION_EASING } = WHEEL_CONFIG;
    const n    = this.items.length;
    const step = 360 / n;

    /* Color transitions always run; transform transitions only when animating */
    const colorT = 'background-color 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease';
    const ringT  = animate ? `transform ${TRANSITION_DURATION} ${TRANSITION_EASING}` : 'none';
    const iconT  = animate
      ? `transform ${TRANSITION_DURATION} ${TRANSITION_EASING}, ${colorT}`
      : colorT;

    /* Rotate the ring */
    this.ringEl.style.transition = ringT;
    this.ringEl.style.transform  = `rotate(${this.totalRotation}deg)`;

    /* Position each icon and counter-rotate to keep it upright */
    this.iconEls.forEach((el, i) => {
      const base    = i * step;
      const counter = -(this.totalRotation + base);   /* net screen rotation = 0 */
      el.style.transition = iconT;
      el.style.transform  = `rotate(${base}deg) translateX(${RADIUS}px) rotate(${counter}deg)`;
      el.classList.toggle('active', i === this.current);
    });

    /* Update photo + info on the right */
    this._updateDisplay();
  }


  /* ------------------------------------------------------------------------
     _renderRotationOnly — Used during drag.
     Rotates the ring visually WITHOUT loading the photo or updating text.
     Also live-previews which icon is nearest (highlight + selection box).
     ------------------------------------------------------------------------ */
  _renderRotationOnly() {
    const { RADIUS } = WHEEL_CONFIG;
    const n    = this.items.length;
    const step = 360 / n;

    /* Instant: no CSS transitions during drag */
    this.ringEl.style.transition = 'none';
    this.ringEl.style.transform  = `rotate(${this.totalRotation}deg)`;

    const nearest = this._getNearestIndex();

    this.iconEls.forEach((el, i) => {
      const base    = i * step;
      const counter = -(this.totalRotation + base);
      el.style.transition = 'none';
      el.style.transform  = `rotate(${base}deg) translateX(${RADIUS}px) rotate(${counter}deg)`;

      /* Highlight the icon currently nearest to the selection position */
      el.classList.toggle('active', i === nearest);
    });

    /* Update selection box icon to show the nearest item */
    if (this.selectionIconEl) {
      this.selectionIconEl.textContent = this.items[nearest].icon;
    }
  }


  /* ------------------------------------------------------------------------
     _updateDisplay — Sync the right-panel photo/text with this.current.
     The photo crossfades: fades out, then src swaps, then fades back in.
     ------------------------------------------------------------------------ */
  _updateDisplay() {
    const item = this.items[this.current];
    const n    = this.items.length;

    /* Selection box icon */
    if (this.selectionIconEl) {
      this.selectionIconEl.textContent = item.icon;
    }

    /* Counters */
    const counterText = `${this.current + 1} of ${n}`;
    if (this.counterEl)     this.counterEl.textContent     = counterText;
    if (this.wheelCounterEl) this.wheelCounterEl.textContent = counterText;

    /* Text fields */
    if (this.titleEl) this.titleEl.textContent = item.title;
    if (this.descEl)  this.descEl.textContent  = item.description;

    /* Photo crossfade: fade out → swap src → fade in */
    if (this.photoEl) {
      this.photoEl.classList.add('fading');
      setTimeout(() => {
        if (this.photoEl) {
          this.photoEl.src = item.photo;
          this.photoEl.alt = item.title;
          this.photoEl.classList.remove('fading');
        }
      }, 260);
    }
  }


  /* ========================================================================
     NAVIGATION — PUBLIC API
     ======================================================================== */

  next() {
    const step = 360 / this.items.length;
    this.totalRotation -= step;
    this.current = (this.current + 1) % this.items.length;
    this._render(true);
  }

  prev() {
    const step = 360 / this.items.length;
    this.totalRotation += step;
    this.current = (this.current - 1 + this.items.length) % this.items.length;
    this._render(true);
  }

  /* Jump directly to index via the shortest rotation path */
  goTo(targetIndex) {
    const n    = this.items.length;
    const step = 360 / n;

    let delta = targetIndex - this.current;
    if (delta >  n / 2) delta -= n;   /* always take the short way round */
    if (delta < -n / 2) delta += n;

    this.totalRotation -= delta * step;
    this.current = ((targetIndex % n) + n) % n;
    this._render(true);
  }


  /* ========================================================================
     DRAG ROTATION
     Handles click-drag spinning and click-to-select.
     Photo only loads when the mouse/touch is released.
     ======================================================================== */

  _bindDrag() {
    const area = this.wheelAreaEl;
    if (!area) return;

    let mouseIsDown  = false;
    let isDragging   = false;
    let startX       = 0;
    let startY       = 0;
    let lastDragAngle = 0;

    /* Get the angle in degrees from ring center to a screen point */
    const getAngle = (clientX, clientY) => {
      const rect = this.ringEl.getBoundingClientRect();
      const cx   = rect.left + rect.width  / 2;
      const cy   = rect.top  + rect.height / 2;
      return Math.atan2(clientY - cy, clientX - cx) * (180 / Math.PI);
    };

    /* Normalize delta to [-180, 180] to handle crossing the ±180 line */
    const normDelta = (d) => {
      while (d >  180) d -= 360;
      while (d < -180) d += 360;
      return d;
    };

    /* ---- Drag start ---- */
    const onDragStart = (clientX, clientY) => {
      mouseIsDown   = true;
      isDragging    = false;
      startX        = clientX;
      startY        = clientY;
      lastDragAngle = getAngle(clientX, clientY);
    };

    /* ---- Drag move ---- */
    const onDragMove = (clientX, clientY) => {
      if (!mouseIsDown) return;

      /* Only register as a drag after moving past the threshold */
      if (!isDragging) {
        const dist = Math.hypot(clientX - startX, clientY - startY);
        if (dist < WHEEL_CONFIG.DRAG_THRESHOLD) return;
        isDragging = true;
      }

      /* Incremental delta: avoids cumulative error from a single startAngle */
      const currentAngle = getAngle(clientX, clientY);
      const delta        = normDelta(currentAngle - lastDragAngle);
      lastDragAngle      = currentAngle;

      this.totalRotation += delta;
      this._renderRotationOnly();   /* rotate ring — NO photo load yet */
    };

    /* ---- Drag end (or click release) ---- */
    const onDragEnd = (targetEl) => {
      if (!mouseIsDown) return;
      mouseIsDown = false;

      if (isDragging) {
        /* Drag ended: snap to nearest icon and THEN load the photo */
        this._snapAndLoad();
      } else {
        /* Pure click (no movement): find which icon was clicked */
        const iconEl = targetEl && targetEl.closest
          ? targetEl.closest('[data-index]')
          : null;
        if (iconEl) {
          const idx = parseInt(iconEl.dataset.index, 10);
          if (!isNaN(idx)) this.goTo(idx);
        }
      }
      isDragging = false;
    };

    /* ---- Mouse events ---- */
    area.addEventListener('mousedown', (e) => {
      onDragStart(e.clientX, e.clientY);
      e.preventDefault();   /* prevents text selection during drag */
    });

    /* Attach move and up to window so dragging outside the wheel still works */
    window.addEventListener('mousemove', (e) => {
      if (mouseIsDown) onDragMove(e.clientX, e.clientY);
    });

    window.addEventListener('mouseup', (e) => {
      if (mouseIsDown) onDragEnd(e.target);
    });

    /* ---- Touch events (mobile) ---- */
    area.addEventListener('touchstart', (e) => {
      const t = e.touches[0];
      onDragStart(t.clientX, t.clientY);
      e.preventDefault();   /* prevents page scroll while dragging wheel */
    }, { passive: false });

    area.addEventListener('touchmove', (e) => {
      const t = e.touches[0];
      onDragMove(t.clientX, t.clientY);
      e.preventDefault();
    }, { passive: false });

    area.addEventListener('touchend', (e) => {
      const t = e.changedTouches[0];
      /* For touch, use the element at the release point */
      const el = document.elementFromPoint(t.clientX, t.clientY);
      onDragEnd(el);
    });
  }


  /* ------------------------------------------------------------------------
     _getNearestIndex — Find the item currently closest to angle 0 (rightmost).
     When totalRotation ≈ -k × step, item k is at angle 0.
     ------------------------------------------------------------------------ */
  _getNearestIndex() {
    const n    = this.items.length;
    const step = 360 / n;
    const k    = Math.round(-this.totalRotation / step);
    return ((k % n) + n) % n;
  }


  /* ------------------------------------------------------------------------
     _snapAndLoad — Snap the wheel to the nearest icon and load its photo.
     Called on drag release. This is the ONLY place the photo loads during drag.
     ------------------------------------------------------------------------ */
  _snapAndLoad() {
    const n    = this.items.length;
    const step = 360 / n;
    const k    = Math.round(-this.totalRotation / step);

    this.current       = ((k % n) + n) % n;
    this.totalRotation = -(k * step);      /* exact value for clean snapping */
    this._render(true);                    /* animate snap + load photo       */
  }


  /* ========================================================================
     BUTTON / KEYBOARD / SCROLL BINDINGS
     ======================================================================== */
  _bindButtons() {
    /* Prev / Next buttons */
    const btnNext = document.getElementById('btnNext');
    const btnPrev = document.getElementById('btnPrev');
    if (btnNext) btnNext.addEventListener('click', () => this.next());
    if (btnPrev) btnPrev.addEventListener('click', () => this.prev());

    /* Mouse-scroll over wheel area: one step per scroll event (debounced) */
    const area = this.wheelAreaEl;
    if (area) {
      let scrollCooldown = false;
      area.addEventListener('wheel', (e) => {
        e.preventDefault();
        if (scrollCooldown) return;
        scrollCooldown = true;
        setTimeout(() => { scrollCooldown = false; }, 320);
        if (e.deltaY > 0) this.next();
        else               this.prev();
      }, { passive: false });
    }

    /* Arrow key navigation (global) */
    document.addEventListener('keydown', (e) => {
      switch (e.key) {
        case 'ArrowRight':
        case 'ArrowDown':
          e.preventDefault();
          this.next();
          break;
        case 'ArrowLeft':
        case 'ArrowUp':
          e.preventDefault();
          this.prev();
          break;
      }
    });
  }
}


/* --------------------------------------------------------------------------
   INITIALIZE — wait for DOM to be ready
   -------------------------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', () => {
  window.photoWheel = new PhotoWheel();
});
