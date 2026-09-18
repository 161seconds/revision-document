/**
 * MODULE 02: FUNCTIONS & CLASSES - PRACTICE & SELF-TESTING SUITE
 * Chạy trực tiếp:
 * node --no-warnings=ExperimentalWarning --experimental-transform-types practice.ts
 */

import assert from "node:assert";

/* ========================================================================= */
/* CHALLENGE 1: FUNCTION OVERLOAD IMPLEMENTATION                             */
/* ========================================================================= */
function formatData(value: string): string;
function formatData(value: number): string;
function formatData(value: string[]): string;
function formatData(value: string | number | string[]): string {
    if (typeof value === "string") {
        return value.trim().toUpperCase();
    }
    if (typeof value === "number") {
        return `0x${value.toString(16).toUpperCase()}`;
    }
    if (Array.isArray(value)) {
        return value.join(" | ");
    }
    throw new Error("Unsupported data format");
}

function test_challenge_1(): void {
    process.stdout.write("[Test 1] Function Overloading Dispatch... ");

    assert.strictEqual(formatData("  hello world  "), "HELLO WORLD");
    assert.strictEqual(formatData(255), "0xFF");
    assert.strictEqual(formatData(["one", "two", "three"]), "one | two | three");

    console.log("PASSED");
}

/* ========================================================================= */
/* CHALLENGE 2: PARAMETER PROPERTIES & INHERITANCE                           */
/* ========================================================================= */
class Vehicle {
    constructor(
        public readonly vin: string,
        public make: string,
        protected mileageKm: number
    ) {}

    public getMileage(): number {
        return this.mileageKm;
    }
}

class ElectricVehicle extends Vehicle {
    constructor(
        vin: string,
        make: string,
        mileageKm: number,
        public batteryCapacityKWh: number
    ) {
        super(vin, make, mileageKm);
    }

    public drive(distanceKm: number): void {
        this.mileageKm += distanceKm;
    }
}

function test_challenge_2(): void {
    process.stdout.write("[Test 2] Parameter Properties & Subclassing... ");

    const ev = new ElectricVehicle("VIN-12345", "Tesla Model 3", 10000, 75);
    assert.strictEqual(ev.vin, "VIN-12345");
    assert.strictEqual(ev.make, "Tesla Model 3");
    assert.strictEqual(ev.batteryCapacityKWh, 75);
    assert.strictEqual(ev.getMileage(), 10000);

    ev.drive(150);
    assert.strictEqual(ev.getMileage(), 10150);

    console.log("PASSED");
}

/* ========================================================================= */
/* CHALLENGE 3: ABSTRACT CLASS TEMPLATE METHOD                               */
/* ========================================================================= */
abstract class PipelineTask {
    public execute(): string {
        const pre = this.setup();
        const main = this.runProcess();
        const post = this.teardown();
        return `${pre} -> ${main} -> ${post}`;
    }

    protected setup(): string {
        return "INIT";
    }

    protected teardown(): string {
        return "CLEANUP";
    }

    protected abstract runProcess(): string;
}

class DataMigrationTask extends PipelineTask {
    protected override runProcess(): string {
        return "MIGRATE_1000_RECORDS";
    }
}

function test_challenge_3(): void {
    process.stdout.write("[Test 3] Abstract Class & Template Method... ");

    const task = new DataMigrationTask();
    const result = task.execute();
    assert.strictEqual(result, "INIT -> MIGRATE_1000_RECORDS -> CLEANUP");

    console.log("PASSED");
}

/* ========================================================================= */
/* CHALLENGE 4: MULTIPLE INTERFACES & POLYMORPHISM                           */
/* ========================================================================= */
interface Auditable {
    getAuditLog(): string;
}

interface Encryptable {
    encrypt(): string;
}

class SecureDocument implements Auditable, Encryptable {
    constructor(
        public title: string,
        private content: string,
        private author: string
    ) {}

    getAuditLog(): string {
        return `Doc '${this.title}' authored by ${this.author}`;
    }

    encrypt(): string {
        return Buffer.from(this.content).toString("base64");
    }
}

function test_challenge_4(): void {
    process.stdout.write("[Test 4] Implementing Multiple Interfaces... ");

    const doc = new SecureDocument("TopSecret", "Payload-123", "Admin");
    const auditor: Auditable = doc;
    const crypt: Encryptable = doc;

    assert.strictEqual(auditor.getAuditLog(), "Doc 'TopSecret' authored by Admin");
    assert.strictEqual(crypt.encrypt(), "UGF5bG9hZC0xMjM=");

    console.log("PASSED");
}

/* ========================================================================= */
/* CHALLENGE 5: GETTER / SETTER BUSINESS VALIDATION                          */
/* ========================================================================= */
class SafeAccount {
    private _balance: number = 0;

    get balance(): number {
        return this._balance;
    }

    set balance(amount: number) {
        if (amount < 0) {
            throw new Error("Balance cannot be negative");
        }
        this._balance = amount;
    }

    get isSolvent(): boolean {
        return this._balance > 0;
    }
}

function test_challenge_5(): void {
    process.stdout.write("[Test 5] Getter/Setter Invariant Validation... ");

    const acc = new SafeAccount();
    assert.strictEqual(acc.balance, 0);
    assert.strictEqual(acc.isSolvent, false);

    acc.balance = 500;
    assert.strictEqual(acc.balance, 500);
    assert.strictEqual(acc.isSolvent, true);

    assert.throws(() => {
        acc.balance = -100;
    }, /Balance cannot be negative/);

    console.log("PASSED");
}

/* ========================================================================= */
/* MAIN RUNNER                                                               */
/* ========================================================================= */
console.log("=== RUNNING TYPESCRIPT MODULE 02 TESTS ===\n");

test_challenge_1();
test_challenge_2();
test_challenge_3();
test_challenge_4();
test_challenge_5();

console.log("\n>>> ALL 5 MODULE 02 TESTS PASSED SUCCESSFULLY! <<<");
