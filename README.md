# Disease Classification using MHR and Symptoms

This project is a hybrid hardware + software system that reads real-time heart rate (MHR) from a MAX30102 sensor on Arduino, streams it to a Python application, and when abnormal heart rate is detected it asks for symptoms to classify the likely disease using a trained ML model on your dataset.

## Hardware
- Arduino UNO (or compatible)
- MAX30102 pulse sensor module
- Breadboard + jumper wires

### Wiring (I2C)
- MAX30102 VIN -> Arduino 5V
- MAX30102 GND -> Arduino GND
- MAX30102 SCL -> Arduino A5 (SCL)
- MAX30102 SDA -> Arduino A4 (SDA)

Use pull-up resistors if your module does not include them. Most breakout boards include pull-ups.

### Arduino Sketch
Use the sketch at `arduino/max30102_mhr/max30102_mhr.ino`.
It prints heart rate lines to Serial like `HR:78` at 115200 baud.

Install the following Arduino libraries (Library Manager):
- SparkFun MAX3010x Pulse and Proximity Sensor Library (MAX30105)
- (installs dependency `SparkFun_Heart_Rate_Algorithm`)

After uploading, open Serial Monitor at 115200 baud to verify `HR:<bpm>` outputs when your finger is on the sensor.

## Software
Python tools live under `python/`.

### 1) Environment Setup
```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

Place your dataset CSV at `data/Disease_symptom_and_patient_profile_dataset.csv`.
If you use a different path, pass it via `--csv` in commands below.

### 2) Train the Model
```bash
python python/train_model.py --csv data/Disease_symptom_and_patient_profile_dataset.csv --out models/disease_model.joblib
```
This will clean the dataset, train a RandomForest pipeline, print validation metrics, and save the model bundle.

### 3) Real-time Monitor
Connect your Arduino and identify the serial port (e.g., `/dev/ttyACM0` on Linux, `COM3` on Windows).

```bash
python python/realtime_monitor.py --port /dev/ttyACM0 --model models/disease_model.joblib --csv data/Disease_symptom_and_patient_profile_dataset.csv
```
- The app continuously reads `HR:` lines
- Normal adult range is 60–100 bpm (configurable)
- After N consecutive abnormal readings (default 3), you’ll be prompted for symptoms and basic profile
- The model predicts the most likely condition and shows top confidences

### 4) Streamlit Web App
Run a simple UI for manual input and viewing prediction confidence:
```bash
streamlit run python/app_streamlit.py
```
It auto-loads or trains the model from `models/disease_model.joblib` and `data/Disease_symptom_and_patient_profile_dataset.csv`.

### Dataset Columns
Expected columns: `Disease`, `Fever`, `Cough`, `Fatigue`, `Difficulty Breathing`, `Age`, `Gender`, `Blood Pressure`, `Cholesterol Level`, `Outcome Variable`.

Notes:
- Target is `Disease` (preferred) or `Outcome Variable` if present
- `Blood Pressure` like `120/80` will be split into `SystolicBP` and `DiastolicBP`
- Symptom fields accept Yes/No or 1/0
- `Gender` accepts Male/Female (or M/F)
- `Cholesterol Level` accepts numeric mg/dL or `low`/`normal`/`high`

### Serial Auto-detection
If `--port` is omitted, the monitor tries to auto-detect an Arduino-like serial device.

### Disclaimers
This tool is for educational purposes only and does not constitute medical advice or diagnosis. Consult a qualified clinician for any medical concerns.

### Project Structure
```
arduino/
  max30102_mhr/
    max30102_mhr.ino
python/
  common.py
  train_model.py
  realtime_monitor.py
  app_streamlit.py
data/
  Disease_symptom_and_patient_profile_dataset.csv  # (you provide)
models/
  disease_model.joblib  # (generated after training)
requirements.txt
README.md
```