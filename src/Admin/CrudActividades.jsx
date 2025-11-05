import React, { useEffect, useState } from "react";
import axios from "axios";
import { apiUrl } from "../config/apiConfig";
import NavbarAdmin from "../components/NavbarAdmin";
import Footer from "../components/Footer";

const CrudActividades = () => {
    const [actividades, setActividades] = useState([]);
    const [form, setForm] = useState({ id_ados: "", nombre_actividad: "", observacion: "", puntuacion: 0 });
    const [editId, setEditId] = useState(null);

    const token = localStorage.getItem("token");

    const fetchActividades = () => {
        axios.get(apiUrl('/api/admin/actividades'), { headers: { Authorization: `Bearer ${token}` } })
            .then(res => setActividades(res.data));
    };

    useEffect(fetchActividades, []);

    const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = e => {
        e.preventDefault();
        if (editId) {
            axios.put(apiUrl(`/api/admin/actividades/${editId}`), form, { headers: { Authorization: `Bearer ${token}` } })
                .then(() => { setEditId(null); setForm({ id_ados: "", nombre_actividad: "", observacion: "", puntuacion: 0 }); fetchActividades(); });
        } else {
            axios.post(apiUrl('/api/admin/actividades'), form, { headers: { Authorization: `Bearer ${token}` } })
                .then(() => { setForm({ id_ados: "", nombre_actividad: "", observacion: "", puntuacion: 0 }); fetchActividades(); });
        }
    };

    const handleEdit = actividad => {
        setEditId(actividad.id_actividad);
        setForm(actividad);
    };

    const handleDelete = id =>
        window.confirm("¿Eliminar actividad?") &&
    axios.delete(apiUrl(`/api/admin/actividades/${id}`), { headers: { Authorization: `Bearer ${token}` } }).then(fetchActividades);

    return (
        <div className="d-flex flex-column min-vh-100" style={{ background: "#a8dadc" }}>
            <NavbarAdmin />
            <div className="container py-4 flex-grow-1">
                <h2 className="mb-4">Actividades ADOS</h2>
                <form className="row g-2 mb-4" onSubmit={handleSubmit}>
                    <div className="col-12 col-md-3">
                        <input className="form-control" name="id_ados" placeholder="ID ADOS" value={form.id_ados} onChange={handleChange} required />
                    </div>
                    <div className="col-12 col-md-3">
                        <input className="form-control" name="nombre_actividad" placeholder="Nombre Actividad" value={form.nombre_actividad} onChange={handleChange} required />
                    </div>
                    <div className="col-12 col-md-3">
                        <input className="form-control" name="observacion" placeholder="Observación" value={form.observacion} onChange={handleChange} required />
                    </div>
                    <div className="col-12 col-md-1">
                        <input className="form-control" name="puntuacion" type="number" min={0} max={3} value={form.puntuacion} onChange={handleChange} required />
                    </div>
                    <div className="col-12 col-md-2 d-flex gap-2">
                        <button className="btn btn-success w-100" type="submit">{editId ? "Actualizar" : "Crear"}</button>
                        {editId && <button className="btn btn-secondary w-100" type="button" onClick={() => { setEditId(null); setForm({ id_ados: "", nombre_actividad: "", observacion: "", puntuacion: 0 }); }}>Cancelar</button>}
                    </div>
                </form>
                <div className="table-responsive">
                    <table className="table table-bordered table-hover">
                        <thead className="table-primary">
                            <tr>
                                <th>ID</th>
                                <th>ID ADOS</th>
                                <th>Nombre</th>
                                <th>Observación</th>
                                <th>Puntuación</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {actividades.map(a => (
                                <tr key={a.id_actividad}>
                                    <td>{a.id_actividad}</td>
                                    <td>{a.id_ados}</td>
                                    <td>{a.nombre_actividad}</td>
                                    <td>{a.observacion}</td>
                                    <td>{a.puntuacion}</td>
                                    <td>
                                        <button className="btn btn-warning btn-sm me-2" onClick={() => handleEdit(a)}>Editar</button>
                                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(a.id_actividad)}>Eliminar</button>
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

export default CrudActividades;