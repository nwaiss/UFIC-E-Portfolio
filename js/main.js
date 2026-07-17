/* ==========================================================================
   MAIN.JS — Shared JavaScript for all pages in the UFIC E-Portfolio.
   Runs on: every page.
   Responsibilities:
     • Mark the active nav link based on current URL
     • Add a scroll-shadow to the fixed header when the page scrolls
   ========================================================================== */

'use strict';

/* --------------------------------------------------------------------------
   NAV ACTIVE STATE
   Compares each nav link's href to the current page filename and adds
   the "active" class to the matching link. This drives the terracotta
   underline indicator in the header.
   -------------------------------------------------------------------------- */
function markActiveNavLink() {
  // Get the last segment of the current URL path (e.g., "pictures.html")
  const currentFile = window.location.pathname.split('/').pop() || 'index.html';

  document.querySelectorAll('.nav-link').forEach(link => {
    const linkFile = link.getAttribute('href').split('/').pop();

    if (linkFile === currentFile) {
      link.classList.add('active');
      link.setAttribute('aria-current', 'page');
    }
  });
}


/* --------------------------------------------------------------------------
   HEADER SCROLL SHADOW
   Adds a subtle bottom-shadow to the header once the user scrolls down,
   to visually separate it from the page content.
   (No drop shadows at zero scroll — keeps the top of the page clean.)
   -------------------------------------------------------------------------- */
function initHeaderScrollShadow() {
  const header = document.querySelector('.site-header');
  if (!header) return;

  const SHADOW_THRESHOLD = 20;   /* pixels scrolled before shadow appears */

  function updateShadow() {
    if (window.scrollY > SHADOW_THRESHOLD) {
      header.style.boxShadow = '0 2px 16px rgba(28, 58, 94, 0.25)';
    } else {
      header.style.boxShadow = 'none';
    }
  }

  // Use passive listener for scroll performance
  window.addEventListener('scroll', updateShadow, { passive: true });
  updateShadow();   // run once on load in case page opens scrolled
}


/* --------------------------------------------------------------------------
   ENTRY POINT
   Wait for the DOM to be ready before querying elements.
   -------------------------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', () => {
  markActiveNavLink();
  initHeaderScrollShadow();
});
