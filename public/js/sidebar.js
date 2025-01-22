// Lógica para el botón de colapso
const collapseBtn = document.getElementById('collapse-btn');
const sidebar = document.getElementById('sidebar');
const content = document.getElementById('content');
const logoutButton = document.getElementById('logout-button'); // Seleccionamos el botón de logout

collapseBtn.addEventListener('click', () => {
    // Alternamos la clase 'collapsed' en el sidebar y el contenido
    sidebar.classList.toggle('collapsed');
    content.classList.toggle('collapsed');
    collapseBtn.classList.toggle('collapsed');

    // Verificamos si el sidebar tiene la clase 'collapsed' para ocultar el botón de logout
    if (sidebar.classList.contains('collapsed')) {
        logoutButton.style.display = 'none'; // Ocultar el botón
    } else {
        logoutButton.style.display = 'block'; // Mostrar el botón
    }
});