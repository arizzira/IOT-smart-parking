# Enterprise IoT Smart Parking System

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Platform](https://img.shields.io/badge/platform-ESP32-lightgrey.svg)
![Framework](https://img.shields.io/badge/framework-Arduino-00979C.svg)
![Backend](https://img.shields.io/badge/backend-Node.js%20%7C%20PostgreSQL-339933.svg)

> **Group 14 Project** - A comprehensive, standalone Internet of Things (IoT) smart parking system utilizing ESP32, RFID authentication, and a Node.js backend.

## Overview

This project simulates a real-world enterprise parking gate system. It features RFID-based user authentication, real-time parking slot monitoring, and safety mechanisms. The ESP32 acts as the main controller, communicating with a Node.js/Express server over HTTP to verify user credentials and log parking data into a PostgreSQL database.

## Key Features

* **RFID Authentication:** Secure access using MFRC522.
* **Realistic Gate Animation:** Slow-motion servo motor movement for elegant and realistic barrier operation.
* **Vehicle Safety Detection:** Ultrasonic sensor prevents the gate from closing while a vehicle is passing, with a 2.5-second safety delay.
* **Real-Time Slot Monitoring:** Infrared (IR) sensor detects available parking slots and updates the system.
* **Interactive OLED Display:** Provides real-time visual feedback (Greetings, Slot Availability, Error Messages).
* **Audio & Visual Feedback:** Integrated active buzzer and LED indicators for access granted, denied, or system errors.
* **Standalone Operation:** Powered by an MB102 Breadboard Power Supply, independent of a PC connection.

---

## Hardware Requirements

* 1x **ESP32** Development Board
* 1x **MFRC522** RFID Reader Module
* 1x **Servo Motor** (SG90 or MG996R)
* 1x **HC-SR04** Ultrasonic Sensor
* 1x **Infrared (IR) Obstacle Sensor**
* 1x **0.96" OLED Display** (SSD1306 - I2C)
* 1x **Active Buzzer**
* 2x **LEDs** (1 Green, 1 Red) & 2x 220Ω/330Ω Resistors
* 1x **MB102 Breadboard Power Supply Module**
* Jumper wires & Breadboard

---

## Circuit & Wiring (Pinout Mapping)

** IMPORTANT POWER SUPPLY NOTE:** 
To ensure system stability, power is distributed via the **MB102 Module**:
* **Top Rail (5V):** Powers the Servo Motor, Ultrasonic Sensor, and ESP32 `VIN` pin (for Standalone mode).
* **Bottom Rail (3.3V):** Powers the RFID, OLED, and IR Sensor. 
* *All Ground (GND) lines must be connected together.*

| Component | Pin / Type | ESP32 Pin / Power |
| :--- | :--- | :--- |
| **MFRC522 (RFID)** | SDA (SS) | `D5` |
| | SCK | `D18` |
| | MOSI | `D23` |
| | MISO | `D19` |
| | RST | `D4` |
| | VCC | `3.3V` (MB102) |
| **Servo Motor** | Signal (Orange/Yellow)| `D13` |
| | VCC (Red) | `5V` (MB102) |
| **OLED Display** | SDA | `D21` |
| | SCL | `D22` |
| | VCC | `3.3V` (MB102) |
| **Ultrasonic** | TRIG | `D26` |
| | ECHO | `D25` |
| | VCC | `5V` (MB102) |
| **IR Sensor** | OUT / DO | `D27` |
| | VCC | `3.3V` (MB102) |
| **Buzzer** | VCC (+) | `D14` |
| **LED Green** | Anode (+) | `D32` (via Resistor)|
| **LED Red** | Anode (+) | `D33` (via Resistor)|

---

## Software & Libraries

### Arduino IDE Libraries
Ensure you have the following libraries installed via the Arduino Library Manager:
* `MFRC522` by GithubCommunity
* `ESP32Servo` by Kevin Harrington, John K. Bennett
* `Adafruit SSD1306` & `Adafruit GFX Library` by Adafruit
* `ArduinoJson` by Benoit Blanchon

### Backend Requirements
* **Node.js** (v14 or higher)
* **PostgreSQL** Database

---

## Installation & Setup

### 1. Backend Setup
1. Navigate to the backend directory: `cd backend`
2. Install dependencies: `npm install`
3. Configure your PostgreSQL database connection in your `.env` or configuration file.
4. Start the server: `node index.js` (Server should run on port 5000).

### 2. ESP32 Setup
1. Open the `.ino` file in Arduino IDE.
2. Update the Wi-Fi credentials:
   `const char* ssid = "YOUR_WIFI_SSID";`
   `const char* password = "YOUR_WIFI_PASSWORD";`
3. Update the `serverUrl` with your machine's local IP address:
   `const char* serverUrl = "http://YOUR_LOCAL_IP:5000/api/parking/tap";`
4. Connect the ESP32 to your PC (Ensure the `VIN` pin is disconnected from the MB102 5V rail during upload).
5. Compile and Upload the code to the ESP32.

### 3. Running in Standalone Mode
1. Unplug the ESP32 from your computer's USB port.
2. Connect the **5V Rail** of the MB102 to the **`VIN`** pin of the ESP32.
3. Power on the MB102 using a DC Adapter or Powerbank.
4. The system will automatically connect to Wi-Fi and operate independently.

---
