import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { apiUrl } from '../config/apiConfig';
import Swal from 'sweetalert2';
import Navbar from '../components/Navbar_espe';
import Footer from '../components/Footer';
import { useNavigate, Link } from 'react-router-dom';

const COLOR_PRIMARY = "#457b9d";
const COLOR_DARK = "#1d3557";
const COLOR_ACCENT = "#f3859e";
const COLOR_BG = "#a8dadc";

const Pacientes = () => {
    const [pacientes, setPacientes] = useState([]);
    const [busqueda, setBusqueda] = useState('');
    const [filtroSexo, setFiltroSexo] = useState('');
    const [ordenFecha, setOrdenFecha] = useState('asc');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchPacientes = async () => {
            try {
                const token = localStorage.getItem("token");
                const response = await axios.get(apiUrl('/api/users/pacientes'), {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setPacientes(response.data);
            } catch (err) {
                Swal.fire({
                    title: 'Error',
                    text: 'No se pudo cargar la lista de pacientes.',
                    icon: 'error',
                    confirmButtonText: 'Aceptar',
                });
            }
        };
        fetchPacientes();
    }, []);

    // Filtrado por nombre/apellido y sexo
    let pacientesFiltrados = pacientes.filter((p) => {
        const nombreCompleto = `${p.nombres} ${p.apellidos}`.toLowerCase();
        const coincideBusqueda = nombreCompleto.includes(busqueda.toLowerCase());
        const coincideSexo = filtroSexo ? p.sexo === filtroSexo : true;
        return coincideBusqueda && coincideSexo;
    });

    // Ordenar por fecha de nacimiento
    pacientesFiltrados = pacientesFiltrados.sort((a, b) => {
        const fechaA = new Date(a.fecha_nacimiento);
        const fechaB = new Date(b.fecha_nacimiento);
        return ordenFecha === 'asc' ? fechaA - fechaB : fechaB - fechaA;
    });

    return (
        <div className="d-flex flex-column min-vh-100" style={{ background: COLOR_BG }}>
            <Navbar />
            <div className="container py-4 flex-grow-1">
                <button
                    className="btn mb-3"
                    style={{
                        background: COLOR_DARK,
                        color: "#fff",
                        fontWeight: "bold"
                    }}
                    onClick={() => navigate('/home_espe')}
                >
                    Volver
                </button>
                <div className="card shadow mb-4" style={{ borderRadius: 18 }}>
                    <div className="card-body">
                        <h2 className="text-center mb-4" style={{ color: COLOR_PRIMARY, fontWeight: "bold" }}>
                            Listado de Pacientes
                        </h2>
                        <div className="row g-3 mb-4 justify-content-center">
                            <div className="col-12 col-md-4">
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Buscar por nombre o apellido"
                                    value={busqueda}
                                    onChange={e => setBusqueda(e.target.value)}
                                    style={{ borderColor: COLOR_ACCENT, borderWidth: 2 }}
                                />
                            </div>
                            <div className="col-6 col-md-3">
                                <select
                                    className="form-control"
                                    value={filtroSexo}
                                    onChange={e => setFiltroSexo(e.target.value)}
                                    style={{ borderColor: COLOR_ACCENT, borderWidth: 2 }}
                                >
                                    <option value="">Todos los sexos</option>
                                    <option value="M">Masculino</option>
                                    <option value="F">Femenino</option>
                                </select>
                            </div>
                            <div className="col-6 col-md-3">
                                <select
                                    className="form-control"
                                    value={ordenFecha}
                                    onChange={e => setOrdenFecha(e.target.value)}
                                    style={{ borderColor: COLOR_ACCENT, borderWidth: 2 }}
                                >
                                    <option value="asc">Fecha de nacimiento ascendente</option>
                                    <option value="desc">Fecha de nacimiento descendente</option>
                                </select>
                            </div>
                        </div>
                        <div className="table-responsive">
                            <table className="table table-bordered align-middle text-center" style={{ borderRadius: 12, overflow: "hidden" }}>
                                <thead style={{ background: COLOR_PRIMARY, color: "#fff" }}>
                                    <tr>
                                        <th>Nombre</th>
                                        <th>Sexo</th>
                                        <th>Fecha de Nacimiento</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pacientesFiltrados.map((p) => (
                                        <tr key={p.id_paciente}>
                                            <td style={{ fontWeight: "bold" }}>{p.nombres} {p.apellidos}</td>
                                            <td>{p.sexo}</td>
                                            <td>{p.fecha_nacimiento ? new Date(p.fecha_nacimiento).toLocaleDateString() : ''}</td>
                                            <td>
                                                <Link
                                                    to={`/tests-paciente/${p.id_paciente}`}
                                                    className="btn btn-sm"
                                                    style={{
                                                        background: COLOR_ACCENT,
                                                        color: "#fff",
                                                        fontWeight: "bold"
                                                    }}
                                                >
                                                    Ver Tests ADIR
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                    {pacientesFiltrados.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="text-center">No se encontraron pacientes.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default Pacientes;