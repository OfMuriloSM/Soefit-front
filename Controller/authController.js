const API_URL = 'http://localhost:8080/api/usuarios';

// CONTROLLER: EVENTO DE LOGIN
document.getElementById('form-login').addEventListener('submit', async function(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const senha = document.getElementById('login-senha').value;

    try {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, senha })
        });

        if (response.ok) {
            const usuario = await response.json();
            localStorage.setItem('soefit_userId', usuario.id);
            localStorage.setItem('soefit_userName', usuario.nome);
            window.location.href = './View/Client/dashboard.html';
        } else {
            dispararAlertaUI('Credenciais inválidas. Tente novamente.', 'erro');
        }
    } catch (error) {
        dispararAlertaUI('Erro ao conectar com o servidor. O backend está ativo?', 'erro');
    }
});

// CONTROLLER: EVENTO DE CADASTRO
document.getElementById('form-register').addEventListener('submit', async function(e) {
    e.preventDefault();
    const nome = document.getElementById('reg-nome').value;
    const email = document.getElementById('reg-email').value;
    const senha = document.getElementById('reg-senha').value;

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome, email, senha })
        });

        if (response.status === 201) {
            const usuario = await response.json();
            localStorage.setItem('soefit_userId', usuario.id);
            localStorage.setItem('soefit_userName', usuario.nome);
            dispararAlertaUI('Cadastro realizado com sucesso!', 'sucesso');
            setTimeout(() => {
                window.location.href = './View/Client/dashboard.html';
            }, 1000);
        } else {
            dispararAlertaUI('Erro ao realizar o cadastro. Verifique as validações.', 'erro');
        }
    } catch (error) {
        dispararAlertaUI('Erro ao conectar com o servidor.', 'erro');
    }
});