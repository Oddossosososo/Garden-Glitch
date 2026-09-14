// ==UserScript==
// @name         GardenGlitch Green Terminal UI
// @namespace    GardenGlitch
// @version      1.2.0
// @description  Pure green-on-black terminal visual layer for GardenGlitch
// @match        *://*/*
// @grant        none
// ==/UserScript==

(() => {
  'use strict';

  const apply = () => {
    const host = document.getElementById('ggHost');
    const root = host?.shadowRoot;
    if (!root) return false;
    if (root.getElementById('gg-green-terminal')) return true;

    const panel = root.querySelector('#p');
    const header = root.querySelector('#h');
    const body = root.querySelector('#b');
    const status = root.querySelector('#st');
    if (!panel || !header || !body) return false;

    const style = document.createElement('style');
    style.id = 'gg-green-terminal';
    style.textContent = `
      @keyframes ggBlink { 0%,49%{opacity:1} 50%,100%{opacity:.18} }
      @keyframes ggPulse { 0%,100%{box-shadow:0 0 9px rgba(0,255,70,.22),inset 0 0 24px rgba(0,255,70,.035)} 50%{box-shadow:0 0 20px rgba(0,255,70,.44),inset 0 0 32px rgba(0,255,70,.065)} }
      @keyframes ggScan { from{background-position:0 0} to{background-position:0 16px} }
      * { font-family:Consolas,"Courier New",monospace!important; }
      #p {
        color:#9dffb8!important;
        background:#020603!important;
        border:1px solid #00ff46!important;
        border-radius:3px!important;
        box-shadow:0 0 12px rgba(0,255,70,.23),0 0 38px rgba(0,255,70,.10),inset 0 0 32px rgba(0,255,70,.04)!important;
        text-shadow:0 0 5px rgba(0,255,70,.32);
        animation:ggPulse 3s ease-in-out infinite;
        position:relative!important;
      }
      #p:before {
        content:"";
        position:absolute;
        inset:0;
        pointer-events:none;
        border-radius:inherit;
        background:repeating-linear-gradient(0deg,transparent 0 2px,rgba(0,255,70,.035) 3px 4px);
        animation:ggScan 1.5s linear infinite;
        z-index:9999;
      }
      #h {
        background:#010401!important;
        border-bottom:1px solid rgba(0,255,70,.38)!important;
        color:#9dffb8!important;
        letter-spacing:.07em;
        text-transform:uppercase;
      }
      #h b:before { content:"> "; color:#00ff46!important; }
      #h b { color:#9dffb8!important; }
      .t,.q {
        color:#83ff9f!important;
        background:#010401!important;
        border:1px solid rgba(0,255,70,.28)!important;
        border-radius:2px!important;
        text-transform:uppercase;
      }
      .t:hover,.q:hover {
        color:#001b07!important;
        background:#00ff46!important;
        border-color:#00ff46!important;
        box-shadow:0 0 12px rgba(0,255,70,.5)!important;
        transform:translateY(-1px);
      }
      .t.on {
        color:#001b07!important;
        background:#00ff46!important;
        border-color:#00ff46!important;
        box-shadow:0 0 15px rgba(0,255,70,.46)!important;
      }
      .card {
        background:#010502!important;
        border:1px solid rgba(0,255,70,.18)!important;
        border-radius:2px!important;
        box-shadow:inset 0 1px rgba(0,255,70,.055)!important;
      }
      .i,.s {
        color:#9dffb8!important;
        background:#000300!important;
        border:1px solid rgba(0,255,70,.26)!important;
        border-radius:2px!important;
      }
      .i:focus,.s:focus {
        outline:none!important;
        border-color:#00ff46!important;
        box-shadow:0 0 0 1px rgba(0,255,70,.18),0 0 10px rgba(0,255,70,.20)!important;
      }
      .muted { color:#4fbd69!important; opacity:.78!important; }
      #st {
        color:#00ff46!important;
        background:#000600!important;
        border-color:rgba(0,255,70,.25)!important;
      }
      #gg-green-terminal-line {
        margin:0 0 8px;
        padding:7px 9px;
        border-left:3px solid #00ff46;
        background:#000500;
        color:#70ff91;
        font:10px/1.3 Consolas,"Courier New",monospace;
        white-space:nowrap;
        overflow:hidden;
        text-overflow:ellipsis;
      }
      #gg-green-terminal-line .prompt { color:#00ff46; }
      #gg-green-terminal-line .cursor { animation:ggBlink .8s steps(1,end) infinite; }
      #gg-green-terminal-log {
        margin-top:5px;
        max-height:72px;
        overflow:auto;
        color:#4ec96d;
        font:9px/1.45 Consolas,"Courier New",monospace;
      }
      .gg-green-log { white-space:nowrap; }
      .gg-green-log:before { content:"[SYS] "; color:#00ff46; }
    `;
    root.appendChild(style);

    let line = root.querySelector('#gg-green-terminal-line');
    if (!line) {
      line = document.createElement('div');
      line.id = 'gg-green-terminal-line';
      line.innerHTML = '<span class="prompt">root@gardenglitch:~$</span> terminal --online <span class="cursor">█</span><div id="gg-green-terminal-log"></div>';
      body.insertBefore(line, body.firstChild);
    }

    const log = line.querySelector('#gg-green-terminal-log');
    const addLog = text => {
      if (!log) return;
      const item = document.createElement('div');
      item.className = 'gg-green-log';
      item.textContent = text;
      log.appendChild(item);
      while (log.children.length > 6) log.firstChild.remove();
      log.scrollTop = log.scrollHeight;
    };

    ['TERMINAL LINK ESTABLISHED','PANEL MATRIX ONLINE','LOCAL STATE READY','GARDEN MODULES ARMED'].forEach(addLog);

    const messages = ['SYSTEM READY','WAITING FOR OPERATOR INPUT','STATE LINK ACTIVE','GARDEN MATRIX ONLINE'];
    let index = 0;
    const timer = setInterval(() => {
      addLog(messages[index++ % messages.length]);
    }, 3200);

    if (status && status.textContent === 'Ready') status.textContent = 'SYS://READY';

    return true;
  };

  if (!apply()) {
    const timer = setInterval(() => {
      if (apply()) clearInterval(timer);
    }, 250);
    setTimeout(() => clearInterval(timer), 15000);
  }
})();
