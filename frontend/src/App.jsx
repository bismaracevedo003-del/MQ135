import { useEffect, useState } from "react"; 
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts"; //  Librería para graficar datos en React

export default function App() {
  // Estados principales
  const [lecturas, setLecturas] = useState([]);            // Guarda las lecturas recibidas de la API
  const [ultimaLectura, setUltimaLectura] = useState(null); // Guarda la última lectura
  const [espOnline, setEspOnline] = useState(false);        // Indica si el ESP8266 está en línea
  const [segundosDesdeUltima, setSegundosDesdeUltima] = useState(0); // Tiempo en segundos desde la última lectura

  // Ajusta la fecha UTC de la API a la zona horaria de Nicaragua (GMT-6)
  const ajustarZonaHoraria = (fechaUTC) => {
    const offsetHoras = 6; 
    return new Date(new Date(fechaUTC).getTime() - offsetHoras * 60 * 60 * 1000);
  };

  // Función para obtener lecturas de la API
  const fetchLecturas = async () => {
    try {
      const res = await fetch("https://mq135.onrender.com/api/lectura"); // Llama a la API
      const data = await res.json();

      if (data.length > 0) {
        // Ordena las lecturas por fecha (más recientes primero)
        const ordenadas = [...data].sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
        // Toma las últimas 20 y las invierte para mostrarlas en orden cronológico
        const ultimasLecturas = ordenadas.slice(0, 20).reverse();
        const ultima = ordenadas[0]; // Toma la lectura más reciente
        const fechaAjustada = ajustarZonaHoraria(ultima.fecha); // Ajusta la fecha
        const ahora = new Date();
        const diferenciaSegundos = Math.floor((ahora - fechaAjustada) / 1000); // Tiempo desde la última lectura

        // Actualiza los estados
        setLecturas(ultimasLecturas);
        setUltimaLectura({ ...ultima, fecha: fechaAjustada });
        setSegundosDesdeUltima(diferenciaSegundos);
        setEspOnline(diferenciaSegundos < 30); // Si pasaron menos de 30 seg, se considera "online"
      } else {
        // Si no hay lecturas, reinicia los estados
        setLecturas([]);
        setUltimaLectura(null);
        setEspOnline(false);
        setSegundosDesdeUltima(0);
      }
    } catch (error) {
      console.error("Error al obtener lecturas:", error);
      // Si hubo error en la API, resetea los estados
      setLecturas([]);
      setUltimaLectura(null);
      setEspOnline(false);
      setSegundosDesdeUltima(0);
    }
  };

  // Efecto para cargar lecturas al inicio y actualizar cada 5 segundos
  useEffect(() => {
    fetchLecturas(); // Obtiene lecturas al montar el componente
    const interval = setInterval(fetchLecturas, 5000); // Repite cada 5s
    return () => clearInterval(interval); // Limpia el intervalo cuando el componente se desmonta
  }, []);

  // Efecto para actualizar en tiempo real el contador de segundos desde la última lectura
  useEffect(() => {
    const timer = setInterval(() => {
      if (ultimaLectura) {
        const ahora = new Date();
        const diferencia = Math.floor((ahora - new Date(ultimaLectura.fecha)) / 1000);
        setSegundosDesdeUltima(diferencia);
        setEspOnline(diferencia < 30); // Marca como offline si pasan más de 30s sin nueva lectura
      }
    }, 1000);
    return () => clearInterval(timer); // Limpia el intervalo al desmontar
  }, [ultimaLectura]);

  // Función para determinar la calidad del aire según el valor en ppm
  const calidadAire = (ppm) => {
    if (ppm <= 300) return { texto: "Bueno ✅", color: "#4CAF50" };   // Verde
    else if (ppm <= 600) return { texto: "Medio ⚠️", color: "#FF9800" }; // Naranja
    else return { texto: "Mala 🚨", color: "#F44336" };              // Rojo
  };

  // Función para mostrar el tiempo transcurrido en un formato más legible
  const formatoTiempo = (segundos) => {
    if (segundos < 60) return `${segundos} seg`; // Solo segundos
    if (segundos < 3600) return `${Math.floor(segundos / 60)} min ${segundos % 60} seg`; // Minutos + seg
    const horas = Math.floor(segundos / 3600);
    const minutos = Math.floor((segundos % 3600) / 60);
    return `${horas} h ${minutos} min`; // Horas + min
  };
}


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
