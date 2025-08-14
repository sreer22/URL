#include <Wire.h>
#include "MAX30105.h"
#include "heartRate.h"

// MAX30102 via SparkFun MAX30105 library
MAX30105 particleSensor;

const uint32_t SERIAL_BAUD = 115200;

void setup() {
	Serial.begin(SERIAL_BAUD);
	while (!Serial) { ; }

	if (!particleSensor.begin(Wire, I2C_SPEED_FAST)) {
		Serial.println("Sensor not found. Check wiring.");
		while (1) { delay(10); }
	}

	// Configure for heart rate
	byte ledBrightness = 0x1F; // 0=Off to 255=50mA
	byte sampleAverage = 4; // 1, 2, 4, 8, 16, 32
	byte ledMode = 2; // 1 = Red only, 2 = Red + IR
	int sampleRate = 200; // Hz
	int pulseWidth = 411; // 69, 118, 215, 411
	int adcRange = 16384; // 2048, 4096, 8192, 16384
	particleSensor.setup(ledBrightness, sampleAverage, ledMode, sampleRate, pulseWidth, adcRange);
	particleSensor.setPulseAmplitudeRed(0x1F);
	particleSensor.setPulseAmplitudeIR(0x1F);
	particleSensor.setPulseAmplitudeGreen(0);
}

const int WINDOW = 5;
float hrBuffer[WINDOW];
int hrIndex = 0;
bool isBufferFilled = false;

void loop() {
	long irValue = particleSensor.getIR();
	if (irValue < 5000) {
		// Finger not detected
		delay(10);
		return;
	}

	// Basic beat detection using SparkFun algorithm
	if (checkForBeat(irValue)) {
		static long lastBeat = 0;
		long now = millis();
		long delta = now - lastBeat;
		lastBeat = now;
		if (delta > 0) {
			float bpm = 60.0 / (delta / 1000.0);
			if (bpm > 30 && bpm < 220) {
				hrBuffer[hrIndex] = bpm;
				hrIndex = (hrIndex + 1) % WINDOW;
				if (hrIndex == 0) isBufferFilled = true;
				float avg = 0;
				int count = isBufferFilled ? WINDOW : hrIndex;
				for (int i = 0; i < count; i++) avg += hrBuffer[i];
				if (count > 0) avg /= count;
				Serial.print("HR:");
				Serial.println(avg, 0);
			}
		}
	}
	// Short delay to avoid spamming
	delay(5);
}