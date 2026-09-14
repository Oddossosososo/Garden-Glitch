// ==UserScript==
// @name         GardenGlitch Animal IDs
// @namespace    GardenGlitch
// @version      1.0.0
// @description  Correct GardenGlitch animal selector IDs
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
    const current=select.value;
    select.innerHTML=names.map((name,id)=>`<option value="${id}">${id} • ${name}</option>`).join('');
    select.value=[...select.options].some(o=>o.value===current)?current:'0';
    return true;
  };
  if(!apply()){
    const t=setInterval(()=>apply()&&clearInterval(t),100);
    setTimeout(()=>clearInterval(t),10000);
  }
})();
