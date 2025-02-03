document.addEventListener('DOMContentLoaded', () => {
    const ctx = document.getElementById('statsChart').getContext('2d');
    const data = {
        labels: ['Clases', 'Docentes', 'Asignaturas', 'Laboratorios'],
        datasets: [{
            label: 'Estadísticas',
            data: [
                document.getElementById('total-clases').innerText,
                document.getElementById('total-docentes').innerText,
                document.getElementById('total-asignaturas').innerText,
                document.getElementById('total-laboratorios').innerText,
            ],
            backgroundColor: ['#007bff', '#28a745', '#ffc107', '#dc3545'],
        }],
    };

    new Chart(ctx, {
        type: 'bar',
        data,
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: false,
                },
            },
        },
    });
});


