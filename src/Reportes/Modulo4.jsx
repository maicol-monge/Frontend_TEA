import { useRef } from "react";
import html2pdf from "html2pdf.js";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar_paciente";

export default function ReporteModulo4({ datos }) {
  const reportRef = useRef();
  const COLOR_BG = "#f8f9fa";

  // Formato de fecha
  const formatFecha = (fechaStr) => {
    if (!fechaStr) return "";
    const d = new Date(fechaStr);
    if (isNaN(d)) return "";
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  };

  // Conversión de puntaje igual que en Modulo1.jsx
  const convertirPuntaje = (puntaje, id_algoritmo, id_codificacion) => {
    id_algoritmo = parseInt(id_algoritmo, 10);
    if (id_algoritmo === 6 && id_codificacion === 135) {
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

  // Helper para obtener puntaje por código
  const getPuntaje = (codigo) => {
    if (!datos?.puntuaciones) return 0;
    const p = datos.puntuaciones.find(p => p.codigo === codigo);
    if (!p) return 0;
    return convertirPuntaje(Number(p.puntaje), datos.id_algoritmo, p.id_codificacion);
  };

  // Datos personales
  const nombres = datos?.nombres || "";
  const apellidos = datos?.apellidos || "";
  const fecha = formatFecha(datos?.fecha);
  const telefono = datos?.telefono || "";
  const especialista = `${datos?.especialista_nombres || ""} ${datos?.especialista_apellidos || ""}`.trim();

  // Comunicación
  const usoEsteriotipado = getPuntaje("A4");
  const conversacion = getPuntaje("A8");
  const gestos = getPuntaje("A9");
  const gestosEnfaticos = getPuntaje("A10");
  const totalComunicacion = usoEsteriotipado + conversacion + gestos + gestosEnfaticos;

  // Interacción social recíproca
  const contactoVisual = getPuntaje("B1");
  const expresionesFaciales = getPuntaje("B2");
  const comentariosEmociones = getPuntaje("B6");
  const responsabilidad = getPuntaje("B8");
  const caracteristicasIniciaciones = getPuntaje("B9");
  const calidadRespuestaSocial = getPuntaje("B11");
  const cantidadComunicacionSocial = getPuntaje("B12");
  const totalISR = contactoVisual + expresionesFaciales + comentariosEmociones + responsabilidad + caracteristicasIniciaciones + calidadRespuestaSocial + cantidadComunicacionSocial;

  // Puntuación total C+ISR
  const totalC_ISR = totalComunicacion + totalISR;

  // Imaginación y creatividad (C-1)
  const imaginacionCreatividad = getPuntaje("C1");

  // Comportamientos estereotipados e intereses restringidos
  const interesSensorial = getPuntaje("D1");
  const manierismosManos = getPuntaje("D2");
  const interesExcesivo = getPuntaje("D4");
  const compulsiones = getPuntaje("D5");
  const totalComportamientos = interesSensorial + manierismosManos + interesExcesivo + compulsiones;

  // Clasificación y Diagnóstico
  const clasificacionADOS = datos?.clasificacion || "";
  const diagnosticoGeneral = datos?.diagnostico || "";

  // PDF
  const generarPDF = () => {
    if (!reportRef.current) return;
    const element = reportRef.current;
    const opt = {
      margin: 0.3,
      filename: "Reporte-Modulo-4.pdf",
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
    };
    html2pdf().set(opt).from(element).save();
  };

  return (
    <div className="d-flex flex-column min-vh-100" style={{ background: COLOR_BG }}>

      <div className="container my-4">
        <h2 className="text-center mb-4" style={{ color: "#FF8C69" }}>Módulo 4</h2>
        <div className="text-center mb-4">
          <button className="btn" style={{ backgroundColor: "#FF8C69", color: "#fff" }} onClick={generarPDF}>
            Generar Reporte PDF
          </button>
        </div>
        <div>
          <div ref={reportRef} className="bg-white p-4">
            {/* Encabezado */}
            <div className="row mb-4">
              <div className="col-md-6">
                <h1 style={{ color: "#FF8C69" }}>ADOS-2</h1>
              </div>
              <div className="col-md-6 text-end">
                <h1 style={{ color: "#FF8C69" }}>Algoritmo Módulo 4</h1>
              </div>
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
                  <div className="border rounded p-1">{fecha}</div>
                </div>
                <div className="col-md-4">
                  <label className="form-label">Teléfono</label>
                  <div className="border rounded p-1">{telefono}</div>
                </div>
                <div className="col-md-4">
                  <label className="form-label">Especialista</label>
                  <div className="border rounded p-1">{especialista}</div>
                </div>
              </div>
            </fieldset>

            {/* Comunicación */}
            <fieldset className="border rounded p-3">
              <legend className="w-auto px-2">Comunicación</legend>
              <div className="row g-2 mb-2">
                <div className="col-md-10">Uso estereotipado o idiosincrásico de palabras o frases <span className="float-end">(A-4)</span></div>
                <div className="col-md-2 border rounded p-1 text-center">{usoEsteriotipado}</div>
              </div>
              <div className="row g-2 mb-2">
                <div className="col-md-10">Conversación <span className="float-end">(A-8)</span></div>
                <div className="col-md-2 border rounded p-1 text-center">{conversacion}</div>
              </div>
              <div className="row g-2 mb-2">
                <div className="col-md-10">Gestos descriptivos, convencionales, instrumentales o informativos <span className="float-end">(A-9)</span></div>
                <div className="col-md-2 border rounded p-1 text-center">{gestos}</div>
              </div>
              <div className="row g-2 mb-2">
                <div className="col-md-10">Gestos enfáticos o emocionales <span className="float-end">(A-10)</span></div>
                <div className="col-md-2 border rounded p-1 text-center">{gestosEnfaticos}</div>
              </div>
            </fieldset>

            {/* TOTAL COMUNICACION (C) */}
            <fieldset className="border rounded p-3" style={{ background: "#FFE5D0" }}>
              <div className="row g-2">
                <div className="col-md-10 text-end fw-bold" style={{ color: "#FF8C69" }}>TOTAL COMUNICACIÓN (C)</div>
                <div className="col-md-2 border rounded p-1 text-center" style={{ background: "#fff", color: "#000" }}>{totalComunicacion}</div>
              </div>
            </fieldset>

            {/* Interacción social recíproca */}
            <fieldset className="border rounded p-3">
              <legend className="w-auto px-2">Interacción social recíproca</legend>
              <div className="row g-2 mb-2">
                <div className="col-md-10">Contacto visual inusual <span className="float-end">(B-1)</span></div>
                <div className="col-md-2 border rounded p-1 text-center">{contactoVisual}</div>
              </div>
              <div className="row g-2 mb-2">
                <div className="col-md-10">Expresiones faciales dirigidas al examinador <span className="float-end">(B-2)</span></div>
                <div className="col-md-2 border rounded p-1 text-center">{expresionesFaciales}</div>
              </div>
              <div className="row g-2 mb-2">
                <div className="col-md-10">Comentarios sobre las emociones de otros / empatía <span className="float-end">(B-6)</span></div>
                <div className="col-md-2 border rounded p-1 text-center">{comentariosEmociones}</div>
              </div>
              <div className="row g-2 mb-2">
                <div className="col-md-10">Responsabilidad <span className="float-end">(B-8)</span></div>
                <div className="col-md-2 border rounded p-1 text-center">{responsabilidad}</div>
              </div>
              <div className="row g-2 mb-2">
                <div className="col-md-10">Características de las iniciaciones sociales <span className="float-end">(B-9)</span></div>
                <div className="col-md-2 border rounded p-1 text-center">{caracteristicasIniciaciones}</div>
              </div>
              <div className="row g-2 mb-2">
                <div className="col-md-10">Calidad de la respuesta social <span className="float-end">(B-11)</span></div>
                <div className="col-md-2 border rounded p-1 text-center">{calidadRespuestaSocial}</div>
              </div>
              <div className="row g-2 mb-2">
                <div className="col-md-10">Cantidad de comunicación social recíproca <span className="float-end">(B-12)</span></div>
                <div className="col-md-2 border rounded p-1 text-center">{cantidadComunicacionSocial}</div>
              </div>
            </fieldset>

            {/* TOTAL INTERACCIÓN SOCIAL RECÍPROCA (ISR) */}
            <fieldset className="border rounded p-3" style={{ background: "#FFE5D0" }}>
              <div className="row g-2">
                <div className="col-md-10 text-end fw-bold" style={{ color: "#FF8C69" }}>TOTAL INTERACCIÓN SOCIAL RECÍPROCA (ISR):</div>
                <div className="col-md-2 border rounded p-1 text-center" style={{ background: "#fff", color: "#000" }}>{totalISR}</div>
              </div>
            </fieldset>

            {/* PUNTUACIÓN TOTAL C+ISR */}
            <fieldset className="border rounded p-3 mb-4" style={{ background: "#FF8C69" }}>
              <div className="row g-2">
                <div className="col-md-10 text-end fw-bold text-white">PUNTUACIÓN TOTAL C+ISR:</div>
                <div className="col-md-2 border rounded p-1 text-center" style={{ background: "#fff", color: "#000" }}>{totalC_ISR}</div>
              </div>
            </fieldset>

            {/* Imaginación y creatividad */}
            <fieldset className="border rounded p-3">
              <legend className="w-auto px-2">Imaginación y creatividad (C-1)</legend>
              <div className="row g-2 mb-2">
                <div className="col-md-10">Imaginación y creatividad <span className="float-end">(C-1)</span></div>
                <div className="col-md-2 border rounded p-1 text-center">{imaginacionCreatividad}</div>
              </div>
            </fieldset>

            {/* Comportamientos estereotipados e intereses restringidos */}
            <fieldset className="border rounded p-3">
              <legend className="w-auto px-2">Comportamientos estereotipados e intereses restringidos</legend>
              <div className="row g-2 mb-2">
                <div className="col-md-10">Interés sensorial inusual en los materiales de juego o en las personas <span className="float-end">(D-1)</span></div>
                <div className="col-md-2 border rounded p-1 text-center">{interesSensorial}</div>
              </div>
              <div className="row g-2 mb-2">
                <div className="col-md-10">Manierismos de manos y dedos y otros manierismos complejos <span className="float-end">(D-2)</span></div>
                <div className="col-md-2 border rounded p-1 text-center">{manierismosManos}</div>
              </div>
              <div className="row g-2 mb-2">
                <div className="col-md-10">Interés excesivo en temas u objetos inusuales o altamente específicos <span className="float-end">(D-4)</span></div>
                <div className="col-md-2 border rounded p-1 text-center">{interesExcesivo}</div>
              </div>
              <div className="row g-2 mb-2">
                <div className="col-md-10">Compulsiones o rituales <span className="float-end">(D-5)</span></div>
                <div className="col-md-2 border rounded p-1 text-center">{compulsiones}</div>
              </div>
            </fieldset>

            {/* TOTAL COMPORTAMIENTOS ESTEREOTIPADOS E INTERESES RESTRINGIDOS */}
            <fieldset className="border rounded p-3 mb-4" style={{ background: "#6C6F73" }}>
              <div className="row g-2">
                <div className="col-md-10 text-end fw-bold text-white">TOTAL COMPORTAMIENTOS ESTEREOTIPADOS E INTERESES RESTRINGIDOS</div>
                <div className="col-md-2 border rounded p-1 text-center" style={{ background: "#fff", color: "#000" }}>{totalComportamientos}</div>
              </div>
            </fieldset>

            {/* Clasificación y Diagnóstico */}
            <fieldset className="border rounded p-3 mb-4">
              <legend className="w-auto px-2">CLASIFICACIÓN Y DIAGNÓSTICO</legend>
              <div className="row g-2 mb-2">
                <div className="col-md-4">Clasificación del ADOS-2:</div>
                <div className="col-md-8 border rounded p-2">{clasificacionADOS}</div>
              </div>
              <div className="row g-2 mb-2">
                <div className="col-md-4">Diagnóstico general:</div>
                <div className="col-md-8 border rounded p-2">{diagnosticoGeneral}</div>
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