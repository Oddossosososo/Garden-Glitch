// ==UserScript==
// @name         GardenGlitch Game Hub
// @namespace    GardenGlitch
// @version      1.0.1
// @description  GardenGlitch tabs for Speed Escape save tools and shared chat
// @match        *://*/*
// @grant        none
// ==/UserScript==

(()=>{
'use strict';
if(window.GardenGlitchGameHub)return;
const SAVE='number-speed-escape';
const BACKUP='nse-speed-backup';
const SAVE_KEYS=[SAVE,'number-speed-escape-account-meta','number-speed-escape-shared-speed-v1',BACKUP];
let selectedSaveKey=SAVE;
const root=()=>document.querySelector('#ggHost')?.shadowRoot;
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const read=(key=selectedSaveKey)=>{try{const raw=localStorage.getItem(key);if(raw===null)return null;const x=JSON.parse(raw);return x&&typeof x==='object'&&!Array.isArray(x)?x:{value:x}}catch{return null}};
const write=(s,key=selectedSaveKey)=>{const raw=localStorage.getItem(key);if(raw!==null){try{const prior=JSON.parse(raw);if(prior===null||typeof prior!=='object'){localStorage.setItem(key,JSON.stringify(Object.keys(s).length===1&&Object.prototype.hasOwnProperty.call(s,'value')?s.value:s));return}}catch{if(Object.keys(s).length===1&&Object.prototype.hasOwnProperty.call(s,'value')&&typeof s.value==='string'){localStorage.setItem(key,s.value);return}}}localStorage.setItem(key,JSON.stringify(s))};
const GAME_FIELDS=new Set(['speed','customSpeedRatio','wins','rebirths','level','hearts','currentWorldId','steps','diamonds','playerName','speedPads','selectedSpeedPad','selectedSpeedPads','equippedTrail','ownedTrails','equippedSkin','skinPreset','customParts','keyboardSoundTheme','outlineColor','dailyReward','recovery','adaptiveMultiplication']);
const syncIndexedDBSave=(save)=>new Promise(resolve=>{
 let settled=false;const done=n=>{if(!settled){settled=true;resolve(n)}};
 let request;
 try{request=indexedDB.open('number-speed-escape-storage')}catch{return done(0)}
 request.onerror=()=>done(0);
 request.onsuccess=()=>{
  const db=request.result;
  if(!db.objectStoreNames.contains('progress')){db.close();return done(0)}
  let tx,count=0;
  try{
   tx=db.transaction('progress','readwrite');
   const store=tx.objectStore('progress');
   const get=store.getAll();
   get.onsuccess=()=>{
    for(const record of get.result||[]){
     if(!record||typeof record!=='object'||Array.isArray(record))continue;
     const merged={...record,...save};
     try{if(store.keyPath===null)store.put(merged,'number-speed-escape');else store.put(merged);count++}catch(err){console.warn('GardenGlitch: could not update IndexedDB record',err)}
    }
   };
   tx.oncomplete=()=>{db.close();done(count)};
   tx.onerror=tx.onabort=()=>{db.close();done(0)};
  }catch(err){try{db.close()}catch{};done(0)}
 };
});
// Bridge edits into embedded Timestables game frames (each origin has separate storage).
const isTimestablesHost = h => /(^|\\.)timestables\\.com$/i.test(h);
const sendSaveToGameFrames = save => {
  for (const frame of document.querySelectorAll('iframe')) {
    try {
      const url = new URL(frame.src, location.href);
      if (isTimestablesHost(url.hostname)) frame.contentWindow?.postMessage({type:'GardenGlitchSpeedEscapeApply', save}, url.origin);
    } catch {}
  }
};
window.addEventListener('message', async event => {
  if (event.source !== window.parent || !isTimestablesHost(location.hostname) || !isTimestablesHost(event.origin)) return;
  const data = event.data;
  if (!data || data.type !== 'GardenGlitchSpeedEscapeApply' || !data.save || typeof data.save !== 'object' || Array.isArray(data.save)) return;
  try {
    const merged = {...(read(SAVE) || {})};
    for (const key of GAME_FIELDS) if (Object.prototype.hasOwnProperty.call(data.save, key)) merged[key] = data.save[key];
    write(merged, SAVE);
    await syncIndexedDBSave(merged);
    console.info('GardenGlitch: applied Speed Escape save inside game frame; reloading.');
    setTimeout(() => location.reload(), 250);
  } catch (err) { console.warn('GardenGlitch: iframe save apply failed', err); }
});
const saveFieldAuto=(field,value,sourceKey=selectedSaveKey)=>{
 const targets=new Set([sourceKey]);
 if(GAME_FIELDS.has(field))targets.add(SAVE);
 let count=0;
 for(const key of targets){
  const raw=localStorage.getItem(key);
  if(raw===null)continue;
  try{
   const parsed=JSON.parse(raw);
   if(parsed&&typeof parsed==='object'&&!Array.isArray(parsed)){
    if(key===sourceKey||Object.prototype.hasOwnProperty.call(parsed,field)){
     parsed[field]=value;localStorage.setItem(key,JSON.stringify(parsed));count++;
    }
   }else if(field==='speed'&&key==='number-speed-escape-shared-speed-v1'){
    localStorage.setItem(key,JSON.stringify(value));count++;
   }
  }catch{
   if(field==='speed'&&key==='number-speed-escape-shared-speed-v1'&&typeof value==='number'){
    localStorage.setItem(key,String(value));count++;
   }
  }
 }
 // Update matching fields in other existing JSON saves, but never overwrite the backup snapshot.
 for(const key of SAVE_KEYS){
  if(key===BACKUP||targets.has(key))continue;
  const raw=localStorage.getItem(key);if(raw===null)continue;
  try{
   const parsed=JSON.parse(raw);
   if(parsed&&typeof parsed==='object'&&!Array.isArray(parsed)&&Object.prototype.hasOwnProperty.call(parsed,field)){
    parsed[field]=value;localStorage.setItem(key,JSON.stringify(parsed));count++;
   }else if(field==='speed'&&key==='number-speed-escape-shared-speed-v1'&&(typeof parsed==='number'||typeof parsed==='string')){
    localStorage.setItem(key,JSON.stringify(value));count++;
   }
  }catch{
   if(field==='speed'&&key==='number-speed-escape-shared-speed-v1'&&typeof value==='number'){
    localStorage.setItem(key,String(value));count++;
   }
  }
 }
 if(GAME_FIELDS.has(field))sendSaveToGameFrames(read(SAVE)||{});
 return count;
};
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
  <label class="muted" for="ggh-save-key">Save source</label><select class="i" id="ggh-save-key" style="width:100%;margin:5px 0"></select>
  <div class="muted" id="ggh-source">Looking for Speed Escape save…</div>
  <div id="ggh-stats" style="display:grid;grid-template-columns:1fr 1fr;gap:7px;margin:8px 0"></div>
  <details style="margin:8px 0" open><summary>Easy save editor</summary>
   <div class="muted" style="margin:6px 0">Most important fields are first. Change a value, then press Save. Treadmill/speed-pad data is listed near the top. Export a backup before changing things.</div>
   <input class="i" id="ggh-filter" placeholder="Search by simple name…" style="width:100%;margin:7px 0">
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
  const keyPicker=card.querySelector('#ggh-save-key');
  const available=SAVE_KEYS.filter(k=>localStorage.getItem(k)!==null);
  if(!available.includes(selectedSaveKey))selectedSaveKey=available.includes(SAVE)?SAVE:available[0]||SAVE;
  keyPicker.innerHTML=(available.length?available:SAVE_KEYS).map(k=>{const labels={[SAVE]:'Main game save','number-speed-escape-account-meta':'Account metadata','number-speed-escape-shared-speed-v1':'Shared speed',[BACKUP]:'GardenGlitch backup'};return '<option value="'+esc(k)+'" '+(k===selectedSaveKey?'selected':'')+'>'+esc(labels[k]||k)+(localStorage.getItem(k)===null?' (not found)':'')+'</option>'}).join('');
  const s=read(selectedSaveKey),backup=localStorage.getItem(BACKUP);
  const src=card.querySelector('#ggh-source');
  if(!s){
   src.textContent=localStorage.getItem(selectedSaveKey)===null?(backup?'Selected key not found; a backup key exists.':'Selected key does not exist in this origin.'):'Editing '+selectedSaveKey+' · localStorage only; server sync is not confirmed.';
   card.querySelector('#ggh-stats').innerHTML='';
   card.querySelector('#ggh-fields').textContent='';
   return;
  }
  src.textContent='Active local save found · '+Object.keys(s).length+' top-level fields. Local data only; server sync is not confirmed.';
  const stats=[['Speed',s.speed],['Wins',s.wins],['Rebirths',s.rebirths],['Level',s.level],['Hearts',s.hearts],['World',s.currentWorldId],['Steps',s.steps],['Diamonds',s.diamonds]];
  card.querySelector('#ggh-stats').innerHTML=stats.map(([k,v])=>`<div style="padding:9px;background:#080d19;border:1px solid #a855f733;border-radius:8px"><div class="muted">${esc(k)}</div><b style="overflow-wrap:anywhere">${esc(v??'—')}</b></div>`).join('');
  const filter=(card.querySelector('#ggh-filter').value||'').toLowerCase();
  const fields=card.querySelector('#ggh-fields');
  const priority=['speed','customSpeedRatio','wins','rebirths','level','hearts','currentWorldId','steps','diamonds','playerName','speedPads','selectedSpeedPad','selectedSpeedPads','equippedTrail','ownedTrails','equippedSkin','skinPreset','customParts'];
  const friendly=k=>({
   speed:'Speed',customSpeedRatio:'Custom speed ratio',wins:'Wins',rebirths:'Rebirths',level:'Level',hearts:'Hearts',currentWorldId:'Current world',steps:'Steps',diamonds:'Diamonds',playerName:'Player name',
   speedPads:'Treadmills / speed pads',selectedSpeedPad:'Selected speed pad',selectedSpeedPads:'Selected speed pads',
   equippedTrail:'Equipped trail',ownedTrails:'Owned trails',equippedSkin:'Equipped skin',skinPreset:'Skin preset',customParts:'Character parts'
  })[k]||k.replace(/([a-z0-9])([A-Z])/g,'$1 $2').replace(/[_-]+/g,' ').replace(/^./,c=>c.toUpperCase());
  const entries=Object.entries(s).sort(([a],[b])=>{
   const ai=priority.indexOf(a),bi=priority.indexOf(b);
   return (ai<0?999:ai)-(bi<0?999:bi)||a.localeCompare(b);
  }).filter(([k,v])=>(friendly(k)+' '+k+' '+JSON.stringify(v)).toLowerCase().includes(filter));
  const editorControl=(k,v)=>{
   const key=esc(k);
   if(typeof v==='boolean')return `<label style="display:flex;align-items:center;gap:8px;margin:7px 0"><input type="checkbox" data-edit="${key}" data-kind="boolean" ${v?'checked':''}> <span>${v?'On':'Off'}</span></label>`;
   if(typeof v==='number')return `<input class="i" data-edit="${key}" data-kind="number" type="number" step="any" value="${esc(v)}" style="width:100%;margin:4px 0">`;
   if(typeof v==='string')return `<input class="i" data-edit="${key}" data-kind="string" type="text" value="${esc(v)}" style="width:100%;margin:4px 0">`;
   return `<details style="margin:5px 0"><summary>Edit advanced JSON (${Array.isArray(v)?'list':v===null?'empty value':'object'})</summary><textarea class="i" data-edit="${key}" data-kind="json" rows="3" style="width:100%;margin:5px 0;resize:vertical">${esc(JSON.stringify(v,null,2))}</textarea></details>`;
  };
  fields.innerHTML=entries.map(([k,v])=>`<div style="padding:9px 0;border-bottom:1px solid #ffffff18">
   <b>${esc(friendly(k))}</b> <span class="muted" style="font-size:11px">(${esc(k)})</span>
   ${editorControl(k,v)}
   <button class="q" data-save-field="${esc(k)}" style="width:100%">Save ${esc(friendly(k))}</button>
  </div>`).join('')||'<div class="muted">No matching fields.</div>';
  fields.querySelectorAll('[data-edit][data-kind="boolean"]').forEach(input=>input.onchange=()=>{const label=input.closest('label')?.querySelector('span');if(label)label.textContent=input.checked?'On':'Off'});
  fields.querySelectorAll('[data-save-field]').forEach(btn=>btn.onclick=async()=>{
   const key=btn.dataset.saveField,area=fields.querySelector('[data-edit="'+CSS.escape(key)+'"]'),kind=area?.dataset.kind;
   try{
    if(!area)throw Error('Editor control not found');
    let value;
    if(kind==='boolean')value=area.checked;
    else if(kind==='number'){if(area.value.trim()==='')throw Error('Enter a number');value=Number(area.value);if(!Number.isFinite(value))throw Error('Enter a valid number');}
    else if(kind==='json')value=JSON.parse(area.value);
    else value=area.value;
    const fresh=read(selectedSaveKey);if(!fresh)throw Error('Selected save not found');fresh[key]=value;write(fresh,selectedSaveKey);const updated=saveFieldAuto(key,value,selectedSaveKey);const idbUpdated=GAME_FIELDS.has(key)?await syncIndexedDBSave(fresh):0;render();status.textContent='Saved '+friendly(key)+' · updated '+updated+' localStorage location(s) and '+idbUpdated+' IndexedDB progress record(s). Reload the game if needed; server sync is not guaranteed.';
   }catch(err){status.textContent='Could not save field: '+err.message;}
  });
  fields.querySelectorAll('[data-delete-field]').forEach(btn=>btn.onclick=()=>{
   const key=btn.dataset.deleteField;
   if(!confirm('Delete local save field "'+key+'"? Export a backup first if needed.'))return;
   const fresh=read(selectedSaveKey);if(!fresh)return;delete fresh[key];write(fresh,selectedSaveKey);render();status.textContent='Deleted "'+key+'" from '+selectedSaveKey+'.';
  });
 }
 function moveChat(){
  const c=root()?.querySelector('#ggChatCard'),slot=card.querySelector('#ggh-chat-slot');
  if(c&&slot&&c.parentElement!==slot){c.style.marginTop='0';slot.appendChild(c);}
 }
 card.querySelector('#ggh-save-key').onchange=e=>{selectedSaveKey=e.target.value;render();status.textContent='Selected '+selectedSaveKey+'.'};
 card.querySelector('#ggh-refresh').onclick=()=>{render();status.textContent='Refreshed. No changes made.'};
 card.querySelector('#ggh-filter').addEventListener('input',render);
 card.querySelector('#ggh-export').onclick=()=>{
  const s=localStorage.getItem(selectedSaveKey);
  if(!s){status.textContent='Selected key has no data to export.';return;}
  const a=document.createElement('a'),url=URL.createObjectURL(new Blob([s],{type:'application/json'}));
  a.href=url;a.download=selectedSaveKey.replace(/[^a-z0-9_-]/gi,'-')+'-backup.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  status.textContent='Backup exported.';
 };
 card.querySelector('#ggh-add-field').onclick=async()=>{
  const key=card.querySelector('#ggh-new-key').value.trim(),raw=card.querySelector('#ggh-new-value').value;
  if(!key){status.textContent='Enter a field name.';return;}
  let value;try{value=JSON.parse(raw)}catch{status.textContent='Value must be valid JSON.';return;}
  const fresh=read(selectedSaveKey);if(!fresh){status.textContent='Selected save not found.';return;}
  if(Object.prototype.hasOwnProperty.call(fresh,key)&&!confirm('Field already exists. Replace it?'))return;
  fresh[key]=value;write(fresh,selectedSaveKey);const idbUpdated=GAME_FIELDS.has(key)?await syncIndexedDBSave(fresh):0;card.querySelector('#ggh-new-key').value='';render();status.textContent='Field "'+key+'" saved in '+selectedSaveKey+'; synced '+idbUpdated+' IndexedDB record(s).';
 };
 card.querySelector('#ggh-import-btn').onclick=()=>card.querySelector('#ggh-import').click();
 card.querySelector('#ggh-import').onchange=async e=>{
  const f=e.target.files?.[0];if(!f)return;
  try{
   const parsed=JSON.parse(await f.text());
   if(!parsed||typeof parsed!=='object'||Array.isArray(parsed))throw Error('Expected a JSON save object.');
   if(!confirm('Replace the active local Speed Escape save with this file? Export a backup first if needed.'))return;
   write(parsed,selectedSaveKey);const idbUpdated=await syncIndexedDBSave(parsed);render();status.textContent='Imported into '+selectedSaveKey+' and synced '+idbUpdated+' IndexedDB progress record(s). Reload the game if needed; server sync is not guaranteed.';
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