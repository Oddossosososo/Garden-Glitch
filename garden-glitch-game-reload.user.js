// ==UserScript==
// @name         GardenGlitch Game Hard Reload
// @namespace    GardenGlitch
// @version      1.0.0
// @description  Reload only the GardenGlitch game iframe, not the whole page
// @match        *://*/*
// @grant        none
// ==/UserScript==

(()=>{
  'use strict';
  if(window.GardenGlitchGameReload)return;

  const findFrame=()=>{
    const frames=[...document.querySelectorAll('iframe')];
    return frames.find(f=>{
      const s=((f.id||'')+' '+(f.name||'')+' '+(f.title||'')+' '+(f.src||'')).toLowerCase();
      return /unity|game|3x3|garden/.test(s);
    })||frames[0]||null;
  };

  const reload=()=>{
    const frame=findFrame();
    if(!frame){console.error('GardenGlitch: game iframe not found');return false;}
    const src=frame.getAttribute('src');
    if(!src){console.error('GardenGlitch: game iframe has no src');return false;}
    try{
      const url=new URL(src,location.href);
      url.searchParams.set('ggReload',Date.now().toString());
      frame.src=url.href;
    }catch{
      frame.src=src;
    }
    console.log('GardenGlitch: game hard reload requested');
    return true;
  };

  const installButton=()=>{
    const root=document.getElementById('ggHost')?.shadowRoot;
    if(!root)return false;
    const dashboard=root.querySelector('#pd');
    if(!dashboard)return false;
    if(root.querySelector('#ggGameReload'))return true;

    const button=document.createElement('button');
    button.id='ggGameReload';
    button.className='q';
    button.textContent='🔥 Reload Game';
    button.onclick=reload;

    const controls=dashboard.querySelector('.card .grid');
    if(controls)controls.appendChild(button);
    else dashboard.appendChild(button);
    return true;
  };

  window.GardenGlitchGameReload={reload,installButton};

  if(!installButton()){
    const timer=setInterval(()=>{
      if(installButton())clearInterval(timer);
    },250);
    setTimeout(()=>clearInterval(timer),30000);
  }
})();
