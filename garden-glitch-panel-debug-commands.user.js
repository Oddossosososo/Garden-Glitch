// ==UserScript==
// @name         GardenGlitch Panel Debug Commands
// @namespace    GardenGlitch
// @version      1.0.0
// @description  Adds a safe whitelisted Player Hook Test command section to the GardenGlitch panel
// @match        *://*/*
// @grant        none
// ==/UserScript==

(()=>{
  'use strict';
  const host=document.getElementById('ggHost');
  const root=host?.shadowRoot;
  if(!root)return console.warn('[GardenGlitch] Panel not found. Load the main panel first.');
  if(root.querySelector('#ggDebugCommands'))return;

  const card=document.createElement('div');
  card.id='ggDebugCommands';
  card.className='card';
  card.innerHTML=`<b>🧪 Player Hook Test</b><div style="font-size:10px;opacity:.55;margin:4px 0 7px">Whitelisted local debug commands</div><div id="ggDbgOut" style="height:130px;overflow:auto;white-space:pre-wrap;background:#05070d;border:1px solid #00ffff22;border-radius:8px;padding:8px;font:12px monospace">Debug ready. Type help.</div><div style="display:grid;grid-template-columns:1fr 70px;gap:6px;margin-top:6px"><input id="ggDbgInput" class="i" placeholder="help"><button id="ggDbgRun" class="q">Run</button></div><div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:6px"><button id="ggFlyOn" class="q">✈️ Fly On</button><button id="ggFlyOff" class="q">🛬 Fly Off</button><button id="ggStop" class="q">⛔ Stop</button><button id="ggPos" class="q">📍 Position</button></div><div style="font-size:10px;opacity:.55;margin-top:6px">Commands: help • fly on/off • speed N • up N • down N • stop • pos</div>`;

  const dashboard=root.querySelector('#pd');
  const target=dashboard||root.querySelector('#b');
  target.appendChild(card);

  const out=()=>root.querySelector('#ggDbgOut');
  const write=(s)=>{const el=out();el.textContent+=(el.textContent?'\n':'')+s;el.scrollTop=el.scrollHeight};
  const state=()=>{try{return JSON.parse(localStorage.getItem('GardenGlitch_PlayerHookTest')||'{"flying":false,"speed":7,"y":0}')}catch{return{flying:false,speed:7,y:0}}};
  const save=s=>localStorage.setItem('GardenGlitch_PlayerHookTest',JSON.stringify(s));

  function run(raw){
    const cmd=raw.trim();
    if(!cmd)return;
    write('> '+cmd);
    const p=cmd.split(/\s+/),name=p[0].toLowerCase(),n=Number(p[1]),s=state();
    switch(name){
      case 'help': write('help | fly on | fly off | speed N | up N | down N | stop | pos'); break;
      case 'fly':
        if(p[1]==='on'){s.flying=true;save(s);write('Flying enabled.');}
        else if(p[1]==='off'){s.flying=false;save(s);write('Flying disabled.');}
        else write('Usage: fly on | fly off');
        break;
      case 'speed':
        if(Number.isFinite(n)){s.speed=Math.max(0,Math.min(40,n));save(s);write('Speed = '+s.speed);}
        else write('Usage: speed 12');
        break;
      case 'up':
        if(Number.isFinite(n)){s.y+=Math.max(0,Math.min(40,n));save(s);write('Y offset = '+s.y);}
        else write('Usage: up 5');
        break;
      case 'down':
        if(Number.isFinite(n)){s.y-=Math.max(0,Math.min(40,n));save(s);write('Y offset = '+s.y);}
        else write('Usage: down 5');
        break;
      case 'stop':
        s.flying=false;s.speed=0;save(s);write('Player test movement stopped.');
        break;
      case 'pos':
        write('Player test state: '+JSON.stringify(s));
        break;
      default: write('Unknown command. Type help.');
    }
  }

  root.querySelector('#ggDbgRun').onclick=()=>{const i=root.querySelector('#ggDbgInput');run(i.value);i.value='';};
  root.querySelector('#ggDbgInput').addEventListener('keydown',e=>{if(e.key==='Enter')root.querySelector('#ggDbgRun').click();});
  root.querySelector('#ggFlyOn').onclick=()=>run('fly on');
  root.querySelector('#ggFlyOff').onclick=()=>run('fly off');
  root.querySelector('#ggStop').onclick=()=>run('stop');
  root.querySelector('#ggPos').onclick=()=>run('pos');
})();
