document.addEventListener('DOMContentLoaded', carregarUsuarios);

document.getElementById('btn-voltar').addEventListener('click', () => {
    window.location.href = '../../Index.html';
});

async function carregarUsuarios() {
    try {
        const response = await fetch('http://localhost:8080/api/usuarios');
        if (response.ok) {
            const usuarios = await response.json();
            renderizarTabela(usuarios);
        } else {
            console.error("Erro ao buscar alunos.");
        }
    } catch (error) {
        console.error("Erro de conexão. O backend está rodando?", error);
    }
}

function renderizarTabela(usuarios) {
    const tbody = document.getElementById('lista-usuarios');
    tbody.innerHTML = '';

    if (usuarios.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="padding: 20px; text-align: center;">Nenhum aluno cadastrado no sistema.</td></tr>';
        return;
    }

    usuarios.forEach(user => {
        const qtdFichas = user.fichas ? user.fichas.length : 0;
        
        const tr = document.createElement('tr');
        tr.style.borderBottom = "1px solid #333";
        
        tr.innerHTML = `
            <td style="padding: 15px 10px; color: #888;">#${user.id}</td>
            <td style="padding: 15px 10px; font-weight: bold; color: var(--primary-orange);">${user.nome}</td>
            <td style="padding: 15px 10px;">${user.email}</td>
            <td style="padding: 15px 10px;">${qtdFichas} ficha(s)</td>
            <td style="padding: 15px 10px;">
                <button onclick="deletarUsuario(${user.id})" class="btn-small" style="background-color: #dc3545;" title="Remover Aluno do Sistema">
                    <i class="fa-solid fa-trash"></i> Excluir
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

async function deletarUsuario(id) {
    if(confirm('ATENÇÃO: Essa ação excluirá o aluno e TODAS as suas fichas de treino. Tem certeza?')) {
        try {
            await fetch(`http://localhost:8080/api/usuarios/${id}`, { method: 'DELETE' });
            carregarUsuarios();
        } catch (error) {
            alert('Erro ao excluir o aluno.');
        }
    }
}