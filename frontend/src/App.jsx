import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

export default function App() {
  const [lecturas, setLecturas] = useState([]);
  const [ultimaLectura, setUltimaLectura] = useState(null);
  const [espOnline, setEspOnline] = useState(false);
  const [segundosDesdeUltima, setSegundosDesdeUltima] = useState(0);
  const [graficaPausada, setGraficaPausada] = useState(false);

  const ajustarZonaHoraria = (fechaUTC) => {
    const offsetHoras = 6; // Nicaragua está en GMT-6
    return new Date(new Date(fechaUTC).getTime() - offsetHoras * 60 * 60 * 1000);
  };

  const fetchLecturas = async () => {
    try {
      const res = await fetch("https://mq135.onrender.com/api/lectura");
      const data = await res.json();

      if (data.length > 0) {
        const ordenadas = [...data].sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
        const ultimasLecturas = ordenadas.slice(0, 20).reverse();
        const ultima = ordenadas[0];
        const fechaAjustada = ajustarZonaHoraria(ultima.fecha);
        const ahora = new Date();
        const diferenciaSegundos = Math.floor((ahora - fechaAjustada) / 1000);

        if (!graficaPausada) setLecturas(ultimasLecturas);
        setUltimaLectura({ ...ultima, fecha: fechaAjustada });
        setSegundosDesdeUltima(diferenciaSegundos);
        setEspOnline(diferenciaSegundos < 30);
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

  useEffect(() => {
    fetchLecturas();
    const interval = setInterval(fetchLecturas, 5000);
    return () => clearInterval(interval);
  }, [graficaPausada]);

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

  const calidadAire = (ppm) => {
    if (ppm <= 300) return { texto: "Bueno ✅", color: "#4CAF50" };
    else if (ppm <= 600) return { texto: "Medio ⚠️", color: "#FF9800" };
    else return { texto: "Mala 🚨", color: "#F44336" };
  };

  const formatearTiempo = (segundos) => {
    if (segundos < 60) return `${segundos}s`;
    const h = Math.floor(segundos / 3600);
    const m = Math.floor((segundos % 3600) / 60);
    const s = segundos % 60;
    return `${h > 0 ? h + "h " : ""}${m > 0 ? m + "min " : ""}${s}s`;
  };

  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif", maxWidth: "900px", margin: "auto" }}>
      <h1 style={{ textAlign: "center" }}>📊 Dashboard MQ135 - Tiempo real</h1>

      {/* Calidad del Aire */}
      <div style={{ margin: "20px 0", padding: "15px", borderRadius: "10px", backgroundColor: "#000000ff" }}>
        <h2>📈 Calidad del Aire</h2>
        {ultimaLectura ? (
          <p style={{ fontWeight: "bold", color: calidadAire(ultimaLectura.valor).color, fontSize: "1.2em" }}>
            {calidadAire(ultimaLectura.valor).texto} ({ultimaLectura.valor.toFixed(2)} ppm)
          </p>
        ) : (
          <p>N/A</p>
        )}
      </div>

      {/* Lectura en Tiempo Real */}
      <div style={{ margin: "20px 0", padding: "15px", borderRadius: "10px", backgroundColor: "#000000ff" }}>
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
                fontWeight: segundosDesdeUltima > 60 ? "bold" : "normal",
              }}
            >
              Última lectura hace {formatearTiempo(segundosDesdeUltima)}
            </p>
            {!espOnline && (
              <div style={{ backgroundColor: "#F44336", color: "#fff", padding: "10px", borderRadius: "5px", marginTop: "10px" }}>
                ⚠️ El dispositivo no ha enviado datos en más de 30 segundos.
              </div>
            )}
          </>
        )}

        <button
          onClick={() => setGraficaPausada(!graficaPausada)}
          style={{
            marginTop: "10px",
            padding: "8px 15px",
            borderRadius: "5px",
            border: "none",
            backgroundColor: graficaPausada ? "#4CAF50" : "#1976D2",
            color: "#fff",
            cursor: "pointer",
          }}
        >
          {graficaPausada ? "Reanudar gráfica" : "Pausar gráfica"}
        </button>
      </div>

      {/* Últimas 5 lecturas */}
      <div style={{ margin: "20px 0", padding: "15px", borderRadius: "10px", backgroundColor: "#000000ff" }}>
        <h2>📝 Últimas 5 lecturas</h2>
        {lecturas.length === 0 ? (
          <p>No hay lecturas aún.</p>
        ) : (
          <ul>
            {[...lecturas].slice(-5).reverse().map((lectura, index) => (
              <li key={index}>
                {new Date(ajustarZonaHoraria(lectura.fecha)).toLocaleTimeString()} - {lectura.valor.toFixed(2)} ppm
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Gráfico de últimas 20 lecturas */}
      <div style={{ margin: "20px 0", padding: "15px", borderRadius: "10px", backgroundColor: "#000000ff" }}>
        <h2>📋 Últimas 20 lecturas - Gráfico</h2>
        {lecturas.length === 0 ? (
          <p>No hay lecturas aún.</p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={lecturas.map((l) => ({ ...l, fecha: ajustarZonaHoraria(l.fecha) }))}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="fecha" tickFormatter={(timeStr) => new Date(timeStr).toLocaleTimeString()} />
              <YAxis domain={[0, Math.max(...lecturas.map((l) => l.valor)) * 1.1]} />
              <Tooltip labelFormatter={(timeStr) => new Date(timeStr).toLocaleString()} />
              <Line type="monotone" dataKey="valor" stroke="#1976D2" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
