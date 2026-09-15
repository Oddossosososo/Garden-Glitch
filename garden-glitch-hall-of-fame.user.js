// ==UserScript==
// @name         GardenGlitch Hall of Fame
// @namespace    GardenGlitch
// @version      1.0.0
// @description  Adds the GardenGlitch Hall of Fame to the CR panel
// @match        *://*/*
// @grant        none
// ==/UserScript==

(()=>{
  'use strict';
  const add=()=>{
    const host=document.querySelector('#ggHost');
    if(!host?.shadowRoot)return false;
    const root=host.shadowRoot;
    if(root.querySelector('#ggHallOfFame'))return true;
    const dashboard=root.querySelector('#pd');
    if(!dashboard)return false;
    const card=document.createElement('div');
    card.id='ggHallOfFame';
    card.className='card';
    card.innerHTML=`<div style="font-size:16px;font-weight:700;margin-bottom:7px">🏆 GardenGlitch Hall of Fame</div><div style="display:grid;gap:6px"><div style="padding:8px;border:1px solid #00ffff44;border-radius:8px;background:#00ffff0a"><b>🦁 Leo</b><div class="muted">Founding Legend</div></div><div style="padding:8px;border:1px solid #a000ff44;border-radius:8px;background:#a000ff0a"><b>⚡ Harvey</b><div class="muted">GardenGlitch Legend</div></div></div>`;
    dashboard.appendChild(card);
    return true;
  };
  if(add())return;
  const mo=new MutationObserver(()=>{if(add())mo.disconnect()});
  mo.observe(document.documentElement,{childList:true,subtree:true});
  setTimeout(()=>mo.disconnect(),15000);
})();
