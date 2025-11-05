import React from "react";
import NavbarAdmin from "../components/NavbarAdmin";
import Footer from "../components/Footer";

const COLOR_BG = "#a8dadc";
const COLOR_PRIMARY = "#457b9d";

const HomeAdmin = () => (
    <div className="d-flex flex-column min-vh-100" style={{ background: COLOR_BG }}>
        <NavbarAdmin />
        <div className="container py-5 flex-grow-1">
            <h1 className="text-center mb-4" style={{ color: COLOR_PRIMARY, fontWeight: "bold" }}>
                Panel de Administración
            </h1>
            <div className="row g-4 justify-content-center">
                <div className="col-12 col-md-6 col-lg-4">
                    <div className="card shadow text-center" style={{ borderRadius: 18 }}>
                        <div className="card-body">
                            <h5 className="card-title fw-bold">Gestión de Usuarios</h5>
                            <p className="card-text">CRUD completo de usuarios del sistema.</p>
                            <button className="btn btn-primary" onClick={() => window.location.href = "/admin/usuarios"}>Ir</button>
                        </div>
                    </div>
                </div>
                <div className="col-12 col-md-6 col-lg-4">
                    <div className="card shadow text-center" style={{ borderRadius: 18 }}>
                        <div className="card-body">
                            <h5 className="card-title fw-bold">Gestión de Pacientes</h5>
                            <p className="card-text">CRUD de pacientes registrados.</p>
                            <button className="btn btn-primary" onClick={() => window.location.href = "/admin/pacientes"}>Ir</button>
                        </div>
                    </div>
                </div>
                <div className="col-12 col-md-6 col-lg-4">
                    <div className="card shadow text-center" style={{ borderRadius: 18 }}>
                        <div className="card-body">
                            <h5 className="card-title fw-bold">Gestión de Especialistas</h5>
                            <p className="card-text">CRUD de especialistas del sistema.</p>
                            <button className="btn btn-primary" onClick={() => window.location.href = "/admin/especialistas"}>Ir</button>
                        </div>
                    </div>
                </div>
                <div className="col-12 col-md-6 col-lg-4">
                    <div className="card shadow text-center" style={{ borderRadius: 18 }}>
                        <div className="card-body">
                            <h5 className="card-title fw-bold">Gestión de Áreas</h5>
                            <p className="card-text">CRUD de áreas para preguntas ADI.</p>
                            <button className="btn btn-primary" onClick={() => window.location.href = "/admin/areas"}>Ir</button>
                        </div>
                    </div>
                </div>
                <div className="col-12 col-md-6 col-lg-4">
                    <div className="card shadow text-center" style={{ borderRadius: 18 }}>
                        <div className="card-body">
                            <h5 className="card-title fw-bold">Gestión de Preguntas ADI</h5>
                            <p className="card-text">CRUD de preguntas para la evaluación ADI-R.</p>
                            <button className="btn btn-primary" onClick={() => window.location.href = "/admin/preguntas"}>Ir</button>
                        </div>
                    </div>
                </div>
                <div className="col-12 col-md-6 col-lg-4">
                    <div className="card shadow text-center" style={{ borderRadius: 18 }}>
                        <div className="card-body">
                            <h5 className="card-title fw-bold">Gestión de Actividades ADOS</h5>
                            <p className="card-text">CRUD de actividades para la evaluación ADOS-2.</p>
                            <button className="btn btn-primary" onClick={() => window.location.href = "/admin/actividades"}>Ir</button>
                        </div>
                    </div>
                </div>
                <div className="col-12 col-md-6 col-lg-4">
                    <div className="card shadow text-center" style={{ borderRadius: 18 }}>
                        <div className="card-body">
                            <h5 className="card-title fw-bold">Tests ADI-R</h5>
                            <p className="card-text">CRUD de evaluaciones ADI-R realizadas.</p>
                            <button className="btn btn-primary" onClick={() => window.location.href = "/admin/tests-adir"}>Ir</button>
                        </div>
                    </div>
                </div>
                <div className="col-12 col-md-6 col-lg-4">
                    <div className="card shadow text-center" style={{ borderRadius: 18 }}>
                        <div className="card-body">
                            <h5 className="card-title fw-bold">Tests ADOS-2</h5>
                            <p className="card-text">CRUD de evaluaciones ADOS-2 realizadas.</p>
                            <button className="btn btn-primary" onClick={() => window.location.href = "/admin/tests-ados"}>Ir</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <Footer />
    </div>
);

export default HomeAdmin;