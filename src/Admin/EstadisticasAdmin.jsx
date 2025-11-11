import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { apiUrl } from '../config/apiConfig';
import NavbarAdmin from '../components/NavbarAdmin';
import Footer from '../components/Footer';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

export default function EstadisticasAdmin() {
  const COLOR_PRIMARY = '#457b9d';
  const COLOR_ACCENT = '#f3859e';
  const COLOR_BG = '#a8dadc';
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [usuarios, setUsuarios] = useState(null);
  const [especialistas, setEspecialistas] = useState(null);
  const [pacientes, setPacientes] = useState(null);
  const [evaluaciones, setEvaluaciones] = useState(null);

  // Chart refs para export PDF (capturar imagen)
  const adosChartRef = useRef(null);
  const sexoChartRef = useRef(null);
  const edadChartRef = useRef(null);

  // Rango de edades usado por backend (mismo que en tu endpoint)
  const AGE_RANGES = ['0-2','3-4','5-10','11-17','18-30','31-50','51+'];

  // Normaliza la respuesta que devuelve tu endpoint "viejo" (más robusto)
  const normalizePacientesFromOldEndpoint = (raw = {}) => {
    const out = { ...raw };

    // CONSOLE: ver la respuesta original (abre devtools -> consola)
    try { console.debug('RAW pacientes endpoint:', raw); } catch(e){}

    // POR SEXO -> normalizar a [{sexo, total}]
    if (Array.isArray(out.por_sexo)) {
      out.por_sexo = out.por_sexo.map(s => ({ sexo: s.sexo ?? s.key ?? s.label ?? 'Otro', total: Number(s.total ?? 0) }));
    } else if (out.por_sexo && typeof out.por_sexo === 'object') {
      out.por_sexo = Object.entries(out.por_sexo).map(([k,v]) => ({ sexo: k, total: Number(v ?? 0) }));
    } else {
      out.por_sexo = [];
    }

    // EDAD: admitir varios formatos
    let srcEdad = {};

    // 1) Si viene como objeto asociativo { '0-2': 2, ... }
    if (out.edad_distribucion && typeof out.edad_distribucion === 'object' && !Array.isArray(out.edad_distribucion)) {
      srcEdad = Object.fromEntries(Object.entries(out.edad_distribucion).map(([k,v]) => [String(k), Number(v ?? 0)]));
    }

    // 2) Si viene como array de objetos [{ rango:'0-2', total:2 }, ...]
    if (Array.isArray(out.edad_distribucion)) {
      out.edad_distribucion.forEach(e => {
        if (!e) return;
        const k = e.rango ?? e.range ?? e.key ?? e.label;
        const v = e.total ?? e.count ?? e.value ?? 0;
        if (k) srcEdad[String(k)] = Number(v ?? 0);
      });
    }

    // 3) Si pluck devolvió Collection especial (a veces viene como {} con numeric keys) -> map entries
    if (!Object.keys(srcEdad).length && out.edad_distribucion && typeof out.edad_distribucion === 'object') {
      try {
        Object.entries(out.edad_distribucion).forEach(([k,v]) => { srcEdad[String(k)] = Number(v ?? 0); });
      } catch(e){}
    }

    // Asegurar todos los rangos en orden y número
    const edadFinal = AGE_RANGES.reduce((acc, rango) => {
      acc[rango] = Number(srcEdad[rango] ?? srcEdad[String(rango)] ?? 0);
      return acc;
    }, {});
    out.edad_distribucion = edadFinal;

    // Totales numéricos
    out.total = Number(out.total ?? 0);
    out.pacientes_con_dsm5 = Number(out.pacientes_con_dsm5 ?? 0);

    try { console.debug('NORMALIZED pacientes:', out); } catch(e){}

    return out;
  };

  // (Se eliminó la normalización automática; el componente usará la respuesta tal cual)

  useEffect(() => {
    const token = localStorage.getItem('token');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    async function load() {
      try {
        setLoading(true);
        setError(null);

        const [
          usuariosRes,
          especialistasRes,
          pacientesRes,
          evaluacionesRes
        ] = await Promise.all([
          axios.get(apiUrl('/api/admin/estadisticas/usuarios'), { headers }),
          axios.get(apiUrl('/api/admin/estadisticas/especialistas'), { headers }),
          axios.get(apiUrl('/api/admin/estadisticas/pacientes'), { headers }),
          axios.get(apiUrl('/api/admin/estadisticas/evaluaciones'), { headers })
        ]);

        const usuariosData = usuariosRes.data || {};
        let pacientesData = pacientesRes.data || {};
        // Normalizar según tu endpoint antiguo (más robusto)
        pacientesData = normalizePacientesFromOldEndpoint(pacientesData);

        // --- usuarios: fallback para por_tipo_activos (igual que antes) ---
        if (!Array.isArray(usuariosData?.por_tipo_activos) || usuariosData.por_tipo_activos.length === 0) {
          try {
            const listRes = await axios.get(apiUrl('/api/admin/usuarios?per_page=10000'), { headers });
            let usersList = [];
            if (Array.isArray(listRes.data)) usersList = listRes.data;
            else if (Array.isArray(listRes.data?.data)) usersList = listRes.data.data;
            else if (Array.isArray(listRes.data?.users)) usersList = listRes.data.users;
            else if (Array.isArray(listRes.data?.items)) usersList = listRes.data.items;
            if (usersList.length > 0) {
              const activos = usersList.filter(u => String(u.estado) === '1' || u.estado === 1);
              const counts = activos.reduce((acc, u) => {
                const key = String(u.privilegio ?? '0');
                acc[key] = (acc[key] || 0) + 1;
                return acc;
              }, {});
              usuariosData.por_tipo_activos = Object.entries(counts).map(([priv, total]) => ({ privilegio: priv, total }));
              usuariosData.total_activos = activos.length;
            }
          } catch (err) {
            // fallback proporcional (ya implementado)
            if (Array.isArray(usuariosData?.por_tipo) && Array.isArray(usuariosData?.por_estado)) {
              const activosTotal = Number(usuariosData.por_estado.find(s => String(s.estado) === '1')?.total || 0);
              const totalTipo = usuariosData.por_tipo.reduce((s, t) => s + Number(t.total), 0);
              if (totalTipo > 0 && activosTotal > 0) {
                usuariosData.por_tipo_activos = usuariosData.por_tipo.map(t => {
                  const proportion = Number(t.total) / totalTipo;
                  return { privilegio: String(t.privilegio), total: Math.round(proportion * activosTotal) };
                });
                usuariosData.total_activos = usuariosData.por_tipo_activos.reduce((s, t) => s + Number(t.total), 0);
              }
            }
          }
        }

        // --- pacientes: preferir campos "*_activos"; si no existen, intentar obtener lista y calcular activos ---
        if (!Array.isArray(pacientesData?.por_sexo_activos) || pacientesData.por_sexo_activos.length === 0 || !pacientesData?.edad_distribucion_activos) {
          try {
            const listRes = await axios.get(apiUrl('/api/admin/pacientes?per_page=10000'), { headers });
            let patList = [];
            if (Array.isArray(listRes.data)) patList = listRes.data;
            else if (Array.isArray(listRes.data?.data)) patList = listRes.data.data;
            else if (Array.isArray(listRes.data?.patients)) patList = listRes.data.patients;
            else patList = [];

            if (patList.length > 0) {
              const activos = patList.filter(p => String(p.estado) === '1' || p.estado === 1);
              pacientesData.total_activos = activos.length;
              // por sexo
              const sexoCounts = activos.reduce((acc, p) => {
                const k = p.sexo ?? 'Otro';
                acc[k] = (acc[k] || 0) + 1;
                return acc;
              }, {});
              pacientesData.por_sexo_activos = Object.entries(sexoCounts).map(([sexo, total]) => ({ sexo, total }));

              // edad: calcular rangos como en backend
              const ranges = { '0-2':0,'3-4':0,'5-10':0,'11-17':0,'18-30':0,'31-50':0,'51+':0 };
              activos.forEach(p => {
                const fn = p.fecha_nacimiento || p.fechaNacimiento || p.nacimiento;
                if (!fn) return;
                const born = new Date(fn);
                if (isNaN(born)) return;
                const now = new Date();
                let age = now.getFullYear() - born.getFullYear();
                const m = now.getMonth() - born.getMonth();
                if (m < 0 || (m === 0 && now.getDate() < born.getDate())) age--;
                if (age >=0 && age <=2) ranges['0-2']++;
                else if (age >=3 && age <=4) ranges['3-4']++;
                else if (age >=5 && age <=10) ranges['5-10']++;
                else if (age >=11 && age <=17) ranges['11-17']++;
                else if (age >=18 && age <=30) ranges['18-30']++;
                else if (age >=31 && age <=50) ranges['31-50']++;
                else ranges['51+']++;
              });
              pacientesData.edad_distribucion_activos = ranges;
              pacientesData.pacientes_con_dsm5_activos = activos.filter(p => Number(p.filtro_dsm_5) === 1).length;
            }
          } catch (err) {
            // si falla, dejamos los datos de estadisticas tal cual (recomiendo agregar *_activos en backend)
          }
        }

        setUsuarios(usuariosData);
        setEspecialistas(especialistasRes.data);
        setPacientes(pacientesData);
        setEvaluaciones(evaluacionesRes.data);
      } catch (err) {
        setError(err.response?.data || err.message);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  // ---------- EXPORT FUNCTIONS ----------
  const exportToExcel = () => {
    const wb = XLSX.utils.book_new();

    // Hoja: Resumen (descripción y totales)
    const resumen = [
      ['Reporte de estadísticas - resumen'],
      [],
      ['Usuarios'],
      ['Total usuarios', totalUsuarios],
      ['Usuarios activos', usuariosActivos],
      ['Usuarios inactivos', usuariosInactivos],
      [],
      ['Pacientes'],
      ['Total pacientes (reportado)', pacientesTotal],
      ['Pacientes activos (estimado/reportado)', pacientesActivosTotal],
      ['Pacientes con DSM-5', pacientesConDsm5],
      [],
      ['Distribución por edad', 'Rangos en columnas siguientes (0-2 ... 51+)'],
      [ ...AGE_RANGES.map(r => r) ],
      [ ...AGE_RANGES.map(r => Number(edadDistribObj[r] ?? 0)) ],
      [],
      ['Evaluaciones'],
      ['Total ADOS', totalAdos],
      ['Total ADIR', totalAdir],
      [],
      ['Nota', 'Los datos reflejan la respuesta del endpoint /api/admin/estadisticas/pacientes tal como está en backend.']
    ];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(resumen), 'Resumen');

    // Usuarios
    const tiposFuente = usuarios?.por_tipo_activos?.length ? usuarios.por_tipo_activos : usuarios?.por_tipo ?? [];
    const privilegioMapLocal = { '0': 'Especialista', '1': 'Paciente', '3': 'Admin' };
    const usuariosRows = tiposFuente.map(t => ({
      Tipo: String(t.privilegio),
      Label: privilegioMapLocal[String(t.privilegio)] || `Privilegio ${t.privilegio}`,
      Total: Number(t.total)
    }));
    usuariosRows.unshift({ Tipo: 'Activos totales', Label: '', Total: usuarios?.total_activos ?? '' });
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(usuariosRows), 'Usuarios');

    // Pacientes por sexo (usar el mismo array que muestra UI)
    const sexoRows = (porSexoPacientes || []).map(s => ({ Sexo: s.sexo, Total: Number(s.total) }));
    sexoRows.unshift({ Sexo: 'Total Activos', Total: pacientes?.total_activos ?? pacientes?.total ?? '' });
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(sexoRows), 'Pacientes_Por_Sexo');

    // Pacientes por edad (usar edadDistribObj que muestra UI)
    const edadRows = AGE_RANGES.map(r => ({ Rango: r, Total: Number(edadDistribObj[r] ?? 0) }));
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(edadRows), 'Pacientes_Edad');

    // Especialistas
    const ranking = especialistas?.ranking_por_casos ?? [];
    const espRows = ranking.map((r, i) => ({ '#': i + 1, Nombres: r.nombres, Apellidos: r.apellidos, PacientesUnicos: r.pacientes_atendidos }));
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(espRows), 'Especialistas');

    // Evaluaciones ADOS
    const ados = evaluaciones?.ados_por_modulo || [];
    const adosRows = ados.map(a => ({ Modulo: a.modulo, Total: a.total }));
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(adosRows), 'Evaluaciones_ADOS');

    XLSX.writeFile(wb, `estadisticas_${new Date().toISOString().slice(0,10)}.xlsx`);
  };
 
  const exportToPDF = () => {
    try {
      const doc = new jsPDF('p', 'mm', 'a4');
      doc.setFontSize(14);
      doc.text('Reporte de Estadísticas', 14, 16);
      let y = 22;

      // Texto introductorio descriptivo
      doc.setFontSize(10);
      const intro = [
        `Usuarios: total ${totalUsuarios} (activos ${usuariosActivos}, inactivos ${usuariosInactivos}).`,
        `Pacientes: total reportado ${pacientesTotal}, activos (si aplica) ${pacientesActivosTotal}.`,
        `Se incluyen distribución por sexo y por rangos de edad (${AGE_RANGES.join(', ')}).`,
        `Evaluaciones: ADOS ${totalAdos}, ADIR ${totalAdir}.`
      ];
      intro.forEach((line, i) => doc.text(line, 14, 24 + (i * 6)));
      y = 24 + (intro.length * 6) + 4;

      // Insertar imágenes de gráficos (si existen) - ADOS, Sexo, Edad
      const pushImage = (imgData, topY, title) => {
        if (!imgData) return topY;
        const maxW = 180;
        const imgH = 60;
        doc.setFontSize(11);
        doc.text(title, 14, topY);
        topY += 4;
        doc.addImage(imgData, 'PNG', 14, topY, maxW, imgH);
        return topY + imgH + 6;
      };

      // obtener imágenes de charts si están montados
      let adosImg = null, sexoImg = null, edadImg = null;
      try { adosImg = adosChartRef.current?.toBase64Image?.(); } catch(e) { adosImg = null; }
      try { sexoImg = sexoChartRef.current?.toBase64Image?.(); } catch(e) { sexoImg = null; }
      try { edadImg = edadChartRef.current?.toBase64Image?.(); } catch(e) { edadImg = null; }

      if (adosImg) y = pushImage(adosImg, y, 'Gráfico: ADOS por módulo');
      if (sexoImg) y = pushImage(sexoImg, y, 'Gráfico: Pacientes por sexo');
      if (edadImg) y = pushImage(edadImg, y, 'Gráfico: Distribución por edad');

      // Si queda poco espacio, nueva página
      if (y + 20 > 270) { doc.addPage(); y = 14; }

      // Tablas: Usuarios
      const tiposFuente = usuarios?.por_tipo_activos?.length ? usuarios.por_tipo_activos : usuarios?.por_tipo ?? [];
      const privilegioMapLocal = { '0': 'Especialista', '1': 'Paciente', '3': 'Admin' };
      const usuariosBody = tiposFuente.map(t => [String(t.privilegio), privilegioMapLocal[String(t.privilegio)] || `Privilegio ${t.privilegio}`, String(t.total)]);
      if (usuarios?.total_activos) usuariosBody.unshift(['', 'Activos totales', String(usuarios.total_activos)]);
      autoTable(doc, { startY: y, head: [['Tipo','Etiqueta','Total']], body: usuariosBody, styles:{ fontSize:9 }, headStyles: { fillColor: [69,123,157] }});
      y = doc.lastAutoTable?.finalY ? doc.lastAutoTable.finalY + 6 : y + 40;

      // Pacientes por sexo (usar mismo array que UI)
      const porSexo = porSexoPacientes || [];
      autoTable(doc, { startY: y, head: [['Sexo','Total']], body: porSexo.map(s => [s.sexo, String(s.total)]), styles:{ fontSize:9 }});
      y = doc.lastAutoTable?.finalY ? doc.lastAutoTable.finalY + 6 : y + 40;

      // Pacientes por edad (usar edadDistribObj que muestra UI)
      const edadRows = AGE_RANGES.map(r => [r, String(edadDistribObj[r] ?? 0)]);
      if (y + 40 > 270) { doc.addPage(); y = 14; }
      autoTable(doc, { startY: y, head: [['Rango edad','Total']], body: edadRows, styles:{ fontSize:9 }});
      y = doc.lastAutoTable?.finalY ? doc.lastAutoTable.finalY + 6 : y + 40;

      // Evaluaciones ADOS
      const ados = evaluaciones?.ados_por_modulo || [];
      if (y + 40 > 270) { doc.addPage(); y = 14; }
      autoTable(doc, { startY: y, head: [['Módulo ADOS','Total']], body: ados.map(a => [a.modulo, String(a.total)]), styles:{ fontSize:9 }});

      doc.save(`estadisticas_${new Date().toISOString().slice(0,10)}.pdf`);
    } catch (err) {
      console.error('Error exportando PDF:', err);
      alert('Error al generar PDF. Revisa la consola para más detalles.');
    }
  };

  if (loading) return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
      <div className="text-center">
        <div className="spinner-border text-secondary" role="status" style={{ width: 48, height: 48 }} />
        <div className="mt-2">Cargando estadísticas...</div>
      </div>
    </div>
  );
  if (error) return <div className="alert alert-danger m-3">Error: {String(error)}</div>;

  // Helpers: calcular activos/inactivos de usuarios
  const totalUsuarios = usuarios?.total ?? 0;
  const estadoLista = usuarios?.por_estado ?? [];
  const usuariosActivos = Number(estadoLista.find(s => String(s.estado) === '1')?.total || 0);
  const usuariosInactivos = Number(estadoLista.find(s => String(s.estado) === '0')?.total || 0);

  // Especialista: top 1 del ranking
  const ranking = especialistas?.ranking_por_casos ?? [];
  const topEspecialista = ranking.length ? ranking[0] : null;

  // Evaluaciones
  const totalAdos = evaluaciones?.total_ados ?? 0;
  const totalAdir = evaluaciones?.total_adir ?? 0;
  const adosChart = evaluaciones?.ados_por_modulo || [];
  const chartData = {
    labels: adosChart.map(x => x.modulo),
    datasets: [
      {
        label: 'ADOS por módulo',
        backgroundColor: 'rgba(69,123,157,0.85)',
        borderColor: COLOR_PRIMARY,
        borderWidth: 1,
        data: adosChart.map(x => x.total)
      }
    ]
  };

  // Pacientes: tomar LOS CAMPOS tal como los devuelve tu endpoint (por_sexo array/collection, edad_distribucion objeto)
  const pacientesActivosTotal = pacientes?.total_activos ?? pacientes?.total ?? 0;
  const pacientesTotal = pacientes?.total ?? 0;

  // por_sexo: puede venir como array [{sexo,total}] o como objeto {F:3, M:4}
  const porSexoPacientes = (() => {
    if (!pacientes?.por_sexo) return [];
    if (Array.isArray(pacientes.por_sexo)) {
      return pacientes.por_sexo.map(s => ({ sexo: s.sexo ?? s.key ?? 'Otro', total: Number(s.total ?? 0) }));
    }
    if (typeof pacientes.por_sexo === 'object') {
      return Object.entries(pacientes.por_sexo).map(([k, v]) => ({ sexo: k, total: Number(v ?? 0) }));
    }
    return [];
  })();

  // edad_distribucion: tu endpoint devuelve pluck('total','rango') -> objeto { '0-2': N, ... }
  const edadDistribObj = (() => {
    const src = pacientes?.edad_distribucion || {};
    // si viene como array [{rango,total}] normalizar también
    let map = {};
    if (Array.isArray(src)) {
      src.forEach(e => {
        const k = e.rango ?? e.range ?? e.key ?? null;
        if (k) map[String(k)] = Number(e.total ?? 0);
      });
    } else if (src && typeof src === 'object') {
      Object.entries(src).forEach(([k, v]) => { map[String(k)] = Number(v ?? 0); });
    }
    // asegurar orden y claves
    return AGE_RANGES.reduce((acc, r) => { acc[r] = Number(map[r] ?? 0); return acc; }, {});
  })();

  const pacientesConDsm5 = Number(pacientes?.pacientes_con_dsm5 ?? 0);

  // Mejoras de legibilidad: edad y módulos ADOS
  const edadEntries = Object.entries(edadDistribObj);
  const rangesWithPatients = edadEntries.filter(([r, t]) => Number(t) > 0);
  const rangesCount = rangesWithPatients.length;
  const topRangeEntry = rangesWithPatients.slice(0).sort((a,b)=> Number(b[1]) - Number(a[1]))[0] || null;

  const adosModules = adosChart.map(m => ({ modulo: m.modulo, total: m.total }));
  const adosPreview = adosModules.slice(0,3).map(m => `${m.modulo} (${m.total})`).join(', ');
  const adosMore = Math.max(0, adosModules.length - 3);

  // Mapeo legible para privilegios (ajusta según tus valores reales)
  const privilegioMap = {
    '0': 'Especialista',
    '1': 'Paciente',
    '3': 'Admin'
  };
  const mapPrivilegio = (p) => {
    const key = String(p);
    return privilegioMap[key] || `Privilegio ${key}`;
  };

  // Datos para pastel (por tipo) - usar activos si backend los devuelve
  const tiposFuente = usuarios?.por_tipo_activos?.length ? usuarios.por_tipo_activos : usuarios?.por_tipo ?? [];
  const tipoLabels = tiposFuente.map(t => mapPrivilegio(t.privilegio));
  const tipoData = tiposFuente.map(t => Number(t.total));
  const colors = tipoLabels.map((_, i) => `hsl(${(i * 60) % 360} 70% 55%)`);
  const pieData = {
    labels: tipoLabels,
    datasets: [{ data: tipoData, backgroundColor: colors }]
  };

  return (
    <div className="d-flex flex-column min-vh-100" style={{ background: COLOR_BG }}>
      <NavbarAdmin />
      <div className="container my-4 flex-grow-1">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <div>
            <h2 style={{ color: COLOR_PRIMARY }} className="fw-bold">Estadísticas - Administrador</h2>
            <small className="text-muted d-block">Resumen y detalle (activos cuando esté disponible)</small>
          </div>

          <div className="d-flex gap-2">
            <button className="btn btn-outline-secondary" onClick={exportToExcel}>Exportar Excel</button>
            <button className="btn btn-outline-secondary" onClick={exportToPDF}>Exportar PDF</button>
          </div>
        </div>

        <hr style={{ borderTop: `3px solid ${COLOR_ACCENT}` }} />

        {/* Totales detallados (más legible) */}
        <div className="row g-3 mb-4">
          <div className="col-sm-6 col-md-3">
            <div className="card shadow-sm h-100">
              <div className="card-body">
                <h6 className="card-title text-muted">Usuarios - Total</h6>
                <h3 className="mb-2">{totalUsuarios}</h3>
                <div className="d-flex gap-2">
                  <span className="badge bg-success">Activos: {usuariosActivos}</span>
                  <span className="badge bg-secondary">Inactivos: {usuariosInactivos}</span>
                </div>
                <small className="text-muted d-block mt-2">Tipos registrados: {usuarios?.por_tipo?.length ?? 0}</small>
              </div>
            </div>
          </div>

          <div className="col-sm-6 col-md-3">
            <div className="card shadow-sm h-100">
              <div className="card-body">
                <h6 className="card-title text-muted">Especialistas</h6>
                <h3 className="mb-2">{especialistas?.especialistas_activos ?? 0} activos</h3>
              </div>
            </div>
          </div>

          <div className="col-sm-6 col-md-3">
            <div className="card shadow-sm h-100">
              <div className="card-body">
                <h6 className="card-title text-muted">Pacientes</h6>
                <h3 className="mb-2">{pacientesTotal}</h3>

                <div className="mt-1">
                  <small className="text-muted d-block">Pacientes con DSM-5: {pacientesConDsm5}</small>
                  <small className="text-muted d-block mt-2">
                    Rangos con pacientes: {rangesCount}
                    { topRangeEntry ? ` — más poblado: ${topRangeEntry[0]} (${topRangeEntry[1]})` : '' }
                  </small>
                </div>

              </div>
            </div>
          </div>

          <div className="col-sm-6 col-md-3">
            <div className="card shadow-sm h-100">
              <div className="card-body">
                <h6 className="card-title text-muted">Evaluaciones</h6>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <div className="text-muted small">ADOS</div>
                    <h4 className="mb-0">{totalAdos}</h4>
                  </div>
                  <div>
                    <div className="text-muted small">ADIR</div>
                    <h4 className="mb-0">{totalAdir}</h4>
                  </div>
                </div>

                <div className="mt-2">
                  {adosModules.length === 0 ? (
                    <small className="text-muted d-block">No hay módulos ADOS registrados</small>
                  ) : (
                    <small className="text-muted d-block">
                      Módulos ADOS: {adosModules.length} — {adosPreview}{adosMore ? `, y ${adosMore} más` : ''}
                    </small>
                  )}
                </div>

              </div>
            </div>
          </div>
        </div>

        {/* Contenido principal */}
        <div className="row g-4">
          <div className="col-lg-7">
            <div className="card shadow-sm">
              <div className="card-body">
                <h5 className="card-title" style={{ color: COLOR_PRIMARY }}>Gráfica: ADOS por módulo</h5>
                <p className="text-muted small">Distribución de ADOS por módulo (click para ver detalle en la tabla).</p>
                <div style={{ height: 320 }}>
                  <Bar
                    ref={adosChartRef}
                    data={chartData}
                    options={{
                      maintainAspectRatio: false,
                      plugins: { legend: { position: 'top' } },
                      scales: { y: { beginAtZero: true } }
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="card shadow-sm mt-4">
              <div className="card-body">
                <h5 className="card-title" style={{ color: COLOR_PRIMARY }}>Ranking de especialistas (por pacientes únicos)</h5>
                <p className="text-muted small">Lista ordenada por especialistas que atendieron más pacientes.</p>
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Especialista</th>
                        <th className="text-end">Pacientes únicos</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ranking.length ? ranking.map((row, i) => (
                        <tr key={row.id_especialista}>
                          <td>{i + 1}</td>
                          <td>{row.nombres} {row.apellidos}</td>
                          <td className="text-end">{row.pacientes_atendidos}</td>
                        </tr>
                      )) : (
                        <tr><td colSpan="3" className="text-center text-muted">Sin datos</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-5">
            <div className="card shadow-sm mb-3">
              <div className="card-body">
                <h5 className="card-title" style={{ color: COLOR_PRIMARY }}>Usuarios — detalle</h5>
                <p className="text-muted small">Distribución por tipo y estado.</p>

                <div className="row">
                  <div className="col-12 mb-3">
                    <h6 className="small text-muted">Distribución por tipo (gráfico)</h6>
                    <div style={{ height: 200 }}>
                      {tipoData.length ? (
                        <Pie data={pieData} options={{ maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }} />
                      ) : (
                        <div className="text-muted">Sin datos</div>
                      )}
                    </div>
                    <small className="text-muted d-block mt-1">
                      { usuarios?.por_tipo_activos ? 'Gráfico: sólo usuarios activos' : 'Gráfico: todos los usuarios' }
                    </small>

                    <ul className="list-group list-group-flush mt-2">
                      {tiposFuente && tiposFuente.length ? (
                        tiposFuente.map(t => (
                          <li key={t.privilegio} className="list-group-item d-flex justify-content-between align-items-center py-2">
                            <span>{mapPrivilegio(t.privilegio)}</span>
                            <span className="badge bg-secondary">{t.total}</span>
                          </li>
                        ))
                      ) : (
                        <li className="list-group-item text-muted">Sin datos</li>
                      )}
                    </ul>
                  </div>

                  <div className="col-12">
                    <h6 className="small text-muted">Por estado</h6>
                    <ul className="list-group list-group-flush">
                      <li className="list-group-item d-flex justify-content-between align-items-center py-2">
                        <span>Activos</span>
                        <span className="badge bg-success">{usuariosActivos}</span>
                      </li>
                      <li className="list-group-item d-flex justify-content-between align-items-center py-2">
                        <span>Inactivos</span>
                        <span className="badge bg-secondary">{usuariosInactivos}</span>
                      </li>
                    </ul>
                  </div>
                </div>

              </div>
            </div>

            <div className="card shadow-sm">
              <div className="card-body">
                <h5 className="card-title" style={{ color: COLOR_PRIMARY }}>Pacientes — detalle</h5>
                <p className="text-muted small">Sexo y distribución por edad (solo activos cuando esté disponible)</p>

                {/* Gráficos: pastel para sexo + barra horizontal para edades */}
                <div className="row">
                  <div className="col-12 mb-3">
                    <div className="d-flex gap-3 flex-wrap">
                      <div style={{ width: 160, height: 160 }}>
                        {porSexoPacientes?.length ? (
                          (() => {
                            const sexoLabels = porSexoPacientes.map(s => s.sexo);
                            const sexoData = porSexoPacientes.map(s => Number(s.total));
                            const sexoColors = sexoLabels.map((_, i) => `hsl(${(i * 90) % 360} 70% 55%)`);
                            const sexoPie = { labels: sexoLabels, datasets: [{ data: sexoData, backgroundColor: sexoColors }] };
                            return <Pie ref={sexoChartRef} data={sexoPie} options={{ maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }} />;
                          })()
                        ) : (
                          <div className="text-muted">Sin datos por sexo</div>
                        )}
                      </div>

                      <div className="flex-grow-1">
                        <h6 className="small text-muted">Por sexo (detalle)</h6>
                        <ul className="list-unstyled mb-0">
                          {porSexoPacientes?.map ? porSexoPacientes.map(s => (
                            <li key={s.sexo} className="d-flex justify-content-between align-items-center py-1">
                              <small>{s.sexo}</small>
                              <span className="badge bg-secondary">{s.total}</span>
                            </li>
                          )) : <li className="text-muted">Sin datos</li>}
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="col-12">
                    <h6 className="small text-muted">Distribución por edad</h6>
                    <div style={{ height: 220 }}>
                      {edadDistribObj && Object.keys(edadDistribObj).length ? (
                        (() => {
                          const edadObj = edadDistribObj;
                          const edadLabels = Object.keys(edadObj);
                          const edadData = Object.values(edadObj).map(v => Number(v));
                          const barColors = edadLabels.map((_, i) => `hsl(${(i * 45) % 360} 65% 55%)`);
                          const edadChart = { labels: edadLabels, datasets: [{ label: 'Pacientes', data: edadData, backgroundColor: barColors }] };
                          const edadOptions = {
                            indexAxis: 'y',
                            maintainAspectRatio: false,
                            plugins: { legend: { display: false } },
                            scales: { x: { beginAtZero: true } }
                          };
                          return <Bar ref={edadChartRef} data={edadChart} options={edadOptions} />;
                        })()
                      ) : (
                        <div className="text-muted">Sin datos de distribución por edad</div>
                      )}
                    </div>

                    {/* listado como respaldo */}
                    <ul className="list-group list-group-flush mt-2">
                      {edadDistribObj ? Object.entries(edadDistribObj).map(([rango, total]) => (
                        <li key={rango} className="list-group-item d-flex justify-content-between align-items-center py-2">
                          <span>{rango}</span>
                          <span className="badge bg-secondary">{total}</span>
                        </li>
                      )) : <li className="list-group-item text-muted">Sin datos</li>}
                    </ul>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}