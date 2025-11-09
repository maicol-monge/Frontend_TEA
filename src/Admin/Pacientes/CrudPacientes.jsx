// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import { apiUrl } from "../../config/apiConfig";
// import NavbarAdmin from "../../components/NavbarAdmin";
// import Footer from "../../components/Footer";

// const CrudPacientes = () => {
//   const [pacientes, setPacientes] = useState([]);
//   const [form, setForm] = useState({
//     id_usuario: "",
//     fecha_nacimiento: "",
//     sexo: "M",
//   });
//   const [editId, setEditId] = useState(null);

//   const token = localStorage.getItem("token");

//   const fetchPacientes = () => {
//     axios
//       .get(apiUrl("/api/admin/pacientes"), {
//         headers: { Authorization: `Bearer ${token}` },
//       })
//       .then((res) => setPacientes(res.data));
//   };

//   useEffect(fetchPacientes, []);

//   const handleChange = (e) =>
//     setForm({ ...form, [e.target.name]: e.target.value });

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     if (editId) {
//       axios
//         .put(apiUrl(`/api/admin/pacientes/${editId}`), form, {
//           headers: { Authorization: `Bearer ${token}` },
//         })
//         .then(() => {
//           setEditId(null);
//           setForm({ id_usuario: "", fecha_nacimiento: "", sexo: "M" });
//           fetchPacientes();
//         });
//     } else {
//       axios
//         .post(apiUrl("/api/admin/pacientes"), form, {
//           headers: { Authorization: `Bearer ${token}` },
//         })
//         .then(() => {
//           setForm({ id_usuario: "", fecha_nacimiento: "", sexo: "M" });
//           fetchPacientes();
//         });
//     }
//   };

//   const handleEdit = (paciente) => {
//     setEditId(paciente.id_paciente);
//     setForm(paciente);
//   };

//   const handleDelete = (id) =>
//     window.confirm("¿Eliminar paciente?") &&
//     axios
//       .delete(apiUrl(`/api/admin/pacientes/${id}`), {
//         headers: { Authorization: `Bearer ${token}` },
//       })
//       .then(fetchPacientes);

//   return (
//     <div
//       className="d-flex flex-column min-vh-100"
//       style={{ background: "#a8dadc" }}
//     >
//       <NavbarAdmin />
//       <div className="container py-4 flex-grow-1">
//         <h2 className="mb-4">Pacientes</h2>
//         <form className="row g-2 mb-4" onSubmit={handleSubmit}>
//           <div className="col-12 col-md-4">
//             <input
//               className="form-control"
//               name="id_usuario"
//               placeholder="ID Usuario"
//               value={form.id_usuario}
//               onChange={handleChange}
//               required
//             />
//           </div>
//           <div className="col-12 col-md-4">
//             <input
//               className="form-control"
//               name="fecha_nacimiento"
//               type="date"
//               value={form.fecha_nacimiento}
//               onChange={handleChange}
//               required
//             />
//           </div>
//           <div className="col-12 col-md-2">
//             <select
//               className="form-control"
//               name="sexo"
//               value={form.sexo}
//               onChange={handleChange}
//             >
//               <option value="M">Masculino</option>
//               <option value="F">Femenino</option>
//             </select>
//           </div>
//           <div className="col-12 col-md-2 d-flex gap-2">
//             <button className="btn btn-success w-100" type="submit">
//               {editId ? "Actualizar" : "Crear"}
//             </button>
//             {editId && (
//               <button
//                 className="btn btn-secondary w-100"
//                 type="button"
//                 onClick={() => {
//                   setEditId(null);
//                   setForm({ id_usuario: "", fecha_nacimiento: "", sexo: "M" });
//                 }}
//               >
//                 Cancelar
//               </button>
//             )}
//           </div>
//         </form>
//         <div className="table-responsive">
//           <table className="table table-bordered table-hover">
//             <thead className="table-primary">
//               <tr>
//                 <th>ID</th>
//                 <th>ID Usuario</th>
//                 <th>Fecha Nacimiento</th>
//                 <th>Sexo</th>
//                 <th>Acciones</th>
//               </tr>
//             </thead>
//             <tbody>
//               {pacientes.map((p) => (
//                 <tr key={p.id_paciente}>
//                   <td>{p.id_paciente}</td>
//                   <td>{p.id_usuario}</td>
//                   <td>{p.fecha_nacimiento}</td>
//                   <td>{p.sexo}</td>
//                   <td>
//                     <button
//                       className="btn btn-warning btn-sm me-2"
//                       onClick={() => handleEdit(p)}
//                     >
//                       Editar
//                     </button>
//                     <button
//                       className="btn btn-danger btn-sm"
//                       onClick={() => handleDelete(p.id_paciente)}
//                     >
//                       Eliminar
//                     </button>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </div>
//       <Footer />
//     </div>
//   );
// };

// export default CrudPacientes;

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { apiUrl } from "../../config/apiConfig";
import NavbarAdmin from "../../components/NavbarAdmin";
import Footer from "../../components/Footer";
import Swal from "sweetalert2";

const CrudPacientes = () => {
  const [pacientes, setPacientes] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [searchName, setSearchName] = useState("");
  const [sexoFilter, setSexoFilter] = useState(""); // "" = todos, otherwise 'M'|'F'
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  // Cargar pacientes y usuarios
  const fetchData = async () => {
    try {
      const [pacRes, userRes] = await Promise.all([
        axios.get(apiUrl("/api/admin/pacientes"), {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(apiUrl("/api/admin/usuarios"), {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      setPacientes(pacRes.data);
      setUsuarios(userRes.data);
    } catch (err) {
      console.error("Error al cargar datos:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "¿Eliminar paciente?",
      text: "Esta acción eliminará el paciente permanentemente.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(apiUrl(`/api/admin/pacientes/${id}`), {
          headers: { Authorization: `Bearer ${token}` },
        });
        await Swal.fire({
          icon: "success",
          title: "Eliminado",
          text: "El paciente fue eliminado correctamente",
          timer: 1500,
          showConfirmButton: false,
        });
        fetchData();
      } catch (err) {
        console.error("Error al eliminar:", err);
        const message =
          err?.response?.data?.message || "Error al eliminar paciente";
        await Swal.fire({ icon: "error", title: "Error", text: message });
      }
    }
  };

  // Función para obtener nombre completo
  const getNombreUsuario = (idUsuario) => {
    const user = usuarios.find((u) => u.id_usuario === idUsuario);
    return user ? `${user.nombres} ${user.apellidos}` : `Usuario ${idUsuario}`;
  };

  // aplicar filtros en memoria
  const filteredPacientes = pacientes.filter((p) => {
    const nombre = getNombreUsuario(p.id_usuario).toLowerCase();
    const search = searchName.trim().toLowerCase();
    const matchesName = !search || nombre.includes(search);
    const matchesSexo = !sexoFilter || String(p.sexo) === String(sexoFilter);
    return matchesName && matchesSexo;
  });

  return (
    <div
      className="d-flex flex-column min-vh-100"
      style={{ background: "#a8dadc" }}
    >
      <NavbarAdmin />
      <div className="container py-4 flex-grow-1">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2>Pacientes</h2>
          <button
            className="btn btn-success"
            onClick={() => navigate("/admin/pacientes/nuevo")}
          >
            + Nuevo Paciente
          </button>
        </div>

        {/* filtros: búsqueda por nombre y filtro por sexo */}
        <div className="row g-2 mb-3">
          <div className="col-12 col-md-6">
            <input
              type="search"
              className="form-control"
              placeholder="Buscar por nombre de usuario"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
            />
          </div>
          <div className="col-6 col-md-3">
            <select
              className="form-control"
              value={sexoFilter}
              onChange={(e) => setSexoFilter(e.target.value)}
            >
              <option value="">Todos los sexos</option>
              <option value="M">Masculino</option>
              <option value="F">Femenino</option>
            </select>
          </div>
          <div className="col-6 col-md-3">
            <button
              type="button"
              className="btn btn-secondary w-100"
              onClick={() => {
                setSearchName("");
                setSexoFilter("");
              }}
            >
              Limpiar
            </button>
          </div>
        </div>

        <div className="table-responsive">
          {/* internal scroll using Bootstrap utilities + inline maxHeight */}
          <div className="overflow-auto" style={{ maxHeight: "420px" }}>
            <table className="table table-bordered table-hover">
              <thead className="table-primary">
                <tr>
                  <th className="position-sticky top-0 bg-primary">
                    Nombre del Usuario
                  </th>
                  <th className="position-sticky top-0 bg-primary">
                    Fecha Nacimiento
                  </th>
                  <th className="position-sticky top-0 bg-primary">Sexo</th>
                  <th className="position-sticky top-0 bg-primary">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredPacientes.map((p) => (
                  <tr key={p.id_paciente}>
                    <td>{getNombreUsuario(p.id_usuario)}</td>
                    <td>{p.fecha_nacimiento}</td>
                    <td>{p.sexo === "M" ? "Masculino" : "Femenino"}</td>
                    <td>
                      <button
                        className="btn btn-warning btn-sm me-2"
                        onClick={() =>
                          navigate(`/admin/pacientes/editar/${p.id_paciente}`)
                        }
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
      </div>
      <Footer />
    </div>
  );
};

export default CrudPacientes;
