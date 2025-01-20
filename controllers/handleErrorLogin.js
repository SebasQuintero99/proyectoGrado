// Función para manejar errores de login
exports.getErrorMessage = (errorType) => {
    const errorMessages = {
        incorrectPassword: 'La contraseña ingresada es incorrecta.',
        userNotFound: 'No se encontró un usuario con el correo proporcionado.',
        serverError: 'Ocurrió un error en el servidor. Intenta nuevamente más tarde.',
        tokenExpired: 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.',
        unauthorized: 'No tienes autorización para acceder a esta ruta .',
    };

    return errorMessages[errorType] || 'Ocurrió un error desconocido.';
};
