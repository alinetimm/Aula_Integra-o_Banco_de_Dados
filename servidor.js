const express = require('express');
const mysql = require('mysql2');

const app = express();
const port = 3000;

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'aqui vou colocar minha senha', 
    database: 'biblioteca',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
}).promise(); // Adicionando .promise() para usar async/await, que é mais moderno e limpo

app.get('/api/livros/pesquisar', async (req, res) => {
    try {
        const termo = req.query.termo;

        if (!termo) {
            return res.json([]); // Retorna array vazio se não houver termo
        }

        const termoDeBusca = `%${termo}%`;

        // A consulta SQL para buscar por título ou autor
        const sql = `
            SELECT 
                L.titulo, 
                L.ano_publicacao, 
                L.genero,
                GROUP_CONCAT(A.nome SEPARATOR ', ') AS autores
            FROM LIVRO AS L
            JOIN LIVRO_AUTOR AS LA ON L.livro_id = LA.livro_id
            JOIN AUTOR AS A ON LA.autor_id = A.autor_id
            WHERE L.titulo LIKE ? OR A.nome LIKE ?
            GROUP BY L.livro_id
            ORDER BY L.titulo;
        `;
        
        // Executa a query e espera o resultado
        const [results] = await pool.query(sql, [termoDeBusca, termoDeBusca]);
        
        // Retorna os resultados em JSON para o frontend
        res.json(results);

    } catch (err) {
        // Se qualquer erro acontecer no bloco 'try', ele será capturado aqui
        console.error("ERRO NO BACKEND:", err); // Mostra o erro detalhado no terminal do servidor
        res.status(500).json({ error: 'Ocorreu um erro no servidor ao processar sua busca.' });
    }
});

// Serve os arquivos estáticos da pasta 'public'
app.use(express.static('public'));

// Inicia o servidor
app.listen(port, () => {
    console.log(`Servidor da biblioteca rodando em http://localhost:${port}`);
});
