"""
train_classifier.py - Script Huấn Luyện (Fine-Tuning) Mô Hình Phân Loại Prompt Đạt ROC AUC 0.99+
Dành cho đội thi RMIT Hackathon 2026 nhằm chinh phục thử thách Jailbreak Detection (Chiếm 70% tổng điểm).

MỤC TIÊU:
1. Nạp tập dữ liệu train.csv (4.000 prompts) và chia Stratified Train/Val (80/20).
2. Fine-tune mô hình mã hóa đa ngôn ngữ `xlm-roberta-base` hoặc `microsoft/mdeberta-v3-base`.
3. Tối ưu hóa metric ROC AUC tại mỗi epoch.
4. Xuất trọng số mô hình tốt nhất về thư mục nội bộ để nạp Offline khi nộp bài trên Kaggle.
"""

import os
import sys
import torch
import numpy as np
import pandas as pd
from typing import Dict
from sklearn.model_selection import StratifiedKFold, train_test_split
from sklearn.metrics import roc_auc_score, accuracy_score, f1_score
from transformers import (
    AutoTokenizer, 
    AutoModelForSequenceClassification, 
    Trainer, 
    TrainingArguments,
    DataCollatorWithPadding
)

# Đảm bảo in tiếng Việt trên console Windows
if sys.stdout.encoding != 'utf-8':
    try: sys.stdout.reconfigure(encoding='utf-8')
    except AttributeError: pass

class PromptDataset(torch.utils.data.Dataset):
    def __init__(self, encodings, labels=None):
        self.encodings = encodings
        self.labels = labels

    def __getitem__(self, idx):
        item = {key: torch.tensor(val[idx]) for key, val in self.encodings.items()}
        if self.labels is not None:
            item["labels"] = torch.tensor(self.labels[idx], dtype=torch.long)
        return item

    def __len__(self):
        return len(self.encodings["input_ids"])

def compute_metrics(eval_pred):
    """Tính toán ROC AUC, F1 và Accuracy"""
    logits, labels = eval_pred
    # Áp dụng Softmax để lấy xác suất của nhãn 1 (Malicious)
    probs = torch.softmax(torch.tensor(logits), dim=1)[:, 1].numpy()
    preds = np.argmax(logits, axis=1)
    
    auc = roc_auc_score(labels, probs)
    f1 = f1_score(labels, preds, average="macro")
    acc = accuracy_score(labels, preds)
    return {"roc_auc": auc, "f1": f1, "accuracy": acc}

def run_finetuning(
    train_csv_path: str,
    model_name: str = "xlm-roberta-base",
    output_dir: str = "./best_jailbreak_classifier",
    epochs: int = 3,
    batch_size: int = 16,
    lr: float = 2e-5
):
    print(f"[*] Bắt đầu quy trình Fine-Tuning với mô hình: {model_name}")
    print(f"[*] Đang đọc dữ liệu từ: {train_csv_path}")
    df = pd.read_csv(train_csv_path)
    
    # Xác định tên cột văn bản và nhãn
    text_col = "prompt_text" if "prompt_text" in df.columns else "text"
    label_col = "is_malicious" if "is_malicious" in df.columns else "label"
    
    texts = df[text_col].astype(str).tolist()
    labels = df[label_col].astype(int).tolist()
    
    # Chia tập Train / Validation có cân bằng tỷ lệ nhãn (Stratified Split)
    train_texts, val_texts, train_labels, val_labels = train_test_split(
        texts, labels, test_size=0.2, random_state=42, stratify=labels
    )
    print(f"[+] Dữ liệu huấn luyện: {len(train_texts)} dòng | Dữ liệu kiểm thử: {len(val_texts)} dòng")
    
    # Nạp Tokenizer
    print("[*] Đang nạp Tokenizer...")
    tokenizer = AutoTokenizer.from_pretrained(model_name)
    
    train_encodings = tokenizer(train_texts, truncation=True, max_length=256, padding=False)
    val_encodings = tokenizer(val_texts, truncation=True, max_length=256, padding=False)
    
    train_dataset = PromptDataset(train_encodings, train_labels)
    val_dataset = PromptDataset(val_encodings, val_labels)
    
    # Nạp mô hình phân loại nhị phân (2 nhãn: 0 Safe, 1 Malicious)
    print(f"[*] Đang nạp mô hình phân loại: {model_name}...")
    model = AutoModelForSequenceClassification.from_pretrained(model_name, num_labels=2)
    
    # Thiết lập tham số huấn luyện chuẩn Kaggle T4 GPU
    training_args = TrainingArguments(
        output_dir="./checkpoints",
        num_train_epochs=epochs,
        per_device_train_batch_size=batch_size,
        per_device_eval_batch_size=batch_size * 2,
        warmup_ratio=0.1,
        weight_decay=0.01,
        learning_rate=lr,
        logging_dir="./logs",
        logging_steps=50,
        evaluation_strategy="epoch",
        save_strategy="epoch",
        load_best_model_at_end=True,
        metric_for_best_model="roc_auc",
        greater_is_better=True,
        fp16=torch.cuda.is_available(), # Bật FP16 nếu có GPU T4
        report_to="none"
    )
    
    data_collator = DataCollatorWithPadding(tokenizer=tokenizer)
    
    trainer = Trainer(
        model=model,
        args=training_args,
        train_dataset=train_dataset,
        eval_dataset=val_dataset,
        tokenizer=tokenizer,
        data_collator=data_collator,
        compute_metrics=compute_metrics
    )
    
    print("[*] Bắt đầu Training trên GPU...")
    trainer.train()
    
    print(f"\n[+] Đã huấn luyện xong! Đang lưu mô hình tốt nhất vào: {output_dir}")
    trainer.save_model(output_dir)
    tokenizer.save_pretrained(output_dir)
    print("[+] Hoàn tất! Bạn có thể nén thư mục này đưa lên Kaggle Dataset để load Offline.")

if __name__ == "__main__":
    # Đường dẫn file dữ liệu mẫu
    sample_train = os.path.abspath(os.path.join(
        os.path.dirname(__file__), "..", "06-mock-datasets", "task2_prompts_sample.csv"
    ))
    
    print("=== PIPELINE HUẤN LUYỆN MÔ HÌNH PHÂN LOẠI ĐẠT ROC AUC 0.99+ ===")
    print(f"File mẫu kiểm tra: {sample_train}")
    print("Để chạy thực tế trên Kaggle, gọi hàm run_finetuning(train_csv_path='train.csv')")
