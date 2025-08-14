import os
import streamlit as st
import pandas as pd

from common import (
	DEFAULT_MODEL_PATH,
	DEFAULT_DATASET_PATH,
	load_model,
	train_and_save_model,
	prepare_features_from_inputs,
	predict_with_model,
)

st.set_page_config(page_title="Disease Classification using MHR and Symptoms", page_icon="🫀", layout="centered")

@st.cache_resource
def get_model(model_path: str, dataset_path: str):
	try:
		return load_model(model_path)
	except FileNotFoundError:
		if os.path.exists(dataset_path):
			train_and_save_model(dataset_path, model_path)
			return load_model(model_path)
		raise


bundle = get_model(os.path.abspath(DEFAULT_MODEL_PATH), os.path.abspath(DEFAULT_DATASET_PATH))
feature_order = bundle.get("feature_columns")

st.title("Disease Classification using MHR and Symptoms")

st.markdown("Enter your details and symptoms. This is not a medical diagnosis. Consult a doctor for medical advice.")

col1, col2 = st.columns(2)
with col1:
	age = st.number_input("Age (years)", min_value=0, max_value=120, value=35)
	gender = st.selectbox("Gender", ["Male", "Female"])
	bp_sys = st.number_input("Systolic BP (mmHg)", min_value=70, max_value=220, value=120)
	bp_dia = st.number_input("Diastolic BP (mmHg)", min_value=40, max_value=140, value=80)
with col2:
	chol = st.text_input("Cholesterol Level (mg/dL or low/normal/high)", value="normal")
	fever = st.selectbox("Fever", ["No", "Yes"]) == "Yes"
	cough = st.selectbox("Cough", ["No", "Yes"]) == "Yes"
	fatigue = st.selectbox("Fatigue", ["No", "Yes"]) == "Yes"
	diff_breath = st.selectbox("Difficulty Breathing", ["No", "Yes"]) == "Yes"

if st.button("Predict"):
	features_df = prepare_features_from_inputs(
		age=age,
		gender=gender,
		fever=int(fever),
		cough=int(cough),
		fatigue=int(fatigue),
		difficulty_breathing=int(diff_breath),
		systolic_bp=bp_sys,
		diastolic_bp=bp_dia,
		cholesterol=chol,
		feature_order=feature_order,
	)
	label, probs = predict_with_model(bundle, features_df)
	st.subheader("Most likely condition")
	st.success(label)

	st.subheader("Confidence")
	probs_sorted = sorted(probs, key=lambda x: x[1], reverse=True)
	df_probs = pd.DataFrame({"Condition": [p[0] for p in probs_sorted], "Probability": [p[1] for p in probs_sorted]})
	st.bar_chart(df_probs.set_index("Condition"))

st.divider()

st.caption("This tool is for educational purposes only and does not provide medical diagnosis.")