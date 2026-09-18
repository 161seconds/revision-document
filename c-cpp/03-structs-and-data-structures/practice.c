#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <stdbool.h>
#include <assert.h>

// Thử thách 1: Struct thông tin sản phẩm và cập nhật giá qua con trỏ
typedef struct {
    int id;
    char name[32];
    double price;
} Product;

void challenge1_apply_discount(Product *p, double percent) {
    if (p != NULL && percent >= 0.0 && percent <= 100.0) {
        p->price -= p->price * (percent / 100.0);
    }
}

// Thử thách 2: Union chia sẻ ô nhớ
union TestUnion {
    unsigned int raw_int;
    unsigned char bytes[4];
};

bool challenge2_verify_union_shared(void) {
    union TestUnion u;
    u.raw_int = 0x12345678;
    // Thay đổi 1 byte trong mảng bytes
    u.bytes[0] = 0xAA;
    // Kiểm tra raw_int có bị biến đổi theo không
    return u.raw_int != 0x12345678;
}

// Thử thách 3: Enum mã trạng thái HTTP
typedef enum {
    STATUS_OK = 200,
    STATUS_BAD_REQUEST = 400,
    STATUS_NOT_FOUND = 404,
    STATUS_SERVER_ERROR = 500
} HttpCode;

const char* challenge3_get_status_text(HttpCode code) {
    switch (code) {
        case STATUS_OK: return "OK";
        case STATUS_BAD_REQUEST: return "Bad Request";
        case STATUS_NOT_FOUND: return "Not Found";
        case STATUS_SERVER_ERROR: return "Server Error";
        default: return "Unknown";
    }
}

// Thử thách 4 & 5: Danh sách liên kết đơn
typedef struct Node {
    int val;
    struct Node *next;
} Node;

void challenge4_push(Node **head, int val) {
    Node *n = (Node*) malloc(sizeof(Node));
    n->val = val;
    n->next = *head;
    *head = n;
}

int challenge4_get_sum_and_count(Node *head, int *count_out) {
    int sum = 0;
    int count = 0;
    Node *curr = head;
    while (curr != NULL) {
        sum += curr->val;
        count++;
        curr = curr->next;
    }
    if (count_out != NULL) *count_out = count;
    return sum;
}

bool challenge5_search_and_free(Node **head, int target) {
    bool found = false;
    Node *curr = *head;
    while (curr != NULL) {
        if (curr->val == target) {
            found = true;
            break;
        }
        curr = curr->next;
    }

    // Giải phóng toàn bộ danh sách
    curr = *head;
    while (curr != NULL) {
        Node *next = curr->next;
        free(curr);
        curr = next;
    }
    *head = NULL;
    return found;
}

int main(void) {
    printf("Dang kiem thu c-cpp Module 03: Structs & Data Structures...\n");

    // Kiem thu 1: Struct va toan tu ->
    Product prod = {.id = 1, .name = "Laptop", .price = 1000.0};
    challenge1_apply_discount(&prod, 15.0); // Giam gia 15%
    assert(prod.price == 850.0);
    printf("✅ Thu thach 1: Thao tac va cap nhat Struct qua con tro -> - VUOT QUA\n");

    // Kiem thu 2: Union chia se vung nho
    assert(challenge2_verify_union_shared() == true);
    printf("✅ Thu thach 2: Co che chia se o nho cua Union - VUOT QUA\n");

    // Kiem thu 3: Enum va tra cuu ma loi
    assert(strcmp(challenge3_get_status_text(STATUS_OK), "OK") == 0);
    assert(strcmp(challenge3_get_status_text(STATUS_NOT_FOUND), "Not Found") == 0);
    printf("✅ Thu thach 3: Kieu liet ke Enum & Ma trang thai - VUOT QUA\n");

    // Kiem thu 4: Danh sach lien ket don tinh tong va dem nut
    Node *list = NULL;
    challenge4_push(&list, 30);
    challenge4_push(&list, 20);
    challenge4_push(&list, 10);
    int count = 0;
    int sum = challenge4_get_sum_and_count(list, &count);
    assert(count == 3);
    assert(sum == 60);
    printf("✅ Thu thach 4: Singly Linked List Push va Tinh Tong/Dem Nut - VUOT QUA\n");

    // Kiem thu 5: Tim kiem nut va giai phong toan bo bo nho
    bool found20 = challenge5_search_and_free(&list, 20);
    assert(found20 == true);
    assert(list == NULL); // Head da duoc gan ve NULL an toan
    printf("✅ Thu thach 5: Tim kiem va Giai phong bo nho Linked List sach se - VUOT QUA\n");

    printf("\n🎉 5/5 THU THACH MODULE 03 DA VUOT QUA 100%!\n");
    return 0;
}
