#include <stdio.h>
#include <stdlib.h>
#include <string.h>

// 1. Struct & Typedef
typedef struct {
    int id;
    char name[20];
    float score;
} Student;

// 2. Padding comparison
struct Padded {
    char c1; // 1 byte + 3 padding
    int i;   // 4 bytes
    char c2; // 1 byte + 3 padding
};

// 3. Union
union Value {
    int int_val;
    float float_val;
};

// 4. Linked List Node
typedef struct Node {
    int data;
    struct Node *next;
} Node;

void push_front(Node **head, int val) {
    Node *new_node = (Node*) malloc(sizeof(Node));
    new_node->data = val;
    new_node->next = *head;
    *head = new_node;
}

void free_list(Node **head) {
    Node *curr = *head;
    while (curr != NULL) {
        Node *next = curr->next;
        free(curr);
        curr = next;
    }
    *head = NULL;
}

int main(void) {
    printf("=== C-CPP MODULE 03: DEMO STRUCTS & DATA STRUCTURES ===\n");

    // 1. Struct & Pointer ->
    Student s1 = {.id = 101, .name = "Nguyen Van A", .score = 9.5f};
    Student *p_s = &s1;
    printf("1. Student: ID=%d, Name=%s, Score=%.1f\n", p_s->id, p_s->name, p_s->score);

    // 2. Padding
    printf("2. Structure Padding: sizeof(struct Padded) = %zu bytes (thay vi 6 bytes)\n",
           sizeof(struct Padded));

    // 3. Union
    union Value v;
    v.int_val = 42;
    printf("3. Union int_val = %d\n", v.int_val);
    v.float_val = 3.14f;
    printf("   Sau khi ghi float_val, int_val bi ghi de: %d, float_val = %.2f\n",
           v.int_val, v.float_val);

    // 4. Linked List
    Node *head = NULL;
    push_front(&head, 30);
    push_front(&head, 20);
    push_front(&head, 10);

    printf("4. Danh sach lien ket duyet qua:");
    Node *curr = head;
    while (curr != NULL) {
        printf(" -> %d", curr->data);
        curr = curr->next;
    }
    printf(" -> NULL\n");

    free_list(&head);
    printf("   Giai phong danh sach lien ket thanh cong (head = %p)\n", (void*)head);

    printf("=== DEMO HOAN THANH THANH CONG ===\n");
    return 0;
}
