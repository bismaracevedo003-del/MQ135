import os
from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from datetime import datetime
from dotenv import load_dotenv  # Para cargar variables desde .env
import logging

# ---------------- Configuración inicial ---------------- #
# Cargar variables de entorno
load_dotenv()

# Configurar logs
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[logging.StreamHandler()]
)

# Inicializar Flask
app = Flask(__name__)
CORS(app)

# Configuración de la base de datos
DB_USER = os.getenv("DB_USER")
DB_PASS = os.getenv("DB_PASS")
DB_HOST = os.getenv("DB_HOST")
DB_NAME = os.getenv("DB_NAME")

if not all([DB_USER, DB_PASS, DB_HOST, DB_NAME]):
    raise ValueError("Faltan variables de entorno para la conexión a la base de datos")

app.config['SQLALCHEMY_DATABASE_URI'] = (
    f"mssql+pymssql://{DB_USER}:{DB_PASS}@{DB_HOST}/{DB_NAME}"
)

db = SQLAlchemy(app)

# ---------------- Definición del modelo ---------------- #
class Lectura(db.Model):
    __tablename__ = 'Lecturas'
    Id = db.Column(db.Integer, primary_key=True)
    Valor = db.Column(db.Float, nullable=False)
    Fecha = db.Column(db.DateTime, default=datetime.utcnow)

# ---------------- Rutas API ---------------- #
@app.route('/api/lectura', methods=['POST'])
def guardar_lectura():
    try:
        data = request.json
        if not data or 'valor' not in data:
            return jsonify({"error": "Falta el campo 'valor'"}), 400

        valor = data['valor']

        # Validación del valor
        if not isinstance(valor, (int, float)):
            return jsonify({"error": "El campo 'valor' debe ser numérico"}), 400
        if valor < 0 or valor > 5000:
            return jsonify({"error": "El valor debe estar entre 0 y 5000 ppm"}), 400

        nueva = Lectura(Valor=valor)
        db.session.add(nueva)
        db.session.commit()

        logging.info(f"Nueva lectura guardada: {valor} ppm")
        return jsonify({"mensaje": "Lectura guardada correctamente"}), 201

    except Exception as e:
        logging.error(f"Error al guardar lectura: {e}")
        return jsonify({"error": str(e)}), 500


@app.route('/api/lectura', methods=['GET'])
def obtener_lecturas():
    try:
        lecturas = Lectura.query.order_by(Lectura.Fecha.desc()).limit(20).all()
        return jsonify([{"valor": l.Valor, "fecha": l.Fecha.isoformat()} for l in lecturas])
    except Exception as e:
        logging.error(f"Error al obtener lecturas: {e}")
        return jsonify({"error": str(e)}), 500


@app.route('/')
def home():
    return jsonify({"mensaje": "API MQ135 funcionando correctamente"})


# ---------------- Ejecución ---------------- #
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
