import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { apiUrl } from "../../config/apiConfig";
import NavbarAdmin from "../../components/NavbarAdmin";
import Footer from "../../components/Footer";
import Swal from "sweetalert2";
import { createClient } from "@supabase/supabase-js";

// Supabase (igual que en Registrar.jsx)
const supabaseUrl = "https://ajvlsndqsmfllxnuahsq.supabase.co";
const supabaseKey =
	"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFqdmxzbmRxc21mbGx4bnVhaHNxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyNzk3NzcsImV4cCI6MjA3Nzg1NTc3N30.9uykfF9Td9F75M1eXk1YIPioicEBpKjzwElIzgCioZ4";
const supabase = createClient(supabaseUrl, supabaseKey);

const FormUsuario = () => {
	const { id } = useParams(); // si existe, estamos editando
	const navigate = useNavigate();
	const token = localStorage.getItem("token");

	const [form, setForm] = useState({
		nombres: "",
		apellidos: "",
		direccion: "",
		telefono: "",
		correo: "",
		contrasena: "",
		privilegio: 1,
		especialidad: "",
		imagen: "",
		estado: 1,
	});
	const [imagenFile, setImagenFile] = useState(null);
	const [previewUrl, setPreviewUrl] = useState(null);
	const [errors, setErrors] = useState({
		nombres: "",
		apellidos: "",
		telefono: "",
		correo: "",
	});

	// limpiar preview al desmontar
	useEffect(() => {
		return () => {
			if (previewUrl) URL.revokeObjectURL(previewUrl);
		};
	}, [previewUrl]);

	// Validaciones
	const nameRegex = /^[A-Za-zÀ-ÿ\s]+$/; // letras y espacios, soporta acentos
	const telefonoRegex = /^\d{4}-\d{4}$/; // 7090-1234
	const correoRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

	const validateField = (name, value) => {
		let error = "";
		if (name === "nombres" || name === "apellidos") {
			if (!value || value.trim() === "") {
				error = "Este campo es obligatorio";
			} else if (!nameRegex.test(value.trim())) {
				error = "Solo se permiten letras y espacios";
			}
		}
		if (name === "telefono") {
			if (!value || value.trim() === "") {
				error = "Este campo es obligatorio";
			} else if (!telefonoRegex.test(value.trim())) {
				error = "Formato inválido. Ej: 7090-1234";
			}
		}
		if (name === "correo") {
			if (!value || value.trim() === "") {
				error = "Este campo es obligatorio";
			} else if (!correoRegex.test(value.trim())) {
				error = "Correo con formato inválido";
			}
		}
		setErrors((prev) => ({ ...prev, [name]: error }));
		return error === "";
	};

	useEffect(() => {
		if (id) {
			axios
				.get(apiUrl("/api/admin/usuarios"), {
					headers: { Authorization: `Bearer ${token}` },
				})
				.then((res) => {
					const usuario = res.data.find((u) => u.id_usuario === parseInt(id));
					if (usuario) setForm({ ...usuario, contrasena: "" });
				});
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [id]);

	const handleChange = (e) => {
		const { name, value } = e.target;

		// Asegurar que estado y privilegio se envíen como números
		if (name === "estado" || name === "privilegio") {
			setForm({ ...form, [name]: parseInt(value, 10) });
			return;
		}

		if (name === "telefono") {
			const digits = value.replace(/\D/g, "").slice(0, 8);
			const formatted =
				digits.length > 4 ? `${digits.slice(0, 4)}-${digits.slice(4)}` : digits;
			setForm({ ...form, telefono: formatted });
			validateField("telefono", formatted);
			return;
		}

		setForm({ ...form, [name]: value });

		if (name === "nombres" || name === "apellidos") {
			validateField(name, value);
		}
		if (name === "correo") {
			validateField(name, value);
		}
	};

	const handleFileChange = (e) => {
		const file = e.target.files?.[0];
		if (!file) {
			setImagenFile(null);
			setPreviewUrl(null);
			return;
		}
		if (!["image/png", "image/jpeg", "image/jpg"].includes(file.type)) {
			Swal.fire({
				icon: "error",
				title: "Error",
				text: "Solo se permiten PNG o JPG.",
			});
			return;
		}
		if (previewUrl) URL.revokeObjectURL(previewUrl);
		setImagenFile(file);
		setPreviewUrl(URL.createObjectURL(file));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		// Validar todos los campos antes de enviar
		const validNombres = validateField("nombres", form.nombres);
		const validApellidos = validateField("apellidos", form.apellidos);
		const validTelefono = validateField("telefono", form.telefono);
		const validCorreo = validateField("correo", form.correo);
		if (!validNombres || !validApellidos || !validTelefono || !validCorreo) {
			await Swal.fire({
				icon: "warning",
				title: "Validación",
				text: "Por favor corrija los errores en el formulario antes de enviar.",
			});
			return;
		}
		try {
			// si hay imagen seleccionada: subir a supabase y obtener URL pública
			let imagenUrl = form.imagen || "";
			if (imagenFile) {
				const fileExt = imagenFile.name.split(".").pop();
				const fileName = `usuarios/${Date.now()}.${fileExt}`;
				const { error } = await supabase.storage
					.from("images")
					.upload(fileName, imagenFile);
				if (error) {
					throw new Error("Error al subir la imagen");
				}
				const { data: publicUrlData } = supabase.storage
					.from("images")
					.getPublicUrl(fileName);
				imagenUrl = publicUrlData.publicUrl;
			}

			const payload = { ...form, imagen: imagenUrl };

			if (id) {
				// actualizar usuario
				await axios.put(apiUrl(`/api/admin/usuarios/${id}`), payload, {
					headers: { Authorization: `Bearer ${token}` },
				});
				await Swal.fire({
					icon: "success",
					title: "Usuario actualizado",
					text: "El usuario fue actualizado correctamente",
					timer: 1800,
					showConfirmButton: false,
				});
			} else {
				// crear usuario
				const res = await axios.post(apiUrl("/api/admin/usuarios"), payload, {
					headers: { Authorization: `Bearer ${token}` },
				});
				// si es especialista crear fila en especialistas
				const newUsuarioId = res.data?.usuario?.id_usuario;
				if (Number(payload.privilegio) === 0 && newUsuarioId) {
					try {
						await axios.post(
							apiUrl("/api/admin/especialistas"),
							{ id_usuario: newUsuarioId, especialidad: payload.especialidad },
							{ headers: { Authorization: `Bearer ${token}` } }
						);
					} catch (errEsp) {
						// no bloquear la creación de usuario si falla crear especialista
						console.error("Error al crear especialista:", errEsp);
					}
				}
				await Swal.fire({
					icon: "success",
					title: "Usuario creado",
					text: "El usuario fue creado correctamente",
					timer: 1800,
					showConfirmButton: false,
				});
			}
			navigate("/admin/usuarios");
		} catch (err) {
			console.error("Error al guardar usuario:", err);
			const message =
				err?.response?.data?.message || "Error al guardar usuario";
			await Swal.fire({
				icon: "error",
				title: "Error",
				text: message,
			});
		}
	};

	return (
		<div
			className="d-flex flex-column min-vh-100"
			style={{ background: "#a8dadc" }}
		>
			<NavbarAdmin />
			<div className="container py-4 flex-grow-1">
				<h2>{id ? "Editar Usuario" : "Nuevo Usuario"}</h2>
				<form
					className="row g-2"
					onSubmit={handleSubmit}
				>
					<div className="col-md-6 col-lg-4">
						<input
							className="form-control"
							name="nombres"
							placeholder="Nombres"
							value={form.nombres}
							onChange={handleChange}
							required
						/>
						{errors.nombres && (
							<div className="text-danger small mt-1">{errors.nombres}</div>
						)}
					</div>
					<div className="col-md-6 col-lg-4">
						<input
							className="form-control"
							name="apellidos"
							placeholder="Apellidos"
							value={form.apellidos}
							onChange={handleChange}
							required
						/>
						{errors.apellidos && (
							<div className="text-danger small mt-1">{errors.apellidos}</div>
						)}
					</div>
					<div className="col-md-6 col-lg-4">
						<input
							className="form-control"
							name="direccion"
							placeholder="Dirección"
							value={form.direccion}
							onChange={handleChange}
							required
						/>
					</div>
					<div className="col-md-6 col-lg-4">
						<input
							className="form-control"
							name="telefono"
							placeholder="7090-1234"
							title="Formato: 7090-1234"
							pattern="\d{4}-\d{4}"
							value={form.telefono}
							onChange={handleChange}
							required
						/>
						{errors.telefono && (
							<div className="text-danger small mt-1">{errors.telefono}</div>
						)}
					</div>
					<div className="col-md-6 col-lg-4">
						<input
							className="form-control"
							name="correo"
							placeholder="Correo"
							type="email"
							value={form.correo}
							onChange={handleChange}
							required
						/>
						{errors.correo && (
							<div className="text-danger small mt-1">{errors.correo}</div>
						)}
					</div>
					{!id && (
						<div className="col-md-6 col-lg-4">
							<input
								className="form-control"
								name="contrasena"
								placeholder="Contraseña"
								type="password"
								value={form.contrasena}
								onChange={handleChange}
								required
							/>
						</div>
					)}
					<div className="col-md-6 col-lg-4">
						<select
							className="form-control"
							name="privilegio"
							value={form.privilegio}
							onChange={handleChange}
						>
							<option value={0}>Especialista</option>
							<option value={1}>Paciente</option>
							<option value={3}>Admin</option>
						</select>
					</div>
					<div className="col-md-6 col-lg-4">
						{/* Imagen: permitir file + vista previa (opcional) */}
						<input
							className="form-control"
							type="file"
							accept="image/png, image/jpeg"
							onChange={handleFileChange}
						/>
						{previewUrl && (
							<div className="mt-2">
								<img
									src={previewUrl}
									alt="Vista previa"
									style={{ maxWidth: "140px", borderRadius: 8 }}
								/>
							</div>
						)}
						{/* Permitir también pegar URL manualmente */}
						<small className="text-muted d-block mt-1">
							Si no sube archivo, puede pegar una URL en el campo Imagen (opcional).
						</small>
						<input
							className="form-control mt-1"
							name="imagen"
							placeholder="URL imagen (opcional)"
							value={form.imagen}
							onChange={handleChange}
						/>
					</div>
					{Number(form.privilegio) === 0 && (
						<div className="col-md-6 col-lg-4">
							<input
								className="form-control"
								name="especialidad"
								placeholder="Especialidad (para especialistas)"
								value={form.especialidad}
								onChange={handleChange}
							/>
						</div>
					)}
					<div className="col-md-6 col-lg-4">
						<select
							className="form-control"
							name="estado"
							value={form.estado}
							onChange={handleChange}
						>
							<option value={1}>Activo</option>
							<option value={0}>Inactivo</option>
						</select>
					</div>
					<div className="col-12 d-flex gap-3 mt-3">
						<button
							className="btn btn-success"
							type="submit"
						>
							{id ? "Actualizar" : "Crear"}
						</button>
						<button
							className="btn btn-secondary"
							type="button"
							onClick={() => navigate("/admin/usuarios")}
						>
							Cancelar
						</button>
					</div>
				</form>
			</div>
			<Footer />
		</div>
	);
};

export default FormUsuario;