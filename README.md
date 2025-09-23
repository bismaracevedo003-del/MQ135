🌿 Monitor de Calidad del Aire con ESP8266 y MQ-135
===================================================

📌 Descripción del Proyecto
---------------------------

Este proyecto consiste en un sistema de monitoreo de calidad del aire basado en IoT. Utiliza un **ESP8266** y el sensor **MQ-135** para medir gases contaminantes y enviar los datos a un **dashboard web** en tiempo real.

> \[NOTA\] El proyecto permite monitoreo en tiempo real, registro histórico de datos y alertas automáticas según la calidad del aire.

🚀 **Acceso Rápido**
====================

> Conecta con el proyecto en tiempo real 🔴

🌐 **Dashboard en Vivo**

[https://mq135-frontend.onrender.com](https://mq135-frontend.onrender.com)

🖥️ **API REST**

[https://mq135.onrender.com](https://mq135.onrender.com)

🛠 Microcontrolador: ESP8266
----------------------------

**Características principales:**

*   Procesador: Tensilica L106 de 32-bit
    
*   Velocidad: 80 MHz (máx. 160 MHz)
    
*   Memoria: 64 KB RAM, 4 MB Flash (depende del módulo)
    
*   Entradas/Salidas: GPIOs, ADC (0-1V), UART, SPI, I2C
    
*   Conectividad: WiFi 802.11 b/g/n
    
*   Bajo consumo de energía (modo deep sleep)
    
*   Compatible con Arduino IDE y PlatformIO
    

**Aplicaciones comunes:**

*   Sensores IoT (MQ-135, DHT22, BMP280)
    
*   Automatización de hogar
    
*   Monitoreo remoto de datos
    
*   Conexión con servicios en la nube
    

🌬 Sensor MQ-135
----------------

Descripción: Sensor de gases para detectar contaminación del aire, incluyendo CO₂, NH₃, NOx, alcohol, humo y benceno.

**Conexión con ESP8266:**

AOUT (analógico) → Pin A0 del ESP8266  DOUT (digital)  → GPIO para detectar umbral  VCC             → 5V  GND             → GND   

**Notas importantes:**

*   Requiere calibración para obtener valores precisos.
    
*   Ideal para sistemas de monitoreo ambiental y alarmas de gases.
    

🔗 Arquitectura IoT del Proyecto
--------------------------------

**Flujo de datos:**

ESP8266 + MQ-135 → API Flask → Base de datos SQL → Frontend React → Dashboard   

**Explicación:**

1.  El ESP8266 lee la concentración de gases del MQ-135.
    
2.  Envía las lecturas a la API Flask mediante HTTP POST.
    
3.  La API guarda las lecturas en la base de datos SQL Server.
    
4.  El frontend React obtiene las lecturas mediante HTTP GET y muestra un dashboard en tiempo real.
    

**Beneficios:**

*   Monitoreo en tiempo real.
    
*   Historial de lecturas.
    
*   Escalable para múltiples sensores.
    
*   Alertas automáticas cuando se exceden límites de contaminación.
    

💾 Base de datos SQL Server
---------------------------

**Tabla Lecturas:**

CREATE TABLE Lecturas (      
Id INT IDENTITY(1,1) PRIMARY KEY,      
Valor FLOAT NOT NULL,      
Fecha DATETIME DEFAULT GETDATE()  
);   

**Campos:**

*   Id: Clave primaria autoincremental.
    
*   Valor: Concentración estimada de gases (ppm).
    
*   Fecha: Fecha y hora de la lectura.
    

📚 Dependencias y Librerías
---------------------------

**Backend (Python/Flask):**

pip install flask flask_cors flask_sqlalchemy pyodbc sqlalchemy gunicorn

**Frontend (React + Vite):**

npm install react react-dom vite   

**Microcontrolador (ESP8266 - Arduino IDE):**

#include <ESP8266WiFi.h>

#include <ESP8266HTTPClient.h>

✅ Mejores Prácticas IoT
-----------------------

*   Validar datos antes de guardarlos.
    
*   Configurar WiFi y reconexión automática en ESP8266.
    
*   Usar HTTPS para comunicación segura.
    
*   Implementar límites de lectura para alertas.
    
*   Mantener histórico limitado en frontend para no saturar la UI.
    

💡 Ideas de Mejora
------------------

*   Alertas por correo o notificaciones push.
    
*   Dashboard interactivo con gráficas.
    
*   Integración con múltiples sensores y nodos IoT.
    
*   Automatización de ventilación según la calidad del aire.
