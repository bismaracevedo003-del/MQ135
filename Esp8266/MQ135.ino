#include <ESP8266WiFi.h>          // Librería para manejar la conexión WiFi en ESP8266
#include <ESP8266HTTPClient.h>    // Librería para enviar peticiones HTTP
#include <WiFiClientSecure.h>     // Librería para manejar conexiones HTTPS (SSL/TLS)

// Configuración WiFi y servidor
const char* ssid = "HP-14-EM0017LA 2038";   // Nombre de la red WiFi
const char* password = "f9G502/3";          // Contraseña de la red WiFi
const char* serverName = "https://mq135.onrender.com/api/lectura";  // URL de la API donde se enviarán los datos

const int MQ135_PIN = A0;       // Pin analógico donde está conectado el sensor MQ-135
unsigned long startAttemptTime = millis();  // Guarda el tiempo de inicio para controlar el timeout
const unsigned long timeout = 5000;         // Tiempo máximo de espera para conectarse a WiFi (5 segundos)

void setup() {
  Serial.begin(115200);         // Inicia la comunicación serie para depuración
  delay(1000);
  Serial.println("Iniciando lectura de calidad del aire (MQ-135)...");

  // Conexión a WiFi
  WiFi.begin(ssid, password);   // Inicia conexión WiFi con SSID y contraseña
  Serial.println("Conectando a WiFi...");

  // Espera hasta que se conecte o que pase el tiempo máximo definido
  while (WiFi.status() != WL_CONNECTED && millis() - startAttemptTime < timeout) {
    Serial.print(".");          // Imprime puntos mientras intenta conectarse
    delay(500);
  }

  // Verifica si se logró la conexión
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n Conectado a WiFi!");
    Serial.print("Dirección IP: ");
    Serial.println(WiFi.localIP());  // Muestra la IP asignada al ESP8266
  } else {
    Serial.println("\n No se pudo conectar a WiFi. Verifica tu SSID y contraseña.");
  }
}

void loop() {
  // Leer valor del sensor MQ-135
  int valor = analogRead(MQ135_PIN);           // Lectura analógica de 0 a 1023
  float ppm = (valor / 1023.0) * 1000;        // Conversión aproximada a ppm (0-1000)

  // Mostrar datos en el monitor serie
  Serial.print("Valor analogico: ");
  Serial.print(valor);
  Serial.print(" | Estimacion ppm: ");
  Serial.print(ppm);

  // Clasificar la calidad del aire según el valor leído
  if (ppm < 300) {
    Serial.println(" | Calidad del aire: Buena");
  } 
  else if (ppm >= 300 && ppm < 700) {
    Serial.println(" | Calidad del aire: Moderada");
  } 
  else {
    Serial.println(" | Calidad del aire: Mala");
  }

  // Enviar datos al servidor si hay conexión WiFi
  if (WiFi.status() == WL_CONNECTED) {
    WiFiClientSecure client;   // Cliente seguro para HTTPS
    client.setInsecure();      // Desactiva la validación del certificado (útil para pruebas)

    HTTPClient http;
    http.begin(client, serverName);       // Inicia conexión con el servidor
    http.addHeader("Content-Type", "application/json");  // Indica que se enviará JSON

    // Crea el JSON con el valor medido
    String json = "{\"valor\": " + String(ppm, 2) + "}";

    // Envía la petición POST con los datos
    int httpResponseCode = http.POST(json);

    // Muestra el código de respuesta HTTP (201 = creado, 200 = ok, etc.)
    Serial.print("HTTP Response code: ");
    Serial.println(httpResponseCode);

    http.end();  // Termina la conexión HTTP
  }

  delay(5000);  // Espera 5 segundos antes de hacer otra lectura
}

