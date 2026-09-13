// ==UserScript==
// @name         GardenGlitch Look Refresh
// @namespace    GardenGlitch
// @version      1.0.0
// @description  Visual refresh layer for the GardenGlitch panel
// @match        *://*/*
// @grant        none
// ==/UserScript==

(() => {
  'use strict';

  const apply = () => {
    const host = document.getElementById('ggHost');
    const root = host?.shadowRoot;
    if (!root || root.getElementById('gg-look-refresh')) return false;

    const style = document.createElement('style');
    style.id = 'gg-look-refresh';
    style.textContent = `
      #p {
        border-color: #8dfcff !important;
        background:
          radial-gradient(circle at 20% 0%, #19eaff18, transparent 38%),
          radial-gradient(circle at 100% 100%, #c45cff18, transparent 42%),
          linear-gradient(145deg, #070914, #160a24 58%, #091725) !important;
        box-shadow:
          0 0 24px #00eaff35,
          0 0 55px #a000ff25,
          inset 0 1px 0 #ffffff12 !important;
      }
      #h {
        background: linear-gradient(90deg, #00eaff0d, #c45cff0d);
        text-shadow: 0 0 12px #00eaff55;
      }
      .t, .q {
        border-color: #7df7ff26 !important;
        background: linear-gradient(180deg, #ffffff0b, #ffffff04) !important;
        transition: transform .12s ease, border-color .12s ease, box-shadow .12s ease, background .12s ease;
      }
      .t:hover, .q:hover {
        transform: translateY(-1px);
        border-color: #7df7ff77 !important;
        box-shadow: 0 0 14px #00eaff18;
        background: linear-gradient(180deg, #00eaff12, #c45cff0b) !important;
      }
      .t.on {
        border-color: #7df7ffcc !important;
        background: linear-gradient(180deg, #00eaff20, #c45cff14) !important;
        box-shadow: 0 0 18px #00eaff1c inset;
      }
      .card {
        border-color: #ffffff18 !important;
        background: linear-gradient(145deg, #ffffff08, #ffffff03) !important;
        box-shadow: inset 0 1px 0 #ffffff08;
      }
      .i, .s {
        border-color: #7df7ff24 !important;
        background: #080d18 !important;
        outline: none;
      }
      .i:focus, .s:focus {
        border-color: #7df7ff88 !important;
        box-shadow: 0 0 0 2px #00eaff12, 0 0 15px #00eaff12;
      }
    `;
    root.appendChild(style);
    return true;
  };

  if (!apply()) {
    const timer = setInterval(() => {
      if (apply()) clearInterval(timer);
    }, 250);
    setTimeout(() => clearInterval(timer), 15000);
  }
})();
