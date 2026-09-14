// ==UserScript==
// @name         GardenGlitch Live HUD Bridge
// @namespace    GardenGlitch
// @version      1.0.0
// @description  Keep GardenGlitch coin state and panel synchronized without reloads
// @match        *://*/*
// @grant        none
// ==/UserScript==

(()=>{
  'use strict';
  if(window.GardenGlitchLiveHUD)return;

  const KEY='3x3-garden.UserDataPackage';
  const EVENT='GardenGlitch:live-hud';

  const read=()=>{
    try{return JSON.parse(localStorage.getItem(KEY)||'{}')}catch{return {}};
  };

  const write=s=>localStorage.setItem(KEY,JSON.stringify(s||{}));

  const syncPanel=s=>{
    const root=document.getElementById('ggHost')?.shadowRoot;
    if(!root)return;
    const el=root.querySelector('#coins');
    if(el&&s.Coins!==undefined&&document.activeElement!==el)el.value=String(s.Coins);
  };

  const findUnity=()=>[
    window.unityInstance,
    window.gameInstance,
    window.unityGame,
    window.Module?.unityInstance
  ].find(x=>x&&typeof x.SendMessage==='function')||null;

  const tryLiveCoins=value=>{
    const u=findUnity();
    if(!u)return false;
    const hooks=[
      ['GameManager','SetCoins'],
      ['GameManager','SetCoin'],
      ['GameManager','UpdateCoins'],
      ['UIManager','SetCoins'],
      ['HUD','SetCoins']
    ];
    for(const [obj,method] of hooks){
      try{
        u.SendMessage(obj,method,String(value));
        return true;
      }catch{}
    }
    return false;
  };

  const notify=(reason,state)=>window.dispatchEvent(new CustomEvent(EVENT,{detail:{reason,state,timestamp:Date.now()}}));

  window.GardenGlitchLiveHUD={
    key:KEY,
    eventName:EVENT,
    get(){return read()},
    setCoins(value){
      const s=read();
      s.Coins=Number(value)||0;
      write(s);
      syncPanel(s);
      const live=tryLiveCoins(s.Coins);
      notify(live?'coins-live':'coins-save-only',s);
      console.log(live?'✅ Live coin hook sent':'💾 Coins saved; no Unity hook detected',s.Coins);
      return s.Coins;
    },
    patch(values={}){
      const s=read();
      Object.assign(s,values);
      write(s);
      syncPanel(s);
      if(s.Coins!==undefined)tryLiveCoins(s.Coins);
      notify('patch',s);
      return s;
    },
    refresh(){syncPanel(read())},
    onChange(fn){
      const h=e=>fn(e.detail);
      window.addEventListener(EVENT,h);
      return()=>window.removeEventListener(EVENT,h);
    }
  };

  syncPanel(read());
  console.log('✅ GardenGlitch Live HUD Bridge loaded');
})();
