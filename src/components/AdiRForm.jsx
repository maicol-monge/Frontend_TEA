import React, { useState, useEffect } from "react";
import dayjs from "dayjs";
import axios from "axios";
import { apiUrl } from "../config/apiConfig";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2"; // <-- Agrega esta líne


// Paleta de colores de la app
const COLOR_PRIMARY = "#457b9d";
const COLOR_ACCENT = "#f3859e";
const COLOR_DARK = "#1d3557";
const COLOR_BG = "#f8fafc";

// Debe coincidir con la tabla de conversión de Algoritmo.jsx
const CONVERSION_CODIGO = {
    0: 0,
    1: 1,
    2: 2,
    3: 2,
    7: 0,
    8: 0,
    9: 0
};

const calcularEdad = (fechaNacimiento) => {
    if (!fechaNacimiento) return "";
    const hoy = dayjs();
    const nacimiento = dayjs(fechaNacimiento);
    const años = hoy.diff(nacimiento, "year");
    const meses = hoy.diff(nacimiento.add(años, 'year'), 'month');
    return `${años} años, ${meses} meses`;
};

const formatearFecha = (fecha) => {
    if (!fecha) return "";
    return dayjs(fecha).format("DD/MM/YYYY");
};

const AdiRForm = ({
    id_adir,
    datosPaciente,
    respuestas,
    tipoAlgoritmo,
    edadAlgoritmo,
    tipoSujeto,
    algoritmoSeleccionado,
    edadSeleccionada
}) => {
    const [especialista, setEspecialista] = useState("");
    const [algoritmoSel, setAlgoritmoSel] = useState(algoritmoSeleccionado || "");
    const [edadSel, setEdadSel] = useState(edadSeleccionada || "");
    const [fechaEntrevista, setFechaEntrevista] = useState(datosPaciente?.fecha_entrevista || "");
    const [diagnosticoFinal, setDiagnosticoFinal] = useState("");
    const [guardando, setGuardando] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        try {
            const user = JSON.parse(localStorage.getItem("user"));
            const nombreUsuario = user?.nombres + " " + user?.apellidos || "Usuario";
            setEspecialista(nombreUsuario);
        } catch {
            setEspecialista("");
        }
    }, []);

    useEffect(() => {
        setAlgoritmoSel(algoritmoSeleccionado || "");
    }, [algoritmoSeleccionado]);

    useEffect(() => {
        setEdadSel(edadSeleccionada || "");
    }, [edadSeleccionada]);

    // Obtener la fecha de la entrevista desde el backend usando id_adir
    useEffect(() => {
        const fetchFechaEntrevista = async () => {
            if (!id_adir) return;
            try {
                const token = localStorage.getItem("token");
                const res = await axios.get(
                    apiUrl(`/api/adir/fecha-entrevista/${id_adir}`),
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                if (res.data?.fecha_entrevista) {
                    setFechaEntrevista(res.data.fecha_entrevista);
                }
            } catch (err) {
                // Si hay error, no sobreescribas la fecha si ya existe en datosPaciente
            }
        };
        fetchFechaEntrevista();
    }, [id_adir]);

    // Calcula la edad en meses del paciente
    const getEdadMeses = () => {
        if (!datosPaciente?.fecha_nacimiento) return 0;
        const hoy = dayjs();
        const nacimiento = dayjs(datosPaciente.fecha_nacimiento);
        return hoy.diff(nacimiento, "month");
    };

    // Validación para algoritmo de conducta actual 10+ sólo verbal
    const mostrarAdvertenciaConductaNoVerbal =
        tipoAlgoritmo === "conducta" &&
        edadAlgoritmo === "10+" &&
        tipoSujeto === "no-verbal";

    const getPuntuacionAlgoritmica = (idPregunta) => {
        // Regla especial para el item 50: solo si algoritmo es "conducta" y edadMeses entre 48 y 59 (4-9 años)
        if (idPregunta === "50") {
            if (tipoAlgoritmo === "conducta" && edadAlgoritmo === "4-9") {
                const edadMeses = getEdadMeses();
                if (edadMeses < 60) { // menor de 5 años
                    const codigo = respuestas?.[idPregunta]?.codigo;
                    if (codigo === undefined || codigo === "") return "";
                    return CONVERSION_CODIGO[codigo] ?? "";
                }
                // Si es 5 años o más, no mostrar puntuación
                return "";
            } else {
                // Si no es algoritmo conducta 4-9, mostrar normalmente
                const codigo = respuestas?.[idPregunta]?.codigo;
                if (codigo === undefined || codigo === "") return "";
                return CONVERSION_CODIGO[codigo] ?? "";
            }
        }

        // Regla especial para el item 2 de la sección D (id: "2")
        if (idPregunta === "2") {
            const codigoOriginal = respuestas?.[idPregunta]?.codigo;
            if (codigoOriginal !== undefined && codigoOriginal !== "" && !isNaN(Number(codigoOriginal))) {
                if (Number(codigoOriginal) < 36) {
                    return 1;
                }
            }
            return 0;
        }
        // Regla especial para el item 9 de la sección D (id: "9")
        if (idPregunta === "9") {
            const codigoOriginal = respuestas?.[idPregunta]?.codigo;
            if (codigoOriginal !== undefined && codigoOriginal !== "" && !isNaN(Number(codigoOriginal))) {
                if (Number(codigoOriginal) > 24) {
                    return 1;
                }
            }
            return 0;
        }
        // Regla especial para el item 10 de la sección D (id: "10")
        if (idPregunta === "10") {
            const codigoOriginal = respuestas?.[idPregunta]?.codigo;
            if (codigoOriginal !== undefined && codigoOriginal !== "" && !isNaN(Number(codigoOriginal))) {
                if (Number(codigoOriginal) > 33) {
                    return 1;
                }
            }
            return 0;
        }
        // Regla especial para el item 86 de la sección D (id: "86")
        if (idPregunta === "86") {
            const codigoOriginal = respuestas?.[idPregunta]?.codigo;
            if (Number(codigoOriginal) === 3 || Number(codigoOriginal) === 4) {
                return 1;
            }
            return 0;
        }
        // Regla especial para el item 87 de la sección D (id: "87")
        if (idPregunta === "87") {
            const codigoOriginal = respuestas?.[idPregunta]?.codigo;
            if (codigoOriginal !== undefined && codigoOriginal !== "" && !isNaN(Number(codigoOriginal))) {
                if (Number(codigoOriginal) < 36) {
                    return 1;
                }
            }
            return 0;
        }
        // Regla especial para los ítems 64 y 65 según la edad
        if (idPregunta === "64") {
            const edadMeses = getEdadMeses();
            // Solo puntuar si tiene entre 4 años, 0 meses y 9 años, 11 meses (48 a 119 meses)
            if (edadMeses >= 48 && edadMeses <= 119) {
                const codigo = respuestas?.[idPregunta]?.codigo;
                if (codigo === undefined || codigo === "") return "";
                return CONVERSION_CODIGO[codigo] ?? "";
            }
            // Si no está en el rango, no puntuar
            return "";
        }
        if (idPregunta === "65") {
            const edadMeses = getEdadMeses();
            // Solo puntuar si tiene 10 años o más (120 meses o más)
            if (edadMeses >= 120) {
                const codigo = respuestas?.[idPregunta]?.codigo;
                if (codigo === undefined || codigo === "") return "";
                return CONVERSION_CODIGO[codigo] ?? "";
            }
            // Si no está en el rango, no puntuar
            return "";
        }

        // Resto de preguntas: conversión normal
        const codigo = respuestas?.[idPregunta]?.codigo;
        if (codigo === undefined || codigo === "") return "";
        return CONVERSION_CODIGO[codigo] ?? "";
    };

    // Suma total de una subcategoría
    const getTotalSubcategoria = (items, subKey) => {
        // Para C3 y C4, solo tomar la puntuación más alta de las dos preguntas
        if (subKey === "C3" || subKey === "C4") {
            const vals = items.map(item => getPuntuacionAlgoritmica(item.id));
            // Filtra solo números válidos
            const nums = vals.filter(v => typeof v === "number");
            return nums.length > 0 ? Math.max(...nums) : 0;
        }
        // Para las demás subcategorías, suma normal
        return items.reduce((acc, item) => {
            const val = getPuntuacionAlgoritmica(item.id);
            return acc + (typeof val === "number" ? val : 0);
        }, 0);
    };

    // Suma total de una sección (A, B, C)
    const getTotalSeccion = (seccion, clave) => {
        let total = 0;
        Object.entries(seccion.subcategorias)
            // Aplica el mismo filtro que en el renderizado para la sección B
            .filter(([subKey, _]) => {
                if (clave !== "B") return true;
                if (tipoSujeto === "verbal") {
                    return ["B1", "B2", "B3", "B4"].includes(subKey);
                } else if (tipoSujeto === "no-verbal") {
                    return ["B1", "B4"].includes(subKey);
                }
                return true;
            })
            .forEach(([subKey, subcat]) => {
                total += getTotalSubcategoria(subcat.items, subKey);
            });
        return total;
    };

    const renderItem = (sub, item, idx, modo = "ACTUAL", seccionClave = "") => {
        // Obtener el código original para mostrarlo
        const codigoOriginal = respuestas?.[item.id]?.codigo ?? "";
        return (
            <tr
                key={`${sub}-${item.id}-${modo}-${idx}`}
                style={{
                    background: idx % 2 === 0 ? "#f1f7fb" : "#e3eef7"
                }}
            >
                <td className="px-2 py-2 text-center font-mono" style={{ color: COLOR_DARK, fontWeight: 600 }}>{item.id}</td>
                {/* Limitar ancho del texto en sección D */}
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

    // Guardar diagnóstico final y actualizar test_adi_r
    const guardarDiagnosticoFinal = async () => {
        if (!diagnosticoFinal.trim()) {
            Swal.fire({
                icon: "warning",
                title: "Campo requerido",
                text: "Por favor, ingrese el diagnóstico final.",
                confirmButtonColor: COLOR_ACCENT
            });
            return;
        }
        setGuardando(true);
        try {
            const token = localStorage.getItem("token");
            await axios.put(
                apiUrl(`/api/adir/guardar-diagnostico-final/${id_adir}`),
                {
                    algoritmo: algoritmoSeleccionado || tipoAlgoritmo,
                    diagnostico: diagnosticoFinal,
                    estado: 1
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            await Swal.fire({
                icon: "success",
                title: "Guardado",
                text: "Diagnóstico final guardado correctamente.",
                confirmButtonColor: COLOR_ACCENT
            });
            navigate(`/tests-paciente/${datosPaciente.id_paciente}`);
        } catch (err) {
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "Error al guardar el diagnóstico final.",
                confirmButtonColor: COLOR_ACCENT
            });
        }
        setGuardando(false);
    };

    return (
        <form className="p-4 max-w-5xl mx-auto space-y-10" style={{ background: COLOR_BG, borderRadius: 24 }}>
            {/* Encabezado tipo ficha */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-2 px-2">
                <div>
                    <h1 style={{ color: COLOR_PRIMARY, fontWeight: 900, fontSize: 32, letterSpacing: 1 }}>ADI-R</h1>
                    <div className="text-lg font-semibold" style={{ color: COLOR_DARK }}>Ficha de Resultados</div>
                </div>
                <div className="flex flex-col items-end">
                    <span className="text-sm" style={{ color: COLOR_ACCENT, fontWeight: 600 }}>ID Test: {id_adir}</span>
                    <br />
                    <span className="text-sm" style={{ color: COLOR_ACCENT, fontWeight: 600 }}>Centro: OPPTA</span>
                </div>
            </div>
            {/* Datos generales */}
            <section
                className="shadow mb-8 border"
                style={{
                    background: "linear-gradient(90deg, #e0ecf7 0%, #f8fafc 100%)",
                    borderRadius: 18,
                    borderColor: COLOR_PRIMARY,
                    padding: 28
                }}
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-lg">
                    <div><b style={{ color: COLOR_PRIMARY }}>Nombre completo:</b> <span style={{ color: COLOR_DARK }}>{datosPaciente?.nombres} {datosPaciente?.apellidos}</span></div>
                    <div><b style={{ color: COLOR_PRIMARY }}>Fecha de nacimiento:</b> <span style={{ color: COLOR_DARK }}>{formatearFecha(datosPaciente?.fecha_nacimiento)}</span></div>
                    <div><b style={{ color: COLOR_PRIMARY }}>Sexo:</b> <span style={{ color: COLOR_DARK }}>{datosPaciente?.sexo}</span></div>
                    <div><b style={{ color: COLOR_PRIMARY }}>Edad cronológica:</b> <span style={{ color: COLOR_DARK }}>{datosPaciente ? calcularEdad(datosPaciente.fecha_nacimiento) : ""}</span></div>
                    <div><b style={{ color: COLOR_PRIMARY }}>Especialista:</b> <span style={{ color: COLOR_DARK }}>{especialista}</span></div>
                    <div><b style={{ color: COLOR_PRIMARY }}>Fecha de la entrevista:</b> <span style={{ color: COLOR_DARK }}>{formatearFecha(fechaEntrevista)}</span></div>
                </div>
            </section>
            {/* ADVERTENCIA para algoritmo de conducta actual 10+ no verbal */}
            {mostrarAdvertenciaConductaNoVerbal && (
                <div
                    className="mb-6 p-4 rounded-lg border border-red-300 bg-red-50 flex items-center"
                    style={{
                        color: "#b91c1c",
                        fontWeight: 600,
                        fontSize: 18
                    }}
                >
                    <svg style={{ width: 28, height: 28, marginRight: 12 }} fill="none" stroke="#b91c1c" strokeWidth="2" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" stroke="#b91c1c" strokeWidth="2" fill="none" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01" />
                    </svg>
                    El algoritmo de la conducta actual para 10 años en adelante sólo es aplicable a sujetos <b>verbales</b> (pregunta 30 = 0).<br />
                    Para este grupo de edad <b>no existe un algoritmo de conducta actual</b> para sujetos "no verbales" (pregunta 30 = 1 ó 2).
                </div>
            )}
            {/* Si aplica la advertencia, NO renderizar el resto de secciones */}
            {!mostrarAdvertenciaConductaNoVerbal && (
                <>
                    {/* Secciones A a D */}
                    {Object.entries(secciones).map(([clave, seccion]) => (
                        // Mostrar sección D solo si el algoritmo es "diagnostico"
                        (clave !== "D" || tipoAlgoritmo === "diagnostico") && (
                            <section
                                key={clave}
                                className="shadow border mb-10"
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
                                {Object.entries(seccion.subcategorias)
                                    // FILTRO ESPECIAL PARA SECCIÓN B SEGÚN TIPO DE SUJETO
                                    .filter(([sub, _]) => {
                                        if (clave !== "B") return true;
                                        if (tipoSujeto === "verbal") {
                                            // Mostrar B1, B4, B2, B3 para verbales
                                            return ["B1", "B2", "B3", "B4"].includes(sub);
                                        } else if (tipoSujeto === "no-verbal") {
                                            // Mostrar solo B1 y B4 para no verbales
                                            return ["B1", "B4"].includes(sub);
                                        }
                                        return true;
                                    })
                                    .map(([sub, subcat]) => (
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
                                                                background: "linear-gradient(90deg, #f3859e22 0%, #457b9d11 100%)",
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
                                                                    boxShadow: "0 2px 8px #f3859e33"
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
                                {/* Totales por sección solo para A, B y C */}
                                {["A", "B", "C", "D"].includes(clave) && (
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
                                )}
                            </section>
                        )
                    ))}
                </>
            )}
            {/* Diagnóstico diferencial y área de diagnóstico del especialista */}
            {!mostrarAdvertenciaConductaNoVerbal && tipoAlgoritmo === "diagnostico" && (
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
                                    {diagnosticoDiferencial}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Diagnóstico del especialista SIEMPRE visible */}
            {!mostrarAdvertenciaConductaNoVerbal && (
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
                                Diagnóstico del especialista
                            </span>
                        </div>
                        <div className="card-body" style={{ background: "#f8fafc", padding: "32px" }}>
                            <div className="mb-4">
                                <label
                                    className="form-label"
                                    style={{ color: COLOR_PRIMARY, fontSize: 17, letterSpacing: 0.5 }}
                                >
                                    Diagnóstico del especialista
                                </label>
                                <textarea
                                    className="form-control"
                                    rows={4}
                                    placeholder="Ingrese aquí el diagnóstico final"
                                    style={{
                                        fontSize: 16,
                                        color: COLOR_DARK,
                                        background: "#f1f7fb",
                                        resize: "vertical",
                                        minHeight: 90,
                                        boxShadow: "0 1px 6px #457b9d11",
                                        border: "1px solid #b6d4fe"
                                    }}
                                    value={diagnosticoFinal}
                                    onChange={e => setDiagnosticoFinal(e.target.value)}
                                    disabled={guardando}
                                />
                            </div>
                            <div className="d-flex justify-content-end">
                                <button
                                    type="button"
                                    className="btn"
                                    style={{
                                        background: COLOR_ACCENT,
                                        color: "#fff",
                                        fontWeight: "bold",
                                        fontSize: 18,
                                        letterSpacing: 1,
                                        boxShadow: "0 2px 8px #f3859e33"
                                    }}
                                    onClick={guardarDiagnosticoFinal}
                                    disabled={guardando}
                                >
                                    {guardando ? "Guardando..." : "Guardar resultados de evaluación"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </form>
    );
};

export default AdiRForm;
