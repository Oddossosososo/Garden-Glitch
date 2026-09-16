// ==UserScript==
// @name         GardenGlitch Dashboard 3.0 Named Plant Lab
// @namespace    GardenGlitch
// @version      1.0.0
// @description  Named Plant Lab upgrade for GardenGlitch Dashboard 3.0
// @match        *://*/*
// @grant        none
// ==/UserScript==

(()=>{
'use strict';
const SAVE='3x3-garden.UserDataPackage';
const PLANT_NAMES=['Carrot','Tomato','Cucumber','Pepper','Cauliflower','Strawberry','Grape','Watermelon','Apple','Pineapple','Banana','Bamboo','Cactus','Mushroom Spore','Flower','Suncorn','Glow Caps','Sunbloom','Frost Bulb'];
const root=()=>document.querySelector('#ggHost')?.shadowRoot;
const read=(k,d)=>{try{return JSON.parse(localStorage.getItem(k)||JSON.stringify(d))}catch{return d}};
const write=(k,v)=>localStorage.setItem(k,JSON.stringify(v));
const nameOf=p=>PLANT_NAMES[Number(p?.PlantId)]||p?.Name||('Plant '+(Number(p?.PlantId)||0));
function add(){
 const r=root(),lab=r?.querySelector('#g3-lab');
 if(!r||!lab)return false;
 if(lab.querySelector('#gg3plantNamed'))return true;
 const old=lab.querySelector('#g3pi');
 old?.remove();
 const select=document.createElement('select');
 select.id='gg3plantNamed';select.className='s';select.style.width='100%';
 const kg=lab.querySelector('#g3kg'),apply=lab.querySelector('#g3apply');
 const info=document.createElement('div');
 info.id='gg3plantInfoNamed';info.className='muted';
 lab.querySelector('.muted')?.insertAdjacentElement('afterend',select);
 select.insertAdjacentElement('afterend',info);
 const render=()=>{
   const s=read(SAVE,{}),p=s.Plants||[],previous=select.value;
   select.innerHTML=p.length?p.map((x,i)=>`<option value="${i}">${nameOf(x)} · slot ${i+1}</option>`).join(''):'<option value="">No plants found</option>';
   if([...select.options].some(o=>o.value===previous))select.value=previous;
   const plant=p[Number(select.value)];
   info.textContent=plant?`Plant ID ${Number(plant.PlantId)||0} · Harvests ${(plant.Harvests||[]).length}`:'Add a plant to use Plant Lab';
 };
 select.onchange=render;
 apply?.addEventListener('click',()=>setTimeout(render,50));
 const timer=setInterval(render,1000);
 setTimeout(()=>clearInterval(timer),30000);
 render();
 return true;
}
if(!add()){const t=setInterval(()=>{if(add())clearInterval(t)},250);setTimeout(()=>clearInterval(t),30000)}
})();
