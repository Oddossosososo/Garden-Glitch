// ==UserScript==
// @name         GardenGlitch Store + Add-ons UI Fix
// @namespace    GardenGlitch
// @version      1.0.0
// @description  Repairs GardenGlitch styling and adds Store/Add-ons UI after the main panel loads
// @match        *://*/*
// @grant        none
// ==/UserScript==

(()=>{
  'use strict';
  const ADDONS='https://raw.githubusercontent.com/Oddossosososo/Garden-Glitch/main/garden-glitch-addons.user.js';
  const apply=async()=>{
    const host=document.getElementById('ggHost');
    const root=host?.shadowRoot;
    const dashboard=root?.querySelector('#pd');
    const tabs=root?.querySelector('.tabs');
    if(!root||!dashboard||!tabs)return false;

    if(!root.querySelector('#gg-ui-fix')){
      const style=document.createElement('style');
      style.id='gg-ui-fix';
      style.textContent=`
        #p{width:min(620px,calc(100vw - 18px))!important;background:linear-gradient(145deg,#03110a,#041b12 48%,#071b14)!important;border:1px solid #00ff66!important;border-radius:14px!important;box-shadow:0 0 18px #00ff6644,0 0 60px #00ff6618!important}
        #h{background:linear-gradient(90deg,#031007,#062015,#031007)!important;border-bottom:1px solid #00ff6644!important}
        #h b{color:#a6ffc1!important;text-shadow:0 0 10px #00ff6699!important}
        .t,.q{border-color:#00ff6655!important;background:#04130a!important;color:#8dffb0!important}
        .t.on,.t:hover,.q:hover{background:#00ff66!important;color:#001b08!important;box-shadow:0 0 12px #00ff6655!important}
        .card{background:#03140b!important;border-color:#00ff6629!important}
        .i,.s{background:#010803!important;border-color:#00ff6644!important;color:#b0ffc7!important}
        #ggStoreCard,#ggAddonsCard{margin-top:10px!important}
        .ggShopGrid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}
        .ggShopItem{padding:9px;border:1px solid #00ff6628;border-radius:9px;background:#020b06}
        .ggShopItem b{color:#9dffb8}
        .ggShopItem .small{display:block;margin:4px 0 7px;color:#54b96f;font-size:10px}
        @media(max-width:560px){.ggShopGrid{grid-template-columns:1fr}}
      `;
      root.appendChild(style);
    }

    let store=root.querySelector('#ggStoreCard');
    if(!store){
      store=document.createElement('div');
      store.id='ggStoreCard';
      store.className='card';
      store.innerHTML=`<h3>🛒 GardenGlitch Store</h3><div class="small">Free built-in modules for the panel.</div><div class="ggShopGrid"></div>`;
      dashboard.appendChild(store);
      const grid=store.querySelector('.ggShopGrid');
      const items=[
        ['More Fonts+','Orbitron + Roboto Mono + terminal fonts','more-fonts-plus'],
        ['Mad Scientist','Experimental floating lab badge','mad-scientist'],
        ['Neon Theme','Green/cyan terminal theme preset','json-neon-theme']
      ];
      for(const [name,desc,id] of items){
        const box=document.createElement('div'); box.className='ggShopItem';
        box.innerHTML=`<b>${name}</b><span class="small">${desc}</span><button class="q" data-addon="${id}">ACTIVATE</button>`;
        grid.appendChild(box);
      }
    }

    try{
      if(!window.GardenGlitchAddons){
        const r=await fetch(ADDONS,{cache:'no-store'});
        if(r.ok)new Function(await r.text())();
      }
    }catch(e){console.warn('GardenGlitch add-ons load:',e)}

    root.querySelectorAll('[data-addon]').forEach(btn=>{
      if(btn.dataset.ggBound)return;
      btn.dataset.ggBound='1';
      btn.onclick=async()=>{
        const id=btn.dataset.addon;
        if(window.GardenGlitchAddons?.enable){
          await window.GardenGlitchAddons.enable(id);
          btn.textContent='ACTIVE';
          btn.disabled=true;
        }else{
          btn.textContent='UNAVAILABLE';
        }
      };
    });

    let addons=root.querySelector('#ggAddonsCard');
    if(!addons){
      addons=document.createElement('div');
      addons.id='ggAddonsCard';
      addons.className='card';
      addons.innerHTML='<h3>🧩 Add-ons</h3><div class="small">Optional modules are loaded manually and are never auto-enabled.</div>';
      dashboard.appendChild(addons);
    }

    if(!tabs.querySelector('[data-p="store"]')){
      const b=document.createElement('button');
      b.className='t'; b.dataset.p='store'; b.textContent='Store';
      tabs.appendChild(b);
      b.onclick=()=>{
        root.querySelectorAll('.t').forEach(x=>x.classList.remove('on'));
        root.querySelectorAll('.pg').forEach(x=>x.classList.remove('on'));
        b.classList.add('on');
        const dash=root.querySelector('#pd');
        if(dash){dash.style.display='block';}
        // Keep store in the dashboard; clicking Store scrolls directly to it.
        store.scrollIntoView({behavior:'smooth',block:'start'});
      };
    }
    return true;
  };

  const run=()=>{if(!apply()){
    const t=setInterval(()=>{if(apply())clearInterval(t)},250);
    setTimeout(()=>clearInterval(t),30000);
  }};
  run();
})();
