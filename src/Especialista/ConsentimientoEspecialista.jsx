import React, { useState } from "react";
import Swal from "sweetalert2";
import axios from "axios";
import { apiUrl } from "../config/apiConfig";
import { useNavigate } from "react-router-dom";

const consentimientoTexto = `
Consentimiento y declaración de uso profesional del sistema de evaluación del Trastorno del Espectro Autista (TEA)

Como profesional de la salud autorizado a utilizar esta plataforma, usted debe aceptar los siguientes términos de uso:

Uso responsable del sistema: Usted se compromete a utilizar esta herramienta únicamente en el marco de su ejercicio profesional y conforme a las normativas éticas y legales aplicables.

Confidencialidad y privacidad de datos: Se compromete a mantener la confidencialidad de los datos personales y clínicos de los pacientes evaluados, y a no divulgar dicha información sin el consentimiento explícito del paciente o su representante legal.

Consentimiento informado de los pacientes: Asegura que todo paciente evaluado mediante los instrumentos disponibles en esta plataforma ha brindado su consentimiento informado para la recolección y análisis de datos.

Limitación del sistema: Reconoce que la plataforma es una herramienta de apoyo para el diagnóstico, pero no sustituye el juicio clínico ni la experiencia profesional.

Responsabilidad profesional: Usted asume total responsabilidad sobre los diagnósticos o valoraciones clínicas registradas en esta plataforma.

Protección de credenciales: Usted es responsable de mantener la seguridad de su cuenta de acceso. Cualquier uso indebido será su responsabilidad.
`;

const ConsentimientoEspecialista = () => {
    const [aceptado, setAceptado] = useState(false);
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem("user"));
    const token = localStorage.getItem("token");

    const handleAceptar = async () => {
        try {
            await axios.post(
                apiUrl('/api/especialistas/aceptar-consentimiento'),
                { id_usuario: user.id_usuario, correo: user.correo, nombres: user.nombres, apellidos: user.apellidos },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            Swal.fire({
                title: "¡Consentimiento aceptado!",
                text: "Se ha enviado una copia a tu correo.",
                icon: "success",
                confirmButtonText: "Continuar"
            }).then(() => {
                navigate("/home_espe");
            });
        } catch (err) {
            Swal.fire({
                title: "Error",
                text: "No se pudo registrar el consentimiento. Intenta de nuevo.",
                icon: "error"
            });
        }
    };

    const handleRechazar = () => {
        Swal.fire({
            title: "¿Estás seguro?",
            text: "Si rechazas el consentimiento, no podrás usar la aplicación.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Sí, rechazar",
            cancelButtonText: "Cancelar"
        }).then((result) => {
            if (result.isConfirmed) {
                localStorage.clear();
                navigate("/");
            }
        });
    };

    return (
        <div className="container mt-5">
            <div className="card shadow">
                <div className="card-header bg-primary text-white">
                    <h4>Consentimiento Profesional</h4>
                </div>
                <div className="card-body" style={{ whiteSpace: "pre-line" }}>
                    {consentimientoTexto}
                    <div className="form-check mt-4">
                        <input
                            className="form-check-input"
                            type="checkbox"
                            checked={aceptado}
                            onChange={() => setAceptado(!aceptado)}
                            id="aceptarConsentimiento"
                        />
                        <label className="form-check-label" htmlFor="aceptarConsentimiento">
                            He leído y acepto los términos y condiciones profesionales.
                        </label>
                    </div>
                    <div className="d-flex gap-2 mt-3">
                        <button
                            className="btn btn-success"
                            disabled={!aceptado}
                            onClick={handleAceptar}
                        >
                            Aceptar y continuar
                        </button>
                        <button
                            className="btn btn-danger"
                            onClick={handleRechazar}
                        >
                            Rechazar y salir
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConsentimientoEspecialista;