// rust/04-concurrency-and-threads/practice.mjs
import assert from "node:assert/strict";

console.log("=============================================================");
console.log("RUST SYSTEMS PROGRAMMING MODULE 04: FEARLESS CONCURRENCY");
console.log("=============================================================\n");

// =========================================================================
// 1. Thread Move Closure Ownership Transfer
// =========================================================================
console.log("[Test 1] Testing `move` Closure Ownership Invariants...");

class ThreadEnvironment {
  constructor() {
    this.threads = [];
  }

  spawnWithMove(capturedBindings, threadFn) {
    // Clone captured values into child thread stack, mark caller bindings as moved
    const childStack = {};
    for (const [key, refObj] of Object.entries(capturedBindings)) {
      if (refObj.isMoved) {
        throw new Error(`Use of moved value: ${key}`);
      }
      childStack[key] = refObj.value;
      refObj.isMoved = true; // Invalidate in caller scope
    }

    const handle = {
      join: () => threadFn(childStack)
    };
    this.threads.push(handle);
    return handle;
  }
}

const env = new ThreadEnvironment();
const capturedData = {
  payload: { value: "Sensitive crypto key material", isMoved: false }
};

// Spawn thread with move:
const handle = env.spawnWithMove(capturedData, (stack) => {
  return `Processed in thread: ${stack.payload.toUpperCase()}`;
});

// Assert caller can no longer use the moved variable:
assert.equal(capturedData.payload.isMoved, true);
assert.throws(() => {
  env.spawnWithMove(capturedData, () => {});
}, /Use of moved value: payload/);

const result = handle.join();
assert.equal(result, "Processed in thread: SENSITIVE CRYPTO KEY MATERIAL");
console.log("  -> [PASSED] `move` closure transfers ownership and prevents caller reuse.");

// =========================================================================
// 2. Bounded MPSC Channel Backpressure & Disconnect Signalling
// =========================================================================
console.log("\n[Test 2] Testing Bounded MPSC Channel Backpressure & Disconnect...");

class MpscSyncChannel {
  constructor(bound) {
    this.bound = bound;
    this.queue = [];
    this.senderCount = 1;
    this.receiverAlive = true;
  }

  cloneSender() {
    this.senderCount++;
    return this;
  }

  dropSender() {
    this.senderCount = Math.max(0, this.senderCount - 1);
  }

  dropReceiver() {
    this.receiverAlive = false;
  }

  send(item) {
    if (!this.receiverAlive) {
      throw new Error(`SendError: Receiver dropped, unsent payload: ${JSON.stringify(item)}`);
    }
    if (this.queue.length >= this.bound) {
      return { status: "BLOCKED_BACKPRESSURE", sent: false };
    }
    this.queue.push(item);
    return { status: "SENT", sent: true };
  }

  recv() {
    if (this.queue.length > 0) {
      return { status: "OK", value: this.queue.shift() };
    }
    if (this.senderCount === 0) {
      return { status: "DISCONNECTED", value: null }; // Clean EOF
    }
    return { status: "EMPTY_WAITING", value: null };
  }
}

const chan = new MpscSyncChannel(2); // Capacity: 2
assert.equal(chan.send("Task 1").status, "SENT");
assert.equal(chan.send("Task 2").status, "SENT");

// Third item triggers backpressure:
const backpressureRes = chan.send("Task 3");
assert.equal(backpressureRes.status, "BLOCKED_BACKPRESSURE");

// Consume one item:
assert.equal(chan.recv().value, "Task 1");
// Now buffer has room:
assert.equal(chan.send("Task 3").status, "SENT");

// Drop sender and read remaining items:
chan.dropSender();
assert.equal(chan.recv().value, "Task 2");
assert.equal(chan.recv().value, "Task 3");
// Next recv detects all senders dropped:
assert.equal(chan.recv().status, "DISCONNECTED");

// Drop receiver and test SendError:
chan.dropReceiver();
assert.throws(() => chan.send("Lost message"), /SendError: Receiver dropped/);
console.log("  -> [PASSED] Channel backpressure, EOF disconnect, and SendError verified.");

// =========================================================================
// 3. Arc<Mutex<T>> Concurrent Synchronization & RAII Guard
// =========================================================================
console.log("\n[Test 3] Testing Arc<Mutex<T>> RAII Guard Invariants...");

class SimulatedMutex {
  constructor(initialData) {
    this._data = initialData;
    this._locked = false;
    this._ownerThread = null;
    this._isPoisoned = false;
  }

  lock(threadId) {
    if (this._locked) {
      throw new Error(`Contention: Mutex already locked by Thread ${this._ownerThread}`);
    }
    this._locked = true;
    this._ownerThread = threadId;

    if (this._isPoisoned) {
      return { status: "POISONED", guard: this._createGuard(threadId) };
    }
    return { status: "OK", guard: this._createGuard(threadId) };
  }

  _createGuard(threadId) {
    let guardDropped = false;
    return {
      get: () => {
        if (guardDropped) throw new Error("Access via dropped MutexGuard");
        return this._data;
      },
      set: (val) => {
        if (guardDropped) throw new Error("Access via dropped MutexGuard");
        this._data = val;
      },
      panicDrop: () => {
        // Simulates thread panic while holding lock -> poisons mutex!
        guardDropped = true;
        this._locked = false;
        this._ownerThread = null;
        this._isPoisoned = true;
      },
      drop: () => {
        if (!guardDropped) {
          guardDropped = true;
          this._locked = false;
          this._ownerThread = null;
        }
      }
    };
  }
}

const sharedLock = new SimulatedMutex({ counter: 0 });

// Thread 1 acquires lock
const res1 = sharedLock.lock("Thread-1");
assert.equal(res1.status, "OK");

// Thread 2 tries to acquire before Thread 1 drops -> contention error
assert.throws(() => sharedLock.lock("Thread-2"), /Mutex already locked by Thread Thread-1/);

// Thread 1 increments and drops guard (RAII exit)
const state1 = res1.guard.get();
state1.counter += 10;
res1.guard.set(state1);
res1.guard.drop(); // RAII drop

// Thread 2 acquires cleanly
const res2 = sharedLock.lock("Thread-2");
assert.equal(res2.guard.get().counter, 10);
res2.guard.drop();

console.log("  -> [PASSED] Mutex mutual exclusion and RAII unlock lifecycle verified.");

// =========================================================================
// 4. Mutex Poisoning Detection & Recovery
// =========================================================================
console.log("\n[Test 4] Testing Mutex Poisoning Recovery Invariants...");

const poisonLock = new SimulatedMutex({ status: "half-initialized-record" });

// Thread panics while holding guard:
const panicRes = poisonLock.lock("Thread-Crashing");
panicRes.guard.panicDrop(); // Panics and drops

// Subsequent lock detects poisoning:
const subsequentRes = poisonLock.lock("Thread-Recoverer");
assert.equal(subsequentRes.status, "POISONED");
assert.equal(subsequentRes.guard.get().status, "half-initialized-record");
subsequentRes.guard.drop();
console.log("  -> [PASSED] Mutex poisoning detected on panic and data recoverable via into_inner.");

// =========================================================================
// 5. Send and Sync Auto-Trait Propagation
// =========================================================================
console.log("\n[Test 5] Testing Send & Sync Auto-Trait Derivation...");

const evaluateSendSync = (typeDef) => {
  // Base primitive rules:
  if (typeDef.isRawPointer) {
    return { isSend: false, isSync: false, reason: "Raw pointers are !Send and !Sync" };
  }
  if (typeDef.name === "Rc") {
    return { isSend: false, isSync: false, reason: "Rc uses non-atomic refcounts" };
  }
  if (typeDef.name === "RefCell") {
    return { isSend: true, isSync: false, reason: "RefCell borrow checking is non-atomic" };
  }
  if (typeDef.name === "Mutex") {
    // Mutex<T> is Send + Sync if T: Send
    const innerSend = typeDef.inner.isSend;
    return {
      isSend: innerSend,
      isSync: innerSend,
      reason: innerSend ? "Mutex synchronizes exclusive access making it Sync" : "Inner type is !Send"
    };
  }
  if (typeDef.name === "Arc") {
    // Arc<T> is Send + Sync if T: Send + Sync
    const innerSendSync = typeDef.inner.isSend && typeDef.inner.isSync;
    return {
      isSend: innerSendSync,
      isSync: innerSendSync,
      reason: innerSendSync ? "Arc is atomic refcount" : "Inner type fails Send/Sync"
    };
  }

  // Composite Struct: Auto-trait rules
  const allSend = typeDef.fields.every(f => f.isSend);
  const allSync = typeDef.fields.every(f => f.isSync);
  return { isSend: allSend, isSync: allSync, reason: "Composite fields auto-derivation" };
};

const rcType = evaluateSendSync({ name: "Rc" });
assert.equal(rcType.isSend, false);
assert.equal(rcType.isSync, false);

const refCellType = evaluateSendSync({ name: "RefCell" });
assert.equal(refCellType.isSend, true);
assert.equal(refCellType.isSync, false);

// Mutex<RefCell<T>> turns !Sync RefCell into Send + Sync!
const mutexRefCell = evaluateSendSync({ name: "Mutex", inner: refCellType });
assert.equal(mutexRefCell.isSend, true);
assert.equal(mutexRefCell.isSync, true);

// Arc<Mutex<RefCell<T>>> is also Send + Sync:
const arcMutexRefCell = evaluateSendSync({ name: "Arc", inner: mutexRefCell });
assert.equal(arcMutexRefCell.isSend, true);
assert.equal(arcMutexRefCell.isSync, true);

console.log("  -> Rc<T>: Send=" + rcType.isSend + ", Sync=" + rcType.isSync);
console.log("  -> RefCell<T>: Send=" + refCellType.isSend + ", Sync=" + refCellType.isSync);
console.log("  -> Mutex<RefCell<T>>: Send=" + mutexRefCell.isSend + ", Sync=" + mutexRefCell.isSync);
console.log("  -> [PASSED] Send and Sync compiler auto-derivation logic strictly verified.");

console.log("\n=============================================================");
console.log("ALL 5 RUST SYSTEMS MODULE 04 TESTS PASSED SUCCESSFULLY! (5/5)");
console.log("=============================================================");
