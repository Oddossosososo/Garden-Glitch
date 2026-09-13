// ==UserScript==
// @name         GardenGlitch Animal Names
// @namespace    GardenGlitch
// @version      1.0.0
// @description  Correct GardenGlitch animal ID names in the existing panel
// @match        *://*/*
// @grant        none
// ==/UserScript==

(()=>{
  'use strict';
  const names=['Chick','Hen','Rooster','Sheep','Pig','Donkey','Duck','Buffalo','Cow'];
  const apply=()=>{
    const root=document.getElementById('ggHost')?.shadowRoot;
    const select=root?.querySelector('#animal');
    if(!select)return false;
    select.replaceChildren(...names.map((name,id)=>{
      const option=document.createElement('option');
      option.value=String(id);
      option.textContent=`${id} • ${name}`;
      return option;
    }));
    return true;
  };
  if(apply())return;
  const timer=setInterval(()=>{if(apply())clearInterval(timer)},100);
  setTimeout(()=>clearInterval(timer),10000);
})();
