// logoutAlert.js

document.getElementById('logout-button').addEventListener('click', function(event) {
    event.preventDefault(); // Prevenir la redirección inmediata

    // Mostrar la alerta de confirmación con SweetAlert2
    Swal.fire({
        title: '¿Estás seguro?',
        text: '¡Cerrarás sesión!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, cerrar sesión',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            // Redirigir al controlador de logout
            window.location.href = '/logout';
        }
    });
});
