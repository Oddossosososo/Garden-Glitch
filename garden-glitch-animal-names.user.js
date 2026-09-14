// ==UserScript==
// @name         GardenGlitch Animal Names
// @namespace    GardenGlitch
// @version      1.1.0
// @description  Correct GardenGlitch animal ID names in the existing panel
// @match        *://*/*
// @grant        none
// ==/UserScript==

(() => {
  'use strict';

  const names = [
    'Chick',
    'Hen',
    'Rooster',
    'Sheep',
    'Pig',
    'Donkey',
    'Duck',
    'Buffalo',
    'Cow'
  ];

  const apply = () => {
    const select = document.getElementById('ggHost')?.shadowRoot?.querySelector('#animal');
    if (!select) return false;

    const current = [...select.options].map(o => `${o.value}:${o.textContent}`);
    const expected = names.map((name, id) => `${id}:${id} • ${name}`);
    if (current.length === expected.length && current.every((v, i) => v === expected[i])) return true;

    select.replaceChildren(...names.map((name, id) => {
      const option = document.createElement('option');
      option.value = String(id);
      option.textContent = `${id} • ${name}`;
      return option;
    }));

    return true;
  };

  const host = document.getElementById('ggHost');
  if (host?.shadowRoot) apply();

  const timer = setInterval(() => {
    if (apply()) clearInterval(timer);
  }, 100);
  setTimeout(() => clearInterval(timer), 15000);

  const watch = new MutationObserver(() => apply());
  const root = host?.shadowRoot;
  if (root) watch.observe(root, { childList: true, subtree: true });
})();
