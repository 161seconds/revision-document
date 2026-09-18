/**
 * TYPESCRIPT MODULE 03: GENERICS & UTILITY TYPES DEMO
 * Chạy trực tiếp qua Node.js v22:
 * node --no-warnings=ExperimentalWarning --experimental-transform-types generics_demo.ts
 */

/* ========================================================================= */
/* 1. GENERIC STACK DATA STRUCTURE                                           */
/* ========================================================================= */
console.log("=== 1. GENERIC STACK DATA STRUCTURE ===");

class GenericStack<T> {
    private items: T[] = [];

    push(item: T): void {
        this.items.push(item);
    }

    pop(): T | undefined {
        return this.items.pop();
    }

    peek(): T | undefined {
        return this.items[this.items.length - 1];
    }

    get length(): number {
        return this.items.length;
    }
}

const numStack = new GenericStack<number>();
numStack.push(10);
numStack.push(20);
numStack.push(30);
console.log(`Stack top: ${numStack.peek()}, size: ${numStack.length}`);
console.log(`Popped: ${numStack.pop()}`);

/* ========================================================================= */
/* 2. GENERIC CONSTRAINTS & KEYOF LOOKUP                                     */
/* ========================================================================= */
console.log("\n=== 2. GENERIC CONSTRAINTS & KEYOF ===");

function extractProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
    return obj[key];
}

const serverStatus = {
    uptimeSec: 3600,
    region: "ap-southeast-1",
    isHealthy: true
};

const region = extractProperty(serverStatus, "region");
const uptime = extractProperty(serverStatus, "uptimeSec");
console.log({ region, uptime });

/* ========================================================================= */
/* 3. BUILT-IN UTILITY TYPES (PARTIAL, PICK, OMIT, RECORD)                   */
/* ========================================================================= */
console.log("\n=== 3. BUILT-IN UTILITY TYPES ===");

interface Article {
    id: string;
    title: string;
    content: string;
    tags: string[];
    views: number;
}

// Partial update
type ArticleUpdate = Partial<Article>;
const patch: ArticleUpdate = { views: 105 };

// Pick & Omit
type ArticleSummary = Pick<Article, "id" | "title">;
type DraftArticle = Omit<Article, "id" | "views">;

const summary: ArticleSummary = { id: "art_1", title: "TypeScript Generics" };
const draft: DraftArticle = {
    title: "Drafting Guide",
    content: "Under construction...",
    tags: ["ts", "guide"]
};

console.log("Summary:", summary);
console.log("Draft:", draft);

// Record type
const tagCounts: Record<string, number> = {
    typescript: 42,
    react: 28,
    nodejs: 15
};
console.log("Tag counts:", tagCounts);

/* ========================================================================= */
/* 4. CONDITIONAL & MAPPED TYPES WITH INFER                                  */
/* ========================================================================= */
console.log("\n=== 4. CONDITIONAL & MAPPED TYPES ===");

type UnpackPromise<T> = T extends Promise<infer Inner> ? Inner : T;

async function fetchScore(): Promise<number> {
    return 98;
}

type ScoreResult = UnpackPromise<ReturnType<typeof fetchScore>>;
const score: ScoreResult = 98;
console.log("Extracted ReturnType and Unpacked Promise:", score);

// Template literal type
type HttpMethod = "GET" | "POST";
type Route = "/users" | "/orders";
type Endpoint = `${HttpMethod} ${Route}`;

const routeCall: Endpoint = "GET /users";
console.log("Template Literal Endpoint:", routeCall);

console.log("\n>>> MODULE 03 DEMO FINISHED SUCCESSFULLY <<<");
