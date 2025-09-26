# ---------------- Importación de librerías ---------------- #
import os
from flask import Flask, request, jsonify         # Flask para la API, request para recibir datos, jsonify para respuestas en JSON
from flask_sqlalchemy import SQLAlchemy           # ORM para interactuar con la base de datos SQL Server
from flask_cors import CORS                       # Para permitir peticiones desde otros dominios (frontend)
from datetime import datetime                     # Para manejar fechas y horas
from dotenv import load_dotenv                    # Para cargar variables de entorno desde un archivo .env
import logging                                    # Para registrar logs (información, errores, advertencias)

# ---------------- Configuración inicial ---------------- #

# Cargar variables de entorno desde el archivo .env
load_dotenv()

# Configurar el sistema de logs
logging.basicConfig(
    level=logging.INFO,                           # Nivel de detalle (INFO: mensajes normales + errores)
    format="%(asctime)s [%(levelname)s] %(message)s",  # Formato de los logs: fecha, nivel y mensaje
    handlers=[logging.StreamHandler()]            # Se mostrarán directamente en la consola
)

# Inicializar la aplicación Flask
app = Flask(__name__)
CORS(app)  # Habilitar CORS para que el frontend pueda consumir la API

# ---------------- Configuración de la base de datos ---------------- #

# Leer variables de entorno para la conexión a la base de datos
DB_USER = os.getenv("DB_USER")
DB_PASS = os.getenv("DB_PASS")
DB_HOST = os.getenv("DB_HOST")
DB_NAME = os.getenv("DB_NAME")

# Validar que todas las variables necesarias estén definidas
if not all([DB_USER, DB_PASS, DB_HOST, DB_NAME]):
    raise ValueError("Faltan variables de entorno para la conexión a la base de datos")

# Construcción de la cadena de conexión (usando pymssql)
app.config['SQLALCHEMY_DATABASE_URI'] = (
    f"mssql+pymssql://{DB_USER}:{DB_PASS}@{DB_HOST}/{DB_NAME}"
)

# Inicializar la base de datos
db = SQLAlchemy(app)

# ---------------- Definición del modelo ---------------- #
# Representa la tabla "Lecturas" en la base de datos
class Lectura(db.Model):
    __tablename__ = 'Lecturas'                    # Nombre de la tabla
    Id = db.Column(db.Integer, primary_key=True)  # Columna Id (clave primaria, autoincremental)
    Valor = db.Column(db.Float, nullable=False)   # Columna Valor (lectura del sensor en ppm)
    Fecha = db.Column(db.DateTime, default=datetime.utcnow)  # Columna Fecha (se asigna automáticamente la fecha actual)

# ---------------- Rutas de la API ---------------- #

# Ruta para guardar una nueva lectura
@app.route('/api/lectura', methods=['POST'])
def guardar_lectura():
    try:
        # Obtener el JSON enviado en la petición
        data = request.json
        if not data or 'valor' not in data:
            return jsonify({"error": "Falta el campo 'valor'"}), 400

        valor = data['valor']

        # Validación del valor
        if not isinstance(valor, (int, float)):
            return jsonify({"error": "El campo 'valor' debe ser numérico"}), 400
        if valor < 0 or valor > 5000:
            return jsonify({"error": "El valor debe estar entre 0 y 5000 ppm"}), 400

        # Crear y guardar la nueva lectura
        nueva = Lectura(Valor=valor)
        db.session.add(nueva)
        db.session.commit()

        # Registrar en los logs
        logging.info(f"Nueva lectura guardada: {valor} ppm")

        return jsonify({"mensaje": "Lectura guardada correctamente"}), 201

    except Exception as e:
        logging.error(f"Error al guardar lectura: {e}")
        return jsonify({"error": str(e)}), 500


# Ruta para obtener las últimas 20 lecturas
@app.route('/api/lectura', methods=['GET'])
def obtener_lecturas():
    try:
        # Consultar las últimas 20 lecturas en orden descendente
        lecturas = Lectura.query.order_by(Lectura.Fecha.desc()).limit(20).all()

        # Convertir los resultados a JSON
        return jsonify([{"valor": l.Valor, "fecha": l.Fecha.isoformat()} for l in lecturas])
    except Exception as e:
        logging.error(f"Error al obtener lecturas: {e}")
        return jsonify({"error": str(e)}), 500


# Ruta principal para comprobar que la API está activa
@app.route('/')
def home():
    return jsonify({"mensaje": "API MQ135 funcionando correctamente"})


# ---------------- Ejecución ---------------- #
# Ejecuta la aplicación si se corre directamente (no si se importa como módulo)
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)  # Disponible en toda la red local
