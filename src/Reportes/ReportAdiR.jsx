import { useRef, useEffect, useMemo } from "react";
import html2pdf from "html2pdf.js";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar_paciente";

// CSS para solo-pdf directamente en el archivo
const soloPdfStyles = `
.solo-pdf { display: none; }
@media print {
  .solo-pdf { display: block !important; }
}
`;

const secciones = {
  A: {
    subcategorias: {
      A1: { items: [{ id: "50" }, { id: "51" }, { id: "57" }] },
      A2: { items: [{ id: "49" }, { id: "62" }, { id: "63" }, { id: "64" }, { id: "65" }] },
      A3: { items: [{ id: "52" }, { id: "53" }, { id: "54" }] },
      A4: { items: [{ id: "31" }, { id: "55" }, { id: "56" }, { id: "58" }, { id: "59" }] }
    }
  },
  B: {
    subcategorias: {
      B1: { items: [{ id: "42" }, { id: "43" }, { id: "44" }, { id: "45" }] },
      B4: { items: [{ id: "47" }, { id: "48" }, { id: "61" }] },
      B2: { items: [{ id: "34" }, { id: "35" }] },
      B3: { items: [{ id: "33" }, { id: "36" }, { id: "37" }, { id: "38" }] }
    }
  },
  C: {
    subcategorias: {
      C1: { items: [{ id: "67" }, { id: "68" }] },
      C2: { items: [{ id: "39" }, { id: "70" }] },
      C3: { items: [{ id: "77" }, { id: "78" }] },
      C4: { items: [{ id: "69" }, { id: "71" }] }
    }
  },
  D: {
    subcategorias: {
      D1: { items: [{ id: "2" }, { id: "9" }, { id: "10" }, { id: "86" }, { id: "87" }] }
    }
  }
};

const CONVERSION_CODIGO = { 0: 0, 1: 1, 2: 2, 3: 2, 7: 0, 8: 0, 9: 0, "0": 0, "1": 1, "2": 2, "3": 2, "7": 0, "8": 0, "9": 0 };

const respuestasMap = (datos) => {
  const map = {};
  if (datos.respuestas) {
    datos.respuestas.forEach(r => {
      map[String(r.id_pregunta)] = r;
    });
  }
  return map;
};

function getPuntuacionAlgoritmica(idPregunta, datos, edadMeses) {
  const respuesta = respuestasMap(datos)[String(idPregunta)];
  const codigo = respuesta?.codigo;
  const algoritmo = datos.algoritmo;
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

export default function ReportAdiR({ datos }) {
  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = soloPdfStyles;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const reportRef = useRef();
  const COLOR_BG = "#f8f9fa";
  const melonFuerte = "#FF8C69";
  const melonClaro = "#FFE5D0";
  const grisOscuro = "#6C6F73";

  if (!datos) return <div className="text-center my-5">Cargando reporte...</div>;

  // Calcula edad en meses si tienes fecha_nacimiento
  const fechaNacimiento = datos.fecha_nacimiento;
  const edadMeses = useMemo(() => {
    if (!fechaNacimiento) return 0;
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);
    return (hoy.getFullYear() - nacimiento.getFullYear()) * 12 + (hoy.getMonth() - nacimiento.getMonth());
  }, [fechaNacimiento]);

  const respuestas = respuestasMap(datos);
  const totalesCalculados = useMemo(() => totales(datos, edadMeses), [datos, edadMeses]);

  // Calcula los totales B(V) y B(NV) según el tipo de sujeto
  const totalBV = useMemo(() => {
    // B1 + B2 + B3 + B4 (solo para sujetos verbales)
    return (
      getTotalSubcategoria(secciones.B.subcategorias.B1.items, "B1", datos, edadMeses) +
      getTotalSubcategoria(secciones.B.subcategorias.B2.items, "B2", datos, edadMeses) +
      getTotalSubcategoria(secciones.B.subcategorias.B3.items, "B3", datos, edadMeses) +
      getTotalSubcategoria(secciones.B.subcategorias.B4.items, "B4", datos, edadMeses)
    );
  }, [datos, edadMeses]);

  const totalBNV = useMemo(() => {
    // B1 + B4 (solo para sujetos no verbales)
    return (
      getTotalSubcategoria(secciones.B.subcategorias.B1.items, "B1", datos, edadMeses) +
      getTotalSubcategoria(secciones.B.subcategorias.B4.items, "B4", datos, edadMeses)
    );
  }, [datos, edadMeses]);

  const exportarPDF = () => {
    if (!reportRef.current) return;
    const element = reportRef.current;
    const opt = {
      margin: 0.3,
      filename: "Reporte-ADI-R.pdf",
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
    };
    html2pdf().set(opt).from(element).save();
  };

  // Helper para mostrar código y puntaje
  const getCod = id => respuestas[id]?.codigo ?? "";
  const getAlg = id => getPuntuacionAlgoritmica(id, datos, edadMeses);

  console.log("tipo_sujeto:", datos.tipo_sujeto);


  /* Diagnóstico diferencial automático (igual que ResumenADIR.jsx) */
  function calcularDiagnosticoDiferencial() {
    // Puntos de corte
    const PUNTOS_CORTE = {
      A: 10,
      B_VERBAL: 8,
      B_NOVERBAL: 7,
      C: 3,
      D: 1
    };

    // Totales
    const totalA = totalesCalculados.A;
    const totalB = totalesCalculados.B;
    const totalC = totalesCalculados.C;
    const totalD = totalesCalculados.D;

    // Determina si el sujeto es verbal o no verbal para el punto de corte de B
    const tipoSujeto = (datos.tipo_sujeto || "").toLowerCase().replace(/\s|_/g, "-");
    const puntoCorteB = tipoSujeto === "verbal" ? PUNTOS_CORTE.B_VERBAL : PUNTOS_CORTE.B_NOVERBAL;

    // Códigos relevantes
    const cod21 = respuestas["21"]?.codigo;
    const cod20 = respuestas["20"]?.codigo;
    const cod28 = respuestas["28"]?.codigo;
    const cod79 = respuestas["79"]?.codigo;
    const cod84 = respuestas["84"]?.codigo;
    const cod85 = respuestas["85"]?.codigo;
    const cod12 = respuestas["12"]?.codigo;
    const cod26 = respuestas["26"]?.codigo;
    const cod87 = respuestas["87"]?.codigo;

    // Rett
    const rettMovManos = cod21 === "1" || cod21 === "2";
    const rettPerdidaHabilidades = cod20 === "2";
    const rettDuracionPerdida = cod28 === "993" || cod28 === "994";
    const rettMovLineaMedia = cod79 === "1" || cod79 === "2";
    const rettHiperventilacion = cod84 === "1" || cod84 === "2";
    const rettDesmayos = cod85 === "1" || cod85 === "2";

    // Trastorno desintegrativo infantil
    const tdiPerdidaHabilidades = cod20 === "2";
    const tdiEdadPerdidaLenguaje = cod26 !== undefined && !isNaN(Number(cod26)) && Number(cod26) >= 24;
    const tdiHablaPrevia = cod12 === "0";
    const tdiAparicionTEA = cod87 !== undefined && !isNaN(Number(cod87)) && Number(cod87) >= 24;

    // Diagnóstico diferencial automático
    let diagnosticoDiferencial = "";

    if (
      rettMovManos &&
      rettPerdidaHabilidades &&
      rettDuracionPerdida &&
      rettMovLineaMedia
    ) {
      diagnosticoDiferencial = "Perfil compatible con Síndrome de Rett: Se observa regresión persistente, pérdida de movimientos voluntarios de las manos, movimientos de manos en la línea media y duración prolongada de la pérdida de habilidades. Considere microcefalia progresiva (circunferencia de cabeza < percentil 3 tras los 6 meses) y revise antecedentes clínicos y genéticos. La presencia de hiperventilación y desmayos refuerza la sospecha, aunque no son obligatorios.";
    } else if (
      tdiPerdidaHabilidades && tdiEdadPerdidaLenguaje && tdiHablaPrevia && tdiAparicionTEA
    ) {
      diagnosticoDiferencial = "Perfil compatible con Trastorno desintegrativo infantil: Se observa una pérdida marcada de habilidades de lenguaje y no-lenguaje después de los 24 meses, tras un desarrollo previo aparentemente normal, con presencia de habla significativa antes de la pérdida y aparición del TEA a los 24 meses o más tarde. Este patrón sugiere una variante rara de TEA y requiere evaluación neurológica y clínica cuidadosa.";
    } else if (totalA < PUNTOS_CORTE.A && totalB < puntoCorteB && totalC < PUNTOS_CORTE.C) {
      diagnosticoDiferencial = "No confirmación consistente: Las puntuaciones están por debajo del punto de corte en los dominios A, B y C. Es improbable un diagnóstico de TEA, a menos que el ADOS sugiera lo contrario.";
    } else if (totalA >= PUNTOS_CORTE.A && totalB >= puntoCorteB && totalC >= PUNTOS_CORTE.C && totalD >= PUNTOS_CORTE.D) {
      const edadPrimerasPalabras = Number(respuestas["9"]?.codigo);
      const edadPrimerasFrases = Number(respuestas["10"]?.codigo);
      if (
        edadPrimerasPalabras > 0 && edadPrimerasPalabras < 24 &&
        edadPrimerasFrases > 0 && edadPrimerasFrases < 33
      ) {
        diagnosticoDiferencial = "Confirmación clara de TEA: Las puntuaciones están por encima del punto de corte en A, B, C y D. El perfil es compatible con un diagnóstico de Síndrome de Asperger (lenguaje desarrollado a edad esperada, sin deterioro cognitivo/adaptativo). Requiere confirmación mediante observación directa (ej. ADOS) y evaluación de CI/conducta adaptativa.";
      } else {
        diagnosticoDiferencial = "Confirmación clara de TEA: Las puntuaciones están por encima del punto de corte en A, B, C y D. El perfil es compatible con un diagnóstico de Trastorno del Espectro Autista. Requiere confirmación mediante observación directa (ej. ADOS).";
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
        <h4 className="text-center mb-4" style={{ color: melonFuerte }}>Entrevista para el diagnóstico de<br />Autismo - Revisada</h4>
        <div className="text-center mb-4">
          <button className="btn" style={{ backgroundColor: melonFuerte, color: "#fff" }} onClick={exportarPDF}>
            Generar Reporte PDF
          </button>
        </div>
        <div>
          <div ref={reportRef} className="bg-white p-4">
            <div className="solo-pdf">
              <h1 className="text-center mb-2" style={{ color: melonFuerte, fontWeight: 700, fontSize: "2.5rem" }}>ADI - R</h1>
              <h4 className="text-center mb-4" style={{ color: melonFuerte }}>
                Entrevista para el diagnóstico de<br />Autismo - Revisada
              </h4>
            </div>
            {/* Datos personales */}
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
                <div className="col-md-4">
                  <label className="form-label">Fecha</label>
                  <div className="border rounded p-1">{formatFecha(datos.fecha)}</div>
                </div>
                <div className="col-md-4">
                  <label className="form-label">Especialista</label>
                  <div className="border rounded p-1">{datos.especialista}</div>
                </div>
              </div>
            </fieldset>

            {/* SECCIÓN A */}
            <h5 className="mt-4 mb-2 fw-bold" style={{ color: melonFuerte }}>A. ALTERACIONES CUALITATIVAS DE LA INTERACCIÓN SOCIAL RECÍPROCA</h5>
            {/* A.1 */}
            <div className="fw-bold mt-3">A.1 Incapacidad para utilizar conductas no verbales en la regulación de la interacción social</div>
            <div className="row g-2 align-items-center">
              <div className="col-1">50</div>
              <div className="col-6">Mirada directa</div>
              <div className="col-2 text-center border rounded p-1 mb-2">{getCod("50")}</div>
              <div className="col-2 text-center border rounded p-1 mb-2">{getAlg("50")}</div>
            </div>
            <div className="row g-2 align-items-center">
              <div className="col-1">51</div>
              <div className="col-6">Sonrisa social</div>
              <div className="col-2 text-center border rounded p-1">{getCod("51")}</div>
              <div className="col-2 text-center border rounded p-1">{getAlg("51")}</div>
            </div>
            <div className="row g-2 align-items-center">
              <div className="col-1">57</div>
              <div className="col-6">Variedad de expresiones faciales usadas para comunicarse</div>
              <div className="col-2 text-center border rounded p-1">{getCod("57")}</div>
              <div className="col-2 text-center border rounded p-1">{getAlg("57")}</div>
            </div>
            <fieldset className="border rounded p-3 my-2" style={{ background: melonClaro }}>
              <div className="row">
                <div className="col-7 text-end fw-bold" style={{ color: melonFuerte }}>TOTAL A1</div>
                <div className="border rounded p-1 text-center" style={{ background: "#fff", color: "#000", width: "220px" }}>
                  {getTotalSubcategoria(secciones.A.subcategorias.A1.items, "A1", datos, edadMeses)}
                </div>
              </div>
            </fieldset>

            {/* A.2 */}
            <div className="fw-bold mt-3">A.2 Incapacidad para desarrollar relaciones con sus iguales</div>
            <div className="row g-2 align-items-center">
              <div className="col-1">49</div>
              <div className="col-6">Juego imaginativo con sus iguales</div>
              <div className="col-2 text-center border rounded p-1 mb-2">{getCod("49")}</div>
              <div className="col-2 text-center border rounded p-1 mb-2">{getAlg("49")}</div>
            </div>
            <div className="row g-2 align-items-center">
              <div className="col-1">62</div>
              <div className="col-6">Interés por otros niños</div>
              <div className="col-2 text-center border rounded p-1 mb-2">{getCod("62")}</div>
              <div className="col-2 text-center border rounded p-1 mb-2">{getAlg("62")}</div>
            </div>
            <div className="row g-2 align-items-center">
              <div className="col-1">63</div>
              <div className="col-6">Respuesta a las aproximaciones de otros niños</div>
              <div className="col-2 text-center border rounded p-1 mb-2">{getCod("63")}</div>
              <div className="col-2 text-center border rounded p-1 mb-2">{getAlg("63")}</div>
            </div>
            <div className="row g-2 align-items-center">
              <div className="col-1">64</div>
              <div className="col-6">Juego en grupo con sus iguales (puntúe si tiene entre 4 años, 0 meses y 9 años, 11 meses)</div>
              <div className="col-2 text-center border rounded p-1 mb-2">{getCod("64")}</div>
              <div className="col-2 text-center border rounded p-1 mb-2">{getAlg("64")}</div>
            </div>
            <div className="row g-2 align-items-center">
              <div className="col-1">65</div>
              <div className="col-6">Amistades (puntúe si tiene 10 años o más)</div>
              <div className="col-2 text-center border rounded p-1 mb-2">{getCod("65")}</div>
              <div className="col-2 text-center border rounded p-1 mb-2">{getAlg("65")}</div>
            </div>
            <fieldset className="border rounded p-3 my-2" style={{ background: melonClaro }}>
              <div className="row">
                <div className="col-7 text-end fw-bold" style={{ color: melonFuerte }}>TOTAL A2</div>
                <div className="border rounded p-1 text-center" style={{ background: "#fff", color: "#000", width: "220px" }}>
                  {getTotalSubcategoria(secciones.A.subcategorias.A2.items, "A2", datos, edadMeses)}
                </div>
              </div>
            </fieldset>

            {/* A.3 */}
            <div className="fw-bold mt-3">A.3 Falta de goce o placer compartido</div>
            <div className="row g-2 align-items-center">
              <div className="col-1">52</div>
              <div className="col-6">Mostrar y dirigir la atención</div>
              <div className="col-2 text-center border rounded p-1 mb-2">{getCod("52")}</div>
              <div className="col-2 text-center border rounded p-1 mb-2">{getAlg("52")}</div>
            </div>
            <div className="row g-2 align-items-center">
              <div className="col-1">53</div>
              <div className="col-6">Ofrecimientos para compartir</div>
              <div className="col-2 text-center border rounded p-1 mb-2">{getCod("53")}</div>
              <div className="col-2 text-center border rounded p-1 mb-2">{getAlg("53")}</div>
            </div>
            <div className="row g-2 align-items-center mb-4">
              <div className="col-1">54</div>
              <div className="col-6">Busca compartir su deleite o goce con otros</div>
              <div className="col-2 text-center border rounded p-1 mb-2">{getCod("54")}</div>
              <div className="col-2 text-center border rounded p-1 mb-2">{getAlg("54")}</div>
            </div>
            <fieldset className="border rounded p-3" style={{ background: melonClaro, marginTop: "40px" }}>
              <div className="row">
                <div className="col-7 text-end fw-bold" style={{ color: melonFuerte }}>TOTAL A3</div>
                <div className="border rounded p-1 text-center" style={{ background: "#fff", color: "#000", width: "220px" }}>
                  {getTotalSubcategoria(secciones.A.subcategorias.A3.items, "A3", datos, edadMeses)}
                </div>
              </div>
            </fieldset>

            {/* A.4 */}
            <div className="fw-bold mt-3">A.4 Falta de reciprocidad socio-emocional</div>
            <div className="row g-2 align-items-center">
              <div className="col-1">31</div>
              <div className="col-6">Uso del cuerpo de otra persona para comunicarse</div>
              <div className="col-2 text-center border rounded p-1 mb-2">{getCod("31")}</div>
              <div className="col-2 text-center border rounded p-1 mb-2">{getAlg("31")}</div>
            </div>
            <div className="row g-2 align-items-center">
              <div className="col-1">55</div>
              <div className="col-6">Ofrecimiento de consuelo</div>
              <div className="col-2 text-center border rounded p-1 mb-2">{getCod("55")}</div>
              <div className="col-2 text-center border rounded p-1 mb-2">{getAlg("55")}</div>
            </div>
            <div className="row g-2 align-items-center">
              <div className="col-1">56</div>
              <div className="col-6">Calidad de los acercamientos sociales</div>
              <div className="col-2 text-center border rounded p-1 mb-2">{getCod("56")}</div>
              <div className="col-2 text-center border rounded p-1 mb-2">{getAlg("56")}</div>
            </div>
            <div className="row g-2 align-items-center">
              <div className="col-1">58</div>
              <div className="col-6">Expresiones faciales inapropiadas</div>
              <div className="col-2 text-center border rounded p-1 mb-2">{getCod("58")}</div>
              <div className="col-2 text-center border rounded p-1 mb-2">{getAlg("58")}</div>
            </div>
            <div className="row g-2 align-items-center">
              <div className="col-1">59</div>
              <div className="col-6">Cualidad apropiada de las respuestas sociales</div>
              <div className="col-2 text-center border rounded p-1 mb-2">{getCod("59")}</div>
              <div className="col-2 text-center border rounded p-1 mb-2">{getAlg("59")}</div>
            </div>
            <fieldset className="border rounded p-3 my-2" style={{ background: melonClaro }}>
              <div className="row">
                <div className="col-7 text-end fw-bold" style={{ color: melonFuerte }}>TOTAL A4</div>
                <div className="border rounded p-1 text-center" style={{ background: "#fff", color: "#000", width: "220px" }}>
                  {getTotalSubcategoria(secciones.A.subcategorias.A4.items, "A4", datos, edadMeses)}
                </div>
              </div>
            </fieldset>

            {/* TOTAL A */}
            <fieldset className="border rounded p-3 my-3" style={{ background: melonFuerte }}>
              <div className="row">
                <div className="col-7 text-end fw-bold text-white">TOTAL A (A1+A2+A3+A4)</div>
                <div className="col-2 border rounded p-1 text-center" style={{ background: "#fff", color: "#000", width: "220px" }}>
                  {totalesCalculados.A}
                </div>
              </div>
            </fieldset>

            {/* SECCIÓN B */}
            <h5 className="mt-4 mb-2 fw-bold" style={{ color: melonFuerte }}>B. ALTERACIONES CUALITATIVAS DE LA COMUNICACIÓN</h5>
            {/* B.1 */}
            <div className="fw-bold mt-3">B.1 Falta o retraso del lenguaje hablado e incapacidad para comunicarse</div>
            <div className="row g-2 align-items-center">
              <div className="col-1">42</div>
              <div className="col-6">Señalar para expresar interés</div>
              <div className="col-2 text-center border rounded p-1 mb-2">{getCod("42")}</div>
              <div className="col-2 text-center border rounded p-1 mb-2">{getAlg("42")}</div>
            </div>
            <div className="row g-2 align-items-center">
              <div className="col-1">43</div>
              <div className="col-6">Asentir con la cabeza</div>
              <div className="col-2 text-center border rounded p-1 mb-2">{getCod("43")}</div>
              <div className="col-2 text-center border rounded p-1 mb-2">{getAlg("43")}</div>
            </div>
            <div className="row g-2 align-items-center">
              <div className="col-1">44</div>
              <div className="col-6">Negar con la cabeza</div>
              <div className="col-2 text-center border rounded p-1 mb-2">{getCod("44")}</div>
              <div className="col-2 text-center border rounded p-1 mb-2">{getAlg("44")}</div>
            </div>
            <div className="row g-2 align-items-center">
              <div className="col-1">45</div>
              <div className="col-6">Gestos convencionales / instrumentales</div>
              <div className="col-2 text-center border rounded p-1 mb-2">{getCod("45")}</div>
              <div className="col-2 text-center border rounded p-1 mb-2">{getAlg("45")}</div>
            </div>
            <fieldset className="border rounded p-3 my-2" style={{ background: melonClaro }}>
              <div className="row">
                <div className="col-7 text-end fw-bold" style={{ color: melonFuerte }}>TOTAL B1</div>
                <div className="border rounded p-1 text-center" style={{ background: "#fff", color: "#000", width: "220px" }}>
                  {getTotalSubcategoria(secciones.B.subcategorias.B1.items, "B1", datos, edadMeses)}
                </div>
              </div>
            </fieldset>

            {/* B.4 */}
            <div className="fw-bold mt-3">B.4 Falta de juego imaginativo o juego social imitativo espontáneo</div>
            <div className="row g-2 align-items-center">
              <div className="col-1">47</div>
              <div className="col-6">Imitación espontánea de acciones</div>
              <div className="col-2 text-center border rounded p-1 mb-2">{getCod("47")}</div>
              <div className="col-2 text-center border rounded p-1 mb-2">{getAlg("47")}</div>
            </div>
            <div className="row g-2 align-items-center">
              <div className="col-1">48</div>
              <div className="col-6">Juego imaginativo</div>
              <div className="col-2 text-center border rounded p-1 mb-2">{getCod("48")}</div>
              <div className="col-2 text-center border rounded p-1 mb-2">{getAlg("48")}</div>
            </div>
            <div className="row g-2 align-items-center">
              <div className="col-1">61</div>
              <div className="col-6">Juego social imitativo</div>
              <div className="col-2 text-center border rounded p-1 mb-2">{getCod("61")}</div>
              <div className="col-2 text-center border rounded p-1 mb-2">{getAlg("61")}</div>
            </div>
            <fieldset className="border rounded p-3 my-2" style={{ background: melonClaro }}>
              <div className="row">
                <div className="col-7 text-end fw-bold" style={{ color: melonFuerte }}>TOTAL B4</div>
                <div className="border rounded p-1 text-center" style={{ background: "#fff", color: "#000", width: "220px" }}>
                  {getTotalSubcategoria(secciones.B.subcategorias.B4.items, "B4", datos, edadMeses)}
                </div>
              </div>
            </fieldset>

            {/* SOLO EN SUJETOS "VERBALES" */}
            <h6 className="mt-4 mb-2 fw-bold" style={{ color: melonFuerte }}>SÓLO EN SUJETOS "VERBALES"</h6>
            {/* B.2 (V) */}
            <div className="fw-bold mt-3">B.2 (V). Incapacidad relativa para iniciar o sostener un intercambio conversacional</div>
            <div className="row g-2 align-items-center">
              <div className="col-1">34</div>
              <div className="col-6">Verbalización social / charla</div>
              <div className="col-2 text-center border rounded p-1 mb-2">{getCod("34")}</div>
              <div className="col-2 text-center border rounded p-1 mb-2">{getAlg("34")}</div>
            </div>
            <div className="row g-2 align-items-center">
              <div className="col-1">35</div>
              <div className="col-6">Conversación recíproca</div>
              <div className="col-2 text-center border rounded p-1 mb-2">{getCod("35")}</div>
              <div className="col-2 text-center border rounded p-1 mb-2">{getAlg("35")}</div>
            </div>
            <fieldset className="border rounded p-3 my-2" style={{ background: melonClaro }}>
              <div className="row">
                <div className="col-7 text-end fw-bold" style={{ color: melonFuerte }}>TOTAL B2</div>
                <div className="border rounded p-1 text-center" style={{ background: "#fff", color: "#000", width: "220px" }}>
                  {getTotalSubcategoria(secciones.B.subcategorias.B2.items, "B2", datos, edadMeses)}
                </div>
              </div>
            </fieldset>

            {/* B.3 (V) */}
            <div className="fw-bold mt-3">B.3 (V). Habla estereotipada, repetitiva e idiosincrásica</div>
            <div className="row g-2 align-items-center">
              <div className="col-1">33</div>
              <div className="col-6">Expresiones estereotipadas y ecolalia diferida</div>
              <div className="col-2 text-center border rounded p-1 mb-2">{getCod("33")}</div>
              <div className="col-2 text-center border rounded p-1 mb-2">{getAlg("33")}</div>
            </div>
            <div className="row g-2 align-items-center">
              <div className="col-1">36</div>
              <div className="col-6">Preguntas o expresiones inapropiadas</div>
              <div className="col-2 text-center border rounded p-1 mb-2">{getCod("36")}</div>
              <div className="col-2 text-center border rounded p-1 mb-2">{getAlg("36")}</div>
            </div>
            <div className="row g-2 align-items-center">
              <div className="col-1">37</div>
              <div className="col-6">Inversión de pronombres</div>
              <div className="col-2 text-center border rounded p-1 mb-2">{getCod("37")}</div>
              <div className="col-2 text-center border rounded p-1 mb-2">{getAlg("37")}</div>
            </div>
            <div className="row g-2 align-items-center">
              <div className="col-1">38</div>
              <div className="col-6">Neologismos / Lenguaje idiosincrasico</div>
              <div className="col-2 text-center border rounded p-1 mb-2">{getCod("38")}</div>
              <div className="col-2 text-center border rounded p-1 mb-2">{getAlg("38")}</div>
            </div>
            <fieldset className="border rounded p-3 my-2" style={{ background: melonClaro }}>
              <div className="row">
                <div className="col-7 text-end fw-bold" style={{ color: melonFuerte }}>TOTAL B3</div>
                <div className="border rounded p-1 text-center" style={{ background: "#fff", color: "#000", width: "220px" }}>
                  {getTotalSubcategoria(secciones.B.subcategorias.B3.items, "B3", datos, edadMeses)}
                </div>
              </div>
            </fieldset>

            {/* SOLO EN SUJETOS "VERBALES" TOTAL VERBAL B(V) */}
            {datos.tipo_sujeto === "verbal" && (
              <fieldset className="border rounded p-3 my-3" style={{ background: melonFuerte }}>
                <div className="row">
                  <div className="col-7 text-end fw-bold text-white">EN SUJETOS "VERBALES" TOTAL VERBAL B(V)</div>
                  <div className="border rounded p-1 text-center" style={{ background: "#fff", color: "#000", width: "220px" }}>
                    {totalBV}
                  </div>
                </div>
              </fieldset>
            )}
            {/* SOLO EN SUJETOS "NO VERBALES" TOTAL NO VERBAL B (NV) */}
            {datos.tipo_sujeto === "no-verbal" && (
              <fieldset className="border rounded p-3 my-3" style={{ background: melonFuerte }}>
                <div className="row">
                  <div className="col-7 text-end fw-bold text-white">EN SUJETOS "NO VERBALES" TOTAL NO VERBAL B (NV)</div>
                  <div className="border rounded p-1 text-center" style={{ background: "#fff", color: "#000", width: "220px", height: "35px" }}>
                    {totalBNV}
                  </div>
                </div>
              </fieldset>
            )}

            {/* SECCIÓN C */}
            <h5 className="mt-4 mb-2 fw-bold" style={{ color: melonFuerte }}>C. PATRONES DE CONDUCTA RESTRINGIDOS, REPETITIVOS Y ESTEREOTIPADOS</h5>
            {/* C.1 */}
            <div className="fw-bold mt-3">C.1 Preocupación absorbente o patrón de intereses circunscrito</div>
            <div className="row g-2 align-items-center">
              <div className="col-1">67</div>
              <div className="col-6">Preocupaciones inusuales</div>
              <div className="col-2 text-center border rounded p-1 mb-2">{getCod("67")}</div>
              <div className="col-2 text-center border rounded p-1 mb-2">{getAlg("67")}</div>
            </div>
            <div className="row g-2 align-items-center">
              <div className="col-1">68</div>
              <div className="col-6">Intereses circunscritos (puntue solamente si tiene 3 años o más)</div>
              <div className="col-2 text-center border rounded p-1 mb-2">{getCod("68")}</div>
              <div className="col-2 text-center border rounded p-1 mb-2">{getAlg("68")}</div>
            </div>
            <fieldset className="border rounded p-3 my-2" style={{ background: melonClaro }}>
              <div className="row">
                <div className="col-7 text-end fw-bold" style={{ color: melonFuerte }}>TOTAL C1</div>
                <div className="border rounded p-1 text-center" style={{ background: "#fff", color: "#000", width: "220px" }}>
                  {getTotalSubcategoria(secciones.C.subcategorias.C1.items, "C1", datos, edadMeses)}
                </div>
              </div>
            </fieldset>

            {/* C.2 */}
            <div className="fw-bold mt-3">C.2 Adhesión aparentemente compulsiva a rutinas o rituales no funcionales</div>
            <div className="row g-2 align-items-center mb-4">
              <div className="col-1">39</div>
              <div className="col-6">Rituales verbales (puntue solamente si el elemento 30=0)</div>
              <div className="col-2 text-center border rounded p-1 mb-2">{getCod("39")}</div>
              <div className="col-2 text-center border rounded p-1 mb-2">{getAlg("39")}</div>
            </div>
            <div className="row g-2 align-items-center">
              <div className="col-1">70</div>
              <div className="col-6">Compulsiones / Rituales</div>
              <div className="col-2 text-center border rounded p-1 mb-2">{getCod("70")}</div>
              <div className="col-2 text-center border rounded p-1 mb-2">{getAlg("70")}</div>
            </div>
            <fieldset className="border rounded p-3 my-2" style={{ background: melonClaro }}>
              <div className="row">
                <div className="col-7 text-end fw-bold" style={{ color: melonFuerte }}>TOTAL C2</div>
                <div className="border rounded p-1 text-center" style={{ background: "#fff", color: "#000", width: "220px" }}>
                  {getTotalSubcategoria(secciones.C.subcategorias.C2.items, "C2", datos, edadMeses)}
                </div>
              </div>
            </fieldset>

            {/* C.3 */}
            <div className="fw-bold mt-3">C.3 Manierismos motores estereotipados y repetitivos</div>
            <div className="row g-2 align-items-center">
              <div className="col-1">77</div>
              <div className="col-6">Manierismos de manos y dedos</div>
              <div className="col-2 text-center border rounded p-1 mb-2">{getCod("77")}</div>
              <div className="col-2 text-center border rounded p-1 mb-2">{getAlg("77")}</div>
            </div>
            <div className="row g-2 align-items-center">
              <div className="col-1">78</div>
              <div className="col-6">Otros manierismos complejos o movimientos estereotipados del cuerpo</div>
              <div className="col-2 text-center border rounded p-1 mb-2">{getCod("78")}</div>
              <div className="col-2 text-center border rounded p-1 mb-2">{getAlg("78")}</div>
            </div>
            <fieldset className="border rounded p-3 my-2" style={{ background: melonClaro }}>
              <div className="row">
                <div className="col-7 text-end fw-bold" style={{ color: melonFuerte }}>TOTAL C3</div>
                <div className="border rounded p-1 text-center" style={{ background: "#fff", color: "#000", width: "220px" }}>
                  {getTotalSubcategoria(secciones.C.subcategorias.C3.items, "C3", datos, edadMeses)}
                </div>
              </div>
            </fieldset>

            {/* C.4 */}
            <div className="fw-bold mt-3">C.4 Preocupaciones con parte de objetos o elementos no funcionales</div>
            <div className="row g-2 align-items-center">
              <div className="col-1">69</div>
              <div className="col-6">Uso repetitivo de objetos o interés en partes de objetos</div>
              <div className="col-2 text-center border rounded p-1 mb-2">{getCod("69")}</div>
              <div className="col-2 text-center border rounded p-1 mb-2">{getAlg("69")}</div>
            </div>
            <div className="row g-2 align-items-center">
              <div className="col-1">71</div>
              <div className="col-6">Intereses sensoriales inusuales</div>
              <div className="col-2 text-center border rounded p-1 mb-2">{getCod("71")}</div>
              <div className="col-2 text-center border rounded p-1 mb-2">{getAlg("71")}</div>
            </div>
            <fieldset className="border rounded p-3 my-2" style={{ background: melonClaro }}>
              <div className="row">
                <div className="col-7 text-end fw-bold" style={{ color: melonFuerte }}>TOTAL C4</div>
                <div className="border rounded p-1 text-center" style={{ background: "#fff", color: "#000", width: "220px" }}>
                  {getTotalSubcategoria(secciones.C.subcategorias.C4.items, "C4", datos, edadMeses)}
                </div>
              </div>
            </fieldset>

            {/* TOTAL C */}
            <fieldset className="border rounded p-3 my-3" style={{ background: melonFuerte }}>
              <div className="row">
                <div className="col-7 text-end fw-bold text-white">TOTAL C (C1+C2+C3+C4)</div>
                <div className=" border rounded p-1 text-center" style={{ background: "#fff", color: "#000", width: "220px" }}>
                  {totalesCalculados.C}
                </div>
              </div>
            </fieldset>

            {/* SECCIÓN D */}
            <h5 className="mt-4 mb-2 fw-bold" style={{ color: melonFuerte }}>D. ALTERACIONES EN EL DESARROLLO EVIDENTES A LOS 36 MESES O ANTES</h5>
            <div className="row g-2 align-items-center">
              <div className="col-1">2</div>
              <div className="col-6">Edad en que los padres lo notaron por primera vez (si &lt;36 meses, puntue 1)</div>
              <div className="col-2 text-center border rounded p-1 mb-2">{getCod("2")}</div>
              <div className="col-2 text-center border rounded p-1 mb-2">{getAlg("2")}</div>
            </div>
            <div className="row g-2 align-items-center">
              <div className="col-1">9</div>
              <div className="col-6">Edad de las primeras palabras (si &gt;24 meses, puntúe 1)</div>
              <div className="col-2 text-center border rounded p-1 mb-2">{getCod("9")}</div>
              <div className="col-2 text-center border rounded p-1 mb-2">{getAlg("9")}</div>
            </div>
            <div className="row g-2 align-items-center">
              <div className="col-1">10</div>
              <div className="col-6">Edad de las primeras frases (si &gt;33 meses, puntúe 1)</div>
              <div className="col-2 text-center border rounded p-1 mb-2">{getCod("10")}</div>
              <div className="col-2 text-center border rounded p-1 mb-2">{getAlg("10")}</div>
            </div>
            <div className="row g-2 align-items-center">
              <div className="col-1">86</div>
              <div className="col-6">Edad en que la anormalidad se hizo evidente por primera vez (si el código fue 3 ó 4, puntúe 1)</div>
              <div className="col-2 text-center border rounded p-1 mb-2">{getCod("86")}</div>
              <div className="col-2 text-center border rounded p-1 mb-2">{getAlg("86")}</div>
            </div>
            <div className="row g-2 align-items-center">
              <div className="col-1">87</div>
              <div className="col-6">Juicio del entrevistador sobre la edad en que se manifestaron por primera vez las anormalidades (si &lt;36 meses, puntue 1)</div>
              <div className="col-2 text-center border rounded p-1 mb-2">{getCod("87")}</div>
              <div className="col-2 text-center border rounded p-1 mb-2">{getAlg("87")}</div>
            </div>
            <fieldset className="border rounded p-3 mt-4" style={{ background: grisOscuro, marginBottom: "40px" }}>
              <div className="row">
                <div className="col-7 text-end fw-bold text-white">TOTAL D</div>
                <div className="col-2 border rounded p-1 text-center" style={{ background: "#fff", color: "#000", width: "220px" }}>
                  {totalesCalculados.D}
                </div>
              </div>
            </fieldset>

            {datos.algoritmo === "diagnostico" && (
              <fieldset className="border rounded p-3 my-4">
                <legend className="w-auto px-2">Diagnóstico diferencial</legend>
                <div className="p-2" style={{ fontStyle: "italic", color: grisOscuro }}>
                  {calcularDiagnosticoDiferencial()}
                </div>
              </fieldset>
            )}

            {/* Diagnóstico */}
            <fieldset className="border rounded p-3 my-4">
              <legend className="w-auto px-2">Diagnóstico</legend>
              <div className="p-2">{datos.diagnostico}</div>
            </fieldset>


          </div>
        </div>
      </div>
      <div className="mt-auto">
      </div>
    </div>
  );
}
