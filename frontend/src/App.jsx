import { useEffect, useState } from "react";

export default function App() {
  const [lecturas, setLecturas] = useState([]);
  const [ultimaLectura, setUltimaLectura] = useState(null);
  const [espOnline, setEspOnline] = useState(false);

  const fetchLecturas = async () => {
    try {
      const res = await fetch("https://mq135.onrender.com/api/lectura");
      const data = await res.json();
      setLecturas(data.slice(0, 5)); // Solo últimas 5 lecturas

      if (data.length > 0) {
        const ultima = data[0];
        setUltimaLectura(ultima);

        // Consideramos que el ESP está en línea si la última lectura tiene menos de 10 segundos
        const ahora = new Date();
        const fechaUltima = new Date(ultima.fecha);
        setEspOnline(ahora - fechaUltima < 10000); 
      } else {
        setUltimaLectura(null);
        setEspOnline(false);
      }
    } catch (error) {
      console.error("Error al obtener lecturas:", error);
      setUltimaLectura(null);
      setEspOnline(false);
    }
  };

  useEffect(() => {
    fetchLecturas();
    const interval = setInterval(fetchLecturas, 5000);
    return () => clearInterval(interval);
  }, []);

  const calidadAire = (ppm) => {
    if (ppm <= 300) return "Bueno ✅";
    else if (ppm <= 600) return "Medio ⚠️";
    else return "Mala 🚨";
  };

  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
      <h1>📊 Lectura de sensor MQ135</h1>

      <h2>📈 Calidad del Aire</h2>
      {ultimaLectura ? (
        <p>{calidadAire(ultimaLectura.valor)} ({ultimaLectura.valor.toFixed(2)} ppm)</p>
      ) : (
        <p>N/A</p>
      )}

      <h2>⏱ Lectura en Tiempo REAL</h2>
      {ultimaLectura ? (
        <p>{ultimaLectura.valor.toFixed(2)} ppm</p>
      ) : (
        <p>N/A</p>
      )}
      <p>ESP8266: {espOnline ? "🟢 En línea" : "🔴 Desconectado"}</p>

      <h2>📋 Últimas 5 lecturas</h2>
      {lecturas.length === 0 ? (
        <p>No hay lecturas aún.</p>
      ) : (
        <ul>
          {lecturas.map((l, i) => (
            <li key={i}>
              {l.valor.toFixed(2)} ppm - {new Date(l.fecha).toLocaleString()} - {calidadAire(l.valor)}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
