#include <stdio.h>
#include <string.h>
#include <stdbool.h>

// Hàm hoán đổi sử dụng con trỏ
void swap(int *a, int *b) {
    int temp = *a;
    *a = *b;
    *b = temp;
}

// Hàm đệ quy tính giai thừa
long long factorial(int n) {
    if (n <= 1) return 1;
    return n * factorial(n - 1);
}

int main(void) {
    printf("=== C-CPP MODULE 01: DEMO BASICS & SYNTAX ===\n");

    // 1. Data Types & Sizeof
    printf("1. Kich thuoc kieu du lieu:\n");
    printf("   char: %zu byte | int: %zu bytes | double: %zu bytes | void*: %zu bytes\n",
           sizeof(char), sizeof(int), sizeof(double), sizeof(void*));

    // 2. Thao tác Bitwise
    unsigned char flags = 0; // 0000 0000
    flags |= (1 << 2);       // Bat bit thu 2: 0000 0100 (4)
    printf("2. Bitwise: flags sau khi set bit 2 = %u\n", flags);
    bool is_bit2_set = (flags & (1 << 2)) != 0;
    printf("   Kiem tra bit 2 co bat khong: %s\n", is_bit2_set ? "TRUE" : "FALSE");
    flags &= ~(1 << 2);      // Tat bit thu 2
    printf("   Sau khi clear bit 2 = %u\n", flags);

    // 3. Mảng 2D Row-Major Order
    int matrix[2][3] = {{1, 2, 3}, {4, 5, 6}};
    printf("3. Mang 2D dia chi lien tiep:\n");
    printf("   &matrix[0][2] = %p\n", (void*)&matrix[0][2]);
    printf("   &matrix[1][0] = %p (Ngay sat sau [0][2])\n", (void*)&matrix[1][0]);

    // 4. Chuỗi ký tự '\0'
    char greeting[20] = "Hello";
    strcat(greeting, " C!");
    printf("4. Chuoi: '%s', do dai strlen = %zu, sizeof mang = %zu\n",
           greeting, strlen(greeting), sizeof(greeting));

    // 5. Ham va truyen con tro de swap
    int x = 10, y = 20;
    swap(&x, &y);
    printf("5. Swap: x = %d, y = %d\n", x, y);

    // 6. De quy
    printf("6. Giai thua 5! = %lld\n", factorial(5));

    printf("=== DEMO HOAN THANH THANH CONG ===\n");
    return 0;
}
