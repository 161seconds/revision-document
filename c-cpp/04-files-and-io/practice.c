#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <stdbool.h>
#include <assert.h>

typedef struct {
    int id;
    int value;
} Item;

// Thử thách 1: Ghi nhiều dòng văn bản và đọc lại đếm chính xác số dòng
int challenge1_write_and_count_lines(const char *filename, const char **lines, int n) {
    FILE *fp = fopen(filename, "w");
    if (fp == NULL) return -1;
    for (int i = 0; i < n; i++) {
        fprintf(fp, "%s\n", lines[i]);
    }
    fclose(fp);

    fp = fopen(filename, "r");
    if (fp == NULL) return -1;
    char buf[128];
    int count = 0;
    while (fgets(buf, sizeof(buf), fp) != NULL) {
        count++;
    }
    fclose(fp);
    return count;
}

// Thử thách 2: Kiểm tra mở file không tồn tại ở chế độ "r" phải trả về NULL
bool challenge2_nonexistent_file_returns_null(const char *fake_path) {
    FILE *fp = fopen(fake_path, "r");
    if (fp == NULL) {
        return true;
    }
    fclose(fp);
    return false;
}

// Thử thách 3: Ghi mảng Struct nhị phân và đọc lại kiểm tra tính toàn vẹn
bool challenge3_binary_struct_io(const char *filename, const Item *items, int n) {
    FILE *fp = fopen(filename, "wb");
    if (fp == NULL) return false;
    size_t written = fwrite(items, sizeof(Item), n, fp);
    fclose(fp);
    if ((int)written != n) return false;

    Item *loaded = (Item*) malloc(n * sizeof(Item));
    fp = fopen(filename, "rb");
    if (fp == NULL) { free(loaded); return false; }
    size_t read_count = fread(loaded, sizeof(Item), n, fp);
    fclose(fp);

    bool ok = ((int)read_count == n);
    for (int i = 0; i < n && ok; i++) {
        if (loaded[i].id != items[i].id || loaded[i].value != items[i].value) {
            ok = false;
        }
    }
    free(loaded);
    return ok;
}

// Thử thách 4: Tính kích thước tệp chính xác bằng fseek & ftell
long challenge4_get_file_size(const char *filename) {
    FILE *fp = fopen(filename, "rb");
    if (fp == NULL) return -1;
    fseek(fp, 0, SEEK_END);
    long size = ftell(fp);
    fclose(fp);
    return size;
}

// Thử thách 5: Kiểm tra chế độ append ("a") và xóa tệp bằng remove()
bool challenge5_append_and_remove(const char *filename) {
    FILE *fp = fopen(filename, "w");
    if (fp == NULL) return false;
    fputs("Part1", fp);
    fclose(fp);

    fp = fopen(filename, "a");
    if (fp == NULL) return false;
    fputs("Part2", fp);
    fclose(fp);

    // Đọc lại kiểm tra nội dung ghép
    fp = fopen(filename, "r");
    char buf[64];
    bool match = false;
    if (fgets(buf, sizeof(buf), fp) != NULL) {
        match = (strcmp(buf, "Part1Part2") == 0);
    }
    fclose(fp);

    // Xóa file
    int del_res = remove(filename);
    return match && (del_res == 0);
}

int main(void) {
    printf("Dang kiem thu c-cpp Module 04: Files & I/O...\n");

    const char *test_txt = "test_run_m4.txt";
    const char *test_bin = "test_run_m4.bin";

    // Kiem thu 1: Ghi va doc dem so dong
    const char *sample_lines[] = {"Title", "Intro", "Section 1", "Conclusion"};
    int lines_count = challenge1_write_and_count_lines(test_txt, sample_lines, 4);
    assert(lines_count == 4);
    printf("✅ Thu thach 1: Ghi va doc dem so dong Text I/O - VUOT QUA\n");

    // Kiem thu 2: Kiem tra file khong ton tai
    assert(challenge2_nonexistent_file_returns_null("nonexistent_random_file_12345.xyz") == true);
    printf("✅ Thu thach 2: Kiem tra tra ve NULL cho file khong ton tai - VUOT QUA\n");

    // Kiem thu 3: Ghi va doc mang Struct nhi phan
    Item test_items[3] = {{1, 100}, {2, 200}, {3, 300}};
    assert(challenge3_binary_struct_io(test_bin, test_items, 3) == true);
    printf("✅ Thu thach 3: Ghi va doc mang Struct qua binary fread/fwrite - VUOT QUA\n");

    // Kiem thu 4: Tinh kich thuoc file bang fseek & ftell
    long bin_size = challenge4_get_file_size(test_bin);
    assert(bin_size == (long)(3 * sizeof(Item)));
    printf("✅ Thu thach 4: Do kich thuoc file bang fseek(SEEK_END) + ftell() - VUOT QUA\n");

    // Don dep file test 1 & 3
    remove(test_txt);
    remove(test_bin);

    // Kiem thu 5: Che do append va remove()
    assert(challenge5_append_and_remove("test_append_temp.txt") == true);
    printf("✅ Thu thach 5: Ghi noi tiep Append va xoa file an toan bang remove() - VUOT QUA\n");

    printf("\n🎉 5/5 THU THACH MODULE 04 DA VUOT QUA 100%!\n");
    return 0;
}
