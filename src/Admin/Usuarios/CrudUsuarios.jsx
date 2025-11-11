import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { apiUrl } from "../../config/apiConfig";
import NavbarAdmin from "../../components/NavbarAdmin";
import Footer from "../../components/Footer";
import Swal from "sweetalert2";

const CrudUsuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  // filtros de UI
  const [searchName, setSearchName] = useState("");
  const [privilegioFilter, setPrivilegioFilter] = useState(""); // "" = todos, otherwise '0'|'1'|'3'
  const [estadoFilter, setEstadoFilter] = useState(""); // "" = todos, otherwise '1'|'0'
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const fetchUsuarios = useCallback(() => {
    axios
      .get(apiUrl("/api/admin/usuarios"), {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setUsuarios(res.data))
      .catch((err) => console.error("Error al cargar usuarios:", err));
  }, [token]);

  useEffect(() => {
    fetchUsuarios();
  }, [fetchUsuarios]);

  // Aplicar filtros en memoria antes de renderizar
  const filteredUsuarios = usuarios.filter((u) => {
    const fullName = `${u.nombres || ""} ${u.apellidos || ""}`.toLowerCase();
    const search = searchName.trim().toLowerCase();
    const matchesSearch = !search || fullName.includes(search);
    const matchesPrivilegio =
      !privilegioFilter || String(u.privilegio) === String(privilegioFilter);
    const matchesEstado =
      !estadoFilter || String(u.estado) === String(estadoFilter);
    return matchesSearch && matchesPrivilegio && matchesEstado;
  });

  const handleToggleEstado = async (u) => {
    const nuevoEstado = u.estado === 1 ? 0 : 1;
    const accion = nuevoEstado === 1 ? "activar" : "inactivar";
    const res = await Swal.fire({
      title: `¿Desea ${accion} este usuario?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: `Sí, ${accion}`,
      cancelButtonText: "Cancelar",
    });
    if (!res.isConfirmed) return;
    try {
      const payload = {
        nombres: u.nombres,
        apellidos: u.apellidos,
        direccion: u.direccion,
        telefono: u.telefono,
        correo: u.correo,
        privilegio: u.privilegio,
        imagen: u.imagen,
        estado: nuevoEstado,
      };
      await axios.put(apiUrl(`/api/admin/usuarios/${u.id_usuario}`), payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await Swal.fire({
        icon: "success",
        title: "Actualizado",
        text: nuevoEstado === 1 ? "Usuario activado" : "Usuario inactivado",
        timer: 1400,
        showConfirmButton: false,
      });
      fetchUsuarios();
    } catch (err) {
      const message = err?.response?.data?.message || "Error al cambiar estado";
      Swal.fire({ icon: "error", title: "Error", text: message });
    }
  };

  return (
    <div
      className="d-flex flex-column min-vh-100"
      style={{ background: "#a8dadc" }}
    >
      <NavbarAdmin />
      <div className="container py-4 flex-grow-1">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2>Usuarios</h2>
          <button
            className="btn btn-success"
            onClick={() => navigate("/admin/usuarios/nuevo")}
          >
            + Nuevo Usuario
          </button>
        </div>

        {/* filtros: búsqueda por nombre, privilegio y estado */}
        <div className="row g-2 mb-3">
          <div className="col-12 col-md-5">
            <input
              type="search"
              className="form-control"
              placeholder="Buscar por nombre o apellido"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
            />
          </div>
          <div className="col-6 col-md-3">
            <select
              className="form-control"
              value={privilegioFilter}
              onChange={(e) => setPrivilegioFilter(e.target.value)}
            >
              <option value="">Todos los privilegios</option>
              <option value="3">Admin</option>
              <option value="1">Paciente</option>
              <option value="0">Especialista</option>
            </select>
          </div>
          <div className="col-6 col-md-2">
            <select
              className="form-control"
              value={estadoFilter}
              onChange={(e) => setEstadoFilter(e.target.value)}
            >
              <option value="">Todos los estados</option>
              <option value="1">Activo</option>
              <option value="0">Inactivo</option>
            </select>
          </div>
          <div className="col-12 col-md-2">
            <button
              type="button"
              className="btn btn-secondary w-100"
              onClick={() => {
                setSearchName("");
                setPrivilegioFilter("");
                setEstadoFilter("");
              }}
            >
              Limpiar
            </button>
          </div>
        </div>

        <div className="table-responsive">
          {/* Use Bootstrap utilities for internal scroll: overflow-auto + inline maxHeight */}
          <div className="overflow-auto" style={{ maxHeight: "420px" }}>
            <table className="table table-bordered table-hover">
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
                    Nombres
                  </th>
                  <th
                    style={{
                      position: "sticky",
                      top: 0,
                      zIndex: 2,
                      background: "#cfe8e9",
                    }}
                  >
                    Apellidos
                  </th>
                  <th
                    style={{
                      position: "sticky",
                      top: 0,
                      zIndex: 2,
                      background: "#cfe8e9",
                    }}
                  >
                    Correo
                  </th>
                  <th
                    style={{
                      position: "sticky",
                      top: 0,
                      zIndex: 2,
                      background: "#cfe8e9",
                    }}
                  >
                    Privilegio
                  </th>
                  <th
                    style={{
                      position: "sticky",
                      top: 0,
                      zIndex: 2,
                      background: "#cfe8e9",
                    }}
                  >
                    Estado
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
                {filteredUsuarios.map((u) => (
                  <tr key={u.id_usuario}>
                    <td>{u.nombres}</td>
                    <td>{u.apellidos}</td>
                    <td>{u.correo}</td>
                    <td>
                      {u.privilegio === 0
                        ? "Especialista"
                        : u.privilegio === 1
                        ? "Paciente"
                        : "Admin"}
                    </td>
                    <td>{u.estado === 1 ? "Activo" : "Inactivo"}</td>
                    <td>
                      <button
                        className="btn btn-warning btn-sm me-2"
                        onClick={() =>
                          navigate(`/admin/usuarios/editar/${u.id_usuario}`)
                        }
                      >
                        Editar
                      </button>
                      <button
                        className={`btn btn-sm ${
                          u.estado === 1
                            ? "btn-outline-danger"
                            : "btn-outline-success"
                        }`}
                        onClick={() => handleToggleEstado(u)}
                      >
                        {u.estado === 1 ? "Inactivar" : "Activar"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CrudUsuarios;
