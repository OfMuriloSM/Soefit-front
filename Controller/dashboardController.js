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
    container.innerHTML = ''; 

    if (fichas.length === 0) {
        container.innerHTML = '<p style="color: var(--text-muted)">Você ainda não possui fichas criadas.</p>';
        return;
    }

    fichas.forEach(ficha => {
        const fichaDiv = document.createElement('div');
        fichaDiv.className = 'ficha-card';
        
        let exerciciosHTML = '';
        if (ficha.exercicios && ficha.exercicios.length > 0) {
            ficha.exercicios.forEach(ex => {
                
                // MÁGICA DO HISTÓRICO: Cria a tabelinha dinamicamente
                let historicoHTML = '';
                if (ex.historicoCargas) {
                    const pesos = ex.historicoCargas.split(' | ');
                    let celulas = pesos.map((p, i) => `<td style="padding: 6px; border: 1px solid #444; white-space: nowrap;">Treino ${i+1}<br><strong style="color:var(--primary-orange);">${p}</strong></td>`).join('');
                    historicoHTML = `
                        <div style="margin-top: 12px; overflow-x: auto; border-radius: 4px;">
                            <table style="font-size: 0.8rem; border-collapse: collapse; width: 100%; text-align: center; background-color: #222;">
                                <tr>${celulas}</tr>
                            </table>
                        </div>
                    `;
                }

                exerciciosHTML += `
                    <div class="exercicio-item" style="flex-direction: column; align-items: stretch; padding: 15px 10px;">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <span style="font-size: 1.05rem;"><strong>${ex.nome}</strong> - ${ex.series}x${ex.repeticoes}</span>
                            <div>
                                <button type="button" onclick="abrirModalEdicao(${ex.id}, ${ficha.id}, '${ex.nome}', ${ex.series}, ${ex.repeticoes}, ${ex.cargaKg})" class="btn-small" title="Editar" style="background: transparent; color: #ffc107; padding: 0 10px;">                                    <i class="fa-solid fa-pen-to-square"></i>
                                </button>
                                <button type="button" onclick="deletarExercicio(${ex.id})" class="btn-small" title="Excluir" style="background: transparent; color: #dc3545; padding: 0;">
                                    <i class="fa-solid fa-trash"></i>
                                </button>
                            </div>
                        </div>
                        ${historicoHTML}
                    </div>
                `;
            });
        } else {
            exerciciosHTML = '<p style="font-size: 0.8rem; color: #666;">Nenhum exercício adicionado.</p>';
        }

        fichaDiv.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; border-bottom: 1px solid #333; padding-bottom: 10px;">
                <h3 style="color: var(--primary-orange); margin: 0;">${ficha.nomeTreino}</h3>
                <button type="button" onclick="deletarFicha(${ficha.id})" class="btn-small" style="background-color: #dc3545;">Excluir Ficha</button>
            </div>
            <div class="exercicios-lista" style="display: flex; flex-direction: column; gap: 8px;">
                ${exerciciosHTML}
            </div>
        `;
        container.appendChild(fichaDiv);
    });
}

// Variável global para guardar qual exercício estamos editando
let exercicioEmEdicao = null;

function abrirModalEdicao(id, fichaId, nomeAtual, series, repeticoes, cargaAtual) {
    // Guarda os dados para usar quando clicar em Salvar
    exercicioEmEdicao = { id, fichaId, series, repeticoes };

    // Preenche os campos do modal com os dados atuais do banco
    document.getElementById('modal-nome').value = nomeAtual;
    document.getElementById('modal-carga').value = cargaAtual;

    // Mostra o Modal na tela
    document.getElementById('modal-update').style.display = 'flex';
}

function fecharModalEdicao() {
    // Esconde o Modal
    document.getElementById('modal-update').style.display = 'none';
    exercicioEmEdicao = null;
}

// Evento do botão Cancelar do Modal
document.getElementById('btn-cancelar-modal').addEventListener('click', fecharModalEdicao);

// Evento do botão Salvar do Modal
document.getElementById('btn-salvar-modal').addEventListener('click', async () => {
    if (!exercicioEmEdicao) return;

    const novoNome = document.getElementById('modal-nome').value.trim();
    const novaCarga = document.getElementById('modal-carga').value;

    if (novoNome === "" || novaCarga === "") {
        alert("Os campos não podem ficar vazios!");
        return;
    }

    try {
        const response = await fetch(`http://localhost:8080/api/exercicios/${exercicioEmEdicao.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                fichaId: exercicioEmEdicao.fichaId,
                nome: novoNome,
                series: exercicioEmEdicao.series,
                repeticoes: exercicioEmEdicao.repeticoes,
                cargaKg: parseFloat(novaCarga)
            })
        });

        if (response.ok) {
            fecharModalEdicao(); // Fecha a janelinha bonita
            carregarDashboard(); // Atualiza a tabelinha de histórico na tela
        } else {
            alert("Erro ao atualizar a carga.");
        }
    } catch (error) {
        console.error("Erro na requisição:", error);
    }
});

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
// ==========================================
// LÓGICA DO MODAL DE EXCLUSÃO
// ==========================================
let idParaExcluir = null;
let tipoParaExcluir = null; // 'ficha' ou 'exercicio'

// Substitui o confirm() feio pelo nosso Modal
function deletarFicha(id) {
    idParaExcluir = id;
    tipoParaExcluir = 'ficha';
    document.getElementById('modal-delete-msg').textContent = "Tem certeza que deseja excluir esta ficha inteira? Todos os exercícios nela serão perdidos.";
    document.getElementById('modal-delete').style.display = 'flex';
}

function deletarExercicio(id) {
    idParaExcluir = id;
    tipoParaExcluir = 'exercicio';
    document.getElementById('modal-delete-msg').textContent = "Tem certeza que deseja excluir este exercício?";
    document.getElementById('modal-delete').style.display = 'flex';
}

function fecharModalDelete() {
    document.getElementById('modal-delete').style.display = 'none';
    idParaExcluir = null;
    tipoParaExcluir = null;
}

document.getElementById('btn-cancelar-delete').addEventListener('click', fecharModalDelete);

document.getElementById('btn-confirmar-delete').addEventListener('click', async () => {
    if (!idParaExcluir || !tipoParaExcluir) return;

    try {
        const url = tipoParaExcluir === 'ficha' 
            ? `http://localhost:8080/api/fichas/${idParaExcluir}` 
            : `http://localhost:8080/api/exercicios/${idParaExcluir}`;

        const response = await fetch(url, { method: 'DELETE' });

        if (response.ok) {
            fecharModalDelete(); // Fecha o popup
            carregarDashboard(); // Recarrega os cards
        } else {
            alert("Erro ao tentar excluir.");
        }
    } catch (error) {
        console.error("Erro na requisição:", error);
    }
});