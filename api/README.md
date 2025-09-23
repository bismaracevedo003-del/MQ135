🌐 API REST para Monitoreo de Calidad del Aire (MQ-135)
=======================================================

Esta API está desarrollada en **Flask** y se conecta a una **base de datos SQL Server** en la nube para almacenar y consultar lecturas de calidad del aire enviadas desde un **ESP8266 + MQ-135**.

📌 Descripción
--------------

El servicio expone dos endpoints principales:

*   **POST /api/lectura** → Recibe una lectura enviada por el ESP8266 en formato JSON y la almacena en la base de datos.
    
*   **GET /api/lectura** → Devuelve las últimas 20 lecturas registradas, en orden descendente (más recientes primero).
    

🛠️ Tecnologías Usadas
----------------------

*   **Flask** – Framework web para Python
    
*   **Flask-CORS** – Permite peticiones desde frontend (React, etc.)
    
*   **SQLAlchemy** – ORM para interactuar con SQL Server
    
*   **pymssql** – Driver de conexión para SQL Server
    
*   **JSON** – Intercambio de datos entre ESP8266, API y frontend
    

📡 Endpoints Disponibles

### 1️⃣ Verificar estado de la API

**GET http://:Ip o Nombre de dominio/**

**Respuesta:**
```json
{
"mensaje": "API MQ135 funcionando correctamente"
}   
```
### 2️⃣ Guardar una nueva lectura

**POST http://:Ip o Nombre de dominio/api/lectura**

**Body (JSON):**
```json
{
"valor": 452.33
}   
```
**Respuesta:**
```json
{
"mensaje": "Lectura guardada correctamente"
}   
```
### 3️⃣ Obtener las últimas 20 lecturas

**GET http://:Ip o Nombre de dominio/api/lectura**

**Respuesta:**
```json
[
  {
    "valor": 452.33,
    "fecha": "2025-09-22T18:25:43.511Z"
  },
  {
    "valor": 312.10,
    "fecha": "2025-09-22T18:15:10.322Z"
  }
]
 ``` 

⚠️ Notas de Seguridad
---------------------

*   No compartas públicamente tu **usuario y contraseña de base de datos**.
    
*   Usa **variables de entorno** (.env) para credenciales en producción.
    
*   Implementa validación adicional para evitar inyecciones SQL o datos inválidos.
    

🚀 Posibles Mejoras
-------------------

*   Agregar paginación en el endpoint de GET /api/lectura.
    
*   Filtrar lecturas por rango de fechas (?start=YYYY-MM-DD&end=YYYY-MM-DD).
    
*   Añadir autenticación con API Key o JWT.
    
*   Desplegar en servicios como Render, Railway o Azure App Service.
