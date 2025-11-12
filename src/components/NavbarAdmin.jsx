import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import Logo from "../assets/tea_logo.png";

const COLOR_PRIMARY = "#1d3557";
const COLOR_ACCENT = "#f3859e";
const COLOR_LIGHT = "#f1faee";

const NavbarAdmin = () => {
	const navigate = useNavigate();
	const [menuAbierto, setMenuAbierto] = useState(false);
	const [showEval, setShowEval] = useState(false);
	const [showConfig, setShowConfig] = useState(false);

	const handleLogout = () => {
		Swal.fire({
			title: "¿Cerrar sesión?",
			text: "¿Deseas salir del panel administrativo?",
			icon: "warning",
			showCancelButton: true,
			confirmButtonColor: COLOR_ACCENT,
			cancelButtonColor: COLOR_PRIMARY,
			confirmButtonText: "Sí, cerrar sesión",
			cancelButtonText: "Cancelar",
		}).then((result) => {
			if (result.isConfirmed) {
				localStorage.clear();
				navigate("/");
			}
		});
	};

	const handleNav = (path) => {
		setMenuAbierto(false);
		navigate(path);
	};

	return (
		<nav
			className="navbar navbar-expand-lg shadow-sm"
			style={{
				background: COLOR_PRIMARY,
				borderBottom: `4px solid ${COLOR_ACCENT}`,
			}}
		>
			<style>{`
				/* Hover styles added: visual only, no logic changes */
				.navbar .nav-link.btn-link {
					transition: background .15s ease, color .15s ease, transform .12s ease, box-shadow .15s ease;
					border-radius: 6px;
					padding: 0.25rem 0.6rem;
				}

				.navbar .nav-link.btn-link:hover,
				.navbar .nav-link.btn-link:focus {
					background: ${COLOR_ACCENT};
					color: ${COLOR_PRIMARY} !important;
					text-decoration: none;
				}

				.navbar .dropdown-menu .dropdown-item {
					transition: background .12s ease, color .12s ease;
					border-radius: 6px;
				}

				.navbar .dropdown-menu .dropdown-item:hover,
				.navbar .dropdown-menu .dropdown-item:focus {
					background: ${COLOR_ACCENT};
					color: ${COLOR_PRIMARY};
				}

				/* Logo hover */
				.navbar img[alt="Logo"] {
					transition: transform .18s ease, box-shadow .18s ease;
				}
				.navbar img[alt="Logo"]:hover {
					transform: scale(1.03);
					box-shadow: 0 6px 18px rgba(0,0,0,0.12);
				}

				/* Small elevation for the user dropdown button on hover */
				.navbar .btn-light:hover {
					box-shadow: 0 2px 8px rgba(0,0,0,0.08);
				}
			`}</style>
			<div className="container-fluid px-4">
				{/* Logo + título */}
				<div
					className="d-flex align-items-center"
					style={{ cursor: "pointer" }}
					onClick={() => handleNav("/admin/home")}
				>
					<img
						src={Logo}
						alt="Logo"
						width="42"
						height="42"
						className="me-2"
						style={{
							background: "#fff",
							borderRadius: "50%",
							border: `2px solid ${COLOR_ACCENT}`,
							objectFit: "contain",
						}}
					/>
					<h5 className="m-0 fw-bold text-white">TEA Diagnóstico — Admin</h5>
				</div>

				{/* Menú hamburguesa móvil */}
				<button
					className="navbar-toggler text-white"
					type="button"
					onClick={() => setMenuAbierto(!menuAbierto)}
					aria-label={menuAbierto ? "Cerrar menú" : "Abrir menú"}
				>
					<i
						className="bi bi-list"
						style={{ fontSize: 20 }}
						aria-hidden="true"
					/>
				</button>

				<div
					className={`collapse navbar-collapse ${
						menuAbierto ? "show" : ""
					} mt-2 mt-lg-0 d-flex justify-content-center align-items-center`}
				>
					{/* 🔹 Se agrega justify-content-center al ul */}
					<ul className="navbar-nav mb-2 mb-lg-0 d-flex justify-content-center flex-wrap">
						<li className="nav-item mx-2">
							<button
								className="btn btn-link nav-link text-white d-flex align-items-center"
								onClick={() => handleNav("/admin/estadisticas")}
							>
								<i
									className="bi bi-graph-up me-2"
									aria-hidden="true"
								/>
								Estadísticas
							</button>
						</li>

						<li className="nav-item mx-2">
							<button
								className="btn btn-link nav-link text-white d-flex align-items-center"
								onClick={() => handleNav("/admin/usuarios")}
							>
								<i
									className="bi bi-people me-2"
									aria-hidden="true"
								/>
								Usuarios
							</button>
						</li>

						{/* Dropdown Evaluaciones */}
						<li
							className="nav-item dropdown mx-2"
							onMouseEnter={() => setShowEval(true)}
							onMouseLeave={() => setShowEval(false)}
						>
							<button
								className="btn btn-link nav-link dropdown-toggle text-white d-flex align-items-center"
								data-bs-toggle="dropdown"
								aria-expanded={showEval}
							>
								<i
									className="bi bi-brain me-2"
									aria-hidden="true"
								/>
								Evaluaciones
							</button>
							{showEval && (
								<ul
									className="dropdown-menu show text-center"
									style={{
										background: COLOR_LIGHT,
										border: "none",
										boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
									}}
								>
									<li>
										<button
											className="dropdown-item"
											onClick={() => handleNav("/admin/tests-adir")}
										>
											Tests ADI-R
										</button>
									</li>
									<li>
										<button
											className="dropdown-item"
											onClick={() => handleNav("/admin/tests-ados")}
										>
											Tests ADOS-2
										</button>
									</li>
									<li>
										<button
											className="dropdown-item"
											onClick={() => handleNav("/admin/preguntas")}
										>
											Preguntas ADI
										</button>
									</li>
									<li>
										<button
											className="dropdown-item"
											onClick={() => handleNav("/admin/actividades")}
										>
											Actividades ADOS
										</button>
									</li>
								</ul>
							)}
						</li>

						{/* Dropdown Configuración */}
						<li
							className="nav-item dropdown mx-2"
							onMouseEnter={() => setShowConfig(true)}
							onMouseLeave={() => setShowConfig(false)}
						>
							<button
								className="btn btn-link nav-link dropdown-toggle text-white d-flex align-items-center"
								data-bs-toggle="dropdown"
								aria-expanded={showConfig}
							>
								<i
									className="bi bi-gear me-2"
									aria-hidden="true"
								/>
								Configuración
							</button>
							{showConfig && (
								<ul
									className="dropdown-menu show text-center"
									style={{
										background: COLOR_LIGHT,
										border: "none",
										boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
									}}
								>
									<li>
										<button
											className="dropdown-item"
											onClick={() => handleNav("/admin/pacientes")}
										>
											Pacientes
										</button>
									</li>
									<li>
										<button
											className="dropdown-item"
											onClick={() => handleNav("/admin/especialistas")}
										>
											Especialistas
										</button>
									</li>
									<li>
										<button
											className="dropdown-item"
											onClick={() => handleNav("/admin/areas")}
										>
											Áreas
										</button>
									</li>
								</ul>
							)}
						</li>
					</ul>

					{/* Menú del usuario (alineado derecha) */}
				</div>
				<div className="dropdown ms-lg-3">
					<button
						className="btn btn-sm btn-light dropdown-toggle fw-semibold"
						data-bs-toggle="dropdown"
					>
						Administrador
					</button>
					<ul className="dropdown-menu dropdown-menu-end">
						<li>
							<button
								className="dropdown-item text-danger"
								onClick={handleLogout}
							>
								Cerrar sesión
							</button>
						</li>
					</ul>
				</div>
			</div>
		</nav>
	);
};

export default NavbarAdmin;
