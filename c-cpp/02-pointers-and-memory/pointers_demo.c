#include <stdio.h>
#include <stdlib.h>

// Hàm cấp phát mảng qua con trỏ cấp 2
void allocate_array(int **arr, size_t size) {
    *arr = (int*) malloc(size * sizeof(int));
}

int main(void) {
    printf("=== C-CPP MODULE 02: DEMO POINTERS & MEMORY ===\n");

    // 1. Con trỏ cơ bản
    int num = 42;
    int *p = &num;
    printf("1. Dia chi &num = %p, gia tri qua con tro *p = %d\n", (void*)p, *p);
    *p = 100;
    printf("   Sau khi sua qua *p: num = %d\n", num);

    // 2. Số học con trỏ & Mảng
    int arr[3] = {10, 20, 30};
    int *p_arr = arr;
    printf("2. So hoc con tro:\n");
    printf("   p_arr[0] = %d | *(p_arr + 1) = %d | *(p_arr + 2) = %d\n",
           *p_arr, *(p_arr + 1), *(p_arr + 2));

    // 3. Cấp phát động với calloc (Zero-fill)
    size_t n = 5;
    int *dyn_arr = (int*) calloc(n, sizeof(int));
    if (dyn_arr == NULL) {
        perror("Cap phat that bai");
        return 1;
    }
    printf("3. calloc khoi tao gia tri ve 0: dyn_arr[0] = %d, dyn_arr[4] = %d\n",
           dyn_arr[0], dyn_arr[4]);

    // 4. Mở rộng vùng nhớ với realloc
    int *temp = (int*) realloc(dyn_arr, 10 * sizeof(int));
    if (temp != NULL) {
        dyn_arr = temp;
        printf("4. realloc mo rong len 10 phan tu thanh cong tai: %p\n", (void*)dyn_arr);
    }

    // 5. Giải phóng an toàn
    free(dyn_arr);
    dyn_arr = NULL;
    printf("5. Giai phong bo nho va gan con tro = NULL thanh cong!\n");

    // 6. Con trỏ trỏ con trỏ
    int *external_arr = NULL;
    allocate_array(&external_arr, 3);
    if (external_arr != NULL) {
        external_arr[0] = 777;
        printf("6. Double pointer allocate thanh cong: external_arr[0] = %d\n", external_arr[0]);
        free(external_arr);
        external_arr = NULL;
    }

    printf("=== DEMO HOAN THANH THANH CONG ===\n");
    return 0;
}
