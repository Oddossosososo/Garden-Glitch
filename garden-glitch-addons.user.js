// ==UserScript==
// @name         GardenGlitch Add-ons
// @namespace    GardenGlitch
// @version      1.0.0
// @description  Optional user-made JS/JSON add-ons with More Fonts+ and Mad Scientist
// @match        *://*/*
// @grant        none
// ==/UserScript==

(()=>{
  'use strict';
  if(window.GardenGlitchAddons)return;

  const SUPABASE_URL='https://thuydbkycsjzvfjqfoax.supabase.co';
  const SUPABASE_KEY='sb_publishable_s2GYjmzF7TYBoyPzsIs0mQ_bNRz_lER';
  const TABLE='garden_glitch_addons';
  const STATE_KEY='GardenGlitch.Addons.Enabled';

  const builtins={
    'more-fonts-plus':()=>{
      const id='gg-more-fonts-plus-style';
      document.getElementById(id)?.remove();
      const style=document.createElement('style');
      style.id=id;
      style.textContent=`@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;700;900&family=Press+Start+2P&family=Roboto+Mono:wght@400;600;700&family=Space+Mono:wght@400;700&display=swap');
      #ggHost .card,#ggHost button,#ggHost input,#ggHost select,#ggHost textarea{font-family:"Roboto Mono",monospace!important}
      #ggHost h1,#ggHost h2,#ggHost .title{font-family:Orbitron,system-ui,sans-serif!important}`;
      document.head.appendChild(style);
      console.log('GardenGlitch: More Fonts+ enabled');
    },
    'mad-scientist':()=>{
      const id='gg-mad-scientist';
      document.getElementById(id)?.remove();
      const box=document.createElement('div');
      box.id=id;
      box.textContent='🧪 MAD SCIENTIST MODE: ACTIVE';
      Object.assign(box.style,{position:'fixed',right:'16px',bottom:'16px',zIndex:'2147483647',padding:'10px 14px',border:'1px solid #7cffc4',borderRadius:'12px',background:'rgba(5,10,18,.94)',color:'#7cffc4',font:'700 12px monospace',boxShadow:'0 0 18px rgba(124,255,196,.35)',cursor:'pointer'});
      document.body.appendChild(box);
      let n=0;
      const timer=setInterval(()=>{n++;box.style.transform=`translateY(${Math.sin(n/5)*3}px)`},120);
      box.title='Click to disable';
      box.onclick=()=>{clearInterval(timer);box.remove();};
      console.log('GardenGlitch: Mad Scientist enabled');
    },
    'json-neon-theme':()=>applyJson({background:'#070b16',panel:'#101827',accent:'#7cffc4',glow:true})
  };

  function getEnabled(){
    try{return new Set(JSON.parse(localStorage.getItem(STATE_KEY)||'[]'))}
    catch{return new Set()}
  }
  function setEnabled(set){localStorage.setItem(STATE_KEY,JSON.stringify([...set]));}

  function applyJson(data){
    if(!data||typeof data!=='object')return;
    const root=document.getElementById('ggHost')?.shadowRoot;
    if(root){
      const host=root.host;
      if(data.background)host.style.setProperty('--gg-addon-bg',data.background);
      if(data.panel)host.style.setProperty('--gg-addon-panel',data.panel);
      if(data.accent)host.style.setProperty('--gg-addon-accent',data.accent);
      if(data.glow)host.style.setProperty('--gg-addon-glow',String(data.glow));
    }
    console.log('GardenGlitch JSON add-on applied:',data);
  }

  async function fetchRemote(){
    const url=`${SUPABASE_URL}/rest/v1/${TABLE}?select=id,name,description,kind,code,data,enabled_by_default,author&order=created_at.asc`;
    const r=await fetch(url,{headers:{apikey:SUPABASE_KEY}});
    if(!r.ok)throw new Error('Supabase '+r.status);
    return await r.json();
  }

  async function loadCatalog(){
    const remote=await fetchRemote();
    const byId=new Map(remote.map(x=>[x.id,x]));
    if(!byId.has('more-fonts-plus'))byId.set('more-fonts-plus',{id:'more-fonts-plus',name:'More Fonts+',description:'Optional extra fonts',kind:'js',data:{fonts:['Orbitron','Press Start 2P','Roboto Mono','Space Mono']},author:'GardenGlitch'});
    if(!byId.has('mad-scientist'))byId.set('mad-scientist',{id:'mad-scientist',name:'Mad Scientist',description:'Optional experimental UI lab',kind:'js',data:{uiOnly:true},author:'GardenGlitch'});
    if(!byId.has('json-neon-theme'))byId.set('json-neon-theme',{id:'json-neon-theme',name:'Neon Theme JSON',description:'Optional JSON theme preset',kind:'json',data:{background:'#070b16',panel:'#101827',accent:'#7cffc4',glow:true},author:'GardenGlitch'});
    return [...byId.values()];
  }

  async function enableAddon(addon){
    const enabled=getEnabled();
    if(enabled.has(addon.id)){console.log('GardenGlitch: already enabled',addon.id);return;}

    if(addon.kind==='js'){
      if(builtins[addon.id]){
        builtins[addon.id]();
      }else if(addon.code){
        try{new Function(addon.code+'\n//# sourceURL=GardenGlitchAddon:'+addon.id)();}
        catch(e){console.error('GardenGlitch add-on failed:',addon.id,e);return;}
      }else{
        console.warn('GardenGlitch: JS add-on has no code:',addon.id);return;
      }
    }else if(addon.kind==='json'){
      if(addon.data)applyJson(addon.data);
      else{console.warn('GardenGlitch: JSON add-on has no data:',addon.id);return;}
    }

    enabled.add(addon.id);
    setEnabled(enabled);
    render();
  }

  function disableAddon(addon){
    const enabled=getEnabled();
    enabled.delete(addon.id);
    setEnabled(enabled);
    if(addon.id==='more-fonts-plus')document.getElementById('gg-more-fonts-plus-style')?.remove();
    if(addon.id==='mad-scientist')document.getElementById('gg-mad-scientist')?.remove();
    render();
  }

  let catalog=[];

  async function render(){
    const root=document.getElementById('ggHost')?.shadowRoot;
    const dashboard=root?.querySelector('#pd');
    if(!root||!dashboard)return false;

    let card=root.querySelector('#ggAddonsCard');
    if(!card){
      card=document.createElement('div');
      card.id='ggAddonsCard';
      card.className='card';
      dashboard.appendChild(card);
    }

    const enabled=getEnabled();
    card.innerHTML=`<h3>🧩 Add-ons</h3><div class="small">JS and JSON add-ons are <b>not</b> auto-used. Enable them manually.</div><div id="ggAddonList" style="display:grid;gap:8px;margin-top:8px"></div>`;
    const list=card.querySelector('#ggAddonList');

    for(const addon of catalog){
      const row=document.createElement('div');
      row.style.cssText='display:flex;align-items:center;gap:8px;flex-wrap:wrap';
      const meta=document.createElement('span');
      meta.style.flex='1';
      meta.innerHTML=`<b>${String(addon.name||addon.id)}</b><br><span class="small">${String(addon.description||'')} · ${addon.kind.toUpperCase()} · ${String(addon.author||'')}</span>`;
      const button=document.createElement('button');
      button.className='q';
      button.textContent=enabled.has(addon.id)?'Disable':'Enable';
      button.onclick=()=>enabled.has(addon.id)?disableAddon(addon):enableAddon(addon);
      row.append(meta,button);
      list.appendChild(row);
    }
    return true;
  }

  async function init(){
    try{catalog=await loadCatalog();}
    catch(e){
      console.error('GardenGlitch add-on catalog failed:',e);
      catalog=[
        {id:'more-fonts-plus',name:'More Fonts+',description:'Optional extra fonts',kind:'js',author:'GardenGlitch'},
        {id:'mad-scientist',name:'Mad Scientist',description:'Optional UI lab',kind:'js',author:'GardenGlitch'},
        {id:'json-neon-theme',name:'Neon Theme JSON',description:'Optional JSON theme',kind:'json',data:{background:'#070b16',panel:'#101827',accent:'#7cffc4',glow:true},author:'GardenGlitch'}
      ];
    }

    const bind=()=>render();
    if(!bind()){
      const timer=setInterval(()=>{if(bind())clearInterval(timer)},250);
      setTimeout(()=>clearInterval(timer),30000);
    }
  }

  window.GardenGlitchAddons={
    getCatalog:()=>catalog.slice(),
    enable:id=>{const a=catalog.find(x=>x.id===id);return a?enableAddon(a):false},
    disable:id=>{const a=catalog.find(x=>x.id===id);return a?disableAddon(a):false},
    applyJson,
    reloadCatalog:init
  };

  init();
})();
