# Importamos las dependencias principales
from flask import Flask, request, jsonify        # Flask para crear la API, request para obtener datos, jsonify para devolver JSON
from flask_sqlalchemy import SQLAlchemy          # ORM para interactuar con la base de datos
from flask_cors import CORS                      # Para habilitar CORS y permitir peticiones desde el frontend
from datetime import datetime                    # Para registrar la fecha/hora de cada lectura

# Inicializamos la aplicación Flask
app = Flask(__name__)
CORS(app)  # Habilita CORS para todas las rutas (necesario si el frontend está en otro dominio)

# Configuración de la base de datos SQL Server usando pymssql
app.config['SQLALCHEMY_DATABASE_URI'] = (
    "mssql+pymssql://bismar-ac_SQLLogin_1:uex7yg16hs@MQ135esp8266.mssql.somee.com:1433/MQ135esp8266"
)

# Inicializamos la conexión a la base de datos
db = SQLAlchemy(app)

# Definición del modelo de la tabla 'Lecturas'
class Lectura(db.Model):
    __tablename__ = 'Lecturas'                          # Nombre de la tabla en la base de datos
    Id = db.Column(db.Integer, primary_key=True)         # Columna Id (clave primaria autoincremental)
    Valor = db.Column(db.Float, nullable=False)          # Columna Valor (almacena ppm del sensor)
    Fecha = db.Column(db.DateTime, default=datetime.utcnow)  # Columna Fecha (se llena automáticamente con la fecha actual)

# Ruta para guardar una nueva lectura (POST)
@app.route('/api/lectura', methods=['POST'])
def guardar_lectura():
    try:
        data = request.json  # Obtiene el JSON enviado en la petición
        if not data or 'valor' not in data:  # Valida que exista el campo 'valor'
            return jsonify({"error": "Falta el campo 'valor'"}), 400

        # Crea un nuevo registro de lectura
        nueva = Lectura(Valor=data['valor'])
        db.session.add(nueva)   # Agrega la lectura a la sesión
        db.session.commit()     # Guarda la lectura en la base de datos

        return jsonify({"mensaje": "Lectura guardada correctamente"}), 201

    except Exception as e:
        # Si ocurre un error, lo devuelve en la respuesta para facilitar depuración en Postman
        return jsonify({"error": str(e)}), 500

# Ruta para obtener las últimas 20 lecturas (GET)
@app.route('/api/lectura', methods=['GET'])
def obtener_lecturas():
    # Consulta las últimas 20 lecturas ordenadas por fecha descendente
    lecturas = Lectura.query.order_by(Lectura.Fecha.desc()).limit(20).all()
    # Devuelve una lista de diccionarios con valor y fecha en formato ISO 8601
    return jsonify([{"valor": l.Valor, "fecha": l.Fecha.isoformat()} for l in lecturas])

# Ruta principal para verificar que la API está funcionando
@app.route('/')
def home():
    return jsonify({"mensaje": "API MQ135 funcionando correctamente"})

# Ejecuta la aplicación en modo desarrollo escuchando en todas las interfaces (0.0.0.0) en el puerto 5000
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)

