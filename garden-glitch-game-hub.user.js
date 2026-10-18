// ==UserScript==
// @name         GardenGlitch Game Hub
// @namespace    GardenGlitch
// @version      1.0.0
// @description  GardenGlitch tabs for Speed Escape save tools and shared chat
// @match        *://*/*
// @grant        none
// ==/UserScript==

(()=>{
'use strict';
if(window.GardenGlitchGameHub)return;
const SAVE='number-speed-escape';
const BACKUP='nse-speed-backup';
const root=()=>document.querySelector('#ggHost')?.shadowRoot;
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const read=()=>{try{const x=JSON.parse(localStorage.getItem(SAVE)||'null');return x&&typeof x==='object'?x:null}catch{return null}};
const write=s=>localStorage.setItem(SAVE,JSON.stringify(s));
let selected='speed';
function add(){
 const r=root();
 if(!r)return false;
 const nav=r.querySelector('.tabs');
 let escapeTab=r.querySelector('[data-p="escape"]');
 let escapePage=r.querySelector('#pe');
 if(nav&&!escapeTab){
  escapeTab=document.createElement('button');
  escapeTab.className='t';
  escapeTab.dataset.p='escape';
  escapeTab.textContent='🏃 Escape';
  nav.insertBefore(escapeTab,nav.firstChild);
  nav.style.gridTemplateColumns='repeat(7,minmax(0,1fr))';
 }
 if(!escapePage){
  escapePage=document.createElement('section');
  escapePage.className='pg';
  escapePage.id='pe';
  const firstPage=r.querySelector('#pd');
  if(firstPage?.parentElement)firstPage.parentElement.insertBefore(escapePage,firstPage);
 }
 if(!nav||!escapeTab||!escapePage)return false;
 escapeTab.onclick=()=>{
  r.querySelectorAll('.t').forEach(x=>x.classList.remove('on'));
  r.querySelectorAll('.pg').forEach(x=>x.classList.remove('on'));
  escapeTab.classList.add('on');
  escapePage.classList.add('on');
 };
 const dash=escapePage;
 if(r.querySelector('#ggGameHub'))return true;
 const card=document.createElement('section');
 card.id='ggGameHub';card.className='card';
 card.innerHTML=`
 <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap">
  <b style="font-size:16px">🎮 Game Hub</b><span class="muted">GardenGlitch</span>
 </div>
 <div style="display:flex;gap:6px;flex-wrap:wrap;margin:9px 0">
  <button class="q" data-tab="speed">⚡ Speed Escape</button>
  <button class="q" data-tab="chat">💬 Chat</button>
 </div>
 <div id="ggh-speed">
  <div class="muted" id="ggh-source">Looking for Speed Escape save…</div>
  <div id="ggh-stats" style="display:grid;grid-template-columns:1fr 1fr;gap:7px;margin:8px 0"></div>
  <details style="margin:8px 0" open><summary>Edit save fields (JSON)</summary>
   <div class="muted" style="margin:6px 0">Edit any field, including treadmill/speed info. Back up first. Values must be valid JSON, e.g. 123, true, "text", or {"example":1}.</div>
   <input class="i" id="ggh-filter" placeholder="Filter fields…" style="width:100%;margin:7px 0">
   <div id="ggh-fields" style="max-height:360px;overflow:auto"></div>
   <div style="display:grid;grid-template-columns:1fr 1fr;gap:5px;margin-top:8px">
    <input class="i" id="ggh-new-key" placeholder="New field name">
    <input class="i" id="ggh-new-value" value="null" placeholder="JSON value">
    <button class="q" id="ggh-add-field" style="grid-column:1/-1">＋ Add field</button>
   </div>
  </details>
  <div style="display:flex;gap:6px;flex-wrap:wrap">
   <button class="q" id="ggh-refresh">Refresh</button>
   <button class="q" id="ggh-export">Export backup</button>
   <button class="q" id="ggh-import-btn">Import backup</button>
   <input id="ggh-import" type="file" accept="application/json" hidden>
  </div>
  <div class="muted" id="ggh-status" style="margin-top:7px">Read-only until you choose to import a backup.</div>
 </div>
 <div id="ggh-chat" style="display:none"><div class="muted">GardenGlitch shared chat</div><div id="ggh-chat-slot"></div></div>`;
 dash.appendChild(card);
 const speed=card.querySelector('#ggh-speed'),chat=card.querySelector('#ggh-chat');
 const status=card.querySelector('#ggh-status');
 function show(tab){
  selected=tab;speed.style.display=tab==='speed'?'block':'none';chat.style.display=tab==='chat'?'block':'none';
  card.querySelectorAll('[data-tab]').forEach(b=>{b.style.outline=b.dataset.tab===tab?'1px solid #a855f7':'';});
  if(tab==='chat')moveChat();
 }
 card.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>show(b.dataset.tab));
 function render(){
  const s=read(),backup=localStorage.getItem(BACKUP);
  const src=card.querySelector('#ggh-source');
  if(!s){
   src.textContent=backup?'Active save key not found; backup key exists.':'No active number-speed-escape save found in this origin.';
   card.querySelector('#ggh-stats').innerHTML='';
   card.querySelector('#ggh-fields').textContent='';
   return;
  }
  src.textContent='Active local save found · '+Object.keys(s).length+' top-level fields. Local data only; server sync is not confirmed.';
  const stats=[['Speed',s.speed],['Wins',s.wins],['Rebirths',s.rebirths],['Level',s.level],['Hearts',s.hearts],['World',s.currentWorldId],['Steps',s.steps],['Diamonds',s.diamonds]];
  card.querySelector('#ggh-stats').innerHTML=stats.map(([k,v])=>`<div style="padding:9px;background:#080d19;border:1px solid #a855f733;border-radius:8px"><div class="muted">${esc(k)}</div><b style="overflow-wrap:anywhere">${esc(v??'—')}</b></div>`).join('');
  const filter=(card.querySelector('#ggh-filter').value||'').toLowerCase();
  const fields=card.querySelector('#ggh-fields');
  fields.innerHTML=Object.entries(s).filter(([k,v])=>(k+' '+JSON.stringify(v)).toLowerCase().includes(filter)).map(([k,v])=>`<div style="padding:7px 0;border-bottom:1px solid #ffffff18">
   <b>${esc(k)}</b>
   <textarea class="i" data-value-for="${esc(k)}" rows="2" style="width:100%;margin:4px 0;resize:vertical">${esc(JSON.stringify(v))}</textarea>
   <div style="display:flex;gap:5px"><button class="q" data-save-field="${esc(k)}">Save field</button><button class="q" data-delete-field="${esc(k)}">Delete field</button></div>
  </div>`).join('')||'<div class="muted">No matching fields.</div>';
  fields.querySelectorAll('[data-save-field]').forEach(btn=>btn.onclick=()=>{
   const key=btn.dataset.saveField,area=fields.querySelector('[data-value-for="'+CSS.escape(key)+'"]');
   try{const value=JSON.parse(area.value),fresh=read();if(!fresh)throw Error('Save not found');fresh[key]=value;write(fresh);render();status.textContent='Saved "'+key+'" to this origin’s localStorage. Server sync is not guaranteed.';}
   catch(err){status.textContent='Could not save field: '+err.message;}
  });
  fields.querySelectorAll('[data-delete-field]').forEach(btn=>btn.onclick=()=>{
   const key=btn.dataset.deleteField;
   if(!confirm('Delete local save field "'+key+'"? Export a backup first if needed.'))return;
   const fresh=read();if(!fresh)return;delete fresh[key];write(fresh);render();status.textContent='Deleted "'+key+'" from the local save.';
  });
 }
 function moveChat(){
  const c=root()?.querySelector('#ggChatCard'),slot=card.querySelector('#ggh-chat-slot');
  if(c&&slot&&c.parentElement!==slot){c.style.marginTop='0';slot.appendChild(c);}
 }
 card.querySelector('#ggh-refresh').onclick=()=>{render();status.textContent='Refreshed. No changes made.'};
 card.querySelector('#ggh-filter').addEventListener('input',render);
 card.querySelector('#ggh-export').onclick=()=>{
  const s=localStorage.getItem(SAVE);
  if(!s){status.textContent='No active save to export.';return;}
  const a=document.createElement('a'),url=URL.createObjectURL(new Blob([s],{type:'application/json'}));
  a.href=url;a.download='speed-escape-backup.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  status.textContent='Backup exported.';
 };
 card.querySelector('#ggh-add-field').onclick=()=>{
  const key=card.querySelector('#ggh-new-key').value.trim(),raw=card.querySelector('#ggh-new-value').value;
  if(!key){status.textContent='Enter a field name.';return;}
  let value;try{value=JSON.parse(raw)}catch{status.textContent='Value must be valid JSON.';return;}
  const fresh=read();if(!fresh){status.textContent='No active save found.';return;}
  if(Object.prototype.hasOwnProperty.call(fresh,key)&&!confirm('Field already exists. Replace it?'))return;
  fresh[key]=value;write(fresh);card.querySelector('#ggh-new-key').value='';render();status.textContent='Field "'+key+'" saved locally.';
 };
 card.querySelector('#ggh-import-btn').onclick=()=>card.querySelector('#ggh-import').click();
 card.querySelector('#ggh-import').onchange=async e=>{
  const f=e.target.files?.[0];if(!f)return;
  try{
   const parsed=JSON.parse(await f.text());
   if(!parsed||typeof parsed!=='object'||Array.isArray(parsed))throw Error('Expected a JSON save object.');
   if(!confirm('Replace the active local Speed Escape save with this file? Export a backup first if needed.'))return;
   write(parsed);render();status.textContent='Imported into localStorage. Reload the game if needed; server sync is not guaranteed.';
  }catch(err){status.textContent='Import failed: '+err.message;}
  finally{e.target.value='';}
 };
 const moveTimer=setInterval(()=>{moveChat();if(root()?.querySelector('#ggChatCard')?.parentElement===card.querySelector('#ggh-chat-slot'))clearInterval(moveTimer)},500);
 setTimeout(()=>clearInterval(moveTimer),30000);
 render();show('speed');
 return true;
}
window.GardenGlitchGameHub={refresh:()=>{const r=root();r?.querySelector('#ggh-refresh')?.click()},show:tab=>root()?.querySelector('[data-tab="'+tab+'"]')?.click()};
if(!add()){const t=setInterval(()=>{if(add())clearInterval(t)},250);setTimeout(()=>clearInterval(t),30000)}
})();