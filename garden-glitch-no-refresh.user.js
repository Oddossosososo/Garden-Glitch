// ==UserScript==
// @name         GardenGlitch No-Refresh Bridge
// @namespace    GardenGlitch
// @version      1.0.0
// @description  Keep GardenGlitch save edits and panel values synchronized without page reloads
// @match        *://*/*
// @grant        none
// ==/UserScript==

(()=>{
  'use strict';
  if(window.GardenGlitchNoRefresh)return;

  const GAME_KEY='3x3-garden.UserDataPackage';
  const EVENT='GardenGlitch:no-refresh-state';

  const read=()=>{
    try{return JSON.parse(localStorage.getItem(GAME_KEY)||'{}')}catch{return {}};
  };
  const write=game=>localStorage.setItem(GAME_KEY,JSON.stringify(game));
  const panel=game=>{
    const root=document.getElementById('ggHost')?.shadowRoot;
    if(!root)return;
    const coins=root.querySelector('#coins');
    const speed=root.querySelector('#speed');
    const char=root.querySelector('#char');
    if(coins&&document.activeElement!==coins&&game.Coins!==undefined)coins.value=String(game.Coins);
    if(speed&&document.activeElement!==speed&&game.AdditionalGrowthSpeedMultiplier!==undefined)speed.value=String(game.AdditionalGrowthSpeedMultiplier);
    if(char&&game.CharacterId!==undefined)char.value=String(game.CharacterId);
  };
  const notify=(reason,game)=>window.dispatchEvent(new CustomEvent(EVENT,{detail:{reason,game,timestamp:Date.now()}}));

  const api={
    key:GAME_KEY,
    eventName:EVENT,
    get:read,
    set(game){write(game||{});panel(game||{});notify('set',game||{});return game||{}},
    patch(patch={}){const game=read();Object.assign(game,patch);write(game);panel(game);notify('patch',game);return game},
    setCoins(value){return this.patch({Coins:Number(value)||0})},
    setGrowthSpeed(value){return this.patch({AdditionalGrowthSpeedMultiplier:Number(value)||0})},
    setCharacter(value){return this.patch({CharacterId:Number(value)||0})},
    unlockCharacter(value){
      const game=read();
      const list=Array.isArray(game.AvailableCharacters)?game.AvailableCharacters:[];
      const id=Number(value)||0;
      if(!list.includes(id))list.push(id);
      game.AvailableCharacters=list;
      write(game);panel(game);notify('unlockCharacter',game);return game;
    },
    onChange(fn){const h=e=>fn(e.detail);window.addEventListener(EVENT,h);return()=>window.removeEventListener(EVENT,h)}
  };

  window.GardenGlitchNoRefresh=api;
  panel(read());
})();
