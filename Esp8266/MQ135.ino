#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <WiFiClientSecure.h>

// Configuración WiFi y servidor
const char* ssid = "HP-14-EM0017LA 2038";
const char* password = "f9G502/3";
const char* serverName = "https://mq135.onrender.com/api/lectura";

const int MQ135_PIN = A0;
unsigned long startAttemptTime = millis();
const unsigned long timeout = 5000; // Tiempo máximo de espera en ms (5 segundos)

void setup() {
  Serial.begin(115200);
  delay(1000);
  Serial.println("Iniciando lectura de calidad del aire (MQ-135)...");

  // Conexión a WiFi
WiFi.begin(ssid, password);
Serial.println("Conectando a WiFi...");

while (WiFi.status() != WL_CONNECTED && millis() - startAttemptTime < timeout) {
    Serial.print(".");
    delay(500);
}

if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n✅ Conectado a WiFi!");
    Serial.print("Dirección IP: ");
    Serial.println(WiFi.localIP());
} else {
    Serial.println("\n❌ No se pudo conectar a WiFi. Verifica tu SSID y contraseña.");
}

}

void loop() {
  int valor = analogRead(MQ135_PIN);  // Lectura analógica 0-1023
  float ppm = (valor / 1023.0) * 1000; // Estimación 0-1000 ppm

  // Mostrar en consola
  Serial.print("Valor analogico: ");
  Serial.print(valor);
  Serial.print(" | Estimacion ppm: ");
  Serial.print(ppm);

  if (ppm < 300) {
    Serial.println(" | Calidad del aire: ✅ Buena");
  } 
  else if (ppm >= 300 && ppm < 700) {
    Serial.println(" | Calidad del aire: ⚠️ Moderada");
  } 
  else {
    Serial.println(" | Calidad del aire: 🚨 Mala");
  }

  // Enviar datos al servidor si hay conexión WiFi
  if (WiFi.status() == WL_CONNECTED) {
    WiFiClientSecure client;
    client.setInsecure();  // Evita errores SSL en pruebas

    HTTPClient http;
    http.begin(client, serverName);
    http.addHeader("Content-Type", "application/json");

    String json = "{\"valor\": " + String(ppm, 2) + "}";
    int httpResponseCode = http.POST(json);

    Serial.print("HTTP Response code: ");
    Serial.println(httpResponseCode);

    http.end();
  }

  delay(10000); // Espera 5 segundos antes de la siguiente lectura
}
