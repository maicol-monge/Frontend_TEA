import React from "react";
import { apiUrl } from "../config/apiConfig";

const DescargarAdiR = ({ id_adir }) => {
  const descargarPDF = async () => {
    const token = localStorage.getItem("token");
    const response = await fetch(
      apiUrl(`/api/adir/pdf/${id_adir}`),
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (!response.ok) {
      alert("No se pudo descargar el PDF");
      return;
    }
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ADI-R_${id_adir}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  };

  return (
    <button
      onClick={descargarPDF}
      className="btn btn-outline-primary mt-2"
      style={{ borderRadius: 20, fontWeight: "bold" }}
      title="Generar y descargar resultados ADI-R"
    >
      Generar resultados
    </button>
  );
};

export default DescargarAdiR;