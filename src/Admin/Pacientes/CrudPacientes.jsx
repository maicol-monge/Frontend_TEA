import React, { useEffect, useState } from "react";
import axios from "axios";
import { apiUrl } from "../../config/apiConfig";
import NavbarAdmin from "../../components/NavbarAdmin";
import Footer from "../../components/Footer";

const CrudPacientes = () => {
  const [pacientes, setPacientes] = useState([]);
  const [form, setForm] = useState({
    id_usuario: "",
    fecha_nacimiento: "",
    sexo: "M",
  });
  const [editId, setEditId] = useState(null);

  const token = localStorage.getItem("token");

  const fetchPacientes = () => {
    axios
      .get(apiUrl("/api/admin/pacientes"), {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setPacientes(res.data));
  };

  useEffect(fetchPacientes, []);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editId) {
      axios
        .put(apiUrl(`/api/admin/pacientes/${editId}`), form, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then(() => {
          setEditId(null);
          setForm({ id_usuario: "", fecha_nacimiento: "", sexo: "M" });
          fetchPacientes();
        });
    } else {
      axios
        .post(apiUrl("/api/admin/pacientes"), form, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then(() => {
          setForm({ id_usuario: "", fecha_nacimiento: "", sexo: "M" });
          fetchPacientes();
        });
    }
  };

  const handleEdit = (paciente) => {
    setEditId(paciente.id_paciente);
    setForm(paciente);
  };

  const handleDelete = (id) =>
    window.confirm("¿Eliminar paciente?") &&
    axios
      .delete(apiUrl(`/api/admin/pacientes/${id}`), {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(fetchPacientes);

  return (
    <div
      className="d-flex flex-column min-vh-100"
      style={{ background: "#a8dadc" }}
    >
      <NavbarAdmin />
      <div className="container py-4 flex-grow-1">
        <h2 className="mb-4">Pacientes</h2>
        <form className="row g-2 mb-4" onSubmit={handleSubmit}>
          <div className="col-12 col-md-4">
            <input
              className="form-control"
              name="id_usuario"
              placeholder="ID Usuario"
              value={form.id_usuario}
              onChange={handleChange}
              required
            />
          </div>
          <div className="col-12 col-md-4">
            <input
              className="form-control"
              name="fecha_nacimiento"
              type="date"
              value={form.fecha_nacimiento}
              onChange={handleChange}
              required
            />
          </div>
          <div className="col-12 col-md-2">
            <select
              className="form-control"
              name="sexo"
              value={form.sexo}
              onChange={handleChange}
            >
              <option value="M">Masculino</option>
              <option value="F">Femenino</option>
            </select>
          </div>
          <div className="col-12 col-md-2 d-flex gap-2">
            <button className="btn btn-success w-100" type="submit">
              {editId ? "Actualizar" : "Crear"}
            </button>
            {editId && (
              <button
                className="btn btn-secondary w-100"
                type="button"
                onClick={() => {
                  setEditId(null);
                  setForm({ id_usuario: "", fecha_nacimiento: "", sexo: "M" });
                }}
              >
                Cancelar
              </button>
            )}
          </div>
        </form>
        <div className="table-responsive">
          <table className="table table-bordered table-hover">
            <thead className="table-primary">
              <tr>
                <th>ID</th>
                <th>ID Usuario</th>
                <th>Fecha Nacimiento</th>
                <th>Sexo</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {pacientes.map((p) => (
                <tr key={p.id_paciente}>
                  <td>{p.id_paciente}</td>
                  <td>{p.id_usuario}</td>
                  <td>{p.fecha_nacimiento}</td>
                  <td>{p.sexo}</td>
                  <td>
                    <button
                      className="btn btn-warning btn-sm me-2"
                      onClick={() => handleEdit(p)}
                    >
                      Editar
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDelete(p.id_paciente)}
                    >
                      Eliminar
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

export default CrudPacientes;
