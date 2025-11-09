// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import { apiUrl } from "../config/apiConfig";
// import NavbarAdmin from "../components/NavbarAdmin";
// import Footer from "../components/Footer";

// const CrudUsuarios = () => {
//     const [usuarios, setUsuarios] = useState([]);
//     const [form, setForm] = useState({
//         nombres: "",
//         apellidos: "",
//         direccion: "",
//         telefono: "",
//         correo: "",
//         contrasena: "",
//         privilegio: 1,
//         imagen: "",
//         estado: 1
//     });
//     const [editId, setEditId] = useState(null);

//     const token = localStorage.getItem("token");

//     const fetchUsuarios = () => {
//         axios.get(apiUrl('/api/admin/usuarios'), { headers: { Authorization: `Bearer ${token}` } })
//             .then(res => setUsuarios(res.data));
//     };

//     useEffect(fetchUsuarios, []);

//     const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

//     const handleSubmit = e => {
//         e.preventDefault();
//         if (editId) {
//             axios.put(apiUrl(`/api/admin/usuarios/${editId}`), form, { headers: { Authorization: `Bearer ${token}` } })
//                 .then(() => {
//                     setEditId(null);
//                     setForm({
//                         nombres: "",
//                         apellidos: "",
//                         direccion: "",
//                         telefono: "",
//                         correo: "",
//                         contrasena: "",
//                         privilegio: 1,
//                         imagen: "",
//                         estado: 1
//                     });
//                     fetchUsuarios();
//                 });
//         } else {
//             axios.post(apiUrl('/api/admin/usuarios'), form, { headers: { Authorization: `Bearer ${token}` } })
//                 .then(() => {
//                     setForm({
//                         nombres: "",
//                         apellidos: "",
//                         direccion: "",
//                         telefono: "",
//                         correo: "",
//                         contrasena: "",
//                         privilegio: 1,
//                         imagen: "",
//                         estado: 1
//                     });
//                     fetchUsuarios();
//                 });
//         }
//     };

//     const handleEdit = usuario => {
//         setEditId(usuario.id_usuario);
//         setForm({
//             nombres: usuario.nombres,
//             apellidos: usuario.apellidos,
//             direccion: usuario.direccion,
//             telefono: usuario.telefono,
//             correo: usuario.correo,
//             contrasena: "",
//             privilegio: usuario.privilegio,
//             imagen: usuario.imagen,
//             estado: usuario.estado
//         });
//     };

//     const handleDelete = id =>
//     window.confirm("¿Eliminar usuario?") &&
//     axios.delete(apiUrl(`/api/admin/usuarios/${id}`), { headers: { Authorization: `Bearer ${token}` } }).then(fetchUsuarios);

//     return (
//         <div className="d-flex flex-column min-vh-100" style={{ background: "#a8dadc" }}>
//             <NavbarAdmin />
//             <div className="container py-4 flex-grow-1">
//                 <h2 className="mb-4">Usuarios</h2>
//                 <form className="row g-2 mb-4" onSubmit={handleSubmit}>
//                     <div className="col-12 col-md-6 col-lg-3">
//                         <input className="form-control" name="nombres" placeholder="Nombres" value={form.nombres} onChange={handleChange} required />
//                     </div>
//                     <div className="col-12 col-md-6 col-lg-3">
//                         <input className="form-control" name="apellidos" placeholder="Apellidos" value={form.apellidos} onChange={handleChange} required />
//                     </div>
//                     <div className="col-12 col-md-6 col-lg-3">
//                         <input className="form-control" name="direccion" placeholder="Dirección" value={form.direccion} onChange={handleChange} required />
//                     </div>
//                     <div className="col-12 col-md-6 col-lg-3">
//                         <input className="form-control" name="telefono" placeholder="Teléfono" value={form.telefono} onChange={handleChange} required />
//                     </div>
//                     <div className="col-12 col-md-6 col-lg-3">
//                         <input className="form-control" name="correo" placeholder="Correo" value={form.correo} onChange={handleChange} required />
//                     </div>
//                     <div className="col-12 col-md-6 col-lg-3">
//                         <input className="form-control" name="contrasena" placeholder="Contraseña" value={form.contrasena} onChange={handleChange} type="password" required={!editId} />
//                     </div>
//                     <div className="col-12 col-md-6 col-lg-2">
//                         <select className="form-control" name="privilegio" value={form.privilegio} onChange={handleChange}>
//                             <option value={0}>Especialista</option>
//                             <option value={1}>Paciente</option>
//                             <option value={3}>Admin</option>
//                         </select>
//                     </div>
//                     <div className="col-12 col-md-6 col-lg-2">
//                         <input className="form-control" name="imagen" placeholder="URL Imagen" value={form.imagen} onChange={handleChange} />
//                     </div>
//                     <div className="col-12 col-md-6 col-lg-2">
//                         <select className="form-control" name="estado" value={form.estado} onChange={handleChange}>
//                             <option value={1}>Activo</option>
//                             <option value={0}>Inactivo</option>
//                         </select>
//                     </div>
//                     <div className="col-12 col-md-6 col-lg-2 d-flex gap-2">
//                         <button className="btn btn-success w-100" type="submit">{editId ? "Actualizar" : "Crear"}</button>
//                         {editId && (
//                             <button className="btn btn-secondary w-100" type="button" onClick={() => {
//                                 setEditId(null);
//                                 setForm({
//                                     nombres: "",
//                                     apellidos: "",
//                                     direccion: "",
//                                     telefono: "",
//                                     correo: "",
//                                     contrasena: "",
//                                     privilegio: 1,
//                                     imagen: "",
//                                     estado: 1
//                                 });
//                             }}>Cancelar</button>
//                         )}
//                     </div>
//                 </form>
//                 <div className="table-responsive">
//                     <table className="table table-bordered table-hover">
//                         <thead className="table-primary">
//                             <tr>
//                                 <th>ID</th>
//                                 <th>Nombres</th>
//                                 <th>Apellidos</th>
//                                 <th>Correo</th>
//                                 <th>Privilegio</th>
//                                 <th>Estado</th>
//                                 <th>Acciones</th>
//                             </tr>
//                         </thead>
//                         <tbody>
//                             {usuarios.map(u => (
//                                 <tr key={u.id_usuario}>
//                                     <td>{u.id_usuario}</td>
//                                     <td>{u.nombres}</td>
//                                     <td>{u.apellidos}</td>
//                                     <td>{u.correo}</td>
//                                     <td>{u.privilegio}</td>
//                                     <td>{u.estado === 1 ? "Activo" : "Inactivo"}</td>
//                                     <td>
//                                         <button className="btn btn-warning btn-sm me-2" onClick={() => handleEdit(u)}>Editar</button>
//                                         <button className="btn btn-danger btn-sm" onClick={() => handleDelete(u.id_usuario)}>Eliminar</button>
//                                     </td>
//                                 </tr>
//                             ))}
//                         </tbody>
//                     </table>
//                 </div>
//             </div>
//             <Footer />
//         </div>
//     );
// };

// export default CrudUsuarios;

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

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "¿Eliminar usuario?",
      text: "Esta acción eliminará el usuario permanentemente.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(apiUrl(`/api/admin/usuarios/${id}`), {
          headers: { Authorization: `Bearer ${token}` },
        });
        await Swal.fire({
          icon: "success",
          title: "Eliminado",
          text: "El usuario fue eliminado correctamente",
          timer: 1500,
          showConfirmButton: false,
        });
        fetchUsuarios();
      } catch (err) {
        console.error("Error al eliminar usuario:", err);
        const message =
          err?.response?.data?.message || "Error al eliminar usuario";
        await Swal.fire({ icon: "error", title: "Error", text: message });
      }
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
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDelete(u.id_usuario)}
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
      </div>
      <Footer />
    </div>
  );
};

export default CrudUsuarios;
