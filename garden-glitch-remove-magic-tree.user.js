// ==UserScript==
// @name         GardenGlitch Remove Magic Tree Hack
// @namespace    GardenGlitch
// @version      1.0.0
// @description  Removes the Magic Tree hack UI and clears its dedicated save key
// @match        *://*/*
// @grant        none
// ==/UserScript==

(()=>{
  'use strict';

  const MAGIC_KEY='3x3-garden.magicTreeSavedInventoryInfoKey';

  const removeMagicTree=()=>{
    try{localStorage.removeItem(MAGIC_KEY)}catch{}

    const root=document.getElementById('ggHost')?.shadowRoot;
    if(!root)return false;

    const select=root.querySelector('#magic');
    const addButton=root.querySelector('#addm');

    const card=select?.closest('.card');
    if(card)card.remove();

    if(addButton){
      addButton.onclick=null;
      addButton.remove();
    }

    return true;
  };

  const apply=()=>removeMagicTree();

  if(!apply()){
    const watcher=setInterval(()=>{
      if(apply())clearInterval(watcher);
    },100);
    setTimeout(()=>clearInterval(watcher),30000);
  }

  window.GardenGlitchMagicTreeRemoved={removeMagicTree};
})();
