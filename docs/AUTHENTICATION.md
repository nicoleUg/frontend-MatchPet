
# Sistema de Autenticación (Modo Demo)

## Descripción

MatchPet funciona en modo demo (solo frontend): no usa Firebase ni backend.

La sesión y los datos se guardan en `localStorage`.

## Flujo de usuario

1. Registro
   - Abrir `src/signing_up/signing_up.html`
   - Crear cuenta (nombre, email, contraseña)
2. Login
   - Abrir `src/login/login.html`
   - Iniciar sesión con el email/contraseña creados
3. Navegación
   - Al autenticarse, `page-guard.js` permite acceder a páginas protegidas
   - Logout limpia la sesión demo

## Reset de la demo

- Borra el `localStorage` del navegador para eliminar usuarios/mascotas y reiniciar el estado.
