import React, { useEffect, useState } from "react";
import axios from "axios";
import { apiUrl } from "../config/apiConfig";
import NavbarAdmin from "../components/NavbarAdmin";
import Footer from "../components/Footer";

const CrudTestsAdiR = () => {
    const [tests, setTests] = useState([]);
    const [editId, setEditId] = useState(null);
    const [form, setForm] = useState({ id_paciente: "", id_especialista: "", fecha: "", diagnostico: "" });

    const token = localStorage.getItem("token");

    // Función para obtener la fecha y hora actual en formato compatible con input[type="datetime-local"]
    const getNowForInput = () => {
        const now = new Date();
        now.setSeconds(0, 0);
        const offset = now.getTimezoneOffset();
        const local = new Date(now.getTime() - offset * 60000);
        return local.toISOString().slice(0, 16);
    };
    const maxDateTime = getNowForInput();

    const fetchTests = () => {
        axios.get(apiUrl('/api/admin/tests-adir'), { headers: { Authorization: `Bearer ${token}` } })
            .then(res => setTests(res.data));
    };

    useEffect(fetchTests, []);

    const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = e => {
        e.preventDefault();
        if (editId) {
            axios.put(apiUrl(`/api/admin/tests-adir/${editId}`), form, { headers: { Authorization: `Bearer ${token}` } })
                .then(() => { setEditId(null); setForm({ id_paciente: "", id_especialista: "", fecha: "", diagnostico: "" }); fetchTests(); });
        }
    };

    const handleEdit = test => {
        setEditId(test.id_adir);
        setForm(test);
    };

    const handleDelete = id =>
        window.confirm("¿Eliminar test?") &&
    axios.delete(apiUrl(`/api/admin/tests-adir/${id}`), { headers: { Authorization: `Bearer ${token}` } }).then(fetchTests);

    return (
        <div className="d-flex flex-column min-vh-100" style={{ background: "#a8dadc" }}>
            <NavbarAdmin />
            <div className="container py-4 flex-grow-1">
                <h2 className="mb-4">Tests ADI-R</h2>
                <form className="row g-2 mb-4" onSubmit={handleSubmit}>
                    <div className="col-12 col-md-6 col-lg-3">
                        <input className="form-control" name="id_paciente" placeholder="ID Paciente" value={form.id_paciente} onChange={handleChange} required />
                    </div>
                    <div className="col-12 col-md-6 col-lg-3">
                        <input className="form-control" name="id_especialista" placeholder="ID Especialista" value={form.id_especialista} onChange={handleChange} />
                    </div>
                    <div className="col-12 col-md-6 col-lg-3">
                        <input
                            className="form-control"
                            name="fecha"
                            type="datetime-local"
                            value={form.fecha}
                            onChange={handleChange}
                            required
                            max={maxDateTime}
                        />
                    </div>
                    <div className="col-12 col-md-6 col-lg-2">
                        <input className="form-control" name="diagnostico" placeholder="Diagnóstico" value={form.diagnostico} onChange={handleChange} />
                    </div>
                    <div className="col-12 col-md-6 col-lg-1 d-flex gap-2">
                        <button className="btn btn-success w-100" type="submit">{editId ? "Actualizar" : "Editar"}</button>
                        {editId && <button className="btn btn-secondary w-100" type="button" onClick={() => { setEditId(null); setForm({ id_paciente: "", id_especialista: "", fecha: "", diagnostico: "" }); }}>Cancelar</button>}
                    </div>
                </form>
                <div className="table-responsive">
                    <table className="table table-bordered table-hover">
                        <thead className="table-primary">
                            <tr>
                                <th>ID</th>
                                <th>ID Paciente</th>
                                <th>ID Especialista</th>
                                <th>Fecha</th>
                                <th>Diagnóstico</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tests.map(t => (
                                <tr key={t.id_adir}>
                                    <td>{t.id_adir}</td>
                                    <td>{t.id_paciente}</td>
                                    <td>{t.id_especialista}</td>
                                    <td>{t.fecha}</td>
                                    <td>{t.diagnostico}</td>
                                    <td>
                                        <button className="btn btn-warning btn-sm me-2" onClick={() => handleEdit(t)}>Editar</button>
                                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(t.id_adir)}>Eliminar</button>
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

export default CrudTestsAdiR;