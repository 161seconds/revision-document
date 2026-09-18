#include <stdio.h>
#include <stdlib.h>
#include <string.h>

typedef struct {
    int id;
    char title[32];
    double score;
} Record;

int main(void) {
    printf("=== C-CPP MODULE 04: DEMO FILE I/O STREAMS ===\n");

    const char *text_filename = "demo_text.txt";
    const char *bin_filename = "demo_data.bin";

    // 1. Ghi file văn bản
    FILE *fp = fopen(text_filename, "w");
    if (fp == NULL) {
        perror("Loi tao file text");
        return 1;
    }
    fprintf(fp, "Dong 1: C Programming Revision\n");
    fputs("Dong 2: File I/O Operations Demo\n", fp);
    fclose(fp);
    printf("1. Ghi file van ban '%s' thanh cong.\n", text_filename);

    // 2. Đọc file văn bản từng dòng với fgets
    fp = fopen(text_filename, "r");
    if (fp != NULL) {
        char line[128];
        printf("2. Doc file van ban tung dong:\n");
        while (fgets(line, sizeof(line), fp) != NULL) {
            line[strcspn(line, "\r\n")] = '\0';
            printf("   -> %s\n", line);
        }
        fclose(fp);
    }

    // 3. Ghi & Đọc file nhị phân bằng fwrite / fread
    Record out_rec = {.id = 42, .title = "Kernel Module", .score = 99.5};
    fp = fopen(bin_filename, "wb");
    if (fp != NULL) {
        fwrite(&out_rec, sizeof(Record), 1, fp);
        fclose(fp);
        printf("3. Ghi struct xuong file nhi phan '%s' thanh cong.\n", bin_filename);
    }

    Record in_rec;
    fp = fopen(bin_filename, "rb");
    if (fp != NULL) {
        fread(&in_rec, sizeof(Record), 1, fp);
        printf("   Doc lai struct tu file nhi phan: ID=%d, Title=%s, Score=%.1f\n",
               in_rec.id, in_rec.title, in_rec.score);

        // 4. Đo kích thước file bằng fseek + ftell
        fseek(fp, 0, SEEK_END);
        long size = ftell(fp);
        printf("4. Kich thuoc file nhi phan do duoc: %ld bytes (sizeof(Record)=%zu)\n",
               size, sizeof(Record));
        fclose(fp);
    }

    // 5. Dọn dẹp xóa các file tạm
    remove(text_filename);
    remove(bin_filename);
    printf("5. Don dep xoa cac file tam bang remove() hoan tat!\n");

    printf("=== DEMO HOAN THANH THANH CONG ===\n");
    return 0;
}
