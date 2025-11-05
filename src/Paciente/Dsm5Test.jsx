import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { apiUrl } from "../config/apiConfig";

const preguntasDSM5 = [
    {
        id: 1,
        texto: "¿Tiene dificultades para mantener una conversación normal con otras personas?",
        criterio: "A"
    },
    {
        id: 2,
        texto: "¿Le cuesta entender gestos o expresiones faciales de los demás?",
        criterio: "A"
    },
    {
        id: 3,
        texto: "¿Evita el contacto visual frecuentemente?",
        criterio: "A"
    },
    {
        id: 4,
        texto: "¿Presenta movimientos repetitivos como aleteo de manos o balanceo?",
        criterio: "B"
    },
    {
        id: 5,
        texto: "¿Se molesta mucho si se cambian sus rutinas?",
        criterio: "B"
    },
    {
        id: 6,
        texto: "¿Tiene intereses muy intensos o específicos (ej. solo hablar de un tema)?",
        criterio: "B"
    },
    {
        id: 7,
        texto: "¿Tiene reacciones inusuales ante sonidos, luces o texturas?",
        criterio: "B"
    }
];

const Dsm5Test = ({ user, token, onAprobado }) => {
    const [respuestas, setRespuestas] = useState({});
    const [resultado, setResultado] = useState(null);
    const [permitido, setPermitido] = useState(false);
    const [puedeContinuar, setPuedeContinuar] = useState(false);

    useEffect(() => {
        axios.get(apiUrl(`/api/pacientes/validar-terminos/${user.id_usuario}`), {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => setPermitido(res.data.permitido))
            .catch(() => setPermitido(false));
    }, [user, token]);

    const handleRespuesta = (id, valor) => {
        setRespuestas(prev => ({ ...prev, [id]: valor }));
    };

    const calcularResultado = async () => {
        const criterios = { A: 0, B: 0 };
        preguntasDSM5.forEach(p => {
            if (respuestas[p.id] === "sí") criterios[p.criterio]++;
        });
        const cumpleA = criterios.A >= 2;
        const cumpleB = criterios.B >= 2;
        let res = "";
        if (cumpleA && cumpleB) {
            res = "Se recomienda aplicar las pruebas ADOS-2 y ADI-R.";
            setPuedeContinuar(true);
        } else {
            res = "No se recomienda aplicar las pruebas clínicas en este momento.";
            setPuedeContinuar(false);
        }
        setResultado(res);

        // Guarda el resultado en el backend
        try {
            await axios.post(apiUrl('/api/pacientes/guardar-dsm5'), {
                id_usuario: user.id_usuario,
                resultado: res
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
        } catch (e) {
            // Manejo de error opcional
        }
    };

    if (!permitido) {
        return <p>No puedes acceder al test hasta aceptar los términos de privacidad.</p>;
    }

    return (
        <div className="mx-auto my-5 p-4 p-md-5 bg-white shadow rounded" style={{ maxWidth: 600 }}>
            <div className="mb-4">
                <h2 className="text-center mb-3" style={{ color: "#457b9d", fontWeight: "bold" }}>
                    Cuestionario Preliminar DSM-5
                </h2>
                <div className="alert alert-info" style={{ fontSize: "1.1rem" }}>
                    <strong>¡Importante!</strong> Antes de continuar, por favor responde el siguiente cuestionario.
                    Este test es un filtro orientativo para saber si es recomendable realizar evaluaciones clínicas más profundas.
                </div>
                <div className="alert alert-warning" style={{ fontSize: "1rem" }}>
                    <strong>Advertencia:</strong> Este cuestionario tiene fines orientativos.
                    <span style={{ color: "#d90429", fontWeight: "bold" }}> Solo un profesional de la salud mental puede realizar un diagnóstico clínico.</span>
                </div>
            </div>
            {preguntasDSM5.map(p => (
                <div key={p.id} className="mb-4 border-bottom pb-3">
                    <p className="mb-2" style={{ fontWeight: "500" }}>{p.texto}</p>
                    <div className="d-flex gap-4">
                        <label className="form-check-label" style={{ fontWeight: "400" }}>
                            <input
                                className="form-check-input me-1"
                                type="radio"
                                name={`pregunta-${p.id}`}
                                value="sí"
                                checked={respuestas[p.id] === "sí"}
                                onChange={() => handleRespuesta(p.id, "sí")}
                            /> Sí
                        </label>
                        <label className="form-check-label" style={{ fontWeight: "400" }}>
                            <input
                                className="form-check-input me-1"
                                type="radio"
                                name={`pregunta-${p.id}`}
                                value="no"
                                checked={respuestas[p.id] === "no"}
                                onChange={() => handleRespuesta(p.id, "no")}
                            /> No
                        </label>
                    </div>
                </div>
            ))}

            <button
                onClick={calcularResultado}
                className="mt-3 w-100 btn btn-primary"
                style={{ background: "#457b9d", fontWeight: "bold", fontSize: "1.1rem" }}
            >
                Calcular resultado
            </button>

            {resultado && (
                <div className="mt-4 p-3 bg-success bg-opacity-10 border border-success rounded text-success">
                    <strong>Resultado:</strong> {resultado}
                </div>
            )}

            {puedeContinuar && (
                <div className="mt-4 p-3 bg-info bg-opacity-10 border border-info rounded text-info text-center">
                    <strong>¡Cumples con los criterios preliminares!</strong>
                    <br />
                    Ahora puedes acceder al resto de funcionalidades del sistema y realizar las evaluaciones clínicas.
                    <br />
                    <button
                        className="btn btn-success mt-3"
                        style={{ fontWeight: "bold" }}
                        onClick={onAprobado}
                    >
                        Continuar al sistema
                    </button>
                </div>
            )}
        </div>
    );
};

export default Dsm5Test;