// ==UserScript==
// @name         GardenGlitch Terminal Features + Chat
// @namespace    GardenGlitch
// @version      1.2.0
// @description  Terminal HUD, command history, diagnostics, quick actions, animal IDs and Chat
// @match        *://*/*
// @grant        none
// ==/UserScript==

(() => {
  'use strict';

  const ANIMALS = [
    'Chick',
    'Hen',
    'Rooster',
    'Sheep',
    'Pig',
    'Donkey',
    'Duck',
    'Buffalo',
    'Cow'
  ];

  const SUPABASE_URL =
    'https://thuydbkycsjzvfjqfoax.supabase.co';

  const SUPABASE_KEY =
    'sb_publishable_s2GYjmzF7TYBoyPzsIs0mQ_bNRz_lER';

  const CHAT_TABLE = 'garden_glitch_chat';

  const GUEST_KEY = 'GardenGlitch_GuestID';
  const NAME_KEY = 'GardenGlitch.Chat.Username';

  const guestId =
    localStorage.getItem(GUEST_KEY) ||
    (() => {
      const id = crypto.randomUUID();
      localStorage.setItem(GUEST_KEY, id);
      return id;
    })();

  const headers = {
    apikey: SUPABASE_KEY,
    Authorization: 'Bearer ' + SUPABASE_KEY,
    'Content-Type': 'application/json'
  };

  const esc = s =>
    String(s ?? '').replace(
      /[&<>"']/g,
      c => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      })[c]
    );

  const waitForPanel = async () => {
    for (let i = 0; i < 100; i++) {
      const host = document.getElementById('ggHost');

      if (host?.shadowRoot) {
        return host.shadowRoot;
      }

      await new Promise(resolve =>
        setTimeout(resolve, 100)
      );
    }

    return null;
  };

  const apply = async () => {
    const root = await waitForPanel();

    if (!root) {
      console.warn(
        'GardenGlitch Terminal: panel shadow root not found'
      );
      return false;
    }

    const body = root.querySelector('#b');
    const panel = root.querySelector('#p');

    if (!body || !panel) {
      console.warn(
        'GardenGlitch Terminal: panel elements not found'
      );
      return false;
    }

    if (root.getElementById('gg-terminal-features')) {
      return true;
    }

    /* =========================
       STYLES
       ========================= */

    const style = document.createElement('style');

    style.id = 'gg-terminal-features';

    style.textContent = `
      #gg-term-extra {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 5px;
        margin: 0 0 8px;
        font: 9px Consolas, "Courier New", monospace;
      }

      #gg-term-extra button {
        padding: 6px;
        background: #000500;
        color: #72ff91;
        border: 1px solid #00ff4638;
        border-radius: 2px;
        font: inherit;
        cursor: pointer;
      }

      #gg-term-extra button:hover {
        background: #00ff46;
        color: #001b07;
      }

      #gg-term-history {
        margin: 0 0 8px;
        padding: 5px 7px;
        max-height: 70px;
        overflow: auto;
        background: #000300;
        border: 1px solid #00ff4620;
        color: #45c96c;
        font: 8px/1.4 Consolas, "Courier New", monospace;
      }

      .gg-hist {
        white-space: nowrap;
      }

      .gg-hist::before {
        content: "> ";
        color: #00ff46;
      }

      #gg-chat-page {
        display: none;
        flex-direction: column;
        height: 100%;
        box-sizing: border-box;
        padding: 14px;
        gap: 10px;
        font-family: Consolas, "Courier New", monospace;
      }

      #gg-chat-page.gg-chat-open {
        display: flex;
      }

      #gg-chat-list {
        flex: 1;
        min-height: 120px;
        overflow: auto;
        background: #070b16;
        border: 1px solid #27334a;
        border-radius: 10px;
        padding: 8px;
        box-sizing: border-box;
      }

      .gg-chat-msg {
        padding: 7px 6px;
        border-bottom: 1px solid #182236;
        word-break: break-word;
      }

      .gg-chat-msg:last-child {
        border-bottom: 0;
      }

      .gg-chat-user {
        color: #7cffc4;
        font-weight: bold;
      }

      .gg-chat-time {
        opacity: .5;
        font-size: 10px;
        margin-left: 6px;
      }

      #gg-chat-controls,
      #gg-chat-compose {
        display: flex;
        gap: 6px;
      }

      #gg-chat-controls input,
      #gg-chat-compose input {
        flex: 1;
        min-width: 0;
      }

      #gg-chat-page button {
        cursor: pointer;
      }

      #gg-chat-status {
        font-size: 9px;
        opacity: .7;
      }

      #ggChatTab {
        cursor: pointer;
      }
    `;

    root.appendChild(style);

    /* =========================
       ANIMAL IDs
       ========================= */

    const fixAnimals = () => {
      const select = root.querySelector('#animal');

      if (!select) {
        return false;
      }

      const current = select.value;

      const html = ANIMALS
        .map(
          (name, id) =>
            `<option value="${id}">${id} • ${name}</option>`
        )
        .join('');

      if (select.innerHTML !== html) {
        select.innerHTML = html;
      }

      if (
        [...select.options].some(
          option => option.value === current
        )
      ) {
        select.value = current;
      } else {
        select.value = '0';
      }

      return true;
    };

    fixAnimals();

    const animalWatch = new MutationObserver(() => {
      fixAnimals();
    });

    animalWatch.observe(body, {
      childList: true,
      subtree: true
    });

    /* =========================
       TERMINAL QUICK ACTIONS
       ========================= */

    let box = root.querySelector('#gg-term-extra');

    if (!box) {
      box = document.createElement('div');

      box.id = 'gg-term-extra';

      box.innerHTML = `
        <button id="gg-stat">[SYS] STATUS</button>
        <button id="gg-storage">[SYS] STORAGE</button>
        <button id="gg-garden">[RUN] GARDEN</button>
        <button id="gg-inventory">[RUN] INVENTORY</button>
      `;

      const tabs = body.querySelector('.tabs');

      body.insertBefore(box, tabs || null);
    }

    /* =========================
       COMMAND HISTORY
       ========================= */

    let history = root.querySelector('#gg-term-history');

    if (!history) {
      history = document.createElement('div');

      history.id = 'gg-term-history';

      body.insertBefore(
        history,
        root.querySelector('.tabs') || null
      );
    }

    const add = text => {
      const item = document.createElement('div');

      item.className = 'gg-hist';
      item.textContent = text;

      history.appendChild(item);

      while (history.children.length > 8) {
        history.firstChild.remove();
      }

      history.scrollTop = history.scrollHeight;
    };

    const status = () => {
      add(
        `host=${!!document.getElementById('ggHost')} ` +
        `panel=${!!panel} ` +
        `online=${navigator.onLine}`
      );

      const statusElement = root.querySelector('#st');

      if (statusElement) {
        statusElement.textContent =
          '[SYS://STATUS] ONLINE';
      }
    };

    const storage = () => {
      let size = 0;

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);

        if (key) {
          size +=
            key.length +
            (localStorage.getItem(key) || '').length;
        }
      }

      add(
        `localStorage ~${size.toLocaleString()} chars`
      );

      const statusElement = root.querySelector('#st');

      if (statusElement) {
        statusElement.textContent =
          '[SYS://STORAGE] SCANNED';
      }
    };

    root.querySelector('#gg-stat').onclick = status;

    root.querySelector('#gg-storage').onclick = storage;

    root.querySelector('#gg-garden').onclick = () => {
      root.querySelector('#ga')?.click();
      add('garden grow command sent');
    };

    root.querySelector('#gg-inventory').onclick = () => {
      root.querySelector('[data-p="i"]')?.click();
      add('inventory module opened');
    };

    /* =========================
       CHAT PAGE
       ========================= */

    let chatPage = root.querySelector('#gg-chat-page');

    if (!chatPage) {
      chatPage = document.createElement('div');

      chatPage.id = 'gg-chat-page';

      chatPage.innerHTML = `
        <h2 style="margin:0">
          💬 GardenGlitch Chat
        </h2>

        <div id="gg-chat-controls">
          <input
            id="gg-chat-name"
            maxlength="24"
            placeholder="Username"
          >

          <button id="gg-chat-refresh">
            Refresh
          </button>
        </div>

        <div id="gg-chat-status">
          Connecting...
        </div>

        <div id="gg-chat-list">
          Loading chat...
        </div>

        <div id="gg-chat-compose">
          <input
            id="gg-chat-input"
            maxlength="300"
            placeholder="Type a message..."
          >

          <button id="gg-chat-send">
            Send
          </button>
        </div>
      `;

      root.appendChild(chatPage);
    }

    const chatName =
      root.querySelector('#gg-chat-name');

    const chatInput =
      root.querySelector('#gg-chat-input');

    const chatList =
      root.querySelector('#gg-chat-list');

    const chatStatus =
      root.querySelector('#gg-chat-status');

    if (!chatName || !chatInput || !chatList) {
      return true;
    }

    chatName.value =
      localStorage.getItem(NAME_KEY) || '';

    /* =========================
       LOAD CHAT
       ========================= */

    const loadChat = async () => {
      try {
        chatStatus.textContent = 'Loading...';

        const url =
          `${SUPABASE_URL}/rest/v1/${CHAT_TABLE}` +
          `?select=id,guest_id,username,message,created_at` +
          `&order=created_at.asc` +
          `&limit=100`;

        const response = await fetch(url, {
          headers
        });

        if (!response.ok) {
          throw new Error(
            await response.text()
          );
        }

        const messages =
          await response.json();

        if (!messages.length) {
          chatList.innerHTML =
            '<div>No messages yet.</div>';
        } else {
          chatList.innerHTML =
            messages
              .map(message => `
                <div class="gg-chat-msg">
                  <span class="gg-chat-user">
                    ${esc(message.username)}
                  </span>

                  <span class="gg-chat-time">
                    ${esc(
                      new Date(
                        message.created_at
                      ).toLocaleTimeString()
                    )}
                  </span>

                  <div>
                    ${esc(message.message)}
                  </div>
                </div>
              `)
              .join('');
        }

        chatList.scrollTop =
          chatList.scrollHeight;

        chatStatus.textContent =
          '● Connected';

      } catch (error) {
        chatStatus.textContent =
          '● Chat unavailable';

        chatList.innerHTML =
          `<div style="color:#ff8b8b">
            ${esc(error.message)}
          </div>`;

        console.error(
          'GardenGlitch Chat:',
          error
        );
      }
    };

    /* =========================
       SEND CHAT
       ========================= */

    let lastSend = 0;

    const sendChat = async () => {
      const username =
        chatName.value
          .trim()
          .slice(0, 24);

      const message =
        chatInput.value
          .trim()
          .slice(0, 300);

      if (!username) {
        chatStatus.textContent =
          'Enter a username first.';
        return;
      }

      if (!message) {
        return;
      }

      if (Date.now() - lastSend < 2000) {
        chatStatus.textContent =
          'Please wait before sending again.';
        return;
      }

      lastSend = Date.now();

      localStorage.setItem(
        NAME_KEY,
        username
      );

      chatInput.value = '';

      try {
        const response = await fetch(
          `${SUPABASE_URL}/rest/v1/${CHAT_TABLE}`,
          {
            method: 'POST',

            headers: {
              ...headers,
              Prefer: 'return=minimal'
            },

            body: JSON.stringify({
              guest_id: guestId,
              username,
              message
            })
          }
        );

        if (!response.ok) {
          throw new Error(
            await response.text()
          );
        }

        await loadChat();

      } catch (error) {
        chatStatus.textContent =
          '● Send failed';

        chatInput.value = message;

        console.error(
          'GardenGlitch Chat:',
          error
        );
      }
    };

    root.querySelector(
      '#gg-chat-send'
    ).onclick = sendChat;

    root.querySelector(
      '#gg-chat-refresh'
    ).onclick = loadChat;

    chatInput.addEventListener(
      'keydown',
      event => {
        if (event.key === 'Enter') {
          event.preventDefault();
          sendChat();
        }
      }
    );

    /* =========================
       CHAT BUTTON
       ========================= */

    if (!root.getElementById('ggChatTab')) {
      const chatButton =
        document.createElement('button');

      chatButton.id = 'ggChatTab';
      chatButton.textContent = '💬 Chat';

      chatButton.onclick = () => {
        chatPage.classList.add(
          'gg-chat-open'
        );

        loadChat();
      };

      const possibleTabs =
        [...root.querySelectorAll(
          '[role="tab"], button'
        )];

      const target =
        possibleTabs.find(button =>
          /account|save|inventory|animals/i
            .test(button.textContent || '')
        )?.parentElement;

      if (target) {
        target.appendChild(chatButton);
      } else {
        body.insertBefore(
          chatButton,
          body.firstChild
        );
      }
    }

    /* =========================
       TERMINAL COMMANDS
       ========================= */

    const commandInput =
      root.querySelector('#gg-cmd-input');

    if (
      commandInput &&
      !commandInput.dataset.ggHistory
    ) {
      commandInput.dataset.ggHistory = '1';

      const commands = [];
      let position = -1;

      commandInput.addEventListener(
        'keydown',
        event => {

          if (event.key === 'Enter') {

            const raw =
              commandInput.value.trim();

            if (!raw) {
              return;
            }

            commands.push(raw);
            position = commands.length;

            add(raw);

            const command =
              raw.toLowerCase();

            /* CHAT */

            if (
              command === 'chat' ||
              command === '💬 chat'
            ) {
              chatPage.classList.add(
                'gg-chat-open'
              );

              loadChat();

              const statusElement =
                root.querySelector('#st');

              if (statusElement) {
                statusElement.textContent =
                  '[CHAT] OPEN';
              }

              return;
            }

            /* CHAT HELP */

            if (command === 'chat help') {
              add(
                'chat = open chat'
              );

              add(
                'chat help = show chat help'
              );

              return;
            }

            /* STATUS */

            if (command === 'status') {
              status();
              return;
            }

            /* STORAGE */

            if (command === 'storage') {
              storage();
              return;
            }

            /* GARDEN */

            if (command === 'garden') {
              root
                .querySelector('#ga')
                ?.click();

              add(
                'garden grow command sent'
              );

              return;
            }

            /* INVENTORY */

            if (command === 'inventory') {
              root
                .querySelector(
                  '[data-p="i"]'
                )
                ?.click();

              add(
                'inventory module opened'
              );

              return;
            }

            /* UNKNOWN */

            add(
              `unknown command: ${raw}`
            );

            return;
          }

          /* COMMAND HISTORY UP */

          if (event.key === 'ArrowUp') {

            if (!commands.length) {
              return;
            }

            event.preventDefault();

            position =
              Math.max(
                0,
                position - 1
              );

            commandInput.value =
              commands[position] || '';

            return;
          }

          /* COMMAND HISTORY DOWN */

          if (event.key === 'ArrowDown') {

            if (!commands.length) {
              return;
            }

            event.preventDefault();

            position =
              Math.min(
                commands.length,
                position + 1
              );

            commandInput.value =
              commands[position] || '';
          }
        }
      );
    }

    /* =========================
       STARTUP
       ========================= */

    add('terminal extensions loaded');
    add('animal IDs locked: 0-8');
    add('chat module loaded');
    add('type "chat" to open Chat');

    /* =========================
       AUTO REFRESH CHAT
       ========================= */

    setInterval(() => {
      if (
        chatPage.classList.contains(
          'gg-chat-open'
        )
      ) {
        loadChat();
      }
    }, 5000);

    return true;
  };

  apply();

})();
```
