import React, { useState } from "react";
import Swal from "sweetalert2";
import axios from "axios";
import { apiUrl } from "../config/apiConfig";
import { useNavigate } from "react-router-dom";

const consentimientoTexto = `
Consentimiento informado para el uso de la aplicación de evaluación del Trastorno del Espectro Autista (TEA)

Bienvenido a nuestra aplicación para la evaluación clínica del Trastorno del Espectro Autista (TEA), la cual integra herramientas reconocidas como el filtro DSM-5, el test ADOS-2 y el test ADI-R.

Antes de comenzar, le solicitamos que lea y acepte los siguientes términos:

Finalidad del uso de datos: La información que usted proporcione será utilizada exclusivamente con fines de evaluación clínica y análisis profesional por personal capacitado.

Confidencialidad: Sus datos personales y clínicos serán tratados con estricta confidencialidad conforme a la legislación vigente sobre protección de datos.

Voluntariedad: La participación es completamente voluntaria. Puede suspender el uso de la aplicación en cualquier momento sin consecuencia alguna.

No sustitución de diagnóstico clínico: Los resultados obtenidos mediante esta aplicación son preliminares y orientativos. El diagnóstico definitivo debe ser realizado por un especialista clínico.

Consentimiento digital: Al aceptar los términos a continuación, usted manifiesta su consentimiento libre e informado para la recopilación y análisis de sus datos personales y respuestas en los cuestionarios.
`;

const ConsentimientoInformado = () => {
    const [aceptado, setAceptado] = useState(false);
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem("user"));
    const token = localStorage.getItem("token");

    const handleAceptar = async () => {
        try {
            await axios.post(
                apiUrl('/api/pacientes/aceptar-consentimiento'),
                { id_usuario: user.id_usuario, correo: user.correo, nombres: user.nombres, apellidos: user.apellidos },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            Swal.fire({
                title: "¡Consentimiento aceptado!",
                text: "Se ha enviado una copia a tu correo.",
                icon: "success",
                confirmButtonText: "Continuar"
            }).then(() => {
                navigate("/home_paciente");
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
            <div className="card shadow m-4">
                <div className="card-header bg-primary text-white">
                    <h4>Consentimiento Informado</h4>
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
                            He leído y acepto los términos y condiciones.
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

export default ConsentimientoInformado;