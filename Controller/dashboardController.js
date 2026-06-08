// Recupera os dados da sessão do navegador
const userId = localStorage.getItem('soefit_userId');
const userName = localStorage.getItem('soefit_userName');

// Proteção de Rota: se tentar acessar o painel sem logar, é expulso
if (!userId) {
    window.location.href = '../../Index.html';
}

// Saudação e Logout
document.getElementById('welcome-msg').textContent = `Olá, ${userName}!`;
document.getElementById('btn-logout').addEventListener('click', () => {
    localStorage.clear();
    window.location.href = '../../Index.html';
});

// Busca os dados no carregamento da página
document.addEventListener('DOMContentLoaded', carregarDashboard);

async function carregarDashboard() {
    try {
        // Busca o usuário específico e o Spring já traz a lista de fichas junto!
        const response = await fetch(`http://localhost:8080/api/usuarios/${userId}`);
        
        if (response.ok) {
            const usuario = await response.json();
            renderizarFichas(usuario.fichas || []);
            atualizarSelectFichas(usuario.fichas || []);
        }
    } catch (error) {
        console.error('Erro ao carregar os dados:', error);
    }
}

// ==========================================
// RENDERIZAÇÃO NA TELA
// ==========================================
function renderizarFichas(fichas) {
    const container = document.getElementById('lista-fichas');
    container.innerHTML = ''; // Limpa a tela

    if (fichas.length === 0) {
        container.innerHTML = '<p style="color: var(--text-muted)">Você ainda não possui fichas criadas.</p>';
        return;
    }

    fichas.forEach(ficha => {
        // Monta o visual de cada ficha
        const fichaDiv = document.createElement('div');
        fichaDiv.className = 'ficha-card';
        
        // Monta a lista de exercícios dentro dessa ficha
        let exerciciosHTML = '';
        if (ficha.exercicios && ficha.exercicios.length > 0) {
            ficha.exercicios.forEach(ex => {
                exerciciosHTML += `
                    <div class="exercicio-item">
                        <span><strong>${ex.nome}</strong> - ${ex.series}x${ex.repeticoes} (${ex.cargaKg}kg)</span>
                        <button onclick="deletarExercicio(${ex.id})" class="btn-small" style="background: transparent; color: #dc3545; padding: 0;">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </div>
                `;
            });
        } else {
            exerciciosHTML = '<p style="font-size: 0.8rem; color: #666;">Nenhum exercício adicionado.</p>';
        }

        fichaDiv.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; border-bottom: 1px solid #333; padding-bottom: 10px;">
                <h3 style="color: var(--primary-orange); margin: 0;">${ficha.nomeTreino}</h3>
                <button onclick="deletarFicha(${ficha.id})" class="btn-small" style="background-color: #dc3545;">Excluir Ficha</button>
            </div>
            <div class="exercicios-lista" style="display: flex; flex-direction: column; gap: 8px;">
                ${exerciciosHTML}
            </div>
        `;
        container.appendChild(fichaDiv);
    });
}

function atualizarSelectFichas(fichas) {
    const select = document.getElementById('select-fichas');
    select.innerHTML = '<option value="">Selecione a Ficha...</option>';
    
    fichas.forEach(ficha => {
        const option = document.createElement('option');
        option.value = ficha.id;
        option.textContent = ficha.nomeTreino;
        select.appendChild(option);
    });
}

// ==========================================
// AÇÕES (POST E DELETE)
// ==========================================

// Criar Ficha
document.getElementById('form-ficha').addEventListener('submit', async (e) => {
    e.preventDefault();
    const nomeTreino = document.getElementById('nomeTreino').value;

    await fetch('http://localhost:8080/api/fichas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nomeTreino: nomeTreino, usuarioId: userId })
    });
    
    document.getElementById('nomeTreino').value = ''; // Limpa o input
    carregarDashboard(); // Recarrega a tela
});

// Adicionar Exercício
document.getElementById('form-exercicio').addEventListener('submit', async (e) => {
    e.preventDefault();
    const fichaId = document.getElementById('select-fichas').value;
    const nome = document.getElementById('nomeExercicio').value;
    const series = document.getElementById('series').value;
    const repeticoes = document.getElementById('repeticoes').value;
    const cargaKg = document.getElementById('cargaKg').value || 0;

    await fetch('http://localhost:8080/api/exercicios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fichaId, nome, series, repeticoes, cargaKg })
    });

    document.getElementById('form-exercicio').reset(); // Limpa form
    carregarDashboard();
});

// Deletar Entidades
async function deletarFicha(id) {
    if(confirm('Tem certeza que deseja excluir esta ficha inteira?')) {
        await fetch(`http://localhost:8080/api/fichas/${id}`, { method: 'DELETE' });
        carregarDashboard();
    }
}

async function deletarExercicio(id) {
    await fetch(`http://localhost:8080/api/exercicios/${id}`, { method: 'DELETE' });
    carregarDashboard();
}