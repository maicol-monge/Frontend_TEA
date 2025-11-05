import { useRef } from "react";
import html2pdf from "html2pdf.js";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar_paciente";

// Recibe los datos como prop
export default function ReporteModulo1({ datos }) {
  const reportRef = useRef();
  const COLOR_BG = "#f8f9fa";

  // Desestructura los datos recibidos
  const {
    nombres = "",
    apellidos = "",
    fecha = "",
    telefono = "",
    especialista_nombres = "",
    especialista_apellidos = "",
    puntuaciones = [],
    diagnostico = "",
    clasificacion = "",
    total_punto = "",
    puntuacion_comparativa = "",
    id_algoritmo = 1,
  } = datos || {};

  // Helper para obtener y convertir puntaje por código
  const convertirPuntaje = (puntaje, id_algoritmo, id_codificacion) => {
    id_algoritmo = parseInt(id_algoritmo, 10);
    if ((id_algoritmo === 1 || id_algoritmo === 2) && id_codificacion === 135) {
      if (puntaje === 0) return 0;
      if (puntaje === 1) return 2;
      if (puntaje === 2) return 2;
      if (puntaje === 3) return 2;
      if ([7, 8, 9].includes(puntaje)) return 0;
      return puntaje;
    }
    if (puntaje === 0) return 0;
    if (puntaje === 1) return 1;
    if (puntaje === 2) return 2;
    if (puntaje === 3) return 2;
    if ([7, 8, 9].includes(puntaje)) return 0;
    return puntaje;
  };

  const getPuntaje = (codigo) => {
    const p = puntuaciones.find(p => p.codigo === codigo);
    if (!p) return 0;
    return convertirPuntaje(Number(p.puntaje), id_algoritmo, p.id_codificacion);
  };

  const getDescripcionComparativa = (punt) => {
    const val = Number(punt);
    if ([10, 9, 8].includes(val)) {
      return "Nivel alto de síntomas asociados del espectro autista en comparación con niños que tienen TEA y que tienen la misma edad cronológica y nivel de lenguaje. Corresponde a una clasificación del ADOS-2 de autismo";
    }
    if ([7, 6, 5].includes(val)) {
      return "Nivel moderado de síntomas asociados al espectro autista en comparación con niños que tienen TEA y que tienen la misma edad cronológica y nivel de lenguaje. Corresponde a las clasificaciones del ADOS-2 de espectro autista o de autismo";
    }
    if ([4, 3].includes(val)) {
      return "Nivel bajo de síntomas asociados al espectro autista en comparación con niños que tienen TEA y que tienen la misma edad cronológica y nivel de lenguaje. Corresponde a las clasificaciones del ADOS-2 de no TEA o de especto autista.";
    }
    if ([2, 1].includes(val)) {
      return "Nivel mínimo o no evidencia de síntomas asociados al espectro autista en comparación con niños que tienen TEA y que tienen la misma edad cronológica y nivel de lenguaje. Corresponde a la clasificación del ADOS-2 de no TEA.";
    }
    return "";
  };

  // Mapea los puntajes por código (igual que en ModuloT)
  const frecuenciaVocalizacion = getPuntaje("A2");
  const senalar = getPuntaje("A7");
  const gestos = getPuntaje("A8");
  const contactoVisual = getPuntaje("B1");
  const expresionesFaciales = getPuntaje("B3");
  const integracionMirada = getPuntaje("B4");
  const disfruteCompartido = getPuntaje("B5");
  const mostrar = getPuntaje("B9");
  const iniciacionEspontanea = getPuntaje("B10");
  const respuestaAtencionConjunta = getPuntaje("B11");
  const caracteristicasIniciaciones = getPuntaje("B12");
  const entonacion = getPuntaje("A3");
  const usoEsteriotipado = getPuntaje("A5");
  const interesSensorial = getPuntaje("D1");
  const manierismosManos = getPuntaje("D2");
  const interesesRepetitivos = getPuntaje("D4");

  // Si NO existen versiones "2", iguala al campo base:
  const frecuenciaVocalizacion2 = frecuenciaVocalizacion;
  const senalar2 = senalar;
  const gestos2 = gestos;
  const contactoVisual2 = contactoVisual;
  const expresionesFaciales2 = expresionesFaciales;
  const integracionMirada2 = integracionMirada;
  const disfruteCompartido2 = disfruteCompartido;
  const mostrar2 = mostrar;
  const iniciacionEspontanea2 = iniciacionEspontanea;
  const respuestaAtencionConjunta2 = respuestaAtencionConjunta;
  const caracteristicasIniciaciones2 = caracteristicasIniciaciones;
  const entonacion2 = entonacion;
  const usoEsteriotipado2 = usoEsteriotipado;
  const interesSensorial2 = interesSensorial;
  const manierismosManos2 = manierismosManos;
  const interesesRepetitivos2 = interesesRepetitivos;

  // Suma de totales (como en ModuloT.jsx)
  const totalASValue = [
    frecuenciaVocalizacion, senalar, gestos, contactoVisual, expresionesFaciales,
    integracionMirada, disfruteCompartido, mostrar, iniciacionEspontanea,
    respuestaAtencionConjunta, caracteristicasIniciaciones
  ].reduce((a, b) => a + b, 0);

  const totalCRRValue = [
    entonacion, usoEsteriotipado, interesSensorial, manierismosManos, interesesRepetitivos
  ].reduce((a, b) => a + b, 0);

  const totalGlobalValue = total_punto;

   const formatFecha = (fechaStr) => {
    if (!fechaStr) return "";
    const d = new Date(fechaStr);
    if (isNaN(d)) return "";
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  };

  // PDF
  const generarPDF = () => {
    if (!reportRef.current) return;
    const element = reportRef.current;
    const opt = {
      margin: 0.3,
      filename: "Reporte-Modulo-1.pdf",
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
    };
    html2pdf().set(opt).from(element).save();
  };

  // Funciones para mostrar el valor en la columna correcta según el algoritmo
  const mostrarColumna = (valor) => id_algoritmo === 1 ? valor : "";
  const mostrarColumna2 = (valor) => id_algoritmo === 2 ? valor : "";

  const mostrarUnico = (valor) => valor === 0 ? "" : valor;

  console.log(id_algoritmo);

  console.log(puntuaciones);

  return (
    <div className="d-flex flex-column min-vh-100" style={{ background: COLOR_BG }}>

      <div className="container my-4">
        <h2 className="text-center mb-4" style={{ color: "#155724" }}>Módulo 1</h2>
        <div className="text-center mb-4">
          <button className="btn" style={{ color: "#fff", backgroundColor: "#155724" }} onClick={generarPDF}>
            Generar Reporte PDF
          </button>
        </div>
        <div>
          <div ref={reportRef} className="bg-white p-4">
            {/* Encabezado */}
            <div className="row mb-4">
              <div className="col-md-6"><h1 className="" style={{ color: "#155724" }}>ADOS-2</h1></div>
              <div className="col-md-6 text-end"><h1 className="" style={{ color: "#155724" }}>Algoritmo Módulo 1</h1></div>
            </div>

            {/* Datos Personales */}
            <fieldset className="border rounded p-3 mb-4">
              <legend className="w-auto px-2">Datos del Evaluado</legend>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">Nombres</label>
                  <div className="border rounded p-1">{nombres}</div>
                </div>
                <div className="col-md-6">
                  <label className="form-label">Apellidos</label>
                  <div className="border rounded p-1">{apellidos}</div>
                </div>
                <div className="col-md-4">
                  <label className="form-label">Fecha</label>
                  <div className="border rounded p-1">{formatFecha(fecha)}</div>
                </div>
                <div className="col-md-4">
                  <label className="form-label">Teléfono</label>
                  <div className="border rounded p-1">{telefono}</div>
                </div>
                <div className="col-md-4">
                  <label className="form-label">Especialista</label>
                  <div className="border rounded p-1">{`${especialista_nombres || ""} ${especialista_apellidos || ""}`}</div>
                </div>
              </div>
            </fieldset>

            {/* Algoritmo info */}
            <fieldset className="border p-3">
              <div className="row g-2 mb-2">
                <div className="col-md-8"></div>
                <div className="col-md-4">
                  <div className="card bg-light">
                    <div className="card-header fw-bold text-center">ALGORITMO</div>
                    <div className="card-body">
                      <div className="row">
                        <div className="col-6 text-center border-end">
                          <div className="fw-bold"><small>Niños pequeños/mayores con pocas o ninguna palabra </small></div>
                        </div>
                        <div className="col-6 text-center">
                          <div className="fw-bold"><small>Niños mayores con algunas palabras</small></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </fieldset>

            {/* Afectación Social */}
            <fieldset className="border rounded p-3">
              <legend className="w-auto px-2">Afectación Social (AS)</legend>
              <h6 className="text-secondary">Comunicación</h6>
              <div className="row g-2 mb-2">
                <div className="col-md-8">Frecuencia de la vocalización espontánea dirigida a otros <span className="float-end">(A-2)</span></div>
                <div className="col-md-2 border rounded p-1 text-center">{mostrarColumna(frecuenciaVocalizacion)}</div>
                <div className="col-md-2 border rounded p-1 text-center">{mostrarColumna2(frecuenciaVocalizacion2)}</div>
              </div>
              <div className="row g-2 mb-2">
                <div className="col-md-8">Señalar <span className="float-end">(A-7)</span></div>
                <div className="col-md-2"></div>
                <div className="col-md-2 border rounded p-1 text-center">{mostrarUnico(senalar2)}</div>
              </div>
              <div className="row g-2 mb-2">
                <div className="col-md-8">Gestos <span className="float-end">(A-8)</span></div>
                <div className="col-md-2 border rounded p-1 text-center">{mostrarColumna(gestos)}</div>
                <div className="col-md-2 border rounded p-1 text-center">{mostrarColumna2(gestos2)}</div>
              </div>
              <h6 className="text-secondary mt-3">Interacción social recíproca</h6>
              <div className="row g-2 mb-2">
                <div className="col-md-8">Contacto visual inusual <span className="float-end">(B-1)</span></div>
                <div className="col-md-2 border rounded p-1 text-center">{mostrarColumna(contactoVisual)}</div>
                <div className="col-md-2 border rounded p-1 text-center">{mostrarColumna2(contactoVisual2)}</div>
              </div>
              <div className="row g-2 mb-2">
                <div className="col-md-8">Expresiones faciales dirigidas a otros <span className="float-end">(B-3)</span></div>
                <div className="col-md-2 border rounded p-1 text-center">{mostrarColumna(expresionesFaciales)}</div>
                <div className="col-md-2 border rounded p-1 text-center">{mostrarColumna2(expresionesFaciales2)}</div>
              </div>
              <div className="row g-2 mb-2">
                <div className="col-md-8">Integración de la mirada y otras conductas durante las iniciaciones sociales <span className="float-end">(B-4)</span></div>
                <div className="col-md-2 border rounded p-1 text-center">{mostrarColumna(integracionMirada)}</div>
                <div className="col-md-2 border rounded p-1 text-center">{mostrarColumna2(integracionMirada2)}</div>
              </div>
              <div className="row g-2 mb-2">
                <div className="col-md-8">Disfrute compartido durante la interacción <span className="float-end">(B-5)</span></div>
                <div className="col-md-2 border rounded p-1 text-center">{mostrarColumna(disfruteCompartido)}</div>
                <div className="col-md-2 border rounded p-1 text-center">{mostrarColumna2(disfruteCompartido2)}</div>
              </div>
              <div className="row g-2 mb-4">
                <div className="col-md-8">Mostrar <span className="float-end">(B-9)</span></div>
                <div className="col-md-2 border rounded p-1 text-center">{mostrarColumna(mostrar)}</div>
                <div className="col-md-2 border rounded p-1 text-center">{mostrarColumna2(mostrar2)}</div>
              </div>
              <div className="row g-2 mb-2">
                <div className="col-md-8">Iniciación espontánea de la atención conjunta <span className="float-end">(B-10)</span></div>
                <div className="col-md-2 border rounded p-1 text-center">{mostrarColumna(iniciacionEspontanea)}</div>
                <div className="col-md-2 border rounded p-1 text-center">{mostrarColumna2(iniciacionEspontanea2)}</div>
              </div>
              <div className="row g-2 mb-2">
                <div className="col-md-8">Respuesta a la atención conjunta <span className="float-end">(B-11)</span></div>
                <div className="col-md-2 border rounded p-1 text-center">{mostrarColumna(respuestaAtencionConjunta)}</div>
                <div className="col-md-2 border rounded p-1 text-center">{mostrarColumna2(respuestaAtencionConjunta2)}</div>
              </div>
              <div className="row g-2 mb-2">
                <div className="col-md-8">Características de las iniciaciones sociales <span className="float-end">(B-12)</span></div>
                <div className="col-md-2 border rounded p-1 text-center">{mostrarColumna(caracteristicasIniciaciones)}</div>
                <div className="col-md-2 border rounded p-1 text-center">{mostrarColumna2(caracteristicasIniciaciones2)}</div>
              </div>
            </fieldset>

            <fieldset className="border rounded p-3" style={{ background: "#D4EDDA" }}>
              <div className="row g-2">
                <div className="col-md-8 text-end fw-bold" style={{ color: "#155724" }}>TOTAL AS:</div>
                <div className="col-md-2 border rounded p-1 text-center" style={{ background: "#ffffff", color: "#000" }}>{mostrarColumna(totalASValue)}</div>
                <div className="col-md-2 border rounded p-1 text-center" style={{ background: "#ffffff", color: "#000" }}>{mostrarColumna2(totalASValue)}</div>
              </div>
            </fieldset>

            {/* CRR */}
            <fieldset className="border rounded p-3">
              <legend className="w-auto px-2">Comportamiento Restringido y Repetitivo (CRR)</legend>
              <div className="row g-2 mb-2">
                <div className="col-md-8">Entonación de las vocalizaciones o verbalizaciones <span className="float-end">(A-3)</span></div>
                <div className="col-md-2 border rounded p-1 text-center">{mostrarColumna(entonacion)}</div>
                <div className="col-md-2 border rounded p-1 text-center">{mostrarColumna2(entonacion2)}</div>
              </div>
              <div className="row g-2 mb-2">
                <div className="col-md-8">Uso estereotipado o idiosincrásico de palabras o frases <span className="float-end">(A-5)</span></div>
                <div className="col-md-2 border rounded p-1 text-center">{mostrarColumna(usoEsteriotipado)}</div>
                <div className="col-md-2 border rounded p-1 text-center">{mostrarColumna2(usoEsteriotipado2)}</div>
              </div>
              <div className="row g-2 mb-2">
                <div className="col-md-8">Interés sensorial inusual en los materiales de juego o en las personas <span className="float-end">(D-1)</span></div>
                <div className="col-md-2 border rounded p-1 text-center">{mostrarColumna(interesSensorial)}</div>
                <div className="col-md-2 border rounded p-1 text-center">{mostrarColumna2(interesSensorial2)}</div>
              </div>
              <div className="row g-2 mb-2">
                <div className="col-md-8">Manierismos de manos y dedos y otros manierismos complejos <span className="float-end">(D-2)</span></div>
                <div className="col-md-2 border rounded p-1 text-center">{mostrarColumna(manierismosManos)}</div>
                <div className="col-md-2 border rounded p-1 text-center">{mostrarColumna2(manierismosManos2)}</div>
              </div>
              <div className="row g-2 mb-2">
                <div className="col-md-8">Intereses inusualmente repetitivos o comportamientos estereotipados <span className="float-end">(D-4)</span></div>
                <div className="col-md-2 border rounded p-1 text-center">{mostrarColumna(interesesRepetitivos)}</div>
                <div className="col-md-2 border rounded p-1 text-center">{mostrarColumna2(interesesRepetitivos2)}</div>
              </div>
            </fieldset>

            <fieldset className="border rounded p-3" style={{ background: "#D4EDDA" }}>
              <div className="row g-2">
                <div className="col-md-8 text-end fw-bold" style={{ color: "#155724" }}>TOTAL CRR:</div>
                <div className="col-md-2 border rounded p-1 text-center" style={{ background: "#fff", color: "#000" }}>{mostrarColumna(totalCRRValue)}</div>
                <div className="col-md-2 border rounded p-1 text-center" style={{ background: "#fff", color: "#000" }}>{mostrarColumna2(totalCRRValue)}</div>
              </div>
            </fieldset>

            {/* Total Global */}
            <fieldset className="border rounded p-3 mb-4 text-white" style={{ background: "#155724" }}>
              <div className="row g-2">
                <div className="col-md-8 text-end fw-bold">PUNTUACIÓN TOTAL GLOBAL (AS + CRR):</div>
                <div className="col-md-2 border rounded p-1 text-center" style={{ background: "#fff", color: "#155724" }}>{mostrarColumna(totalGlobalValue)}</div>
                <div className="col-md-2 border rounded p-1 text-center" style={{ background: "#fff", color: "#155724" }}>{mostrarColumna2(totalGlobalValue)}</div>
              </div>
            </fieldset>

            {/* Puntuación Comparativa y Nivel de Síntomas */}
            <div className="border rounded p-3 mb-4">
              <div className="row g-2 mb-2">
                <div className="col-md-6">Puntuación comparativa del ADOS-2</div>
                <div className="col-md-6 border rounded p-1">{puntuacion_comparativa}</div>
              </div>
              <div className="row g-2 mb-2">
                <div className="col-md-4">Nivel de síntomas asociados al autismo</div>
                <div className="col-8 border rounded p-2">
                  {getDescripcionComparativa(puntuacion_comparativa)}
                </div>
              </div>
            </div>

            {/* Clasificación y Diagnóstico */}
            <fieldset className="border rounded p-3 mb-4">
              <legend className="w-auto px-2">CLASIFICACIÓN Y DIAGNÓSTICO</legend>
              <div className="row g-2 mb-2">
                <div className="col-md-4">Clasificación del ADOS-2:</div>
                <div className="col-md-8 border rounded p-2">{clasificacion}</div>
              </div>
              <div className="row g-2 mb-2">
                <div className="col-md-4">Diagnóstico general:</div>
                <div className="col-md-8 border rounded p-2">{diagnostico}</div>
              </div>
            </fieldset>
          </div>
        </div>
      </div>
      <div className="mt-auto">
      </div>
    </div>
  );
}
