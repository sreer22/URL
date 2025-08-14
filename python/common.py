import os
import re
import sys
import json
from typing import Dict, Tuple, Optional, List

import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import OneHotEncoder
from sklearn.pipeline import Pipeline
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, accuracy_score
import joblib

try:
	from serial.tools import list_ports
except Exception:
	list_ports = None


DEFAULT_MODEL_PATH = os.path.join(os.path.dirname(__file__), "..", "models", "disease_model.joblib")
DEFAULT_DATASET_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "Disease_symptom_and_patient_profile_dataset.csv")


BOOLEAN_SYMPTOMS = [
	"Fever",
	"Cough",
	"Fatigue",
	"Difficulty Breathing",
]

BASE_FEATURES = BOOLEAN_SYMPTOMS + [
	"Age",
	"Gender",
	"SystolicBP",
	"DiastolicBP",
	"Cholesterol Level",
]


def parse_yes_no(value) -> Optional[int]:
	if value is None:
		return None
	if isinstance(value, (int, float)):
		if np.isnan(value):
			return None
		return int(value)
	text = str(value).strip().lower()
	if text in {"y", "yes", "true", "1"}:
		return 1
	if text in {"n", "no", "false", "0"}:
		return 0
	return None


def coerce_numeric(value) -> Optional[float]:
	try:
		if value is None:
			return None
		if isinstance(value, (int, float)):
			return float(value)
		text = str(value).strip()
		if text == "":
			return None
		return float(text)
	except Exception:
		return None


def parse_bp(bp_value) -> Tuple[Optional[float], Optional[float]]:
	if bp_value is None:
		return None, None
	if isinstance(bp_value, (list, tuple)) and len(bp_value) == 2:
		return coerce_numeric(bp_value[0]), coerce_numeric(bp_value[1])
	text = str(bp_value).strip()
	m = re.match(r"^(\d{2,3})\s*/\s*(\d{2,3})$", text)
	if m:
		return float(m.group(1)), float(m.group(2))
	# If single number is provided, assume systolic only
	single = coerce_numeric(text)
	return single, None


def coerce_gender(value) -> Optional[str]:
	if value is None:
		return None
	text = str(value).strip().lower()
	if text in {"male", "m"}:
		return "Male"
	if text in {"female", "f"}:
		return "Female"
	return None


def coerce_cholesterol(value) -> Optional[float]:
	if value is None:
		return None
	if isinstance(value, (int, float)):
		if np.isnan(value):
			return None
		return float(value)
	text = str(value).strip().lower()
	mapping = {"low": 150.0, "normal": 200.0, "high": 240.0}
	if text in mapping:
		return mapping[text]
	return coerce_numeric(text)


def clean_dataframe(df: pd.DataFrame) -> Tuple[pd.DataFrame, str]:
	columns = [c.strip() for c in df.columns]
	df.columns = columns
	# Choose target
	target_column = "Disease" if "Disease" in df.columns else (
		"Outcome Variable" if "Outcome Variable" in df.columns else None
	)
	if target_column is None:
		raise ValueError("Dataset must contain a 'Disease' or 'Outcome Variable' column as target.")

	# Engineer BP columns
	if "Blood Pressure" in df.columns and "SystolicBP" not in df.columns:
		systolic_list: List[Optional[float]] = []
		diastolic_list: List[Optional[float]] = []
		for v in df["Blood Pressure"].tolist():
			sys_v, dia_v = parse_bp(v)
			systolic_list.append(sys_v)
			diastolic_list.append(dia_v)
		df["SystolicBP"] = systolic_list
		df["DiastolicBP"] = diastolic_list

	# Normalize symptom columns to 0/1 if present
	for s in BOOLEAN_SYMPTOMS:
		if s in df.columns:
			df[s] = df[s].apply(parse_yes_no)

	# Normalize Gender
	if "Gender" in df.columns:
		df["Gender"] = df["Gender"].apply(coerce_gender)

	# Normalize Cholesterol
	if "Cholesterol Level" in df.columns:
		df["Cholesterol Level"] = df["Cholesterol Level"].apply(coerce_cholesterol)

	# Normalize Age
	if "Age" in df.columns:
		df["Age"] = df["Age"].apply(coerce_numeric)

	return df, target_column


def build_pipeline(feature_columns: List[str]) -> Pipeline:
	# Identify numeric vs categorical
	numeric_features: List[str] = []
	categorical_features: List[str] = []
	for col in feature_columns:
		if col == "Gender":
			categorical_features.append(col)
		else:
			numeric_features.append(col)

	numeric_transformer = SimpleImputer(strategy="median")
	categorical_transformer = Pipeline(steps=[
		("imputer", SimpleImputer(strategy="most_frequent")),
		("onehot", OneHotEncoder(handle_unknown="ignore")),
	])

	preprocessor = ColumnTransformer(
		transformers=[
			("num", numeric_transformer, numeric_features),
			("cat", categorical_transformer, categorical_features),
		]
	)

	classifier = RandomForestClassifier(
		n_estimators=300,
		random_state=42,
		class_weight="balanced_subsample",
	)

	model = Pipeline(steps=[("preprocess", preprocessor), ("classifier", classifier)])
	return model


def train_and_save_model(csv_path: str = DEFAULT_DATASET_PATH, model_out_path: str = DEFAULT_MODEL_PATH) -> Dict:
	if not os.path.exists(csv_path):
		raise FileNotFoundError(f"Dataset not found at {csv_path}")

	df_raw = pd.read_csv(csv_path)
	df, target_col = clean_dataframe(df_raw)

	# Determine features to use
	feature_candidates = set(BASE_FEATURES)
	available_features = [c for c in df.columns if c in feature_candidates]
	missing = [c for c in BASE_FEATURES if c not in available_features]
	if missing:
		print(f"Warning: Missing columns in dataset will be imputed/ignored if absent at inference: {missing}")

	X = df[available_features]
	y = df[target_col]

	model = build_pipeline(available_features)
	X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y if y.nunique()>1 else None)
	model.fit(X_train, y_train)

	# Evaluate
	if len(np.unique(y_test)) > 1:
		y_pred = model.predict(X_test)
		acc = accuracy_score(y_test, y_pred)
		print(f"Validation accuracy: {acc:.3f}")
		try:
			print(classification_report(y_test, y_pred))
		except Exception:
			pass

	# Ensure model directory exists
	os.makedirs(os.path.dirname(os.path.abspath(model_out_path)), exist_ok=True)
	joblib.dump({
		"model": model,
		"feature_columns": available_features,
		"target": target_col,
	}, model_out_path)

	metadata = {
		"model_path": os.path.abspath(model_out_path),
		"features": available_features,
		"target": target_col,
		"classes": list(model.named_steps["classifier"].classes_),
	}
	print(json.dumps(metadata, indent=2))
	return metadata


def load_model(model_path: str = DEFAULT_MODEL_PATH) -> Dict:
	if not os.path.exists(model_path):
		raise FileNotFoundError(f"Model not found at {model_path}")
	bundle = joblib.load(model_path)
	return bundle


def prepare_features_from_inputs(
	age: Optional[float],
	gender: Optional[str],
	fever: Optional[int],
	cough: Optional[int],
	fatigue: Optional[int],
	difficulty_breathing: Optional[int],
	systolic_bp: Optional[float],
	diastolic_bp: Optional[float],
	cholesterol: Optional[float],
	feature_order: Optional[List[str]] = None,
) -> pd.DataFrame:
	row = {
		"Age": coerce_numeric(age),
		"Gender": coerce_gender(gender),
		"Fever": parse_yes_no(fever),
		"Cough": parse_yes_no(cough),
		"Fatigue": parse_yes_no(fatigue),
		"Difficulty Breathing": parse_yes_no(difficulty_breathing),
		"SystolicBP": coerce_numeric(systolic_bp),
		"DiastolicBP": coerce_numeric(diastolic_bp),
		"Cholesterol Level": coerce_cholesterol(cholesterol),
	}
	if feature_order is None:
		feature_order = list(row.keys())
	df = pd.DataFrame([{k: row.get(k) for k in feature_order}])
	return df


def predict_with_model(bundle: Dict, features_df: pd.DataFrame) -> Tuple[str, List[Tuple[str, float]]]:
	model: Pipeline = bundle["model"]
	classes = list(model.named_steps["classifier"].classes_)
	probas = model.predict_proba(features_df)[0]
	pairs = list(zip(classes, probas))
	pairs.sort(key=lambda x: x[1], reverse=True)
	pred_label = pairs[0][0]
	return pred_label, pairs


def is_hr_abnormal(bpm: float, lower: int = 60, upper: int = 100) -> bool:
	try:
		if bpm is None:
			return False
		bpm = float(bpm)
		return bpm < lower or bpm > upper
	except Exception:
		return False


def autodetect_serial_port() -> Optional[str]:
	if list_ports is None:
		return None
	ports = list(list_ports.comports())
	candidates = []
	for p in ports:
		name = (p.device or "").lower()
		desc = (p.description or "").lower()
		if any(tag in name for tag in ["ttyacm", "ttyusb", "com"]) or any(tag in desc for tag in ["arduino", "usb serial", "usb-serial"]):
			candidates.append(p.device)
	if candidates:
		return candidates[0]
	return ports[0].device if ports else None