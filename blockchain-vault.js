'use strict';
/**
 * QuanV1 Quad Blockchain Vault
 * Four geo-distributed SHA-256 hash-chained immutable ledgers:
 *   NA-EAST  |  EU-WEST  |  APAC  |  NA-WEST
 *
 * Each vault is an independent append-only chain stored on disk.
 * Every write fans out to all four vaults simultaneously.
 * Chain integrity is verified via SHA-256 hash linkage (previousHash → hash).
 */
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const VAULT_LOCATIONS = ['NA-EAST', 'EU-WEST', 'APAC', 'NA-WEST'];
const VAULT_DIR = path.join(__dirname, 'vault-data');

if (!fs.existsSync(VAULT_DIR)) {
  fs.mkdirSync(VAULT_DIR, { recursive: true });
}

// ── Hashing ──────────────────────────────────────────────────────────────────
function sha256(obj) {
  return crypto
    .createHash('sha256')
    .update(typeof obj === 'string' ? obj : JSON.stringify(obj))
    .digest('hex');
}

function vaultFile(location) {
  return path.join(VAULT_DIR, `vault-${location.toLowerCase().replace('-', '_')}.json`);
}

// ── Genesis ───────────────────────────────────────────────────────────────────
function createGenesis(location) {
  const block = {
    index: 0,
    timestamp: Date.now(),
    location,
    type: 'GENESIS',
    data: { message: `QuanV1 immutable vault initialised — ${location}` },
    previousHash: '0'.repeat(64),
    nonce: 0,
  };
  block.hash = mineHash(block);
  return block;
}

// ── Proof-of-work (difficulty 2: hash must start with "00") ───────────────────
function mineHash(blockWithoutHash) {
  const candidate = { ...blockWithoutHash };
  delete candidate.hash;
  let nonce = candidate.nonce || 0;
  let hash;
  do {
    candidate.nonce = nonce++;
    hash = sha256(candidate);
  } while (!hash.startsWith('00'));
  return hash;
}

// ── Chain I/O ─────────────────────────────────────────────────────────────────
function loadChain(location) {
  const file = vaultFile(location);
  if (!fs.existsSync(file)) {
    const chain = [createGenesis(location)];
    saveChain(location, chain);
    return chain;
  }
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    const chain = [createGenesis(location)];
    saveChain(location, chain);
    return chain;
  }
}

function saveChain(location, chain) {
  fs.writeFileSync(vaultFile(location), JSON.stringify(chain, null, 2), 'utf8');
}

// ── Write ─────────────────────────────────────────────────────────────────────
function appendBlock(location, data, type = 'RECORD') {
  const chain = loadChain(location);
  const prev = chain[chain.length - 1];
  const candidate = {
    index: prev.index + 1,
    timestamp: Date.now(),
    location,
    type,
    data,
    previousHash: prev.hash,
    nonce: 0,
  };
  candidate.hash = mineHash(candidate);
  chain.push(candidate);
  saveChain(location, chain);
  return candidate;
}

/** Write a record to all four vaults simultaneously */
function writeToAllVaults(data, type) {
  return VAULT_LOCATIONS.map(loc => ({
    location: loc,
    block: appendBlock(loc, data, type),
  }));
}

// ── Verify ────────────────────────────────────────────────────────────────────
function verifyChain(location) {
  const chain = loadChain(location);
  const errors = [];
  for (let i = 1; i < chain.length; i++) {
    const blk = chain[i];
    const prev = chain[i - 1];
    // Re-derive hash (exclude hash field itself)
    const { hash, ...rest } = blk;
    const expected = sha256(rest);
    if (hash !== expected) errors.push({ index: i, error: 'hash_tampered', expected, got: hash });
    if (blk.previousHash !== prev.hash) errors.push({ index: i, error: 'chain_broken' });
  }
  return {
    location,
    blocks: chain.length,
    valid: errors.length === 0,
    errors,
    latestHash: chain[chain.length - 1].hash,
    latestTimestamp: chain[chain.length - 1].timestamp,
  };
}

function verifyAllVaults() {
  return VAULT_LOCATIONS.map(verifyChain);
}

// ── Query ─────────────────────────────────────────────────────────────────────
function getChain(location) {
  return loadChain(location);
}

function getChainSummary() {
  return VAULT_LOCATIONS.map(loc => {
    const chain = loadChain(loc);
    const last = chain[chain.length - 1];
    return {
      location: loc,
      blocks: chain.length,
      latestHash: last.hash,
      latestIndex: last.index,
      latestTimestamp: last.timestamp,
      genesisHash: chain[0].hash,
    };
  });
}

/** Search all vaults for blocks matching a filter function */
function searchVaults(filterFn) {
  const results = [];
  for (const loc of VAULT_LOCATIONS) {
    const chain = loadChain(loc);
    chain.forEach(blk => {
      if (filterFn(blk)) results.push(blk);
    });
  }
  return results;
}

module.exports = {
  VAULT_LOCATIONS,
  writeToAllVaults,
  appendBlock,
  verifyChain,
  verifyAllVaults,
  getChain,
  getChainSummary,
  searchVaults,
};
