import { useRef, useMemo } from "react";
import html2pdf from "html2pdf.js";

// --- Lógica de secciones y subcategorías igual que ResumenADIR.jsx ---
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

const CONVERSION_CODIGO = { 0: 0, 1: 1, 2: 2, 3: 2, 7: 0, 8: 0, 9: 0, "0": 0, "1": 1, "2": 2, "3": 2, "7": 0, "8": 0, "9": 0 };

// Mapea respuestas por id_pregunta para acceso rápido
const respuestasMap = (datos) => {
  const map = {};
  if (datos.respuestas) {
    datos.respuestas.forEach(r => {
      map[String(r.id_pregunta)] = r;
    });
  }
  return map;
};

// Lógica igual a ResumenADIR.jsx
function getPuntuacionAlgoritmica(idPregunta, datos, edadMeses) {
  const respuesta = respuestasMap(datos)[String(idPregunta)];
  const codigo = respuesta?.codigo;
  const algoritmo = datos.algoritmo;
  // Calcula edadAlgoritmo igual que en el profesional
  let edadAlgoritmo = "";
  if (edadMeses >= 48 && edadMeses <= 119) edadAlgoritmo = "4-9";
  else if (edadMeses >= 120) edadAlgoritmo = "10+";

  // Regla especial para el item 50
  if (idPregunta === "50") {
    if (algoritmo === "conducta" && edadAlgoritmo === "4-9") {
      if (edadMeses < 60) {
        if (codigo === undefined || codigo === "") return 0;
        return CONVERSION_CODIGO[String(codigo)] ?? 0;
      }
      return 0;
    } else {
      if (codigo === undefined || codigo === "") return 0;
      return CONVERSION_CODIGO[String(codigo)] ?? 0;
    }
  }

  // ...el resto de tus reglas especiales...
  if (idPregunta === "2") {
    if (codigo !== undefined && codigo !== "" && !isNaN(Number(codigo))) {
      if (Number(codigo) < 36) return 1;
    }
    return 0;
  }
  if (idPregunta === "9") {
    if (codigo !== undefined && codigo !== "" && !isNaN(Number(codigo))) {
      if (Number(codigo) > 24) return 1;
    }
    return 0;
  }
  if (idPregunta === "10") {
    if (codigo !== undefined && codigo !== "" && !isNaN(Number(codigo))) {
      if (Number(codigo) > 33) return 1;
    }
    return 0;
  }
  if (idPregunta === "86") {
    if (Number(codigo) === 3 || Number(codigo) === 4) return 1;
    return 0;
  }
  if (idPregunta === "87") {
    if (codigo !== undefined && codigo !== "" && !isNaN(Number(codigo))) {
      if (Number(codigo) < 36) return 1;
    }
    return 0;
  }
  if (idPregunta === "64") {
    if (edadMeses >= 48 && edadMeses <= 119) {
      return CONVERSION_CODIGO[String(codigo)] ?? 0;
    }
    return 0;
  }
  if (idPregunta === "65") {
    if (edadMeses >= 120) {
      return CONVERSION_CODIGO[String(codigo)] ?? 0;
    }
    return 0;
  }
  return CONVERSION_CODIGO[String(codigo)] ?? 0;
}

// Igual que en ResumenADIR.jsx
function getTotalSubcategoria(items, subKey, datos, edadMeses) {
  if (subKey === "C3" || subKey === "C4") {
    const vals = items.map(item => getPuntuacionAlgoritmica(item.id, datos, edadMeses));
    const nums = vals.filter(v => typeof v === "number");
    return nums.length > 0 ? Math.max(...nums) : 0;
  }
  return items.reduce((acc, item) => {
    const val = getPuntuacionAlgoritmica(item.id, datos, edadMeses);
    return acc + (typeof val === "number" ? val : 0);
  }, 0);
}

function getTotalSeccion(seccion, clave, datos, edadMeses) {
  let total = 0;
  Object.entries(seccion.subcategorias)
    .forEach(([subKey, subcat]) => {
      total += getTotalSubcategoria(subcat.items, subKey, datos, edadMeses);
    });
  return total;
}

// Ahora calcula los totales por área igual que in ResumenADIR.jsx
const totales = (datos, edadMeses) => ({
  A: getTotalSeccion(secciones.A, "A", datos, edadMeses),
  B: getTotalSeccion(secciones.B, "B", datos, edadMeses),
  C: getTotalSeccion(secciones.C, "C", datos, edadMeses),
  D: getTotalSeccion(secciones.D, "D", datos, edadMeses),
});

function formatFecha(fechaStr) {
  if (!fechaStr) return "";
  const d = new Date(fechaStr);
  if (isNaN(d)) return fechaStr;
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

export default function ReportAdiR_paciente({ datos }) {
  const melonFuerte = "#FF8C69";
  const grisOscuro = "#6C6F73";
  const COLOR_BG = "#f8f9fa";
  const reportRef = useRef();

  // Si no hay datos, muestra un mensaje
  if (!datos) return <div className="text-center my-5">Cargando reporte...</div>;

  // Calcula edad en meses si tienes fecha_nacimiento (ajusta si tu backend la manda)
  const fechaNacimiento = datos.fecha_nacimiento;
  const edadMeses = useMemo(() => {
    if (!fechaNacimiento) return 0;
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);
    return (hoy.getFullYear() - nacimiento.getFullYear()) * 12 + (hoy.getMonth() - nacimiento.getMonth());
  }, [fechaNacimiento]);

  // Calcula los totales por área usando el id de la sección y el id_pregunta de la respuesta
  const totalesCalculados = useMemo(() => totales(datos, edadMeses), [datos, edadMeses]);

  const exportarPDF = () => {
    if (!reportRef.current) return;
    const element = reportRef.current;
    const opt = {
      margin: 0.3,
      filename: "Resumen-ADI-R.pdf",
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
    };
    html2pdf().set(opt).from(element).save();
  };

  console.log("A items", secciones.A.subcategorias, datos.respuestas.map(r => [r.id_pregunta, r.codigo]));

  // Justo antes del return de tu componente:
  console.log(
    "A items (id, codigo original, codigo algoritmico):",
    Object.values(secciones.A.subcategorias)
      .flatMap(subcat => subcat.items)
      .map(item => ({
        id: item.id,
        codigo: respuestasMap(datos)[String(item.id)]?.codigo,
        algoritmico: getPuntuacionAlgoritmica(item.id, datos, edadMeses)
      }))
  );

  function calcularDiagnosticoDiferencial() {
    const PUNTOS_CORTE = {
      A: 10,
      B_VERBAL: 8,
      B_NOVERBAL: 7,
      C: 3,
      D: 1
    };

    const totalA = totalesCalculados.A;
    const totalB = totalesCalculados.B;
    const totalC = totalesCalculados.C;
    const totalD = totalesCalculados.D;

    const tipoSujeto = (datos.tipo_sujeto || "").toLowerCase().replace(/\s|_/g, "-");
    const puntoCorteB = tipoSujeto === "verbal" ? PUNTOS_CORTE.B_VERBAL : PUNTOS_CORTE.B_NOVERBAL;

    const respuestas = respuestasMap(datos);
    const cod21 = respuestas["21"]?.codigo;
    const cod20 = respuestas["20"]?.codigo;
    const cod28 = respuestas["28"]?.codigo;
    const cod79 = respuestas["79"]?.codigo;
    const cod84 = respuestas["84"]?.codigo;
    const cod85 = respuestas["85"]?.codigo;
    const cod12 = respuestas["12"]?.codigo;
    const cod26 = respuestas["26"]?.codigo;
    const cod87 = respuestas["87"]?.codigo;

    const rettMovManos = cod21 === "1" || cod21 === "2";
    const rettPerdidaHabilidades = cod20 === "2";
    const rettDuracionPerdida = cod28 === "993" || cod28 === "994";
    const rettMovLineaMedia = cod79 === "1" || cod79 === "2";

    const tdiPerdidaHabilidades = cod20 === "2";
    const tdiEdadPerdidaLenguaje = cod26 !== undefined && !isNaN(Number(cod26)) && Number(cod26) >= 24;
    const tdiHablaPrevia = cod12 === "0";
    const tdiAparicionTEA = cod87 !== undefined && !isNaN(Number(cod87)) && Number(cod87) >= 24;

    let diagnosticoDiferencial = "";

    if (
      rettMovManos &&
      rettPerdidaHabilidades &&
      rettDuracionPerdida &&
      rettMovLineaMedia
    ) {
      diagnosticoDiferencial = "Perfil compatible con Síndrome de Rett: Se observa regresión persistente, pérdida de movimientos voluntarios de las manos, movimientos de manos en la línea media y duración prolongada de la pérdida de habilidades. Considere microcefalia progresiva (circunferencia de cabeza < percentil 3 tras los 6 meses) y revise antecedentes clínicos y genéticos.";
    } else if (
      tdiPerdidaHabilidades && tdiEdadPerdidaLenguaje && tdiHablaPrevia && tdiAparicionTEA
    ) {
      diagnosticoDiferencial = "Perfil compatible con Trastorno desintegrativo infantil: Se observa una pérdida marcada de habilidades de lenguaje y no-lenguaje después de los 24 meses, tras un desarrollo previo aparentemente normal, con presencia de habla significativa antes de la pérdida y aparición del TEA a los 24 meses o más tarde.";
    } else if (totalA < PUNTOS_CORTE.A && totalB < puntoCorteB && totalC < PUNTOS_CORTE.C) {
      diagnosticoDiferencial = "No confirmación consistente: Las puntuaciones están por debajo del punto de corte en los dominios A, B y C. Es improbable un diagnóstico de TEA, a menos que el ADOS sugiera lo contrario.";
    } else if (totalA >= PUNTOS_CORTE.A && totalB >= puntoCorteB && totalC >= PUNTOS_CORTE.C && totalD >= PUNTOS_CORTE.D) {
      const edadPrimerasPalabras = Number(respuestas["9"]?.codigo);
      const edadPrimerasFrases = Number(respuestas["10"]?.codigo);
      if (
        edadPrimerasPalabras > 0 && edadPrimerasPalabras < 24 &&
        edadPrimerasFrases > 0 && edadPrimerasFrases < 33
      ) {
        diagnosticoDiferencial = "Confirmación clara de TEA: Las puntuaciones están por encima del punto de corte en A, B, C y D. El perfil es compatible con un diagnóstico de Síndrome de Asperger (lenguaje desarrollado a edad esperada, sin deterioro cognitivo/adaptativo).";
      } else {
        diagnosticoDiferencial = "Confirmación clara de TEA: Las puntuaciones están por encima del punto de corte en A, B, C y D. El perfil es compatible con un diagnóstico de Trastorno del Espectro Autista.";
      }
    } else if (
      (totalA >= PUNTOS_CORTE.A || totalB >= puntoCorteB || totalC >= PUNTOS_CORTE.C) &&
      !(totalA >= PUNTOS_CORTE.A && totalB >= puntoCorteB && totalC >= PUNTOS_CORTE.C && totalD >= PUNTOS_CORTE.D)
    ) {
      diagnosticoDiferencial = "Resultados mixtos: Hay síntomas graves pero no se cumplen todos los criterios para un diagnóstico específico de TEA. Considere TEA no especificado (TGD-NE) o la posibilidad de otros trastornos.";
    } else {
      diagnosticoDiferencial = "Resultados mixtos o atípicos: Existen discrepancias entre dominios o entre ADI-R y ADOS. Se recomienda una evaluación clínica cuidadosa para descartar TEA atípico u otros trastornos.";
    }
    return diagnosticoDiferencial;
  }

  return (
    <div className="d-flex flex-column min-vh-100" style={{ background: COLOR_BG }}>
      <div className="container my-4">
        <h1 className="text-center mb-2" style={{ color: melonFuerte, fontWeight: 700, fontSize: "2.5rem" }}>ADI - R</h1>
        <h5 className="text-center mb-4" style={{ color: melonFuerte }}>Resumen de resultados</h5>
        <div className="text-center mb-4">
          <button className="btn" style={{ backgroundColor: melonFuerte, color: "#fff" }} onClick={exportarPDF}>
            Exportar a PDF
          </button>
        </div>
        <div ref={reportRef}>
          <fieldset className="border rounded p-3 mb-4">
            <h1 className="text-center mb-2" style={{ color: melonFuerte, fontWeight: 700, fontSize: "2.5rem" }}>ADI - R</h1>
            <h4 className="text-center mb-4" style={{ color: melonFuerte }}>Entrevista para el diagnóstico de<br />Autismo - Revisada</h4>
            <legend className="w-auto px-2">Datos del Evaluado</legend>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label">Nombres</label>
                <div className="border rounded p-1">{datos.nombres}</div>
              </div>
              <div className="col-md-6">
                <label className="form-label">Apellidos</label>
                <div className="border rounded p-1">{datos.apellidos}</div>
              </div>
              <div className="col-md-6">
                <label className="form-label">Fecha</label>
                <div className="border rounded p-1">{formatFecha(datos.fecha)}</div>
              </div>
              <div className="col-md-6">
                <label className="form-label">Especialista</label>
                <div className="border rounded p-1">{datos.especialista}</div>
              </div>
            </div>
          </fieldset>

          <div className="row mb-3">
            <div className="col-md-6 mb-2">
              <div className="border rounded p-3 text-center" style={{ background: "#FFE5D0" }}>
                <div className="fw-bold" style={{ color: melonFuerte }}>Interacción Social</div>
                <div style={{ fontSize: "1.5rem" }}>{totalesCalculados.A}</div>
              </div>
            </div>
            <div className="col-md-6 mb-2">
              <div className="border rounded p-3 text-center" style={{ background: "#FFE5D0" }}>
                <div className="fw-bold" style={{ color: melonFuerte }}>Comunicación</div>
                <div style={{ fontSize: "1.5rem" }}>{totalesCalculados.B}</div>
              </div>
            </div>
            <div className="col-md-6 mb-2">
              <div className="border rounded p-3 text-center" style={{ background: "#FFE5D0" }}>
                <div className="fw-bold" style={{ color: melonFuerte }}>Conductas Repetitivas</div>
                <div style={{ fontSize: "1.5rem" }}>{totalesCalculados.C}</div>
              </div>
            </div>
            <div className="col-md-6 mb-2">
              <div className="border rounded p-3 text-center" style={{ background: "#FFE5D0" }}>
                <div className="fw-bold" style={{ color: melonFuerte }}>Desarrollo Temprano</div>
                <div style={{ fontSize: "1.5rem" }}>{totalesCalculados.D}</div>
              </div>
            </div>
          </div>

          {datos.algoritmo === "diagnostico" && (
            <fieldset className="border rounded p-3 my-4">
              <legend className="w-auto px-2">Diagnóstico diferencial</legend>
              <div className="p-2" style={{ fontStyle: "italic", color: grisOscuro }}>
                {calcularDiagnosticoDiferencial()}
              </div>
            </fieldset>
          )}

          <fieldset className="border rounded p-3 my-4" style={{ background: grisOscuro }}>
            <legend className="w-auto px-2 text-white">Resumen del diagnóstico</legend>
            <div className="p-2 text-white">{datos.diagnostico}</div>
          </fieldset>
        </div>
      </div>
      <div className="mt-auto"></div>
    </div>
  );
}