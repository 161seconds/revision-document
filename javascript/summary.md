# JavaScript Summary Cheat Sheet

A comprehensive, quick-reference revision guide based on standard JavaScript and W3Schools documentation.

---

## Table of Contents
1. [Basics & Syntax](#1-basics--syntax)
2. [Data Types & Operators](#2-data-types--operators)
3. [Control Flow](#3-control-flow)
4. [Functions & Scope](#4-functions--scope)
5. [Objects & Arrays](#5-objects--arrays)
6. [Strings & Numbers](#6-strings--numbers)
7. [DOM Manipulation & Events](#7-dom-manipulation--events)
8. [Asynchronous JavaScript](#8-asynchronous-javascript)
9. [Classes & Object-Oriented JS](#9-classes--object-oriented-js)
10. [Modern Features & ES6+](#10-modern-features--es6)
11. [Common Gotchas & Quick Tips](#11-common-gotchas--quick-tips)

---

## 1. Basics & Syntax

### Outputting Data
```javascript
console.log("Hello, World!");    // Browser / Node console
document.write("Hello");         // Testing / quick output (overwrites HTML if called after load)
window.alert("Alert box");       // Popup alert box
element.innerHTML = "<p>Hi</p>"; // Modifies HTML element content
```

### Variable Declarations
| Keyword | Scope | Reassignable | Redeclarable | Hoisted |
| :--- | :--- | :--- | :--- | :--- |
| `var` | Function / Global | Yes | Yes | Yes (initialized as `undefined`) |
| `let` | Block `{}` | Yes | No | Yes (Temporal Dead Zone - TDZ) |
| `const`| Block `{}` | No | No | Yes (Temporal Dead Zone - TDZ) |

```javascript
let count = 10;
count = 11; // OK

const PI = 3.14159;
// PI = 3.14; // TypeError: Assignment to constant variable

// Note: const objects and arrays can have their internal properties mutated:
const user = { name: "Alice" };
user.name = "Bob"; // OK!
```

---

## 2. Data Types & Operators

### Primitive Types (Immutable, passed by value)
- `string`: `"Hello"`, `'World'`, `\`Template\``
- `number`: integers and floating-point (e.g., `42`, `3.14`)
- `bigint`: large integers (e.g., `9007199254740991n`)
- `boolean`: `true` or `false`
- `undefined`: variable declared but not assigned a value
- `null`: intentional absence of any object value
- `symbol`: unique identifier (`Symbol("key")`)

### Reference Types (Mutable, passed by reference)
- `Object`, `Array`, `Function`, `Date`, `Map`, `Set`, `RegExp`

```javascript
typeof "text"        // "string"
typeof 123           // "number"
typeof true          // "boolean"
typeof undefined     // "undefined"
typeof null          // "object" (historical JavaScript quirk)
typeof [1, 2, 3]     // "object" (use Array.isArray(arr) to check)
typeof function(){}  // "function"
```

### Comparison & Logical Operators
```javascript
// Loose vs Strict Equality
5 == "5"             // true  (type coercion occurs)
5 === "5"            // false (strictly checks value and type)
5 !== "5"            // true

// Logical
true && false        // false (AND)
true || false        // true  (OR)
!true                // false (NOT)

// Nullish Coalescing (??) - returns right-hand side only if left is null or undefined
const score = 0;
const a = score || 10;  // 10 (0 is falsy)
const b = score ?? 10;  // 0  (0 is neither null nor undefined)

// Optional Chaining (?.) - prevents TypeError when reading nested properties
const street = user?.address?.street; // undefined if address is null/undefined
```

---

## 3. Control Flow

### Conditionals
```javascript
// if ... else if ... else
if (score >= 90) {
  grade = "A";
} else if (score >= 80) {
  grade = "B";
} else {
  grade = "C";
}

// Ternary Operator
const status = age >= 18 ? "Adult" : "Minor";

// Switch statement
switch (day) {
  case 1:
    console.log("Monday");
    break;
  case 5:
    console.log("Friday");
    break;
  default:
    console.log("Other day");
}
```

### Loops
```javascript
// Standard for loop
for (let i = 0; i < 5; i++) {
  console.log(i);
}

// while loop
while (count > 0) {
  count--;
}

// do...while loop (runs at least once)
do {
  runTask();
} while (condition);

// for...of (iterates over iterable values: Arrays, Strings, Sets, Maps)
const colors = ["red", "green", "blue"];
for (const color of colors) {
  console.log(color);
}

// for...in (iterates over enumerable keys/properties of an object)
const car = { make: "Toyota", model: "Corolla", year: 2022 };
for (const key in car) {
  console.log(`${key}: ${car[key]}`);
}
```

---

## 4. Functions & Scope

### Function Styles
```javascript
// 1. Function Declaration (Hoisted)
function greet(name = "Guest") {
  return `Hello, ${name}!`;
}

// 2. Function Expression (Not hoisted)
const add = function (a, b) {
  return a + b;
};

// 3. Arrow Function (ES6 - lexical 'this', no arguments object)
const multiply = (a, b) => a * b;
const double = x => x * 2; // Single param can omit parentheses
```

### Rest Parameters & Default Values
```javascript
function sum(...numbers) {
  return numbers.reduce((total, n) => total + n, 0);
}
sum(1, 2, 3, 4); // 10
```

### Closures
A closure is a function that remembers and accesses its lexical scope even when executed outside that scope:
```javascript
function createCounter() {
  let count = 0;
  return function () {
    count++;
    return count;
  };
}

const counter = createCounter();
console.log(counter()); // 1
console.log(counter()); // 2
```

### `this` Context
- In an object method: `this` refers to the owner object.
- In a standalone function: `this` refers to `window` (or `undefined` in strict mode).
- In an arrow function: `this` is lexically inherited from enclosing scope.
- Explicit binding: `fn.call(obj, arg1, arg2)`, `fn.apply(obj, [arg1, arg2])`, `fn.bind(obj)`.

---

## 5. Objects & Arrays

### Object Basics
```javascript
const person = {
  firstName: "John",
  lastName: "Doe",
  age: 30,
  fullName() {
    return `${this.firstName} ${this.lastName}`;
  }
};

// Accessing properties
person.firstName;       // "John"
person["lastName"];     // "Doe"

// Useful Object Methods
Object.keys(person);    // ["firstName", "lastName", "age", "fullName"]
Object.values(person);  // ["John", "Doe", 30, [Function]]
Object.entries(person); // [["firstName", "John"], ...]
Object.assign({}, person, { role: "Admin" }); // Shallow merge
Object.freeze(person);  // Prevents modifications
```

### Destructuring & Spread Operator
```javascript
// Object Destructuring & Renaming
const { firstName, age: yearsOld = 18 } = person;

// Array Destructuring & Rest
const [first, second, ...rest] = [10, 20, 30, 40, 50];

// Spread Operator (Shallow Copy & Merge)
const cloneObj = { ...person, active: true };
const mergedArr = [...[1, 2], ...[3, 4]]; // [1, 2, 3, 4]
```

### Essential Array Methods
```javascript
const nums = [1, 2, 3, 4, 5];

// Iteration & Transformation (Non-mutating)
const doubled = nums.map(n => n * 2);           // [2, 4, 6, 8, 10]
const evens = nums.filter(n => n % 2 === 0);    // [2, 4]
const total = nums.reduce((acc, n) => acc + n, 0); // 15

// Searching & Checking
nums.includes(3);          // true
nums.indexOf(3);           // 2 (-1 if not found)
nums.find(n => n > 3);     // 4 (first matching element)
nums.findIndex(n => n > 3);// 3 (index of first match)
nums.some(n => n > 4);     // true (at least one match)
nums.every(n => n > 0);    // true (all match)

// Modification (Mutating)
nums.push(6);              // Appends to end -> [1, 2, 3, 4, 5, 6]
nums.pop();                // Removes last element
nums.unshift(0);           // Prepends to start
nums.shift();              // Removes first element
nums.splice(1, 2, 99);     // At index 1, remove 2 items, insert 99
nums.sort((a, b) => a - b);// Numeric sort ascending

// Slicing (Non-mutating)
const sub = nums.slice(1, 3); // Extracts from index 1 up to (not including) 3
```

---

## 6. Strings & Numbers

### String Manipulation
```javascript
const str = "  JavaScript is Fun!  ";

str.length;                     // 22
str.trim();                     // "JavaScript is Fun!"
str.toUpperCase();              // "  JAVASCRIPT IS FUN!  "
str.toLowerCase();              // "  javascript is fun!  "
str.indexOf("Script");          // 6
str.includes("Fun");            // true
str.startsWith("  Java");       // true
str.endsWith("!  ");            // true
str.slice(2, 12);               // "JavaScript"
str.replace("Fun", "Awesome");  // Replaces first occurrence
str.replaceAll("a", "@");       // Replaces all occurrences
str.split(" ");                 // Splits into array by delimiter
```

### Numbers & Math
```javascript
// Parsing
parseInt("42px");               // 42
parseFloat("3.1415");           // 3.1415
Number("123");                  // 123
Number.isNaN(NaN);              // true
Number.isInteger(10);           // true

// Formatting
(3.14159).toFixed(2);           // "3.14" (returns string)

// Math Object
Math.round(4.7);                // 5
Math.floor(4.9);                // 4
Math.ceil(4.1);                 // 5
Math.trunc(4.9);                // 4 (removes decimal part)
Math.abs(-10);                  // 10
Math.max(1, 5, 10, 2);          // 10
Math.min(1, 5, 10, 2);          // 1
Math.random();                  // Float between 0 (inclusive) and 1 (exclusive)

// Random Integer between min and max (inclusive):
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
```

---

## 7. DOM Manipulation & Events

### Selecting Elements
```javascript
const elById = document.getElementById("header");
const elByQuery = document.querySelector(".nav-item");        // First matching element
const allMatches = document.querySelectorAll("p.highlight"); // NodeList of all matches
```

### Modifying Elements
```javascript
// Content
element.textContent = "Plain text content";
element.innerHTML = "<strong>Formatted HTML</strong>";

// Attributes
element.getAttribute("href");
element.setAttribute("target", "_blank");
element.removeAttribute("disabled");

// Styles & Classes
element.style.color = "blue";
element.style.marginTop = "16px";

element.classList.add("active");
element.classList.remove("hidden");
element.classList.toggle("selected");
element.classList.contains("active"); // true / false

// Creating & Appending
const newDiv = document.createElement("div");
newDiv.textContent = "New element";
document.body.appendChild(newDiv);
// newDiv.remove(); // Removes the element
```

### Handling Events
```javascript
const btn = document.querySelector("#submit-btn");

function handleClick(event) {
  event.preventDefault();   // Prevents default form submit or link behavior
  event.stopPropagation();  // Stops bubbling up DOM tree
  console.log("Clicked:", event.target);
}

btn.addEventListener("click", handleClick);
// btn.removeEventListener("click", handleClick);

// Common Events
// Mouse: click, dblclick, mouseenter, mouseleave, mouseover
// Keyboard: keydown, keyup, keypress
// Form: submit, change, input, focus, blur
// Document/Window: DOMContentLoaded, load, resize, scroll
```

---

## 8. Asynchronous JavaScript

### Promises
```javascript
const fetchData = () => {
  return new Promise((resolve, reject) => {
    const success = true;
    setTimeout(() => {
      if (success) {
        resolve({ data: "Success result" });
      } else {
        reject(new Error("Failed to fetch"));
      }
    }, 1000);
  });
};

fetchData()
  .then(res => console.log(res.data))
  .catch(err => console.error(err.message))
  .finally(() => console.log("Done"));
```

### `async` / `await` with `fetch`
```javascript
async function getUser(id) {
  try {
    const response = await fetch(`https://jsonplaceholder.typicode.com/users/${id}`);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const user = await response.json();
    console.log(user.name);
    return user;
  } catch (error) {
    console.error("Fetch failed:", error.message);
  }
}
```

### Concurrent Promise Combinators
- `Promise.all([p1, p2])`: Resolves when all resolve; rejects immediately if any reject.
- `Promise.allSettled([p1, p2])`: Waits for all to finish, returning `{ status, value | reason }` for each.
- `Promise.race([p1, p2])`: Returns first settled promise (fulfilled or rejected).
- `Promise.any([p1, p2])`: Resolves with first fulfilled promise; rejects only if all reject.

---

## 9. Classes & Object-Oriented JS

```javascript
class Animal {
  #privateField = "hidden"; // Private property (ES2022)

  constructor(name) {
    this.name = name;
  }

  speak() {
    return `${this.name} makes a sound.`;
  }

  static isAnimal(obj) {
    return obj instanceof Animal;
  }
}

// Inheritance
class Dog extends Animal {
  constructor(name, breed) {
    super(name); // Call parent constructor
    this.breed = breed;
  }

  // Method overriding
  speak() {
    return `${this.name} barks!`;
  }
}

const rover = new Dog("Rover", "Labrador");
rover.speak(); // "Rover barks!"
Animal.isAnimal(rover); // true
```

---

## 10. Modern Features & ES6+

### Modules (`import` / `export`)
```javascript
// math.js
export const add = (a, b) => a + b;
export default function multiply(a, b) { return a * b; }

// main.js
import multiply, { add } from "./math.js";
```

### JSON Handling
```javascript
const jsonString = JSON.stringify({ name: "Alice", active: true }); // Object -> JSON string
const parsedObj = JSON.parse(jsonString);                          // JSON string -> Object
```

### Web Storage API
```javascript
// LocalStorage (Persists until explicitly cleared)
localStorage.setItem("theme", "dark");
const theme = localStorage.getItem("theme"); // "dark"
localStorage.removeItem("theme");
localStorage.clear();

// SessionStorage (Cleared when tab closes)
sessionStorage.setItem("sessionId", "abc-123");
```

### Structured Clone (Deep Copy)
```javascript
const original = { a: 1, nested: { b: 2 } };
const deepCopy = structuredClone(original); // Native deep clone (ES2022)
```

---

## 11. Common Gotchas & Quick Tips

1. **Falsy Values in JavaScript**:
   - `false`, `0`, `-0`, `0n`, `""` (empty string), `null`, `undefined`, `NaN`.
   - *Everything else is truthy*, including `[]`, `{}`, and `"0"`.

2. **Implicit Coercion Surprises**:
   ```javascript
   "5" + 2  // "52" (number is converted to string for concatenation)
   "5" - 2  // 3    (string is converted to number for subtraction)
   [] + {}  // "[object Object]"
   ```

3. **`NaN` is Not Equal to Itself**:
   ```javascript
   NaN === NaN;           // false
   Number.isNaN(NaN);     // true (use this to check)
   ```

4. **Array Shallow vs Deep Copy**:
   ```javascript
   const shallow = [...arr];            // Copies references for nested items
   const deep = structuredClone(arr);   // Completely independent copy
   ```

5. **Strict Mode**:
   Place `"use strict";` at top of a file/function to catch common coding bugs (e.g. assigning to undeclared variables).
