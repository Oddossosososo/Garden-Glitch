// ==UserScript==
// @name         GardenGlitch Terminal Features
// @namespace    GardenGlitch
// @version      1.1.0
// @description  Extra terminal HUD, command history, diagnostics, quick actions and correct animal IDs for GardenGlitch
// @match        *://*/*
// @grant        none
// ==/UserScript==

(()=>{
'use strict';
const ANIMALS=['Chick','Hen','Rooster','Sheep','Pig','Donkey','Duck','Buffalo','Cow'];
const apply=()=>{
 const host=document.getElementById('ggHost'),root=host?.shadowRoot;
 if(!root)return false;
 const body=root.querySelector('#b'),panel=root.querySelector('#p');
 if(!body||!panel)return false;
 if(root.getElementById('gg-terminal-features'))return true;
 const style=document.createElement('style');
 style.id='gg-terminal-features';
 style.textContent=`
 #gg-term-extra{display:grid;grid-template-columns:1fr 1fr;gap:5px;margin:0 0 8px;font:9px Consolas,"Courier New",monospace}
 #gg-term-extra button{padding:6px;background:#000500;color:#72ff91;border:1px solid #00ff4638;border-radius:2px;font:inherit;cursor:pointer}
 #gg-term-extra button:hover{background:#00ff46;color:#001b07}
 #gg-term-history{margin:0 0 8px;padding:5px 7px;max-height:64px;overflow:auto;background:#000300;border:1px solid #00ff4620;color:#45c96c;font:8px/1.4 Consolas,"Courier New",monospace}
 .gg-hist{white-space:nowrap}
 .gg-hist:before{content:"> ";color:#00ff46}
 `;
 root.appendChild(style);
 const fixAnimals=()=>{
  const a=root.querySelector('#animal');
  if(!a)return false;
  const current=a.value;
  const html=ANIMALS.map((name,id)=>`<option value="${id}">${id} • ${name}</option>`).join('');
  if(a.innerHTML!==html)a.innerHTML=html;
  if([...a.options].some(o=>o.value===current))a.value=current;
  else a.value='0';
  return true;
 };
 fixAnimals();
 const animalWatch=new MutationObserver(()=>fixAnimals());
 animalWatch.observe(body,{childList:true,subtree:true});
 let box=root.querySelector('#gg-term-extra');
 if(!box){
  box=document.createElement('div');box.id='gg-term-extra';
  box.innerHTML='<button id="gg-stat">[SYS] STATUS</button><button id="gg-storage">[SYS] STORAGE</button><button id="gg-garden">[RUN] GARDEN</button><button id="gg-inventory">[RUN] INVENTORY</button>';
  const tabs=body.querySelector('.tabs');body.insertBefore(box,tabs||null);
 }
 let history=root.querySelector('#gg-term-history');
 if(!history){history=document.createElement('div');history.id='gg-term-history';body.insertBefore(history,root.querySelector('.tabs')||null)}
 const add=t=>{const x=document.createElement('div');x.className='gg-hist';x.textContent=t;history.appendChild(x);while(history.children.length>8)history.firstChild.remove();history.scrollTop=history.scrollHeight};
 const status=()=>{add(`host=${!!host} panel=${!!panel} online=${navigator.onLine}`)};
 const storage=()=>{let n=0;for(let i=0;i<localStorage.length;i++){let k=localStorage.key(i);if(k)n+=k.length+(localStorage.getItem(k)||'').length}add(`localStorage ~${n.toLocaleString()} chars`)};
 root.querySelector('#gg-stat').onclick=()=>{status();const s=root.querySelector('#st');if(s)s.textContent='[SYS://STATUS] ONLINE'};
 root.querySelector('#gg-storage').onclick=()=>{storage();const s=root.querySelector('#st');if(s)s.textContent='[SYS://STORAGE] SCANNED'};
 root.querySelector('#gg-garden').onclick=()=>{root.querySelector('#ga')?.click();add('garden grow command sent')};
 root.querySelector('#gg-inventory').onclick=()=>{root.querySelector('[data-p="i"]')?.click();add('inventory module opened')};
 const input=root.querySelector('#gg-cmd-input');
 if(input&&!input.dataset.ggHistory){
  input.dataset.ggHistory='1';
  const hist=[];let pos=-1;
  input.addEventListener('keydown',e=>{
   if(e.key==='Enter'){const v=input.value.trim();if(v){hist.push(v);pos=hist.length;add(v)};return}
   if(e.key==='ArrowUp'){if(!hist.length)return;e.preventDefault();pos=Math.max(0,pos-1);input.value=hist[pos]||''}
   if(e.key==='ArrowDown'){if(!hist.length)return;e.preventDefault();pos=Math.min(hist.length,pos+1);input.value=hist[pos]||''}
  });
 }
 add('terminal extensions loaded');
 add('animal IDs locked: 0-8');
 return true;
};
if(!apply()){const t=setInterval(()=>{if(apply())clearInterval(t)},250);setTimeout(()=>clearInterval(t),15000)}
})();
