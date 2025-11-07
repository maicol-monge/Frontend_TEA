import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { apiUrl } from "../../config/apiConfig";
import NavbarAdmin from "../../components/NavbarAdmin";
import Footer from "../../components/Footer";
import Swal from "sweetalert2";

const FormPaciente = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [form, setForm] = useState({
    id_usuario: "",
    fecha_nacimiento: "",
    sexo: "M",
  });
  const [usuarios, setUsuarios] = useState([]);
  const [dobError, setDobError] = useState("");
  const [usuarioDisplay, setUsuarioDisplay] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userRes = await axios.get(apiUrl("/api/admin/usuarios"), {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsuarios(userRes.data);

        if (id) {
          const pacRes = await axios.get(apiUrl("/api/admin/pacientes"), {
            headers: { Authorization: `Bearer ${token}` },
          });
          const paciente = pacRes.data.find(
            (p) => p.id_paciente === parseInt(id)
          );
          if (paciente) {
            setForm(paciente);
            const u = userRes.data.find(
              (x) => x.id_usuario === paciente.id_usuario
            );
            if (u)
              setUsuarioDisplay(
                `${u.id_usuario} - ${u.nombres} ${u.apellidos} (${u.correo})`
              );
          }
        }
      } catch (err) {
        console.error("Error al cargar datos:", err);
      }
    };
    fetchData();
  }, [id]);

  // calcular límites de fecha: mínimo = hoy - 70 años, máximo = hoy - 60 días
  const today = new Date();
  const minDate = new Date(today);
  minDate.setFullYear(today.getFullYear() - 70);

  const maxDate = new Date(today);
  maxDate.setDate(today.getDate() - 60); // hoy menos 60 días

  const fmt = (d) => d.toISOString().slice(0, 10);
  const minDateStr = fmt(minDate);
  // const maxDateStr = fmt(maxDate);

  const validateFechaNacimiento = (value) => {
    if (!value) {
      setDobError("La fecha de nacimiento es obligatoria");
      return false;
    }

    const dob = new Date(value);
    const today = new Date();

    if (isNaN(dob.getTime())) {
      setDobError("Fecha inválida");
      return false;
    }

    // No puede ser futura
    if (dob > today) {
      setDobError("La fecha no puede ser futura");
      return false;
    }

    // Diferencia en días
    const diffMs = today.getTime() - dob.getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);

    if (diffDays < 60) {
      setDobError("Debe tener más de 60 días de nacido");
      return false;
    }

    // Diferencia en años
    let ageYears = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
      ageYears--;
    }

    if (ageYears > 70) {
      setDobError("La edad no puede ser mayor a 70 años");
      return false;
    }

    setDobError("");
    return true;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "fecha_nacimiento") {
      setForm({ ...form, fecha_nacimiento: value });
      validateFechaNacimiento(value);
      return;
    }
    setForm({ ...form, [name]: value });
  };

  const displayForUser = (u) =>
    `${u.id_usuario} - ${u.nombres} ${u.apellidos} (${u.correo})`;

  const handleUsuarioDisplayChange = (e) => {
    const value = e.target.value;
    setUsuarioDisplay(value);
    const match = usuarios.find((u) => displayForUser(u) === value);
    if (match) {
      setForm((prev) => ({ ...prev, id_usuario: match.id_usuario }));
    } else {
      setForm((prev) => ({ ...prev, id_usuario: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.id_usuario) {
      await Swal.fire({
        icon: "warning",
        title: "Usuario requerido",
        text: "Por favor seleccione un usuario válido de la lista",
      });
      return;
    }

    // Validación final estricta antes de enviar
    const fechaValida = validateFechaNacimiento(form.fecha_nacimiento);
    if (!fechaValida) {
      await Swal.fire({
        icon: "error",
        title: "Fecha inválida",
        text: "Debe tener más de 60 días y menos de 70 años de edad.",
      });
      return;
    }

    try {
      if (id) {
        await axios.put(apiUrl(`/api/admin/pacientes/${id}`), form, {
          headers: { Authorization: `Bearer ${token}` },
        });
        await Swal.fire({
          icon: "success",
          title: "Paciente actualizado",
          text: "El paciente fue actualizado correctamente",
          timer: 1600,
          showConfirmButton: false,
        });
      } else {
        await axios.post(apiUrl("/api/admin/pacientes"), form, {
          headers: { Authorization: `Bearer ${token}` },
        });
        await Swal.fire({
          icon: "success",
          title: "Paciente creado",
          text: "El paciente fue creado correctamente",
          timer: 1600,
          showConfirmButton: false,
        });
      }
      navigate("/admin/pacientes");
    } catch (err) {
      console.error("Error al guardar paciente:", err);
      const message =
        err?.response?.data?.message || "Error al guardar paciente";
      await Swal.fire({ icon: "error", title: "Error", text: message });
    }
  };

  return (
    <div
      className="d-flex flex-column min-vh-100"
      style={{ background: "#a8dadc" }}
    >
      <NavbarAdmin />
      <div className="container py-4 flex-grow-1">
        <h2>{id ? "Editar Paciente" : "Nuevo Paciente"}</h2>

        <form className="row g-3" onSubmit={handleSubmit}>
          <div className="col-md-6">
            <label className="form-label">Usuario Asociado</label>
            <input
              list="usuarios-list"
              className="form-control"
              name="usuarioDisplay"
              value={usuarioDisplay}
              onChange={handleUsuarioDisplayChange}
              placeholder="Escribe para buscar usuario..."
              required
            />
            <datalist id="usuarios-list">
              {usuarios.map((u) => (
                <option key={u.id_usuario} value={displayForUser(u)} />
              ))}
            </datalist>
          </div>

          <div className="col-md-3">
            <label className="form-label">Fecha de Nacimiento</label>
            <input
              className="form-control"
              name="fecha_nacimiento"
              type="date"
              value={form.fecha_nacimiento}
              onChange={handleChange}
              min={minDateStr}
              max={fmt(today)} // se deja hasta hoy, pero validamos manualmente los 60 días
              required
            />
            {dobError && (
              <div className="text-danger small mt-1">{dobError}</div>
            )}
          </div>

          <div className="col-md-3">
            <label className="form-label">Sexo</label>
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

          <div className="col-12 d-flex gap-3 mt-3">
            <button className="btn btn-success" type="submit">
              {id ? "Actualizar" : "Crear"}
            </button>
            <button
              className="btn btn-secondary"
              type="button"
              onClick={() => navigate("/admin/pacientes")}
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

export default FormPaciente;
