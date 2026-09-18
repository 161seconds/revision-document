/**
 * MODULE 01: TYPES & INTERFACES - PRACTICE & SELF-TESTING SUITE
 * Chạy trực tiếp:
 * node --no-warnings=ExperimentalWarning --experimental-transform-types practice.ts
 */

import assert from "node:assert";

/* ========================================================================= */
/* CHALLENGE 1: SAFE DESERIALIZATION FROM UNKNOWN                            */
/* ========================================================================= */
interface UserProfile {
    id: number;
    email: string;
    isActive: boolean;
}

function parseUserProfile(input: unknown): UserProfile {
    if (typeof input !== "object" || input === null) {
        throw new Error("Input must be a non-null object");
    }

    const candidate = input as Record<string, unknown>;

    if (
        typeof candidate.id !== "number" ||
        typeof candidate.email !== "string" ||
        typeof candidate.isActive !== "boolean"
    ) {
        throw new Error("Invalid UserProfile schema");
    }

    return {
        id: candidate.id,
        email: candidate.email,
        isActive: candidate.isActive
    };
}

function test_challenge_1(): void {
    process.stdout.write("[Test 1] Safe Deserialization from unknown... ");

    const validJson = { id: 101, email: "dev@typescript.org", isActive: true };
    const user = parseUserProfile(validJson);
    assert.strictEqual(user.id, 101);
    assert.strictEqual(user.email, "dev@typescript.org");
    assert.strictEqual(user.isActive, true);

    // Invalid inputs must throw
    assert.throws(() => parseUserProfile("not an object"));
    assert.throws(() => parseUserProfile(null));
    assert.throws(() => parseUserProfile({ id: "101", email: "wrong@id.com", isActive: true }));

    console.log("PASSED");
}

/* ========================================================================= */
/* CHALLENGE 2: READONLY TUPLES & MATRIX VECTORS                             */
/* ========================================================================= */
type Vector2D = readonly [x: number, y: number];

function addVectors(v1: Vector2D, v2: Vector2D): Vector2D {
    return [v1[0] + v2[0], v1[1] + v2[1]] as const;
}

function dotProduct(v1: Vector2D, v2: Vector2D): number {
    return v1[0] * v2[0] + v1[1] * v2[1];
}

function test_challenge_2(): void {
    process.stdout.write("[Test 2] Readonly Tuples & Vector Math... ");

    const a: Vector2D = [3, 4] as const;
    const b: Vector2D = [1, 2] as const;

    const sum = addVectors(a, b);
    assert.strictEqual(sum[0], 4);
    assert.strictEqual(sum[1], 6);

    const dot = dotProduct(a, b);
    assert.strictEqual(dot, 11); // 3*1 + 4*2 = 11

    console.log("PASSED");
}

/* ========================================================================= */
/* CHALLENGE 3: DECLARATION MERGING & INTERFACE CONTRACTS                    */
/* ========================================================================= */
interface DatabasePlugin {
    name: string;
    connect(): boolean;
}

// Merging extra properties and methods
interface DatabasePlugin {
    poolSize?: number;
    disconnect(): boolean;
}

class PostgresPlugin implements DatabasePlugin {
    name = "PostgresDriver";
    poolSize = 10;
    private connected = false;

    connect(): boolean {
        this.connected = true;
        return this.connected;
    }

    disconnect(): boolean {
        this.connected = false;
        return !this.connected;
    }
}

function test_challenge_3(): void {
    process.stdout.write("[Test 3] Interface Declaration Merging... ");

    const plugin: DatabasePlugin = new PostgresPlugin();
    assert.strictEqual(plugin.name, "PostgresDriver");
    assert.strictEqual(plugin.poolSize, 10);
    assert.strictEqual(plugin.connect(), true);
    assert.strictEqual(plugin.disconnect(), true);

    console.log("PASSED");
}

/* ========================================================================= */
/* CHALLENGE 4: DISCRIMINATED UNIONS & EXHAUSTIVENESS CHECKING               */
/* ========================================================================= */
type Shape =
    | { kind: "circle"; radius: number }
    | { kind: "rectangle"; width: number; height: number }
    | { kind: "square"; size: number };

function calculateArea(shape: Shape): number {
    switch (shape.kind) {
        case "circle":
            return Math.PI * shape.radius * shape.radius;
        case "rectangle":
            return shape.width * shape.height;
        case "square":
            return shape.size * shape.size;
        default: {
            const _exhaustive: never = shape;
            throw new Error(`Unhandled shape: ${_exhaustive}`);
        }
    }
}

function test_challenge_4(): void {
    process.stdout.write("[Test 4] Discriminated Unions & Exhaustive Area... ");

    const c: Shape = { kind: "circle", radius: 10 };
    const r: Shape = { kind: "rectangle", width: 4, height: 5 };
    const s: Shape = { kind: "square", size: 6 };

    assert.strictEqual(Math.round(calculateArea(c)), 314);
    assert.strictEqual(calculateArea(r), 20);
    assert.strictEqual(calculateArea(s), 36);

    console.log("PASSED");
}

/* ========================================================================= */
/* CHALLENGE 5: INTERSECTION TYPES & COMPOSITE BUILDER                       */
/* ========================================================================= */
type Identifiable = { id: string };
type Timestamped = { createdAt: number };
type Named = { name: string };

type Entity = Identifiable & Timestamped & Named;

function createEntity(id: string, name: string, timestamp: number): Entity {
    return {
        id,
        name,
        createdAt: timestamp
    };
}

function test_challenge_5(): void {
    process.stdout.write("[Test 5] Intersection Types Entity Builder... ");

    const now = 1700000000;
    const entity = createEntity("usr_99", "Admin", now);

    assert.strictEqual(entity.id, "usr_99");
    assert.strictEqual(entity.name, "Admin");
    assert.strictEqual(entity.createdAt, now);

    console.log("PASSED");
}

/* ========================================================================= */
/* MAIN RUNNER                                                               */
/* ========================================================================= */
console.log("=== RUNNING TYPESCRIPT MODULE 01 TESTS ===\n");

test_challenge_1();
test_challenge_2();
test_challenge_3();
test_challenge_4();
test_challenge_5();

console.log("\n>>> ALL 5 MODULE 01 TESTS PASSED SUCCESSFULLY! <<<");
