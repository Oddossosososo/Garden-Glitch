// ==UserScript==
// @name         GardenGlitch CR Complete Loader
// @namespace    GardenGlitch
// @version      1.0.0
// @description  Loads the CR panel with repaired IIFE boundaries, green look, Store, Add-ons and Hall of Fame
// @match        *://*/*
// @grant        none
// ==/UserScript==

(async()=>{
  'use strict';

  const B='https://raw.githubusercontent.com/Oddossosososo/Garden-Glitch/cr-look-refresh/';
  const M='https://raw.githubusercontent.com/Oddossosososo/Garden-Glitch/main/';

  const files=[
    B+'garden-glitch-panel.user.js',
    B+'garden-glitch-look-refresh.user.js',
    B+'garden-glitch-terminal-features.user.js',
    M+'garden-glitch-store-ui-fix.user.js',
    M+'garden-glitch-hall-of-fame.user.js'
  ];

  for(const url of files){
    try{
      const r=await fetch(url,{cache:'no-store'});
      if(!r.ok)throw new Error(url+' -> HTTP '+r.status);

      let code=await r.text();

      // The CR panel has adjacent IIFEs without a separator.
      code=code.replace(/\}\)\(\)\s*(?=\(\(\)=>)/g,'})();\n');

      new Function(code+'\n//# sourceURL='+url)();
      console.log('✅ GardenGlitch loaded:',url);
    }catch(e){
      console.error('❌ GardenGlitch module failed:',url,e);
    }
  }
})();
