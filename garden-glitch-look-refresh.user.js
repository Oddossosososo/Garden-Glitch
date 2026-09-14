// ==UserScript==
// @name         GardenGlitch Green Terminal UI
// @namespace    GardenGlitch
// @version      1.3.0
// @description  Green-on-black terminal UI and HUD for GardenGlitch
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
      @keyframes ggBlink{0%,49%{opacity:1}50%,100%{opacity:.18}}
      @keyframes ggPulse{0%,100%{box-shadow:0 0 9px rgba(0,255,70,.22),inset 0 0 24px rgba(0,255,70,.035)}50%{box-shadow:0 0 20px rgba(0,255,70,.44),inset 0 0 32px rgba(0,255,70,.065)}}
      @keyframes ggScan{from{background-position:0 0}to{background-position:0 16px}}
      *{font-family:Consolas,"Courier New",monospace!important}
      #p{color:#9dffb8!important;background:#020603!important;border:1px solid #00ff46!important;border-radius:3px!important;box-shadow:0 0 12px rgba(0,255,70,.23),0 0 38px rgba(0,255,70,.10),inset 0 0 32px rgba(0,255,70,.04)!important;text-shadow:0 0 5px rgba(0,255,70,.32);animation:ggPulse 3s ease-in-out infinite;position:relative!important}
      #p:before{content:"";position:absolute;inset:0;pointer-events:none;border-radius:inherit;background:repeating-linear-gradient(0deg,transparent 0 2px,rgba(0,255,70,.035) 3px 4px);animation:ggScan 1.5s linear infinite;z-index:9999}
      #h{background:#010401!important;border-bottom:1px solid rgba(0,255,70,.38)!important;color:#9dffb8!important;letter-spacing:.07em;text-transform:uppercase}
      #h b:before{content:"> ";color:#00ff46!important}
      #h b{color:#9dffb8!important}
      .t,.q{color:#83ff9f!important;background:#010401!important;border:1px solid rgba(0,255,70,.28)!important;border-radius:2px!important;text-transform:uppercase}
      .t:hover,.q:hover{color:#001b07!important;background:#00ff46!important;border-color:#00ff46!important;box-shadow:0 0 12px rgba(0,255,70,.5)!important;transform:translateY(-1px)}
      .t.on{color:#001b07!important;background:#00ff46!important;border-color:#00ff46!important;box-shadow:0 0 15px rgba(0,255,70,.46)!important}
      .card{background:#010502!important;border:1px solid rgba(0,255,70,.18)!important;border-radius:2px!important;box-shadow:inset 0 1px rgba(0,255,70,.055)!important}
      .i,.s{color:#9dffb8!important;background:#000300!important;border:1px solid rgba(0,255,70,.26)!important;border-radius:2px!important}
      .i:focus,.s:focus{outline:none!important;border-color:#00ff46!important;box-shadow:0 0 0 1px rgba(0,255,70,.18),0 0 10px rgba(0,255,70,.20)!important}
      .muted{color:#4fbd69!important;opacity:.78!important}
      #st{color:#00ff46!important;background:#000600!important;border-color:rgba(0,255,70,.25)!important}
      #gg-green-terminal-line{margin:0 0 8px;padding:7px 9px;border-left:3px solid #00ff46;background:#000500;color:#70ff91;font:10px/1.3 Consolas,"Courier New",monospace;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      #gg-green-terminal-line .prompt{color:#00ff46}
      #gg-green-terminal-line .cursor{animation:ggBlink .8s steps(1,end) infinite}
      #gg-green-terminal-log{margin-top:5px;max-height:72px;overflow:auto;color:#4ec96d;font:9px/1.45 Consolas,"Courier New",monospace}
      .gg-green-log{white-space:nowrap}
      .gg-green-log:before{content:"[SYS] ";color:#00ff46}
      #gg-green-hud{display:grid;grid-template-columns:repeat(3,1fr);gap:5px;margin:0 0 8px;font:9px/1.2 Consolas,"Courier New",monospace}
      .gg-green-hud-box{padding:5px 6px;border:1px solid rgba(0,255,70,.14);background:#000500;color:#4fbd69}
      .gg-green-hud-box b{display:block;color:#83ff9f;font-size:8px;letter-spacing:.08em;margin-bottom:2px}
      #gg-green-cmd{display:flex;gap:5px;margin:0 0 8px}
      #gg-green-cmd input{flex:1;min-width:0;padding:6px 8px;background:#000300;color:#9dffb8;border:1px solid rgba(0,255,70,.24);font:10px Consolas,"Courier New",monospace;outline:none}
      #gg-green-cmd input:focus{border-color:#00ff46;box-shadow:0 0 8px rgba(0,255,70,.16)}
      #gg-green-cmd button{padding:6px 9px;background:#010401;color:#83ff9f;border:1px solid rgba(0,255,70,.28);font:10px Consolas,"Courier New",monospace;cursor:pointer}
      #gg-green-cmd button:hover{background:#00ff46;color:#001b07}
      #gg-green-hotkeys{margin:0 0 8px;color:#367d49;font:8px Consolas,"Courier New",monospace}
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
      while (log.children.length > 7) log.firstChild.remove();
      log.scrollTop = log.scrollHeight;
    };

    ['TERMINAL LINK ESTABLISHED','PANEL MATRIX ONLINE','LOCAL STATE READY','GARDEN MODULES ARMED'].forEach(addLog);

    let hud = root.querySelector('#gg-green-hud');
    if (!hud) {
      hud = document.createElement('div');
      hud.id = 'gg-green-hud';
      hud.innerHTML = `
        <div class="gg-green-hud-box"><b>TIME</b><span id="gg-hud-time">--:--:--</span></div>
        <div class="gg-green-hud-box"><b>FPS</b><span id="gg-hud-fps">--</span></div>
        <div class="gg-green-hud-box"><b>STATE</b><span id="gg-hud-state">READY</span></div>`;
      body.insertBefore(hud, body.querySelector('.tabs') || null);
    }

    let cmd = root.querySelector('#gg-green-cmd');
    if (!cmd) {
      cmd = document.createElement('div');
      cmd.id = 'gg-green-cmd';
      cmd.innerHTML = `<input id="gg-cmd-input" placeholder="type: help" autocomplete="off"><button id="gg-cmd-run">RUN</button>`;
      body.insertBefore(cmd, body.querySelector('.tabs') || null);
    }

    let hot = root.querySelector('#gg-green-hotkeys');
    if (!hot) {
      hot = document.createElement('div');
      hot.id = 'gg-green-hotkeys';
      hot.textContent = 'HOTKEYS: ESC close • M minimize • T terminal log';
      body.insertBefore(hot, body.querySelector('.tabs') || null);
    }

    const input = root.querySelector('#gg-cmd-input');
    const run = root.querySelector('#gg-cmd-run');
    const execute = () => {
      const v = (input?.value || '').trim().toLowerCase();
      if (!v) return;
      if (v === 'help') addLog('commands: help | status | time | clear');
      else if (v === 'status') addLog(`panel=${!!panel} host=${!!host} online=true`);
      else if (v === 'time') addLog(new Date().toLocaleTimeString([], {hour12:false}));
      else if (v === 'clear') log && (log.innerHTML='');
      else addLog(`unknown command: ${v}`);
      if (input) input.value='';
    };
    run?.addEventListener('click', execute);
    input?.addEventListener('keydown', e => { if(e.key === 'Enter') execute(); });

    const timeEl = root.querySelector('#gg-hud-time');
    const fpsEl = root.querySelector('#gg-hud-fps');
    const stateEl = root.querySelector('#gg-hud-state');
    let frames=0,last=performance.now();
    const fpsLoop=now=>{
      frames++;
      if(now-last>=1000){ if(fpsEl)fpsEl.textContent=String(frames);frames=0;last=now; }
      requestAnimationFrame(fpsLoop);
    };
    requestAnimationFrame(fpsLoop);

    const timer = setInterval(() => {
      if(timeEl) timeEl.textContent = new Date().toLocaleTimeString([], {hour12:false});
      if(stateEl) stateEl.textContent = status?.textContent?.includes('❌') ? 'ERROR' : 'ONLINE';
    }, 500);

    if(status && status.textContent === 'Ready') status.textContent = 'SYS://READY';

    const keyHandler = e => {
      if(e.key === 'Escape') root.querySelector('#close')?.click();
      else if(e.key.toLowerCase() === 'm' && document.activeElement !== input) root.querySelector('#min')?.click();
    };
    document.addEventListener('keydown', keyHandler);
    return true;
  };

  if (!apply()) {
    const timer = setInterval(() => {
      if (apply()) clearInterval(timer);
    }, 250);
    setTimeout(() => clearInterval(timer), 15000);
  }
})();
