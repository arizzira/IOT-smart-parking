#include <SPI.h>
#include <MFRC522.h>
#include <ESP32Servo.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h> 

// --- KONFIGURASI WIFI & SERVER ---
const char* ssid = "KLKS";  
const char* password = "BISMILLAH"; 

const char* serverUrl = "http://10.42.0.1:5000/api/parking/tap";

// --- KONFIGURASI PIN ---
#define SS_PIN      5   
#define RST_PIN     4  
#define SERVO_PIN   13  
#define TRIG_PIN    26  
#define ECHO_PIN    25  
#define LED_HIJAU   32  
#define LED_MERAH   33  
#define IR_SLOT1    27  
#define BUZZER_PIN  14 

#define SCREEN_WIDTH 128 
#define SCREEN_HEIGHT 64 
#define OLED_RESET    -1 
#define SCREEN_ADDRESS 0x3C 
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);

MFRC522 rfid(SS_PIN, RST_PIN);
Servo palangParkir;

// ==========================================
// FUNGSI SERVO SLOW MOTION (REALISTIS)
// ==========================================
void bukaPalangSlow() {
  for (int pos = 0; pos <= 90; pos += 2) { 
    palangParkir.write(pos);
    delay(20); 
  }
}

void tutupPalangSlow() {
  for (int pos = 90; pos >= 0; pos -= 2) { 
    palangParkir.write(pos);
    delay(25); 
  }
}
// ==========================================

void setup() {
  Serial.begin(115200); 
  SPI.begin();          
  rfid.PCD_Init();      
  
  palangParkir.setPeriodHertz(50); 
  palangParkir.attach(SERVO_PIN, 500, 2400); 
  palangParkir.write(0); 
  
  pinMode(LED_HIJAU, OUTPUT);
  pinMode(LED_MERAH, OUTPUT);
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);
  pinMode(IR_SLOT1, INPUT_PULLUP);
  pinMode(BUZZER_PIN, OUTPUT); 
  
  digitalWrite(LED_HIJAU, LOW);
  digitalWrite(LED_MERAH, LOW);
  digitalWrite(BUZZER_PIN, LOW); 

  if(!display.begin(SSD1306_SWITCHCAPVCC, SCREEN_ADDRESS)) {
    Serial.println(F("OLED GAGAL!"));
    for(;;); 
  }

  display.clearDisplay();
  display.setTextSize(1);
  display.setTextColor(SSD1306_WHITE);
  display.setCursor(0, 10);
  display.println(F("Koneksi WiFi..."));
  display.display();

  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  
  Serial.println("\n=================================");
  Serial.println("[INFO] WiFi Terhubung!");
  Serial.print("[INFO] IP: ");
  Serial.println(WiFi.localIP()); 
  Serial.println("=================================");

  bunyiBuzzer(100, 100, 2);
}

int bacaJarak() {
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);
  long durasi = pulseIn(ECHO_PIN, HIGH, 30000); 
  if (durasi == 0) return 999;
  return durasi * 0.034 / 2;
}

int cekSisaSlot() {
  bool slotTerisi = (digitalRead(IR_SLOT1) == LOW);
  return slotTerisi ? 0 : 1; 
}

void bunyiBuzzer(int durasiNyala, int durasiMati, int berapaKali) {
  for(int i = 0; i < berapaKali; i++) {
    digitalWrite(BUZZER_PIN, HIGH);
    delay(durasiNyala);
    digitalWrite(BUZZER_PIN, LOW);
    if(i < berapaKali - 1) delay(durasiMati); 
  }
}

void tampilkanMenuUtama(int sisaSlot) {
  display.clearDisplay();
  display.setTextSize(1);
  display.setTextColor(SSD1306_WHITE);
  display.setCursor(0, 0);
  display.println(F("  SMART PARKING 14  "));
  display.drawLine(0, 10, 128, 10, SSD1306_WHITE); 
  
  display.setCursor(0, 20);
  if (sisaSlot > 0) {
    display.print(F("Status: "));
    display.print(sisaSlot);
    display.println(F(" KOSONG"));
  } else {
    display.println(F("Status: PENUH (FULL)"));
  }
  
  display.setCursor(0, 45);
  display.println(F("Silahkan Tap Kartu!"));
  display.display();
}

void loop() {
  int sisaSlot = cekSisaSlot();
  tampilkanMenuUtama(sisaSlot);
  
  if (!rfid.PICC_IsNewCardPresent() || !rfid.PICC_ReadCardSerial()) {
    delay(100); 
    return;
  }

  bunyiBuzzer(100, 0, 1);

  String uidString = "";
  for (byte i = 0; i < rfid.uid.size; i++) {
    if (rfid.uid.uidByte[i] < 0x10) uidString += "0";
    uidString += String(rfid.uid.uidByte[i], HEX);
  }
  uidString.toUpperCase(); 
  Serial.println("\n=================================");
  Serial.println("Kartu di-tap: " + uidString);

  if(WiFi.status() == WL_CONNECTED){
    HTTPClient http;
    http.begin(serverUrl); 
    http.addHeader("Content-Type", "application/json");
    http.setTimeout(5000); 

    String jsonPayload = "{\"uid\":\"" + uidString + "\",\"sisa_slot\":" + String(sisaSlot) + "}";
    int httpResponseCode = http.POST(jsonPayload);

    if (httpResponseCode > 0) {
      String response = http.getString();
      JsonDocument doc;
      deserializeJson(doc, response);
      
      bool success = doc["success"];
      String serverMessage = doc["message"]; 
      String userName = doc["name"];         

      if (success == true) {
        digitalWrite(LED_HIJAU, HIGH);
        bunyiBuzzer(100, 100, 2); 
        
        display.clearDisplay();
        display.setTextSize(1);
        display.setCursor(0, 5);
        display.println("Hai, " + userName); 
        display.setTextSize(2);
        display.setCursor(0, 20);
        display.println(doc["status"].as<String>()); 
        display.setTextSize(1);
        display.setCursor(0, 45);
        display.println(serverMessage); 
        display.display();
        
        bukaPalangSlow(); 
        
        unsigned long waktuMulai = millis();
        bool mobilTerdeteksi = false;
        
        while (millis() - waktuMulai < 10000) { 
          int jarak = bacaJarak();
          
          // 1. PAS MOBIL MASUK AREA SENSOR (Jarak < 15cm)
          if (jarak > 0 && jarak < 15) {
            // Ngecek biar bunyinya cuma SEKALI pas baru masuk
            if (mobilTerdeteksi == false) {
              bunyiBuzzer(80, 0, 1); // Bunyi "Tit!" tanda mobil kedeteksi
              mobilTerdeteksi = true; // Tandain kalau mobil udah di bawah palang
            }
          } 
          
          // 2. PAS MOBIL UDAH LEWAT (Jarak > 15cm TAPI sebelumnya sempet kedeteksi)
          if (mobilTerdeteksi == true && jarak > 15) {
            bunyiBuzzer(80, 80, 2); // Bunyi "Tit! Tit!" tanda mobil aman udah lewat
            
            // Waktu tunggu aman sebelum palang turun (biar gak nimpuk pantat mobil)
            delay(2500); 
            break; // Keluar dari loop tunggu
          }
          
          delay(100);
        }
        
        tutupPalangSlow(); 
        digitalWrite(LED_HIJAU, LOW);
        
      } else {
        digitalWrite(LED_MERAH, HIGH);
        bunyiBuzzer(1500, 0, 1); 
        
        display.clearDisplay();
        display.setTextSize(1);
        display.setCursor(0, 5);
        display.println(userName); 
        display.setTextSize(2);
        display.setCursor(0, 20);
        display.println(F("DITOLAK!"));
        display.setTextSize(1);
        display.setCursor(0, 45);
        display.println(serverMessage); 
        display.display();
        
        delay(3000);
      }
    } else {
      bunyiBuzzer(200, 200, 3); 
      display.clearDisplay();
      display.setTextSize(1);
      display.setCursor(0, 0);
      display.println(F("HTTP REQ GAGAL!"));
      display.display();
      delay(4000);
    }
    http.end();
  } else {
    bunyiBuzzer(50, 50, 10); 
  }

  digitalWrite(LED_HIJAU, LOW);
  digitalWrite(LED_MERAH, LOW);
  rfid.PICC_HaltA();
  rfid.PCD_StopCrypto1();
  delay(500); 
}