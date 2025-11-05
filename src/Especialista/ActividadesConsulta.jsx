import React, { useEffect, useState } from "react";
import axios from "axios";
import { apiUrl } from "../config/apiConfig";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from '../components/Navbar_espe';
import Footer from '../components/Footer';

const COLOR_PRIMARY = "#457b9d";
const COLOR_BG = "#a8dadc";

const ActividadesConsulta = () => {
    const { id_ados } = useParams();
    const [actividades, setActividades] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchActividades = async () => {
            try {
                const token = localStorage.getItem("token");
                const res = await axios.get(apiUrl(`/api/ados/actividades-por-test/${id_ados}`), {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setActividades(res.data);
                console.log("Actividades recibidas:", res.data);
            } catch (error) {
                console.error("Error al obtener actividades:", error);
            }
        };
        fetchActividades();
    }, [id_ados]);

    return (
        <div className="d-flex flex-column min-vh-100" style={{ background: COLOR_BG }}>
            <Navbar />
            <div className="container py-4 flex-grow-1">
                <button
                    className="btn mb-3"
                    style={{ background: COLOR_PRIMARY, color: "#fff", fontWeight: "bold" }}
                    onClick={() => navigate(-1)}
                >
                    Volver
                </button>
                <div className="card shadow mb-4" style={{ borderRadius: 18 }}>
                    <div className="card-body">
                        <h2 className="mb-4" style={{ color: COLOR_PRIMARY, fontWeight: "bold" }}>
                            Actividades y Observaciones
                        </h2>
                        <div className="table-responsive">
                            <table className="table table-bordered align-middle text-center">
                                <thead style={{ background: COLOR_PRIMARY, color: "#fff" }}>
                                    <tr>
                                        <th>Actividad</th>
                                        <th>Observación</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {actividades.map(a => (
                                        <tr key={a.id_actividad_realizada}>
                                            <td>{a.nombre_actividad}</td>
                                            <td>{a.observacion}</td>
                                        </tr>
                                    ))}
                                    {actividades.length === 0 && (
                                        <tr>
                                            <td colSpan={2} className="text-center">No hay actividades registradas.</td>
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

export default ActividadesConsulta;