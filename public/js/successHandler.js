// Manejar la confirmación de registros agregados exitosamente
document.addEventListener('DOMContentLoaded', () => {
    // Detectar clic en botones de formulario, excluyendo los de modales y DataTables
    $(document).on('click', 'form .btn-success:not([data-bs-toggle="modal"]):not(.dt-button)', function(e) {
        // Mostrar alerta de éxito usando SweetAlert2
        Swal.fire({
            position: "center",
            title: '¡Registro agregado!',
            text: 'El registro se ha agregado satisfactoriamente.',
            icon: 'success',
            showConfirmButton: false, // Ocultar el botón de confirmación
            timer: 5000, // Duración total de 2 segundos
            timerProgressBar: true, // Mostrar barra de progreso
            willClose: () => {
                // Esperar un poco después de que la alerta desaparezca
                setTimeout(() => {
                    console.log('Alerta cerrada después de 2 segundos');
                }, 2000);
            }
        });
    });
});

// Manejar la modificación de registros agregados exitosamente
document.addEventListener('DOMContentLoaded', () => {
    // Detectar clic en botones de formulario, excluyendo los de modales y DataTables
    $(document).on('click', 'form .btn-warning:not([data-bs-toggle="modal"]):not(.dt-button)', function(e) {
        // Mostrar alerta de éxito usando SweetAlert2
        Swal.fire({
            position: "center",
            title: '¡Registro Modificado!',
            text: 'El registro se ha mofificado satisfactoriamente.',
            icon: 'success',
            showConfirmButton: false, // Ocultar el botón de confirmación
            timer: 2000, // Duración total de 2 segundos
            timerProgressBar: true, // Mostrar barra de progreso
            willClose: () => {
                // Esperar un poco después de que la alerta desaparezca
                setTimeout(() => {
                    console.log('Alerta cerrada después de 2 segundos');
                }, 4000);
            }
        });
    });
});