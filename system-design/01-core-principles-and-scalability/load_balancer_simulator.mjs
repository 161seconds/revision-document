// Production-Grade Load Balancer and Consistent Hashing Engine
import crypto from 'node:crypto';

/**
 * Computes 32-bit unsigned integer hash for consistent hashing ring
 * @param {string} key
 * @returns {number} 32-bit unsigned integer [0, 2^32 - 1]
 */
export function hash32(key) {
  const hash = crypto.createHash('md5').update(String(key)).digest();
  return hash.readUInt32BE(0);
}

/**
 * Consistent Hashing Ring with Virtual Nodes (vnodes)
 */
export class ConsistentHashRing {
  constructor(vnodesPerNode = 100) {
    this.vnodesPerNode = vnodesPerNode;
    this.ring = new Map(); // hashValue -> physicalNodeId
    this.sortedKeys = []; // sorted array of 32-bit hashValues
    this.physicalNodes = new Set();
  }

  /**
   * Adds a physical node to the ring with virtual replicas
   * @param {string} nodeId
   */
  addNode(nodeId) {
    if (this.physicalNodes.has(nodeId)) return;
    this.physicalNodes.add(nodeId);

    for (let i = 0; i < this.vnodesPerNode; i++) {
      const vnodeKey = `${nodeId}#vn${i}`;
      const hash = hash32(vnodeKey);
      this.ring.set(hash, nodeId);
      this.sortedKeys.push(hash);
    }

    this.sortedKeys.sort((a, b) => a - b);
  }

  /**
   * Removes a physical node and its virtual replicas from the ring
   * @param {string} nodeId
   */
  removeNode(nodeId) {
    if (!this.physicalNodes.has(nodeId)) return;
    this.physicalNodes.delete(nodeId);

    this.sortedKeys = this.sortedKeys.filter((hash) => {
      if (this.ring.get(hash) === nodeId) {
        this.ring.delete(hash);
        return false;
      }
      return true;
    });
  }

  /**
   * Maps a request/cache key to the primary physical node (clockwise search)
   * @param {string} key
   * @returns {string|null}
   */
  getNode(key) {
    if (this.sortedKeys.length === 0) return null;
    const hash = hash32(key);

    // Binary search for first ring node >= hash
    let low = 0;
    let high = this.sortedKeys.length - 1;
    let targetIndex = 0;

    if (hash > this.sortedKeys[high]) {
      // Wrap around clockwise to the start of the ring
      targetIndex = 0;
    } else {
      while (low <= high) {
        const mid = Math.floor((low + high) / 2);
        if (this.sortedKeys[mid] >= hash) {
          targetIndex = mid;
          high = mid - 1; // look for earlier match
        } else {
          low = mid + 1;
        }
      }
    }

    const targetHash = this.sortedKeys[targetIndex];
    return this.ring.get(targetHash);
  }

  /**
   * Fetches N distinct physical nodes for replication (Dynamo-style)
   * @param {string} key
   * @param {number} count
   * @returns {string[]}
   */
  getReplicationNodes(key, count) {
    if (this.physicalNodes.size === 0) return [];
    const distinctNodes = [];
    const hash = hash32(key);

    let startIdx = this.sortedKeys.findIndex((h) => h >= hash);
    if (startIdx === -1) startIdx = 0;

    for (let i = 0; i < this.sortedKeys.length && distinctNodes.length < count; i++) {
      const currentIdx = (startIdx + i) % this.sortedKeys.length;
      const targetHash = this.sortedKeys[currentIdx];
      const physicalNode = this.ring.get(targetHash);

      if (!distinctNodes.includes(physicalNode)) {
        distinctNodes.push(physicalNode);
      }
    }

    return distinctNodes;
  }
}

/**
 * Weighted Round Robin Load Balancer
 */
export class WeightedRoundRobinBalancer {
  constructor(servers = []) {
    // servers: [{ id: 'srv-1', weight: 3 }, { id: 'srv-2', weight: 1 }]
    this.servers = servers.map((s) => ({ ...s, currentWeight: 0 }));
  }

  /**
   * Selects server using smooth weighted round-robin
   * @returns {string|null}
   */
  selectServer() {
    if (this.servers.length === 0) return null;

    let totalWeight = 0;
    let maxServer = null;

    for (const server of this.servers) {
      server.currentWeight += server.weight;
      totalWeight += server.weight;

      if (!maxServer || server.currentWeight > maxServer.currentWeight) {
        maxServer = server;
      }
    }

    maxServer.currentWeight -= totalWeight;
    return maxServer.id;
  }
}

/**
 * Availability Mathematics
 */
export class AvailabilityMath {
  /**
   * Calculates total availability for services connected in series (A_total = A1 * A2 * ... * An)
   * @param {number[]} availabilities Array of availability fractions (e.g. [0.999, 0.999])
   * @returns {number}
   */
  static calculateSeries(availabilities) {
    return availabilities.reduce((acc, curr) => acc * curr, 1.0);
  }

  /**
   * Calculates total availability for services connected in parallel (A_total = 1 - (1-A1)*(1-A2)...)
   * @param {number[]} availabilities Array of availability fractions (e.g. [0.99, 0.99])
   * @returns {number}
   */
  static calculateParallel(availabilities) {
    const combinedUnavailability = availabilities.reduce((acc, curr) => acc * (1.0 - curr), 1.0);
    return 1.0 - combinedUnavailability;
  }

  /**
   * Calculates annual downtime in minutes
   * @param {number} availability Percentage (e.g. 99.9)
   * @returns {number}
   */
  static calculateAnnualDowntimeMinutes(availability) {
    const minutesInYear = 365.25 * 24 * 60; // 525,960 minutes
    const unavailability = 1.0 - availability / 100.0;
    return unavailability * minutesInYear;
  }
}
