// Manejar la confirmación de registros agregados exitosamente
document.addEventListener('DOMContentLoaded', () => {
    // Detectar clic en botones con clase 'btn-success'
    $(document).on('click', '.btn-success', function(e) {
        // Mostrar alerta de éxito usando SweetAlert2
        Swal.fire({
            position: "top-end",
            title: '¡Registro agregado!',
            text: 'El registro se ha agregado satisfactoriamente.',
            icon: 'success',
            showConfirmButton: false, // Ocultar el botón de confirmación
            timer: 2000, // Duración total de 2 segundos
            timerProgressBar: true, // Mostrar barra de progreso
            willClose: () => {
                // Esperar un poco después de que la alerta desaparezca
                setTimeout(() => {
                    console.log('Alerta cerrada después de 2 segundos');
                }, 3000);
            }
        });
    });
});

// Manejar la modificación de registros agregados exitosamente
document.addEventListener('DOMContentLoaded', () => {
    // Detectar clic en botones con clase 'btn-success'
    $(document).on('click', '.btn-warning', function(e) {
        // Mostrar alerta de éxito usando SweetAlert2
        Swal.fire({
            position: "top-end",
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
                }, 3000);
            }
        });
    });
});