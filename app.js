
const express = require('express'); //importação do modulo express
const mysql = require('mysql2'); //importação do modulo mysql
const env = require('dotenv').config();
const path = require('path'); //importando modulo para trabalhar com caminhos de pastas
const fs = require('fs'); // importando modulo de manupulação de arquivos e pastas
const fileupload = require('express-fileupload'); //importando modulo fileupload
const PORT = 8080;

//app
const app = express();

//habilitando upload de arquivos
app.use(fileupload());


//referenciando arquivo index.html
app.use(express.static(path.join(__dirname, 'public')));

//referenciando arquivo style.css
app.use('/css', express.static('./css'));

//referenciando arquivo script.js
app.use('/script', express.static('./script'));

//referenciando a pasta imagens
app.use('/imagens', express.static('./imagens'));

//manipulação de dados via rota
app.use(express.json());
app.use(express.urlencoded({extended:false})); //extended:false para focar nos forms html


//configuração da conexao
const conexao = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306 
});

//teste de conexao do banco
conexao.connect((erro) => {
    if(erro) throw erro;
    console.log('Conexão do bd efetuada com sucesso!')
});

//rota principal respondendo com index.html
app.get('/', (req, res) => {
    //comando para selecionar TODOS os usuarios do banco de dados
    let sql = 'SELECT * FROM usuarios'
    
    //executando o comando
    conexao.query(sql, (erro, retorno)=>{
        res.sendFile(path.join(__dirname,'public'), {usuarios:retorno});
    });
});

//rota para buscar um usuario pelo id
app.get('/usuarios/:id', (req, res) => {
  const { id } = req.params;
  const sql = 'SELECT * FROM usuarios WHERE id = ?';
  conexao.query(sql, [id], (erro, resultado) => {
    if (erro) return res.status(500).json({ erro });
    if (resultado.length === 0) return res.status(404).json({ mensagem: 'Usuário não encontrado' });
    res.json(resultado[0]);
  });
});

//rota que busca todos os usuarios e responde com json
app.get('/usuarios', (req, res) => {
    const sql = 'SELECT * FROM usuarios';
    conexao.query(sql, (erro, resultado) => {
        if (erro) return res.status(500).json({ erro });
        res.json(resultado);
    });
});

//rota de cadastro
app.post('/cadastrar', (req, res) =>{
    //criando variaveis com os dados do formulario
    let nome = req.body.nome;
    let idade = req.body.idade;
    let rua = req.body.rua;
    let bairro = req.body.bairro;
    let estado = req.body.estado;
    let biografia = req.body.biografia;
    let imagem = req.files.imagem.name;

    //criando estrutura do MySQL
    let sql = `INSERT INTO usuarios (nome, idade, rua, bairro, estado, biografia, imagem) VALUES ('${nome}', ${idade}, '${rua}', '${bairro}', '${estado}', '${biografia}', '${imagem}')`;

    //executar comando SQL
    conexao.query(sql, (erro, retorno)=>{
        // se der erro, retorna o erro
        if(erro) throw erro;

        //se o cadastro ocorrer, salva a imagem na pasta imagens
        req.files.imagem.mv(__dirname+'/imagens/'+req.files.imagem.name); 
        console.log(retorno);

    });

    //retornar para a rota principal
    res.redirect('/');

});

//rota para deletar usuario
app.delete('/usuarios/:id', (req, res) => {
  const { id } = req.params;

  // buscando nome da imagem a ser apagada
  const selectSql = 'SELECT imagem FROM usuarios WHERE id = ?';
  conexao.query(selectSql, [id], (erro, resultado) => {
    if (erro) return res.status(500).json({ erro: 'Erro ao buscar usuário.' });

    if (resultado.length === 0) {
      return res.status(404).json({ mensagem: 'Usuário não encontrado.' });
    }

    const nomeImagem = resultado[0].imagem;
    const caminhoImagem = path.join(__dirname, 'imagens', nomeImagem);

    // apagando imagem
    fs.unlink(caminhoImagem, (erroUnlink) => {
      if (erroUnlink && erroUnlink.code !== 'ENOENT') {
        console.error('Erro ao apagar imagem:', erroUnlink);
        return res.status(500).json({ erro: 'Erro ao apagar imagem.' });
      }

      // deletando usuario do banco de dados
      const deleteSql = 'DELETE FROM usuarios WHERE id = ?';
      conexao.query(deleteSql, [id], (erroDel, resultadoDel) => {
        if (erroDel) return res.status(500).json({ erro: 'Erro ao remover usuário.' });
    
        res.json({ mensagem: 'Usuário e imagem removidos com sucesso.', id });
      });
    });
  });
});

//rota para editar usuario
app.put('/usuarios/:id', (req, res) => {
  const { id } = req.params;
  const { nome, idade, rua, bairro, estado, biografia } = req.body;

  const selectSql = 'SELECT imagem FROM usuarios WHERE id = ?';
  conexao.query(selectSql, [id], (erro, resultado) => {
    if (erro) return res.status(500).json({ erro });
    if (resultado.length === 0) return res.status(404).json({ mensagem: 'Usuário não encontrado' });

    let novaImagem = resultado[0].imagem;

    if (req.files && req.files.imagem) {
      novaImagem = req.files.imagem.name;

      const caminhoAntigo = path.join(__dirname, 'imagens', resultado[0].imagem);
      fs.unlink(caminhoAntigo, err => {
        if (err && err.code !== 'ENOENT') console.error('Erro ao remover imagem:', err);
      });

      req.files.imagem.mv(path.join(__dirname, 'imagens', novaImagem));
    }

    const updateSql = `
      UPDATE usuarios SET nome = ?, idade = ?, rua = ?, bairro = ?, estado = ?, biografia = ?, imagem = ?
      WHERE id = ?
    `;

    conexao.query(updateSql, [nome, idade, rua, bairro, estado, biografia, novaImagem, id], (err2) => {
      if (err2) return res.status(500).json({ erro: 'Erro ao atualizar usuário.' });

      res.json({ mensagem: 'Usuário atualizado com sucesso.' });
    });
  });
});



app.listen(PORT, ()=>{console.log(`URL de acesso: localhost:${PORT}`);});