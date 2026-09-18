/**
 * REACT MODULE 02: HOOKS & STATE DEMO
 * Chạy trực tiếp qua Node.js v22:
 * node hooks_demo.mjs
 */

/* ========================================================================= */
/* 1. MÔ PHỎNG MINI REACT ENGINE & HOOK LINKED LIST                          */
/* ========================================================================= */
console.log("=== 1. MINI REACT HOOK ENGINE SIMULATION ===");

const ReactDispatcher = (() => {
    let hooks = [];
    let currentHookIndex = 0;

    function useState(initialValue) {
        const hookIndex = currentHookIndex++;
        if (hooks[hookIndex] === undefined) {
            hooks[hookIndex] = initialValue;
        }

        const setState = (action) => {
            const prev = hooks[hookIndex];
            const next = typeof action === "function" ? action(prev) : action;
            if (!Object.is(prev, next)) {
                hooks[hookIndex] = next;
            }
        };

        return [hooks[hookIndex], setState];
    }

    function useEffect(callback, deps) {
        const hookIndex = currentHookIndex++;
        const oldHook = hooks[hookIndex];

        let hasChanged = true;
        if (oldHook && oldHook.deps) {
            hasChanged = deps.some((dep, i) => !Object.is(dep, oldHook.deps[i]));
        }

        if (hasChanged) {
            if (oldHook && typeof oldHook.cleanup === "function") {
                oldHook.cleanup();
            }
            const cleanup = callback();
            hooks[hookIndex] = { deps, cleanup };
        }
    }

    function useRef(initialValue) {
        const hookIndex = currentHookIndex++;
        if (hooks[hookIndex] === undefined) {
            hooks[hookIndex] = { current: initialValue };
        }
        return hooks[hookIndex];
    }

    function resetCursor() {
        currentHookIndex = 0;
    }

    return { useState, useEffect, useRef, resetCursor };
})();

// Mô phỏng Component Counter
function CounterComponent() {
    const [count, setCount] = ReactDispatcher.useState(0);
    const renderTracker = ReactDispatcher.useRef(0);

    renderTracker.current++;

    ReactDispatcher.useEffect(() => {
        console.log(`[Effect Mount/Update]: Count is currently ${count}`);
        return () => console.log(`[Effect Cleanup]: Cleaning effect for count ${count}`);
    }, [count]);

    return { count, setCount, renders: renderTracker.current };
}

// Render lần 1
console.log("--- Initial Render ---");
ReactDispatcher.resetCursor();
let instance = CounterComponent();
console.log(`Rendered with count: ${instance.count}, total renders: ${instance.renders}`);

// Cập nhật State dồn dập (Updater functions)
console.log("\n--- Dispatching Multiple Updates ---");
instance.setCount(prev => prev + 1);
instance.setCount(prev => prev + 1);
instance.setCount(prev => prev + 5);

// Render lần 2
ReactDispatcher.resetCursor();
instance = CounterComponent();
console.log(`Rendered with count: ${instance.count}, total renders: ${instance.renders}`);

/* ========================================================================= */
/* 2. REFERENTIAL EQUALITY & MEMOIZATION DEMO                                */
/* ========================================================================= */
console.log("\n=== 2. REFERENTIAL EQUALITY DEMO ===");

const fnA = () => "hello";
const fnB = () => "hello";
console.log("Two distinct inline functions equal?", Object.is(fnA, fnB)); // false

// Simulated useCallback
let cachedCallback = null;
let cachedDeps = null;

function simpleCallback(fn, deps) {
    if (!cachedDeps || deps.some((d, i) => !Object.is(d, cachedDeps[i]))) {
        cachedCallback = fn;
        cachedDeps = deps;
    }
    return cachedCallback;
}

const cb1 = simpleCallback(() => 42, [1]);
const cb2 = simpleCallback(() => 42, [1]);
console.log("useCallback preserved reference across renders?", Object.is(cb1, cb2)); // true

console.log("\n>>> MODULE 02 DEMO FINISHED SUCCESSFULLY <<<");
