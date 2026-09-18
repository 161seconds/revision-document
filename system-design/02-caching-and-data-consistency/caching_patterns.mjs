// Production-Grade Caching Architecture Algorithms
import crypto from 'node:crypto';

/**
 * Doubly Linked List Node for O(1) LRU Cache
 */
class DoublyLinkedListNode {
  constructor(key, value) {
    this.key = key;
    this.value = value;
    this.prev = null;
    this.next = null;
  }
}

/**
 * Strict O(1) Least Recently Used (LRU) Cache
 */
export class LRUCache {
  constructor(capacity) {
    if (capacity <= 0) throw new Error('Capacity must be greater than zero');
    this.capacity = capacity;
    this.map = new Map(); // key -> DoublyLinkedListNode

    // Dummy sentinel nodes to eliminate edge case null-checks
    this.head = new DoublyLinkedListNode(null, null);
    this.tail = new DoublyLinkedListNode(null, null);
    this.head.next = this.tail;
    this.tail.prev = this.head;
  }

  _removeNode(node) {
    node.prev.next = node.next;
    node.next.prev = node.prev;
  }

  _addNodeToHead(node) {
    node.next = this.head.next;
    node.prev = this.head;
    this.head.next.prev = node;
    this.head.next = node;
  }

  _moveToHead(node) {
    this._removeNode(node);
    this._addNodeToHead(node);
  }

  _popTail() {
    const lruNode = this.tail.prev;
    this._removeNode(lruNode);
    return lruNode;
  }

  /**
   * Retrieves value and marks it as Most Recently Used
   * @param {string} key
   * @returns {*}
   */
  get(key) {
    const node = this.map.get(key);
    if (!node) return undefined;
    this._moveToHead(node);
    return node.value;
  }

  /**
   * Inserts or updates key-value pair, evicting LRU if at capacity
   * @param {string} key
   * @param {*} value
   */
  put(key, value) {
    const existingNode = this.map.get(key);

    if (existingNode) {
      existingNode.value = value;
      this._moveToHead(existingNode);
    } else {
      const newNode = new DoublyLinkedListNode(key, value);
      this.map.set(key, newNode);
      this._addNodeToHead(newNode);

      if (this.map.size > this.capacity) {
        const evicted = this._popTail();
        this.map.delete(evicted.key);
      }
    }
  }

  get size() {
    return this.map.size;
  }
}

/**
 * Probabilistic Bloom Filter for Cache Penetration Defense
 */
export class BloomFilter {
  /**
   * @param {number} expectedElements Estimated number of elements to be added
   * @param {number} falsePositiveRate Target acceptable error rate (e.g. 0.01 for 1%)
   */
  constructor(expectedElements = 1000, falsePositiveRate = 0.01) {
    this.n = expectedElements;
    this.p = falsePositiveRate;

    // Optimal bit array size m = - (n * ln(p)) / (ln(2)^2)
    this.m = Math.ceil(-((this.n * Math.log(this.p)) / Math.pow(Math.LN2, 2)));

    // Optimal number of hash functions k = (m / n) * ln(2)
    this.k = Math.round((this.m / this.n) * Math.LN2);

    this.bitArray = new Uint8Array(Math.ceil(this.m / 8));
  }

  _getHashes(key) {
    const hashes = [];
    const hashA = crypto.createHash('md5').update(key).digest();
    const hashB = crypto.createHash('sha1').update(key).digest();

    const h1 = hashA.readUInt32BE(0);
    const h2 = hashB.readUInt32BE(0);

    // Kirsch-Mitzenmacher-Optimization: g_i(x) = h1(x) + i * h2(x)
    for (let i = 0; i < this.k; i++) {
      const combined = Math.abs((h1 + i * h2) % this.m);
      hashes.push(combined);
    }
    return hashes;
  }

  /**
   * Adds an element to the Bloom Filter
   * @param {string} key
   */
  add(key) {
    const indices = this._getHashes(key);
    for (const bitIndex of indices) {
      const byteIndex = Math.floor(bitIndex / 8);
      const bitOffset = bitIndex % 8;
      this.bitArray[byteIndex] |= 1 << bitOffset;
    }
  }

  /**
   * Tests whether an element might be in the set
   * @param {string} key
   * @returns {boolean} False = Definitely NOT in set (100% certainty). True = Might be in set.
   */
  has(key) {
    const indices = this._getHashes(key);
    for (const bitIndex of indices) {
      const byteIndex = Math.floor(bitIndex / 8);
      const bitOffset = bitIndex % 8;
      if ((this.bitArray[byteIndex] & (1 << bitOffset)) === 0) {
        return false; // Guaranteed not in set
      }
    }
    return true; // Likely in set
  }
}

/**
 * Cache Stampede / Thundering Herd Single-Flight Mutex Guard
 */
export class CacheStampedeGuard {
  constructor() {
    this.inFlightLocks = new Map(); // key -> Promise
    this.cacheStore = new Map(); // key -> { value, expiresAt }
  }

  async getOrFetch(key, ttlMs, dbQueryFn) {
    const now = Date.now();
    const cached = this.cacheStore.get(key);

    if (cached && cached.expiresAt > now) {
      return { value: cached.value, source: 'CACHE_HIT' };
    }

    // Check if another concurrent request is already computing this key
    if (this.inFlightLocks.has(key)) {
      const result = await this.inFlightLocks.get(key);
      return { value: result, source: 'MUTEX_COALESCED' };
    }

    // Current request wins the mutex lock and computes
    const computePromise = (async () => {
      try {
        const freshData = await dbQueryFn();
        this.cacheStore.set(key, {
          value: freshData,
          expiresAt: Date.now() + ttlMs,
        });
        return freshData;
      } finally {
        this.inFlightLocks.delete(key);
      }
    })();

    this.inFlightLocks.set(key, computePromise);
    const freshResult = await computePromise;
    return { value: freshResult, source: 'DATABASE_QUERY' };
  }
}

/**
 * TTL Jitter Calculator for Cache Avalanche Prevention
 * @param {number} baseTtlSeconds Base TTL (e.g. 3600)
 * @param {number} maxJitterSeconds Random jitter upper bound (e.g. 300)
 * @returns {number} Jittered TTL in seconds
 */
export function calculateJitteredTtl(baseTtlSeconds, maxJitterSeconds) {
  const randomJitter = Math.floor(Math.random() * (maxJitterSeconds + 1));
  return baseTtlSeconds + randomJitter;
}
