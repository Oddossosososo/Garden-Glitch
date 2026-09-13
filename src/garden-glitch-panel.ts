// ==UserScript==
// @name         GardenGlitch Panel TS Loader
// @namespace    GardenGlitch
// @version      1.0.0-ts
// @description  TypeScript-powered GardenGlitch panel loader
// @match        *://*/*
// @grant        none
// ==/UserScript==

type AnimalId = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

const ANIMALS: Record<AnimalId, string> = {
  0: 'Chick',
  1: 'Hen',
  2: 'Rooster',
  3: 'Sheep',
  4: 'Pig',
  5: 'Donkey',
  6: 'Duck',
  7: 'Buffalo',
  8: 'Cow',
};

const PANEL_URL =
  'https://raw.githubusercontent.com/Oddossosososo/Garden-Glitch/main/garden-glitch-panel.user.js';

function isAnimalId(value: number): value is AnimalId {
  return Number.isInteger(value) && value >= 0 && value <= 8;
}

async function loadPanel(): Promise<void> {
  const response = await fetch(PANEL_URL, { cache: 'no-store' });
  if (!response.ok) throw new Error(`GardenGlitch panel fetch failed: HTTP ${response.status}`);

  const source = await response.text();
  if (!source.includes('GardenGlitch Panel')) {
    throw new Error('GardenGlitch panel source was not recognised.');
  }

  (0, eval)(source);

  const start = Date.now();
  while (Date.now() - start < 5000) {
    const host = document.getElementById('ggHost');
    const root = host?.shadowRoot;
    const select = root?.querySelector<HTMLSelectElement>('#animal');

    if (select) {
      select.replaceChildren();
      for (let i = 0; i <= 8; i++) {
        if (!isAnimalId(i)) continue;
        const option = document.createElement('option');
        option.value = String(i);
        option.textContent = `${i} • ${ANIMALS[i]}`;
        select.appendChild(option);
      }
      return;
    }

    await new Promise<void>((resolve) => setTimeout(resolve, 50));
  }

  throw new Error('GardenGlitch panel loaded, but the Animals control was not found.');
}

loadPanel().catch((error: unknown) => {
  console.error('[GardenGlitch TS]', error);
});
