// ==UserScript==
// @name         GardenGlitch Panel
// @namespace    GardenGlitch
// @version      2.3.2
// @description  GardenGlitch modular panel loader with real chat and game modules
// @match        *://*/*
// @grant        none
// ==/UserScript==

(async()=>{
  'use strict';
  const B='https://raw.githubusercontent.com/Oddossosososo/Garden-Glitch/cr-look-refresh/';
  const M='https://raw.githubusercontent.com/Oddossosososo/Garden-Glitch/main/';
  const files=[
    M+'garden-glitch-localstorage-api.user.js',
    M+'garden-glitch-live-sync.user.js',
    M+'garden-glitch-no-refresh.user.js',
    M+'garden-glitch-game-reload.user.js',
    B+'garden-glitch-panel.user.js',
    B+'garden-glitch-look-refresh.user.js',
    B+'garden-glitch-terminal-features.user.js',
    M+'garden-glitch-chat.user.js',
    M+'garden-glitch-animals.user.js',
    M+'garden-glitch-refresh.user.js',
    M+'garden-glitch-remove-magic-tree.user.js',
    M+'garden-glitch-enhancements.user.js',
    M+'garden-glitch-hall-of-fame.user.js'
  ];
  for(const url of files){
    try{
      const r=await fetch(url,{cache:'no-store'});
      if(!r.ok)throw new Error(url+' -> '+r.status);
      const code=await r.text();
      new Function(code+'\n//# sourceURL='+url)();
    }catch(e){console.error('GardenGlitch module failed:',url,e);}
  }
})();
