import React, { useEffect, useState } from "react";
import axios from "axios";
import { apiUrl } from "../config/apiConfig";
import NavbarAdmin from "../components/NavbarAdmin";
import Footer from "../components/Footer";

const CrudTestsAdos2 = () => {
  const [tests, setTests] = useState([]);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({
    id_paciente: "",
    fecha: "",
    modulo: "",
    id_especialista: "",
    diagnostico: "",
    total_punto: "",
  });
  const [showModal, setShowModal] = useState(false);

  const token = localStorage.getItem("token");

  const fetchTests = () => {
    axios
      .get(apiUrl("/api/admin/tests-ados"), {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setTests(res.data));
  };

  useEffect(fetchTests, []);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Solo permitir actualización: no se crean tests desde la UI
    if (!editId) {
      setShowModal(false);
      return;
    }
    axios
      .put(apiUrl(`/api/admin/tests-ados/${editId}`), form, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(() => {
        setEditId(null);
        setForm({
          id_paciente: "",
          fecha: "",
          modulo: "",
          id_especialista: "",
          diagnostico: "",
          total_punto: "",
        });
        setShowModal(false);
        fetchTests();
      })
      .catch((err) => {
        console.error(err);
        setShowModal(false);
      });
  };

  const handleEdit = (test) => {
    setEditId(test.id_ados);
    setForm(test);
    setShowModal(true);
  };
  // Eliminado: no se permite eliminar tests desde esta vista

  // Obtener fecha y hora actual en formato compatible con input[type="datetime-local"]
  const getNowForInput = () => {
    const now = new Date();
    now.setSeconds(0, 0); // Elimina los segundos y ms para compatibilidad
    const offset = now.getTimezoneOffset();
    const local = new Date(now.getTime() - offset * 60000);
    return local.toISOString().slice(0, 16);
  };
  const maxDateTime = getNowForInput();

  return (
    <div
      className="d-flex flex-column min-vh-100"
      style={{ background: "#a8dadc" }}
    >
      <NavbarAdmin />
      <div className="container py-4 flex-grow-1">
        <h2 className="mb-4">Tests ADOS-2</h2>
        {/* Agregar deshabilitado: solo edición permitida desde la tabla */}

        {/* Modal para edición (solo editar) */}
        {showModal && (
          <>
            <div className="modal d-block" tabIndex="-1" role="dialog">
              <div className="modal-dialog modal-lg" role="document">
                <div className="modal-content">
                  <form onSubmit={handleSubmit}>
                    <div className="modal-header">
                      <h5 className="modal-title">Editar Test ADOS-2</h5>
                      <button
                        type="button"
                        className="btn-close"
                        aria-label="Close"
                        onClick={() => {
                          setShowModal(false);
                          setEditId(null);
                        }}
                      />
                    </div>
                    <div className="modal-body">
                      <div className="row">
                        <div className="col-12 col-md-6 mb-3">
                          <label className="form-label">ID Paciente</label>
                          <input
                            className="form-control"
                            name="id_paciente"
                            placeholder="ID Paciente"
                            value={form.id_paciente}
                            onChange={handleChange}
                            required
                          />
                        </div>
                        <div className="col-12 col-md-6 mb-3">
                          <label className="form-label">Fecha</label>
                          <input
                            className="form-control"
                            name="fecha"
                            type="datetime-local"
                            max={maxDateTime}
                            value={form.fecha}
                            onChange={handleChange}
                            required
                          />
                        </div>
                        <div className="col-12 col-md-6 mb-3">
                          <label className="form-label">Módulo</label>
                          <input
                            className="form-control"
                            name="modulo"
                            placeholder="Módulo"
                            value={form.modulo}
                            onChange={handleChange}
                            required
                          />
                        </div>
                        <div className="col-12 col-md-6 mb-3">
                          <label className="form-label">ID Especialista</label>
                          <input
                            className="form-control"
                            name="id_especialista"
                            placeholder="ID Especialista"
                            value={form.id_especialista}
                            onChange={handleChange}
                          />
                        </div>
                        <div className="col-12 col-md-6 mb-3">
                          <label className="form-label">Diagnóstico</label>
                          <input
                            className="form-control"
                            name="diagnostico"
                            placeholder="Diagnóstico"
                            value={form.diagnostico}
                            onChange={handleChange}
                          />
                        </div>
                        <div className="col-12 col-md-6 mb-3">
                          <label className="form-label">Total Puntos</label>
                          <input
                            className="form-control"
                            name="total_punto"
                            type="number"
                            placeholder="Total Puntos"
                            value={form.total_punto}
                            onChange={handleChange}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="modal-footer">
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => {
                          setShowModal(false);
                          setEditId(null);
                        }}
                      >
                        Cancelar
                      </button>
                      <button type="submit" className="btn btn-success">
                        Actualizar
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
            <div className="modal-backdrop show" />
          </>
        )}
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
                  ID Paciente
                </th>
                <th
                  style={{
                    position: "sticky",
                    top: 0,
                    zIndex: 2,
                    background: "#cfe8e9",
                  }}
                >
                  Fecha
                </th>
                <th
                  style={{
                    position: "sticky",
                    top: 0,
                    zIndex: 2,
                    background: "#cfe8e9",
                  }}
                >
                  Módulo
                </th>
                <th
                  style={{
                    position: "sticky",
                    top: 0,
                    zIndex: 2,
                    background: "#cfe8e9",
                  }}
                >
                  ID Especialista
                </th>
                <th
                  style={{
                    position: "sticky",
                    top: 0,
                    zIndex: 2,
                    background: "#cfe8e9",
                  }}
                >
                  Diagnóstico
                </th>
                <th
                  style={{
                    position: "sticky",
                    top: 0,
                    zIndex: 2,
                    background: "#cfe8e9",
                  }}
                >
                  Total Puntos
                </th>
                <th
                  style={{
                    position: "sticky",
                    top: 0,
                    zIndex: 2,
                    background: "#cfe8e9",
                  }}
                >
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {tests.map((t) => (
                <tr key={t.id_ados}>
                  <td>{t.id_ados}</td>
                  <td>{t.id_paciente}</td>
                  <td>{t.fecha}</td>
                  <td>{t.modulo}</td>
                  <td>{t.id_especialista}</td>
                  <td>{t.diagnostico}</td>
                  <td>{t.total_punto}</td>
                  <td>
                    <button
                      className="btn btn-warning btn-sm me-2"
                      onClick={() => handleEdit(t)}
                    >
                      Editar
                    </button>
                    {/* Eliminado: no permitir eliminar desde esta vista */}
                  </td>
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

export default CrudTestsAdos2;
