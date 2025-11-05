import React, { useEffect, useState } from "react";
import axios from "axios";
import { apiUrl } from "../config/apiConfig";
import NavbarAdmin from "../components/NavbarAdmin";
import Footer from "../components/Footer";

const CrudUsuarios = () => {
    const [usuarios, setUsuarios] = useState([]);
    const [form, setForm] = useState({
        nombres: "",
        apellidos: "",
        direccion: "",
        telefono: "",
        correo: "",
        contrasena: "",
        privilegio: 1,
        imagen: "",
        estado: 1
    });
    const [editId, setEditId] = useState(null);

    const token = localStorage.getItem("token");

    const fetchUsuarios = () => {
        axios.get(apiUrl('/api/admin/usuarios'), { headers: { Authorization: `Bearer ${token}` } })
            .then(res => setUsuarios(res.data));
    };

    useEffect(fetchUsuarios, []);

    const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = e => {
        e.preventDefault();
        if (editId) {
            axios.put(apiUrl(`/api/admin/usuarios/${editId}`), form, { headers: { Authorization: `Bearer ${token}` } })
                .then(() => {
                    setEditId(null);
                    setForm({
                        nombres: "",
                        apellidos: "",
                        direccion: "",
                        telefono: "",
                        correo: "",
                        contrasena: "",
                        privilegio: 1,
                        imagen: "",
                        estado: 1
                    });
                    fetchUsuarios();
                });
        } else {
            axios.post(apiUrl('/api/admin/usuarios'), form, { headers: { Authorization: `Bearer ${token}` } })
                .then(() => {
                    setForm({
                        nombres: "",
                        apellidos: "",
                        direccion: "",
                        telefono: "",
                        correo: "",
                        contrasena: "",
                        privilegio: 1,
                        imagen: "",
                        estado: 1
                    });
                    fetchUsuarios();
                });
        }
    };

    const handleEdit = usuario => {
        setEditId(usuario.id_usuario);
        setForm({
            nombres: usuario.nombres,
            apellidos: usuario.apellidos,
            direccion: usuario.direccion,
            telefono: usuario.telefono,
            correo: usuario.correo,
            contrasena: "",
            privilegio: usuario.privilegio,
            imagen: usuario.imagen,
            estado: usuario.estado
        });
    };

    const handleDelete = id =>
    window.confirm("¿Eliminar usuario?") &&
    axios.delete(apiUrl(`/api/admin/usuarios/${id}`), { headers: { Authorization: `Bearer ${token}` } }).then(fetchUsuarios);

    return (
        <div className="d-flex flex-column min-vh-100" style={{ background: "#a8dadc" }}>
            <NavbarAdmin />
            <div className="container py-4 flex-grow-1">
                <h2 className="mb-4">Usuarios</h2>
                <form className="row g-2 mb-4" onSubmit={handleSubmit}>
                    <div className="col-12 col-md-6 col-lg-3">
                        <input className="form-control" name="nombres" placeholder="Nombres" value={form.nombres} onChange={handleChange} required />
                    </div>
                    <div className="col-12 col-md-6 col-lg-3">
                        <input className="form-control" name="apellidos" placeholder="Apellidos" value={form.apellidos} onChange={handleChange} required />
                    </div>
                    <div className="col-12 col-md-6 col-lg-3">
                        <input className="form-control" name="direccion" placeholder="Dirección" value={form.direccion} onChange={handleChange} required />
                    </div>
                    <div className="col-12 col-md-6 col-lg-3">
                        <input className="form-control" name="telefono" placeholder="Teléfono" value={form.telefono} onChange={handleChange} required />
                    </div>
                    <div className="col-12 col-md-6 col-lg-3">
                        <input className="form-control" name="correo" placeholder="Correo" value={form.correo} onChange={handleChange} required />
                    </div>
                    <div className="col-12 col-md-6 col-lg-3">
                        <input className="form-control" name="contrasena" placeholder="Contraseña" value={form.contrasena} onChange={handleChange} type="password" required={!editId} />
                    </div>
                    <div className="col-12 col-md-6 col-lg-2">
                        <select className="form-control" name="privilegio" value={form.privilegio} onChange={handleChange}>
                            <option value={0}>Especialista</option>
                            <option value={1}>Paciente</option>
                            <option value={3}>Admin</option>
                        </select>
                    </div>
                    <div className="col-12 col-md-6 col-lg-2">
                        <input className="form-control" name="imagen" placeholder="URL Imagen" value={form.imagen} onChange={handleChange} />
                    </div>
                    <div className="col-12 col-md-6 col-lg-2">
                        <select className="form-control" name="estado" value={form.estado} onChange={handleChange}>
                            <option value={1}>Activo</option>
                            <option value={0}>Inactivo</option>
                        </select>
                    </div>
                    <div className="col-12 col-md-6 col-lg-2 d-flex gap-2">
                        <button className="btn btn-success w-100" type="submit">{editId ? "Actualizar" : "Crear"}</button>
                        {editId && (
                            <button className="btn btn-secondary w-100" type="button" onClick={() => {
                                setEditId(null);
                                setForm({
                                    nombres: "",
                                    apellidos: "",
                                    direccion: "",
                                    telefono: "",
                                    correo: "",
                                    contrasena: "",
                                    privilegio: 1,
                                    imagen: "",
                                    estado: 1
                                });
                            }}>Cancelar</button>
                        )}
                    </div>
                </form>
                <div className="table-responsive">
                    <table className="table table-bordered table-hover">
                        <thead className="table-primary">
                            <tr>
                                <th>ID</th>
                                <th>Nombres</th>
                                <th>Apellidos</th>
                                <th>Correo</th>
                                <th>Privilegio</th>
                                <th>Estado</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {usuarios.map(u => (
                                <tr key={u.id_usuario}>
                                    <td>{u.id_usuario}</td>
                                    <td>{u.nombres}</td>
                                    <td>{u.apellidos}</td>
                                    <td>{u.correo}</td>
                                    <td>{u.privilegio}</td>
                                    <td>{u.estado === 1 ? "Activo" : "Inactivo"}</td>
                                    <td>
                                        <button className="btn btn-warning btn-sm me-2" onClick={() => handleEdit(u)}>Editar</button>
                                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(u.id_usuario)}>Eliminar</button>
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

export default CrudUsuarios;