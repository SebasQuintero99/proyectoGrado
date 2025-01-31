document.addEventListener('DOMContentLoaded', () => {
    const laboratorySelect = document.getElementById('laboratory-select');
    const calendarBody = document.getElementById('calendar-table-body');
    const messageBox = document.getElementById('message-box');

    // Manejar la selección del laboratorio
    laboratorySelect.addEventListener('change', async () => {
        const laboratoryId = laboratorySelect.value;

        if (!laboratoryId) {
            calendarBody.innerHTML = '<tr><td colspan="15">Seleccione un laboratorio para ver los horarios.</td></tr>';
            return;
        }

        try {
            const response = await fetch(`/classes/schedule?laboratoryId=${laboratoryId}`);
            const data = await response.json();

            if (data.success) {
                renderCalendar(data.schedule);
            } else {
                messageBox.innerHTML = `<div class="alert alert-danger">${data.message}</div>`;
            }
        } catch (error) {
            console.error('Error al cargar los horarios:', error);
            messageBox.innerHTML = '<div class="alert alert-danger">Error al cargar los horarios.</div>';
        }
    });

    // Renderizar el calendario
    function renderCalendar(schedule) {
        calendarBody.innerHTML = '';

        const days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
        days.forEach((day) => {
            let rowHtml = `<tr><td>${day}</td>`;

            for (let hour = 6; hour <= 20; hour++) {
                const scheduleItem = schedule.find(
                    (item) => item.dia_semana === day && parseInt(item.hora_inicio.split(':')[0]) === hour
                );

                rowHtml += `<td data-day="${day}" data-hour="${hour}" class="text-center">
                    ${
                        scheduleItem
                            ? `<span class="badge bg-primary">${scheduleItem.id_asignatura}</span>`
                            : '<button class="btn btn-sm btn-outline-secondary">+</button>'
                    }
                </td>`;
            }

            rowHtml += '</tr>';
            calendarBody.innerHTML += rowHtml;
        });
    }
});
