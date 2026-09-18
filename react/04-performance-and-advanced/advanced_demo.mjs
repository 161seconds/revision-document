/**
 * REACT MODULE 04: PERFORMANCE & ADVANCED DEMO
 * Chạy trực tiếp qua Node.js v22:
 * node advanced_demo.mjs
 */

/* ========================================================================= */
/* 1. FIBER WORK LOOP TRAVERSAL DEMO                                         */
/* ========================================================================= */
console.log("=== 1. FIBER TREE TRAVERSAL DEMO ===");

function createFiber(type, child = null, sibling = null, returnFiber = null) {
    return { type, child, sibling, return: returnFiber };
}

// Dựng cây: App -> (Nav -> Content -> Footer)
const app = createFiber("App");
const nav = createFiber("Nav");
const content = createFiber("Content");
const footer = createFiber("Footer");
const article = createFiber("Article");

app.child = nav;
nav.return = app;
nav.sibling = content;

content.return = app;
content.child = article;
content.sibling = footer;

article.return = content;

footer.return = app;

// Fiber Work Loop
function traverseFiber(root) {
    const visited = [];
    let current = root;

    while (current) {
        visited.push(current.type);

        if (current.child) {
            current = current.child;
            continue;
        }

        while (current) {
            if (current.sibling) {
                current = current.sibling;
                break;
            }
            current = current.return;
        }
    }
    return visited;
}

console.log("Fiber traversal order:", traverseFiber(app).join(" -> "));

/* ========================================================================= */
/* 2. PROMISE SUSPENSE MECHANISM DEMO                                        */
/* ========================================================================= */
console.log("\n=== 2. SUSPENSE PROMISE THROW MECHANISM ===");

function createSuspenseResource(asyncTask) {
    let status = "pending";
    let result;
    let suspender = asyncTask().then(
        (res) => {
            status = "success";
            result = res;
        },
        (err) => {
            status = "error";
            result = err;
        }
    );

    return {
        read() {
            if (status === "pending") {
                throw suspender; // Ném Promise để Suspense bắt
            } else if (status === "error") {
                throw result;
            } else if (status === "success") {
                return result;
            }
        }
    };
}

const mockResource = createSuspenseResource(async () => {
    return "User Profile Payload Loaded!";
});

// Giả lập Suspense boundary
try {
    console.log("First read attempt:");
    mockResource.read();
} catch (thrown) {
    if (thrown instanceof Promise) {
        console.log("Caught thrown Promise -> Displaying fallback spinner...");
        thrown.then(() => {
            console.log("Resource resolved -> Second read attempt:");
            console.log("Result:", mockResource.read());
        });
    }
}

/* ========================================================================= */
/* 3. ERROR BOUNDARY RESILIENCE DEMO                                         */
/* ========================================================================= */
console.log("\n=== 3. ERROR BOUNDARY CATCH SIMULATION ===");

function executeWithBoundary(componentFn, fallbackFn) {
    try {
        return componentFn();
    } catch (err) {
        console.log(`[ErrorBoundary]: Caught render error: ${err.message}`);
        return fallbackFn(err);
    }
}

const buggyComponent = () => {
    throw new Error("Crash in render phase: Cannot read properties of null");
};

const safeRender = executeWithBoundary(
    buggyComponent,
    (err) => `Fallback UI: Service temporarily unavailable (${err.message})`
);

console.log(safeRender);

console.log("\n>>> MODULE 04 DEMO FINISHED SUCCESSFULLY <<<");
