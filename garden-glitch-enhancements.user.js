// ==UserScript==
// @name         GardenGlitch Enhancements
// @namespace    GardenGlitch
// @version      1.0.0
// @description  Farm stats, animal manager, save inspector, and robust Grow All
// @match        *://*/*
// @grant        none
// ==/UserScript==

(()=>{
  'use strict';

  const GAME_KEY='3x3-garden.UserDataPackage';
  const ANIMAL_NAMES=['Chick','Hen','Rooster','Sheep','Pig','Donkey','Duck','Buffalo','Cow'];

  const getRoot=()=>document.getElementById('ggHost')?.shadowRoot||null;
  const readGame=()=>{
    try{return JSON.parse(localStorage.getItem(GAME_KEY)||'{}')}catch{return {}}
  };
  const writeGame=s=>localStorage.setItem(GAME_KEY,JSON.stringify(s));

  function growAllRobust(){
    const s=readGame();
    if(!Array.isArray(s.Plants)||!s.Plants.length){
      setStatus('⚠️ No plants found in game save');
      return false;
    }

    let plants=0,harvests=0;
    for(const p of s.Plants){
      if(!p||typeof p!=='object')continue;
      plants++;
      if('GrowTimer' in p)p.GrowTimer=0;
      if('BreakBeforeGrowTimer' in p)p.BreakBeforeGrowTimer=0;
      if('GrowTimeDefault' in p)p.GrowTimeDefault=0;

      if(Array.isArray(p.Harvests)){
        for(const h of p.Harvests){
          if(!h||typeof h!=='object')continue;
          harvests++;
          if('GrowTimer' in h)h.GrowTimer=0;
          if('BreakBeforeGrowTimer' in h)h.BreakBeforeGrowTimer=0;
          if('GrowTimeDefault' in h)h.GrowTimeDefault=0;
        }
      }
    }

    writeGame(s);
    setStatus(`⚡ Grow All fixed • ${plants} plants • ${harvests} harvest slots`);
    setTimeout(()=>{
      try{window.GardenGlitchRefresh?.refresh?.()}catch{}
    },150);
    return true;
  }

  function setStatus(text){
    const root=getRoot();
    const st=root?.querySelector('#st');
    if(st)st.textContent=text;
  }

  function totalHarvestKg(s){
    let n=0;
    for(const p of (s.Plants||[])){
      for(const h of (p?.Harvests||[]))n+=Number(h?.GrowthSize)||0;
    }
    for(const h of (s.InventoryHarvests||[]))n+=(Number(h?.Value)||0)/100;
    return n;
  }

  function animalCounts(s){
    const out=Array(9).fill(0);
    for(const a of (s.Animals||[])){
      const id=Number(a?.TypeId);
      if(Number.isInteger(id)&&id>=0&&id<out.length)out[id]++;
    }
    return out;
  }

  function seedCounts(s){
    const out=Object.create(null);
    for(const id of (s.InventorySeeds||[])){
      const n=Number(id);
      out[n]=(out[n]||0)+1;
    }
    return out;
  }

  function buildEnhancements(){
    const root=getRoot();
    if(!root)return false;
    if(root.querySelector('#ggEnhancements'))return true;

    const dashboard=root.querySelector('#pd');
    const animals=root.querySelector('#pa');
    if(!dashboard)return false;

    const card=document.createElement('div');
    card.className='card';
    card.id='ggEnhancements';
    card.innerHTML=`<b>🧠 Farm Control Center</b>
      <div id="ggStats" class="muted" style="margin:6px 0;line-height:1.55"></div>
      <div class="grid">
        <button id="ggGrowFix" class="q">⚡ Fix Grow All</button>
        <button id="ggStatsRefresh" class="q">📊 Refresh Stats</button>
      </div>`;
    dashboard.insertBefore(card,dashboard.children[dashboard.children.length-1]||null);

    root.querySelector('#ggGrowFix').onclick=growAllRobust;
    root.querySelector('#ggStatsRefresh').onclick=renderStats;

    if(animals){
      const ac=document.createElement('div');
      ac.className='card';
      ac.id='ggAnimalManager';
      ac.innerHTML=`<b>🐾 Animal Manager</b><div id="ggAnimalStats" class="muted" style="margin:6px 0;line-height:1.5"></div>`;
      animals.appendChild(ac);
    }

    return true;
  }

  function renderStats(){
    const root=getRoot();
    if(!root)return;
    const s=readGame();
    const counts=animalCounts(s);
    const seeds=seedCounts(s);
    const animalTotal=counts.reduce((a,b)=>a+b,0);
    const plantTotal=Array.isArray(s.Plants)?s.Plants.length:0;
    const seedTotal=Array.isArray(s.InventorySeeds)?s.InventorySeeds.length:0;
    const harvestSlots=(s.Plants||[]).reduce((n,p)=>n+(Array.isArray(p?.Harvests)?p.Harvests.length:0),0);
    const kg=totalHarvestKg(s);
    const stats=root.querySelector('#ggStats');
    if(stats)stats.innerHTML=`💰 Coins: <b>${Number(s.Coins)||0}</b><br>🌿 Plants: <b>${plantTotal}</b> • 🧺 Harvest slots: <b>${harvestSlots}</b><br>🐾 Animals: <b>${animalTotal}</b> • 🌱 Seeds: <b>${seedTotal}</b><br>⚖️ Total harvest KG: <b>${kg.toFixed(2)}</b>`;
    const ast=root.querySelector('#ggAnimalStats');
    if(ast){
      ast.innerHTML=ANIMAL_NAMES.map((name,id)=>`${id} • ${name}: <b>${counts[id]}</b>`).join('<br>');
    }
    void seeds;
  }

  function install(){
    if(!buildEnhancements())return false;
    const root=getRoot();
    const grow=root?.querySelector('#grow');
    const ga=root?.querySelector('#ga');
    if(grow)grow.onclick=growAllRobust;
    if(ga)ga.onclick=growAllRobust;
    renderStats();
    return true;
  }

  if(!install()){
    const timer=setInterval(()=>{if(install())clearInterval(timer)},250);
    setTimeout(()=>clearInterval(timer),30000);
  }
})();
