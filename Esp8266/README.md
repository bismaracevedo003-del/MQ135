🌿 Monitor de Calidad del Aire con ESP8266 y MQ-135
===================================================

Este proyecto utiliza un **ESP8266** y el sensor **MQ-135** para medir la calidad del aire y enviar los datos en tiempo real a un servidor web mediante **HTTP POST**.La lectura se muestra en el **Monitor Serie** con una clasificación de la calidad del aire: **Buena, Moderada o Mala**.


*   **Sensor MQ-135**
    
*   Cable USB para programación
    
*   Conexión WiFi
    

📌 Conexiones
-------------

| Pin del MQ-135 | Pin del ESP8266 |
|----------------|----------------|
| **VCC**        | **5V**         |
| **GND**        | **GND**        |
| **AOUT**       | **A0**         |
| **DOUT(opcional)**       |                |


📡 Funcionamiento
-----------------

1.  **Se conecta a WiFi** usando el SSID y contraseña configurados.
    
2.  **Lee el valor analógico** del MQ-135 en el pin A0.
    
3.  Convierte el valor a una **estimación de ppm (0-1000)**.
    
4.  Clasifica la calidad del aire:
    
    *   ✅ **Buena:** < 300 ppm
        
    *   ⚠️ **Moderada:** 300-699 ppm
        
    *   🚨 **Mala:** ≥ 700 ppm
        
5.  **Envía los datos en formato JSON** al servidor configurado (https://mq135.onrender.com/api/lectura).
    
6.  Espera 10 segundos antes de repetir el proceso.
    

🌐 API Backend
--------------
🛠️ Hardware Necesario
----------------------

*   **ESP8266** (NodeMCU, Wemos D1 mini, etc.)
    ![Esp8266](frontend/public/Pines%20esp8266.jpg

El código hace un **HTTP POST** al endpoint /api/lectura enviando un JSON con el valor leído:

```json
{
  "valor": 452.33
}  
```
El backend debe almacenar la lectura en una base de datos o mostrarla en un dashboard.

⚠️ Notas Importantes
--------------------

*   Si el servidor usa HTTPS con certificado autofirmado, se usa client.setInsecure() para evitar errores SSL (sólo en pruebas).
    
*   Asegúrate de calibrar el sensor MQ-135 si deseas obtener valores precisos en ppm.
    
*   Cambia el SSID y contraseña por los de tu red WiFi.
    

🚀 Ideas de Mejora
------------------

*   Agregar reconexión automática a WiFi si se pierde la conexión.
    
*   Guardar datos en memoria si no hay conexión y enviarlos después.
    
*   Mostrar la calidad del aire en una pantalla OLED o LCD.
    
*   Integrar alertas por Telegram o email si la calidad es mala.
