// ==UserScript==
// @name         GardenGlitch Store UI Fix Loader
// @namespace    GardenGlitch
// @version      1.0.0
// @description  Loads the GardenGlitch Store + Add-ons UI fix
// @match        *://*/*
// @grant        none
// ==/UserScript==

fetch('https://raw.githubusercontent.com/Oddossosososo/Garden-Glitch/main/garden-glitch-store-ui-fix.user.js',{cache:'no-store'})
  .then(r=>{if(!r.ok)throw Error('HTTP '+r.status);return r.text()})
  .then(code=>new Function(code+'\n//# sourceURL=GardenGlitchStoreUIFix')())
  .catch(e=>console.error('GardenGlitch Store UI Fix failed:',e));
