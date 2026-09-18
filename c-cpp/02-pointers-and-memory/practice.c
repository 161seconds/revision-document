#include <stdio.h>
#include <stdlib.h>
#include <stdbool.h>
#include <assert.h>

// Thử thách 1: Hoán đổi 2 số nguyên thông qua con trỏ
void challenge1_swap(int *a, int *b) {
    int temp = *a;
    *a = *b;
    *b = temp;
}

// Thử thách 2: Tính tổng mảng chỉ dùng số học con trỏ (không dùng toán tử [])
int challenge2_pointer_sum(const int *arr, size_t n) {
    int sum = 0;
    const int *end = arr + n;
    while (arr < end) {
        sum += *arr;
        arr++;
    }
    return sum;
}

// Thử thách 3: Cấp phát động mảng số nguyên với calloc, kiểm tra giá trị 0 mặc định
int* challenge3_create_zero_array(size_t n) {
    return (int*) calloc(n, sizeof(int));
}

// Thử thách 4: Mở rộng mảng động gấp đôi kích thước an toàn
int* challenge4_double_capacity(int *arr, size_t old_size, size_t new_size) {
    int *new_arr = (int*) realloc(arr, new_size * sizeof(int));
    if (new_arr == NULL) {
        free(arr);
        return NULL;
    }
    for (size_t i = old_size; i < new_size; i++) {
        new_arr[i] = 0;
    }
    return new_arr;
}

// Thử thách 5: Cấp phát mảng qua con trỏ trỏ con trỏ (Double pointer)
void challenge5_allocate_via_double_ptr(int **ptr, size_t n, int init_val) {
    *ptr = (int*) malloc(n * sizeof(int));
    if (*ptr != NULL) {
        for (size_t i = 0; i < n; i++) {
            (*ptr)[i] = init_val;
        }
    }
}

int main(void) {
    printf("Dang kiem thu c-cpp Module 02: Pointers & Memory...\n");

    // Kiem thu 1: Hoan doi con tro
    int a = 10, b = 20;
    challenge1_swap(&a, &b);
    assert(a == 20 && b == 10);
    printf("✅ Thu thach 1: Hoan doi bien bang toan tu con tro & va * - VUOT QUA\n");

    // Kiem thu 2: Tinh tong bang so hoc con tro
    int numbers[] = {1, 2, 3, 4, 5};
    int sum = challenge2_pointer_sum(numbers, 5);
    assert(sum == 15);
    printf("✅ Thu thach 2: So hoc con tro (Pointer Arithmetic) khong dung [] - VUOT QUA\n");

    // Kiem thu 3: calloc khoi tao ve 0
    size_t size = 10;
    int *zeros = challenge3_create_zero_array(size);
    assert(zeros != NULL);
    for (size_t i = 0; i < size; i++) {
        assert(zeros[i] == 0);
    }
    printf("✅ Thu thach 3: Cap phat dong calloc kiem tra zero-filled - VUOT QUA\n");

    // Kiem thu 4: realloc mo rong kich thuoc
    zeros[0] = 99;
    int *expanded = challenge4_double_capacity(zeros, 10, 20);
    assert(expanded != NULL);
    assert(expanded[0] == 99);
    assert(expanded[19] == 0);
    free(expanded);
    expanded = NULL;
    printf("✅ Thu thach 4: Mo rong vung nho an toan bang realloc - VUOT QUA\n");

    // Kiem thu 5: Double pointer allocation
    int *dyn_ptr = NULL;
    challenge5_allocate_via_double_ptr(&dyn_ptr, 4, 77);
    assert(dyn_ptr != NULL);
    assert(dyn_ptr[0] == 77 && dyn_ptr[3] == 77);
    free(dyn_ptr);
    dyn_ptr = NULL;
    printf("✅ Thu thach 5: Cap phat vung nho qua con tro cap 2 (**ptr) - VUOT QUA\n");

    printf("\n🎉 5/5 THU THACH MODULE 02 DA VUOT QUA 100%!\n");
    return 0;
}
