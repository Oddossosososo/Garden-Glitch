// ==UserScript==
// @name         GardenGlitch Panel
// @namespace    GardenGlitch
// @version      2.0.1
// @description  GardenGlitch modular panel loader
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
    M+'garden-glitch-animals.user.js',
    M+'garden-glitch-refresh.user.js',
    M+'garden-glitch-remove-magic-tree.user.js'
  ];
  for(const url of files){
    try{
      const r=await fetch(url,{cache:'no-store'});
      if(!r.ok)throw new Error(url+' -> '+r.status);
      (0,eval)(await r.text());
    }catch(e){console.error('GardenGlitch module failed:',e);}
  }
})();
