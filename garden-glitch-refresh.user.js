// ==UserScript==
// @name         GardenGlitch Refresh Module
// @namespace    GardenGlitch
// @version      1.1.0
// @description  Reliable GardenGlitch game refresh handler
// @match        *://*/*
// @grant        none
// ==/UserScript==

(()=>{
  'use strict';

  const findGameFrame=()=>{
    if(window.iframeObj instanceof HTMLIFrameElement)return window.iframeObj;
    const frames=[...document.querySelectorAll('iframe')];
    return frames.find(f=>{
      const s=((f.id||'')+' '+(f.name||'')+' '+(f.title||'')+' '+(f.src||'')).toLowerCase();
      return /unity|game|3x3|garden/.test(s);
    })||frames[0]||null;
  };

  const refresh=()=>{
    const root=document.getElementById('ggHost')?.shadowRoot;
    const status=root?.querySelector('#st');
    const frame=findGameFrame();

    try{
      if(frame){
        const src=frame.getAttribute('src');
        if(src){
          const u=new URL(src,location.href);
          u.searchParams.set('ggRefresh',Date.now().toString());
          frame.src=u.href;
        }else if(frame.contentWindow){
          frame.contentWindow.location.reload();
        }else{
          frame.src=frame.src;
        }
        if(status)status.textContent='🔄 Game iframe refreshed';
        return true;
      }

      const canvas=document.querySelector('#unity-canvas, canvas');
      if(canvas){
        const rect=canvas.getBoundingClientRect();
        const d=devicePixelRatio||1;
        if(rect.width>0&&rect.height>0){
          canvas.width=Math.max(1,Math.round(rect.width*d));
          canvas.height=Math.max(1,Math.round(rect.height*d));
        }
        window.dispatchEvent(new Event('resize'));
        canvas.dispatchEvent(new Event('resize'));
        if(status)status.textContent='🔄 Canvas refreshed';
        return true;
      }

      if(status)status.textContent='⚠️ Game target not found';
      return false;
    }catch(error){
      if(status)status.textContent='❌ Refresh failed';
      console.error('GardenGlitch refresh failed:',error);
      return false;
    }
  };

  const bind=()=>{
    const root=document.getElementById('ggHost')?.shadowRoot;
    const button=root?.querySelector('#canvas');
    if(!button)return false;
    if(button.dataset.ggRefreshBound==='1')return true;
    button.dataset.ggRefreshBound='1';
    button.textContent='🔄 Refresh Game';
    button.onclick=refresh;
    return true;
  };

  bind();
  const watcher=setInterval(()=>bind(),250);
  setTimeout(()=>clearInterval(watcher),30000);

  window.GardenGlitchRefresh={refresh,bind};
})();
