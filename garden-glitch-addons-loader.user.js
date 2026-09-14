// ==UserScript==
// @name         GardenGlitch Add-ons Loader
// @namespace    GardenGlitch
// @version      1.0.0
// @description  One-paste loader for the optional GardenGlitch add-on system
// @match        *://*/*
// @grant        none
// ==/UserScript==

fetch('https://raw.githubusercontent.com/Oddossosososo/Garden-Glitch/main/garden-glitch-addons.user.js',{cache:'no-store'})
  .then(r=>{if(!r.ok)throw Error('HTTP '+r.status);return r.text()})
  .then(code=>new Function(code)());