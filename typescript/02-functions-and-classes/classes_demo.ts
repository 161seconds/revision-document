/**
 * TYPESCRIPT MODULE 02: FUNCTIONS & CLASSES DEMO
 * Chạy trực tiếp qua Node.js v22:
 * node --no-warnings=ExperimentalWarning --experimental-transform-types classes_demo.ts
 */

/* ========================================================================= */
/* 1. FUNCTION OVERLOADS                                                     */
/* ========================================================================= */
console.log("=== 1. FUNCTION OVERLOADS ===");

function formatTimestamp(epochMs: number): string;
function formatTimestamp(isoString: string): string;
function formatTimestamp(input: number | string): string {
    const d = new Date(input);
    return `[${d.toISOString()}]`;
}

console.log("From Epoch:", formatTimestamp(1700000000000));
console.log("From ISO:  ", formatTimestamp("2026-09-18T10:00:00.000Z"));

/* ========================================================================= */
/* 2. PARAMETER PROPERTIES & ACCESS MODIFIERS                                */
/* ========================================================================= */
console.log("\n=== 2. PARAMETER PROPERTIES & ACCESS MODIFIERS ===");

class Employee {
    #nationalId: string; // ECMAScript Hard Private Field

    constructor(
        public readonly id: string,
        public name: string,
        protected baseSalary: number,
        nationalId: string
    ) {
        this.#nationalId = nationalId;
    }

    public getSummary(): string {
        return `Employee ${this.name} (ID: ${this.id}) - Base: $${this.baseSalary}`;
    }
}

class Manager extends Employee {
    constructor(
        id: string,
        name: string,
        baseSalary: number,
        nationalId: string,
        public bonus: number
    ) {
        super(id, name, baseSalary, nationalId);
    }

    public getTotalCompensation(): number {
        // Truy cập được protected baseSalary từ lớp cha
        return this.baseSalary + this.bonus;
    }
}

const mgr = new Manager("MGR-01", "Alice Johnson", 8000, "VN-99999", 2500);
console.log(mgr.getSummary());
console.log(`Total Compensation: $${mgr.getTotalCompensation()}`);

/* ========================================================================= */
/* 3. ABSTRACT CLASSES & INTERFACE CONTRACTS                                 */
/* ========================================================================= */
console.log("\n=== 3. ABSTRACT CLASSES & INTERFACES ===");

interface Exportable {
    toPayload(): Record<string, unknown>;
}

abstract class PaymentProcessor implements Exportable {
    constructor(public readonly gatewayName: string) {}

    // Template Method
    public processTransaction(amount: number): boolean {
        console.log(`Routing $${amount} via [${this.gatewayName}]...`);
        if (!this.authenticate()) return false;
        return this.executeCharge(amount);
    }

    protected abstract authenticate(): boolean;
    protected abstract executeCharge(amount: number): boolean;

    public toPayload(): Record<string, unknown> {
        return { gateway: this.gatewayName, active: true };
    }
}

class StripeProcessor extends PaymentProcessor {
    constructor(private apiKey: string) {
        super("Stripe-v3");
    }

    protected authenticate(): boolean {
        return this.apiKey.startsWith("sk_live_");
    }

    protected executeCharge(amount: number): boolean {
        console.log(`Stripe charged $${amount} successfully!`);
        return true;
    }
}

const stripe = new StripeProcessor("sk_live_abc123xyz");
const ok = stripe.processTransaction(250);
console.log("Transaction Success:", ok);
console.log("Payload:", stripe.toPayload());

/* ========================================================================= */
/* 4. GETTERS & SETTERS                                                      */
/* ========================================================================= */
console.log("\n=== 4. GETTERS & SETTERS ===");

class Thermostat {
    private _tempC: number = 20;

    get celsius(): number {
        return this._tempC;
    }

    set celsius(val: number) {
        if (val < -50 || val > 100) throw new RangeError("Temperature out of safe operating range");
        this._tempC = val;
    }

    get fahrenheit(): number {
        return (this._tempC * 9) / 5 + 32;
    }
}

const thermo = new Thermostat();
console.log(`Initial: ${thermo.celsius}°C = ${thermo.fahrenheit}°F`);
thermo.celsius = 35;
console.log(`Updated: ${thermo.celsius}°C = ${thermo.fahrenheit}°F`);

console.log("\n>>> MODULE 02 DEMO FINISHED SUCCESSFULLY <<<");
