import React, { useEffect, useState } from "react";
import axios from "axios";
import { apiUrl } from "../config/apiConfig";
import NavbarAdmin from "../components/NavbarAdmin";
import Footer from "../components/Footer";

const CrudActividades = () => {
  const [actividades, setActividades] = useState([]);

  const token = localStorage.getItem("token");

  const fetchActividades = () => {
    axios
      .get(apiUrl("/api/admin/actividades"), {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setActividades(res.data));
  };

  useEffect(fetchActividades, []);

  // Read-only view: no form/modal/action handlers

  return (
    <div
      className="d-flex flex-column min-vh-100"
      style={{ background: "#a8dadc" }}
    >
      <NavbarAdmin />
      <div className="container py-4 flex-grow-1">
        <h2 className="mb-4">Actividades ADOS</h2>
        {/* Vista de solo lectura: agregar/editar/eliminar deshabilitados */}

        {/* Modal y operaciones de edición/creación eliminadas: solo vista */}
        <div style={{ overflow: "auto", maxHeight: 420 }} className="mb-4">
          <table className="table table-bordered table-hover table-sm">
            <thead>
              <tr>
                <th
                  style={{
                    position: "sticky",
                    top: 0,
                    zIndex: 2,
                    background: "#cfe8e9",
                  }}
                >
                  ID
                </th>
                <th
                  style={{
                    position: "sticky",
                    top: 0,
                    zIndex: 2,
                    background: "#cfe8e9",
                  }}
                >
                  ID ADOS
                </th>
                <th
                  style={{
                    position: "sticky",
                    top: 0,
                    zIndex: 2,
                    background: "#cfe8e9",
                  }}
                >
                  Nombre
                </th>
                <th
                  style={{
                    position: "sticky",
                    top: 0,
                    zIndex: 2,
                    background: "#cfe8e9",
                  }}
                >
                  Observación
                </th>
                <th
                  style={{
                    position: "sticky",
                    top: 0,
                    zIndex: 2,
                    background: "#cfe8e9",
                  }}
                >
                  Puntuación
                </th>
                {/* Acciones deshabilitadas */}
              </tr>
            </thead>
            <tbody>
              {actividades.map((a) => (
                <tr key={a.id_actividad}>
                  <td>{a.id_actividad}</td>
                  <td>{a.id_ados}</td>
                  <td>{a.nombre_actividad}</td>
                  <td>{a.observacion}</td>
                  <td>{a.puntuacion}</td>
                  {/* Acciones deshabilitadas */}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CrudActividades;
