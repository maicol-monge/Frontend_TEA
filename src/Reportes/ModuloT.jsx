import { useRef } from "react";
import html2pdf from "html2pdf.js";

export default function ReporteModuleT({ datos }) {
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
    observaciones = [],
    diagnostico = "",
    clasificacion = "",
    total_punto = "",
    puntuacion_comparativa = "",
    // Puedes agregar más campos según lo que traigas del backend
  } = datos || {};

  const { id_algoritmo = 7 } = datos || {}; // Por defecto 7 si no viene

  // Función para generar PDF desde el contenido oculto
  const generarPDF = () => {
    if (!reportRef.current) return;
    const element = reportRef.current;
    const opt = {
      margin: 0.3,
      filename: "Reporte-Modulo-T.pdf",
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
    };
    html2pdf().set(opt).from(element).save();
  };

  // Función para mostrar el valor correcto según el algoritmo
const mostrarValor = (campo, campo2) => id_algoritmo === 8 ? campo2 : campo;

// Funciones para mostrar en la columna correcta según el algoritmo
const mostrarColumna = (valor) => id_algoritmo === 8 ? "" : valor;
const mostrarColumna2 = (valor) => id_algoritmo === 8 ? valor : "";

// Helper para obtener y convertir puntaje por código
const convertirPuntaje = (puntaje, id_algoritmo, id_codificacion) => {
  id_algoritmo = parseInt(id_algoritmo, 10);
  if ((id_algoritmo === 7 || id_algoritmo === 8) && id_codificacion === 135) {
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

// Helper para obtener y convertir puntaje por código
const getPuntaje = (codigo) => {
  const p = puntuaciones.find(p => p.codigo === codigo);
  if (!p) return 0;
  return convertirPuntaje(Number(p.puntaje), id_algoritmo, p.id_codificacion);
};

// Mapea los puntajes por código (sin guion, ejemplo: "A2", "B1", etc.)
const vocalizacionSp = getPuntaje("A2");
const senalar = getPuntaje("A7");
const gestos = getPuntaje("A8");
const contactoVisual = getPuntaje("B1");
const contactoVisual2 = contactoVisual;
const expresionesFaciales = getPuntaje("B4");
const expresionesFaciales2 = expresionesFaciales;
const integracionMirada = getPuntaje("B5");
const integracionMirada2 = integracionMirada;
const disfruteCompartido = getPuntaje("B6");
const respuestaNombre = getPuntaje("B7");
const ignorar = getPuntaje("B8");
const pedir = getPuntaje("B9");
const mostrar = getPuntaje("B12");
const iniciacionEspontanea = getPuntaje("B13");
const iniciacionEspontanea2 = iniciacionEspontanea;
const respuestaAtencion = getPuntaje("B14");
const caracteristicasIniciaciones = getPuntaje("B15");
const caracteristicasIniciaciones2 = caracteristicasIniciaciones;
const cantidadIniciaciones = getPuntaje("B16b");
const calidadRelacion = getPuntaje("B18");
const entonacion = getPuntaje("A3");
const interesSensorial = getPuntaje("D1");
const interesSensorial2 = interesSensorial;
const movimientosManos = getPuntaje("D2");
const movimientosManos2 = movimientosManos;
const interesesRepetitivos = getPuntaje("D5");
const interesesRepetitivos2 = interesesRepetitivos;

// Totales (ajusta si los recibes directo o debes calcularlos)
const totalAS = puntuaciones.find(p => p.titulo === "TOTAL_AS")?.puntaje ?? "";
const totalAS2 = totalAS;
const totalCRR = puntuaciones.find(p => p.titulo === "TOTAL_CRR")?.puntaje ?? "";
const totalCRR2 = totalCRR;
const totalGlobal = puntuaciones.find(p => p.titulo === "TOTAL_GLOBAL")?.puntaje ?? "";
const totalGlobal2 = totalGlobal;

// Observaciones finales (ahora directo del objeto principal)
const rangoPreocupacion = clasificacion ?? "";
const impresionClinica = diagnostico ?? "";

// Suma los puntajes de AS (antes del bloque TOTAL AS)
const totalASValue =
  [vocalizacionSp, senalar, gestos, contactoVisual, expresionesFaciales, integracionMirada, disfruteCompartido,
   respuestaNombre, ignorar, pedir, mostrar, iniciacionEspontanea, respuestaAtencion, caracteristicasIniciaciones,
   cantidadIniciaciones, calidadRelacion]
    .reduce((a, b) => a + b, 0);

// Suma los puntajes de CRR (antes del bloque TOTAL CRR)
const totalCRRValue =
  [entonacion, interesSensorial, movimientosManos, interesesRepetitivos]
    .reduce((a, b) => a + b, 0);

// Para campos únicos, muestra vacío si es 0
const mostrarUnico = (valor) => valor === 0 ? "" : valor;

const formatFecha = (fechaStr) => {
    if (!fechaStr) return "";
    const d = new Date(fechaStr);
    if (isNaN(d)) return "";
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  };

  return (
    <div className="d-flex flex-column min-vh-100" style={{ background: COLOR_BG }}>
      <div className="container my-4">
        <h2 className="text-center text-primary mb-4">Módulo T</h2>
        <div className="text-center mb-4">
          <button className="btn btn-primary" onClick={generarPDF}>
            Generar Reporte PDF
          </button>
        </div>
        <div >
          <div ref={reportRef} className="bg-white p-4">
            {/* ENCABEZADO DEL REPORTE */}
            <div className="row mb-4">
              <div className="col-md-6">
                <h1 className="text-primary">ADOS-2</h1>
              </div>
              <div className="col-md-6 text-end">
                <h1 className="text-primary">Algoritmo Módulo T</h1>
              </div>
            </div>

            {/* DATOS DEL EVALUADO */}
            <fieldset className="border rounded p-3">
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
                  <div className="border rounded p-1">{especialista_nombres} {especialista_apellidos}</div>
                </div>
              </div>
            </fieldset>

             {/* ================= */}
              {/* BLOQUE ALGORITMO */}
              {/* ================= */}
              <fieldset class="border p-3">
                  <div class="row g-2 mb-2">
                      <div class="col-md-8">
        
                      </div>
                      <div class="col-md-4">
                          <div class="card bg-light">
                          <div class="card-header fw-bold text-center">
                              ALGORITMO
                          </div>
                      <div class="card-body">
                      <div class="row">
              <div class="col-6 text-center border-end">
                <div class="fw-bold"><small>Niños pequeños/mayores con pocas o ninguna palabra </small></div>
                
              </div>
              <div class="col-6 text-center">
                <div class="fw-bold"><small>Niños mayores con algunas palabras</small></div>
                
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
              </fieldset>

            {/* AFECTACIÓN SOCIAL (AS) */}
            <fieldset className="border rounded p-3">
              <legend className="w-auto px-2">Afectación Social (AS)</legend>

              <h6 className="text-secondary">Comunicación</h6>
              <div className="row g-2 mb-2">
                <div className="col-md-8">
                  Frecuencia de la vocalización espontánea dirigida a otros
                  <span className="float-end">(A-2)</span>
                </div>
                <div className="col-md-2 border rounded p-1">{mostrarUnico(vocalizacionSp)}</div>
                <div className="col-md-2"></div>
              </div>
              <div className="row g-2 mb-2">
                <div className="col-md-8">
                  Señalar
                  <span className="float-end">(A-7)</span>
                </div>
                <div className="col-md-2"></div>
                <div className="col-md-2 border rounded p-1">{mostrarUnico(senalar)}</div>
              </div>
              <div className="row g-2 mb-2">
                <div className="col-md-8">
                  Gestos
                  <span className="float-end">(A-8)</span>
                </div>
                <div className="col-md-2 border rounded p-1">{mostrarUnico(gestos)}</div>
                <div className="col-md-2"></div>
              </div>

              <h6 className="text-secondary mt-3">Interacción social recíproca</h6>
              <div className="row g-2 mb-2">
                <div className="col-md-8">
                  Contacto visual inusual*
                  <span className="float-end">(B-1)</span>
                </div>
                <div className="col-md-2 border rounded p-1">{mostrarColumna(contactoVisual)}</div>
                <div className="col-md-2 border rounded p-1">{mostrarColumna2(contactoVisual)}</div>
              </div>
              <div className="row g-2 mb-2">
                <div className="col-md-8">
                  Expresiones faciales dirigidas a otros
                  <span className="float-end">(B-4)</span>
                </div>
                <div className="col-md-2 border rounded p-1">{mostrarColumna(expresionesFaciales)}</div>
                <div className="col-md-2 border rounded p-1">{mostrarColumna2(expresionesFaciales)}</div>
              </div>
              <div className="row g-2 mb-2">
                <div className="col-md-8">
                  Integración de la mirada y otras conductas durante las iniciaciones sociales
                  <span className="float-end">(B-5)</span>
                </div>
                <div className="col-md-2 border rounded p-1">{mostrarColumna(integracionMirada)}</div>
                <div className="col-md-2 border rounded p-1">{mostrarColumna2(integracionMirada)}</div>
              </div>
              <div className="row g-2 mb-2">
                <div className="col-md-8">
                  Disfrute compartido durante la interacción
                  <span className="float-end">(B-6)</span>
                </div>
                <div className="col-md-2 border rounded p-1">{mostrarUnico(disfruteCompartido)}</div>
                <div className="col-md-2"></div>
              </div>
              <div className="row g-2 mb-2">
                <div className="col-md-8">
                  Respuesta al nombre
                  <span className="float-end">(B-7)</span>
                </div>
                <div className="col-md-2"></div>
                <div className="col-md-2 border rounded p-1">{mostrarUnico(respuestaNombre)}</div>
              </div>
              <div className="row g-2 mb-2">
                <div className="col-md-8">
                  Ignorar
                  <span className="float-end">(B-8)</span>
                </div>
                <div className="col-md-2"></div>
                <div className="col-md-2 border rounded p-1">{mostrarUnico(ignorar)}</div>
              </div>
              <div className="row g-2 mb-2">
                <div className="col-md-8">
                  Pedir
                  <span className="float-end">(B-9)</span>
                </div>
                <div className="col-md-2"></div>
                <div className="col-md-2 border rounded p-1">{mostrarUnico(pedir)}</div>
              </div>
              <div className="row g-2 mb-2">
                <div className="col-md-8">
                  Mostrar
                  <span className="float-end">(B-12)</span>
                </div>
                <div className="col-md-2 border rounded p-1">{mostrarUnico(mostrar)}</div>
                <div className="col-md-2"></div>
              </div>
              <div className="row g-2 mb-2">
                <div className="col-md-8">
                  Iniciación espontánea de la atención conjunta
                  <span className="float-end">(B-13)</span>
                </div>
                <div className="col-md-2 border rounded p-1">{mostrarColumna(iniciacionEspontanea)}</div>
                <div className="col-md-2 border rounded p-1">{mostrarColumna2(iniciacionEspontanea2)}</div>
                <div className="col-md-2"></div>
              </div>
              <div className="row g-2 mb-2">
                <div className="col-md-8">
                  Respuesta a la atención conjunta
                  <span className="float-end">(B-14)</span>
                </div>
                <div className="col-md-2 border rounded p-1">{mostrarUnico(respuestaAtencion)}</div>
                <div className="col-md-2"></div>
              </div>
              <div className="row g-2 mb-2">
                <div className="col-md-8">
                  Características de las iniciaciones sociales
                  <span className="float-end">(B-15)</span>
                </div>
                <div className="col-md-2 border rounded p-1">{mostrarColumna(caracteristicasIniciaciones)}</div>
                <div className="col-md-2 border rounded p-1">{mostrarColumna2(caracteristicasIniciaciones)}</div>
              </div>
              <div className="row g-2 mb-4">
                <div className="col-md-8">
                  Cantidad de las iniciaciones sociales/familiar o cuidador
                  <span className="float-end">(B-16b)</span>
                </div>
                <div className="col-md-2"></div>
                <div className="col-md-2 border rounded p-1">{mostrarUnico(cantidadIniciaciones)}</div>
              </div>
              <div className="row g-2 mb-2">
                <div className="col-md-8">
                  Calidad general de la relación
                  <span className="float-end">(B-18)</span>
                </div>
                <div className="col-md-2"></div>
                <div className="col-md-2 border rounded p-1">{mostrarUnico(calidadRelacion)}</div>
              </div>
            </fieldset>

             {/* ============================= */}
              {/* TOTAL AFECTACIÓN SOCIAL (AS) */}
              {/* ============================= */}
              <fieldset className="border rounded p-3 bg-info ">
                <div className="row g-2">
                  <div className="col-md-8 text-end fw-bold text-white">TOTAL AS:</div>
                  <div className="col-md-2 border rounded p-1 text-white">{mostrarColumna(totalASValue)}</div>
                  <div className="col-md-2 border rounded p-1 text-white">{mostrarColumna2(totalASValue)}</div>
                </div>
              </fieldset>

            {/* CRR */}
            <fieldset className="border rounded p-3">
              <legend className="w-auto px-2">Comportamiento Restringido y Repetitivo (CRR)</legend>

              <div className="row g-2 mb-2">
                <div className="col-md-8">
                  Entonación de las vocalizaciones o verbalizaciones
                  <span className="float-end">(A-3)</span>
                </div>
                <div className="col-md-2 border rounded p-1">{mostrarColumna(entonacion)}</div>
              </div>
              <div className="row g-2 mb-2">
                <div className="col-md-8">
                  Interés sensorial inusual en los materiales de juego o en las personas
                  <span className="float-end">(D-1)</span>
                </div>
                <div className="col-md-2 border rounded p-1">{mostrarColumna(interesSensorial)}</div>
                <div className="col-md-2 border rounded p-1">{mostrarColumna2(interesSensorial2)}</div>
              </div>
              <div className="row g-2 mb-2">
                <div className="col-md-8">
                  Movimientos de manos y dedos / postura
                  <span className="float-end">(D-2)</span>
                </div>
                <div className="col-md-2 border rounded p-1">{mostrarColumna(movimientosManos)}</div>
                <div className="col-md-2 border rounded p-1">{mostrarColumna2(movimientosManos2)}</div>
              </div>
              <div className="row g-2 mb-2">
                <div className="col-md-8">
                  Intereses inusualmente repetitivos o comportamientos estereotipados
                  <span className="float-end">(D-5)</span>
                </div>
                <div className="col-md-2 border rounded p-1">{mostrarColumna(interesesRepetitivos)}</div>
              <div className="col-md-2 border rounded p-1">{mostrarColumna2(interesesRepetitivos2)}</div>

              </div>
            </fieldset>

              {/* ============================= */}
              {/* TOTAL COMPORTAMIENTO CRR */}
              {/* ============================= */}
              <fieldset className="border rounded p-3 bg-info">
                <div className="row row g-2 mb-2">
                  <div className="col-md-8 text-end fw-bold text-white">TOTAL CRR:</div>
                  <div className="col-md-2 border rounded p-1 text-white">{mostrarColumna(totalCRRValue)}</div>
                  <div className="col-md-2 border rounded p-1 text-white">{mostrarColumna2(totalCRRValue)}</div>
                </div>
              </fieldset>

              {/* ================= */}
              {/* TOTAL GLOBAL (AS+CRR) */}
              {/* ================= */}
              <fieldset className="border rounded p-3 bg-primary mb-4">
                <div className="row g-2 mb-2">
                  <div className="col-md-8 text-end fw-bold text-white">PUNTUACIÓN TOTAL GLOBAL (AS + CRR):</div>
                  <div className="col-md-2 border rounded p-1 text-white">{mostrarColumna(total_punto)}</div>
                  <div className="col-md-2 border rounded p-1 text-white">{mostrarColumna2(total_punto)}</div>
                </div>
              </fieldset>

              {/* ==================================== */}
              {/* OBSERVACIONES FINALES */}
              {/* ==================================== */}
              <fieldset className="border rounded p-3 mb-4">
                <legend className="w-auto px-2">Observaciones Finales</legend>
                <div className="row g-2 mb-2">
                  <div className="col-md-4">Rango de preocupación:</div>
                  <div className="col-md-8 border rounded p-2">{rangoPreocupacion}</div>
                </div>
                <div className="row g-2 mb-2">
                  <div className="col-md-4">Impresión clínica:</div>
                  <div className="col-md-8 border rounded p-2">{impresionClinica}</div>
                </div>
              </fieldset>

          </div>
        </div>
      </div>
    </div>
  );
}



