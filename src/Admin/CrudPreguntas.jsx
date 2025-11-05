import React, { useEffect, useState } from "react";
import axios from "axios";
import { apiUrl } from "../config/apiConfig";
import NavbarAdmin from "../components/NavbarAdmin";
import Footer from "../components/Footer";

const CrudPreguntas = () => {
    const [preguntas, setPreguntas] = useState([]);
    const [form, setForm] = useState({ pregunta: "", id_area: "" });
    const [editId, setEditId] = useState(null);

    const token = localStorage.getItem("token");

    const fetchPreguntas = () => {
        axios.get(apiUrl('/api/admin/preguntas'), { headers: { Authorization: `Bearer ${token}` } })
            .then(res => setPreguntas(res.data));
    };

    useEffect(fetchPreguntas, []);

    const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = e => {
        e.preventDefault();
        if (editId) {
            axios.put(apiUrl(`/api/admin/preguntas/${editId}`), form, { headers: { Authorization: `Bearer ${token}` } })
                .then(() => { setEditId(null); setForm({ pregunta: "", id_area: "" }); fetchPreguntas(); });
        } else {
            axios.post(apiUrl('/api/admin/preguntas'), form, { headers: { Authorization: `Bearer ${token}` } })
                .then(() => { setForm({ pregunta: "", id_area: "" }); fetchPreguntas(); });
        }
    };

    const handleEdit = pregunta => {
        setEditId(pregunta.id_pregunta);
        setForm(pregunta);
    };

    const handleDelete = id =>
        window.confirm("¿Eliminar pregunta?") &&
    axios.delete(apiUrl(`/api/admin/preguntas/${id}`), { headers: { Authorization: `Bearer ${token}` } }).then(fetchPreguntas);

    return (
        <div className="d-flex flex-column min-vh-100" style={{ background: "#a8dadc" }}>
            <NavbarAdmin />
            <div className="container py-4 flex-grow-1">
                <h2 className="mb-4">Preguntas ADI</h2>
                <form className="row g-2 mb-4" onSubmit={handleSubmit}>
                    <div className="col-12 col-md-7 col-lg-8">
                        <input className="form-control" name="pregunta" placeholder="Pregunta" value={form.pregunta} onChange={handleChange} required />
                    </div>
                    <div className="col-12 col-md-3 col-lg-2">
                        <input className="form-control" name="id_area" placeholder="ID Área" value={form.id_area} onChange={handleChange} required />
                    </div>
                    <div className="col-12 col-md-2 col-lg-2 d-flex gap-2">
                        <button className="btn btn-success w-100" type="submit">{editId ? "Actualizar" : "Crear"}</button>
                        {editId && <button className="btn btn-secondary w-100" type="button" onClick={() => { setEditId(null); setForm({ pregunta: "", id_area: "" }); }}>Cancelar</button>}
                    </div>
                </form>
                <div className="table-responsive">
                    <table className="table table-bordered table-hover">
                        <thead className="table-primary">
                            <tr>
                                <th>ID</th>
                                <th>Pregunta</th>
                                <th>ID Área</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {preguntas.map(p => (
                                <tr key={p.id_pregunta}>
                                    <td>{p.id_pregunta}</td>
                                    <td>{p.pregunta}</td>
                                    <td>{p.id_area}</td>
                                    <td>
                                        <button className="btn btn-warning btn-sm me-2" onClick={() => handleEdit(p)}>Editar</button>
                                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p.id_pregunta)}>Eliminar</button>
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

export default CrudPreguntas;