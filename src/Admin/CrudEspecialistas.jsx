import React, { useEffect, useState } from "react";
import axios from "axios";
import { apiUrl } from "../config/apiConfig";
import NavbarAdmin from "../components/NavbarAdmin";
import Footer from "../components/Footer";

const CrudEspecialistas = () => {
    const [especialistas, setEspecialistas] = useState([]);
    const [form, setForm] = useState({ id_usuario: "", especialidad: "" });
    const [editId, setEditId] = useState(null);

    const token = localStorage.getItem("token");

    const fetchEspecialistas = () => {
        axios.get(apiUrl('/api/admin/especialistas'), { headers: { Authorization: `Bearer ${token}` } })
            .then(res => setEspecialistas(res.data));
    };

    useEffect(fetchEspecialistas, []);

    const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = e => {
        e.preventDefault();
        if (editId) {
            axios.put(apiUrl(`/api/admin/especialistas/${editId}`), form, { headers: { Authorization: `Bearer ${token}` } })
                .then(() => { setEditId(null); setForm({ id_usuario: "", especialidad: "" }); fetchEspecialistas(); });
        } else {
            axios.post(apiUrl('/api/admin/especialistas'), form, { headers: { Authorization: `Bearer ${token}` } })
                .then(() => { setForm({ id_usuario: "", especialidad: "" }); fetchEspecialistas(); });
        }
    };

    const handleEdit = especialista => {
        setEditId(especialista.id_especialista);
        setForm(especialista);
    };

    const handleDelete = id =>
        window.confirm("¿Eliminar especialista?") &&
    axios.delete(apiUrl(`/api/admin/especialistas/${id}`), { headers: { Authorization: `Bearer ${token}` } }).then(fetchEspecialistas);

    return (
        <div className="d-flex flex-column min-vh-100" style={{ background: "#a8dadc" }}>
            <NavbarAdmin />
            <div className="container py-4 flex-grow-1">
                <h2 className="mb-4">Especialistas</h2>
                <form className="row g-2 mb-4" onSubmit={handleSubmit}>
                    <div className="col-12 col-md-6">
                        <input className="form-control" name="id_usuario" placeholder="ID Usuario" value={form.id_usuario} onChange={handleChange} required />
                    </div>
                    <div className="col-12 col-md-4">
                        <input className="form-control" name="especialidad" placeholder="Especialidad" value={form.especialidad} onChange={handleChange} required />
                    </div>
                    <div className="col-12 col-md-2 d-flex gap-2">
                        <button className="btn btn-success w-100" type="submit">{editId ? "Actualizar" : "Crear"}</button>
                        {editId && <button className="btn btn-secondary w-100" type="button" onClick={() => { setEditId(null); setForm({ id_usuario: "", especialidad: "" }); }}>Cancelar</button>}
                    </div>
                </form>
                <div className="table-responsive">
                    <table className="table table-bordered table-hover">
                        <thead className="table-primary">
                            <tr>
                                <th>ID</th>
                                <th>ID Usuario</th>
                                <th>Especialidad</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {especialistas.map(e => (
                                <tr key={e.id_especialista}>
                                    <td>{e.id_especialista}</td>
                                    <td>{e.id_usuario}</td>
                                    <td>{e.especialidad}</td>
                                    <td>
                                        <button className="btn btn-warning btn-sm me-2" onClick={() => handleEdit(e)}>Editar</button>
                                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(e.id_especialista)}>Eliminar</button>
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

export default CrudEspecialistas;