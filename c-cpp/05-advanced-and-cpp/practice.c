#include <stdio.h>
#include <stdlib.h>
#include <assert.h>
#include <stdbool.h>

/* ========================================================================= */
/* CHALLENGE 1: SAFE PREPROCESSOR MACRO                                      */
/* ========================================================================= */
#define CLAMP(val, low, high) (((val) < (low)) ? (low) : (((val) > (high)) ? (high) : (val)))
#define SAFE_PRODUCT(a, b) ((a) * (b))

void test_challenge_1_macros(void) {
    printf("[Test 1] Preprocessor & Safe Macros... ");

    /* Test parenthesis safety with expressions */
    int prod = SAFE_PRODUCT(2 + 3, 4 + 1); /* (5) * (5) = 25, not 2 + 3 * 4 + 1 = 15 */
    assert(prod == 25);

    /* Test CLAMP */
    assert(CLAMP(50, 0, 100) == 50);
    assert(CLAMP(-25, 0, 100) == 0);
    assert(CLAMP(150, 0, 100) == 100);
    assert(CLAMP(5 + 10, 0, 10) == 10);

    printf("PASSED\n");
}

/* ========================================================================= */
/* CHALLENGE 2: FUNCTION POINTER HIGHER-ORDER FILTER                         */
/* ========================================================================= */
typedef bool (*Predicate)(int);

bool is_even(int x) { return x % 2 == 0; }
bool is_positive(int x) { return x > 0; }

size_t count_matches(const int *arr, size_t len, Predicate pred) {
    size_t count = 0;
    for (size_t i = 0; i < len; i++) {
        if (pred(arr[i])) {
            count++;
        }
    }
    return count;
}

void test_challenge_2_function_pointers(void) {
    printf("[Test 2] Higher-order Function Pointer Callback... ");

    int numbers[] = {-5, -2, 0, 3, 4, 7, 10, -8, 12};
    size_t total = sizeof(numbers) / sizeof(numbers[0]);

    size_t evens = count_matches(numbers, total, is_even);
    assert(evens == 5); /* -2, 0, 4, 10, -8 */

    size_t positives = count_matches(numbers, total, is_positive);
    assert(positives == 5); /* 3, 4, 7, 10, 12 */

    printf("PASSED\n");
}

/* ========================================================================= */
/* CHALLENGE 3: QSORT WITH CUSTOM DESCENDING COMPARATOR                     */
/* ========================================================================= */
int compare_desc(const void *a, const void *b) {
    int val_a = *(const int *)a;
    int val_b = *(const int *)b;
    if (val_a > val_b) return -1;
    if (val_a < val_b) return 1;
    return 0;
}

void test_challenge_3_qsort_comparator(void) {
    printf("[Test 3] Standard qsort Descending Comparator... ");

    int data[] = {15, 3, 99, -10, 42, 0};
    size_t len = sizeof(data) / sizeof(data[0]);

    qsort(data, len, sizeof(int), compare_desc);

    assert(data[0] == 99);
    assert(data[1] == 42);
    assert(data[2] == 15);
    assert(data[3] == 3);
    assert(data[4] == 0);
    assert(data[5] == -10);

    printf("PASSED\n");
}

/* ========================================================================= */
/* CHALLENGE 4: FUNCTION POINTER DISPATCH TABLE                              */
/* ========================================================================= */
typedef enum {
    OP_ADD = 0,
    OP_SUB = 1,
    OP_MUL = 2,
    OP_DIV = 3,
    OP_COUNT = 4
} OpCode;

typedef int (*BinaryOp)(int, int);

int op_add(int a, int b) { return a + b; }
int op_sub(int a, int b) { return a - b; }
int op_mul(int a, int b) { return a * b; }
int op_div(int a, int b) { return (b != 0) ? (a / b) : 0; }

int evaluate(OpCode code, int a, int b) {
    static const BinaryOp table[OP_COUNT] = {op_add, op_sub, op_mul, op_div};
    if (code >= 0 && code < OP_COUNT) {
        return table[code](a, b);
    }
    return 0;
}

void test_challenge_4_dispatch_table(void) {
    printf("[Test 4] Function Pointer Dispatch Table... ");

    assert(evaluate(OP_ADD, 12, 8) == 20);
    assert(evaluate(OP_SUB, 12, 8) == 4);
    assert(evaluate(OP_MUL, 12, 8) == 96);
    assert(evaluate(OP_DIV, 48, 6) == 8);
    assert(evaluate(OP_DIV, 48, 0) == 0);

    printf("PASSED\n");
}

/* ========================================================================= */
/* CHALLENGE 5: DYNAMIC ARRAY CAPACITY GROWTH (C++ VECTOR SIMULATION)        */
/* ========================================================================= */
typedef struct {
    int *buffer;
    size_t size;
    size_t capacity;
} DynArray;

void dynarray_init(DynArray *arr, size_t initial_cap) {
    arr->size = 0;
    arr->capacity = (initial_cap > 0) ? initial_cap : 2;
    arr->buffer = (int *)malloc(arr->capacity * sizeof(int));
    assert(arr->buffer != NULL);
}

void dynarray_append(DynArray *arr, int val) {
    if (arr->size >= arr->capacity) {
        size_t next_cap = arr->capacity * 2;
        int *next_buf = (int *)realloc(arr->buffer, next_cap * sizeof(int));
        assert(next_buf != NULL);
        arr->buffer = next_buf;
        arr->capacity = next_cap;
    }
    arr->buffer[arr->size++] = val;
}

void dynarray_free(DynArray *arr) {
    if (arr->buffer) {
        free(arr->buffer);
        arr->buffer = NULL;
    }
    arr->size = 0;
    arr->capacity = 0;
}

void test_challenge_5_dynamic_array(void) {
    printf("[Test 5] Dynamic Resizable Array Growth... ");

    DynArray arr;
    dynarray_init(&arr, 2);
    assert(arr.size == 0 && arr.capacity == 2);

    dynarray_append(&arr, 100);
    dynarray_append(&arr, 200);
    assert(arr.size == 2 && arr.capacity == 2);

    /* Adding 3rd element triggers 2x capacity increase to 4 */
    dynarray_append(&arr, 300);
    assert(arr.size == 3 && arr.capacity == 4);
    assert(arr.buffer[0] == 100 && arr.buffer[1] == 200 && arr.buffer[2] == 300);

    /* Adding 4th element */
    dynarray_append(&arr, 400);
    assert(arr.size == 4 && arr.capacity == 4);

    /* Adding 5th element triggers 2x capacity increase to 8 */
    dynarray_append(&arr, 500);
    assert(arr.size == 5 && arr.capacity == 8);
    assert(arr.buffer[4] == 500);

    dynarray_free(&arr);
    assert(arr.buffer == NULL);
    assert(arr.size == 0 && arr.capacity == 0);

    printf("PASSED\n");
}

/* ========================================================================= */
/* MAIN RUNNER                                                               */
/* ========================================================================= */
int main(void) {
    printf("=== MODULE 05: ADVANCED & C++ SELF-TESTING SUITE ===\n\n");

    test_challenge_1_macros();
    test_challenge_2_function_pointers();
    test_challenge_3_qsort_comparator();
    test_challenge_4_dispatch_table();
    test_challenge_5_dynamic_array();

    printf("\n>>> ALL 5 ADVANCED MODULE CHALLENGES PASSED SUCCESSFULLY! <<<\n");
    return 0;
}
