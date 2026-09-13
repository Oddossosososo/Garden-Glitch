// ==UserScript==
// @name         GardenGlitch Animal IDs Fix
// @namespace    GardenGlitch
// @version      1.0.0
// @description  Correct GardenGlitch animal IDs 0-8
// @match        *://*/*
// @grant        none
// ==/UserScript==

(()=>{
  const r=document.getElementById('ggHost')?.shadowRoot;
  const s=r?.querySelector('#animal');
  if(!s)return;
  s.innerHTML=[
    ['0','Chick'],['1','Hen'],['2','Rooster'],['3','Sheep'],['4','Pig'],
    ['5','Donkey'],['6','Duck'],['7','Buffalo'],['8','Cow']
  ].map(([id,name])=>`<option value="${id}">${id} • ${name}</option>`).join('');
})();
