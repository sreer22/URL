import argparse
import os
import sys
import time
import threading
from typing import Optional, List

import serial

from common import (
	DEFAULT_MODEL_PATH,
	DEFAULT_DATASET_PATH,
	autodetect_serial_port,
	is_hr_abnormal,
	load_model,
	train_and_save_model,
	prepare_features_from_inputs,
	predict_with_model,
	parse_bp,
)


def prompt_yes_no(question: str) -> int:
	while True:
		ans = input(f"{question} (y/n): ").strip().lower()
		if ans in {"y", "yes"}:
			return 1
		if ans in {"n", "no"}:
			return 0
		print("Please enter 'y' or 'n'.")


def prompt_text(question: str, default: Optional[str] = None) -> str:
	if default:
		return input(f"{question} [{default}]: ").strip() or default
	return input(f"{question}: ").strip()


class HRStream:
	def __init__(self, port: Optional[str], baudrate: int = 115200, timeout: float = 1.0):
		self.port = port
		self.baudrate = baudrate
		self.timeout = timeout
		self.serial: Optional[serial.Serial] = None

	def open(self):
		if self.port is None:
			self.port = autodetect_serial_port()
		if self.port is None:
			raise RuntimeError("No serial port detected. Specify --port.")
		self.serial = serial.Serial(self.port, self.baudrate, timeout=self.timeout)

	def read_hr(self) -> Optional[float]:
		if self.serial is None:
			raise RuntimeError("Serial not open")
		try:
			line = self.serial.readline().decode("utf-8", "ignore").strip()
			if not line:
				return None
			if line.startswith("HR:"):
				val = line.split(":", 1)[1].strip()
				try:
					return float(val)
				except Exception:
					return None
			return None
		except Exception:
			return None

	def close(self):
		try:
			if self.serial:
				self.serial.close()
		except Exception:
			pass


def ensure_model(model_path: str, dataset_path: str) -> dict:
	try:
		return load_model(model_path)
	except FileNotFoundError:
		if os.path.exists(dataset_path):
			print("Model not found. Training a new model from dataset...")
			train_and_save_model(dataset_path, model_path)
			return load_model(model_path)
		raise


def run(args):
	bundle = ensure_model(args.model, args.csv)
	feature_order = bundle.get("feature_columns")

	stream = HRStream(args.port, args.baud, args.timeout)
	stream.open()
	print(f"Listening on {stream.port} at {args.baud} baud. Press Ctrl+C to exit.")

	abnormal_streak = 0
	recent_values: List[float] = []
	try:
		while True:
			bpm = stream.read_hr()
			if bpm is None:
				continue
			recent_values.append(bpm)
			if len(recent_values) > 20:
				recent_values.pop(0)
			print(f"MHR: {bpm:.0f} bpm", end="\r", flush=True)

			if is_hr_abnormal(bpm, args.lower, args.upper):
				abnormal_streak += 1
			else:
				abnormal_streak = 0

			if abnormal_streak >= args.abnormal_count:
				print()
				print(f"Abnormal heart rate detected: {bpm:.0f} bpm (Normal {args.lower}-{args.upper}).")
				print("Please answer the following questions.")
				fever = prompt_yes_no("Fever")
				cough = prompt_yes_no("Cough")
				fatigue = prompt_yes_no("Fatigue")
				difficulty = prompt_yes_no("Difficulty Breathing")
				age_text = prompt_text("Age in years", "35")
				gender_text = prompt_text("Gender (M/F)", "M")
				bp_text = prompt_text("Blood Pressure (e.g., 120/80 or 120)", "120/80")
				chol_text = prompt_text("Cholesterol Level (mg/dL or low/normal/high)", "normal")

				sys_bp, dia_bp = parse_bp(bp_text)
				features_df = prepare_features_from_inputs(
					age=age_text,
					gender=gender_text,
					fever=fever,
					cough=cough,
					fatigue=fatigue,
					difficulty_breathing=difficulty,
					systolic_bp=sys_bp,
					diastolic_bp=dia_bp,
					cholesterol=chol_text,
					feature_order=feature_order,
				)

				label, probs = predict_with_model(bundle, features_df)
				top3 = probs[:3]
				print()
				print("Most likely condition:", label)
				print("Confidence:")
				for cls, p in top3:
					print(f" - {cls}: {p*100:.1f}%")
				print()
				print("This tool is not a medical diagnosis. If you feel unwell or symptoms persist, consult a doctor.")
				abnormal_streak = 0
				print("Monitoring resumes. Press Ctrl+C to exit.")
				time.sleep(2.0)
	except KeyboardInterrupt:
		print("\nExiting...")
	finally:
		stream.close()


def main():
	parser = argparse.ArgumentParser(description="Real-time MHR monitor and disease classifier")
	parser.add_argument("--port", default=None, help="Serial port, e.g., /dev/ttyACM0 or COM3. Auto-detect if omitted.")
	parser.add_argument("--baud", type=int, default=115200, help="Baud rate")
	parser.add_argument("--timeout", type=float, default=1.0, help="Serial read timeout in seconds")
	parser.add_argument("--model", default=os.path.abspath(DEFAULT_MODEL_PATH), help="Path to saved model .joblib")
	parser.add_argument("--csv", default=os.path.abspath(DEFAULT_DATASET_PATH), help="Path to dataset CSV if retraining is needed")
	parser.add_argument("--lower", type=int, default=60, help="Lower bound of normal adult MHR")
	parser.add_argument("--upper", type=int, default=100, help="Upper bound of normal adult MHR")
	parser.add_argument("--abnormal-count", type=int, default=3, help="Consecutive abnormal readings to trigger questionnaire")
	args = parser.parse_args()

	run(args)


if __name__ == "__main__":
	main()