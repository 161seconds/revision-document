// Production-Grade Distributed Storage, Quorum & Transaction Algorithms
import crypto from 'node:crypto';

/**
 * Dynamo-Style Quorum Consistency Engine (R + W > N)
 */
export class DynamoQuorumCluster {
  /**
   * @param {number} n Total replica nodes (Replication Factor)
   * @param {number} w Write Quorum
   * @param {number} r Read Quorum
   */
  constructor(n = 3, w = 2, r = 2) {
    this.n = n;
    this.w = w;
    this.r = r;
    this.nodes = [];
    for (let i = 0; i < n; i++) {
      this.nodes.push({ id: `node-${i}`, storage: new Map(), isAlive: true });
    }
  }

  isStronglyConsistent() {
    return this.r + this.w > this.n;
  }

  setNodeHealth(nodeIndex, isAlive) {
    if (this.nodes[nodeIndex]) {
      this.nodes[nodeIndex].isAlive = isAlive;
    }
  }

  /**
   * Writes data to replica nodes enforcing W quorum
   * @param {string} key
   * @param {*} value
   * @param {number} version
   */
  write(key, value, version = Date.now()) {
    let acks = 0;
    const writeEntry = { value, version };

    for (const node of this.nodes) {
      if (node.isAlive) {
        node.storage.set(key, writeEntry);
        acks++;
      }
    }

    if (acks < this.w) {
      throw new Error(`WriteQuorumFailed: Received ${acks} acks, required ${this.w}`);
    }

    return { success: true, acks };
  }

  /**
   * Reads data from replica nodes enforcing R quorum and resolving to newest version
   * @param {string} key
   */
  read(key) {
    let responses = 0;
    let newestEntry = null;

    for (const node of this.nodes) {
      if (node.isAlive) {
        responses++;
        const entry = node.storage.get(key);
        if (entry) {
          if (!newestEntry || entry.version > newestEntry.version) {
            newestEntry = entry;
          }
        }
      }
    }

    if (responses < this.r) {
      throw new Error(`ReadQuorumFailed: Received ${responses} responses, required ${this.r}`);
    }

    return {
      value: newestEntry ? newestEntry.value : null,
      version: newestEntry ? newestEntry.version : 0,
      responses,
    };
  }
}

/**
 * Saga Pattern Orchestrator with Compensating Transactions
 */
export class SagaOrchestrator {
  constructor() {
    this.steps = [];
    this.executionLog = [];
  }

  /**
   * Registers a step in the saga
   * @param {string} name
   * @param {Function} executeFn
   * @param {Function} compensateFn
   */
  addStep(name, executeFn, compensateFn) {
    this.steps.push({ name, executeFn, compensateFn });
    return this;
  }

  /**
   * Executes the saga transaction chain. If any step throws, rolls back in reverse.
   * @param {*} context
   */
  async execute(context = {}) {
    const executedSteps = [];
    this.executionLog = [];

    for (const step of this.steps) {
      try {
        this.executionLog.push({ action: 'EXECUTE', step: step.name });
        await step.executeFn(context);
        executedSteps.push(step);
      } catch (err) {
        this.executionLog.push({ action: 'FAILED', step: step.name, error: err.message });

        // Trigger Compensating Transactions in reverse order
        for (let i = executedSteps.length - 1; i >= 0; i--) {
          const compStep = executedSteps[i];
          try {
            this.executionLog.push({ action: 'COMPENSATE', step: compStep.name });
            await compStep.compensateFn(context);
          } catch (compErr) {
            this.executionLog.push({ action: 'COMPENSATION_ERROR', step: compStep.name, error: compErr.message });
          }
        }

        return {
          status: 'COMPENSATED_FAILURE',
          failedAt: step.name,
          error: err.message,
          log: this.executionLog,
        };
      }
    }

    return {
      status: 'SUCCESS',
      log: this.executionLog,
    };
  }
}

/**
 * Storage Engine protected by Monotonic Fencing Tokens
 */
export class FencingTokenStorage {
  constructor() {
    this.storage = new Map();
    this.tokenCounter = 0;
    this.highestTokenSeen = 0;
  }

  /**
   * Lock service issues a monotonically increasing token
   */
  acquireLockToken() {
    this.tokenCounter += 1;
    return this.tokenCounter;
  }

  /**
   * Storage layer validates fencing token monotonically
   * @param {number} token
   * @param {string} key
   * @param {*} value
   */
  write(token, key, value) {
    if (token <= this.highestTokenSeen) {
      throw new Error(`FencingTokenRejected: Token ${token} is stale. Highest seen: ${this.highestTokenSeen}`);
    }

    this.highestTokenSeen = token;
    this.storage.set(key, value);
    return { success: true, token };
  }

  read(key) {
    return this.storage.get(key);
  }
}

/**
 * Deterministic Hash-based Sharding Router
 */
export class HashShardingRouter {
  constructor(totalShards) {
    if (totalShards <= 0) throw new Error('Total shards must be positive');
    this.totalShards = totalShards;
  }

  getShard(key) {
    const hash = crypto.createHash('sha256').update(String(key)).digest();
    const hashInt = hash.readUInt32BE(0);
    return hashInt % this.totalShards;
  }
}
