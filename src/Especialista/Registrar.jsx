import React, { useState } from 'react';
import axios from 'axios';
import { apiUrl } from '../config/apiConfig';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import Navbar from '../components/Navbar_espe';
import Footer from '../components/Footer';

// Colores de la paleta
const COLOR_BG = "#a8dadc";
const COLOR_PRIMARY = "#457b9d";
const COLOR_DARK = "#1d3557";
const COLOR_ACCENT = "#f3859e";

const supabaseUrl = 'https://ajvlsndqsmfllxnuahsq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFqdmxzbmRxc21mbGx4bnVhaHNxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyNzk3NzcsImV4cCI6MjA3Nzg1NTc3N30.9uykfF9Td9F75M1eXk1YIPioicEBpKjzwElIzgCioZ4';
const supabase = createClient(supabaseUrl, supabaseKey);

const Registrar = () => {
    const [formData, setFormData] = useState({
        nombres: '',
        apellidos: '',
        direccion: '',
        telefono: '',
        correo: '',
        privilegio: '',
        imagen: '',
        especialidad: '',
        fecha_nacimiento: '',
        sexo: ''
    });
    const [imagenFile, setImagenFile] = useState(null);

    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file && (file.type === 'image/png' || file.type === 'image/jpeg')) {
            setImagenFile(file);
        } else {
            setImagenFile(null);
            Swal.fire({
                title: 'Error',
                text: 'Solo se permiten archivos PNG o JPG.',
                icon: 'error',
                confirmButtonText: 'Aceptar',
            });
        }
    };

    const validatePassword = (password) => {
        const regex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        return regex.test(password);
    };

    const validateEmail = (email) => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    };

    const camposRequeridosLlenos = () => {
        if (
            formData.nombres.trim() === '' ||
            formData.apellidos.trim() === '' ||
            formData.direccion.trim() === '' ||
            formData.telefono.trim() === '' ||
            formData.correo.trim() === '' ||
            !validateEmail(formData.correo) ||
            formData.privilegio === ''
        ) {
            return false;
        }
        if (Number(formData.privilegio) === 1) {
            // Paciente
            return formData.fecha_nacimiento !== '' && formData.sexo !== '';
        }
        if (Number(formData.privilegio) === 0) {
            // Especialista
            return formData.especialidad.trim() !== '';
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateEmail(formData.correo)) {
            Swal.fire({
                title: 'Error',
                text: 'Por favor ingrese un correo electrónico válido.',
                icon: 'error',
                confirmButtonText: 'Aceptar',
            });
            return;
        }

        if (![0, 1].includes(Number(formData.privilegio))) {
            Swal.fire({
                title: 'Error',
                text: 'Privilegio no válido. Debe ser 0 (Especialista) o 1 (Paciente).',
                icon: 'error',
                confirmButtonText: 'Aceptar',
            });
            return;
        }

        try {
            let imagenUrl = '';
            if (imagenFile) {
                const fileExt = imagenFile.name.split('.').pop();
                const fileName = `${Date.now()}.${fileExt}`;
                const { data, error } = await supabase.storage
                    .from('images')
                    .upload(fileName, imagenFile);

                if (error) {
                    Swal.fire({
                        title: 'Error',
                        text: 'Error al subir la imagen a Supabase',
                        icon: 'error',
                        confirmButtonText: 'Aceptar',
                    });
                    return;
                }

                const { data: publicUrlData } = supabase
                    .storage
                    .from('images')
                    .getPublicUrl(fileName);

                imagenUrl = publicUrlData.publicUrl;
            }

            const payload = {
                ...formData,
                imagen: imagenUrl
            };

            // Elimina campos no requeridos según privilegio
            if (Number(formData.privilegio) === 1) {
                delete payload.especialidad;
            } else if (Number(formData.privilegio) === 0) {
                delete payload.fecha_nacimiento;
                delete payload.sexo;
            }

            // Obtén el token del localStorage
            const token = localStorage.getItem("token");

            // Envía el token en el header Authorization
            const response = await axios.post(
                apiUrl('/api/users/registrar'),
                payload,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            Swal.fire({
                title: '¡Registro exitoso!',
                text: response.data.message,
                icon: 'success',
                confirmButtonText: 'Aceptar',
            }).then(() => {
                if (Number(formData.privilegio) === 0) {
                    navigate('/pacientes');
                } else {
                    navigate('/home_espe');
                }
            });
        } catch (err) {
            if (err.response) {
                Swal.fire({
                    title: 'Error',
                    text: err.response.data.message,
                    icon: 'error',
                    confirmButtonText: 'Aceptar',
                });
            } else {
                Swal.fire({
                    title: 'Error',
                    text: 'Error al conectar con el servidor',
                    icon: 'error',
                    confirmButtonText: 'Aceptar',
                });
            }
        }
    };

    // Calcular el día anterior a hoy en formato YYYY-MM-DD
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const maxDate = yesterday.toISOString().split('T')[0];

    return (
        <div
            className="min-vh-100"
            style={{
                background: COLOR_BG,
                minHeight: "100vh",
            }}
        >
            <Navbar />
            <div className="row justify-content-center">
                <div className="col-12 col-sm-10 col-md-8 col-lg-6 col-xl-5">
                    <div
                        className="card shadow m-3"
                        style={{
                            borderTop: `6px solid ${COLOR_ACCENT}`,
                            borderRadius: 18,
                            background: "#fff"
                        }}
                    >
                        <div
                            className="card-header text-white text-center"
                            style={{
                                background: COLOR_PRIMARY,
                                borderTopLeftRadius: 18,
                                borderTopRightRadius: 18
                            }}
                        >
                            <h3 className="mb-0" style={{ color: "#fff" }}>Registrar Usuario</h3>
                        </div>
                        <div className="card-body">
                            <form onSubmit={handleSubmit}>
                                <div className="mb-3">
                                    <label className="form-label" style={{ color: COLOR_DARK }}>Nombres:</label>
                                    <input
                                        type="text"
                                        name="nombres"
                                        className="form-control"
                                        value={formData.nombres}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label" style={{ color: COLOR_DARK }}>Apellidos:</label>
                                    <input
                                        type="text"
                                        name="apellidos"
                                        className="form-control"
                                        value={formData.apellidos}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label" style={{ color: COLOR_DARK }}>Dirección:</label>
                                    <input
                                        type="text"
                                        name="direccion"
                                        className="form-control"
                                        value={formData.direccion}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label" style={{ color: COLOR_DARK }}>Teléfono:</label>
                                    <input
                                        type="text"
                                        name="telefono"
                                        className="form-control"
                                        value={formData.telefono}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label" style={{ color: COLOR_DARK }}>Correo:</label>
                                    <input
                                        type="email"
                                        name="correo"
                                        className="form-control"
                                        value={formData.correo}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label" style={{ color: COLOR_DARK }}>Tipo de Usuario:</label>
                                    <select
                                        name="privilegio"
                                        className="form-select"
                                        value={formData.privilegio}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="">Seleccione</option>
                                        <option value="0">Especialista</option>
                                        <option value="1">Paciente</option>
                                    </select>
                                </div>

                                {/* Campos dinámicos según privilegio */}
                                {Number(formData.privilegio) === 0 && (
                                    <div className="mb-3">
                                        <label className="form-label" style={{ color: COLOR_DARK }}>Especialidad:</label>
                                        <input
                                            type="text"
                                            name="especialidad"
                                            className="form-control"
                                            value={formData.especialidad}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                )}
                                {Number(formData.privilegio) === 1 && (
                                    <>
                                        <div className="mb-3">
                                            <label className="form-label" style={{ color: COLOR_DARK }}>Fecha de Nacimiento:</label>
                                            <input
                                                type="date"
                                                name="fecha_nacimiento"
                                                className="form-control"
                                                value={formData.fecha_nacimiento}
                                                onChange={handleChange}
                                                required
                                                max={maxDate} // Solo permite fechas antes de hoy
                                            />
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label" style={{ color: COLOR_DARK }}>Sexo:</label>
                                            <select
                                                name="sexo"
                                                className="form-select"
                                                value={formData.sexo}
                                                onChange={handleChange}
                                                required
                                            >
                                                <option value="">Seleccione</option>
                                                <option value="M">Masculino</option>
                                                <option value="F">Femenino</option>
                                            </select>
                                        </div>
                                    </>
                                )}

                                <div className="mb-3">
                                    <label className="form-label" style={{ color: COLOR_DARK }}>Foto de Perfil (opcional):</label>
                                    <input
                                        type="file"
                                        accept="image/png, image/jpeg"
                                        className="form-control"
                                        onChange={handleFileChange}
                                    />
                                </div>
                                <div className="d-grid gap-2">
                                    <button
                                        type="submit"
                                        className="btn"
                                        style={{
                                            background: COLOR_PRIMARY,
                                            color: "#fff",
                                            fontWeight: "bold"
                                        }}
                                        disabled={!camposRequeridosLlenos()}
                                    >
                                        Registrar
                                    </button>
                                    <button
                                        type="button"
                                        className="btn"
                                        style={{
                                            background: COLOR_ACCENT,
                                            color: "#fff",
                                            fontWeight: "bold"
                                        }}
                                        onClick={() => navigate('/home_espe')}
                                    >
                                        Cancelar
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default Registrar;