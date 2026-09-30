// Module 06: Advanced Real-World Architectures Algorithms & Simulators

const BASE32_GEOHASH = '0123456789bcdefghjkmnpqrstuvwxyz';

/**
 * 1. Simple Geohash Encoder & Decoder (Base32)
 */
export class GeohashService {
  static encode(latitude, longitude, precision = 6) {
    let latMin = -90.0, latMax = 90.0;
    let lonMin = -180.0, lonMax = 180.0;
    let isEven = true;
    let bit = 0;
    let ch = 0;
    let geohash = '';

    while (geohash.length < precision) {
      if (isEven) {
        const mid = (lonMin + lonMax) / 2;
        if (longitude >= mid) {
          ch |= (1 << (4 - bit));
          lonMin = mid;
        } else {
          lonMax = mid;
        }
      } else {
        const mid = (latMin + latMax) / 2;
        if (latitude >= mid) {
          ch |= (1 << (4 - bit));
          latMin = mid;
        } else {
          latMax = mid;
        }
      }

      isEven = !isEven;
      if (bit < 4) {
        bit++;
      } else {
        geohash += BASE32_GEOHASH[ch];
        bit = 0;
        ch = 0;
      }
    }
    return geohash;
  }

  static isPrefixMatch(hash1, hash2, prefixLength) {
    return hash1.slice(0, prefixLength) === hash2.slice(0, prefixLength);
  }
}

/**
 * 2. Double-Entry Bookkeeping Ledger with Idempotency Key Guard
 */
export class DoubleEntryLedger {
  constructor() {
    this.accounts = new Map(); // accountId -> balance
    this.idempotencyStore = new Map(); // idempotencyKey -> result
    this.journal = []; // immutable transaction logs
  }

  createAccount(accountId, initialBalance = 0) {
    if (this.accounts.has(accountId)) throw new Error('Account already exists');
    this.accounts.set(accountId, initialBalance);
  }

  getBalance(accountId) {
    if (!this.accounts.has(accountId)) throw new Error('Account not found');
    return this.accounts.get(accountId);
  }

  /**
   * Transfers amount from sourceAccount to targetAccount
   * Enforces: Sum(entries) == 0, Idempotency, No overdraft
   */
  transfer({ idempotencyKey, sourceAccountId, targetAccountId, amount }) {
    if (amount <= 0) throw new Error('Amount must be positive');
    if (this.idempotencyStore.has(idempotencyKey)) {
      return { ...this.idempotencyStore.get(idempotencyKey), replayed: true };
    }

    const srcBalance = this.getBalance(sourceAccountId);
    const tgtBalance = this.getBalance(targetAccountId);

    if (srcBalance < amount) {
      throw new Error(`Insufficient funds: account ${sourceAccountId} has ${srcBalance}`);
    }

    // Atomic execution
    this.accounts.set(sourceAccountId, srcBalance - amount);
    this.accounts.set(targetAccountId, tgtBalance + amount);

    const transactionId = `tx_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const entry = {
      transactionId,
      idempotencyKey,
      entries: [
        { accountId: sourceAccountId, change: -amount },
        { accountId: targetAccountId, change: amount }
      ],
      timestamp: Date.now()
    };

    // Ledger invariant: Net sum must equal 0
    const netSum = entry.entries.reduce((acc, curr) => acc + curr.change, 0);
    if (netSum !== 0) throw new Error('Ledger invariant violated!');

    this.journal.push(entry);
    const result = { success: true, transactionId, sourceBalance: srcBalance - amount, targetBalance: tgtBalance + amount };
    this.idempotencyStore.set(idempotencyKey, result);
    return { ...result, replayed: false };
  }
}

/**
 * 3. Hashed Timing Wheel for Delayed Tasks
 */
export class HashedTimingWheel {
  constructor(slotCount = 8, tickMs = 100) {
    this.slotCount = slotCount;
    this.tickMs = tickMs;
    this.slots = Array.from({ length: slotCount }, () => []);
    this.currentSlot = 0;
  }

  addTask(taskId, delayMs, payload) {
    const ticks = Math.floor(delayMs / this.tickMs);
    const rounds = Math.floor(ticks / this.slotCount);
    const targetSlot = (this.currentSlot + ticks) % this.slotCount;

    this.slots[targetSlot].push({ taskId, rounds, payload });
  }

  advanceTick() {
    const expiredTasks = [];
    const currentTasks = this.slots[this.currentSlot];
    const remainingTasks = [];

    for (const task of currentTasks) {
      if (task.rounds <= 0) {
        expiredTasks.push(task);
      } else {
        task.rounds -= 1;
        remainingTasks.push(task);
      }
    }

    this.slots[this.currentSlot] = remainingTasks;
    this.currentSlot = (this.currentSlot + 1) % this.slotCount;
    return expiredTasks;
  }
}

/**
 * 4. Count-Min Sketch for Streaming Top-K & Frequency Estimation
 */
export class CountMinSketch {
  constructor(width = 100, depth = 4) {
    this.width = width;
    this.depth = depth;
    this.table = Array.from({ length: depth }, () => new Int32Array(width));
    this.seeds = [0x5bd1e995, 0x1b873593, 0x85ebca6b, 0xc2b2ae35].slice(0, depth);
  }

  _hash(key, seed) {
    let h = seed ^ key.length;
    for (let i = 0; i < key.length; i++) {
      h = Math.imul(h ^ key.charCodeAt(i), 0x5bd1e995);
      h ^= h >>> 13;
    }
    return Math.abs(h % this.width);
  }

  increment(key, count = 1) {
    for (let i = 0; i < this.depth; i++) {
      const idx = this._hash(key, this.seeds[i]);
      this.table[i][idx] += count;
    }
  }

  estimate(key) {
    let minCount = Infinity;
    for (let i = 0; i < this.depth; i++) {
      const idx = this._hash(key, this.seeds[i]);
      const val = this.table[i][idx];
      if (val < minCount) minCount = val;
    }
    return minCount;
  }
}

/**
 * 5. Mini Inverted Index with BM25 Scoring
 */
export class InvertedIndex {
  constructor() {
    this.docs = new Map(); // docId -> text
    this.postings = new Map(); // term -> Map(docId -> count)
    this.docLengths = new Map(); // docId -> wordCount
    this.totalDocs = 0;
    this.totalWords = 0;
  }

  _tokenize(text) {
    return text.toLowerCase().match(/[a-z0-9]+/g) || [];
  }

  addDocument(docId, text) {
    const tokens = this._tokenize(text);
    this.docs.set(docId, text);
    this.docLengths.set(docId, tokens.length);
    this.totalDocs += 1;
    this.totalWords += tokens.length;

    const termCounts = new Map();
    for (const token of tokens) {
      termCounts.set(token, (termCounts.get(token) || 0) + 1);
    }

    for (const [term, count] of termCounts.entries()) {
      if (!this.postings.has(term)) {
        this.postings.set(term, new Map());
      }
      this.postings.get(term).set(docId, count);
    }
  }

  search(query, k1 = 1.2, b = 0.75) {
    const queryTerms = this._tokenize(query);
    const avgDocLength = this.totalWords / (this.totalDocs || 1);
    const scores = new Map(); // docId -> score

    for (const term of queryTerms) {
      const posting = this.postings.get(term);
      if (!posting) continue;

      const df = posting.size;
      // IDF = ln((N - df + 0.5) / (df + 0.5) + 1)
      const idf = Math.log((this.totalDocs - df + 0.5) / (df + 0.5) + 1);

      for (const [docId, tf] of posting.entries()) {
        const docLen = this.docLengths.get(docId) || 1;
        const numerator = tf * (k1 + 1);
        const denominator = tf + k1 * (1 - b + b * (docLen / avgDocLength));
        const termScore = idf * (numerator / denominator);
        scores.set(docId, (scores.get(docId) || 0) + termScore);
      }
    }

    return Array.from(scores.entries())
      .map(([docId, score]) => ({ docId, score, text: this.docs.get(docId) }))
      .sort((a, b) => b.score - a.score);
  }
}
