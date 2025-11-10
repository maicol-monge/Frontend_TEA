import React, { useState, useRef } from 'react';
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

// Helpers de máscaras
const maskPhone = (value) => {
  const digits = (value || '').replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 4) return digits;
  return `${digits.slice(0, 4)}-${digits.slice(4)}`;
};

const maskId = (value) => {
  const digits = (value || '').replace(/\D/g, '').slice(0, 9);
  if (digits.length <= 8) return digits;
  return `${digits.slice(0, 8)}-${digits.slice(8)}`;
};

const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

// Opciones de parentesco
const PARENTESCOS = [
  'Madre',
  'Padre',
  'Tutor legal',
  'Abuelo/a',
  'Tío/Tía',
  'Hermano/a',
  'OTRO'
];

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
    const [previewUrl, setPreviewUrl] = useState(null);

    // CAMERA STATES
    const [cameraOpen, setCameraOpen] = useState(false);
    const [cameraError, setCameraError] = useState('');
    const videoRef = useRef(null);
    const streamRef = useRef(null);

    // NUEVO: índice del responsable que usa el correo principal (o null)
    const [mainEmailLinkedIndex, setMainEmailLinkedIndex] = useState(null);

    // NUEVO: responsables legales
    const [responsablesLegales, setResponsablesLegales] = useState([
        {
            nombre: '',
            apellido: '',
            num_identificacion: '',
            parentesco: '',
            parentesco_otro: '',
            telefono: '',
            direccion: '',
            correo: ''
        }
    ]);

    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        // Aplica máscara al teléfono principal
        if (name === 'telefono') {
            setFormData({ ...formData, [name]: maskPhone(value) });
            return;
        }
        // Si cambia el correo principal y hay un responsable vinculado, sincronizarlo
        if (name === 'correo') {
            setFormData({ ...formData, [name]: value });
            if (mainEmailLinkedIndex !== null) {
                setResponsablesLegales(prev => {
                    const copy = prev.map(r => ({ ...r }));
                    copy[mainEmailLinkedIndex].correo = value;
                    return copy;
                });
            }
            return;
        }
        setFormData({ ...formData, [name]: value });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file && (file.type === 'image/png' || file.type === 'image/jpeg')) {
            setImagenFile(file);
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
        } else {
            setImagenFile(null);
            setPreviewUrl(null);
            Swal.fire({ title: 'Error', text: 'Solo se permiten archivos PNG o JPG.', icon: 'error', confirmButtonText: 'Aceptar' });
        }
    };

    // CAMERA FUNCTIONS
    // MEJORA EN OPEN CAMERA
const openCamera = async () => {
  setCameraError('');

  const isLocalhost = ['localhost', '127.0.0.1'].includes(location.hostname);
  if (!window.isSecureContext && !isLocalhost) {
    setCameraError('La cámara requiere ejecutar el sitio en HTTPS o en http://localhost.');
    return;
  }

  // Cierra streams previos
  if (streamRef.current) {
    streamRef.current.getTracks().forEach(t => t.stop());
    streamRef.current = null;
  }

  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const cams = devices.filter(d => d.kind === 'videoinput');
    const preferred = cams[0]?.deviceId;

    const constraints = preferred
      ? { video: { deviceId: { exact: preferred } }, audio: false }
      : { video: { facingMode: { ideal: 'user' }, width: { ideal: 640 }, height: { ideal: 480 } }, audio: false };

    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    streamRef.current = stream;

    // Abre el modal primero; el srcObject se asigna en el efecto de abajo
    setCameraOpen(true);
  } catch (err) {
    setCameraError(
      err?.name === 'NotAllowedError' ? 'Permiso de cámara denegado.' :
      err?.name === 'NotReadableError' ? 'La cámara está en uso por otra aplicación.' :
      err?.name === 'NotFoundError' ? 'No se encontró una cámara disponible.' :
      'No se pudo acceder a la cámara.'
    );
    console.error('openCamera error:', err);
  }
};

// NUEVO: al abrir el modal, enlaza el stream al <video> y reproduce
React.useEffect(() => {
  if (!cameraOpen) return;
  const v = videoRef.current;
  if (v && streamRef.current) {
    v.srcObject = streamRef.current;
    const onLoaded = () => { try { v.play(); } catch {} };
    v.onloadedmetadata = onLoaded;
    return () => { v.onloadedmetadata = null; };
  }
}, [cameraOpen]);

// Mejora closeCamera (mantén estilo actual)
const closeCamera = () => {
  if (streamRef.current) {
    streamRef.current.getTracks().forEach(track => track.stop());
    streamRef.current = null;
  }
  if (videoRef.current) videoRef.current.srcObject = null;
  setCameraOpen(false);
  setCameraError('');
};

// Cambia capturePhoto a async y espera a que el video tenga dimensiones
const capturePhoto = async () => {
  const video = videoRef.current;
  if (!video) return;

  // Espera a que cargue el primer frame
  if (!video.videoWidth || !video.videoHeight) {
    await new Promise(resolve => {
      const handler = () => { video.removeEventListener('loadeddata', handler); resolve(); };
      video.addEventListener('loadeddata', handler, { once: true });
      // fallback de seguridad
      setTimeout(resolve, 500);
    });
  }
  if (!video.videoWidth || !video.videoHeight) {
    Swal.fire({ title: 'Error', text: 'El video no está listo para capturar.', icon: 'error', confirmButtonText: 'Aceptar' });
    return;
  }

  const canvas = document.createElement('canvas');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  const blob = await new Promise(res => canvas.toBlob(res, 'image/jpeg', 0.9));
  if (!blob) {
    Swal.fire({ title: 'Error', text: 'No se pudo capturar la foto', icon: 'error', confirmButtonText: 'Aceptar' });
    return;
  }

  if (previewUrl) URL.revokeObjectURL(previewUrl);
  const file = new File([blob], `captura_${Date.now()}.jpg`, { type: 'image/jpeg' });
  setImagenFile(file);
  setPreviewUrl(URL.createObjectURL(blob));
  closeCamera();
  Swal.fire({ title: '¡Foto capturada!', text: 'Se usará como imagen de perfil.', icon: 'success', timer: 1500, showConfirmButton: false });
};

    // Limpiar object URL al desmontar / cambiar
    React.useEffect(() => {
        return () => {
            if (previewUrl) URL.revokeObjectURL(previewUrl);
        };
    }, [previewUrl]);

    // NUEVO: alterna “usar correo del usuario” para un responsable
    const toggleLinkMainEmail = (idx, checked) => {
        setResponsablesLegales(prev => {
            const copy = prev.map(r => ({ ...r }));
            // Si había otro responsable vinculado, lo desenlaza y limpia correo duplicado
            if (checked) {
                if (mainEmailLinkedIndex !== null && mainEmailLinkedIndex !== idx) {
                    copy[mainEmailLinkedIndex].correo = '';
                }
                copy[idx].correo = formData.correo;
            } else {
                // Si se desmarca, limpia el correo (evita duplicados)
                if (mainEmailLinkedIndex === idx) {
                    copy[idx].correo = '';
                }
            }
            return copy;
        });
        setMainEmailLinkedIndex(checked ? idx : null);
    };

    // NUEVO: actualización de responsable (con máscaras)
    const handleResponsableChange = (index, field, value) => {
        setResponsablesLegales(prev => {
            const copy = [...prev];
            let newVal = value;

            if (field === 'telefono') newVal = maskPhone(value);
            if (field === 'num_identificacion') newVal = maskId(value);

            copy[index] = { ...copy[index], [field]: newVal };

            // Si cambia parentesco y deja de ser OTRO, limpia el campo "otro"
            if (field === 'parentesco' && newVal !== 'OTRO') {
                copy[index].parentesco_otro = '';
            }

            // Evita editar correo si está vinculado al principal
            if (field === 'correo' && mainEmailLinkedIndex === index) {
                copy[index].correo = formData.correo;
            }

            return copy;
        });
    };

    const addResponsable = () => {
        setResponsablesLegales(prev => ([

            ...prev,
            {
                nombre: '',
                apellido: '',
                num_identificacion: '',
                parentesco: '',
                parentesco_otro: '',
                telefono: '',
                direccion: '',
                correo: ''
            }
        ]));
    };

    const removeResponsable = (index) => {
        setResponsablesLegales(prev => prev.filter((_, i) => i !== index));
    };

    // Verifica que cada responsable tenga mínimos requeridos
    const responsablesValidos = () => {
        if (Number(formData.privilegio) !== 1) return true;
        if (responsablesLegales.length === 0) return false;

        // Solo permitir a lo sumo 1 responsable con el mismo correo del usuario
        const sameAsUserEmailCount = responsablesLegales.filter(
            r => (r.correo || '').trim().toLowerCase() === (formData.correo || '').trim().toLowerCase()
        ).length;
        if (sameAsUserEmailCount > 1) return false;

        return responsablesLegales.every(r => {
            const parOk = r.parentesco.trim() !== '' && (r.parentesco !== 'OTRO' || (r.parentesco_otro || '').trim() !== '' );
            const idOk = r.num_identificacion.trim().length === 10; // ########-#
            return (
                r.nombre.trim() !== '' &&
                r.apellido.trim() !== '' &&
                idOk &&
                parOk
            );
        });
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
        ) return false;

        if (Number(formData.privilegio) === 1) {
            if (formData.fecha_nacimiento === '' || formData.sexo === '') return false;
            if (!responsablesValidos()) return false;
        }
        if (Number(formData.privilegio) === 0) {
            if (formData.especialidad.trim() === '') return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!camposRequeridosLlenos()) {
            Swal.fire({ title: 'Error', text: 'Complete todos los campos requeridos.', icon: 'error', confirmButtonText: 'Aceptar' });
            return;
        }

        try {
            let imagenUrl = '';
            if (imagenFile) {
                const fileExt = imagenFile.name.split('.').pop();
                const fileName = `${Date.now()}.${fileExt}`;
                const { error } = await supabase.storage.from('images').upload(fileName, imagenFile);
                if (error) {
                    Swal.fire({ title: 'Error', text: 'Error al subir la imagen a Supabase', icon: 'error', confirmButtonText: 'Aceptar' });
                    return;
                }
                const { data: publicUrlData } = supabase.storage.from('images').getPublicUrl(fileName);
                imagenUrl = publicUrlData.publicUrl;
            }

            const payload = {
                ...formData,
                imagen: imagenUrl
            };

            if (Number(formData.privilegio) === 1) {
                // Adjunta responsables legales
                payload.responsables_legales = responsablesLegales.map(r => {
                    const parentescoResuelto = r.parentesco === 'OTRO' ? r.parentesco_otro.trim() : r.parentesco.trim();
                    return {
                        nombre: r.nombre.trim(),
                        apellido: r.apellido.trim(),
                        num_identificacion: r.num_identificacion.trim(), // ya viene con máscara ########-#
                        parentesco: parentescoResuelto,
                        telefono: (r.telefono || '').trim() || null,     // ####-####
                        direccion: (r.direccion || '').trim() || null,
                        correo: (r.correo || '').trim() || null
                    };
                });
                delete payload.especialidad;
            } else {
                delete payload.fecha_nacimiento;
                delete payload.sexo;
            }

            const token = localStorage.getItem("token");
            const response = await axios.post(
                apiUrl('/api/users/registrar'),
                payload,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            Swal.fire({
                title: '¡Registro exitoso!',
                text: response.data.message,
                icon: 'success',
                confirmButtonText: 'Aceptar',
            }).then(() => {
                navigate(Number(formData.privilegio) === 0 ? '/pacientes' : '/home_espe');
            });
        } catch (err) {
            Swal.fire({
                title: 'Error',
                text: err.response?.data?.message || 'Error al conectar con el servidor',
                icon: 'error',
                confirmButtonText: 'Aceptar',
            });
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
                                        inputMode="numeric"
                                        maxLength={9} // ####-####
                                        required
                                    />
                                    <small className="text-muted">Formato: ####-####</small>
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
                                                max={maxDate}
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

                                        {/* Responsables Legales */}
                                        <div className="mb-3">
                                            <label className="form-label fw-bold" style={{ color: COLOR_DARK }}>Responsables Legales (mínimo 1):</label>
                                            {responsablesLegales.map((r, idx) => (
                                                <div key={idx} className="border rounded p-3 mb-2">
                                                    <div className="row g-2">
                                                        <div className="col-md-6">
                                                            <input
                                                                type="text"
                                                                placeholder="Nombre *"
                                                                className="form-control"
                                                                value={r.nombre}
                                                                onChange={e => handleResponsableChange(idx, 'nombre', e.target.value)}
                                                                required
                                                            />
                                                        </div>
                                                        <div className="col-md-6">
                                                            <input
                                                                type="text"
                                                                placeholder="Apellido *"
                                                                className="form-control"
                                                                value={r.apellido}
                                                                onChange={e => handleResponsableChange(idx, 'apellido', e.target.value)}
                                                                required
                                                            />
                                                        </div>
                                                        <div className="col-md-6">
                                                            <input
                                                                type="text"
                                                                placeholder="Identificación *"
                                                                className="form-control"
                                                                value={r.num_identificacion}
                                                                onChange={e => handleResponsableChange(idx, 'num_identificacion', e.target.value)}
                                                                inputMode="numeric"
                                                                maxLength={10} // ########-#
                                                                required
                                                            />
                                                            <small className="text-muted">Formato: ########-#</small>
                                                        </div>
                                                        <div className="col-md-6">
                                                            <select
                                                                className="form-select"
                                                                value={r.parentesco}
                                                                onChange={e => handleResponsableChange(idx, 'parentesco', e.target.value)}
                                                                required
                                                            >
                                                                <option value="">Parentesco *</option>
                                                                {PARENTESCOS.map(opt => (
                                                                    <option key={opt} value={opt}>{opt === 'OTRO' ? 'Otro' : opt}</option>
                                                                ))}
                                                            </select>
                                                        </div>

                                                        {r.parentesco === 'OTRO' && (
                                                            <div className="col-md-12">
                                                                <input
                                                                    type="text"
                                                                    placeholder="Especifique el parentesco *"
                                                                    className="form-control"
                                                                    value={r.parentesco_otro}
                                                                    onChange={e => handleResponsableChange(idx, 'parentesco_otro', e.target.value)}
                                                                    required
                                                                />
                                                            </div>
                                                        )}

                                                        <div className="col-md-4">
                                                            <input
                                                                type="text"
                                                                placeholder="Teléfono"
                                                                className="form-control"
                                                                value={r.telefono}
                                                                onChange={e => handleResponsableChange(idx, 'telefono', e.target.value)}
                                                                inputMode="numeric"
                                                                maxLength={9} // ####-####
                                                            />
                                                            <small className="text-muted">Formato: ####-####</small>
                                                        </div>
                                                        <div className="col-md-8">
                                                            <input
                                                                type="text"
                                                                placeholder="Dirección"
                                                                className="form-control"
                                                                value={r.direccion}
                                                                onChange={e => handleResponsableChange(idx, 'direccion', e.target.value)}
                                                            />
                                                        </div>
                                                        <div className="col-md-12">
                                                            <input
                                                                type="email"
                                                                placeholder="Correo"
                                                                className="form-control"
                                                                value={r.correo}
                                                                onChange={e => handleResponsableChange(idx, 'correo', e.target.value)}
                                                                disabled={mainEmailLinkedIndex === idx}
                                                            />
                                                        </div>
                                                        <div className="col-md-12">
                                                            <div className="form-check">
                                                                <input
                                                                    className="form-check-input"
                                                                    id={`linkEmail-${idx}`}
                                                                    type="checkbox"
                                                                    checked={mainEmailLinkedIndex === idx}
                                                                    onChange={e => toggleLinkMainEmail(idx, e.target.checked)}
                                                                />
                                                                <label className="form-check-label" htmlFor={`linkEmail-${idx}`}>
                                                                    Usar el correo del usuario
                                                                </label>
                                                            </div>
                                                            <small className="text-muted">
                                                                Solo un responsable puede usar el mismo correo del usuario.
                                                            </small>
                                                        </div>
                                                    </div>
                                                    <div className="mt-2 d-flex justify-content-end">
                                                        {responsablesLegales.length > 1 && (
                                                            <button
                                                                type="button"
                                                                className="btn btn-sm btn-outline-danger"
                                                                onClick={() => removeResponsable(idx)}
                                                            >
                                                                Eliminar
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                            <div className="d-flex justify-content-end">
                                                <button
                                                    type="button"
                                                    className="btn btn-sm btn-outline-primary"
                                                    onClick={addResponsable}
                                                >
                                                    Agregar Responsable
                                                </button>
                                            </div>
                                            {!responsablesValidos() && (
                                                <div className="text-danger mt-2">
                                                    Complete los campos requeridos (*) con el formato indicado.
                                                </div>
                                            )}
                                        </div>
                                    </>
                                )}

                                <div className="mb-3">
                                    <label className="form-label" style={{ color: COLOR_DARK }}>Foto de Perfil (opcional):</label>
                                    <div className="d-flex flex-column gap-2">
                                        <input
                                            type="file"
                                            accept="image/png, image/jpeg"
                                            className="form-control"
                                            onChange={handleFileChange}
                                        />
                                        <div className="d-flex gap-2">
                                            <button
                                                type="button"
                                                className="btn btn-sm btn-outline-primary"
                                                onClick={openCamera}
                                                disabled={cameraOpen}
                                            >
                                                Abrir cámara
                                            </button>
                                            {imagenFile && (
                                                <span className="badge bg-success align-self-center">
                                                    Imagen seleccionada
                                                </span>
                                            )}
                                        </div>
                                        {previewUrl && (
                                            <div className="mt-2">
                                                <img
                                                    src={previewUrl}
                                                    alt="Vista previa"
                                                    style={{ maxWidth: '180px', borderRadius: 8, border: '2px solid #ddd' }}
                                                />
                                            </div>
                                        )}
                                        {cameraError && (
                                            <div className="text-danger small">{cameraError}</div>
                                        )}
                                    </div>
                                </div>

                                {/* CAMERA OVERLAY */}
                                {cameraOpen && (
                                    <div
                                        className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
                                        style={{ background: 'rgba(0,0,0,0.6)', zIndex: 1050 }}
                                    >
                                        <div className="bg-white p-3 rounded shadow" style={{ maxWidth: 500, width: '100%' }}>
                                            <h5 className="mb-3">Capturar foto</h5>
                                            <div className="mb-3">
                                                <video
                                                    ref={videoRef}
                                                    autoPlay
                                                    playsInline
                                                    muted
                                                    style={{
                                                        width: '100%',
                                                        borderRadius: 8,
                                                        background: '#000',
                                                        objectFit: 'cover',
                                                        aspectRatio: '4 / 3'
                                                    }}
                                                />
                                            </div>
                                            <div className="d-flex justify-content-end gap-2">
                                                <button
                                                    type="button"
                                                    className="btn btn-secondary"
                                                    onClick={closeCamera}
                                                >
                                                    Cancelar
                                                </button>
                                                <button
                                                    type="button"
                                                    className="btn btn-primary"
                                                    onClick={capturePhoto}
                                                >
                                                    Capturar
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}

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