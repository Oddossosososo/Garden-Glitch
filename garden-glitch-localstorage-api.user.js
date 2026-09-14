// ==UserScript==
// @name         GardenGlitch LocalStorage API
// @namespace    GardenGlitch
// @version      1.0.1
// @description  Safe explicit GardenGlitch localStorage API with live change events
// @match        *://*/*
// @grant        none
// ==/UserScript==

(() => {
  'use strict';

  if (window.GardenGlitchStorageAPI) return;

  const EVENTS = 'GardenGlitch:state-change';
  const GAME_KEY = '3x3-garden.UserDataPackage';
  const watched = new Set([GAME_KEY, 'GardenGlitch_PlayerHookTest']);

  const emit = (key, oldValue, newValue) => {
    if (!watched.has(key)) return;
    window.dispatchEvent(new CustomEvent(EVENTS, {
      detail: { key, oldValue, newValue, timestamp: Date.now() }
    }));
  };

  const parse = (key, fallback = {}) => {
    try {
      const raw = localStorage.getItem(key);
      return raw == null ? fallback : JSON.parse(raw);
    } catch {
      return fallback;
    }
  };

  const writeRaw = (key, value) => {
    const oldValue = localStorage.getItem(key);
    localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
    emit(key, oldValue, localStorage.getItem(key));
  };

  const remove = key => {
    const oldValue = localStorage.getItem(key);
    localStorage.removeItem(key);
    emit(key, oldValue, null);
  };

  const api = {
    eventName: EVENTS,
    keys: Object.freeze({ GAME_KEY }),
    read(key, fallback = null) {
      return parse(key, fallback);
    },
    readRaw(key, fallback = null) {
      const value = localStorage.getItem(key);
      return value === null ? fallback : value;
    },
    write(key, value) {
      writeRaw(key, value);
      return value;
    },
    remove,
    getGame() {
      return parse(GAME_KEY, {});
    },
    setGame(game) {
      writeRaw(GAME_KEY, game || {});
    },
    onChange(callback) {
      const handler = event => callback(event.detail);
      window.addEventListener(EVENTS, handler);
      return () => window.removeEventListener(EVENTS, handler);
    }
  };

  window.GardenGlitchStorageAPI = api;
})();
