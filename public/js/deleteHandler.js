document.addEventListener('DOMContentLoaded', () => {
    const deleteButtons = document.querySelectorAll('.delete-btn');

    deleteButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault(); // Prevenir la acción predeterminada del botón

            const recordId = button.getAttribute('data-id'); // ID del registro a eliminar
            const entity = button.getAttribute('data-entity'); // Entidad (ej.: programs, signatures)

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
});
