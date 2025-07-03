document.addEventListener('DOMContentLoaded', function() {
    // Colores para los gráficos
    const colors = {
        primary: '#4e73df',
        success: '#1cc88a',
        info: '#36b9cc',
        warning: '#f6c23e',
        danger: '#e74a3b',
        secondary: '#858796',
        light: '#f8f9fc',
        dark: '#5a5c69'
    };

    // Obtener datos del elemento oculto
    const chartDataElement = document.getElementById('dashboard-chart-data');
    if (!chartDataElement) return;
    
    try {
        // Parsear los datos del dashboard
        const rawData = JSON.parse(chartDataElement.textContent);
        
        // Asegurarse de que los datos estén en el formato correcto
        const chartData = {
            dias: typeof rawData.dias === 'string' ? JSON.parse(rawData.dias) : rawData.dias,
            laboratorios: typeof rawData.laboratorios === 'string' ? JSON.parse(rawData.laboratorios) : rawData.laboratorios,
            datosPorDia: typeof rawData.datosPorDia === 'string' ? JSON.parse(rawData.datosPorDia) : rawData.datosPorDia,
            totalPorLaboratorio: typeof rawData.totalPorLaboratorio === 'string' ? JSON.parse(rawData.totalPorLaboratorio) : rawData.totalPorLaboratorio,
            profesores: rawData.profesores || { nombres: [], totalClases: [] }
        };
        
        // Inicializar gráficos si existen los elementos
        if (chartData.dias && chartData.laboratorios && chartData.datosPorDia) {
            console.log('Inicializando gráfico de clases por día con datos:', {
                dias: chartData.dias,
                laboratorios: chartData.laboratorios,
                datosPorDia: chartData.datosPorDia
            });
            initClasesPorDiaChart(chartData.dias, chartData.laboratorios, chartData.datosPorDia);
        } else {
            console.error('Faltan datos para inicializar el gráfico de clases por día');
        }
        
        if (chartData.totalPorLaboratorio) {
            console.log('Inicializando gráfico de uso de laboratorios con datos:', chartData.totalPorLaboratorio);
            initUsoLaboratoriosChart(chartData.totalPorLaboratorio);
        } else {
            console.error('Faltan datos para inicializar el gráfico de uso de laboratorios');
        }
        
        // Inicializar gráfico de profesores si existen los datos
        if (chartData.profesores && chartData.profesores.nombres && chartData.profesores.nombres.length > 0) {
            console.log('Inicializando gráfico de profesores con datos:', chartData.profesores);
            initClasesPorProfesorChart(chartData.profesores);
        } else {
            console.warn('No hay datos de profesores para mostrar');
        }
    } catch (error) {
        console.error('Error al cargar los datos de los gráficos:', error);
    }

    /**
     * Inicializa el gráfico de barras de clases por día
     */
    function initClasesPorDiaChart(dias, laboratorios, datosPorDia) {
        console.log('Inicializando gráfico de barras con datos:', { dias, laboratorios, datosPorDia });
        const ctx = document.getElementById('clasesPorDiaChart').getContext('2d');
        
        // Preparar datasets para cada laboratorio
        const datasets = laboratorios.map((lab, index) => {
            const data = dias.map(dia => {
                const valor = datosPorDia[dia] && datosPorDia[dia][lab];
                return valor !== undefined ? valor : 0;
            });
            
            return {
                label: lab,
                data: data,
                backgroundColor: Object.values(colors)[index % Object.keys(colors).length],
                borderColor: Object.values(colors)[index % Object.keys(colors).length],
                borderWidth: 1,
                borderRadius: 4
            };
        });

        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: dias,
                datasets: datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        stacked: true,
                        grid: {
                            display: false
                        }
                    },
                    y: {
                        stacked: true,
                        beginAtZero: true,
                        ticks: {
                            precision: 0
                        }
                    }
                },
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false
                    }
                }
            }
        });
    }


    /**
     * Inicializa el gráfico de dona de uso de laboratorios
     */
    function initUsoLaboratoriosChart(totalPorLaboratorio) {
        console.log('Inicializando gráfico de dona con datos:', totalPorLaboratorio);
        const ctx = document.getElementById('usoLaboratoriosChart').getContext('2d');
        const labels = Object.keys(totalPorLaboratorio);
        const data = Object.values(totalPorLaboratorio);
        
        // Usar colores consistentes con el otro gráfico
        const backgroundColors = labels.map((_, i) => 
            Object.values(colors)[i % Object.keys(colors).length]
        );

        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: backgroundColors,
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '70%',
                plugins: {
                    legend: {
                        position: 'right',
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.raw || 0;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = Math.round((value / total) * 100);
                                return `${label}: ${value} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
    }
});

/**
 * Inicializa el gráfico de barras de clases por profesor
 */
function initClasesPorProfesorChart(profesoresData) {
    try {
        const ctx = document.getElementById('clasesPorProfesorChart').getContext('2d');
        
        // Verificar si hay datos
        if (!profesoresData || !profesoresData.nombres || profesoresData.nombres.length === 0) {
            console.warn('No hay datos de profesores para mostrar');
            return;
        }

        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: profesoresData.nombres,
                datasets: [{
                    label: 'Clases por semana',
                    data: profesoresData.totalClases,
                    backgroundColor: [
                        'rgba(78, 115, 223, 0.7)',
                        'rgba(28, 200, 138, 0.7)',
                        'rgba(54, 185, 204, 0.7)',
                        'rgba(246, 194, 62, 0.7)',
                        'rgba(231, 74, 59, 0.7)',
                        'rgba(133, 135, 150, 0.7)',
                        'rgba(13, 110, 253, 0.7)',
                        'rgba(111, 66, 193, 0.7)',
                        'rgba(253, 126, 20, 0.7)',
                        'rgba(32, 201, 151, 0.7)'
                    ],
                    borderColor: [
                        'rgba(78, 115, 223, 1)',
                        'rgba(28, 200, 138, 1)',
                        'rgba(54, 185, 204, 1)',
                        'rgba(246, 194, 62, 1)',
                        'rgba(231, 74, 59, 1)',
                        'rgba(133, 135, 150, 1)',
                        'rgba(13, 110, 253, 1)',
                        'rgba(111, 66, 193, 1)',
                        'rgba(253, 126, 20, 1)',
                        'rgba(32, 201, 151, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleFont: {
                            size: 13,
                            weight: 'bold'
                        },
                        bodyFont: {
                            size: 13
                        },
                        padding: 12,
                        displayColors: false,
                        callbacks: {
                            label: function(context) {
                                return `${context.parsed.y} clases`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            display: true,
                            color: 'rgba(0, 0, 0, 0.05)'
                        },
                        ticks: {
                            stepSize: 1
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            autoSkip: false,
                            maxRotation: 45,
                            minRotation: 45
                        }
                    }
                }
            }
        });
    } catch (error) {
        console.error('Error al inicializar el gráfico de profesores:', error);
    }
}
