import React, { useEffect } from "react";
import { HashRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/Login/LoginPage";
import Home_Espe from "./Especialista/home_espe";
import Home_Paciente from "./Paciente/home_paciente";
import Registrar from "./Especialista/Registrar";
import EstablecerContra from "./pages/Login/EstablecerContra";
import ProtectedRoute from "./ProtectedRoute";
import ConsentimientoInformado from "./Paciente/Consetimiento";
import ConsentimientoProfesional from "./Especialista/ConsentimientoEspecialista";
import Pacientes from "./Especialista/Pacientes";
import ListaTestsPaciente from "./Evaluacion/ListaTestsPaciente";
import ResumenADIR from "./Evaluacion/ResumenADIR";
import DesactivarCuenta from "./Paciente/DesactivarCuenta";
import HomeAdmin from "./Admin/HomeAdmin";
import CrudUsuarios from "./Admin/Usuarios/CrudUsuarios";
import FormUsuario from "./Admin/Usuarios/FormUsuario";
import CrudPacientes from "./Admin/Pacientes/CrudPacientes";
import FormPaciente from "./Admin/Pacientes/FormPaciente";
import CrudEspecialistas from "./Admin/CrudEspecialistas";
import CrudAreas from "./Admin/CrudAreas";
import CrudPreguntas from "./Admin/CrudPreguntas";
import CrudActividades from "./Admin/CrudActividades";
import CrudTestsAdiR from "./Admin/CrudTestsAdiR";
import CrudTestsAdos2 from "./Admin/CrudTestsAdos2";
import PerfilEspecialista from "./Especialista/PerfilEspecialista";
import PerfilPaciente from "./Paciente/PerfilPaciente";
import Resultados from "./Paciente/Resultados";
import CrudResponsables from "./Admin/Pacientes/CrudResponsables";

import PacientesADOS from "./Especialista/PacientesADOS";
import TestsADOSPaciente from "./Especialista/TestsADOSPaciente";
import ActividadesADOS from "./Especialista/ActividadesADOS";
import ResponderItemsAlgoritmo from "./Especialista/ResponderItemsAlgoritmo";
import ActividadesConsulta from "./Especialista/ActividadesConsulta";

import CrearAdir from "./Evaluacion/CrearAdir";
import ResponderAdir from "./Evaluacion/ResponderAdir";
import Algoritmo from "./Evaluacion/Algoritmo";
import Reportes from "./Especialista/Reportes";

import ModuloT from "./Reportes/ModuloT";
import Modulo1 from "./Reportes/Modulo1";
import Modulo2 from "./Reportes/Modulo2";
import Modulo3 from "./Reportes/Modulo3";
import Modulo4 from "./Reportes/Modulo4";
import ReportAdiR from "./Reportes/ReportAdiR";
import ReportAdiR_paciente from "./Reportes/ReportAdiR_paciente";


import EstadisticasAdmin from "./Admin/EstadisticasAdmin";
import EstadisticasEspecialista from "./Especialista/EstadisticasEspecialista";
//Agregado ahorita
import ListaUsuarios from "./Especialista/ListaUsuarios";

function App() {
  useEffect(() => {
    let timeout;
    const INACTIVITY_LIMIT = 120 * 60 * 1000; // 120 minutos

    const resetTimer = () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        localStorage.removeItem("user");
        window.location.href = "/";
      }, INACTIVITY_LIMIT);
    };

    window.addEventListener("mousemove", resetTimer);
    window.addEventListener("keydown", resetTimer);
    window.addEventListener("click", resetTimer);

    resetTimer();

    return () => {
      clearTimeout(timeout);
      window.removeEventListener("mousemove", resetTimer);
      window.removeEventListener("keydown", resetTimer);
      window.removeEventListener("click", resetTimer);
    };
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/establecer-contra" element={<EstablecerContra />} />

        {/* Solo especialistas (privilegio 0) */}
        <Route path="/ver-usuarios" element={<ListaUsuarios />} />
        <Route element={<ProtectedRoute allowedPrivileges={[0]} />}>
          <Route path="/home_espe" element={<Home_Espe />} />
          <Route path="/registrar" element={<Registrar />} />
          <Route
            path="/consentimiento-especialista"
            element={<ConsentimientoProfesional />}
          />
          <Route path="/pacientes" element={<Pacientes />} />
          <Route
            path="/tests-paciente/:id_paciente"
            element={<ListaTestsPaciente />}
          />
          <Route path="/resumen-adir/:id_adir" element={<ResumenADIR />} />
          <Route path="/crear-adir/:id_paciente" element={<CrearAdir />} />{" "}
          {/* NUEVA RUTA */}
          <Route path="/perfil-especialista" element={<PerfilEspecialista />} />
          <Route path="/pacientesados" element={<PacientesADOS />} />
          <Route path="/tests/:id_paciente" element={<TestsADOSPaciente />} />
          <Route
            path="/ados/actividades/:modulo/:id_paciente"
            element={<ActividadesADOS />}
          />
          <Route
            path="/ados/responder-items/:id_ados/:id_algoritmo"
            element={<ResponderItemsAlgoritmo />}
          />
          <Route
            path="/ados/tests/:id_paciente"
            element={<TestsADOSPaciente />}
          />
          <Route
            path="/ados/actividades-consulta/:id_ados"
            element={<ActividadesConsulta />}
          />
          <Route path="/responder-adir/:id_adir" element={<ResponderAdir />} />
          <Route path="/algoritmo/:id_adir" element={<Algoritmo />} />
          <Route path="/reportes" element={<Reportes />} />
          <Route path="/reporte-adir" element={<ReportAdiR />} />
          <Route path="/estadisticas_especialista" element={<EstadisticasEspecialista />} />
          <Route path="/estadisticas_especialista/:id" element={<EstadisticasEspecialista />} />
          <Route path="/especialista/estadisticas" element={<EstadisticasEspecialista />} />
        </Route>
        {/* Solo pacientes (privilegio 1) */}
        <Route element={<ProtectedRoute allowedPrivileges={[1]} />}>
          <Route path="/home_paciente" element={<Home_Paciente />} />
          <Route
            path="/consentimiento-informado"
            element={<ConsentimientoInformado />}
          />
          <Route path="/desactivar-cuenta" element={<DesactivarCuenta />} />
          <Route path="/perfil-paciente" element={<PerfilPaciente />} />
          <Route path="/resultados" element={<Resultados />} />
          <Route path="/modulo-t" element={<ModuloT />} />
          <Route path="/modulo-1" element={<Modulo1 />} />
          <Route path="/modulo-2" element={<Modulo2 />} />
          <Route path="/modulo-3" element={<Modulo3 />} />
          <Route path="/modulo-4" element={<Modulo4 />} />
          <Route
            path="/reporte-adir-paciente"
            element={<ReportAdiR_paciente />}
          />
        </Route>
        {/* Solo admin (privilegio 3) */}
        <Route element={<ProtectedRoute allowedPrivileges={[3]} />}>
          <Route path="/admin/home" element={<HomeAdmin />} />
          {/* Usuarios */}
          <Route path="/admin/usuarios" element={<CrudUsuarios />} />
          <Route path="/admin/usuarios/nuevo" element={<FormUsuario />} />
          <Route path="/admin/usuarios/editar/:id" element={<FormUsuario />} />
          {/* Pacientes */}
          <Route path="/admin/pacientes" element={<CrudPacientes />} />
          <Route path="/admin/pacientes/nuevo" element={<FormPaciente />} />
          <Route
            path="/admin/pacientes/responsables/:id_paciente"
            element={<CrudResponsables />}
          />
          <Route
            path="/admin/pacientes/editar/:id"
            element={<FormPaciente />}
          />
          {/* Especialistas */}
          <Route path="/admin/especialistas" element={<CrudEspecialistas />} />
          <Route path="/admin/areas" element={<CrudAreas />} />
          <Route path="/admin/preguntas" element={<CrudPreguntas />} />
          <Route path="/admin/actividades" element={<CrudActividades />} />
          <Route path="/admin/tests-adir" element={<CrudTestsAdiR />} />
          <Route path="/admin/tests-ados" element={<CrudTestsAdos2 />} />
          <Route path="/admin/estadisticas" element={<EstadisticasAdmin />} />
        </Route>

        {/* Catch-all: evita Not Found en rutas desconocidas */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
