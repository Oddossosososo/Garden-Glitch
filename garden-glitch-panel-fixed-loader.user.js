// ==UserScript==
// @name         GardenGlitch Panel Fixed Loader
// @namespace    GardenGlitch
// @version      1.0.0
// @description  Loads the GardenGlitch panel with safe IIFE separators
// @match        *://*/*
// @grant        none
// ==/UserScript==

(async()=>{
  'use strict';
  const url='https://raw.githubusercontent.com/Oddossosososo/Garden-Glitch/cr-look-refresh/garden-glitch-panel.user.js';

  try{
    const r=await fetch(url,{cache:'no-store'});
    if(!r.ok) throw new Error('Panel HTTP '+r.status);

    let code=await r.text();

    // Protect adjacent IIFEs from being parsed as a call chain.
    code=code.replace(/\}\)\(\)\s*(?=\(\(\)=>)/g,'})();\n;');

    new Function(code+'\n//# sourceURL=GardenGlitchPanelFixed')();
    console.log('✅ GardenGlitch fixed panel loaded');
  }catch(e){
    console.error('❌ GardenGlitch fixed panel failed:',e);
  }
})();
