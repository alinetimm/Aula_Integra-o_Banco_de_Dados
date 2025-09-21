const express = require('express');
const mysql = require('mysql2');

const app = express();
const port = 3000;

// Adicionado: Middleware para o Express conseguir interpretar o corpo (body) das requisições como JSON.
app.use(express.json());

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'Yugioh15!',
    database: 'biblioteca',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
}).promise();

// GET (BUSCA): /api/livros/pesquisar?termo=...
app.get('/api/livros/pesquisar', async (req, res) => {
    try {
        const termo = req.query.termo;

        if (!termo) {
            return res.json([]);
        }

        const termoDeBusca = `%${termo}%`;
        const sql = `
            SELECT 
                L.livro_id,
                L.titulo, 
                L.ano_publicacao, 
                L.genero,
                GROUP_CONCAT(A.nome SEPARATOR ', ') AS autores
            FROM LIVRO AS L
            JOIN LIVRO_AUTOR AS LA ON L.livro_id = LA.livro_id
            JOIN AUTOR AS A ON LA.autor_id = A.autor_id
            WHERE (L.titulo LIKE ? OR A.nome LIKE ?) AND L.excluido = FALSE
            GROUP BY L.livro_id
            ORDER BY L.titulo;
        `;

        const [results] = await pool.query(sql, [termoDeBusca, termoDeBusca]);
        res.json(results);

    } catch (err) {
        console.error("ERRO NO BACKEND:", err);
        res.status(500).json({ error: 'Ocorreu um erro no servidor ao processar sua busca.' });
    }
});

app.get('/api/livros/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const sql = `
            SELECT 
                L.livro_id,
                L.titulo, 
                L.ano_publicacao, 
                L.genero,
                GROUP_CONCAT(A.autor_id) AS autores_ids
            FROM LIVRO AS L
            JOIN LIVRO_AUTOR AS LA ON L.livro_id = LA.livro_id
            JOIN AUTOR AS A ON LA.autor_id = A.autor_id
            WHERE L.livro_id = ? AND L.excluido = FALSE
            GROUP BY L.livro_id;
        `;
        const [results] = await pool.query(sql, [id]);
        if (results.length === 0) {
            return res.status(404).json({ error: 'Livro não encontrado' });
        }
        res.json(results[0]);
    } catch (err) {
        console.error("ERRO NO BACKEND:", err);
        res.status(500).json({ error: 'Erro ao buscar dados do livro.' });
    }
});

app.post('/api/livros', async (req, res) => {
    const connection = await pool.getConnection();
    try {
        const { titulo, ano_publicacao, genero, autores_ids } = req.body;

        if (!titulo || !autores_ids || autores_ids.length === 0) {
            return res.status(400).json({ error: 'Título e ao menos um autor são obrigatórios.' });
        }

        await connection.beginTransaction();

        const sqlLivro = 'INSERT INTO LIVRO (titulo, ano_publicacao, genero) VALUES (?, ?, ?)';
        const [resultLivro] = await connection.query(sqlLivro, [titulo, ano_publicacao, genero]);
        const novoLivroId = resultLivro.insertId;

        const sqlLivroAutor = 'INSERT INTO LIVRO_AUTOR (livro_id, autor_id) VALUES ?';
        const valoresLivroAutor = autores_ids.map(autor_id => [novoLivroId, autor_id]);
        await connection.query(sqlLivroAutor, [valoresLivroAutor]);

        await connection.commit();
        res.status(201).json({ id: novoLivroId, message: 'Livro criado com sucesso!' });

    } catch (err) {
        await connection.rollback();
        console.error("ERRO NO BACKEND:", err);
        res.status(500).json({ error: 'Erro ao criar o livro.' });
    } finally {
        connection.release();
    }
});

app.put('/api/livros/:id', async (req, res) => {
    const connection = await pool.getConnection();
    try {
        const { id } = req.params;
        const { titulo, ano_publicacao, genero, autores_ids } = req.body;

        if (!titulo || !autores_ids || autores_ids.length === 0) {
            return res.status(400).json({ error: 'Título e ao menos um autor são obrigatórios.' });
        }

        await connection.beginTransaction();

        // 1. Atualiza a tabela LIVRO
        const sqlLivro = 'UPDATE LIVRO SET titulo = ?, ano_publicacao = ?, genero = ? WHERE livro_id = ?';
        await connection.query(sqlLivro, [titulo, ano_publicacao, genero, id]);

        // 2. Remove as associações de autores antigas
        const sqlDeleteAutores = 'DELETE FROM LIVRO_AUTOR WHERE livro_id = ?';
        await connection.query(sqlDeleteAutores, [id]);

        // 3. Insere as novas associações de autores
        const sqlInsertAutores = 'INSERT INTO LIVRO_AUTOR (livro_id, autor_id) VALUES ?';
        const valoresLivroAutor = autores_ids.map(autor_id => [id, autor_id]);
        await connection.query(sqlInsertAutores, [valoresLivroAutor]);

        await connection.commit();
        res.json({ message: 'Livro atualizado com sucesso!' });

    } catch (err) {
        await connection.rollback();
        console.error("ERRO NO BACKEND:", err);
        res.status(500).json({ error: 'Erro ao atualizar o livro.' });
    } finally {
        connection.release();
    }
});

app.delete('/api/livros/:id', async (req, res) => {
    try {
        const { id } = req.params;
        // Usando exclusão lógica (soft delete)
        const sql = 'UPDATE LIVRO SET excluido = TRUE WHERE livro_id = ?';
        const [result] = await pool.query(sql, [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Livro não encontrado para exclusão.' });
        }

        res.json({ message: 'Livro excluído com sucesso.' });
    } catch (err) {
        console.error("ERRO NO BACKEND:", err);
        res.status(500).json({ error: 'Erro ao excluir o livro.' });
    }
});


app.use(express.static('public'));

app.listen(port, () => {
    console.log(`Servidor da biblioteca rodando em http://localhost:${port}`);
});