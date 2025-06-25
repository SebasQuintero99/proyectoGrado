// Manejar la eliminación de registros en la aplicación

document.addEventListener('DOMContentLoaded', () => {
    $(document).on('click', '.delete-btn', function(e) {
        e.preventDefault();

        const button = $(this);
        const recordId = button.data('id');
        const entity = button.data('entity');
        const url = `/${entity}/delete/${recordId}`;

        Swal.fire({
            title: '¿Estás seguro?',
            text: "¡No podrás revertir esta acción!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, ¡eliminar!',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                fetch(url, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                        'Content-Type': 'application/json'
                    }
                })
                .then(response => {
                    if (!response.ok) {
                        return response.json().then(err => { throw new Error(err.message || 'Error al eliminar.') });
                    }
                    return response.json();
                })
                .then(data => {
                    if (data.success) {
                        Swal.fire(
                            '¡Eliminado!',
                            'El registro ha sido eliminado.',
                            'success'
                        );
                        
                        // Eliminar la fila de la tabla sin recargar la página
                        const table = button.closest('table').DataTable();
                        table.row(button.closest('tr')).remove().draw();

                    } else {
                        throw new Error(data.message || 'No se pudo eliminar el registro.');
                    }
                })
                .catch(error => {
                    Swal.fire(
                        'Error',
                        error.message,
                        'error'
                    );
                });
            }
        });
    });
});
