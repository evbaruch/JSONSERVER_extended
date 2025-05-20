from datasets import load_dataset

dataset = load_dataset("bitmind/open-images-v7", split="train", streaming=True)

with open("train_urls.txt", "w") as f:
    for i, item in enumerate(dataset):
        f.write(item["url"] + "\n")
        if i % 100000 == 0:
            print(f"{i} urls written...")

