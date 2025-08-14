import argparse
import os
from common import train_and_save_model, DEFAULT_DATASET_PATH, DEFAULT_MODEL_PATH


def main():
	parser = argparse.ArgumentParser(description="Train disease classification model from CSV")
	parser.add_argument("--csv", default=DEFAULT_DATASET_PATH, help="Path to dataset CSV")
	parser.add_argument("--out", default=DEFAULT_MODEL_PATH, help="Output path for saved model (.joblib)")
	args = parser.parse_args()

	csv_path = os.path.abspath(args.csv)
	out_path = os.path.abspath(args.out)

	print(f"Training using: {csv_path}")
	meta = train_and_save_model(csv_path, out_path)
	print(f"Model saved to: {meta['model_path']}")


if __name__ == "__main__":
	main()