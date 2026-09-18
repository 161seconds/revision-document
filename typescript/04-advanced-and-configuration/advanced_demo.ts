/**
 * TYPESCRIPT MODULE 04: ADVANCED & CONFIGURATION DEMO
 * Chạy trực tiếp qua Node.js v22:
 * node --no-warnings=ExperimentalWarning --experimental-transform-types advanced_demo.ts
 */

/* ========================================================================= */
/* 1. USER-DEFINED TYPE GUARDS & PREDICATES                                  */
/* ========================================================================= */
console.log("=== 1. USER-DEFINED TYPE GUARDS ===");

interface ApiSuccess {
    status: 200;
    data: { items: string[] };
}

function isApiSuccess(res: unknown): res is ApiSuccess {
    return (
        typeof res === "object" &&
        res !== null &&
        "status" in res &&
        (res as any).status === 200 &&
        "data" in res &&
        Array.isArray((res as any).data.items)
    );
}

const payloadA: unknown = { status: 200, data: { items: ["a", "b", "c"] } };
const payloadB: unknown = { status: 500, error: "Server Down" };

if (isApiSuccess(payloadA)) {
    console.log("Payload A is valid ApiSuccess! Total items:", payloadA.data.items.length);
}

if (!isApiSuccess(payloadB)) {
    console.log("Payload B rejected by Type Guard.");
}

/* ========================================================================= */
/* 2. ASSERTION SIGNATURES                                                   */
/* ========================================================================= */
console.log("\n=== 2. ASSERTION SIGNATURES ===");

function assertString(val: unknown, varName: string): asserts val is string {
    if (typeof val !== "string") {
        throw new TypeError(`Expected ${varName} to be a string, got ${typeof val}`);
    }
}

const token: unknown = "bearer_eyJhbGciOi...";
assertString(token, "token");
// token giờ đây an toàn là string
console.log("Verified Token length:", token.length);

/* ========================================================================= */
/* 3. BRANDED / NOMINAL TYPES                                                */
/* ========================================================================= */
console.log("\n=== 3. BRANDED TYPES (NOMINAL TYPING) ===");

type Brand<K, T> = K & { readonly __brand: T };

type CustomerId = Brand<string, "CustomerId">;
type OrderId = Brand<string, "OrderId">;

function makeCustomerId(id: string): CustomerId {
    return id as CustomerId;
}

function makeOrderId(id: string): OrderId {
    return id as OrderId;
}

function fulfillOrder(orderId: OrderId, customerId: CustomerId): string {
    return `Order [${orderId}] successfully processed for Customer [${customerId}]`;
}

const cust = makeCustomerId("CUST-99");
const ord = makeOrderId("ORD-5000");

console.log(fulfillOrder(ord, cust));

/* ========================================================================= */
/* 4. EXHAUSTIVE CHECKING WITH NEVER                                         */
/* ========================================================================= */
console.log("\n=== 4. EXHAUSTIVE CHECKING WITH NEVER ===");

type NotificationChannel = "SMS" | "EMAIL" | "PUSH";

function dispatchNotification(channel: NotificationChannel, message: string): string {
    switch (channel) {
        case "SMS":
            return `Sending SMS: ${message}`;
        case "EMAIL":
            return `Sending Email: ${message}`;
        case "PUSH":
            return `Sending Push notification: ${message}`;
        default: {
            const _exhaustive: never = channel;
            throw new Error(`Unhandled channel: ${_exhaustive}`);
        }
    }
}

console.log(dispatchNotification("EMAIL", "Your order has shipped!"));

console.log("\n>>> MODULE 04 DEMO FINISHED SUCCESSFULLY <<<");
