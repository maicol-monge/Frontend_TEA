import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { apiUrl } from '../config/apiConfig';
import Navbar from '../components/Navbar_espe';
import Footer from '../components/Footer';

const COLOR_PRIMARY = "#457b9d";
const COLOR_DARK = "#1d3557";
const COLOR_ACCENT = "#f3859e";
const COLOR_BG = "#a8dadc";

const ListaTestsPaciente = () => {
    const { id_paciente } = useParams();
    const [tests, setTests] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("token");
        axios.get(
            apiUrl(`/api/adir/listar/${id_paciente}`),
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        )
        .then(res => setTests(res.data));
    }, [id_paciente]);

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
                    onClick={() => navigate('/pacientes')}
                >
                    Volver
                </button>
                <div className="d-flex justify-content-end mb-3">
                    <Link
                        to={`/crear-adir/${id_paciente}`}
                        className="btn"
                        style={{
                            background: COLOR_ACCENT,
                            color: "#fff",
                            fontWeight: "bold"
                        }}
                    >
                        Nueva Evaluación ADI-R
                    </Link>
                </div>
                <div className="card shadow" style={{ borderRadius: 18 }}>
                    <div className="card-body">
                        <h2 className="text-center mb-4" style={{ color: COLOR_PRIMARY, fontWeight: "bold" }}>
                            Tests ADIR del Paciente
                        </h2>
                        <div className="table-responsive">
                            <table className="table table-bordered align-middle text-center" style={{ borderRadius: 12, overflow: "hidden" }}>
                                <thead style={{ background: COLOR_PRIMARY, color: "#fff" }}>
                                    <tr>
                                        <th>Fecha</th>
                                        <th>Diagnóstico</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {tests.length > 0 ? (
                                        tests.map(test => (
                                            <tr key={test.id_adir}>
                                                <td style={{ fontWeight: "bold" }}>
                                                    {test.fecha ? new Date(test.fecha).toLocaleString() : "Sin fecha"}
                                                </td>
                                                <td>
                                                    {test.diagnostico || <span className="text-muted">Sin diagnóstico</span>}
                                                </td>
                                                <td>
                                                    {test.estado === 0 ? (
                                                        <Link
                                                            to={`/responder-adir/${test.id_adir}`}
                                                            className="btn btn-sm"
                                                            style={{
                                                                background: COLOR_PRIMARY,
                                                                color: "#fff",
                                                                fontWeight: "bold"
                                                            }}
                                                        >
                                                            Reanudar
                                                        </Link>
                                                    ) : (
                                                        <Link
                                                            to={`/resumen-adir/${test.id_adir}`}
                                                            className="btn btn-sm"
                                                            style={{
                                                                background: COLOR_ACCENT,
                                                                color: "#fff",
                                                                fontWeight: "bold"
                                                            }}
                                                        >
                                                            Ver Resumen
                                                        </Link>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={3} className="text-center">No hay tests ADIR registrados.</td>
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

export default ListaTestsPaciente;