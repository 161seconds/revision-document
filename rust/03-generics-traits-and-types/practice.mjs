// rust/03-generics-traits-and-types/practice.mjs
import assert from "node:assert/strict";

console.log("=============================================================");
console.log("RUST SYSTEMS PROGRAMMING MODULE 03: GENERICS & TRAITS");
console.log("=============================================================\n");

// =========================================================================
// 1. Fat Pointer & Vtable Dynamic Dispatch Simulation
// =========================================================================
console.log("[Test 1] Testing Fat Pointer Vtable & Dynamic Dispatch Invariants...");

class VTable {
  constructor(typeName, size, align, methods) {
    this.typeName = typeName;
    this.size = size;
    this.align = align;
    this.methods = methods; // Table of function pointers
  }
}

class TraitObject {
  constructor(dataInstance, vtable) {
    this.dataPtr = dataInstance; // 8 bytes in 64-bit architecture
    this.vtablePtr = vtable;     // 8 bytes in 64-bit architecture
  }

  // Memory footprint of &dyn Trait or Box<dyn Trait>
  sizeInBytes() {
    return 16; // Exact 2-word fat pointer layout
  }

  call(methodName, ...args) {
    const fn = this.vtablePtr.methods[methodName];
    if (!fn) {
      throw new Error(`Method ${methodName} not present in vtable for ${this.vtablePtr.typeName}`);
    }
    return fn(this.dataPtr, ...args);
  }
}

// Concrete Implementations
const terminalVTable = new VTable("TerminalRenderer", 0, 1, {
  render: (self) => `[TERM: ${self.theme}] Output`
});

const htmlVTable = new VTable("HtmlRenderer", 8, 8, {
  render: (self) => `<div class='${self.cssClass}'>Output</div>`
});

const termObj = new TraitObject({ theme: "dark" }, terminalVTable);
const htmlObj = new TraitObject({ cssClass: "container" }, htmlVTable);

// Heterogeneous collection dispatching via vtables:
const pipeline = [termObj, htmlObj];
const rendered = pipeline.map(item => item.call("render"));

assert.equal(termObj.sizeInBytes(), 16);
assert.equal(htmlObj.sizeInBytes(), 16);
assert.deepEqual(rendered, [
  "[TERM: dark] Output",
  "<div class='container'>Output</div>"
]);
console.log("  -> [PASSED] Fat pointer vtable dynamic dispatch (16 bytes layout) verified.");

// =========================================================================
// 2. Trait Bounds & Generic Constraints Solver
// =========================================================================
console.log("\n[Test 2] Testing Generic Trait Bounds Validation...");

const typeRegistry = {
  "Packet": ["Serialize", "Clone", "Send", "Debug"],
  "RcRef": ["Clone", "Debug"], // Missing Send
  "RawBuffer": ["Send", "Sync"] // Missing Clone, Debug
};

const compileGeneric = (typeName, requiredBounds) => {
  const implemented = typeRegistry[typeName] || [];
  const missing = requiredBounds.filter(bound => !implemented.includes(bound));
  if (missing.length > 0) {
    throw new Error(`Trait bound not satisfied: ${typeName} does not implement ${missing.join(" + ")}`);
  }
  return true;
};

// Requires T: Serialize + Clone + Send
const bounds = ["Serialize", "Clone", "Send"];
assert.equal(compileGeneric("Packet", bounds), true);

assert.throws(() => {
  compileGeneric("RcRef", bounds);
}, /Trait bound not satisfied: RcRef does not implement Serialize/);

assert.throws(() => {
  compileGeneric("RawBuffer", bounds);
}, /Trait bound not satisfied: RawBuffer does not implement Serialize \+ Clone/);
console.log("  -> [PASSED] Trait bounds compile-time constraint validation verified.");

// =========================================================================
// 3. Custom Lazy Iterator with Associated Type
// =========================================================================
console.log("\n[Test 3] Testing Lazy Iterator Pipelines with Associated Item...");

class LazyIterator {
  constructor(generatorFn) {
    this._gen = generatorFn();
    this.stepsExecuted = 0;
  }

  next() {
    this.stepsExecuted++;
    return this._gen.next();
  }

  map(transformFn) {
    const parent = this;
    return new LazyIterator(function* () {
      while (true) {
        const item = parent.next();
        if (item.done) break;
        yield transformFn(item.value);
      }
    });
  }

  filter(predicateFn) {
    const parent = this;
    return new LazyIterator(function* () {
      while (true) {
        const item = parent.next();
        if (item.done) break;
        if (predicateFn(item.value)) {
          yield item.value;
        }
      }
    });
  }

  take(n) {
    const parent = this;
    return new LazyIterator(function* () {
      let count = 0;
      while (count < n) {
        const item = parent.next();
        if (item.done) break;
        yield item.value;
        count++;
      }
    });
  }

  collect() {
    const results = [];
    while (true) {
      const item = this.next();
      if (item.done) break;
      results.push(item.value);
    }
    return results;
  }
}

// Infinite Fibonacci Generator (Lazy)
const fibonacci = () => new LazyIterator(function* () {
  let curr = 0n;
  let next = 1n;
  while (true) {
    yield curr;
    const temp = curr + next;
    curr = next;
    next = temp;
  }
});

// Setup pipeline: take first 8 even fibonacci numbers, multiply by 2
const pipelineIter = fibonacci()
  .filter(n => n % 2n === 0n)
  .take(5)
  .map(n => Number(n * 2n));

// Assert laziness: before collect, 0 steps executed
assert.equal(pipelineIter.stepsExecuted, 0);

const collected = pipelineIter.collect();
assert.deepEqual(collected, [0, 4, 16, 68, 288]);
console.log("  -> Collected 5 even Fibonacci transformed values:", collected);
console.log("  -> [PASSED] Zero-cost lazy iterator pipeline verified.");

// =========================================================================
// 4. Reflexive From & Into Conversion Invariant
// =========================================================================
console.log("\n[Test 4] Testing Reflexive From & Into Conversions...");

class ConversionRegistry {
  constructor() {
    this.fromImplementations = new Map();
  }

  registerFrom(targetType, sourceType, converterFn) {
    const key = `${sourceType}->${targetType}`;
    this.fromImplementations.set(key, converterFn);
  }

  // From<T> for U
  from(targetType, sourceType, sourceValue) {
    const key = `${sourceType}->${targetType}`;
    const fn = this.fromImplementations.get(key);
    if (!fn) throw new Error(`No From implementation found for ${key}`);
    return fn(sourceValue);
  }

  // Into<U> for T: Rust automatically implements Into whenever From is implemented!
  into(sourceValue, sourceType, targetType) {
    return this.from(targetType, sourceType, sourceValue);
  }
}

const conversions = new ConversionRegistry();

// Implementing From<std::io::Error> for AppError automatically gives Into<AppError>
conversions.registerFrom("AppError", "IoError", (ioErr) => {
  return { code: 500, message: `IO Failed: ${ioErr.details}` };
});

const ioErr = { details: "File not found: /etc/ssl/cert.pem" };
const appErrViaFrom = conversions.from("AppError", "IoError", ioErr);
const appErrViaInto = conversions.into(ioErr, "IoError", "AppError");

assert.deepEqual(appErrViaFrom, appErrViaInto);
assert.equal(appErrViaInto.code, 500);
console.log("  -> [PASSED] From/Into symmetric reflection verified.");

// =========================================================================
// 5. Object Safety Rules Validator
// =========================================================================
console.log("\n[Test 5] Testing Trait Object Safety Verification Engine...");

const checkObjectSafety = (traitDef) => {
  const violations = [];

  if (traitDef.requiresSelfSized) {
    violations.push("Trait requires Self: Sized");
  }

  for (const method of traitDef.methods) {
    if (method.returnsSelf && !method.hasWhereSelfSized) {
      violations.push(`Method '${method.name}' returns Self without where Self: Sized clause`);
    }
    if (method.isGeneric && !method.hasWhereSelfSized) {
      violations.push(`Method '${method.name}' has generic parameters (cannot monomorphize in vtable)`);
    }
    if (!method.hasReceiver) {
      violations.push(`Associated function '${method.name}' has no self receiver (not callable on dyn Trait)`);
    }
  }

  return {
    isObjectSafe: violations.length === 0,
    violations
  };
};

const safeTrait = {
  name: "Plugin",
  requiresSelfSized: false,
  methods: [
    { name: "init", hasReceiver: true, returnsSelf: false, isGeneric: false },
    { name: "execute", hasReceiver: true, returnsSelf: false, isGeneric: false }
  ]
};

const unsafeTrait = {
  name: "Factory",
  requiresSelfSized: false,
  methods: [
    { name: "create_self", hasReceiver: true, returnsSelf: true, hasWhereSelfSized: false },
    { name: "transform", hasReceiver: true, returnsSelf: false, isGeneric: true, hasWhereSelfSized: false },
    { name: "constructor_helper", hasReceiver: false }
  ]
};

const safeResult = checkObjectSafety(safeTrait);
assert.equal(safeResult.isObjectSafe, true);

const unsafeResult = checkObjectSafety(unsafeTrait);
assert.equal(unsafeResult.isObjectSafe, false);
assert.equal(unsafeResult.violations.length, 3);
console.log("  -> Verified 3 object safety violations:", unsafeResult.violations);
console.log("  -> [PASSED] Object safety rules engine accurately flags non-object-safe traits.");

console.log("\n=============================================================");
console.log("ALL 5 RUST SYSTEMS MODULE 03 TESTS PASSED SUCCESSFULLY! (5/5)");
console.log("=============================================================");
