// ==UserScript==
// @name         GardenGlitch Real Chat
// @namespace    GardenGlitch
// @version      1.3.0
// @description  Real shared chat with server-verified owner authentication
// @match        *://*/*
// @grant        none
// ==/UserScript==

(()=>{
'use strict';
const U='https://thuydbkycsjzvfjqfoax.supabase.co';
const A='sb_publishable_s2GYjmzF7TYBoyPzsIs0mQ_bNRz_lER';
const CHAT=U+'/functions/v1/garden-glitch-chat';
const NAME_KEY='GardenGlitch.Chat.Username';
const DEVICE_KEY='GardenGlitch_GuestID';
const PRIVATE_KEY='GardenGlitch.OwnerPrivateKeyJWK';
const PUBLIC_KEY='GardenGlitch.OwnerPublicKeyJWK';
const guestKey=localStorage.getItem(DEVICE_KEY)||crypto.randomUUID();
localStorage.setItem(DEVICE_KEY,guestKey);
let timer=null;
const enc=new TextEncoder();
const esc=s=>String(s).replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c]));
const username=()=>((localStorage.getItem(NAME_KEY)||'Guest-'+guestKey.slice(0,6)).trim().slice(0,24)||'Guest');
const root=()=>document.querySelector('#ggHost')?.shadowRoot;
const b64u=b=>{let s='';for(const x of new Uint8Array(b))s+=String.fromCharCode(x);return btoa(s).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'')};
const canonical=(device,user,msg)=>`${device}\n${user}\n${msg}`;

async function ensureOwnerKey(){
  try{
    let priv=localStorage.getItem(PRIVATE_KEY);
    let pub=localStorage.getItem(PUBLIC_KEY);
    if(!priv||!pub){
      const pair=await crypto.subtle.generateKey({name:'ECDSA',namedCurve:'P-256'},true,['sign','verify']);
      priv=JSON.stringify(await crypto.subtle.exportKey('jwk',pair.privateKey));
      pub=JSON.stringify(await crypto.subtle.exportKey('jwk',pair.publicKey));
      localStorage.setItem(PRIVATE_KEY,priv);
      localStorage.setItem(PUBLIC_KEY,pub);
    }
    const r=await fetch(CHAT,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'registerOwner',deviceId:guestKey,publicKeyJwk:JSON.parse(pub)})});
    return r.ok;
  }catch{return false;}
}

async function signOwner(user,msg){
  const priv=localStorage.getItem(PRIVATE_KEY);
  if(!priv)return '';
  try{
    const key=await crypto.subtle.importKey('jwk',JSON.parse(priv),{name:'ECDSA',namedCurve:'P-256'},false,['sign']);
    const sig=await crypto.subtle.sign({name:'ECDSA',hash:'SHA-256'},key,enc.encode(canonical(guestKey,user,msg)));
    return b64u(sig);
  }catch{return '';}
}

async function load(){
  const r=await fetch(CHAT,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'list'})});
  if(!r.ok)throw Error('Chat load HTTP '+r.status);
  const data=await r.json();
  const rows=Array.isArray(data.rows)?data.rows.reverse():[];
  const card=root()?.querySelector('#ggChatCard');
  const list=card?.querySelector('#ggChatMessages');
  if(!list)return;
  list.innerHTML=rows.map(x=>{
    const badge=x.is_owner?'<span style="margin-left:5px;padding:1px 6px;border-radius:999px;background:linear-gradient(90deg,#ffd86b,#ff9bd2);color:#140d1b;font-size:9px;font-weight:900;box-shadow:0 0 8px #ffd86b66">👑 OWNER</span>':'';
    return `<div style="padding:5px 7px;border:1px solid #00ffff18;border-radius:7px;margin:4px 0;background:#ffffff05"><b style="color:#7cffc4">${esc(x.username)}</b>${badge}<span style="opacity:.45;font-size:10px"> · ${new Date(x.created_at).toLocaleTimeString()}</span><div style="margin-top:2px;word-break:break-word">${esc(x.message)}</div></div>`;
  }).join('');
  list.scrollTop=list.scrollHeight;
}

async function send(){
  const card=root()?.querySelector('#ggChatCard');
  const input=card?.querySelector('#ggChatInput');
  const name=card?.querySelector('#ggChatName');
  const status=card?.querySelector('#ggChatStatus');
  if(!input||!name)return;
  const message=input.value.trim();
  const user=(name.value.trim()||username()).slice(0,24);
  if(!message||!user)return;
  localStorage.setItem(NAME_KEY,user);
  const signature=await signOwner(user,message.slice(0,300));
  const r=await fetch(CHAT,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'send',deviceId:guestKey,username:user,message:message.slice(0,300),signature})});
  if(!r.ok)throw Error('Chat send HTTP '+r.status);
  input.value='';
  if(status)status.textContent=(await r.json()).isOwner?'Owner verified':'Online';
  await load();
}

function add(){
  const r=root();
  const dash=r?.querySelector('#pd');
  if(!r||!dash)return false;
  if(r.querySelector('#ggChatCard'))return true;
  const card=document.createElement('div');
  card.id='ggChatCard';card.className='card';
  card.innerHTML=`<div style="display:flex;justify-content:space-between;align-items:center;gap:8px"><b>💬 GardenGlitch Chat</b><span id="ggChatStatus" class="muted">Connecting…</span></div><div style="display:grid;grid-template-columns:1fr;gap:6px;margin-top:7px"><input id="ggChatName" class="i" maxlength="24" placeholder="Username"><div id="ggChatMessages" style="height:180px;overflow:auto;padding:4px;background:#05070d;border:1px solid #00ffff18;border-radius:8px"></div><div style="display:grid;grid-template-columns:1fr auto;gap:6px"><input id="ggChatInput" class="i" maxlength="300" placeholder="Type a message…"><button id="ggChatSend" class="q">Send</button></div><div class="muted">Server-verified chat. Keep personal information out of messages.</div></div>`;
  dash.appendChild(card);
  const name=r.querySelector('#ggChatName');
  name.value=localStorage.getItem(NAME_KEY)||('Guest-'+guestKey.slice(0,6));
  const status=r.querySelector('#ggChatStatus');
  r.querySelector('#ggChatSend').onclick=()=>send().catch(()=>{status.textContent='Chat error'});
  r.querySelector('#ggChatInput').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();send().catch(()=>{})}});
  (async()=>{
    const registered=await ensureOwnerKey();
    await load();
    status.textContent=registered?'Owner auth ready':'Online';
  })().catch(()=>{status.textContent='Offline'});
  timer=setInterval(()=>load().catch(()=>{}),2000);
  return true;
}
if(!add()){const t=setInterval(()=>{if(add())clearInterval(t)},250);setTimeout(()=>clearInterval(t),30000)}
window.addEventListener('beforeunload',()=>{if(timer)clearInterval(timer)});
})();
