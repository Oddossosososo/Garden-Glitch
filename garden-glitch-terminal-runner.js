(() => {
  'use strict';

  const FILES = [
    'garden-glitch-panel.user.js',
    'garden-glitch-look-refresh.user.js',
    'garden-glitch-animal-names.user.js'
  ];
  const BASE = 'https://raw.githubusercontent.com/Oddossosososo/Garden-Glitch/cr-look-refresh/';
  const loaded = new Set();

  const run = async (path) => {
    if (loaded.has(path)) return;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);
    try {
      const res = await fetch(BASE + path, { cache: 'no-store', signal: controller.signal });
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
      const code = await res.text();
      const script = document.createElement('script');
      script.textContent = `${code}\n//# sourceURL=GardenGlitch/${path}`;
      document.documentElement.appendChild(script);
      script.remove();
      loaded.add(path);
      console.log(`%c[GG TERMINAL] LOADED ${path}`, 'color:#39ff88;font-weight:bold');
    } finally {
      clearTimeout(timer);
    }
  };

  (async () => {
    console.clear();
    console.log('%c╔══════════════════════════════════════╗', 'color:#39ff88');
    console.log('%c║   GARDENGLITCH :: TERMINAL BOOT     ║', 'color:#39ff88;font-weight:bold');
    console.log('%c╚══════════════════════════════════════╝', 'color:#39ff88');
    for (const file of FILES) {
      try { await run(file); }
      catch (e) { console.error(`[GG TERMINAL] FAILED ${file}`, e); }
    }
    console.log('%c[GG TERMINAL] SYSTEM READY', 'color:#5cefff;font-weight:bold');
  })();
})();
