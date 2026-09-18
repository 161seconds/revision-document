/**
 * MODULE 04: PERFORMANCE & ADVANCED - PRACTICE & SELF-TESTING SUITE
 * Chạy trực tiếp:
 * node practice.mjs
 */

import assert from "node:assert";

/* ========================================================================= */
/* CHALLENGE 1: FIBER TREE RECONCILER TRAVERSAL                              */
/* ========================================================================= */
function createFiberNode(name, child = null, sibling = null, parent = null) {
    return { name, child, sibling, return: parent };
}

function traverseFiberTree(root) {
    const order = [];
    let node = root;

    while (node) {
        order.push(node.name);

        if (node.child) {
            node = node.child;
            continue;
        }

        while (node) {
            if (node.sibling) {
                node = node.sibling;
                break;
            }
            node = node.return;
        }
    }
    return order;
}

function test_challenge_1() {
    process.stdout.write("[Test 1] Fiber Tree Traversal Order... ");

    // Root -> (Header -> Main(Section, Aside) -> Footer)
    const root = createFiberNode("Root");
    const header = createFiberNode("Header", null, null, root);
    const main = createFiberNode("Main", null, null, root);
    const footer = createFiberNode("Footer", null, null, root);

    root.child = header;
    header.sibling = main;
    main.sibling = footer;

    const section = createFiberNode("Section", null, null, main);
    const aside = createFiberNode("Aside", null, null, main);
    main.child = section;
    section.sibling = aside;

    const traversal = traverseFiberTree(root);
    assert.deepStrictEqual(traversal, ["Root", "Header", "Main", "Section", "Aside", "Footer"]);

    console.log("PASSED");
}

/* ========================================================================= */
/* CHALLENGE 2: SUSPENSE PROMISE PATTERN                                     */
/* ========================================================================= */
function wrapPromise(promise) {
    let status = "pending";
    let result;
    const suspender = promise.then(
        (r) => { status = "success"; result = r; },
        (e) => { status = "error"; result = e; }
    );

    return {
        read() {
            if (status === "pending") throw suspender;
            if (status === "error") throw result;
            return result;
        }
    };
}

function test_challenge_2() {
    process.stdout.write("[Test 2] Suspense Wrap Promise Contract... ");

    return new Promise((resolve) => {
        let resolver;
        const p = new Promise(res => { resolver = res; });
        const resource = wrapPromise(p);

        // While pending, reading throws the promise
        assert.throws(() => resource.read(), (thrown) => thrown instanceof Promise);

        resolver("DataReady");

        p.then(() => {
            // Once resolved, returns the value
            assert.strictEqual(resource.read(), "DataReady");
            console.log("PASSED");
            resolve();
        });
    });
}

/* ========================================================================= */
/* CHALLENGE 3: ERROR BOUNDARY ISOLATION                                     */
/* ========================================================================= */
function renderTreeWithBoundary(components) {
    return components.map(comp => {
        try {
            return comp();
        } catch (err) {
            return `[Fallback: ${err.message}]`;
        }
    });
}

function test_challenge_3() {
    process.stdout.write("[Test 3] Error Boundary Component Isolation... ");

    const compGood1 = () => "Header OK";
    const compCrash = () => { throw new Error("Database timeout"); };
    const compGood2 = () => "Footer OK";

    const output = renderTreeWithBoundary([compGood1, compCrash, compGood2]);
    assert.strictEqual(output[0], "Header OK");
    assert.strictEqual(output[1], "[Fallback: Database timeout]");
    assert.strictEqual(output[2], "Footer OK");

    console.log("PASSED");
}

/* ========================================================================= */
/* CHALLENGE 4: CONCURRENT PRIORITY SCHEDULER                                */
/* ========================================================================= */
class PriorityScheduler {
    constructor() {
        this.urgentQueue = [];
        this.transitionQueue = [];
    }

    scheduleUrgent(task) {
        this.urgentQueue.push(task);
    }

    scheduleTransition(task) {
        this.transitionQueue.push(task);
    }

    flush() {
        const executionLog = [];
        // Urgent tasks always run first
        while (this.urgentQueue.length > 0) {
            executionLog.push(this.urgentQueue.shift()());
        }
        // Transition tasks run after
        while (this.transitionQueue.length > 0) {
            executionLog.push(this.transitionQueue.shift()());
        }
        return executionLog;
    }
}

function test_challenge_4() {
    process.stdout.write("[Test 4] Concurrent Priority Scheduling... ");

    const scheduler = new PriorityScheduler();

    scheduler.scheduleTransition(() => "Transition 1");
    scheduler.scheduleUrgent(() => "Urgent Click");
    scheduler.scheduleTransition(() => "Transition 2");
    scheduler.scheduleUrgent(() => "Urgent KeyPress");

    const order = scheduler.flush();
    assert.deepStrictEqual(order, [
        "Urgent Click",
        "Urgent KeyPress",
        "Transition 1",
        "Transition 2"
    ]);

    console.log("PASSED");
}

/* ========================================================================= */
/* CHALLENGE 5: DOUBLE BUFFERING POINTER SWAP                                */
/* ========================================================================= */
class FiberRootNode {
    constructor(initialTree) {
        this.current = initialTree;
        this.workInProgress = null;
    }

    startWork(nextTree) {
        this.workInProgress = nextTree;
    }

    commit() {
        if (!this.workInProgress) throw new Error("No work to commit");
        // Pointer swap
        this.current = this.workInProgress;
        this.workInProgress = null;
    }
}

function test_challenge_5() {
    process.stdout.write("[Test 5] Double Buffering Pointer Swap... ");

    const v1 = { version: 1 };
    const v2 = { version: 2 };

    const root = new FiberRootNode(v1);
    assert.strictEqual(root.current.version, 1);

    root.startWork(v2);
    assert.strictEqual(root.current.version, 1); // Not changed yet

    root.commit();
    assert.strictEqual(root.current.version, 2); // Swapped atomically
    assert.strictEqual(root.workInProgress, null);

    console.log("PASSED");
}

/* ========================================================================= */
/* MAIN RUNNER                                                               */
/* ========================================================================= */
console.log("=== RUNNING REACT MODULE 04 TESTS ===\n");

test_challenge_1();
test_challenge_3();
test_challenge_4();
test_challenge_5();
test_challenge_2().then(() => {
    console.log("\n>>> ALL 5 MODULE 04 TESTS PASSED SUCCESSFULLY! <<<");
});
