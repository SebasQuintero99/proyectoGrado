function setupTableFilter(inputId, tableBodyId, filterUrl) {
    const input = document.getElementById(inputId);
    const tableBody = document.getElementById(tableBodyId);

    input.addEventListener('input', async function() {
        const filter = input.value;
        try {
            // Realizar la solicitud de filtrado
            const response = await fetch(`${filterUrl}?query=${filter}`);
            const data = await response.json();

            // Limpiar la tabla antes de agregar los resultados filtrados
            tableBody.innerHTML = '';

            // Agregar los programas filtrados a la tabla
            data.forEach((program, index) => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${index + 1}</td>
                    <td>${program.nombre_programa}</td>
                    <td>
                        <a href="/programs?editId=${program.id_programa}" class="btn btn-primary btn-sm">
                            <i class="fa-solid fa-pen-to-square"></i>
                        </a>
                        <button class="btn btn-danger btn-sm delete-btn" data-id="${program.id_programa}" data-entity="programs">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </td>
                `;
                tableBody.appendChild(row);
            });

        } catch (error) {
            console.error('Error al filtrar los datos:', error);
        }
    });
}
