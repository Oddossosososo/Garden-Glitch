// ==UserScript==
// @name         GardenGlitch Refresh Module
// @namespace    GardenGlitch
// @version      1.0.0
// @description  Dedicated GardenGlitch game refresh handler
// @match        *://*/*
// @grant        none
// ==/UserScript==

(()=>{
  'use strict';
  const apply=()=>{
    const root=document.getElementById('ggHost')?.shadowRoot;
    const button=root?.querySelector('#canvas');
    if(!button)return false;
    if(button.dataset.ggRefresh==='1')return true;
    button.dataset.ggRefresh='1';
    button.textContent='🔄 Refresh Game';
    const refresh=()=>{
      try{
        const iframe=typeof window.iframeObj!=='undefined'&&window.iframeObj?.contentWindow
          ? window.iframeObj
          : null;
        if(iframe?.contentWindow){
          iframe.contentWindow.location.reload();
          root.querySelector('#st').textContent='🔄 Game refresh sent';
          return;
        }
        const canvas=document.querySelector('#unity-canvas,canvas');
        if(canvas){
          const r=canvas.getBoundingClientRect(),d=window.devicePixelRatio||1;
          if(r.width>0&&r.height>0){canvas.width=Math.round(r.width*d);canvas.height=Math.round(r.height*d)}
          window.dispatchEvent(new Event('resize'));
          canvas.dispatchEvent(new Event('resize'));
          root.querySelector('#st').textContent='🔄 Canvas refreshed';
          return;
        }
        root.querySelector('#st').textContent='⚠️ Game target not found';
      }catch(e){root.querySelector('#st').textContent='❌ Refresh failed'}
    };
    button.onclick=refresh;
    return true;
  };
  if(!apply()){
    const t=setInterval(()=>apply()&&clearInterval(t),100);
    setTimeout(()=>clearInterval(t),10000);
  }
})();
