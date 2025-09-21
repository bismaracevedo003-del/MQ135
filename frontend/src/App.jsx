import { useEffect, useState } from "react";

export default function App() {
  const [lecturas, setLecturas] = useState([]);

  const fetchLecturas = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/lectura");
      const data = await res.json();
      setLecturas(data);
    } catch (error) {
      console.error("Error al obtener lecturas:", error);
    }
  };

  useEffect(() => {
    fetchLecturas();
    const interval = setInterval(fetchLecturas, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
      <h1>📊 Calidad del Aire</h1>
      {lecturas.length === 0 ? (
        <p>No hay lecturas aún.</p>
      ) : (
        <ul>
          {lecturas.map((l, i) => (
            <li key={i}>
              {l.valor.toFixed(2)} ppm - {new Date(l.fecha).toLocaleString()}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
