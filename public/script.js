// Elementos da Busca
const caixaDeBusca = document.getElementById('caixaDeBusca');
const botaoDeBusca = document.getElementById('botaoDeBusca');
const resultadosDiv = document.getElementById('resultados');

// Elementos do Formulário
const btnNovoLivro = document.getElementById('btnNovoLivro');
const formContainer = document.getElementById('formContainer');
const livroForm = document.getElementById('livroForm');
const formTitulo = document.getElementById('formTitulo');
const btnCancelar = document.getElementById('btnCancelar');

// Campos do formulário
const livroIdInput = document.getElementById('livroId');
const tituloInput = document.getElementById('titulo');
const autoresInput = document.getElementById('autores');
const generoInput = document.getElementById('genero');
const anoInput = document.getElementById('ano');


// --- FUNÇÕES DE BUSCA ---

const realizarBusca = () => {
    const termo = caixaDeBusca.value;

    if (termo.length < 2) {
        resultadosDiv.innerHTML = '<p>Digite pelo menos 2 caracteres para buscar.</p>';
        return;
    }
    
    // Esconde o formulário ao realizar uma nova busca
    formContainer.classList.add('hidden');

    fetch(`/api/livros/pesquisar?termo=${encodeURIComponent(termo)}`)
        .then(response => response.json())
        .then(livros => {
            exibirResultados(livros);
        })
        .catch(error => {
            console.error('Erro ao buscar livros:', error);
            resultadosDiv.innerHTML = '<p>Ocorreu um erro ao realizar a busca. Tente novamente.</p>';
        });
};

const exibirResultados = (livros) => {
    resultadosDiv.innerHTML = '';

    if (livros.length === 0) {
        resultadosDiv.innerHTML = '<p>Nenhum livro encontrado para o termo buscado.</p>';
        return;
    }

    livros.forEach(livro => {
        const livroCard = document.createElement('div');
        livroCard.className = 'livro-card';
        // Adicionado: data-id e botões de Editar/Excluir
        livroCard.innerHTML = `
            <div>
                <h3>${livro.titulo}</h3>
                <p><strong>Autor(es):</strong> ${livro.autores}</p>
                <p><strong>Gênero:</strong> ${livro.genero}</p>
                <p><strong>Ano:</strong> ${livro.ano_publicacao}</p>
            </div>
            <div class="card-actions">
                <button class="btn-editar" data-id="${livro.livro_id}">Editar</button>
                <button class="btn-excluir" data-id="${livro.livro_id}">Excluir</button>
            </div>
        `;
        resultadosDiv.appendChild(livroCard);
    });
};

// --- FUNÇÕES DO FORMULÁRIO (CRUD) ---

const exibirFormulario = (livro = null) => {
    formContainer.classList.remove('hidden');
    if (livro) {
        // Modo Edição
        formTitulo.textContent = 'Editar Livro';
        livroIdInput.value = livro.livro_id;
        tituloInput.value = livro.titulo;
        autoresInput.value = livro.autores_ids;
        generoInput.value = livro.genero;
        anoInput.value = livro.ano_publicacao;
    } else {
        // Modo Criação
        formTitulo.textContent = 'Adicionar Novo Livro';
        livroForm.reset();
        livroIdInput.value = '';
    }
};

const esconderFormulario = () => {
    formContainer.classList.add('hidden');
    livroForm.reset();
    livroIdInput.value = '';
};

const salvarLivro = (event) => {
    event.preventDefault(); // Impede o recarregamento da página

    const id = livroIdInput.value;
    const autores_ids = autoresInput.value.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));

    const dadosLivro = {
        titulo: tituloInput.value,
        ano_publicacao: anoInput.value ? parseInt(anoInput.value) : null,
        genero: generoInput.value,
        autores_ids: autores_ids
    };

    const isEdicao = id !== '';
    const url = isEdicao ? `/api/livros/${id}` : '/api/livros';
    const method = isEdicao ? 'PUT' : 'POST';

    fetch(url, {
        method: method,
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(dadosLivro),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Falha ao salvar o livro.');
        }
        return response.json();
    })
    .then(data => {
        alert(data.message);
        esconderFormulario();
        // Atualiza a busca para refletir as mudanças
        if (caixaDeBusca.value) {
            realizarBusca();
        }
    })
    .catch(error => {
        console.error('Erro ao salvar livro:', error);
        alert('Ocorreu um erro ao salvar. Verifique o console.');
    });
};

const editarLivro = (id) => {
    fetch(`/api/livros/${id}`)
        .then(response => response.json())
        .then(livro => {
            exibirFormulario(livro);
        })
        .catch(error => {
            console.error('Erro ao buscar dados do livro para edição:', error);
            alert('Não foi possível carregar os dados para edição.');
        });
};

const excluirLivro = (id) => {
    if (!confirm('Tem certeza que deseja excluir este livro?')) {
        return;
    }

    fetch(`/api/livros/${id}`, {
        method: 'DELETE',
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message);
        // Remove o card da tela ou atualiza a busca
        realizarBusca();
    })
    .catch(error => {
        console.error('Erro ao excluir livro:', error);
        alert('Ocorreu um erro ao excluir.');
    });
};

botaoDeBusca.addEventListener('click', realizarBusca);
caixaDeBusca.addEventListener('keyup', (event) => {
    if (event.key === 'Enter') {
        realizarBusca();
    }
});

// Ações do formulário
btnNovoLivro.addEventListener('click', () => exibirFormulario());
btnCancelar.addEventListener('click', esconderFormulario);
livroForm.addEventListener('submit', salvarLivro);

// Ações nos cards de resultado (Editar/Excluir)
resultadosDiv.addEventListener('click', (event) => {
    const target = event.target;
    if (target.classList.contains('btn-editar')) {
        const id = target.getAttribute('data-id');
        editarLivro(id);
    }
    if (target.classList.contains('btn-excluir')) {
        const id = target.getAttribute('data-id');
        excluirLivro(id);
    }
});