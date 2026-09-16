// ==UserScript==
// @name         GardenGlitch Real Chat
// @namespace    GardenGlitch
// @version      1.1.0
// @description  Adds a real shared chat to the GardenGlitch panel with a local owner badge
// @match        *://*/*
// @grant        none
// ==/UserScript==

(()=>{
'use strict';
const U='https://thuydbkycsjzvfjqfoax.supabase.co';
const A='sb_publishable_s2GYjmzF7TYBoyPzsIs0mQ_bNRz_lER';
const API=U+'/rest/v1/garden_glitch_chat';
const NAME_KEY='GardenGlitch.Chat.Username';
const DEVICE_KEY='GardenGlitch_GuestID';
const OWNER_KEY='GardenGlitch.OwnerDeviceID';
const guestKey=localStorage.getItem(DEVICE_KEY)||crypto.randomUUID();
localStorage.setItem(DEVICE_KEY,guestKey);
let lastId=0,timer=null;
const esc=s=>String(s).replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c]));
const username=()=>((localStorage.getItem(NAME_KEY)||'Guest-'+guestKey.slice(0,6)).trim().slice(0,24)||'Guest');
const isOwnerDevice=()=>{
  const ownerId=localStorage.getItem(OWNER_KEY);
  return !!ownerId&&ownerId===localStorage.getItem(DEVICE_KEY);
};
const headers=()=>({apikey:A,'Content-Type':'application/json'});
const root=()=>document.querySelector('#ggHost')?.shadowRoot;
async function load(){
  const r=await fetch(API+'?select=id,username,message,created_at&order=id.desc&limit=50',{headers:{apikey:A}});
  if(!r.ok)throw Error('Chat load HTTP '+r.status);
  const rows=await r.json();
  rows.reverse();
  const card=root()?.querySelector('#ggChatCard');
  const list=card?.querySelector('#ggChatMessages');
  if(!list)return;
  list.innerHTML=rows.map(x=>{
    const localOwner=isOwnerDevice() && x.username===username();
    const badge=localOwner?'<span style="margin-left:5px;padding:1px 6px;border-radius:999px;background:linear-gradient(90deg,#ffd86b,#ff9bd2);color:#140d1b;font-size:9px;font-weight:900;box-shadow:0 0 8px #ffd86b66">👑 OWNER</span>':'';
    return `<div style="padding:5px 7px;border:1px solid #00ffff18;border-radius:7px;margin:4px 0;background:#ffffff05"><b style="color:#7cffc4">${esc(x.username)}</b>${badge}<span style="opacity:.45;font-size:10px"> · ${new Date(x.created_at).toLocaleTimeString()}</span><div style="margin-top:2px;word-break:break-word">${esc(x.message)}</div></div>`;
  }).join('');
  if(rows.length)lastId=Math.max(lastId,...rows.map(x=>Number(x.id)||0));
  list.scrollTop=list.scrollHeight;
}
async function send(){
  const card=root()?.querySelector('#ggChatCard');
  const input=card?.querySelector('#ggChatInput');
  const name=card?.querySelector('#ggChatName');
  if(!input||!name)return;
  const message=input.value.trim();
  const user=(name.value.trim()||username()).slice(0,24);
  if(!message)return;
  if(!user)return;
  localStorage.setItem(NAME_KEY,user);
  const r=await fetch(API,{method:'POST',headers:{...headers(),Prefer:'return=minimal'},body:JSON.stringify({username:user,message:message.slice(0,300)})});
  if(!r.ok)throw Error('Chat send HTTP '+r.status);
  input.value='';
  await load();
}
function add(){
  const r=root();
  const dash=r?.querySelector('#pd');
  if(!r||!dash)return false;
  if(r.querySelector('#ggChatCard'))return true;
  const card=document.createElement('div');
  card.id='ggChatCard';card.className='card';
  card.innerHTML=`<div style="display:flex;justify-content:space-between;align-items:center;gap:8px"><b>💬 GardenGlitch Chat</b><span id="ggChatStatus" class="muted">Connecting…</span></div><div style="display:grid;grid-template-columns:1fr;gap:6px;margin-top:7px"><input id="ggChatName" class="i" maxlength="24" placeholder="Username"><div id="ggChatMessages" style="height:180px;overflow:auto;padding:4px;background:#05070d;border:1px solid #00ffff18;border-radius:8px"></div><div style="display:grid;grid-template-columns:1fr auto;gap:6px"><input id="ggChatInput" class="i" maxlength="300" placeholder="Type a message…"><button id="ggChatSend" class="q">Send</button></div><div class="muted">Shared live chat. Keep personal information out of messages.</div></div>`;
  dash.appendChild(card);
  const name=r.querySelector('#ggChatName');
  name.value=localStorage.getItem(NAME_KEY)||('Guest-'+guestKey.slice(0,6));
  r.querySelector('#ggChatSend').onclick=()=>send().catch(e=>r.querySelector('#ggChatStatus').textContent='Chat error');
  r.querySelector('#ggChatInput').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();send().catch(()=>{})}});
  load().then(()=>{r.querySelector('#ggChatStatus').textContent='Online'}).catch(()=>{r.querySelector('#ggChatStatus').textContent='Offline'});
  timer=setInterval(()=>load().catch(()=>{}),2000);
  return true;
}
if(!add()){const t=setInterval(()=>{if(add())clearInterval(t)},250);setTimeout(()=>clearInterval(t),30000)}
window.addEventListener('beforeunload',()=>{if(timer)clearInterval(timer)});
})();
