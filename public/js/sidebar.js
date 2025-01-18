// Lógica para el botón de colapso
const collapseBtn = document.getElementById('collapse-btn');
const sidebar = document.getElementById('sidebar');
const content = document.getElementById('content');

collapseBtn.addEventListener('click', () => {
    sidebar.classList.toggle('collapsed');
    content.classList.toggle('collapsed');
    collapseBtn.classList.toggle('collapsed');
});
