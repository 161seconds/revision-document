/**
 * MODULE 01: COMPONENTS & PROPS - PRACTICE & SELF-TESTING SUITE
 * Chạy trực tiếp:
 * node practice.mjs
 */

import assert from "node:assert";

/* ========================================================================= */
/* CHALLENGE 1: VNODE ELEMENT FACTORY                                        */
/* ========================================================================= */
const REACT_ELEMENT_SYMBOL = Symbol.for("react.element");

function createVNode(type, props = {}, ...children) {
    const flatChildren = children.flat().filter(c => c !== null && c !== undefined && c !== false);
    return {
        $$typeof: REACT_ELEMENT_SYMBOL,
        type,
        props: {
            ...props,
            children: flatChildren.length === 1 ? flatChildren[0] : flatChildren
        }
    };
}

function test_challenge_1() {
    process.stdout.write("[Test 1] VNode Factory & Symbol verification... ");

    const node = createVNode("div", { id: "root" }, createVNode("span", null, "Hello"));
    assert.strictEqual(node.$$typeof, REACT_ELEMENT_SYMBOL);
    assert.strictEqual(node.type, "div");
    assert.strictEqual(node.props.id, "root");
    assert.strictEqual(node.props.children.type, "span");
    assert.strictEqual(node.props.children.props.children, "Hello");

    console.log("PASSED");
}

/* ========================================================================= */
/* CHALLENGE 2: PURE FUNCTIONAL COMPONENT PROPS CONTRACT                     */
/* ========================================================================= */
function UserCard(props) {
    const { name, role = "Guest", age = 18 } = props;
    return createVNode("article", { className: "user-card" }, `${name} | ${role} | ${age}yo`);
}

function test_challenge_2() {
    process.stdout.write("[Test 2] Functional Component & Default Props... ");

    const res1 = UserCard({ name: "Alice" });
    assert.strictEqual(res1.props.children, "Alice | Guest | 18yo");

    const res2 = UserCard({ name: "Bob", role: "Admin", age: 30 });
    assert.strictEqual(res2.props.children, "Bob | Admin | 30yo");

    console.log("PASSED");
}

/* ========================================================================= */
/* CHALLENGE 3: SAFE CONDITIONAL RENDERING (ZERO BUG AVOIDANCE)              */
/* ========================================================================= */
function renderMessageNotification(unreadCount) {
    // Avoids 0 rendering bug by explicit check
    if (typeof unreadCount !== "number" || unreadCount <= 0) {
        return null;
    }
    return createVNode("span", { className: "badge" }, `${unreadCount} unread`);
}

function test_challenge_3() {
    process.stdout.write("[Test 3] Zero Bug Avoidance in Conditional Rendering... ");

    assert.strictEqual(renderMessageNotification(0), null);
    assert.strictEqual(renderMessageNotification(-5), null);

    const activeBadge = renderMessageNotification(3);
    assert.notStrictEqual(activeBadge, null);
    assert.strictEqual(activeBadge.props.children, "3 unread");

    console.log("PASSED");
}

/* ========================================================================= */
/* CHALLENGE 4: STABLE KEYS IN LIST RENDERING                                */
/* ========================================================================= */
function buildNavItems(items) {
    const keys = new Set();
    const result = items.map(item => {
        if (keys.has(item.id)) {
            throw new Error(`Duplicate key detected: ${item.id}`);
        }
        keys.add(item.id);
        return {
            ...createVNode("a", { href: item.url }, item.label),
            key: item.id
        };
    });
    return result;
}

function test_challenge_4() {
    process.stdout.write("[Test 4] Stable List Key Uniqueness... ");

    const validItems = [
        { id: "home", url: "/", label: "Home" },
        { id: "about", url: "/about", label: "About" }
    ];

    const rendered = buildNavItems(validItems);
    assert.strictEqual(rendered.length, 2);
    assert.strictEqual(rendered[0].key, "home");
    assert.strictEqual(rendered[1].key, "about");

    const duplicateItems = [
        { id: "dup", url: "/1", label: "One" },
        { id: "dup", url: "/2", label: "Two" }
    ];
    assert.throws(() => buildNavItems(duplicateItems), /Duplicate key detected/);

    console.log("PASSED");
}

/* ========================================================================= */
/* CHALLENGE 5: SYNTHETIC EVENT FORM HANDLER SIMULATION                      */
/* ========================================================================= */
function simulateFormSubmit(formData, handler) {
    let defaultPrevented = false;
    const fakeEvent = {
        preventDefault: () => { defaultPrevented = true; },
        target: { elements: formData }
    };

    const submissionResult = handler(fakeEvent);
    return {
        defaultPrevented,
        submissionResult
    };
}

function test_challenge_5() {
    process.stdout.write("[Test 5] Form SyntheticEvent preventDefault... ");

    const handler = (e) => {
        e.preventDefault();
        const email = e.target.elements.email;
        if (!email.includes("@")) throw new Error("Invalid email");
        return { success: true, email };
    };

    const out = simulateFormSubmit({ email: "user@react.dev" }, handler);
    assert.strictEqual(out.defaultPrevented, true);
    assert.strictEqual(out.submissionResult.success, true);
    assert.strictEqual(out.submissionResult.email, "user@react.dev");

    console.log("PASSED");
}

/* ========================================================================= */
/* MAIN RUNNER                                                               */
/* ========================================================================= */
console.log("=== RUNNING REACT MODULE 01 TESTS ===\n");

test_challenge_1();
test_challenge_2();
test_challenge_3();
test_challenge_4();
test_challenge_5();

console.log("\n>>> ALL 5 MODULE 01 TESTS PASSED SUCCESSFULLY! <<<");
