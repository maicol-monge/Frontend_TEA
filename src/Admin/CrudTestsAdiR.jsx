import React, { useEffect, useState } from "react";
import axios from "axios";
import { apiUrl } from "../config/apiConfig";
import NavbarAdmin from "../components/NavbarAdmin";
import Footer from "../components/Footer";

const CrudTestsAdiR = () => {
  const [tests, setTests] = useState([]);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({
    id_paciente: "",
    id_especialista: "",
    fecha: "",
    diagnostico: "",
  });
  const [showModal, setShowModal] = useState(false);

  const token = localStorage.getItem("token");

  // Función para obtener la fecha y hora actual en formato compatible con input[type="datetime-local"]
  const getNowForInput = () => {
    const now = new Date();
    now.setSeconds(0, 0);
    const offset = now.getTimezoneOffset();
    const local = new Date(now.getTime() - offset * 60000);
    return local.toISOString().slice(0, 16);
  };
  const maxDateTime = getNowForInput();

  const fetchTests = () => {
    axios
      .get(apiUrl("/api/admin/tests-adir"), {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setTests(res.data));
  };

  useEffect(fetchTests, []);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Solo actualización (edición) permitida desde el modal
    if (!editId) {
      setShowModal(false);
      return;
    }
    axios
      .put(apiUrl(`/api/admin/tests-adir/${editId}`), form, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(() => {
        setEditId(null);
        setForm({
          id_paciente: "",
          id_especialista: "",
          fecha: "",
          diagnostico: "",
        });
        setShowModal(false);
        fetchTests();
      });
  };

  const handleEdit = (test) => {
    setEditId(test.id_adir);
    setForm(test);
    setShowModal(true);
  };

  // Eliminado: no se permite eliminar tests desde esta vista

  return (
    <div
      className="d-flex flex-column min-vh-100"
      style={{ background: "#a8dadc" }}
    >
      <NavbarAdmin />
      <div className="container py-4 flex-grow-1">
        <h2 className="mb-4">Tests ADI-R</h2>
        {showModal && (
          <>
            {/* Render backdrop as sibling to avoid covering the modal */}
            <div className="modal-backdrop show" />
            <div
              className="modal d-block"
              tabIndex="-1"
              role="dialog"
              style={{ zIndex: 1052 }}
            >
              <div className="modal-dialog" role="document">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">Editar Test ADI-R</h5>
                    <button
                      type="button"
                      className="btn-close"
                      aria-label="Close"
                      onClick={() => {
                        setShowModal(false);
                        setEditId(null);
                        setForm({
                          id_paciente: "",
                          id_especialista: "",
                          fecha: "",
                          diagnostico: "",
                        });
                      }}
                    />
                  </div>
                  <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                      <div className="row g-2">
                        <div className="col-12 col-md-6">
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
                        <div className="col-12 col-md-6">
                          <label className="form-label">ID Especialista</label>
                          <input
                            className="form-control"
                            name="id_especialista"
                            placeholder="ID Especialista"
                            value={form.id_especialista}
                            onChange={handleChange}
                          />
                        </div>
                        <div className="col-12 col-md-6">
                          <label className="form-label">Fecha</label>
                          <input
                            className="form-control"
                            name="fecha"
                            type="datetime-local"
                            value={form.fecha}
                            onChange={handleChange}
                            required
                            max={maxDateTime}
                          />
                        </div>
                        <div className="col-12 col-md-6">
                          <label className="form-label">Diagnóstico</label>
                          <input
                            className="form-control"
                            name="diagnostico"
                            placeholder="Diagnóstico"
                            value={form.diagnostico}
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
                          setForm({
                            id_paciente: "",
                            id_especialista: "",
                            fecha: "",
                            diagnostico: "",
                          });
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
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {tests.map((t) => (
                <tr key={t.id_adir}>
                  <td>{t.id_adir}</td>
                  <td>{t.id_paciente}</td>
                  <td>{t.id_especialista}</td>
                  <td>{t.fecha}</td>
                  <td>{t.diagnostico}</td>
                  <td>
                    <button
                      className="btn btn-warning btn-sm"
                      onClick={() => handleEdit(t)}
                    >
                      Editar
                    </button>
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

export default CrudTestsAdiR;
