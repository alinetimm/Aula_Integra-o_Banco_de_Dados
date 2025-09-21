CREATE DATABASE IF NOT EXISTS biblioteca;
USE biblioteca;

CREATE TABLE AUTOR (
    autor_id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    nacionalidade VARCHAR(100)
);

CREATE TABLE LIVRO (
    livro_id INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    ano_publicacao INT,
    genero VARCHAR(100),
    excluido BOOLEAN DEFAULT FALSE -- Adicionado para exclusão lógica
);
CREATE TABLE LIVRO_AUTOR (
    livro_id INT,
    autor_id INT,
    PRIMARY KEY (livro_id, autor_id),
    FOREIGN KEY (livro_id) REFERENCES LIVRO(livro_id),
    FOREIGN KEY (autor_id) REFERENCES AUTOR(autor_id)
);
-- Inserindo Autores
INSERT INTO AUTOR (autor_id, nome, nacionalidade) VALUES
(1, 'Machado de Assis', 'Brasileira'),
(2, 'Clarice Lispector', 'Brasileira'),
(3, 'Jorge Amado', 'Brasileira'),
(4, 'J.K. Rowling', 'Britânica'),
(5, 'J.R.R. Tolkien', 'Britânica'),
(6, 'George Orwell', 'Britânica'),
(7, 'Gabriel García Márquez', 'Colombiana'),
(8, 'Haruki Murakami', 'Japonesa'),
(9, 'Yuval Noah Harari', 'Israelense'),
(10, 'Graciliano Ramos', 'Brasileira'),
(11, 'Cecília Meireles', 'Brasileira'),
(12, 'Isaac Asimov', 'Russa'),
(13, 'Agatha Christie', 'Britânica');

-- Inserindo Livros
INSERT INTO LIVRO (livro_id, titulo, ano_publicacao, genero) VALUES
(1, 'Dom Casmurro', 1899, 'Realismo'),
(2, 'Memórias Póstumas de Brás Cubas', 1881, 'Realismo'),
(3, 'A Hora da Estrela', 1977, 'Modernismo'),
(4, 'Perto do Coração Selvagem', 1943, 'Modernismo'),
(5, 'Capitães da Areia', 1937, 'Modernismo'),
(6, 'Gabriela, Cravo e Canela', 1958, 'Modernismo'),
(7, 'Harry Potter e a Pedra Filosofal', 1997, 'Fantasia'),
(8, 'Harry Potter e a Câmara Secreta', 1998, 'Fantasia'),
(9, 'O Senhor dos Anéis: A Sociedade do Anel', 1954, 'Fantasia'),
(10, 'O Hobbit', 1937, 'Fantasia'),
(11, '1984', 1949, 'Distopia'),
(12, 'A Revolução dos Bichos', 1945, 'Sátira Política'),
(13, 'Cem Anos de Solidão', 1967, 'Realismo Mágico'),
(14, 'O Amor nos Tempos do Cólera', 1985, 'Romance'),
(15, '1Q84', 2009, 'Ficção'),
(16, 'Kafka à Beira-Mar', 2002, 'Realismo Mágico'),
(17, 'Sapiens: Uma Breve História da Humanidade', 2011, 'Não-ficção'),
(18, 'Homo Deus: Uma Breve História do Amanhã', 2015, 'Não-ficção'),
(19, 'Vidas Secas', 1938, 'Modernismo'),
(20, 'Romanceiro da Inconfidência', 1953, 'Poesia'),
(21, 'Eu, Robô', 1950, 'Ficção Científica'),
(22, 'O Assassinato no Expresso do Oriente', 1934, 'Mistério');

-- Ligando Livros aos Autores
INSERT INTO LIVRO_AUTOR (livro_id, autor_id) VALUES
(1, 1), (2, 1),
(3, 2), (4, 2),
(5, 3), (6, 3),
(7, 4), (8, 4),
(9, 5), (10, 5),
(11, 6), (12, 6),
(13, 7), (14, 7),
(15, 8), (16, 8),
(17, 9), (18, 9),
(19, 10),
(20, 11),
(21, 12),
(22, 13);