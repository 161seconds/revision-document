#include <stdio.h>
#include <stdlib.h>
#include <string.h>

/* ========================================================================= */
/* 1. PREPROCESSOR & MACROS                                                  */
/* ========================================================================= */
#define DEBUG_MODE 1
#define SAFE_SQUARE(x) ((x) * (x))
#define TO_STR(x) #x
#define CONCAT(a, b) a##b

#if DEBUG_MODE
    #define LOG_DEBUG(msg) printf("[DEBUG] %s\n", msg)
#else
    #define LOG_DEBUG(msg) /* no-op */
#endif

/* ========================================================================= */
/* 2. FUNCTION POINTERS & CALLBACKS                                          */
/* ========================================================================= */
typedef int (*math_op_t)(int, int);

int add(int a, int b) { return a + b; }
int sub(int a, int b) { return a - b; }
int mul(int a, int b) { return a * b; }

int execute_operation(math_op_t op, int a, int b) {
    return op(a, b);
}

/* Comparator for standard library qsort() */
int compare_ints_asc(const void *a, const void *b) {
    int val_a = *(const int *)a;
    int val_b = *(const int *)b;
    if (val_a < val_b) return -1;
    if (val_a > val_b) return 1;
    return 0;
}

/* ========================================================================= */
/* 3. DYNAMIC VECTOR SIMULATION (C-STYLE RAII / RESIZABLE ARRAY)             */
/* ========================================================================= */
typedef struct {
    int *data;
    size_t size;
    size_t capacity;
} IntVector;

void vector_init(IntVector *vec, size_t initial_cap) {
    vec->size = 0;
    vec->capacity = (initial_cap > 0) ? initial_cap : 4;
    vec->data = (int *)malloc(vec->capacity * sizeof(int));
    if (!vec->data) {
        perror("Failed to allocate initial vector buffer");
        exit(EXIT_FAILURE);
    }
}

void vector_push_back(IntVector *vec, int value) {
    if (vec->size == vec->capacity) {
        size_t new_capacity = vec->capacity * 2;
        int *new_data = (int *)realloc(vec->data, new_capacity * sizeof(int));
        if (!new_data) {
            perror("Failed to reallocate vector buffer");
            free(vec->data);
            exit(EXIT_FAILURE);
        }
        vec->data = new_data;
        vec->capacity = new_capacity;
    }
    vec->data[vec->size++] = value;
}

void vector_free(IntVector *vec) {
    if (vec->data) {
        free(vec->data);
        vec->data = NULL;
    }
    vec->size = 0;
    vec->capacity = 0;
}

/* ========================================================================= */
/* MAIN RUNNER                                                               */
/* ========================================================================= */
int main(void) {
    printf("=== C/C++ ADVANCED CONCEPTS DEMO ===\n\n");

    /* --- 1. Preprocessor & Macros --- */
    LOG_DEBUG("Starting preprocessor tests...");
    int num = 3 + 2;
    printf("Macro SAFE_SQUARE(3 + 2) = %d\n", SAFE_SQUARE(num));
    printf("Stringify TO_STR(SystemReady) = %s\n", TO_STR(SystemReady));
    
    int CONCAT(server_, port) = 8080;
    printf("Concatenated variable server_port = %d\n\n", server_port);

    /* --- 2. Function Pointers & Callbacks --- */
    printf("--- Function Pointers & Dispatch Table ---\n");
    printf("Callback add(10, 5) via execute_operation: %d\n", execute_operation(add, 10, 5));
    printf("Callback mul(10, 5) via execute_operation: %d\n", execute_operation(mul, 10, 5));

    math_op_t dispatch_table[] = {add, sub, mul};
    const char *op_names[] = {"Add", "Sub", "Mul"};
    for (int i = 0; i < 3; i++) {
        printf("Dispatch [%s](20, 4) = %d\n", op_names[i], dispatch_table[i](20, 4));
    }

    /* Standard library qsort with callback */
    int numbers[] = {42, 7, 19, -3, 88, 0, 15};
    size_t count = sizeof(numbers) / sizeof(numbers[0]);
    printf("\nArray before qsort: ");
    for (size_t i = 0; i < count; i++) printf("%d ", numbers[i]);
    printf("\n");

    qsort(numbers, count, sizeof(int), compare_ints_asc);

    printf("Array after qsort:  ");
    for (size_t i = 0; i < count; i++) printf("%d ", numbers[i]);
    printf("\n\n");

    /* --- 3. Dynamic Resizable Buffer (Vector in C) --- */
    printf("--- Dynamic Resizable Array (C vector pattern) ---\n");
    IntVector vec;
    vector_init(&vec, 2);
    printf("Initialized vector: size=%zu, capacity=%zu\n", vec.size, vec.capacity);

    for (int i = 1; i <= 6; i++) {
        vector_push_back(&vec, i * 10);
        printf("Pushed %d -> size=%zu, capacity=%zu\n", i * 10, vec.size, vec.capacity);
    }

    printf("Vector elements: ");
    for (size_t i = 0; i < vec.size; i++) {
        printf("%d ", vec.data[i]);
    }
    printf("\n");

    vector_free(&vec);
    printf("Vector buffer successfully freed.\n\n");

    printf("=== ADVANCED DEMO COMPLETE ===\n");
    return 0;
}
