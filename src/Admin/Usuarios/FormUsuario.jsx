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
  const [errors, setErrors] = useState({
    nombres: "",
    apellidos: "",
    telefono: "",
    correo: "",
  });

  // Validaciones
  const nameRegex = /^[A-Za-zÀ-ÿ\s]+$/; // letras y espacios, soporta acentos
  const telefonoRegex = /^\d{4}-\d{4}$/; // 7090-1234
  const correoRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const validateField = (name, value) => {
    let error = "";
    if (name === "nombres" || name === "apellidos") {
      if (!value || value.trim() === "") {
        error = "Este campo es obligatorio";
      } else if (!nameRegex.test(value.trim())) {
        error = "Solo se permiten letras y espacios";
      }
    }
    if (name === "telefono") {
      if (!value || value.trim() === "") {
        error = "Este campo es obligatorio";
      } else if (!telefonoRegex.test(value.trim())) {
        error = "Formato inválido. Ej: 7090-1234";
      }
    }
    if (name === "correo") {
      if (!value || value.trim() === "") {
        error = "Este campo es obligatorio";
      } else if (!correoRegex.test(value.trim())) {
        error = "Correo con formato inválido";
      }
    }
    setErrors((prev) => ({ ...prev, [name]: error }));
    return error === "";
  };

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Si es telefono, formatear en tiempo real: solo dígitos, máximo 8, y agregar guion después de 4
    if (name === "telefono") {
      const digits = value.replace(/\D/g, "").slice(0, 8); // solo números, máximo 8
      const formatted =
        digits.length > 4 ? `${digits.slice(0, 4)}-${digits.slice(4)}` : digits;
      setForm({ ...form, telefono: formatted });
      validateField("telefono", formatted);
      return;
    }

    setForm({ ...form, [name]: value });
    // validar en tiempo real para los campos relevantes
    if (name === "nombres" || name === "apellidos") {
      validateField(name, value);
    }
    if (name === "correo") {
      validateField(name, value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Validar todos los campos antes de enviar
    const validNombres = validateField("nombres", form.nombres);
    const validApellidos = validateField("apellidos", form.apellidos);
    const validTelefono = validateField("telefono", form.telefono);
    const validCorreo = validateField("correo", form.correo);
    if (!validNombres || !validApellidos || !validTelefono || !validCorreo) {
      alert("Por favor corrija los errores en el formulario antes de enviar.");
      return;
    }
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
            {errors.nombres && (
              <div className="text-danger small mt-1">{errors.nombres}</div>
            )}
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
            {errors.apellidos && (
              <div className="text-danger small mt-1">{errors.apellidos}</div>
            )}
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
              placeholder="7090-1234"
              title="Formato: 7090-1234"
              pattern="\d{4}-\d{4}"
              value={form.telefono}
              onChange={handleChange}
              required
            />
            {errors.telefono && (
              <div className="text-danger small mt-1">{errors.telefono}</div>
            )}
          </div>
          <div className="col-md-6 col-lg-4">
            <input
              className="form-control"
              name="correo"
              placeholder="Correo"
              type="email"
              value={form.correo}
              onChange={handleChange}
              required
            />
            {errors.correo && (
              <div className="text-danger small mt-1">{errors.correo}</div>
            )}
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
