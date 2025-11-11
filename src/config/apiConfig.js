// Centraliza la URL base de la API. Alternar entre Laravel y Spring Boot

// Para usar Laravel (por ejemplo local en puerto 5000), descomentar la línea correspondiente
 //export const LARAVEL_BASE = 'http://127.0.0.1:8000';
//export const LARAVEL_BASE = 'http://localhost:8000';

// Para usar Spring Boot (ejemplo local en puerto 8080), descomentar la línea correspondiente
//export const SPRING_BASE = "http://localhost:8080";
export const LARAVEL_BASE = 'https://apilaravel-production-9a74.up.railway.app';
// Selecciona aquí la base que quieras usar (comentar la otra)
export const BASE_URL = LARAVEL_BASE;
// export const BASE_URL = LARAVEL_BASE;

export const apiUrl = (path) => `${BASE_URL}${path}`;

export default {
  BASE_URL,
  apiUrl,
};
