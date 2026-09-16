// ==UserScript==
// @name         GardenGlitch No-Refresh Bridge
// @namespace    GardenGlitch
// @version      1.1.0
// @description  Keep GardenGlitch save edits and panel values synchronized without page reloads
// @match        *://*/*
// @grant        none
// ==/UserScript==

(()=>{
  'use strict';
  if(window.GardenGlitchNoRefresh)return;

  const GAME_KEY='3x3-garden.UserDataPackage';
  const EVENT='GardenGlitch:no-refresh-state';
  let lastRaw=localStorage.getItem(GAME_KEY)||'{}';
  let applying=false;

  const read=()=>{
    try{return JSON.parse(localStorage.getItem(GAME_KEY)||'{}')}catch{return {}};
  };

  const panel=game=>{
    const root=document.getElementById('ggHost')?.shadowRoot;
    if(!root)return;
    const set=(selector,value)=>{
      const el=root.querySelector(selector);
      if(!el||value===undefined||document.activeElement===el)return;
      if(String(el.value)!==String(value)){
        el.value=String(value);
        el.dispatchEvent(new Event('input',{bubbles:true}));
      }
    };
    set('#coins',game?.Coins);
    set('#speed',game?.AdditionalGrowthSpeedMultiplier);
    set('#char',game?.CharacterId);
  };

  const notify=(reason,game)=>window.dispatchEvent(new CustomEvent(EVENT,{detail:{reason,game,timestamp:Date.now()}}));

  const write=game=>{
    const raw=JSON.stringify(game||{});
    applying=true;
    localStorage.setItem(GAME_KEY,raw);
    lastRaw=raw;
    applying=false;
  };

  const sync=(reason='sync')=>{
    const raw=localStorage.getItem(GAME_KEY)||'{}';
    if(raw===lastRaw)return;
    lastRaw=raw;
    const game=read();
    panel(game);
    notify(reason,game);
  };

  const api={
    key:GAME_KEY,
    eventName:EVENT,
    get:read,
    sync,
    set(game){
      const next=game||{};
      write(next);
      panel(next);
      notify('set',next);
      return next;
    },
    patch(patch={}){
      const game=read();
      Object.assign(game,patch);
      write(game);
      panel(game);
      notify('patch',game);
      return game;
    },
    setCoins(value){return this.patch({Coins:Number(value)||0})},
    setGrowthSpeed(value){return this.patch({AdditionalGrowthSpeedMultiplier:Number(value)||0})},
    setCharacter(value){return this.patch({CharacterId:Number(value)||0})},
    unlockCharacter(value){
      const game=read();
      const list=Array.isArray(game.AvailableCharacters)?game.AvailableCharacters:[];
      const id=Number(value)||0;
      if(!list.includes(id))list.push(id);
      game.AvailableCharacters=list;
      write(game);
      panel(game);
      notify('unlockCharacter',game);
      return game;
    },
    onChange(fn){
      const h=e=>fn(e.detail);
      window.addEventListener(EVENT,h);
      return()=>window.removeEventListener(EVENT,h);
    }
  };

  // Catch changes made by other tabs/windows.
  window.addEventListener('storage',e=>{
    if(e.key===GAME_KEY)sync('storage');
  });

  // Catch same-page localStorage writes and refresh the GardenGlitch UI immediately.
  const originalSetItem=Storage.prototype.setItem;
  Storage.prototype.setItem=function(key,value){
    const result=originalSetItem.apply(this,arguments);
    if(this===localStorage&&key===GAME_KEY&&!applying){
      queueMicrotask(()=>sync('localStorage'));
    }
    return result;
  };

  // Lightweight fallback for game engines that write saves through unusual wrappers.
  setInterval(()=>sync('poll'),500);

  panel(read());
  window.GardenGlitchNoRefresh=api;
})();
