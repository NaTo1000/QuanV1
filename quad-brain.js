'use strict';
/**
 * QuanV1 Quad Brain Octo-Inference Matrix
 *
 * Four specialised reasoning engines:
 *   LogicBrain   — formal deductive rule chains
 *   BayesBrain   — posterior probability updating
 *   QuantumBrain — superposition of semantic interpretations, complex amplitudes
 *   PatternBrain — stochastic Monte-Carlo pattern correlation with memory
 *
 * Each brain exposes two inference channels (primary + adversarial),
 * yielding eight channels total → 8×8 OctoMatrix cross-correlation.
 *
 * A DeliberationEngine runs consensus rounds with domain-delegated weighting.
 * The VortexState generator converts matrix amplitudes to polar coordinates
 * for real-time canvas animation.
 */
const os = require('os');

// ── Math helpers ──────────────────────────────────────────────────────────────
function dot(a, b) {
  const n = Math.min(a.length, b.length);
  let s = 0;
  for (let i = 0; i < n; i++) s += a[i] * b[i];
  return s;
}
function norm(a) { return Math.sqrt(a.reduce((s, x) => s + x * x, 0)) || 1e-9; }
function cosine(a, b) { return dot(a, b) / (norm(a) * norm(b)); }
function entropy(probs) {
  return -probs
    .map(p => Math.abs(p) + 1e-12)
    .reduce((s, p) => {
      const n = p / (probs.reduce((a, v) => a + Math.abs(v), 0) || 1);
      return s + n * Math.log2(n + 1e-12);
    }, 0);
}
function pad8(v) {
  const a = Array.from(v).slice(0, 8);
  while (a.length < 8) a.push(0);
  return a;
}

// ── Tokeniser (shared with rag-swarm) ────────────────────────────────────────
const STOP = new Set(['the','a','an','is','are','was','in','on','at','to','for','of','with','and','or','not','it','this','that']);
function tok(text) {
  return String(text).toLowerCase().replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/).filter(t => t.length > 2 && !STOP.has(t));
}
function tfidf(query, corpus) {
  const qTerms = tok(query);
  return corpus.map(doc => {
    const dTerms = tok(doc.text);
    const dLen = dTerms.length || 1;
    const score = qTerms.reduce((s, qt) => {
      const tf = dTerms.filter(t => t === qt).length / dLen;
      const df = corpus.filter(d => tok(d.text).includes(qt)).length || 1;
      return s + tf * Math.log(corpus.length / df + 1);
    }, 0);
    return { ...doc, score };
  }).sort((a, b) => b.score - a.score);
}

// ── Brain colours & meta ──────────────────────────────────────────────────────
const BRAIN_META = {
  LogicBrain:   { color: '#3b82f6', adversColor: '#93c5fd', angle: 0 },
  BayesBrain:   { color: '#10b981', adversColor: '#6ee7b7', angle: Math.PI / 2 },
  QuantumBrain: { color: '#8b5cf6', adversColor: '#c4b5fd', angle: Math.PI },
  PatternBrain: { color: '#f59e0b', adversColor: '#fcd34d', angle: 3 * Math.PI / 2 },
};

// ── Brain 1 – Logic ───────────────────────────────────────────────────────────
class LogicBrain {
  constructor(corpus) { this.name = 'LogicBrain'; this.corpus = corpus; }
  infer(query) {
    const ranked = tfidf(query, this.corpus).slice(0, 8);
    const conf = Math.min(0.97, (ranked[0]?.score || 0) * 1.8);
    const chain = ranked.slice(0, 3).map(r =>
      `IF "${tok(query).slice(0, 2).join(' ')}" IN "${r.id}" THEN relevant (${r.score.toFixed(3)})`);
    return {
      brain: this.name, channel: 'primary',
      hypothesis: ranked[0]?.id || 'unknown',
      confidence: conf,
      evidence: ranked.map(r => ({ id: r.id, score: r.score })),
      reasoning: 'Deductive chain: ' + chain.join(' → '),
      vector: pad8(ranked.map(r => r.score)),
      entropy: entropy(pad8(ranked.map(r => r.score))),
    };
  }
}

// ── Brain 2 – Bayes ───────────────────────────────────────────────────────────
class BayesBrain {
  constructor(corpus) {
    this.name = 'BayesBrain'; this.corpus = corpus;
    this.priors = {};
  }
  infer(query) {
    const ranked = tfidf(query, this.corpus).slice(0, 8);
    const expTotal = ranked.reduce((s, r) => s + Math.exp(r.score), 0) || 1;
    const posts = ranked.map(r => {
      const prior = this.priors[r.id] || 0.1;
      const like  = Math.exp(r.score) / expTotal;
      return { id: r.id, posterior: like * prior };
    });
    const pSum = posts.reduce((s, p) => s + p.posterior, 0) || 1;
    posts.forEach(p => { p.posterior /= pSum; this.priors[p.id] = 0.9 * (this.priors[p.id] || 0.1) + 0.1 * p.posterior; });
    posts.sort((a, b) => b.posterior - a.posterior);
    return {
      brain: this.name, channel: 'primary',
      hypothesis: posts[0]?.id || 'unknown',
      confidence: posts[0]?.posterior || 0,
      evidence: posts,
      reasoning: `P(${posts[0]?.id}|q) = ${(posts[0]?.posterior || 0).toFixed(4)} after Bayesian update`,
      vector: pad8(posts.map(p => p.posterior)),
      entropy: entropy(pad8(posts.map(p => p.posterior))),
    };
  }
}

// ── Brain 3 – Quantum ─────────────────────────────────────────────────────────
class QuantumBrain {
  constructor(corpus) {
    this.name = 'QuantumBrain'; this.corpus = corpus;
    this.globalPhase = 0;
  }
  infer(query) {
    const ranked = tfidf(query, this.corpus).slice(0, 8);
    // Complex amplitudes: α_j = √score_j · e^{iφ_j}
    const amps = ranked.map((r, j) => ({
      id: r.id,
      re: Math.sqrt(Math.max(0, r.score)) * Math.cos(this.globalPhase + j * Math.PI / 4),
      im: Math.sqrt(Math.max(0, r.score)) * Math.sin(this.globalPhase + j * Math.PI / 4),
      prob: Math.max(0, r.score),
    }));
    const norm2 = amps.reduce((s, a) => s + a.re ** 2 + a.im ** 2, 0) || 1;
    amps.forEach(a => { a.normProb = (a.re ** 2 + a.im ** 2) / norm2; });
    amps.sort((a, b) => b.normProb - a.normProb);
    this.globalPhase += 0.314; // π/10 phase drift per query
    return {
      brain: this.name, channel: 'primary',
      hypothesis: amps[0]?.id || 'superposition',
      confidence: Math.sqrt(amps[0]?.normProb || 0),
      evidence: amps,
      reasoning: `Superposition of ${amps.length} hypotheses at phase Φ=${this.globalPhase.toFixed(3)} rad. Measurement: ${amps[0]?.id}`,
      vector: pad8(amps.map(a => a.normProb)),
      entropy: entropy(pad8(amps.map(a => a.normProb))),
    };
  }
}

// ── Brain 4 – Pattern ─────────────────────────────────────────────────────────
class PatternBrain {
  constructor(corpus) {
    this.name = 'PatternBrain'; this.corpus = corpus;
    this.memory = [];
  }
  infer(query) {
    const ranked = tfidf(query, this.corpus).slice(0, 8).map(r => ({
      ...r,
      stochScore: r.score * (0.85 + Math.random() * 0.30),
    }));
    // Memory boost
    this.memory.forEach(id => {
      const m = ranked.find(r => r.id === id);
      if (m) m.stochScore *= 1.15;
    });
    ranked.sort((a, b) => b.stochScore - a.stochScore);
    this.memory = [ranked[0]?.id, ...this.memory].filter(Boolean).slice(0, 12);
    const conf = Math.min(0.97, (ranked[0]?.stochScore || 0) * 1.4);
    return {
      brain: this.name, channel: 'primary',
      hypothesis: ranked[0]?.id || 'uncertain',
      confidence: conf,
      evidence: ranked,
      reasoning: `Stochastic MC sampling + ${this.memory.length}-item pattern memory. Peak: ${ranked[0]?.id} (${(ranked[0]?.stochScore || 0).toFixed(4)})`,
      vector: pad8(ranked.map(r => r.stochScore)),
      entropy: entropy(pad8(ranked.map(r => r.stochScore + 1e-9))),
    };
  }
}

// ── Octo-Inference Matrix (8×8) ────────────────────────────────────────────────
class OctoMatrix {
  constructor() {
    this.size = 8;
    this.matrix = Array.from({ length: 8 }, () => new Array(8).fill(0));
    this.channelLabels = [
      'Logic-P','Logic-A','Bayes-P','Bayes-A',
      'Quantum-P','Quantum-A','Pattern-P','Pattern-A',
    ];
  }
  update(channels8) {
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        this.matrix[i][j] = (i === j) ? 1.0
          : Math.max(0, parseFloat(cosine(channels8[i] || [], channels8[j] || []).toFixed(4)));
      }
    }
    return this.matrix;
  }
  consensus() {
    let s = 0, c = 0;
    for (let i = 0; i < 8; i++) for (let j = i + 1; j < 8; j++) { s += this.matrix[i][j]; c++; }
    return c ? s / c : 0;
  }
  conflicts() {
    const out = [];
    for (let i = 0; i < 8; i++) for (let j = i + 1; j < 8; j++) {
      if (this.matrix[i][j] < 0.25) out.push({ i, j, label_i: this.channelLabels[i], label_j: this.channelLabels[j], corr: this.matrix[i][j] });
    }
    return out;
  }
}

// ── Deliberation & Delegation ─────────────────────────────────────────────────
class DeliberationEngine {
  constructor() {
    this.rounds = [];
    // Domain expertise weights — higher weight = more authority on that topic
    this.domainWeights = {
      LogicBrain:   { math: 1.3, formal: 1.2, proof: 1.3, circuit: 1.1, classical: 1.2 },
      BayesBrain:   { probability: 1.4, noise: 1.3, error: 1.2, measurement: 1.2, statistics: 1.3 },
      QuantumBrain: { quantum: 1.5, entanglement: 1.4, superposition: 1.5, algorithm: 1.3, qubit: 1.4 },
      PatternBrain: { analogy: 1.3, intuition: 1.2, practical: 1.3, pattern: 1.4, hardware: 1.2 },
    };
  }
  getDomainWeight(brainName, query) {
    const weights = this.domainWeights[brainName] || {};
    return Math.min(2.0, tok(query).reduce((w, t) => w * (weights[t] || 1.0), 1.0));
  }
  deliberate(query, inferences, matrix) {
    const round = {
      roundNumber: this.rounds.length + 1,
      consensusStrength: matrix.consensus(),
      conflictCount: matrix.conflicts().length,
      arguments: [],
      votes: {},
      outcome: null,
    };
    // Each brain argues for its hypothesis with delegated weight
    inferences.forEach(inf => {
      const dw = this.getDomainWeight(inf.brain, query);
      const wc = inf.confidence * dw;
      round.arguments.push({
        brain: inf.brain,
        hypothesis: inf.hypothesis,
        confidence: inf.confidence,
        delegationWeight: parseFloat(dw.toFixed(3)),
        weightedVote: parseFloat(wc.toFixed(4)),
        summary: inf.reasoning.slice(0, 120),
      });
      round.votes[inf.hypothesis] = (round.votes[inf.hypothesis] || 0) + wc;
    });
    const sortedVotes = Object.entries(round.votes).sort(([, a], [, b]) => b - a);
    const totalVotes = Object.values(round.votes).reduce((s, v) => s + v, 0) || 1;
    round.outcome = {
      winner: sortedVotes[0]?.[0] || 'no_consensus',
      confidence: parseFloat(((sortedVotes[0]?.[1] || 0) / totalVotes).toFixed(4)),
      consensusStrength: parseFloat(matrix.consensus().toFixed(4)),
      predictionQuality: parseFloat((matrix.consensus() * (sortedVotes[0]?.[1] || 0) / totalVotes).toFixed(4)),
      stochasticEntropy: parseFloat((inferences.reduce((s, i) => s + i.entropy, 0) / 4).toFixed(4)),
    };
    this.rounds.push(round);
    if (this.rounds.length > 500) this.rounds.shift();
    return round;
  }
}

// ── Vortex State ──────────────────────────────────────────────────────────────
function buildVortexState(inferences, matrix, deliberation) {
  const channels = [];
  inferences.forEach((inf, bi) => {
    const meta = BRAIN_META[inf.brain] || {};
    channels.push({
      channelIndex: bi * 2,
      label: `${inf.brain} primary`,
      brain: inf.brain,
      type: 'primary',
      angle: meta.angle || 0,
      radius: Math.max(0.08, inf.confidence),
      amplitude: inf.confidence,
      phase: inf.entropy,
      color: meta.color || '#fff',
      rotating: true,
      hypothesis: inf.hypothesis,
    });
    channels.push({
      channelIndex: bi * 2 + 1,
      label: `${inf.brain} adversarial`,
      brain: inf.brain,
      type: 'adversarial',
      angle: (meta.angle || 0) + Math.PI / 4,
      radius: Math.max(0.04, 1 - inf.confidence),
      amplitude: 1 - inf.confidence,
      phase: inf.entropy + Math.PI,
      color: meta.adversColor || '#aaa',
      rotating: false,
      hypothesis: `¬${inf.hypothesis}`,
    });
  });
  return {
    channels,
    matrix: matrix.matrix,
    channelLabels: matrix.channelLabels,
    consensus: parseFloat(matrix.consensus().toFixed(4)),
    collapsed: matrix.consensus() > 0.72,
    deliberationRound: deliberation.roundNumber,
    winner: deliberation.outcome.winner,
    predictionQuality: deliberation.outcome.predictionQuality,
    stochasticEntropy: deliberation.outcome.stochasticEntropy,
    timestamp: Date.now(),
  };
}

// ── Main QuadBrain Orchestrator ───────────────────────────────────────────────
class QuadBrainOrchestrator {
  constructor(corpus) {
    this.corpus = corpus;
    this.logic   = new LogicBrain(corpus);
    this.bayes   = new BayesBrain(corpus);
    this.quantum = new QuantumBrain(corpus);
    this.pattern = new PatternBrain(corpus);
    this.matrix  = new OctoMatrix();
    this.deliberation = new DeliberationEngine();
    this.history = [];
    this.computeProfile = {
      cpuCount: os.cpus().length,
      totalMemGB: (os.totalmem() / 1024 ** 3).toFixed(1),
      scalingMode: os.cpus().length >= 8 ? 'high' : os.cpus().length >= 4 ? 'medium' : 'low',
    };
  }

  async query(queryText, ctx = {}) {
    const t0 = Date.now();

    // All 4 brains run in parallel
    const [logicR, bayesR, quantumR, patternR] = await Promise.all([
      Promise.resolve(this.logic.infer(queryText)),
      Promise.resolve(this.bayes.infer(queryText)),
      Promise.resolve(this.quantum.infer(queryText)),
      Promise.resolve(this.pattern.infer(queryText)),
    ]);
    const inferences = [logicR, bayesR, quantumR, patternR];

    // 8 channels: 4 primary + 4 adversarial (inverted)
    const channels8 = [
      logicR.vector,   logicR.vector.map(v => 1 - v),
      bayesR.vector,   bayesR.vector.map(v => 1 - v),
      quantumR.vector, quantumR.vector.map(v => 1 - v),
      patternR.vector, patternR.vector.map(v => 1 - v),
    ];

    this.matrix.update(channels8);
    const del = this.deliberation.deliberate(queryText, inferences, this.matrix);
    const vortex = buildVortexState(inferences, this.matrix, del);

    const result = {
      query: queryText,
      timestamp: new Date().toISOString(),
      inferenceMs: Date.now() - t0,
      computeProfile: this.computeProfile,
      brains: inferences,
      octoMatrix: this.matrix.matrix,
      matrixLabels: this.matrix.channelLabels,
      matrixConsensus: this.matrix.consensus(),
      matrixConflicts: this.matrix.conflicts(),
      deliberation: del,
      vortexState: vortex,
      predictiveSymbiosis: {
        winner: del.outcome.winner,
        confidence: del.outcome.confidence,
        predictionQuality: del.outcome.predictionQuality,
        consensusStrength: del.outcome.consensusStrength,
        stochasticEntropy: del.outcome.stochasticEntropy,
        synergyScore: parseFloat((del.outcome.confidence * del.outcome.consensusStrength).toFixed(4)),
      },
    };

    this.history.push({ q: queryText.slice(0, 60), outcome: result.predictiveSymbiosis, ts: result.timestamp });
    if (this.history.length > 100) this.history.shift();
    return result;
  }

  status() {
    return {
      brains: Object.keys(BRAIN_META),
      matrixSize: '8x8',
      deliberationRounds: this.deliberation.rounds.length,
      historyLength: this.history.length,
      computeProfile: this.computeProfile,
      lastConsensus: parseFloat(this.matrix.consensus().toFixed(4)),
    };
  }
}

module.exports = { QuadBrainOrchestrator, BRAIN_META };
