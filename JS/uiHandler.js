function alternarTelas(mostrarId, ocultarId) {
    const mostrar = document.getElementById(mostrarId);
    const ocultar = document.getElementById(ocultarId);
    
    ocultar.style.opacity = '0';
    setTimeout(() => {
        ocultar.style.display = 'none';
        mostrar.style.display = 'block';
        setTimeout(() => {
            mostrar.style.opacity = '1';
        }, 50);
    }, 200);
}

document.getElementById('to-register').addEventListener('click', () => {
    alternarTelas('register-section', 'login-section');
});

document.getElementById('to-login').addEventListener('click', () => {
    alternarTelas('login-section', 'register-section');
});

function dispararAlertaUI(texto, tipo) {
    const msgBox = document.getElementById('auth-msg');
    msgBox.textContent = texto;
    
    msgBox.className = 'msg-box ' + (tipo === 'erro' ? 'msg-box-erro' : 'msg-box-sucesso');
    
    msgBox.style.display = 'block';
    setTimeout(() => {
        msgBox.classList.remove('alert-hidden');
    }, 10);
}