/**
 * TYPESCRIPT MODULE 01: TYPES & INTERFACES DEMO
 * Chạy trực tiếp bằng Node.js v22:
 * node --no-warnings=ExperimentalWarning --experimental-transform-types types_demo.ts
 */

/* ========================================================================= */
/* 1. PRIMITIVES & SPECIAL TYPES                                             */
/* ========================================================================= */
console.log("=== 1. PRIMITIVES & SPECIAL TYPES ===");
const count: number = 42;
const username: string = "TypeScript Dev";
const isActive: boolean = true;
const bigId: bigint = 9007199254740995n;

console.log({ count, username, isActive, bigId: bigId.toString() });

// unknown vs any demonstration
function processUnknown(val: unknown): string {
    if (typeof val === "string") {
        return `String: ${val.toUpperCase()}`;
    }
    if (typeof val === "number") {
        return `Number: ${val.toFixed(2)}`;
    }
    return "Other unknown type";
}

console.log(processUnknown("safe text"));
console.log(processUnknown(123.456));

/* ========================================================================= */
/* 2. ARRAYS, TUPLES & ENUMS                                                 */
/* ========================================================================= */
console.log("\n=== 2. ARRAYS, TUPLES & ENUMS ===");

// Readonly array and const assertion
const staticTuple = [200, "OK"] as const;
console.log(`Const Tuple: status=${staticTuple[0]}, message=${staticTuple[1]}`);

// String enum
enum ResponseCode {
    Success = "SUCCESS_200",
    NotFound = "NOT_FOUND_404"
}
console.log("Enum member:", ResponseCode.Success);

/* ========================================================================= */
/* 3. TYPE ALIASES & INTERFACES (DECLARATION MERGING)                        */
/* ========================================================================= */
console.log("\n=== 3. TYPE ALIASES & INTERFACES ===");

interface ServerConfig {
    host: string;
    port: number;
}

// Declaration Merging: bổ sung thuộc tính timeout
interface ServerConfig {
    timeoutMs?: number;
}

const config: ServerConfig = {
    host: "localhost",
    port: 3000,
    timeoutMs: 5000
};
console.log("Merged Interface Object:", config);

/* ========================================================================= */
/* 4. DISCRIMINATED UNIONS (TAGGED UNIONS) & TYPE NARROWING                  */
/* ========================================================================= */
console.log("\n=== 4. DISCRIMINATED UNIONS & NARROWING ===");

type ApiResponse =
    | { status: "loading" }
    | { status: "success"; data: string[] }
    | { status: "error"; error: string };

function renderResponse(res: ApiResponse): string {
    switch (res.status) {
        case "loading":
            return "Spinner showing...";
        case "success":
            return `Data loaded (${res.data.length} items): [${res.data.join(", ")}]`;
        case "error":
            return `Failed with error: ${res.error}`;
    }
}

const okState: ApiResponse = { status: "success", data: ["Item1", "Item2"] };
const errState: ApiResponse = { status: "error", error: "Connection timeout" };

console.log(renderResponse(okState));
console.log(renderResponse(errState));

console.log("\n>>> MODULE 01 DEMO FINISHED SUCCESSFULLY <<<");
