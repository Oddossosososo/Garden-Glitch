// ==UserScript==
// @name         GardenGlitch Hacker Terminal UI
// @namespace    GardenGlitch
// @version      1.1.0
// @description  Hacker-terminal visual layer for the GardenGlitch panel
// @match        *://*/*
// @grant        none
// ==/UserScript==

(()=>{
'use strict';
const apply=()=>{
 const host=document.getElementById('ggHost'),root=host?.shadowRoot;
 if(!root)return false;
 if(root.getElementById('gg-hacker-terminal'))return true;
 const p=root.querySelector('#p'),h=root.querySelector('#h'),b=root.querySelector('#b'),st=root.querySelector('#st');
 if(!p||!h||!b)return false;
 const s=document.createElement('style');
 s.id='gg-hacker-terminal';
 s.textContent=`
 @keyframes ggPulse{0%,100%{filter:brightness(1)}50%{filter:brightness(1.14)}}
 @keyframes ggBlink{0%,49%{opacity:1}50%,100%{opacity:.15}}
 @keyframes ggScan{from{background-position:0 0}to{background-position:0 16px}}
 #p{font-family:"Courier New",ui-monospace,monospace!important;color:#d8ffe6!important;border:1px solid #39ff88!important;border-radius:8px!important;background:linear-gradient(rgba(0,255,120,.018) 50%,transparent 50%) 0 0/100% 4px,radial-gradient(circle at 15% 0%,rgba(0,255,140,.13),transparent 34%),linear-gradient(145deg,#030706,#07130d 55%,#061018)!important;box-shadow:0 0 12px rgba(0,255,120,.22),0 0 38px rgba(0,255,120,.1),inset 0 0 35px rgba(0,255,120,.035)!important;animation:ggPulse 3.2s ease-in-out infinite}
 #p:before{content:"";position:absolute;inset:0;pointer-events:none;border-radius:inherit;background:repeating-linear-gradient(0deg,transparent 0 2px,rgba(64,255,160,.035) 3px 4px);z-index:999;animation:ggScan 1.8s linear infinite}
 #h{background:linear-gradient(90deg,rgba(0,255,120,.09),rgba(0,190,255,.04))!important;border-bottom:1px solid rgba(57,255,136,.28)!important;text-shadow:0 0 8px rgba(57,255,136,.46);letter-spacing:.04em}
 #h b:before{content:"> ";color:#39ff88}
 .t,.q{font-family:inherit!important;color:#b9ffd1!important;border:1px solid rgba(57,255,136,.25)!important;border-radius:4px!important;background:rgba(0,255,120,.035)!important;transition:.1s}
 .t:hover,.q:hover{transform:translateY(-1px);color:#fff!important;border-color:#39ff88!important;background:rgba(0,255,120,.11)!important;box-shadow:0 0 10px rgba(57,255,136,.18)}
 .t.on{color:#050805!important;border-color:#39ff88!important;background:linear-gradient(90deg,#39ff88,#13d7a0)!important;box-shadow:0 0 16px rgba(57,255,136,.28)}
 .card{border-color:rgba(57,255,136,.16)!important;border-radius:5px!important;background:rgba(0,20,10,.55)!important}
 .i,.s{font-family:inherit!important;color:#b9ffd1!important;border:1px solid rgba(57,255,136,.24)!important;border-radius:4px!important;background:#020805!important}
 .i:focus,.s:focus{border-color:#39ff88!important;box-shadow:0 0 0 2px rgba(57,255,136,.08),0 0 12px rgba(57,255,136,.1)!important}
 .muted{color:#63c98c!important;opacity:.72!important}
 #st{font-family:inherit!important;color:#39ff88!important;border-color:rgba(57,255,136,.22)!important;background:rgba(0,255,120,.045)!important}
 #gg-terminal-line{margin:0 10px 8px;padding:5px 8px;border-left:2px solid #39ff88;color:#71ffad;background:rgba(0,255,120,.035);font:10px/1.2 "Courier New",ui-monospace,monospace;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
 #gg-terminal-line:after{content:"█";margin-left:4px;animation:ggBlink .9s steps(1,end) infinite}
 #gg-terminal-clock{float:right;color:#5cefff;opacity:.8}
 `;
 root.appendChild(s);
 let line=root.querySelector('#gg-terminal-line');
 if(!line){line=document.createElement('div');line.id='gg-terminal-line';line.innerHTML='<span id="gg-terminal-text">BOOT :: GARDENGLITCH TERMINAL ONLINE</span><span id="gg-terminal-clock"></span>';b.insertBefore(line,b.firstChild)}
 const text=line.querySelector('#gg-terminal-text'),clock=line.querySelector('#gg-terminal-clock');
 const msgs=['BOOT :: GARDENGLITCH TERMINAL ONLINE','SYS :: LOCAL STATE LINK ESTABLISHED','NET :: CLOUD SAVE CHANNEL READY','MOD :: GARDEN CONTROL MATRIX ARMED','SCAN :: PLANT / INVENTORY / ANIMAL MODULES READY','STATUS :: WAITING FOR OPERATOR INPUT'];
 let i=0;
 const tick=()=>{if(text)text.textContent=msgs[i++%msgs.length];if(clock)clock.textContent=new Date().toLocaleTimeString([], {hour12:false});if(st&&st.textContent==='Ready')st.textContent='SYS://READY'};
 tick();setInterval(tick,3200);return true;
};
if(!apply()){const t=setInterval(()=>{if(apply())clearInterval(t)},250);setTimeout(()=>clearInterval(t),15000)}
})();
