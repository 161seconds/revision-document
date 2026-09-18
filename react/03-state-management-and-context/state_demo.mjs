/**
 * REACT MODULE 03: STATE MANAGEMENT & CONTEXT DEMO
 * Chạy trực tiếp qua Node.js v22:
 * node state_demo.mjs
 */

/* ========================================================================= */
/* 1. REDUCER PATTERN EXECUTION                                              */
/* ========================================================================= */
console.log("=== 1. REDUCER DISPATCH SIMULATION ===");

function bankAccountReducer(state, action) {
    switch (action.type) {
        case "DEPOSIT":
            return { ...state, balance: state.balance + action.amount };
        case "WITHDRAW":
            if (state.balance < action.amount) {
                return { ...state, lastError: "Insufficient funds" };
            }
            return { ...state, balance: state.balance - action.amount, lastError: null };
        default:
            return state;
    }
}

let accountState = { balance: 100, lastError: null };
console.log("Initial state:", accountState);

accountState = bankAccountReducer(accountState, { type: "DEPOSIT", amount: 50 });
console.log("After deposit $50:", accountState);

accountState = bankAccountReducer(accountState, { type: "WITHDRAW", amount: 200 });
console.log("After failed withdraw $200:", accountState);

accountState = bankAccountReducer(accountState, { type: "WITHDRAW", amount: 80 });
console.log("After successful withdraw $80:", accountState);

/* ========================================================================= */
/* 2. CONTEXT & PROVIDER BROADCAST SIMULATION                                */
/* ========================================================================= */
console.log("\n=== 2. CONTEXT & PROVIDER BROADCAST ===");

class MockContext {
    constructor(defaultValue) {
        this.currentValue = defaultValue;
        this.subscribers = new Set();
    }

    provide(newValue) {
        this.currentValue = newValue;
        this.subscribers.forEach(cb => cb(this.currentValue));
    }

    consume(subscriber) {
        this.subscribers.add(subscriber);
        return () => this.subscribers.delete(subscriber);
    }
}

const ThemeContext = new MockContext("light");

// Consumer A
ThemeContext.consume((theme) => {
    console.log(`[Component Nav]: Theme broadcast received -> ${theme}`);
});

// Consumer B
ThemeContext.consume((theme) => {
    console.log(`[Component Footer]: Theme broadcast received -> ${theme}`);
});

console.log("Broadcasting dark mode...");
ThemeContext.provide("dark");

/* ========================================================================= */
/* 3. EXTERNAL STORE (ZUSTAND-STYLE) SIMULATION                              */
/* ========================================================================= */
console.log("\n=== 3. EXTERNAL STORE PUB/SUB ===");

function createStore(initialState) {
    let state = initialState;
    const listeners = new Set();

    return {
        getState: () => state,
        setState: (updater) => {
            const next = typeof updater === "function" ? updater(state) : updater;
            if (!Object.is(state, next)) {
                state = next;
                listeners.forEach(fn => fn(state));
            }
        },
        subscribe: (fn) => {
            listeners.add(fn);
            return () => listeners.delete(fn);
        }
    };
}

const store = createStore({ count: 0 });
const unsub = store.subscribe((s) => console.log(`[Store Listener]: Count updated to ${s.count}`));

store.setState(s => ({ count: s.count + 1 }));
store.setState(s => ({ count: s.count + 9 }));
unsub();
store.setState(s => ({ count: s.count + 100 })); // No listener called

console.log("\n>>> MODULE 03 DEMO FINISHED SUCCESSFULLY <<<");
