import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts"; // Librería para graficar datos

export default function App() {
  // Estados principales
  const [lecturas, setLecturas] = useState([]);            // Últimas 20 lecturas
  const [ultimaLectura, setUltimaLectura] = useState(null); // Última lectura
  const [espOnline, setEspOnline] = useState(false);        // Estado del ESP8266
  const [segundosDesdeUltima, setSegundosDesdeUltima] = useState(0); // Segundos desde la última lectura

  // Ajusta la fecha UTC a la zona horaria de Nicaragua (GMT-6)
  const ajustarZonaHoraria = (fechaUTC) => {
    const offsetHoras = 6;
    return new Date(new Date(fechaUTC).getTime() - offsetHoras * 60 * 60 * 1000);
  };

  // Obtiene lecturas desde la API
  const fetchLecturas = async () => {
    try {
      const res = await fetch("https://mq135.onrender.com/api/lectura");
      const data = await res.json();

      if (data.length > 0) {
        const ordenadas = [...data].sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
        const ultimasLecturas = ordenadas.slice(0, 20).reverse(); // Últimas 20 en orden cronológico
        const ultima = ordenadas[0];
        const fechaAjustada = ajustarZonaHoraria(ultima.fecha);
        const ahora = new Date();
        const diferenciaSegundos = Math.floor((ahora - fechaAjustada) / 1000);

        setLecturas(ultimasLecturas);
        setUltimaLectura({ ...ultima, fecha: fechaAjustada });
        setSegundosDesdeUltima(diferenciaSegundos);
        setEspOnline(diferenciaSegundos < 30); // Online si < 30s
      } else {
        setLecturas([]);
        setUltimaLectura(null);
        setEspOnline(false);
        setSegundosDesdeUltima(0);
      }
    } catch (error) {
      console.error("Error al obtener lecturas:", error);
      setLecturas([]);
      setUltimaLectura(null);
      setEspOnline(false);
      setSegundosDesdeUltima(0);
    }
  };

  // Efecto: actualizar lecturas cada 5 segundos
  useEffect(() => {
    fetchLecturas();
    const interval = setInterval(fetchLecturas, 5000);
    return () => clearInterval(interval);
  }, []);

  // Efecto: actualizar contador de segundos desde la última lectura cada 1 segundo
  useEffect(() => {
    const timer = setInterval(() => {
      if (ultimaLectura) {
        const ahora = new Date();
        const diferencia = Math.floor((ahora - new Date(ultimaLectura.fecha)) / 1000);
        setSegundosDesdeUltima(diferencia);
        setEspOnline(diferencia < 30);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [ultimaLectura]);

  // Determina la calidad del aire según ppm
  const calidadAire = (ppm) => {
    if (ppm <= 300) return { texto: "Bueno ✅", color: "#4CAF50" };
    else if (ppm <= 600) return { texto: "Medio ⚠️", color: "#FF9800" };
    else return { texto: "Mala 🚨", color: "#F44336" };
  };

  // Formato legible de tiempo
  const formatoTiempo = (segundos) => {
    if (segundos < 60) return `${segundos} seg`;
    if (segundos < 3600) return `${Math.floor(segundos / 60)} min ${segundos % 60} seg`;
    const horas = Math.floor(segundos / 3600);
    const minutos = Math.floor((segundos % 3600) / 60);
    return `${horas} h ${minutos} min`;
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        minHeight: "100vh",
        width: "100vw",
        padding: "20px",
        fontFamily: "sans-serif",
        backgroundColor: "#121212",
        color: "#ffffff",
        boxSizing: "border-box",
      }}
    >
      <h1 style={{ textAlign: "center" }}>📊 Dashboard MQ135 - Tiempo real</h1>

      {/* Calidad del Aire */}
      <div
        style={{
          width: "100%",
          margin: "20px 0",
          padding: "15px",
          borderRadius: "10px",
          backgroundColor: "#1E1E1E",
        }}
      >
        <h2>📈 Calidad del Aire</h2>
        {ultimaLectura ? (
          <p
            style={{
              fontWeight: "bold",
              color: calidadAire(ultimaLectura.valor).color,
              fontSize: "1.2em",
            }}
          >
            {calidadAire(ultimaLectura.valor).texto} ({ultimaLectura.valor.toFixed(2)} ppm)
          </p>
        ) : (
          <p>N/A</p>
        )}
      </div>

      {/* Lectura en tiempo real */}
      <div
        style={{
          width: "100%",
          margin: "20px 0",
          padding: "15px",
          borderRadius: "10px",
          backgroundColor: "#1E1E1E",
        }}
      >
        <h2>⏱ Lectura en Tiempo REAL</h2>
        <p style={{ fontSize: "1.2em" }}>
          {espOnline && ultimaLectura ? ultimaLectura.valor.toFixed(2) + " ppm" : "N/A"}
        </p>
        <p style={{ fontWeight: "bold", color: espOnline ? "#4CAF50" : "#F44336" }}>
          ESP8266: {espOnline ? "🟢 En línea" : "🔴 Desconectado"}
        </p>
        {ultimaLectura && (
          <>
            <p
              style={{
                fontSize: "0.9em",
                color: segundosDesdeUltima > 60 ? "#FF9800" : "#ccc",
              }}
            >
              Última lectura hace {formatoTiempo(segundosDesdeUltima)}
            </p>
            {!espOnline && (
              <div
                style={{
                  backgroundColor: "#F44336",
                  color: "#fff",
                  padding: "10px",
                  borderRadius: "5px",
                  marginTop: "10px",
                }}
              >
                ⚠️ El dispositivo no ha enviado datos en más de 30 segundos.
              </div>
            )}
          </>
        )}
      </div>

      {/* Últimas 5 lecturas */}
      <div
        style={{
          width: "100%",
          margin: "20px 0",
          padding: "15px",
          borderRadius: "10px",
          backgroundColor: "#1E1E1E",
        }}
      >
        <h2>📝 Últimas 5 lecturas</h2>
        {lecturas.length === 0 ? (
          <p>No hay lecturas aún.</p>
        ) : (
          <ul>
            {[...lecturas].slice(-5).reverse().map((lectura, index) => (
              <li key={index}>
                {new Date(ajustarZonaHoraria(lectura.fecha)).toLocaleTimeString()} -{" "}
                {lectura.valor.toFixed(2)} ppm
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Gráfico */}
      <div
        style={{
          width: "100%",
          margin: "20px 0",
          padding: "15px",
          borderRadius: "10px",
          backgroundColor: "#1E1E1E",
          flexGrow: 1,
        }}
      >
        <h2>📋 Últimas 20 lecturas - Gráfico</h2>
        {lecturas.length === 0 ? (
          <p>No hay lecturas aún.</p>
        ) : (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={lecturas.map((l) => ({ ...l, fecha: ajustarZonaHoraria(l.fecha) }))}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="fecha" tickFormatter={(timeStr) => new Date(timeStr).toLocaleTimeString()} />
              <YAxis domain={[0, Math.max(...lecturas.map((l) => l.valor)) * 1.1]} />
              <Tooltip labelFormatter={(timeStr) => new Date(timeStr).toLocaleString()} />
              <Line
                type="monotone"
                dataKey="valor"
                stroke="#1976D2"
                strokeWidth={3}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
