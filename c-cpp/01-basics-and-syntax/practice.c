#include <stdio.h>
#include <string.h>
#include <stdbool.h>
#include <assert.h>

// Thử thách 1: Đếm số lượng bit 1 trong một số nguyên (Hamming Weight / Popcount)
int challenge1_count_set_bits(unsigned int n) {
    int count = 0;
    while (n > 0) {
        n &= (n - 1); // Xóa bit 1 tận cùng bên phải trong O(số lượng bit 1)
        count++;
    }
    return count;
}

// Thử thách 2: Đảo ngược chuỗi tại chỗ in-place
void challenge2_reverse_string(char *str) {
    if (str == NULL) return;
    int len = (int)strlen(str);
    int left = 0, right = len - 1;
    while (left < right) {
        char temp = str[left];
        str[left] = str[right];
        str[right] = temp;
        left++;
        right--;
    }
}

// Thử thách 3: Kiểm tra một số nguyên dương có phải là lũy thừa của 2 không (O(1))
bool challenge3_is_power_of_two(int n) {
    return (n > 0) && ((n & (n - 1)) == 0);
}

// Thử thách 4: Tính tổng các phần tử trên đường chéo chính của ma trận vuông N x N
int challenge4_diagonal_sum(int matrix[][3], int n) {
    int sum = 0;
    for (int i = 0; i < n; i++) {
        sum += matrix[i][i];
    }
    return sum;
}

// Thử thách 5: Đệ quy kiểm tra chuỗi đối xứng (Palindrome)
bool challenge5_is_palindrome_recursive(const char *str, int left, int right) {
    if (left >= right) return true;
    if (str[left] != str[right]) return false;
    return challenge5_is_palindrome_recursive(str, left + 1, right - 1);
}

int main(void) {
    printf("Dang kiem thu c-cpp Module 01: Basics & Syntax...\n");

    // Kiem thu 1: Dem bit 1
    assert(challenge1_count_set_bits(7) == 3);   // 7 = 0111
    assert(challenge1_count_set_bits(16) == 1);  // 16 = 0001 0000
    assert(challenge1_count_set_bits(0) == 0);
    printf("✅ Thu thach 1: Thao tac Bitwise & Popcount - VUOT QUA\n");

    // Kiem thu 2: Dao nguoc chuoi in-place
    char text[] = "Revision";
    challenge2_reverse_string(text);
    assert(strcmp(text, "noisiveR") == 0);
    printf("✅ Thu thach 2: Dao nguoc chuoi ky tu in-place - VUOT QUA\n");

    // Kiem thu 3: Kiem tra luy thua cua 2 bang bit
    assert(challenge3_is_power_of_two(1) == true);
    assert(challenge3_is_power_of_two(16) == true);
    assert(challenge3_is_power_of_two(18) == false);
    assert(challenge3_is_power_of_two(0) == false);
    printf("✅ Thu thach 3: Kiem tra luy thua cua 2 O(1) bang Bitwise - VUOT QUA\n");

    // Kiem thu 4: Tong duong cheo ma tran 2D
    int mat[3][3] = {
        {1, 2, 3},
        {4, 5, 6},
        {7, 8, 9}
    };
    assert(challenge4_diagonal_sum(mat, 3) == (1 + 5 + 9));
    printf("✅ Thu thach 4: Duyet ma tran 2D Row-Major - VUOT QUA\n");

    // Kiem thu 5: De quy Palindrome
    char pal1[] = "radar";
    char pal2[] = "hello";
    assert(challenge5_is_palindrome_recursive(pal1, 0, (int)strlen(pal1) - 1) == true);
    assert(challenge5_is_palindrome_recursive(pal2, 0, (int)strlen(pal2) - 1) == false);
    printf("✅ Thu thach 5: Ham de quy & chuoi Palindrome - VUOT QUA\n");

    printf("\n🎉 5/5 THU THACH MODULE 01 DA VUOT QUA 100%!\n");
    return 0;
}
