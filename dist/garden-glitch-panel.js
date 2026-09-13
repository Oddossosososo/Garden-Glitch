"use strict";
// ==UserScript==
// @name         GardenGlitch Panel TS Loader
// @namespace    GardenGlitch
// @version      1.0.2-ts
// @description  TypeScript-powered GardenGlitch panel loader
// @match        *://*/*
// @grant        none
// ==/UserScript==
const ANIMALS = { 0: "Chick", 1: "Hen", 2: "Rooster", 3: "Sheep", 4: "Pig", 5: "Donkey", 6: "Duck", 7: "Buffalo", 8: "Cow" };
const PANEL_URL = "https://raw.githubusercontent.com/Oddossosososo/Garden-Glitch/main/garden-glitch-panel.user.js";
function isAnimalId(value) {
    return Number.isInteger(value) && value >= 0 && value <= 8;
}
function loadPanelScript() {
    return new Promise((resolve, reject) => {
        const existing = document.querySelector('script[data-gardenglitch-panel="1"]');
        if (existing) {
            resolve();
            return;
        }
        const script = document.createElement("script");
        script.dataset.gardenglitchPanel = "1";
        script.src = PANEL_URL;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error("GardenGlitch panel script failed to load."));
        (document.head || document.documentElement).appendChild(script);
    });
}
async function loadPanel() {
    await loadPanelScript();
    const start = Date.now();
    while (Date.now() - start < 5000) {
        const host = document.getElementById("ggHost");
        const root = host?.shadowRoot;
        const select = root?.querySelector("#animal");
        if (select) {
            select.replaceChildren();
            for (let i = 0; i <= 8; i++) {
                if (!isAnimalId(i))
                    continue;
                const option = document.createElement("option");
                option.value = String(i);
                option.textContent = `${i} • ${ANIMALS[i]}`;
                select.appendChild(option);
            }
            return;
        }
        await new Promise((resolve) => setTimeout(resolve, 50));
    }
    throw new Error("GardenGlitch panel loaded, but the Animals control was not found.");
}
loadPanel().catch((error) => {
    console.error("[GardenGlitch TS]", error);
});
