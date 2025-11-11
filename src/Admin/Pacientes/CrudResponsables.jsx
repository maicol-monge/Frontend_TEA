import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import { apiUrl } from "../../config/apiConfig";
import NavbarAdmin from "../../components/NavbarAdmin";
import Footer from "../../components/Footer";

const PARENTESCOS = [
  "Madre",
  "Padre",
  "Tutor legal",
  "Abuelo/a",
  "Tío/Tía",
  "Hermano/a",
  "OTRO",
];

const maskPhone = (v) => {
  const d = (v || "").replace(/\D/g, "").slice(0, 8);
  if (d.length <= 4) return d;
  return d.slice(0, 4) + "-" + d.slice(4);
};
const maskId = (v) => {
  const d = (v || "").replace(/\D/g, "").slice(0, 9);
  if (d.length <= 8) return d;
  return d.slice(0, 8) + "-" + d.slice(8);
};

const CrudResponsables = () => {
  const { id_paciente } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  // Detalle paciente
  const [paciente, setPaciente] = useState(null); // {id_paciente, fecha_nacimiento, sexo}
  const [usuario, setUsuario] = useState(null); // {nombres, apellidos, correo, telefono, direccion, imagen, estado}
  // Responsables
  const [responsables, setResponsables] = useState([]);
  const [loading, setLoading] = useState(false);

  // Form
  const [form, setForm] = useState({
    nombre: "",
    apellido: "",
    num_identificacion: "",
    parentesco: "",
    parentesco_otro: "",
    telefono: "",
    direccion: "",
    correo: "",
  });
  const [editId, setEditId] = useState(null);
  const [filterNombre, setFilterNombre] = useState("");

  // Cargar detalle (paciente + responsables)
  const fetchDetalle = useCallback(async () => {
    if (!id_paciente) return;
    setLoading(true);
    try {
      const res = await axios.get(
        apiUrl(`/api/admin/pacientes/${id_paciente}/detalle`),
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      // setPaciente(res.data.paciente);
      // setUsuario(res.data.usuario);
      // setResponsables(res.data.responsables_legales);
      setPaciente(res.data.paciente || {});
      setUsuario(res.data.usuario || {});
      setResponsables(
        Array.isArray(res.data.responsables_legales)
          ? res.data.responsables_legales
          : []
      );
    } catch (e) {
      console.error(e);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo cargar el detalle",
      });
    } finally {
      setLoading(false);
    }
  }, [id_paciente, token]);

  useEffect(() => {
    fetchDetalle();
  }, [fetchDetalle]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let v = value;
    if (name === "telefono") v = maskPhone(value);
    if (name === "num_identificacion") v = maskId(value);
    // Solo letras y espacios para nombre y apellido
    if (name === "nombre" || name === "apellido") {
      try {
        // usar Unicode property escapes cuando esté disponible
        v = value.replace(/[^^\p{L}\s]/gu, "");
      } catch {
        // fallback para entornos que no soporten \p{L}
        v = value.replace(/[^A-Za-zÀ-ÿ\s]/g, "");
      }
    }
    setForm((f) => ({ ...f, [name]: v }));
    if (name === "parentesco" && value !== "OTRO") {
      setForm((f) => ({ ...f, parentesco_otro: "" }));
    }
  };

  const limpiar = () => {
    setEditId(null);
    setForm({
      nombre: "",
      apellido: "",
      num_identificacion: "",
      parentesco: "",
      parentesco_otro: "",
      telefono: "",
      direccion: "",
      correo: "",
    });
  };

  const validar = () => {
    if (!paciente?.id_paciente) return "Paciente inválido";
    if (!form.nombre.trim()) return "Nombre requerido";
    // Validar caracteres: sólo letras y espacios
    try {
      if (!/^[\p{L}\s]+$/u.test(form.nombre.trim()))
        return "Nombre: sólo se permiten letras y espacios";
    } catch {
      if (!/^[A-Za-zÀ-ÿ\s]+$/.test(form.nombre.trim()))
        return "Nombre: sólo se permiten letras y espacios";
    }
    if (!form.apellido.trim()) return "Apellido requerido";
    try {
      if (!/^[\p{L}\s]+$/u.test(form.apellido.trim()))
        return "Apellido: sólo se permiten letras y espacios";
    } catch {
      if (!/^[A-Za-zÀ-ÿ\s]+$/.test(form.apellido.trim()))
        return "Apellido: sólo se permiten letras y espacios";
    }
    if (form.num_identificacion.length !== 10)
      return "Identificación formato ########-#";
    if (!form.parentesco) return "Parentesco requerido";
    if (form.parentesco === "OTRO" && !form.parentesco_otro.trim())
      return "Especifique parentesco";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validar();
    if (err) {
      Swal.fire({ icon: "warning", title: "Validación", text: err });
      return;
    }
    const payload = {
      id_paciente: Number(paciente.id_paciente),
      nombre: form.nombre.trim(),
      apellido: form.apellido.trim(),
      num_identificacion: form.num_identificacion.trim(),
      parentesco:
        form.parentesco === "OTRO"
          ? form.parentesco_otro.trim()
          : form.parentesco.trim(),
      telefono: form.telefono.trim() || null,
      direccion: form.direccion.trim() || null,
      correo: form.correo.trim() || null,
    };
    try {
      if (editId) {
        await axios.put(
          apiUrl(`/api/admin/responsables-legales/${editId}`),
          payload,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        Swal.fire({
          icon: "success",
          title: "Actualizado",
          timer: 1200,
          showConfirmButton: false,
        });
      } else {
        await axios.post(apiUrl("/api/admin/responsables-legales"), payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        Swal.fire({
          icon: "success",
          title: "Creado",
          timer: 1200,
          showConfirmButton: false,
        });
      }
      limpiar();
      fetchDetalle();
    } catch (err) {
      const msg = err?.response?.data?.message || "Error al guardar";
      Swal.fire({ icon: "error", title: "Error", text: msg });
    }
  };

  const handleEdit = (r) => {
    setEditId(r.id_responsable_legal);
    setForm({
      nombre: r.nombre,
      apellido: r.apellido,
      num_identificacion: r.num_identificacion,
      parentesco: PARENTESCOS.includes(r.parentesco) ? r.parentesco : "OTRO",
      parentesco_otro: PARENTESCOS.includes(r.parentesco) ? "" : r.parentesco,
      telefono: r.telefono || "",
      direccion: r.direccion || "",
      correo: r.correo || "",
    });
  };

  const handleDelete = async (id) => {
    // Bloquea si es el único (debe existir al menos uno)
    if (responsables.length <= 1) {
      Swal.fire({
        icon: "info",
        title: "No permitido",
        text: "Debe existir al menos un responsable legal.",
      });
      return;
    }
    const res = await Swal.fire({
      title: "¿Eliminar responsable?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí",
      cancelButtonText: "Cancelar",
    });
    if (!res.isConfirmed) return;
    try {
      await axios.delete(apiUrl(`/api/admin/responsables-legales/${id}`), {
        headers: { Authorization: `Bearer ${token}` },
      });
      Swal.fire({
        icon: "success",
        title: "Eliminado",
        timer: 1200,
        showConfirmButton: false,
      });
      fetchDetalle();
    } catch (err) {
      const msg = err?.response?.data?.message || "Error al eliminar";
      Swal.fire({ icon: "error", title: "Error", text: msg });
    }
  };

  const filtered = responsables.filter((r) => {
    const name = `${r.nombre} ${r.apellido}`.toLowerCase();
    const term = filterNombre.trim().toLowerCase();
    return !term || name.includes(term);
  });

  return (
    <div
      className="d-flex flex-column min-vh-100"
      style={{ background: "#a8dadc" }}
    >
      <NavbarAdmin />
      <div className="container py-4 flex-grow-1">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2>Responsables Legales</h2>
          <button
            className="btn btn-secondary"
            onClick={() => navigate("/admin/pacientes")}
          >
            Volver
          </button>
        </div>

        {/* Card Paciente */}
        <div className="card mb-4 shadow-sm">
          <div className="card-body d-flex flex-column flex-md-row gap-3">
            <div style={{ width: 140 }} className="text-center">
              {usuario?.imagen ? (
                <img
                  src={usuario.imagen}
                  alt="Imagen"
                  style={{
                    width: 140,
                    height: 140,
                    objectFit: "cover",
                    borderRadius: "8px",
                    border: "2px solid #457b9d",
                  }}
                />
              ) : (
                <div
                  style={{
                    width: 140,
                    height: 140,
                    borderRadius: 8,
                    background: "#e2e8f0",
                  }}
                  className="d-flex align-items-center justify-content-center text-muted"
                >
                  Sin imagen
                </div>
              )}
            </div>
            <div className="flex-grow-1">
              <h5 className="mb-1">
                {usuario
                  ? `${usuario.nombres} ${usuario.apellidos}`
                  : "Paciente"}
              </h5>
              <div className="small mb-2">
                <span className="badge bg-primary me-2">
                  ID Paciente: {paciente?.id_paciente}
                </span>
                <span className="badge bg-info me-2">
                  {paciente?.sexo === "M" ? "Masculino" : "Femenino"}
                </span>
                <span className="badge bg-secondary">
                  Fecha nac: {paciente?.fecha_nacimiento}
                </span>
              </div>
              <p className="mb-1">
                <strong>Correo:</strong> {usuario?.correo || "-"}
              </p>
              <p className="mb-1">
                <strong>Teléfono:</strong> {usuario?.telefono || "-"}
              </p>
              <p className="mb-1">
                <strong>Dirección:</strong> {usuario?.direccion || "-"}
              </p>
              <p className="mb-0">
                <strong>Responsables:</strong> {responsables.length}
              </p>
            </div>
          </div>
        </div>

        {/* Form Responsable */}
        <form className="row g-2 mb-3" onSubmit={handleSubmit}>
          <div className="col-12 col-md-3">
            <label className="form-label">Nombre</label>
            <input
              className="form-control"
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
              required
            />
          </div>
          <div className="col-12 col-md-3">
            <label className="form-label">Apellido</label>
            <input
              className="form-control"
              name="apellido"
              value={form.apellido}
              onChange={handleChange}
              required
            />
          </div>
          <div className="col-12 col-md-3">
            <label className="form-label">Identificación</label>
            <input
              className="form-control"
              name="num_identificacion"
              value={form.num_identificacion}
              onChange={handleChange}
              maxLength={10}
              placeholder="########-#"
              required
            />
          </div>
          <div className="col-12 col-md-3">
            <label className="form-label">Parentesco</label>
            <select
              className="form-control"
              name="parentesco"
              value={form.parentesco}
              onChange={handleChange}
              required
            >
              <option value="">Seleccione...</option>
              {PARENTESCOS.map((p) => (
                <option key={p} value={p}>
                  {p === "OTRO" ? "Otro" : p}
                </option>
              ))}
            </select>
          </div>
          {form.parentesco === "OTRO" && (
            <div className="col-12 col-md-3">
              <label className="form-label">Especifique</label>
              <input
                className="form-control"
                name="parentesco_otro"
                value={form.parentesco_otro}
                onChange={handleChange}
                required
              />
            </div>
          )}
          <div className="col-12 col-md-3">
            <label className="form-label">Teléfono</label>
            <input
              className="form-control"
              name="telefono"
              value={form.telefono}
              onChange={handleChange}
              maxLength={9}
              placeholder="####-####"
            />
          </div>
          <div className="col-12 col-md-3">
            <label className="form-label">Correo</label>
            <input
              className="form-control"
              name="correo"
              type="email"
              value={form.correo}
              onChange={handleChange}
              placeholder="opcional"
            />
          </div>
          <div className="col-12 col-md-3">
            <label className="form-label">Dirección</label>
            <input
              className="form-control"
              name="direccion"
              value={form.direccion}
              onChange={handleChange}
              placeholder="opcional"
            />
          </div>
          <div className="col-12 d-flex gap-2 mt-2">
            <button className="btn btn-success" type="submit">
              {editId ? "Actualizar" : "Crear"}
            </button>
            {editId && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={limpiar}
              >
                Cancelar
              </button>
            )}
          </div>
        </form>

        {/* Filtros internos */}
        <div className="row g-2 mb-2">
          <div className="col-12 col-md-4">
            <input
              className="form-control"
              placeholder="Filtrar por nombre/apellido"
              value={filterNombre}
              onChange={(e) => setFilterNombre(e.target.value)}
            />
          </div>
          <div className="col-6 col-md-2">
            <button
              className="btn btn-secondary w-100"
              onClick={() => setFilterNombre("")}
            >
              Limpiar
            </button>
          </div>
        </div>

        {/* Tabla */}
        <div className="table-responsive">
          <div className="overflow-auto" style={{ maxHeight: 420 }}>
            <table className="table table-bordered table-hover">
              <thead>
                <tr>
                  <th
                    style={{
                      position: "sticky",
                      top: 0,
                      background: "#cfe8e9",
                    }}
                  >
                    Nombre
                  </th>
                  <th
                    style={{
                      position: "sticky",
                      top: 0,
                      background: "#cfe8e9",
                    }}
                  >
                    Identificación
                  </th>
                  <th
                    style={{
                      position: "sticky",
                      top: 0,
                      background: "#cfe8e9",
                    }}
                  >
                    Parentesco
                  </th>
                  <th
                    style={{
                      position: "sticky",
                      top: 0,
                      background: "#cfe8e9",
                    }}
                  >
                    Teléfono
                  </th>
                  <th
                    style={{
                      position: "sticky",
                      top: 0,
                      background: "#cfe8e9",
                    }}
                  >
                    Correo
                  </th>
                  <th
                    style={{
                      position: "sticky",
                      top: 0,
                      background: "#cfe8e9",
                    }}
                  >
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan={6} className="text-center">
                      Cargando...
                    </td>
                  </tr>
                )}
                {!loading &&
                  filtered.map((r) => (
                    <tr key={r.id_responsable_legal}>
                      <td>
                        {r.nombre} {r.apellido}
                      </td>
                      <td>{r.num_identificacion}</td>
                      <td>{r.parentesco}</td>
                      <td>{r.telefono || "-"}</td>
                      <td>{r.correo || "-"}</td>
                      <td>
                        <button
                          className="btn btn-warning btn-sm me-2"
                          onClick={() => handleEdit(r)}
                        >
                          Editar
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDelete(r.id_responsable_legal)}
                          disabled={responsables.length <= 1}
                          title={
                            responsables.length <= 1
                              ? "Debe quedar al menos un responsable"
                              : ""
                          }
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                {!loading && filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center">
                      Sin resultados
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CrudResponsables;
