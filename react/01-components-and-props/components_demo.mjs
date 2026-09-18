/**
 * REACT MODULE 01: COMPONENTS & PROPS DEMO
 * Chạy trực tiếp qua Node.js v22:
 * node components_demo.mjs
 */

/* ========================================================================= */
/* 1. MÔ PHỎNG REACT ELEMENT & CREATE_ELEMENT                                */
/* ========================================================================= */
console.log("=== 1. VIRTUAL DOM ELEMENT BUILDER ===");

function createElement(type, props, ...children) {
    const normalizedChildren = children.flat().filter(c => c !== null && c !== undefined && c !== false);
    return {
        $$typeof: Symbol.for("react.element"),
        type,
        props: {
            ...props,
            children: normalizedChildren.length === 1 ? normalizedChildren[0] : normalizedChildren
        }
    };
}

const vnode = createElement(
    "div",
    { className: "container", id: "app-root" },
    createElement("h1", null, "React Core Architecture"),
    createElement("p", null, "JSX produces lightweight immutable plain objects.")
);

console.log("VNode structure:", JSON.stringify(vnode, null, 2));

/* ========================================================================= */
/* 2. FUNCTIONAL COMPONENT & PROPS DESTRUCTURING                             */
/* ========================================================================= */
console.log("\n=== 2. FUNCTIONAL COMPONENT & PROPS ===");

function UserBadge({ username, role = "Member", isVerified = false }) {
    return createElement(
        "div",
        { className: "badge" },
        `User: ${username} (${role}) ${isVerified ? "[Verified]" : "[Unverified]"}`
    );
}

const badgeElement = UserBadge({ username: "Alex", isVerified: true });
console.log("Badge Output:", badgeElement.props.children);

/* ========================================================================= */
/* 3. CONDITIONAL RENDERING & SHORT-CIRCUIT PITFALL                          */
/* ========================================================================= */
console.log("\n=== 3. CONDITIONAL RENDERING & && PITFALL ===");

function renderNotificationCount(count) {
    // ❌ BẪY: count && createElement(...) sẽ trả về 0 nếu count === 0
    const buggyRender = count && `You have ${count} notifications`;
    //  ĐÚNG: So sánh tường minh lớn hơn 0
    const safeRender = count > 0 ? `You have ${count} notifications` : null;

    return { buggyRender, safeRender };
}

console.log("With count = 0:");
console.log("Buggy output:", renderNotificationCount(0).buggyRender); // In ra 0!
console.log("Safe output: ", renderNotificationCount(0).safeRender);  // In ra null (không hiển thị)

/* ========================================================================= */
/* 4. LIST RENDERING & STABLE KEYS                                           */
/* ========================================================================= */
console.log("\n=== 4. LIST RENDERING & KEY ATTRIBUTION ===");

const rawTasks = [
    { id: "task_1", title: "Write Spec" },
    { id: "task_2", title: "Review Code" }
];

function TaskList({ tasks }) {
    return createElement(
        "ul",
        { className: "task-list" },
        tasks.map(t => ({
            ...createElement("li", null, t.title),
            key: t.id // Key được lưu tách biệt trên React Element
        }))
    );
}

const taskListTree = TaskList({ tasks: rawTasks });
console.log(`Rendered ${taskListTree.props.children.length} list items with unique keys.`);

console.log("\n>>> MODULE 01 DEMO FINISHED SUCCESSFULLY <<<");
