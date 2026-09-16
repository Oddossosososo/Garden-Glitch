// ==UserScript==
// @name         GardenGlitch Dashboard 3.0
// @namespace    GardenGlitch
// @version      1.0.0
// @description  GardenGlitch feature hub, stats, save profiles, themes, achievements and web hub
// @match        *://*/*
// @grant        none
// ==/UserScript==

(()=>{
'use strict';
const SAVE='3x3-garden.UserDataPackage',PROFILES='GardenGlitch.LocalProfiles',THEME='GardenGlitch.Theme',ACH='GardenGlitch.Achievements';
const root=()=>document.querySelector('#ggHost')?.shadowRoot;
const read=(k,d)=>{try{return JSON.parse(localStorage.getItem(k)||JSON.stringify(d))}catch{return d}};
const write=(k,v)=>localStorage.setItem(k,JSON.stringify(v));
const esc=s=>String(s).replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c]));

function add(){
 const r=root(),dash=r?.querySelector('#pd'); if(!r||!dash)return false;
 if(r.querySelector('#gg3'))return true;
 const c=document.createElement('div');c.id='gg3';c.className='card';
 c.innerHTML=`<b>🚀 GardenGlitch 3.0</b><div class="muted">Expansion Hub</div><div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:7px">
 <button class="q" data-g3="stats">📊 Stats</button><button class="q" data-g3="lab">🧬 Plant Lab</button>
 <button class="q" data-g3="save">💾 Save Profiles</button><button class="q" data-g3="theme">🎨 Themes</button>
 <button class="q" data-g3="ach">🏆 Achievements</button><button class="q" data-g3="web">🌐 Web Hub</button>
 <button class="q" data-g3="tools">🛠️ Tools</button><button class="q" data-g3="events">🔔 Events</button></div>`;
 dash.appendChild(c);
 const sec=(id,title,html)=>{const x=document.createElement('div');x.id='g3-'+id;x.className='card';x.style.display='none';x.innerHTML=`<b>${title}</b><div style="margin-top:7px">${html}</div>`;dash.appendChild(x);return x};
 const stats=sec('stats','📊 Live Stats','<div id="g3stats"></div>');
 const lab=sec('lab','🧬 Plant Lab','<div class="muted">Safely edit a selected plant\'s first harvest size.</div><div style="display:grid;gap:6px;margin-top:6px"><input class="i" id="g3pi" type="number" min="0" value="0" placeholder="Plant index"><input class="i" id="g3kg" type="number" min="0" step="0.01" value="10" placeholder="KG"><button class="q" id="g3apply">Apply KG</button></div>');
 const save=sec('save','💾 Save Profiles','<input class="i" id="g3name" maxlength="24" placeholder="Profile name"><div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:6px"><button class="q" id="g3save">Save</button><button class="q" id="g3restore">Restore</button></div><select class="s" id="g3profiles" style="width:100%;margin-top:6px"></select>');
 const theme=sec('theme','🎨 Theme Manager','<select class="s" id="g3theme" style="width:100%"><option value="default">Default</option><option value="neon">Neon</option><option value="matrix">Matrix</option><option value="ice">Ice</option><option value="galaxy">Galaxy</option><option value="pink">Pink</option></select><button class="q" id="g3themego" style="width:100%;margin-top:6px">Apply</button>');
 const ach=sec('ach','🏆 Achievements','<div id="g3ach"></div>');
 const web=sec('web','🌐 GardenGlitch Web Hub','<div style="display:grid;gap:6px"><button class="q g3url" data-u="https://github.com/Oddossosososo/Garden-Glitch">💻 GitHub</button><button class="q g3url" data-u="https://github.com/Oddossosososo/Garden-Glitch/issues">🐛 Issues / Ideas</button><button class="q g3url" data-u="https://github.com/Oddossosososo/Garden-Glitch/commits/main">📜 Changelog</button><button class="q g3url" data-u="https://github.com/Oddossosososo/Garden-Glitch/tree/main">📁 Project Files</button></div>');
 const tools=sec('tools','🛠️ Quick Tools','<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px"><button class="q" id="g3grow">⚡ Grow All</button><button class="q" id="g3garden">🌱 Garden Tab</button><button class="q" id="g3inv">📦 Inventory Tab</button><button class="q" id="g3animals">🐄 Animals Tab</button></div>');
 sec('events','🔔 Event Center','<div style="padding:8px;border:1px solid #00ffff22;border-radius:8px;background:#00ffff08">🌱 GardenGlitch 3.0 is live.<br><span class="muted">Use Web Hub for the project pages.</span></div>');

 const game=()=>read(SAVE,{}); const profiles=read(PROFILES,{});
 const refresh=()=>{const s=game(),p=s.Plants||[],a=s.Animals||[],hs=p.reduce((n,x)=>n+(x.Harvests?.length||0),0),se=s.InventorySeeds?.length||0;stats.querySelector('#g3stats').innerHTML=`💰 Coins: <b>${esc(s.Coins??0)}</b><br>🌱 Plants: <b>${p.length}</b><br>🧺 Harvest records: <b>${hs}</b><br>🐄 Animals: <b>${a.length}</b><br>🌾 Seed entries: <b>${se}</b>`};
 const refreshProfiles=()=>{save.querySelector('#g3profiles').innerHTML=Object.keys(profiles).map(x=>`<option>${esc(x)}</option>`).join('')};
 const refreshAch=()=>{const s=game(),p=s.Plants||[],a=s.Animals||[],list=[['🌱 First Plant',p.length>=1],['🌿 Ten Plants',p.length>=10],['🐄 Animal Collector',a.length>=10],['💰 Millionaire',Number(s.Coins||0)>=1e6]];ach.querySelector('#g3ach').innerHTML=list.map(x=>`${x[1]?'✅':'⬜'} ${x[0]}`).join('<br>');write(ACH,Object.fromEntries(list.map((x,i)=>['a'+i,x[1]])))};
 const applyTheme=()=>{const m={default:['#090b18','#1d082a','#19eaff'],neon:['#020b08','#041c12','#00ff66'],matrix:['#000800','#001400','#39ff14'],ice:['#06101a','#0b2338','#7ddcff'],galaxy:['#080317','#17052d','#b56cff'],pink:['#16050d','#26091a','#ff78bd']},v=m[theme.querySelector('#g3theme').value]||m.default;r.host.style.setProperty('--gg-addon-bg',v[0]);r.host.style.setProperty('--gg-addon-panel',v[1]);r.host.style.setProperty('--gg-addon-accent',v[2]);write(THEME,theme.querySelector('#g3theme').value)};
 c.querySelectorAll('[data-g3]').forEach(b=>b.onclick=()=>{const x=r.querySelector('#g3-'+b.dataset.g3);if(x)x.style.display=x.style.display==='none'?'block':'none';refresh();refreshAch();refreshProfiles()});
 r.querySelectorAll('.g3url').forEach(b=>b.onclick=()=>window.open(b.dataset.u,'_blank','noopener'));
 tools.querySelector('#g3grow').onclick=()=>r.querySelector('#ga')?.click();tools.querySelector('#g3garden').onclick=()=>r.querySelector('[data-p="g"]')?.click();tools.querySelector('#g3inv').onclick=()=>r.querySelector('[data-p="i"]')?.click();tools.querySelector('#g3animals').onclick=()=>r.querySelector('[data-p="a"]')?.click();
 lab.querySelector('#g3apply').onclick=()=>{const s=game(),i=Math.max(0,+lab.querySelector('#g3pi').value||0),kg=Math.max(0,+lab.querySelector('#g3kg').value||0),p=s.Plants?.[i];if(!p)return;p.Harvests=p.Harvests||[];p.Harvests[0]=p.Harvests[0]||{};p.Harvests[0].GrowthSize=kg;write(SAVE,s);refresh();};
 save.querySelector('#g3save').onclick=()=>{const n=(save.querySelector('#g3name').value.trim()||'Profile '+(Object.keys(profiles).length+1)).slice(0,24);profiles[n]=game();write(PROFILES,profiles);refreshProfiles()};
 save.querySelector('#g3restore').onclick=()=>{const n=save.querySelector('#g3profiles').value;if(profiles[n]){write(SAVE,profiles[n]);location.reload()}};
 theme.querySelector('#g3themego').onclick=applyTheme;theme.querySelector('#g3theme').value=read(THEME,'default');refresh();refreshAch();refreshProfiles();return true;
}
if(!add()){const t=setInterval(()=>{if(add())clearInterval(t)},250);setTimeout(()=>clearInterval(t),30000)}
})();
