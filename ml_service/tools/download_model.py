import os
from sentence_transformers import SentenceTransformer

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR = os.path.join(os.path.dirname(BASE_DIR), "models", "all-mpnet-base-v2")

def main():
    os.makedirs(MODEL_DIR, exist_ok=True)
    model = SentenceTransformer("sentence-transformers/all-mpnet-base-v2")
    model.save(MODEL_DIR)
    print(f"Model saved to {MODEL_DIR}")

if __name__ == "__main__":
    main()
