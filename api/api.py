from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

app = Flask(__name__)

# Cambiamos de pyodbc a pymssql
app.config['SQLALCHEMY_DATABASE_URI'] = (
    "mssql+pymssql://bismar-ac_SQLLogin_1:uex7yg16hs@MQ135esp8266.mssql.somee.com:1433/MQ135esp8266"
)

db = SQLAlchemy(app)

class Lectura(db.Model):
    __tablename__ = 'Lecturas'
    Id = db.Column(db.Integer, primary_key=True)
    Valor = db.Column(db.Float, nullable=False)
    Fecha = db.Column(db.DateTime, default=datetime.utcnow)

@app.route('/api/lectura', methods=['POST'])
def guardar_lectura():
    try:
        data = request.json
        if not data or 'valor' not in data:
            return jsonify({"error": "Falta el campo 'valor'"}), 400

        nueva = Lectura(Valor=data['valor'])
        db.session.add(nueva)
        db.session.commit()
        return jsonify({"mensaje": "Lectura guardada correctamente"}), 201

    except Exception as e:
        # Devuelve el error exacto en Postman
        return jsonify({"error": str(e)}), 500

@app.route('/api/lectura', methods=['GET'])
def obtener_lecturas():
    lecturas = Lectura.query.order_by(Lectura.Fecha.desc()).limit(20).all()
    return jsonify([{"valor": l.Valor, "fecha": l.Fecha.isoformat()} for l in lecturas])

@app.route('/')
def home():
    return jsonify({"mensaje": "API MQ135 funcionando correctamente 🚀"})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
