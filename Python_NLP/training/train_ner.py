import os
import numpy as np
import evaluate
from datasets import load_dataset
from transformers import (AutoTokenizer, AutoModelForTokenClassification,
                          TrainingArguments, Trainer)

def main():
    # B1: Chọn model base (tiếng Việt: "vinai/phobert-base", "nguyenvulebinh/vi-mrc-base", etc.)
    model_name = "distilbert-base-cased"
    
    # B2: Tải dataset (minh hoạ - conll2003). Thực tế, ta dùng data local:
    # "json" => data/train.json / data/val.json
    # dataset = load_dataset("json", data_files={"train": "../data/train.json", "validation": "../data/val.json"})
    dataset = load_dataset("conll2003")

    label_list = dataset["train"].features["ner_tags"].feature.names
    tokenizer = AutoTokenizer.from_pretrained(model_name)
    model = AutoModelForTokenClassification.from_pretrained(model_name, num_labels=len(label_list))

    # B3: Chuẩn hoá input
    def tokenize_and_align_labels(examples):
        tokenized_inputs = tokenizer(examples["tokens"], truncation=True, is_split_into_words=True)
        labels = []
        for i, label in enumerate(examples["ner_tags"]):
            word_ids = tokenized_inputs.word_ids(batch_index=i)
            label_ids = []
            previous_word_idx = None
            for word_idx in word_ids:
                if word_idx is None:
                    label_ids.append(-100)
                elif word_idx != previous_word_idx:
                    label_ids.append(label[word_idx])
                else:
                    label_ids.append(-100)
                previous_word_idx = word_idx
            labels.append(label_ids)
        tokenized_inputs["labels"] = labels
        return tokenized_inputs

    tokenized_dataset = dataset.map(tokenize_and_align_labels, batched=True)

    # B4: Xác định metric
    metric = evaluate.load("seqeval")

    def compute_metrics(p):
        predictions, labels = p
        predictions = np.argmax(predictions, axis=2)
        true_predictions = [
            [label_list[p] for (p, l) in zip(prediction, label) if l != -100]
            for prediction, label in zip(predictions, labels)
        ]
        true_labels = [
            [label_list[l] for (p, l) in zip(prediction, label) if l != -100]
            for prediction, label in zip(predictions, labels)
        ]
        results = metric.compute(predictions=true_predictions, references=true_labels)
        return {
            "precision": results["overall_precision"],
            "recall": results["overall_recall"],
            "f1": results["overall_f1"],
            "accuracy": results["overall_accuracy"],
        }

    # B5: Cấu hình train
    training_args = TrainingArguments(
        output_dir="./ner_out",
        evaluation_strategy="epoch",
        learning_rate=2e-5,
        num_train_epochs=3,
        weight_decay=0.01,
        logging_steps=10,
        save_steps=100
    )

    # B6: Tạo Trainer
    trainer = Trainer(
        model=model,
        args=training_args,
        train_dataset=tokenized_dataset["train"],
        eval_dataset=tokenized_dataset["validation"],
        tokenizer=tokenizer,
        compute_metrics=compute_metrics,
    )

    # B7: Train
    trainer.train()

    # B8: Save model
    save_dir = "../models/my_ner_model"
    os.makedirs(save_dir, exist_ok=True)
    trainer.save_model(save_dir)
    print(f"Model saved to {save_dir}")

if __name__ == "__main__":
    main()
