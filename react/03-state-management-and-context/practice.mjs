/**
 * MODULE 03: STATE MANAGEMENT & CONTEXT - PRACTICE & SELF-TESTING SUITE
 * Chạy trực tiếp:
 * node practice.mjs
 */

import assert from "node:assert";

/* ========================================================================= */
/* CHALLENGE 1: PURE REDUCER SHOPPING CART                                   */
/* ========================================================================= */
function shoppingReducer(state, action) {
    switch (action.type) {
        case "ADD": {
            const found = state.items.find(i => i.id === action.item.id);
            const items = found
                ? state.items.map(i => i.id === action.item.id ? { ...i, qty: i.qty + 1 } : i)
                : [...state.items, { ...action.item, qty: 1 }];
            return {
                items,
                total: items.reduce((sum, i) => sum + i.price * i.qty, 0)
            };
        }
        case "REMOVE": {
            const items = state.items.filter(i => i.id !== action.id);
            return {
                items,
                total: items.reduce((sum, i) => sum + i.price * i.qty, 0)
            };
        }
        case "CLEAR":
            return { items: [], total: 0 };
        default:
            return state;
    }
}

function test_challenge_1() {
    process.stdout.write("[Test 1] Pure Shopping Cart Reducer... ");

    let state = { items: [], total: 0 };
    state = shoppingReducer(state, { type: "ADD", item: { id: 1, price: 100 } });
    state = shoppingReducer(state, { type: "ADD", item: { id: 1, price: 100 } });
    state = shoppingReducer(state, { type: "ADD", item: { id: 2, price: 50 } });

    assert.strictEqual(state.items.length, 2);
    assert.strictEqual(state.total, 250); // 100*2 + 50*1 = 250

    state = shoppingReducer(state, { type: "REMOVE", id: 1 });
    assert.strictEqual(state.items.length, 1);
    assert.strictEqual(state.total, 50);

    state = shoppingReducer(state, { type: "CLEAR" });
    assert.strictEqual(state.items.length, 0);
    assert.strictEqual(state.total, 0);

    console.log("PASSED");
}

/* ========================================================================= */
/* CHALLENGE 2: CONTEXT PROVIDER VALUE BROADCAST                             */
/* ========================================================================= */
class MiniContext {
    constructor(defaultValue) {
        this.value = defaultValue;
        this.subscribers = new Set();
    }

    set(val) {
        this.value = val;
        this.subscribers.forEach(cb => cb(this.value));
    }

    sub(cb) {
        this.subscribers.add(cb);
        return () => this.subscribers.delete(cb);
    }
}

function test_challenge_2() {
    process.stdout.write("[Test 2] Context Provider Broadcast... ");

    const ctx = new MiniContext("vi");
    const received = [];

    const unsub = ctx.sub(val => received.push(val));
    ctx.set("en");
    ctx.set("fr");

    assert.deepStrictEqual(received, ["en", "fr"]);

    unsub();
    ctx.set("ja");
    assert.deepStrictEqual(received, ["en", "fr"]); // No more events

    console.log("PASSED");
}

/* ========================================================================= */
/* CHALLENGE 3: CUSTOM HOOK DEBOUNCE LOGIC                                   */
/* ========================================================================= */
class MockDebounce {
    constructor(delayMs) {
        this.delayMs = delayMs;
        this.timer = null;
        this.currentValue = undefined;
    }

    update(newValue, onCommit) {
        if (this.timer) {
            clearTimeout(this.timer);
        }
        this.timer = setTimeout(() => {
            this.currentValue = newValue;
            onCommit(this.currentValue);
        }, this.delayMs);
    }
}

function test_challenge_3() {
    process.stdout.write("[Test 3] Custom Hook Debounce Timer... ");

    return new Promise((resolve) => {
        const debouncer = new MockDebounce(50);
        let commitCount = 0;
        let lastCommitted = "";

        const onCommit = (val) => {
            commitCount++;
            lastCommitted = val;
        };

        debouncer.update("a", onCommit);
        debouncer.update("ap", onCommit);
        debouncer.update("app", onCommit);

        setTimeout(() => {
            assert.strictEqual(commitCount, 1);
            assert.strictEqual(lastCommitted, "app");
            console.log("PASSED");
            resolve();
        }, 100);
    });
}

/* ========================================================================= */
/* CHALLENGE 4: EXTERNAL STORE WITH SELECTOR OPTIMIZATION                    */
/* ========================================================================= */
function createSelectorStore(initial) {
    let state = initial;
    const listeners = new Set();

    const getState = () => state;
    const setState = (partial) => {
        state = { ...state, ...partial };
        listeners.forEach(l => l());
    };

    const subscribeWithSelector = (selector, callback) => {
        let currentSlice = selector(state);
        const check = () => {
            const nextSlice = selector(state);
            if (!Object.is(currentSlice, nextSlice)) {
                currentSlice = nextSlice;
                callback(currentSlice);
            }
        };
        listeners.add(check);
        return () => listeners.delete(check);
    };

    return { getState, setState, subscribeWithSelector };
}

function test_challenge_4() {
    process.stdout.write("[Test 4] External Store with Selective Re-render... ");

    const store = createSelectorStore({ user: "Alice", count: 0 });
    let userRenderCount = 0;

    store.subscribeWithSelector(s => s.user, () => {
        userRenderCount++;
    });

    // Updating count should NOT trigger user subscriber
    store.setState({ count: 1 });
    store.setState({ count: 2 });
    assert.strictEqual(userRenderCount, 0);

    // Updating user should trigger subscriber
    store.setState({ user: "Bob" });
    assert.strictEqual(userRenderCount, 1);

    console.log("PASSED");
}

/* ========================================================================= */
/* CHALLENGE 5: INVARIANT HOOK GUARD                                         */
/* ========================================================================= */
function useRequiredContext(contextValue, contextName) {
    if (contextValue === null || contextValue === undefined) {
        throw new Error(`[Invariant Error]: ${contextName} must be rendered within its matching Provider`);
    }
    return contextValue;
}

function test_challenge_5() {
    process.stdout.write("[Test 5] Invariant Hook Guard... ");

    assert.throws(
        () => useRequiredContext(null, "AuthContext"),
        /\[Invariant Error\]: AuthContext must be rendered within its matching Provider/
    );

    const safeVal = useRequiredContext({ token: "xyz" }, "AuthContext");
    assert.strictEqual(safeVal.token, "xyz");

    console.log("PASSED");
}

/* ========================================================================= */
/* MAIN RUNNER                                                               */
/* ========================================================================= */
console.log("=== RUNNING REACT MODULE 03 TESTS ===\n");

test_challenge_1();
test_challenge_2();
test_challenge_4();
test_challenge_5();
test_challenge_3().then(() => {
    console.log("\n>>> ALL 5 MODULE 03 TESTS PASSED SUCCESSFULLY! <<<");
});
