// // Manejar la eliminación de registros en la aplicación

document.addEventListener('DOMContentLoaded', () => {
    // Usamos delegación de eventos con jQuery para manejar el clic en los botones de eliminar
    $(document).on('click', '.delete-btn', function(e) {
        e.preventDefault(); // Prevenir la acción predeterminada del botón

        const button = $(this);  // Usamos jQuery para manejar el botón
        const recordId = button.data('id'); // ID del registro a eliminar
        const entity = button.data('entity'); // Entidad (ej.: programs, signatures, etc.)

        Swal.fire({
            title: '¿Estás seguro de eliminar el registro?',
            text: 'No podrás revertir esta acción.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                // Redirigir a la ruta de eliminación
                window.location.href = `/${entity}/delete/${recordId}`;
            }
        });
    });
});




