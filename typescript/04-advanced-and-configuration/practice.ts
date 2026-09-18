/**
 * MODULE 04: ADVANCED & CONFIGURATION - PRACTICE & SELF-TESTING SUITE
 * Chạy trực tiếp:
 * node --no-warnings=ExperimentalWarning --experimental-transform-types practice.ts
 */

import assert from "node:assert";

/* ========================================================================= */
/* CHALLENGE 1: USER-DEFINED TYPE GUARD (TASK VALIDATOR)                     */
/* ========================================================================= */
interface TaskItem {
    id: number;
    title: string;
    completed: boolean;
}

function isTaskItem(value: unknown): value is TaskItem {
    if (typeof value !== "object" || value === null) {
        return false;
    }
    const candidate = value as Record<string, unknown>;
    return (
        typeof candidate.id === "number" &&
        typeof candidate.title === "string" &&
        typeof candidate.completed === "boolean"
    );
}

function test_challenge_1(): void {
    process.stdout.write("[Test 1] User-Defined Type Guard isTaskItem... ");

    const valid = { id: 1, title: "Review PR", completed: false };
    const invalid1 = { id: "1", title: "Review PR", completed: false };
    const invalid2 = null;
    const invalid3 = { id: 1, title: "Review PR" };

    assert.strictEqual(isTaskItem(valid), true);
    assert.strictEqual(isTaskItem(invalid1), false);
    assert.strictEqual(isTaskItem(invalid2), false);
    assert.strictEqual(isTaskItem(invalid3), false);

    console.log("PASSED");
}

/* ========================================================================= */
/* CHALLENGE 2: ASSERTION FUNCTION (POSITIVE INT)                           */
/* ========================================================================= */
function assertPositiveInt(val: unknown, paramName: string): asserts val is number {
    if (typeof val !== "number" || !Number.isInteger(val) || val <= 0) {
        throw new RangeError(`Parameter [${paramName}] must be a positive integer, received: ${String(val)}`);
    }
}

function test_challenge_2(): void {
    process.stdout.write("[Test 2] Assertion Signature assertPositiveInt... ");

    const validNum: unknown = 42;
    assertPositiveInt(validNum, "validNum");
    assert.strictEqual(validNum + 10, 52);

    assert.throws(() => assertPositiveInt(-5, "negative"), /Parameter \[negative\] must be a positive integer/);
    assert.throws(() => assertPositiveInt(3.14, "float"), /Parameter \[float\] must be a positive integer/);
    assert.throws(() => assertPositiveInt("42", "string"), /Parameter \[string\] must be a positive integer/);

    console.log("PASSED");
}

/* ========================================================================= */
/* CHALLENGE 3: BRANDED TYPES NOMINAL CURRENCY CHECK                         */
/* ========================================================================= */
type Brand<K, T> = K & { readonly __brand: T };

type USD = Brand<number, "USD">;
type JPY = Brand<number, "JPY">;

function makeUSD(n: number): USD {
    if (n < 0) throw new Error("Amount cannot be negative");
    return n as USD;
}

function makeJPY(n: number): JPY {
    if (n < 0) throw new Error("Amount cannot be negative");
    return n as JPY;
}

function convertUsdToJpy(usd: USD, exchangeRate: number): JPY {
    return makeJPY(Math.round(usd * exchangeRate));
}

function test_challenge_3(): void {
    process.stdout.write("[Test 3] Branded Nominal Currencies... ");

    const dollars = makeUSD(100);
    const yen = convertUsdToJpy(dollars, 150.5);

    assert.strictEqual(dollars as number, 100);
    assert.strictEqual(yen as number, 15050);

    console.log("PASSED");
}

/* ========================================================================= */
/* CHALLENGE 4: EXHAUSTIVE DISCRIMINATED UNIONS                              */
/* ========================================================================= */
type TransactionStatus = "PENDING" | "SETTLED" | "REFUNDED" | "FAILED";

function getStatusBadge(status: TransactionStatus): string {
    switch (status) {
        case "PENDING":
            return "badge-yellow";
        case "SETTLED":
            return "badge-green";
        case "REFUNDED":
            return "badge-blue";
        case "FAILED":
            return "badge-red";
        default: {
            const _unhandled: never = status;
            throw new Error(`Unhandled transaction status: ${_unhandled}`);
        }
    }
}

function test_challenge_4(): void {
    process.stdout.write("[Test 4] Exhaustive Transaction Status Matcher... ");

    assert.strictEqual(getStatusBadge("PENDING"), "badge-yellow");
    assert.strictEqual(getStatusBadge("SETTLED"), "badge-green");
    assert.strictEqual(getStatusBadge("REFUNDED"), "badge-blue");
    assert.strictEqual(getStatusBadge("FAILED"), "badge-red");

    console.log("PASSED");
}

/* ========================================================================= */
/* CHALLENGE 5: DEEP READONLY STRUCTURAL INTEGRITY                          */
/* ========================================================================= */
type DeepReadonly<T> = T extends (infer R)[]
    ? ReadonlyArray<DeepReadonly<R>>
    : T extends object
    ? { readonly [K in keyof T]: DeepReadonly<T[K]> }
    : T;

interface AppConfig {
    env: string;
    db: {
        host: string;
        ports: number[];
    };
}

function freezeConfig<T extends object>(config: T): DeepReadonly<T> {
    return Object.freeze(JSON.parse(JSON.stringify(config))) as DeepReadonly<T>;
}

function test_challenge_5(): void {
    process.stdout.write("[Test 5] DeepReadonly Immutable Config... ");

    const raw: AppConfig = {
        env: "production",
        db: { host: "db.cluster.internal", ports: [5432, 5433] }
    };

    const frozen = freezeConfig(raw);
    assert.strictEqual(frozen.env, "production");
    assert.strictEqual(frozen.db.host, "db.cluster.internal");
    assert.strictEqual(frozen.db.ports[0], 5432);

    console.log("PASSED");
}

/* ========================================================================= */
/* MAIN RUNNER                                                               */
/* ========================================================================= */
console.log("=== RUNNING TYPESCRIPT MODULE 04 TESTS ===\n");

test_challenge_1();
test_challenge_2();
test_challenge_3();
test_challenge_4();
test_challenge_5();

console.log("\n>>> ALL 5 MODULE 04 TESTS PASSED SUCCESSFULLY! <<<");
