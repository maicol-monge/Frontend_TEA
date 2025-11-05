import React, { useEffect, useState } from "react";
import axios from "axios";
import { apiUrl } from "../config/apiConfig";
import NavbarAdmin from "../components/NavbarAdmin";
import Footer from "../components/Footer";

const CrudAreas = () => {
    const [areas, setAreas] = useState([]);
    const [form, setForm] = useState({ area: "" });
    const [editId, setEditId] = useState(null);

    const token = localStorage.getItem("token");

    const fetchAreas = () => {
        axios.get(apiUrl('/api/admin/areas'), { headers: { Authorization: `Bearer ${token}` } })
            .then(res => setAreas(res.data));
    };

    useEffect(fetchAreas, []);

    const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = e => {
        e.preventDefault();
        if (editId) {
            axios.put(apiUrl(`/api/admin/areas/${editId}`), form, { headers: { Authorization: `Bearer ${token}` } })
                .then(() => { setEditId(null); setForm({ area: "" }); fetchAreas(); });
        } else {
            axios.post(apiUrl('/api/admin/areas'), form, { headers: { Authorization: `Bearer ${token}` } })
                .then(() => { setForm({ area: "" }); fetchAreas(); });
        }
    };

    const handleEdit = area => {
        setEditId(area.id_area);
        setForm(area);
    };

    const handleDelete = id =>
        window.confirm("¿Eliminar área?") &&
    axios.delete(apiUrl(`/api/admin/areas/${id}`), { headers: { Authorization: `Bearer ${token}` } }).then(fetchAreas);

    return (
        <div className="d-flex flex-column min-vh-100" style={{ background: "#a8dadc" }}>
            <NavbarAdmin />
            <div className="container py-4 flex-grow-1">
                <h2 className="mb-4">Áreas</h2>
                <form className="row g-2 mb-4" onSubmit={handleSubmit}>
                    <div className="col-12 col-md-8">
                        <input className="form-control" name="area" placeholder="Área" value={form.area} onChange={handleChange} required />
                    </div>
                    <div className="col-12 col-md-2 d-flex gap-2">
                        <button className="btn btn-success w-100" type="submit">{editId ? "Actualizar" : "Crear"}</button>
                    </div>
                    {editId && (
                        <div className="col-12 col-md-2 d-flex gap-2">
                            <button className="btn btn-secondary w-100" type="button" onClick={() => { setEditId(null); setForm({ area: "" }); }}>Cancelar</button>
                        </div>
                    )}
                </form>
                <div className="table-responsive">
                    <table className="table table-bordered table-hover">
                        <thead className="table-primary">
                            <tr>
                                <th>ID</th>
                                <th>Área</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {areas.map(a => (
                                <tr key={a.id_area}>
                                    <td>{a.id_area}</td>
                                    <td>{a.area}</td>
                                    <td>
                                        <button className="btn btn-warning btn-sm me-2" onClick={() => handleEdit(a)}>Editar</button>
                                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(a.id_area)}>Eliminar</button>
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

export default CrudAreas;