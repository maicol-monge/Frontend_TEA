import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { apiUrl } from "../../config/apiConfig";
import NavbarAdmin from "../../components/NavbarAdmin";
import Footer from "../../components/Footer";

const FormUsuario = () => {
  const { id } = useParams(); // si existe, estamos editando
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [form, setForm] = useState({
    nombres: "",
    apellidos: "",
    direccion: "",
    telefono: "",
    correo: "",
    contrasena: "",
    privilegio: 1,
    imagen: "",
    estado: 1,
  });

  useEffect(() => {
    if (id) {
      axios
        .get(apiUrl("/api/admin/usuarios"), {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          const usuario = res.data.find((u) => u.id_usuario === parseInt(id));
          if (usuario) setForm({ ...usuario, contrasena: "" });
        });
    }
  }, [id]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (id) {
        await axios.put(apiUrl(`/api/admin/usuarios/${id}`), form, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert("Usuario actualizado correctamente");
      } else {
        await axios.post(apiUrl("/api/admin/usuarios"), form, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert("Usuario creado correctamente");
      }
      navigate("/admin/usuarios");
    } catch (err) {
      console.error("Error al guardar usuario:", err);
      alert("Error al guardar usuario");
    }
  };

  return (
    <div
      className="d-flex flex-column min-vh-100"
      style={{ background: "#a8dadc" }}
    >
      <NavbarAdmin />
      <div className="container py-4 flex-grow-1">
        <h2>{id ? "Editar Usuario" : "Nuevo Usuario"}</h2>
        <form className="row g-2" onSubmit={handleSubmit}>
          <div className="col-md-6 col-lg-4">
            <input
              className="form-control"
              name="nombres"
              placeholder="Nombres"
              value={form.nombres}
              onChange={handleChange}
              required
            />
          </div>
          <div className="col-md-6 col-lg-4">
            <input
              className="form-control"
              name="apellidos"
              placeholder="Apellidos"
              value={form.apellidos}
              onChange={handleChange}
              required
            />
          </div>
          <div className="col-md-6 col-lg-4">
            <input
              className="form-control"
              name="direccion"
              placeholder="Dirección"
              value={form.direccion}
              onChange={handleChange}
              required
            />
          </div>
          <div className="col-md-6 col-lg-4">
            <input
              className="form-control"
              name="telefono"
              placeholder="Teléfono"
              value={form.telefono}
              onChange={handleChange}
              required
            />
          </div>
          <div className="col-md-6 col-lg-4">
            <input
              className="form-control"
              name="correo"
              placeholder="Correo"
              value={form.correo}
              onChange={handleChange}
              required
            />
          </div>
          {!id && (
            <div className="col-md-6 col-lg-4">
              <input
                className="form-control"
                name="contrasena"
                placeholder="Contraseña"
                type="password"
                value={form.contrasena}
                onChange={handleChange}
                required
              />
            </div>
          )}
          <div className="col-md-6 col-lg-4">
            <select
              className="form-control"
              name="privilegio"
              value={form.privilegio}
              onChange={handleChange}
            >
              <option value={0}>Especialista</option>
              <option value={1}>Paciente</option>
              <option value={3}>Admin</option>
            </select>
          </div>
          <div className="col-md-6 col-lg-4">
            <input
              className="form-control"
              name="imagen"
              placeholder="URL Imagen"
              value={form.imagen}
              onChange={handleChange}
            />
          </div>
          <div className="col-md-6 col-lg-4">
            <select
              className="form-control"
              name="estado"
              value={form.estado}
              onChange={handleChange}
            >
              <option value={1}>Activo</option>
              <option value={0}>Inactivo</option>
            </select>
          </div>
          <div className="col-12 d-flex gap-3 mt-3">
            <button className="btn btn-success" type="submit">
              {id ? "Actualizar" : "Crear"}
            </button>
            <button
              className="btn btn-secondary"
              type="button"
              onClick={() => navigate("/admin/usuarios")}
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
      <Footer />
    </div>
  );
};

export default FormUsuario;
