// Función para manejar errores de registro
exports.getErrorMessage = (errorType) => {
    const errorMessages = {
        passwordsMismatch: 'Las contraseñas no coinciden.',
        emailExists: 'El correo electrónico ya está registrado.',
        serverError: 'Ocurrió un error en el servidor al registrar el usuario.',
    };

    return errorMessages[errorType] || 'Error desconocido. Intenta nuevamente.';
};
