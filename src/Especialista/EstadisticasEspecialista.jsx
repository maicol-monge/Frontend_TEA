import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { apiUrl } from '../config/apiConfig';
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
import { useParams } from 'react-router-dom';
import Navbar from '../components/Navbar_espe';
import Footer from '../components/Footer';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

export default function EstadisticasEspecialista({ idEspecialista: propId }) {
  const params = useParams();
  const id = propId || params.id_especialista || params.id || null;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [pacientes, setPacientes] = useState(null);
  const [evaluaciones, setEvaluaciones] = useState(null);
  const [diagnosticos, setDiagnosticos] = useState(null);
  const [actividades, setActividades] = useState(null);

  // refs para exportar imagenes de charts en el PDF
  const sexoChartRef = useRef(null);
  const edadChartRef = useRef(null);
  const adosChartRef = useRef(null);

  const AGE_RANGES = ['0-2','3-4','5-10','11-17','18-30','31-50','51+'];

  const normalizePacientesFromEndpoint = (raw = {}) => {
    const out = { ...raw };
    if (Array.isArray(out.por_sexo)) {
      out.por_sexo = out.por_sexo.map(s => ({ sexo: s.sexo ?? s.key ?? 'Otro', total: Number(s.total ?? 0) }));
    } else if (out.por_sexo && typeof out.por_sexo === 'object') {
      out.por_sexo = Object.entries(out.por_sexo).map(([k,v]) => ({ sexo: k, total: Number(v ?? 0) }));
    } else out.por_sexo = [];

    let srcEdad = {};
    if (out.edad_distribucion && typeof out.edad_distribucion === 'object') {
      if (Array.isArray(out.edad_distribucion)) {
        out.edad_distribucion.forEach(e => {
          if (!e) return;
          const k = e.rango ?? e.range ?? e.key ?? e.label;
          const v = e.total ?? e.count ?? 0;
          if (k) srcEdad[String(k)] = Number(v);
        });
      } else {
        Object.entries(out.edad_distribucion).forEach(([k,v]) => { srcEdad[String(k)] = Number(v ?? 0); });
      }
    }
    const edadFinal = AGE_RANGES.reduce((acc, rango) => { acc[rango] = Number(srcEdad[rango] ?? 0); return acc; }, {});
    out.edad_distribucion = edadFinal;

    out.total = Number(out.total ?? 0);
    out.average_age_years = Number(out.average_age_years ?? 0);
    return out;
  };

  useEffect(() => {
    if (!id) {
      setError('ID de especialista no proporcionado');
      setLoading(false);
      return;
    }

    const token = localStorage.getItem('token');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const base = '/api/especialista/estadisticas';
        const urls = {
          pacientes: apiUrl(`${base}/pacientes/${id}`),
          evaluaciones: apiUrl(`${base}/evaluaciones/${id}`),
          diagnosticos: apiUrl(`${base}/diagnosticos/${id}`),
          actividades: apiUrl(`${base}/actividades/${id}`)
        };

        const [pacRes, evalRes, diagRes, actRes] = await Promise.all([
          axios.get(urls.pacientes, { headers }),
          axios.get(urls.evaluaciones, { headers }),
          axios.get(urls.diagnosticos, { headers }),
          axios.get(urls.actividades, { headers })
        ]);

        const final = {
          pacientes: pacRes?.data ?? {},
          evaluaciones: evalRes?.data ?? {},
          diagnosticos: diagRes?.data ?? {},
          actividades: actRes?.data ?? {}
        };

        const pacientesData = normalizePacientesFromEndpoint(final.pacientes || {});
        setPacientes(pacientesData);
        setEvaluaciones(final.evaluaciones || {});
        setDiagnosticos(final.diagnosticos || {});
        setActividades(final.actividades || {});

        // si todo viene vacío avisar
        const isEmpty =
          pacientesData.total === 0 &&
          pacientesData.por_sexo.length === 0 &&
          Object.values(pacientesData.edad_distribucion || {}).every(v => v === 0) &&
          (Number(final.evaluaciones?.total_ados ?? 0) === 0) &&
          (Number(final.evaluaciones?.total_adir ?? 0) === 0);
        if (isEmpty) setError('No hay datos registrados para este especialista (respuesta válida pero vacía).');
      } catch (err) {
        console.error(err);
        // mostrar mensaje simple
        setError(err.response?.data || err.message || 'Error cargando datos');
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [id]);

  // Preparar datos para charts (mínimo necesario)
  const totalPacientes = Number(pacientes?.total ?? 0);
  const avgAge = Number(pacientes?.average_age_years ?? 0);
  const porSexo = pacientes?.por_sexo ?? [];
  const edadDistribObj = pacientes?.edad_distribucion ?? AGE_RANGES.reduce((acc,r)=>{acc[r]=0;return acc;},{});
  const totalAdos = Number(evaluaciones?.total_ados ?? 0);
  const totalAdir = Number(evaluaciones?.total_adir ?? 0);
  const adosPorModulo = Array.isArray(evaluaciones?.ados_por_modulo) ? evaluaciones.ados_por_modulo : [];

  const sexoPie = { labels: porSexo.map(p=>p.sexo), datasets:[{ data: porSexo.map(p=>p.total), backgroundColor: porSexo.map((_,i)=>`hsl(${(i*90)%360} 70% 55%)`) }] };
  const edadBar = { labels: AGE_RANGES, datasets:[{ label: 'Pacientes', data: AGE_RANGES.map(r=>Number(edadDistribObj[r]??0)), backgroundColor: 'rgba(69,123,157,0.85)' }] };
  const adosChart = { labels: adosPorModulo.map(x=>x.modulo), datasets:[{ label:'ADOS', data: adosPorModulo.map(x=>x.total), backgroundColor: 'rgba(69,123,157,0.85)' }] };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom', labels: { boxWidth: 12 } }, tooltip: { mode: 'index', intersect: false } }
  };

  // estilos inline simples para evitar CSS externo
  const chartCardStyle = { minHeight: 220, padding: 8 };

  // Exportar Excel
  const exportToExcel = () => {
    try {
      const wb = XLSX.utils.book_new();

      const resumen = [
        ['Reporte estadísticas - Especialista'],
        [],
        ['Especialista ID', id],
        ['Pacientes (activos reportados)', totalPacientes],
        ['Edad promedio (años)', avgAge],
        [],
        ['Evaluaciones'],
        ['Total ADOS', totalAdos],
        ['Total ADIR', totalAdir],
        [],
        ['Distribución por edad', ...AGE_RANGES],
        [ ...AGE_RANGES.map(r => Number(edadDistribObj[r] ?? 0)) ],
        [],
        ['Nota', 'Datos obtenidos del endpoint /api/especialista/estadisticas/*']
      ];
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(resumen), 'Resumen');

      const sexoRows = (porSexo || []).map(s => ({ Sexo: s.sexo, Total: Number(s.total) }));
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(sexoRows), 'Pacientes_Sexo');

      const edadRows = AGE_RANGES.map(r => ({ Rango: r, Total: Number(edadDistribObj[r] ?? 0) }));
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(edadRows), 'Pacientes_Edad');

      const adosRows = (adosPorModulo || []).map(a => ({ Modulo: a.modulo, Total: a.total }));
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(adosRows), 'ADOS_por_modulo');

      const diagRows = (Array.isArray(diagnosticos?.por_diagnostico) ? diagnosticos.por_diagnostico : []).map(d => ({ Diagnostico: d.diagnostico, Total: d.total }));
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(diagRows), 'Diagnosticos');

      XLSX.writeFile(wb, `estadisticas_especialista_${id}_${new Date().toISOString().slice(0,10)}.xlsx`);
    } catch (e) {
      console.error('Error exportando Excel:', e);
      alert('Error al exportar Excel. Mira la consola.');
    }
  };

  // Exportar PDF con imágenes de charts
  const exportToPDF = async () => {
    try {
      const doc = new jsPDF('p','mm','a4');
      doc.setFontSize(14);
      doc.text(`Estadísticas - Especialista (ID: ${id})`, 14, 16);
      let y = 22;
      doc.setFontSize(10);
      doc.text(`Pacientes: ${totalPacientes} — Edad promedio: ${avgAge} años`, 14, y); y += 6;
      doc.text(`Evaluaciones: ADOS ${totalAdos} · ADIR ${totalAdir}`, 14, y); y += 8;

      const toBase64 = (ref) => {
        try { return ref?.current?.toBase64Image?.(); } catch(e){ return null; }
      };

      const sexoImg = toBase64(sexoChartRef);
      const edadImg = toBase64(edadChartRef);
      const adosImg = toBase64(adosChartRef);

      const pushImage = (img, topY, title) => {
        if (!img) return topY;
        doc.setFontSize(11);
        doc.text(title, 14, topY); topY += 4;
        doc.addImage(img, 'PNG', 14, topY, 180, 60);
        return topY + 66;
      };

      if (sexoImg) y = pushImage(sexoImg, y, 'Pacientes por sexo');
      if (edadImg && y + 70 < 280) y = pushImage(edadImg, y, 'Distribución por edad');
      if (adosImg && y + 70 < 280) y = pushImage(adosImg, y, 'ADOS por módulo');

      if (y + 30 > 270) { doc.addPage(); y = 14; }

      autoTable(doc, { startY: y, head:[['Sexo','Total']], body: (porSexo || []).map(s=>[s.sexo, String(s.total)]) , styles:{ fontSize:9 }});
      y = doc.lastAutoTable?.finalY ? doc.lastAutoTable.finalY + 6 : y + 40;

      const edadRows = AGE_RANGES.map(r => [r, String(edadDistribObj[r] ?? 0)]);
      if (y + 40 > 270) { doc.addPage(); y = 14; }
      autoTable(doc, { startY: y, head:[['Rango edad','Total']], body: edadRows, styles:{ fontSize:9 }});

      doc.save(`estadisticas_especialista_${id}_${new Date().toISOString().slice(0,10)}.pdf`);
    } catch (e) {
      console.error('Error exportando PDF:', e);
      alert('Error al exportar PDF. Mira la consola.');
    }
  };

  if (loading) return (
    <>
      <Navbar />
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
        <div className="spinner-border text-secondary" role="status" style={{ width: 48, height: 48 }} />
      </div>
    </>
  );

  if (error) return (
    <>
      <Navbar />
      <div className="container my-4">
        <div className="alert alert-danger">Error: {String(error)}</div>
      </div>
      <Footer />
    </>
  );

  return (
    <>
      <Navbar />
      <div className="container my-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <h4 className="mb-0">Estadísticas — Especialista</h4>
            <small className="text-muted">ID: {id} — Pacientes: {totalPacientes}</small>
          </div>
          <div className="d-flex gap-2">
            <button className="btn btn-outline-secondary" onClick={exportToExcel}>Exportar Excel</button>
            <button className="btn btn-outline-secondary" onClick={exportToPDF}>Exportar PDF</button>
          </div>
        </div>

        <div className="row g-3">
          <div className="col-12 col-md-4">
            <div className="card p-3 mb-3" style={{ borderRadius:8 }}>
              <div className="small text-muted">Pacientes únicos</div>
              <h3 className="mb-1">{totalPacientes}</h3>
              <div className="text-muted small">Edad promedio: {avgAge} años</div>
            </div>

            <div className="card p-3" style={{ borderRadius:8 }}>
              <h6 className="mb-2">Distribución por sexo</h6>
              <div style={chartCardStyle}>
                {porSexo.length ? <Pie ref={sexoChartRef} data={sexoPie} options={chartOptions} /> : <div className="text-muted">Sin datos por sexo</div>}
              </div>
            </div>
          </div>

          <div className="col-12 col-md-8">
            <div className="card p-3 mb-3" style={{ borderRadius:8 }}>
              <h6 className="mb-2">Distribución por edad</h6>
              <div style={chartCardStyle}>
                {Object.values(edadDistribObj).some(v=>v>0) ? <Bar ref={edadChartRef} data={edadBar} options={{ ...chartOptions, indexAxis:'y' }} /> : <div className="text-muted">Sin datos de edad</div>}
              </div>
            </div>

            <div className="card p-3" style={{ borderRadius:8 }}>
              <h6 className="mb-2">Evaluaciones</h6>
              <div className="d-flex gap-3 mb-3">
                <div><strong>{totalAdos}</strong><div className="text-muted small">ADOS</div></div>
                <div><strong>{totalAdir}</strong><div className="text-muted small">ADIR</div></div>
              </div>
              <div style={chartCardStyle}>
                {adosPorModulo.length ? <Bar ref={adosChartRef} data={adosChart} options={chartOptions} /> : <div className="text-muted">Sin datos ADOS por módulo</div>}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}