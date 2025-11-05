import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import axios from "axios";
import { apiUrl } from "../config/apiConfig";
import { useParams, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import Navbar from "../components/Navbar_espe";
import Footer from "../components/Footer";

const COLOR_PRIMARY = "#457b9d";
const COLOR_ACCENT = "#f3859e";
const COLOR_DARK = "#1d3557";
const COLOR_BG = "#a8dadc"; // Fondo igual que home_espe.jsx
const CONVERSION_CODIGO = { 0: 0, 1: 1, 2: 2, 3: 2, 7: 0, 8: 0, 9: 0 };

const calcularEdad = (fechaNacimiento) => {
    if (!fechaNacimiento) return "";
    const hoy = dayjs();
    const nacimiento = dayjs(fechaNacimiento);
    const años = hoy.diff(nacimiento, "year");
    const meses = hoy.diff(nacimiento.add(años, "year"), "month");
    return `${años} años, ${meses} meses`;
};

const formatearFecha = (fecha) => {
    if (!fecha) return "";
    return dayjs(fecha).format("DD/MM/YYYY");
};

const ResumenADIR = () => {
    const { id_adir } = useParams();
    const [test, setTest] = useState(null);
    const [respuestas, setRespuestas] = useState({});
    const [tipoAlgoritmo, setTipoAlgoritmo] = useState("");
    const [edadAlgoritmo, setEdadAlgoritmo] = useState("");
    const [tipoSujeto, setTipoSujeto] = useState("");
    const [diagnosticoFinal, setDiagnosticoFinal] = useState("");
    const [diagnosticoDiferencial, setDiagnosticoDiferencial] = useState("");
    const navigate = useNavigate();

    // Calcula la edad en meses
    const calcularEdadMeses = (fechaNacimiento) => {
        if (!fechaNacimiento) return 0;
        const hoy = dayjs();
        const nacimiento = dayjs(fechaNacimiento);
        return hoy.diff(nacimiento, "month");
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem("token");
                const res = await axios.get(
                    apiUrl(`/api/adir/resumen/${id_adir}`),
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setTest(res.data.test);

                const algoritmo = res.data.test.algoritmo || "";
                setTipoAlgoritmo(algoritmo);

                const fechaNacimiento = res.data.test.fecha_nacimiento;
                const edadMeses = calcularEdadMeses(fechaNacimiento);
                let edadAlg = "";
                if (algoritmo === "conducta") {
                    if (edadMeses >= 24 && edadMeses <= 47) edadAlg = "2-3";
                    else if (edadMeses >= 48 && edadMeses <= 119) edadAlg = "4-9";
                    else if (edadMeses >= 120) edadAlg = "10+";
                } else if (algoritmo === "diagnostico") {
                    if (edadMeses >= 24 && edadMeses <= 47) edadAlg = "2-3";
                    else if (edadMeses >= 48) edadAlg = "4+";
                }
                setEdadAlgoritmo(edadAlg);

                setTipoSujeto(res.data.test.tipo_sujeto || "");
                setDiagnosticoFinal(res.data.test.diagnostico || "");

                const respuestasObj = {};
                (res.data.respuestas || []).forEach(r => {
                    const codigo = r.codigo !== undefined ? r.codigo : r.calificacion;
                    respuestasObj[r.id_pregunta] = { codigo, observacion: r.observacion };
                });
                setRespuestas(respuestasObj);
            } catch {
                Swal.fire("Sin evaluaciones", "No se encontró el test ADIR.", "info");
            }
        };
        fetchData();
        // eslint-disable-next-line
    }, [id_adir]);

    // Nuevo useEffect para recalcular el diagnóstico diferencial cuando cambian los datos relevantes
    useEffect(() => {
        if (
            test &&
            Object.keys(respuestas).length > 0 &&
            tipoAlgoritmo &&
            edadAlgoritmo &&
            tipoSujeto
        ) {
            setDiagnosticoDiferencial(
                calcularDiagnosticoDiferencial(respuestas, tipoAlgoritmo, edadAlgoritmo, tipoSujeto)
            );
        }
        // eslint-disable-next-line
    }, [respuestas, tipoAlgoritmo, edadAlgoritmo, tipoSujeto]);

    // --- Lógica de secciones y totales igual que AdiRForm ---
    const secciones = {
        A: {
            titulo: "A. Alteraciones cualitativas de la interacción social recíproca",
            subcategorias: {
                A1: {
                    titulo: "A.1 Incapacidad para utilizar conductas no verbales en la regulación de la interacción social",
                    items: [
                        { id: "50", label: "Mirada directa" },
                        { id: "51", label: "Sonrisa social" },
                        { id: "57", label: "Variedad de expresiones faciales usadas para comunicarse" }
                    ]
                },
                A2: {
                    titulo: "A.2 Incapacidad para desarrollar relaciones con sus iguales",
                    items: [
                        { id: "49", label: "Juego imaginativo con sus iguales" },
                        { id: "62", label: "Interés por otros niños" },
                        { id: "63", label: "Respuesta a las aproximaciones de otros niños" },
                        { id: "64", label: "Juego en grupo con sus iguales" },
                        { id: "65", label: "Amistades" }
                    ]
                },
                A3: {
                    titulo: "A.3 Falta de goce o placer compartido",
                    items: [
                        { id: "52", label: "Mostrar y dirigir la atención" },
                        { id: "53", label: "Ofrecimientos para compartir" },
                        { id: "54", label: "Busca compartir su deleite o goce con otros" }
                    ]
                },
                A4: {
                    titulo: "A.4 Falta de reciprocidad socio-emocional",
                    items: [
                        { id: "31", label: "Uso del cuerpo de otra persona para comunicarse" },
                        { id: "55", label: "Ofrecimiento de consuelo" },
                        { id: "56", label: "Calidad de los acercamientos sociales" },
                        { id: "58", label: "Expresiones faciales inapropiadas" },
                        { id: "59", label: "Cualidad apropiada de las respuestas sociales" }
                    ]
                }
            }
        },
        B: {
            titulo: "B. Alteraciones cualitativas de la comunicación",
            subcategorias: {
                B1: {
                    titulo: "B.1 Falta o retraso del lenguaje hablado e incapacidad para compensar esta falta mediante gestos",
                    items: [
                        { id: "42", label: "Señalar para expresar interés" },
                        { id: "43", label: "Asentir con la cabeza" },
                        { id: "44", label: "Negar con la cabeza" },
                        { id: "45", label: "Gestos convencionales / instrumentales" }
                    ]
                },
                B2: {
                    titulo: "B.2 Incapacidad relativa para iniciar o sostener un intercambio conversacional",
                    items: [
                        { id: "34", label: "Verbalización social / charla" },
                        { id: "35", label: "Conversación recíproca" }
                    ]
                },
                B3: {
                    titulo: "B.3 Habla estereotipada, repetitiva e idiosincrásica",
                    items: [
                        { id: "33", label: "Expresiones estereotipadas y ecolalia diferida" },
                        { id: "36", label: "Preguntas o expresiones inapropiadas" },
                        { id: "37", label: "Inversión de pronombres" },
                        { id: "38", label: "Neologismos / lenguaje idiosincrásico" }
                    ]
                },
                B4: {
                    titulo: "B.4 Falta de juego imaginativo o juego social imitativo espontáneo y variado",
                    items: [
                        { id: "47", label: "Imitación espontánea de acciones" },
                        { id: "48", label: "Juego imaginativo" },
                        { id: "61", label: "Juego social imitativo" }
                    ]
                }
            }
        },
        C: {
            titulo: "C. Patrones de conducta restringidos, repetitivos y estereotipados",
            subcategorias: {
                C1: {
                    titulo: "C.1 Preocupación absorbente o patrón de intereses circunscrito",
                    items: [
                        { id: "67", label: "Preocupaciones inusuales" },
                        { id: "68", label: "Intereses circunscritos (puntúe solamente si tiene 3 años o más)" }
                    ]
                },
                C2: {
                    titulo: "C.2 Adhesión aparentemente compulsiva a rutinas o rituales no funcionales",
                    items: [
                        { id: "39", label: "Rituales verbales (puntúe solamente si el elemento 30=0)" },
                        { id: "70", label: "Compulsiones / Rituales" }
                    ]
                },
                C3: {
                    titulo: "C.3 Manierismos motores estereotipados y repetitivos",
                    items: [
                        { id: "77", label: "Manierismos de manos y dedos" },
                        { id: "78", label: "Otros manierismos complejos o movimientos estereotipados del cuerpo" }
                    ]
                },
                C4: {
                    titulo: "C.4 Preocupaciones con parte de objetos o elementos no funcionales de los materiales",
                    items: [
                        { id: "69", label: "Uso repetitivo de objetos o interés en partes de objetos" },
                        { id: "71", label: "Intereses sensoriales inusuales" }
                    ]
                }
            }
        },
        D: {
            titulo: "D. Alteraciones en el desarrollo evidentes a los 36 meses o antes",
            subcategorias: {
                D1: {
                    titulo: "D.1 Edad de aparición de alteraciones",
                    items: [
                        { id: "2", label: "Edad en que los padres lo notaron por primera vez (si <36 meses, se coloca 1)" },
                        { id: "9", label: "Edad de las primeras palabras (si >24 meses, se coloca 1)" },
                        { id: "10", label: "Edad de las primeras frases (si >33 meses, se coloca 1)" },
                        { id: "86", label: "Edad en que la anormalidad fue evidente por primera vez (si el código fue 3 ó 4, se coloca 1)" },
                        { id: "87", label: "Juicio del entrevistador sobre la edad en que se manifestaron por primera vez las anormalidades (si <36 meses, se coloca 1)" }
                    ]
                }
            }
        }
    };

    // Lógica de puntuación idéntica a AdiRForm
    const getEdadMeses = () => {
        if (!test?.fecha_nacimiento) return 0;
        const hoy = dayjs();
        const nacimiento = dayjs(test.fecha_nacimiento);
        return hoy.diff(nacimiento, "month");
    };

    const getPuntuacionAlgoritmica = (idPregunta) => {
        if (!test) return "";
        // Regla especial para el item 50: solo si algoritmo es "conducta" y edadMeses entre 48 y 59 (4-9 años)
        if (idPregunta === "50") {
            if (test.algoritmo === "conducta" && test.edadAlgoritmo === "4-9") {
                const edadMeses = getEdadMeses();
                if (edadMeses < 60) {
                    const codigo = respuestas?.[idPregunta]?.codigo;
                    if (codigo === undefined || codigo === "") return "";
                    return CONVERSION_CODIGO[codigo] ?? "";
                }
                return "";
            } else {
                const codigo = respuestas?.[idPregunta]?.codigo;
                if (codigo === undefined || codigo === "") return "";
                return CONVERSION_CODIGO[codigo] ?? "";
            }
        }
        if (idPregunta === "2") {
            const codigoOriginal = respuestas?.[idPregunta]?.codigo;
            if (codigoOriginal !== undefined && codigoOriginal !== "" && !isNaN(Number(codigoOriginal))) {
                if (Number(codigoOriginal) < 36) {
                    return 1;
                }
            }
            return 0;
        }
        if (idPregunta === "9") {
            const codigoOriginal = respuestas?.[idPregunta]?.codigo;
            if (codigoOriginal !== undefined && codigoOriginal !== "" && !isNaN(Number(codigoOriginal))) {
                if (Number(codigoOriginal) > 24) {
                    return 1;
                }
            }
            return 0;
        }
        if (idPregunta === "10") {
            const codigoOriginal = respuestas?.[idPregunta]?.codigo;
            if (codigoOriginal !== undefined && codigoOriginal !== "" && !isNaN(Number(codigoOriginal))) {
                if (Number(codigoOriginal) > 33) {
                    return 1;
                }
            }
            return 0;
        }
        if (idPregunta === "86") {
            const codigoOriginal = respuestas?.[idPregunta]?.codigo;
            if (Number(codigoOriginal) === 3 || Number(codigoOriginal) === 4) {
                return 1;
            }
            return 0;
        }
        if (idPregunta === "87") {
            const codigoOriginal = respuestas?.[idPregunta]?.codigo;
            if (codigoOriginal !== undefined && codigoOriginal !== "" && !isNaN(Number(codigoOriginal))) {
                if (Number(codigoOriginal) < 36) {
                    return 1;
                }
            }
            return 0;
        }
        if (idPregunta === "64") {
            const edadMeses = getEdadMeses();
            if (edadMeses >= 48 && edadMeses <= 119) {
                const codigo = respuestas?.[idPregunta]?.codigo;
                if (codigo === undefined || codigo === "") return "";
                return CONVERSION_CODIGO[codigo] ?? "";
            }
            return "";
        }
        if (idPregunta === "65") {
            const edadMeses = getEdadMeses();
            if (edadMeses >= 120) {
                const codigo = respuestas?.[idPregunta]?.codigo;
                if (codigo === undefined || codigo === "") return "";
                return CONVERSION_CODIGO[codigo] ?? "";
            }
            return "";
        }
        const codigo = respuestas?.[idPregunta]?.codigo;
        if (codigo === undefined || codigo === "") return "";
        return CONVERSION_CODIGO[codigo] ?? "";
    };

    const getTotalSubcategoria = (items, subKey) => {
        if (subKey === "C3" || subKey === "C4") {
            const vals = items.map(item => getPuntuacionAlgoritmica(item.id));
            const nums = vals.filter(v => typeof v === "number");
            return nums.length > 0 ? Math.max(...nums) : 0;
        }
        return items.reduce((acc, item) => {
            const val = getPuntuacionAlgoritmica(item.id);
            return acc + (typeof val === "number" ? val : 0);
        }, 0);
    };

    const getTotalSeccion = (seccion, clave) => {
        let total = 0;
        Object.entries(seccion.subcategorias)
            .forEach(([subKey, subcat]) => {
                total += getTotalSubcategoria(subcat.items, subKey);
            });
        return total;
    };

    const renderItem = (sub, item, idx, modo = "ACTUAL", seccionClave = "") => {
        const codigoOriginal = respuestas?.[item.id]?.codigo ?? "";
        return (
            <tr
                key={`${sub}-${item.id}-${modo}-${idx}`}
                style={{
                    background: idx % 2 === 0 ? "#f1f7fb" : "#e3eef7"
                }}
            >
                <td className="px-2 py-2 text-center font-mono" style={{ color: COLOR_DARK, fontWeight: 600 }}>{item.id}</td>
                <td
                    className="px-2 py-2"
                    style={{
                        color: COLOR_DARK,
                        ...(seccionClave === "D" ? { maxWidth: 260, minWidth: 180, whiteSpace: "normal", wordBreak: "break-word" } : {})
                    }}
                >
                    {item.label}
                </td>
                <td className="px-2 py-2 text-center">
                    <span
                        style={{
                            background: "#e0ecf7",
                            color: COLOR_PRIMARY,
                            borderRadius: 8,
                            padding: "4px 10px",
                            fontWeight: "bold",
                            fontSize: 16,
                            marginRight: 8,
                            border: `1px solid ${COLOR_PRIMARY}`,
                            minWidth: 28,
                            display: "inline-block"
                        }}
                        title="Código original"
                    >
                        {codigoOriginal}
                    </span>
                    <span
                        style={{
                            background: COLOR_PRIMARY,
                            color: "white",
                            borderRadius: 8,
                            padding: "4px 16px",
                            fontWeight: "bold",
                            fontSize: 18,
                            letterSpacing: 1
                        }}
                    >
                        {getPuntuacionAlgoritmica(item.id)}
                    </span>
                </td>
            </tr>
        );
    };

    // --- Diagnóstico diferencial automático según criterios (idéntico a AdiRForm) ---
    function calcularDiagnosticoDiferencial(respuestas, tipoAlgoritmo, edadAlgoritmo, tipoSujeto) {
        // --- Diagnóstico diferencial automático según criterios ---
        // Puntos de corte
        const PUNTOS_CORTE = {
            A: 10,
            B_VERBAL: 8,
            B_NOVERBAL: 7,
            C: 3,
            D: 1
        };

        // Obtiene los totales de cada dominio
        const totalA = getTotalSeccion(secciones.A, "A");
        const totalB = getTotalSeccion(secciones.B, "B");
        const totalC = getTotalSeccion(secciones.C, "C");
        const totalD = getTotalSeccion(secciones.D, "D");

        // Determina si el sujeto es verbal o no verbal para el punto de corte de B
        const puntoCorteB = tipoSujeto === "verbal" ? PUNTOS_CORTE.B_VERBAL : PUNTOS_CORTE.B_NOVERBAL;

        // --- Validación específica para Síndrome de Rett según criterios clínicos ---
        // Códigos relevantes
        const cod21 = respuestas?.["21"]?.codigo; // movimientos voluntarios de las manos
        const cod20 = respuestas?.["20"]?.codigo; // pérdida de habilidades durante por lo menos 3 meses
        const cod28 = respuestas?.["28"]?.codigo; // duración de la pérdida
        const cod79 = respuestas?.["79"]?.codigo; // movimientos de manos en la línea media del cuerpo
        const cod84 = respuestas?.["84"]?.codigo; // hiperventilación
        const cod85 = respuestas?.["85"]?.codigo; // desmayos/ataques/ausencias

        // Criterios principales Rett
        const rettMovManos = cod21 === "1" || cod21 === "2";
        const rettPerdidaHabilidades = cod20 === "2";
        const rettDuracionPerdida = cod28 === "993" || cod28 === "994";
        const rettMovLineaMedia = cod79 === "1" || cod79 === "2";
        // Criterios secundarios Rett
        const rettHiperventilacion = cod84 === "1" || cod84 === "2";
        const rettDesmayos = cod85 === "1" || cod85 === "2";

        // --- Validación específica para Trastorno desintegrativo infantil según criterios clínicos ---
        // Códigos relevantes
        const cod12 = respuestas?.["12"]?.codigo; // habla diaria, espontánea y significativa antes de la pérdida (0 = sí)
        const cod26 = respuestas?.["26"]?.codigo; // edad de la pérdida de habilidades de lenguaje (en meses, >=24)
        const cod87 = respuestas?.["87"]?.codigo; // aparición del TEA (en meses, >=24)

        // Criterios Trastorno desintegrativo infantil
        const tdiPerdidaHabilidades = cod20 === "2";
        const tdiEdadPerdidaLenguaje = cod26 !== undefined && !isNaN(Number(cod26)) && Number(cod26) >= 24;
        const tdiHablaPrevia = cod12 === "0";
        const tdiAparicionTEA = cod87 !== undefined && !isNaN(Number(cod87)) && Number(cod87) >= 24;

        // Diagnóstico diferencial automático
        let diagnosticoDiferencial = "";

        // Validación Rett primero, ya que es excluyente y relevante
        if (
            rettMovManos &&
            rettPerdidaHabilidades &&
            rettDuracionPerdida &&
            rettMovLineaMedia
        ) {
            diagnosticoDiferencial = "Perfil compatible con Síndrome de Rett: Se observa regresión persistente, pérdida de movimientos voluntarios de las manos, movimientos de manos en la línea media y duración prolongada de la pérdida de habilidades. Considere microcefalia progresiva (circunferencia de cabeza < percentil 3 tras los 6 meses) y revise antecedentes clínicos y genéticos. La presencia de hiperventilación y desmayos refuerza la sospecha, aunque no son obligatorios.";
        } else if (
            // Trastorno desintegrativo infantil: pérdida de habilidades (20=2), edad de pérdida de lenguaje >=24m (26), habla previa (12=0), aparición TEA >=24m (87)
            tdiPerdidaHabilidades && tdiEdadPerdidaLenguaje && tdiHablaPrevia && tdiAparicionTEA
        ) {
            diagnosticoDiferencial = "Perfil compatible con Trastorno desintegrativo infantil: Se observa una pérdida marcada de habilidades de lenguaje y no-lenguaje después de los 24 meses, tras un desarrollo previo aparentemente normal, con presencia de habla significativa antes de la pérdida y aparición del TEA a los 24 meses o más tarde. Este patrón sugiere una variante rara de TEA y requiere evaluación neurológica y clínica cuidadosa.";
        } else if (totalA < PUNTOS_CORTE.A && totalB < puntoCorteB && totalC < PUNTOS_CORTE.C) {
            diagnosticoDiferencial = "No confirmación consistente: Las puntuaciones están por debajo del punto de corte en los dominios A, B y C. Es improbable un diagnóstico de TEA, a menos que el ADOS sugiera lo contrario.";
        } else if (totalA >= PUNTOS_CORTE.A && totalB >= puntoCorteB && totalC >= PUNTOS_CORTE.C && totalD >= PUNTOS_CORTE.D) {
            // Confirmación clara de TEA
            const edadPrimerasPalabras = Number(respuestas?.["9"]?.codigo);
            const edadPrimerasFrases = Number(respuestas?.["10"]?.codigo);
            if (
                edadPrimerasPalabras > 0 && edadPrimerasPalabras < 24 &&
                edadPrimerasFrases > 0 && edadPrimerasFrases < 33
            ) {
                diagnosticoDiferencial = "Confirmación clara de TEA: Las puntuaciones están por encima del punto de corte en A, B, C y D. El perfil es compatible con un diagnóstico de Síndrome de Asperger (lenguaje desarrollado a edad esperada, sin deterioro cognitivo/adaptativo). Requiere confirmación mediante observación directa (ej. ADOS) y evaluación de CI/conducta adaptativa.";
            } else {
                diagnosticoDiferencial = "Confirmación clara de TEA: Las puntuaciones están por encima del punto de corte en A, B, C y D. El perfil es compatible con un diagnóstico de Trastorno del Espectro Autista. Requiere confirmación mediante observación directa (ej. ADOS).";
            }
        } else if (
            // TEA no especificado / TGD-NE: síntomas graves pero no cumple todos los criterios
            (totalA >= PUNTOS_CORTE.A || totalB >= puntoCorteB || totalC >= PUNTOS_CORTE.C) &&
            !(totalA >= PUNTOS_CORTE.A && totalB >= puntoCorteB && totalC >= PUNTOS_CORTE.C && totalD >= PUNTOS_CORTE.D)
        ) {
            diagnosticoDiferencial = "Resultados mixtos: Hay síntomas graves pero no se cumplen todos los criterios para un diagnóstico específico de TEA. Considere TEA no especificado (TGD-NE) o la posibilidad de otros trastornos.";
        } else {
            diagnosticoDiferencial = "Resultados mixtos o atípicos: Existen discrepancias entre dominios o entre ADI-R y ADOS. Se recomienda una evaluación clínica cuidadosa para descartar TEA atípico u otros trastornos.";
        }
        return diagnosticoDiferencial;
    }

    if (!test) {
        return (
            <div className="d-flex flex-column min-vh-100" style={{ background: COLOR_BG }}>
                <Navbar />
                <div className="container py-5 flex-grow-1 text-center">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Cargando...</span>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

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
                    onClick={() => navigate(-1)}
                >
                    Volver
                </button>
                <form className="p-4 max-w-5xl mx-auto space-y-10" style={{ background: COLOR_BG, borderRadius: 24 }}>
                    <div className=" border border-blue-100 rounded flex flex-col md:flex-row items-center justify-between gap-4 mb-2 px-2" style={{ background: "#e3eef7" }}>
                        <div>
                            <h1 style={{ color: COLOR_PRIMARY, fontWeight: 900, fontSize: 32, letterSpacing: 1 }}>ADI-R</h1>
                            <div className="text-lg font-semibold" style={{ color: COLOR_DARK }}>Ficha de Resultados</div>
                        </div>
                        <div className="flex flex-col items-end">
                            <span className="text-sm" style={{ color: COLOR_ACCENT, fontWeight: 600 }}>ID Test: {test.id_adir}</span>
                            <br />
                            <span className="text-sm" style={{ color: COLOR_ACCENT, fontWeight: 600 }}>Centro: OPPTA</span>
                        </div>
                    </div>
                    <section
                        className="shadow mb-3 border"
                        style={{
                            background: "linear-gradient(90deg, #e0ecf7 0%, #f8fafc 100%)",
                            borderRadius: 18,
                            borderColor: COLOR_PRIMARY,
                            padding: 28
                        }}
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-lg">
                            <div><b style={{ color: COLOR_PRIMARY }}>Nombre completo:</b> <span style={{ color: COLOR_DARK }}>{test.nombres} {test.apellidos}</span></div>
                            <div><b style={{ color: COLOR_PRIMARY }}>Fecha de nacimiento:</b> <span style={{ color: COLOR_DARK }}>{formatearFecha(test.fecha_nacimiento)}</span></div>
                            <div><b style={{ color: COLOR_PRIMARY }}>Sexo:</b> <span style={{ color: COLOR_DARK }}>{test.sexo}</span></div>
                            <div><b style={{ color: COLOR_PRIMARY }}>Edad cronológica:</b> <span style={{ color: COLOR_DARK }}>{calcularEdad(test.fecha_nacimiento)}</span></div>
                            <div><b style={{ color: COLOR_PRIMARY }}>Especialista:</b> <span style={{ color: COLOR_DARK }}>{test.especialista || ""}</span></div>
                            <div><b style={{ color: COLOR_PRIMARY }}>Fecha de la entrevista:</b> <span style={{ color: COLOR_DARK }}>{formatearFecha(test.fecha_entrevista)}</span></div>
                            <div><b style={{ color: COLOR_PRIMARY }}>Algoritmo:</b> <span style={{ color: COLOR_DARK }}>{test.algoritmo}</span></div>
                        </div>
                    </section>
                    {Object.entries(secciones).map(([clave, seccion]) => (
                        <section
                            key={clave}
                            className="shadow border mb-3"
                            style={{
                                background: "#f1f7fb",
                                borderRadius: 18,
                                borderColor: COLOR_PRIMARY,
                                padding: 24
                            }}
                        >
                            <h3 className="text-2xl font-bold mb-6" style={{ color: COLOR_PRIMARY, letterSpacing: 1 }}>
                                {seccion.titulo}
                            </h3>
                            {Object.entries(seccion.subcategorias).map(([sub, subcat]) => (
                                <div key={sub} className="mb-8">
                                    <h4 className="text-lg font-semibold mb-3" style={{ color: COLOR_DARK }}>{subcat.titulo}</h4>
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full w-full border border-blue-100 rounded" style={{ background: "#e3eef7" }}>
                                            <thead>
                                                <tr style={{ background: COLOR_PRIMARY }}>
                                                    <th className="px-2 py-2 text-center font-semibold text-white">ID</th>
                                                    <th className="px-2 py-2 text-left font-semibold text-white">Descripción</th>
                                                    <th className="px-2 py-2 text-center font-semibold text-white">
                                                        Código <span style={{ fontWeight: 400 }}>/ Puntuación</span>
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {subcat.items.map((item, idx) => renderItem(sub, item, idx, "ACTUAL", clave))}
                                                <tr>
                                                    <td colSpan={3} className="px-2 py-3 text-right font-bold" style={{
                                                        background: "linear-gradient(90deg, #f3859d22 0%, #457b9d11 100%)",
                                                        color: COLOR_PRIMARY,
                                                        borderTop: `2px solid ${COLOR_ACCENT}`,
                                                        fontSize: 18,
                                                        letterSpacing: 1
                                                    }}>
                                                        <span style={{
                                                            background: COLOR_ACCENT,
                                                            color: "white",
                                                            borderRadius: 8,
                                                            padding: "6px 32px",
                                                            fontWeight: 700,
                                                            fontSize: 20,
                                                            boxShadow: "0 2px 8px #f3859d33"
                                                        }}>
                                                            Total {sub}: {getTotalSubcategoria(subcat.items, sub)}
                                                        </span>
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            ))}
                            <div className="w-full flex mt-4">
                                <div
                                    className="w-full flex items-center justify-end"
                                    style={{
                                        marginTop: 0
                                    }}
                                >
                                    <span
                                        style={{
                                            background: "#fff",
                                            color: COLOR_PRIMARY,
                                            borderRadius: 8,
                                            padding: "8px 32px",
                                            fontWeight: 700,
                                            fontSize: 20,
                                            border: `1.5px solid ${COLOR_ACCENT}`,
                                            boxShadow: "0 1px 6px #457b9d11",
                                            letterSpacing: 1,
                                            display: "inline-block"
                                        }}
                                    >
                                        Total {clave}: {getTotalSeccion(seccion, clave)}
                                    </span>
                                </div>
                            </div>
                        </section>
                    ))}
                </form>

                {/* Diagnóstico diferencial */}
                {diagnosticoDiferencial && (
                    <div className="mt-5 mb-5 d-flex justify-content-center">
                        <div
                            className="card shadow"
                            style={{
                                borderTop: `6px solid ${COLOR_ACCENT}`,
                                borderRadius: 18,
                                background: "#fff",
                                width: "100%",
                                maxWidth: 700,
                                minWidth: 320
                            }}
                        >
                            <div
                                className="card-header d-flex align-items-center"
                                style={{
                                    background: COLOR_PRIMARY,
                                    borderTopLeftRadius: 18,
                                    borderTopRightRadius: 18,
                                    borderBottom: `2px solid ${COLOR_ACCENT}`,
                                    padding: "22px 32px 18px 32px",
                                    gap: 14
                                }}
                            >
                                <svg width={28} height={28} fill="none" viewBox="0 0 24 24">
                                    <circle cx="12" cy="12" r="10" stroke={COLOR_ACCENT} strokeWidth="2" fill="none" />
                                    <path strokeLinecap="round" strokeLinejoin="round" stroke={COLOR_ACCENT} strokeWidth="2" d="M12 8v4m0 4h.01" />
                                </svg>
                                <span style={{
                                    color: "white",
                                    fontWeight: 900,
                                    fontSize: 24,
                                    letterSpacing: 1.2
                                }}>
                                    Diagnóstico diferencial
                                </span>
                            </div>
                            <div className="card-body" style={{ background: "#f8fafc", padding: "32px" }}>
                                <div
                                    style={{
                                        minHeight: 60,
                                        background: "#e3eef7",
                                        borderRadius: 12,
                                        padding: "18px 22px",
                                        color: COLOR_PRIMARY,
                                        fontSize: 17,
                                        fontWeight: 500,
                                        fontStyle: "italic",
                                        boxShadow: "0 1px 6px #457b9d11",
                                        border: `1px solid #dbeafe`
                                    }}
                                >
                                    {diagnosticoDiferencial}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Diagnóstico final */}
                <div className="mt-5 mb-8 d-flex justify-content-center">
                    <div
                        className="card shadow"
                        style={{
                            borderTop: `6px solid ${COLOR_ACCENT}`,
                            borderRadius: 18,
                            background: "#fff",
                            width: "100%",
                            maxWidth: 700,
                            minWidth: 320
                        }}
                    >
                        <div
                            className="card-header d-flex align-items-center"
                            style={{
                                background: COLOR_PRIMARY,
                                borderTopLeftRadius: 18,
                                borderTopRightRadius: 18,
                                borderBottom: `2px solid ${COLOR_ACCENT}`,
                                padding: "22px 32px 18px 32px",
                                gap: 14
                            }}
                        >
                            <svg width={28} height={28} fill="none" viewBox="0 0 24 24">
                                <circle cx="12" cy="12" r="10" stroke={COLOR_ACCENT} strokeWidth="2" fill="none" />
                                <path strokeLinecap="round" strokeLinejoin="round" stroke={COLOR_ACCENT} strokeWidth="2" d="M12 8v4m0 4h.01" />
                            </svg>
                            <span style={{
                                color: "white",
                                fontWeight: 900,
                                fontSize: 24,
                                letterSpacing: 1.2
                            }}>
                                Diagnóstico final del especialista
                            </span>
                        </div>
                        <div className="card-body" style={{ background: "#f8fafc", padding: "32px" }}>
                            <div className="mb-4">
                                <div
                                    style={{
                                        minHeight: 60,
                                        background: "#e3eef7",
                                        borderRadius: 12,
                                        padding: "18px 22px",
                                        color: COLOR_PRIMARY,
                                        fontSize: 17,
                                        fontWeight: 500,
                                        fontStyle: "italic",
                                        boxShadow: "0 1px 6px #457b9d11",
                                        border: `1px solid #dbeafe`
                                    }}
                                >
                                    {diagnosticoFinal || "Sin diagnóstico final registrado."}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default ResumenADIR;