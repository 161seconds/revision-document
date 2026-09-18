// Enterprise Real-World System Design Algorithms & Implementations

const BASE62_ALPHABET = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

/**
 * Encodes a 64-bit BigInt into a compact Base62 alphanumeric string
 * @param {bigint} num
 * @returns {string}
 */
export function base62Encode(num) {
  if (num === 0n) return '0';
  let s = '';
  let n = num;
  const base = 62n;

  while (n > 0n) {
    const rem = n % base;
    s = BASE62_ALPHABET[Number(rem)] + s;
    n = n / base;
  }
  return s;
}

/**
 * Decodes a Base62 string back to a 64-bit BigInt
 * @param {string} str
 * @returns {bigint}
 */
export function base62Decode(str) {
  let num = 0n;
  const base = 62n;

  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    const val = BigInt(BASE62_ALPHABET.indexOf(char));
    if (val === -1n) throw new Error(`Invalid Base62 character: ${char}`);
    num = num * base + val;
  }
  return num;
}

/**
 * Twitter Snowflake 64-bit Distributed Unique ID Generator
 *
 * 64-bit structure:
 * - 1 bit: Unused sign bit (always 0)
 * - 41 bits: Milliseconds since custom epoch (approx. 69 years lifetime)
 * - 10 bits: Machine / Worker node ID (0 - 1023)
 * - 12 bits: Sequence number within the same millisecond (0 - 4095)
 */
export class SnowflakeIdGenerator {
  constructor(workerId, epoch = 1704067200000n) {
    // Default epoch: 2024-01-01 00:00:00 UTC
    if (workerId < 0 || workerId > 1023) {
      throw new Error('Worker ID must be between 0 and 1023 (10 bits)');
    }
    this.workerId = BigInt(workerId);
    this.epoch = BigInt(epoch);
    this.sequence = 0n;
    this.lastTimestamp = -1n;
  }

  nextId() {
    let timestamp = BigInt(Date.now());

    if (timestamp < this.lastTimestamp) {
      throw new Error('ClockMovedBackwardsException: NTP clock drift detected');
    }

    if (timestamp === this.lastTimestamp) {
      this.sequence = (this.sequence + 1n) & 4095n; // 12-bit mask
      if (this.sequence === 0n) {
        // Sequence exhausted in this millisecond; spin wait until next millisecond
        while (timestamp <= this.lastTimestamp) {
          timestamp = BigInt(Date.now());
        }
      }
    } else {
      this.sequence = 0n;
    }

    this.lastTimestamp = timestamp;

    const timeDelta = timestamp - this.epoch;
    const id = (timeDelta << 22n) | (this.workerId << 12n) | this.sequence;
    return id;
  }
}

/**
 * Sliding Window Counter Rate Limiter (Approximation Algorithm)
 */
export class SlidingWindowCounterRateLimiter {
  constructor(windowSizeMs = 60000) {
    this.windowSizeMs = windowSizeMs;
    // Map of clientId -> { currentWindowStart, currentCount, prevCount }
    this.clients = new Map();
  }

  isAllowed(clientId, limit, now = Date.now()) {
    const currentWindowStart = Math.floor(now / this.windowSizeMs) * this.windowSizeMs;
    let record = this.clients.get(clientId);

    if (!record) {
      record = { currentWindowStart, currentCount: 0, prevCount: 0 };
      this.clients.set(clientId, record);
    }

    // Window shifted forward
    if (currentWindowStart > record.currentWindowStart) {
      const elapsedWindows = Math.floor((currentWindowStart - record.currentWindowStart) / this.windowSizeMs);
      if (elapsedWindows === 1) {
        record.prevCount = record.currentCount;
      } else {
        record.prevCount = 0; // More than 1 window passed
      }
      record.currentCount = 0;
      record.currentWindowStart = currentWindowStart;
    }

    // Calculate weighted estimate
    const timeIntoCurrentWindow = now - record.currentWindowStart;
    const timeFraction = timeIntoCurrentWindow / this.windowSizeMs;
    const estimatedRequests = record.prevCount * (1 - timeFraction) + record.currentCount;

    if (estimatedRequests < limit) {
      record.currentCount += 1;
      return { allowed: true, currentEstimate: estimatedRequests + 1, remaining: Math.max(0, limit - Math.floor(estimatedRequests) - 1) };
    }

    return { allowed: false, currentEstimate: estimatedRequests, remaining: 0 };
  }
}

/**
 * Adaptive Bitrate (ABR) Stream Selector
 */
export class AdaptiveBitrateSelector {
  constructor(streams) {
    // streams: [{ resolution: '1080p', bandwidthBps: 5000000 }, { resolution: '720p', bandwidthBps: 2500000 }]
    this.streams = [...streams].sort((a, b) => a.bandwidthBps - b.bandwidthBps);
  }

  /**
   * Selects highest bitrate stream whose required bandwidth is <= measured throughput (with 20% safety margin)
   * @param {number} currentThroughputBps
   */
  selectStream(currentThroughputBps) {
    const safeThroughput = currentThroughputBps * 0.8; // 20% buffer against network jitter
    let selected = this.streams[0]; // fallback to lowest

    for (const stream of this.streams) {
      if (stream.bandwidthBps <= safeThroughput) {
        selected = stream;
      } else {
        break;
      }
    }
    return selected;
  }
}

/**
 * Real-Time Chat WebSocket Pub/Sub Fanout Hub
 */
export class WebSocketFanoutHub {
  constructor() {
    this.rooms = new Map(); // roomId -> Set of clientIds
  }

  joinRoom(roomId, clientId) {
    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, new Set());
    }
    this.rooms.get(roomId).add(clientId);
  }

  leaveRoom(roomId, clientId) {
    if (this.rooms.has(roomId)) {
      this.rooms.get(roomId).delete(clientId);
    }
  }

  broadcast(roomId, message, senderId) {
    const room = this.rooms.get(roomId);
    if (!room) return [];

    const recipients = [];
    for (const clientId of room) {
      if (clientId !== senderId) {
        recipients.push({ clientId, message });
      }
    }
    return recipients;
  }
}
