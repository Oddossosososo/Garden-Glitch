// ==UserScript==
// @name         GardenGlitch Hall of Fame
// @namespace    GardenGlitch
// @version      1.0.3
// @description  Adds the GardenGlitch Hall of Fame reliably to the CR panel
// @match        *://*/*
// @grant        none
// ==/UserScript==

(()=>{
  'use strict';

  let done=false;

  function add(){
    if(done)return true;
    const host=document.querySelector('#ggHost');
    const root=host?.shadowRoot;
    if(!root)return false;

    const dashboard=root.querySelector('#pd');
    if(!dashboard)return false;
    if(root.querySelector('#ggHallOfFame')){done=true;return true;}

    const card=document.createElement('div');
    card.id='ggHallOfFame';
    card.className='card';
    card.innerHTML=`
      <div style="font-size:16px;font-weight:700;margin-bottom:8px">🏆 GardenGlitch Hall of Fame</div>
      <div style="display:grid;gap:6px">
        <div style="padding:8px;border:1px solid #00ffff44;border-radius:8px;background:#00ffff0a">
          <b>🦁 Leo</b><div class="muted">Founding Legend</div>
        </div>
        <div style="padding:8px;border:1px solid #ffcc0044;border-radius:8px;background:#ffcc000a">
          <b>🌟 Reece</b><div class="muted">GardenGlitch Legend</div>
        </div>
      </div>`;

    dashboard.appendChild(card);
    done=true;
    console.log('🏆 GardenGlitch Hall of Fame updated: Leo, Reece');
    return true;
  }

  const timer=setInterval(()=>{if(add())clearInterval(timer)},250);
  add();
  setTimeout(()=>clearInterval(timer),30000);
})();