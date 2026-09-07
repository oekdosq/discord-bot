import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { config } from '../config.js';

let cache = null;

function load() {
  if (cache) return cache;
  cache = existsSync(config.dataFile) ? JSON.parse(readFileSync(config.dataFile, 'utf8')) : {};
  return cache;
}

function save() {
  mkdirSync(dirname(config.dataFile), { recursive: true });
  writeFileSync(config.dataFile, JSON.stringify(cache, null, 2));
}

export function getGuild(guildId) {
  return load()[guildId] ?? {};
}

export function allGuilds() {
  return load();
}

export function setGuild(guildId, patch = {}) {
  const cur = getGuild(guildId);
  cache[guildId] = { ...cur, ...patch };
  save();
}

export function clearGuild(guildId) {
  load();
  delete cache[guildId];
  save();
}

export function removeKey(guildId, key) {
  const cur = getGuild(guildId);
  if (!(key in cur)) return;
  delete cur[key];
  setGuild(guildId, cur);
}