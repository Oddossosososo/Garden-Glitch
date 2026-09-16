// ==UserScript==
// @name         GardenGlitch Admin Tools
// @namespace    GardenGlitch
// @version      1.0.0
// @description  GardenGlitch local save tools for seeds, crops, Carpenter items and coins
// @match        *://*/*
// @grant        none
// ==/UserScript==

(()=>{
  'use strict';
  if(window.GardenGlitchAdminTools)return;

  const KEY='3x3-garden.UserDataPackage';
  const load=()=>{
    const raw=localStorage.getItem(KEY);
    if(!raw){ alert('3x3 Garden save not found.'); return null; }
    try{return JSON.parse(raw)}catch(e){ alert('Save data is not valid JSON.'); return null; }
  };
  const save=data=>localStorage.setItem(KEY,JSON.stringify(data));
  const clone=x=>JSON.parse(JSON.stringify(x));
  const grow=p=>{
    p.PlantSize=1.15;
    p.GrowTimer=-999999;
    if(Array.isArray(p.Harvests)) p.Harvests.forEach(h=>{
      h.GrowTimer=-999999;
      h.BreakBeforeGrowTimer=0;
      if(!h.GrowthSize||h.GrowthSize<1)h.GrowthSize=1.15;
    });
  };

  const giveSeeds=id=>{
    const d=load(); if(!d)return;
    if(!Array.isArray(d.InventorySeeds))d.InventorySeeds=[];
    for(let i=0;i<999;i++)d.InventorySeeds.push(id);
    d.InventorySeeds=d.InventorySeeds.slice(-18000);
    save(d); alert(`Seed ${id} added x999.`);
  };

  const allSeeds=()=>{
    const d=load(); if(!d)return;
    d.InventorySeeds=[];
    for(let id=1;id<=18;id++)for(let n=0;n<999;n++)d.InventorySeeds.push(id);
    save(d); alert('ALL 18 SEEDS x999.');
  };

  const demolishSeeds=()=>{
    const d=load(); if(!d)return;
    const amount=Array.isArray(d.InventorySeeds)?d.InventorySeeds.length:0;
    d.InventorySeeds=[]; save(d);
    alert(`INVENTORY SEEDS DEMOLISHED.\n\nRemoved: ${amount}`);
  };

  const carpenter=()=>{
    const d=load(); if(!d)return;
    d.FarmItems=[0,1,2,3,4,5,6,7,8];
    save(d); alert('ALL CARPENTER ITEMS UNLOCKED.');
  };

  const coins=()=>{
    const d=load(); if(!d)return;
    d.Coins=1000000000; save(d); alert('1,000,000,000 COINS.');
  };

  const readyAll=()=>{
    const d=load();
    if(!d||!Array.isArray(d.Plants)){alert('Plants array not found.');return;}
    d.Plants.forEach(p=>{if(p&&p.PlantId>0)grow(p)});
    save(d); alert('ALL EXISTING CROPS ARE FULLY GROWN.');
  };

  const plantAll=()=>{
    const d=load();
    if(!d||!Array.isArray(d.Plants)){alert('Plants array not found.');return;}
    const templates=d.Plants.filter(p=>p&&Number(p.PlantId)>0&&p.PlantPosition&&Array.isArray(p.Harvests));
    if(!templates.length){alert('No real plant template exists in the save.');return;}
    const positions=[];
    templates.forEach(p=>{
      const q=p.PlantPosition;
      const duplicate=positions.some(x=>Math.abs(x.x-q.x)<0.001&&Math.abs(x.y-q.y)<0.001&&Math.abs(x.z-q.z)<0.001);
      if(!duplicate)positions.push({x:q.x,y:q.y,z:q.z});
    });
    let made=0;
    for(let i=0;i<d.Plants.length&&made<18;i++){
      const slot=d.Plants[i];
      if(!slot)continue;
      const isEmpty=Number(slot.PlantId)===0;
      if(!isEmpty)continue;
      const template=templates[made%templates.length];
      const p=clone(template);
      p.PlantId=made+1;
      p.FarmId=template.FarmId;
      const pos=positions[made%positions.length];
      p.PlantPosition={x:pos.x,y:pos.y,z:pos.z};
      p.PlantRotation={x:0,y:(made*37)%360,z:0};
      grow(p);
      d.Plants[i]=p;
      made++;
    }
    if(made<18){
      for(let i=0;i<d.Plants.length&&made<18;i++){
        const base=clone(templates[made%templates.length]);
        const pos=positions[made%positions.length];
        base.PlantId=made+1;
        base.PlantPosition={x:pos.x,y:pos.y,z:pos.z};
        base.PlantRotation={x:0,y:(made*37)%360,z:0};
        grow(base); d.Plants[i]=base; made++;
      }
    }
    save(d); alert(`PLANT ALL FINISHED.\n\n${made} crop IDs written to the save.`);
  };

  const api={giveSeeds,allSeeds,demolishSeeds,carpenter,coins,readyAll,plantAll};
  window.GardenGlitchAdminTools=api;

  function add(){
    const root=document.querySelector('#ggHost')?.shadowRoot;
    const dash=root?.querySelector('#pd');
    if(!root||!dash)return false;
    if(root.querySelector('#ggAdminToolsCard'))return true;

    const box=document.createElement('div');
    box.id='ggAdminToolsCard'; box.className='card';
    box.innerHTML=`<div style="display:flex;justify-content:space-between;align-items:center;gap:8px"><b>🛠️ GardenGlitch Admin Tools</b><span class="muted">local save</span></div><div style="display:grid;gap:6px;margin-top:8px"></div>`;
    const controls=box.lastElementChild;
    const button=(text,fn)=>{
      const b=document.createElement('button');
      b.textContent=text;
      b.style.cssText='display:block;width:100%;padding:9px;border:1px solid #00ff66;border-radius:7px;background:#050505;color:#00ff66;font-weight:bold;cursor:pointer';
      b.onclick=()=>{try{fn()}catch(e){console.error('GardenGlitch admin tool failed',e);alert('Tool failed. Check the console.')}};
      controls.appendChild(b);
    };

    button('PLANT ALL 18 CROPS',plantAll);
    button('READY ALL CROPS',readyAll);
    button('ALL 18 SEEDS x999',allSeeds);
    button('DEMOLISH INVENTORY SEEDS',demolishSeeds);
    button('ALL CARPENTER ITEMS',carpenter);
    button('1 BILLION COINS',coins);

    const label=document.createElement('div');
    label.textContent='SEEDS';
    label.style.cssText='margin-top:8px;color:#00ff66;font-weight:bold;text-align:center';
    controls.appendChild(label);
    for(let id=1;id<=18;id++)button(`SEED ${id} x999`,()=>giveSeeds(id));

    dash.appendChild(box);
    return true;
  }

  if(!add()){
    const t=setInterval(()=>{if(add())clearInterval(t)},250);
    setTimeout(()=>clearInterval(t),30000);
  }
})();
