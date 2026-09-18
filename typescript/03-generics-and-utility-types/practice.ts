/**
 * MODULE 03: GENERICS & UTILITY TYPES - PRACTICE & SELF-TESTING SUITE
 * Chạy trực tiếp:
 * node --no-warnings=ExperimentalWarning --experimental-transform-types practice.ts
 */

import assert from "node:assert";

/* ========================================================================= */
/* CHALLENGE 1: GENERIC FIFO QUEUE                                           */
/* ========================================================================= */
class GenericQueue<T> {
    private items: T[] = [];

    enqueue(element: T): void {
        this.items.push(element);
    }

    dequeue(): T | undefined {
        return this.items.shift();
    }

    peek(): T | undefined {
        return this.items[0];
    }

    get size(): number {
        return this.items.length;
    }

    isEmpty(): boolean {
        return this.items.length === 0;
    }
}

function test_challenge_1(): void {
    process.stdout.write("[Test 1] Generic FIFO Queue... ");

    const strQueue = new GenericQueue<string>();
    assert.strictEqual(strQueue.isEmpty(), true);

    strQueue.enqueue("Alpha");
    strQueue.enqueue("Beta");
    strQueue.enqueue("Gamma");

    assert.strictEqual(strQueue.size, 3);
    assert.strictEqual(strQueue.peek(), "Alpha");
    assert.strictEqual(strQueue.dequeue(), "Alpha");
    assert.strictEqual(strQueue.size, 2);
    assert.strictEqual(strQueue.peek(), "Beta");

    console.log("PASSED");
}

/* ========================================================================= */
/* CHALLENGE 2: PLUCK FUNCTION WITH KEYOF CONSTRAINT                         */
/* ========================================================================= */
function pluck<T, K extends keyof T>(collection: T[], key: K): T[K][] {
    return collection.map(item => item[key]);
}

function test_challenge_2(): void {
    process.stdout.write("[Test 2] Generic Pluck with keyof... ");

    const users = [
        { id: 10, name: "Alice", active: true },
        { id: 20, name: "Bob", active: false },
        { id: 30, name: "Charlie", active: true }
    ];

    const names = pluck(users, "name");
    assert.deepStrictEqual(names, ["Alice", "Bob", "Charlie"]);

    const ids = pluck(users, "id");
    assert.deepStrictEqual(ids, [10, 20, 30]);

    console.log("PASSED");
}

/* ========================================================================= */
/* CHALLENGE 3: BUILT-IN UTILITY TYPES COMPOSITION                           */
/* ========================================================================= */
interface UserAccount {
    id: string;
    email: string;
    hash: string;
    role: "admin" | "editor" | "viewer";
    status: "active" | "banned";
}

type PublicUser = Omit<UserAccount, "hash">;
type UserUpdatePatch = Partial<Pick<UserAccount, "email" | "role">>;
type RoleDirectory = Record<UserAccount["role"], string[]>;

function sanitizeUser(user: UserAccount): PublicUser {
    const { hash: _, ...rest } = user;
    return rest;
}

function applyPatch(user: PublicUser, patch: UserUpdatePatch): PublicUser {
    return { ...user, ...patch };
}

function test_challenge_3(): void {
    process.stdout.write("[Test 3] Built-in Utility Types Pipeline... ");

    const raw: UserAccount = {
        id: "u1",
        email: "alice@test.com",
        hash: "argon2_secret",
        role: "editor",
        status: "active"
    };

    const pub = sanitizeUser(raw);
    assert.strictEqual((pub as any).hash, undefined);
    assert.strictEqual(pub.email, "alice@test.com");

    const patched = applyPatch(pub, { role: "admin" });
    assert.strictEqual(patched.role, "admin");
    assert.strictEqual(patched.email, "alice@test.com");

    const directory: RoleDirectory = {
        admin: ["Alice"],
        editor: ["Bob"],
        viewer: ["Charlie", "David"]
    };
    assert.strictEqual(directory.admin.length, 1);

    console.log("PASSED");
}

/* ========================================================================= */
/* CHALLENGE 4: CONDITIONAL TYPE WITH INFER (FLATTEN ARRAY)                 */
/* ========================================================================= */
type DeepFlatten<T> = T extends (infer Element)[]
    ? DeepFlatten<Element>
    : T;

function flattenDeep<T>(arr: any[]): T[] {
    return arr.flat(Infinity) as T[];
}

function test_challenge_4(): void {
    process.stdout.write("[Test 4] Conditional Type & Flattening... ");

    const nested = [1, [2, [3, [4, 5]]]];
    const flat = flattenDeep<number>(nested);

    assert.deepStrictEqual(flat, [1, 2, 3, 4, 5]);

    console.log("PASSED");
}

/* ========================================================================= */
/* CHALLENGE 5: MAPPED TYPES KEY REMAPPING & GETTER GENERATOR                */
/* ========================================================================= */
type GetterName<K extends string> = `get${Capitalize<K>}`;

function createGetters<T extends Record<string, any>>(obj: T): { [K in keyof T as GetterName<string & K>]: () => T[K] } {
    const result: any = {};
    for (const key of Object.keys(obj)) {
        const capitalized = key.charAt(0).toUpperCase() + key.slice(1);
        const getterKey = `get${capitalized}`;
        result[getterKey] = () => obj[key];
    }
    return result;
}

function test_challenge_5(): void {
    process.stdout.write("[Test 5] Mapped Types Key Remapping... ");

    const state = { count: 42, title: "Report" };
    const getters = createGetters(state);

    assert.strictEqual(getters.getCount(), 42);
    assert.strictEqual(getters.getTitle(), "Report");

    console.log("PASSED");
}

/* ========================================================================= */
/* MAIN RUNNER                                                               */
/* ========================================================================= */
console.log("=== RUNNING TYPESCRIPT MODULE 03 TESTS ===\n");

test_challenge_1();
test_challenge_2();
test_challenge_3();
test_challenge_4();
test_challenge_5();

console.log("\n>>> ALL 5 MODULE 03 TESTS PASSED SUCCESSFULLY! <<<");
