/**
 * MODULE 02: HOOKS & STATE - PRACTICE & SELF-TESTING SUITE
 * Chạy trực tiếp:
 * node practice.mjs
 */

import assert from "node:assert";

/* ========================================================================= */
/* CHALLENGE 1: USESTATE BATCHING & UPDATER QUEUE                            */
/* ========================================================================= */
function createMiniState(initialState) {
    let state = initialState;
    const queue = [];

    const setState = (action) => {
        queue.push(action);
    };

    const flushUpdates = () => {
        while (queue.length > 0) {
            const action = queue.shift();
            state = typeof action === "function" ? action(state) : action;
        }
        return state;
    };

    return {
        getState: () => state,
        setState,
        flushUpdates
    };
}

function test_challenge_1() {
    process.stdout.write("[Test 1] State Updater Queue Resolution... ");

    const store = createMiniState(0);
    store.setState(prev => prev + 1);
    store.setState(prev => prev + 2);
    store.setState(prev => prev + 10);

    const finalState = store.flushUpdates();
    assert.strictEqual(finalState, 13);
    assert.strictEqual(store.getState(), 13);

    console.log("PASSED");
}

/* ========================================================================= */
/* CHALLENGE 2: USEEFFECT LIFECYCLE & CLEANUP PHASING                        */
/* ========================================================================= */
function createEffectTracker() {
    let prevDeps = null;
    let cleanupFn = null;
    let runCount = 0;
    let cleanupCount = 0;

    const runEffect = (effectFn, deps) => {
        let hasChanged = false;
        if (!prevDeps) {
            hasChanged = true;
        } else {
            hasChanged = deps.some((d, i) => !Object.is(d, prevDeps[i]));
        }

        if (hasChanged) {
            if (typeof cleanupFn === "function") {
                cleanupFn();
                cleanupCount++;
            }
            cleanupFn = effectFn();
            runCount++;
            prevDeps = deps;
        }
    };

    const unmount = () => {
        if (typeof cleanupFn === "function") {
            cleanupFn();
            cleanupCount++;
            cleanupFn = null;
        }
    };

    return { runEffect, unmount, getStats: () => ({ runCount, cleanupCount }) };
}

function test_challenge_2() {
    process.stdout.write("[Test 2] useEffect Lifecycle & Cleanup... ");

    const tracker = createEffectTracker();
    let isConnected = false;

    const effectLogic = () => {
        isConnected = true;
        return () => { isConnected = false; };
    };

    // First mount with id = 1
    tracker.runEffect(effectLogic, [1]);
    assert.strictEqual(isConnected, true);
    assert.strictEqual(tracker.getStats().runCount, 1);
    assert.strictEqual(tracker.getStats().cleanupCount, 0);

    // Re-render with same id = 1 -> no run
    tracker.runEffect(effectLogic, [1]);
    assert.strictEqual(tracker.getStats().runCount, 1);

    // Re-render with changed id = 2 -> cleanup ran then re-run
    tracker.runEffect(effectLogic, [2]);
    assert.strictEqual(isConnected, true);
    assert.strictEqual(tracker.getStats().runCount, 2);
    assert.strictEqual(tracker.getStats().cleanupCount, 1);

    // Unmount
    tracker.unmount();
    assert.strictEqual(isConnected, false);
    assert.strictEqual(tracker.getStats().cleanupCount, 2);

    console.log("PASSED");
}

/* ========================================================================= */
/* CHALLENGE 3: USEREF STABLE IDENTITY                                       */
/* ========================================================================= */
function createRefStore() {
    const refs = new Map();

    const getOrCreateRef = (key, initial) => {
        if (!refs.has(key)) {
            refs.set(key, { current: initial });
        }
        return refs.get(key);
    };

    return { getOrCreateRef };
}

function test_challenge_3() {
    process.stdout.write("[Test 3] useRef Stable Identity & Mutation... ");

    const store = createRefStore();
    const ref1 = store.getOrCreateRef("timer", null);
    ref1.current = 12345;

    const ref2 = store.getOrCreateRef("timer", null);
    assert.strictEqual(ref1, ref2); // Identical object reference
    assert.strictEqual(ref2.current, 12345);

    console.log("PASSED");
}

/* ========================================================================= */
/* CHALLENGE 4: USEMEMO COMPUTATION CACHING                                  */
/* ========================================================================= */
function createMemoizer() {
    let cachedValue;
    let cachedDeps = null;
    let executions = 0;

    const memoize = (calcFn, deps) => {
        if (!cachedDeps || deps.some((d, i) => !Object.is(d, cachedDeps[i]))) {
            cachedValue = calcFn();
            cachedDeps = deps;
            executions++;
        }
        return cachedValue;
    };

    return { memoize, getExecutions: () => executions };
}

function test_challenge_4() {
    process.stdout.write("[Test 4] useMemo Computational Cache... ");

    const memo = createMemoizer();
    const heavyCalc = (n) => n * 2;

    const v1 = memo.memoize(() => heavyCalc(10), [10]);
    assert.strictEqual(v1, 20);
    assert.strictEqual(memo.getExecutions(), 1);

    const v2 = memo.memoize(() => heavyCalc(10), [10]);
    assert.strictEqual(v2, 20);
    assert.strictEqual(memo.getExecutions(), 1); // Not re-run

    const v3 = memo.memoize(() => heavyCalc(50), [50]);
    assert.strictEqual(v3, 100);
    assert.strictEqual(memo.getExecutions(), 2); // Re-run for new dep

    console.log("PASSED");
}

/* ========================================================================= */
/* CHALLENGE 5: USECALLBACK REFERENTIAL INTEGRITY                            */
/* ========================================================================= */
function createCallbackMemoizer() {
    let cachedFn = null;
    let cachedDeps = null;

    const useCallback = (fn, deps) => {
        if (!cachedDeps || deps.some((d, i) => !Object.is(d, cachedDeps[i]))) {
            cachedFn = fn;
            cachedDeps = deps;
        }
        return cachedFn;
    };

    return { useCallback };
}

function test_challenge_5() {
    process.stdout.write("[Test 5] useCallback Referential Integrity... ");

    const cbManager = createCallbackMemoizer();

    const fn1 = cbManager.useCallback(() => "result A", [1, "test"]);
    const fn2 = cbManager.useCallback(() => "result B", [1, "test"]);
    assert.strictEqual(fn1, fn2); // Same function reference preserved

    const fn3 = cbManager.useCallback(() => "result C", [2, "test"]);
    assert.notStrictEqual(fn1, fn3); // New reference created on dependency change

    console.log("PASSED");
}

/* ========================================================================= */
/* MAIN RUNNER                                                               */
/* ========================================================================= */
console.log("=== RUNNING REACT MODULE 02 TESTS ===\n");

test_challenge_1();
test_challenge_2();
test_challenge_3();
test_challenge_4();
test_challenge_5();

console.log("\n>>> ALL 5 MODULE 02 TESTS PASSED SUCCESSFULLY! <<<");
