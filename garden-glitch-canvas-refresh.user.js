// ==UserScript==
// @name         GardenGlitch Canvas Refresh Fix
// @namespace    GardenGlitch
// @version      1.1.0
// @description  Makes the GardenGlitch Refresh Canvas button reliably refresh/redraw the game canvas
// @match        *://*/*
// @grant        none
// ==/UserScript==

(() => {
  'use strict';

  function install() {
    const host = document.getElementById('ggHost');
    const root = host?.shadowRoot;
    const button = root?.querySelector('#canvas');
    if (!button) return false;

    const refreshCanvas = () => {
      let found = 0;

      // Refresh every canvas we can access on the page.
      document.querySelectorAll('canvas').forEach(canvas => {
        found++;
        const width = canvas.width;
        const height = canvas.height;
        canvas.width = width;
        canvas.height = height;
        canvas.dispatchEvent(new Event('resize'));
      });

      // Trigger layout/redraw handlers used by Unity/WebGL pages.
      window.dispatchEvent(new Event('resize'));
      window.dispatchEvent(new Event('orientationchange'));

      // Same-origin iframe fallback.
      document.querySelectorAll('iframe').forEach(frame => {
        try {
          const doc = frame.contentDocument;
          const win = frame.contentWindow;
          if (!doc) return;
          doc.querySelectorAll('canvas').forEach(canvas => {
            found++;
            const width = canvas.width;
            const height = canvas.height;
            canvas.width = width;
            canvas.height = height;
            canvas.dispatchEvent(new Event('resize'));
          });
          win?.dispatchEvent(new Event('resize'));
        } catch (_) {
          // Cross-origin iframe: browser security prevents inspecting its canvas.
        }
      });

      button.textContent = found ? '✅ Canvas Refreshed' : '🔄 Canvas Resized';
      setTimeout(() => {
        if (button.isConnected) button.textContent = '🔄 Refresh Canvas';
      }, 1200);
    };

    // Keep this override alive because the main panel currently overwrites
    // the button handler shortly after creating the panel.
    if (button.__ggCanvasRefreshFixInstalled !== true) {
      button.__ggCanvasRefreshFixInstalled = true;
    }
    button.onclick = refreshCanvas;
    return true;
  }

  const timer = setInterval(() => {
    if (install() && document.getElementById('ggHost')?.shadowRoot?.querySelector('#canvas')) {
      // Keep watching briefly so a later handler cannot replace ours.
    }
  }, 100);

  setTimeout(() => clearInterval(timer), 15000);
  install();
})();
