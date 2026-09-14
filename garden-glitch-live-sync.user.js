// ==UserScript==
// @name         GardenGlitch Live LocalStorage Sync
// @namespace    GardenGlitch
// @version      1.0.1
// @description  Broadcast GardenGlitch localStorage changes immediately without page refreshes
// @match        *://*/*
// @grant        none
// ==/UserScript==

(()=>{
  'use strict';
  const EVENTS='GardenGlitch:storage-change';
  const keys=new Set([
    '3x3-garden.UserDataPackage',
    'GardenGlitch_PlayerHookTest',
    'GardenGlitch_LocalBackup'
  ]);

  if(window.__GardenGlitchLiveSyncInstalled)return;
  window.__GardenGlitchLiveSyncInstalled=true;

  const originalSetItem=Storage.prototype.setItem;
  const originalRemoveItem=Storage.prototype.removeItem;

  Storage.prototype.setItem=function(key,value){
    const oldValue=this.getItem(key);
    originalSetItem.call(this,key,String(value));
    if(keys.has(key)){
      window.dispatchEvent(new CustomEvent(EVENTS,{detail:{key,oldValue,newValue:String(value)}}));
    }
  };

  Storage.prototype.removeItem=function(key){
    const oldValue=this.getItem(key);
    originalRemoveItem.call(this,key);
    if(keys.has(key)){
      window.dispatchEvent(new CustomEvent(EVENTS,{detail:{key,oldValue,newValue:null}}));
    }
  };

  window.addEventListener(EVENTS,e=>{
    const d=e.detail||{};
    window.postMessage({type:'GardenGlitchLiveSync',...d},'*');
  });

  window.GardenGlitchLiveSync={
    eventName:EVENTS,
    read(key){return localStorage.getItem(key)},
    write(key,value){localStorage.setItem(key,value)},
    remove(key){localStorage.removeItem(key)},
    on(callback){
      const fn=e=>callback(e.detail);
      window.addEventListener(EVENTS,fn);
      return ()=>window.removeEventListener(EVENTS,fn);
    }
  };
})();
