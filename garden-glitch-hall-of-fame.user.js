// ==UserScript==
// @name         GardenGlitch Hall of Fame
// @namespace    GardenGlitch
// @version      1.0.0
// @description  Adds the GardenGlitch Hall of Fame to the panel
// @match        *://*/*
// @grant        none
// ==/UserScript==

(()=>{
  'use strict';
  const host=document.getElementById('ggHost');
  if(!host?.shadowRoot)return;
  const root=host.shadowRoot;
  const dashboard=root.querySelector('#pd');
  if(!dashboard || root.querySelector('#ggHallOfFame'))return;

  const card=document.createElement('div');
  card.id='ggHallOfFame';
  card.className='card';
  card.innerHTML=`
    <div style="font-size:16px;font-weight:800;margin-bottom:8px">🏆 Hall of Fame</div>
    <div style="display:grid;gap:7px">
      <div style="padding:9px;border:1px solid #ffd70055;border-radius:9px;background:linear-gradient(90deg,#ffd70012,#ffffff05)">
        <b>🦁 Leo</b><div class="muted">Founding Legend</div>
      </div>
      <div style="padding:9px;border:1px solid #00eaff55;border-radius:9px;background:linear-gradient(90deg,#00eaff12,#ffffff05)">
        <b>⚡ Harvey</b><div class="muted">GardenGlitch Legend</div>
      </div>
    </div>`;

  const character=dashboard.querySelector('.card:nth-of-type(2)');
  if(character)character.insertAdjacentElement('afterend',card);
  else dashboard.appendChild(card);
})();
