function criarCard(){
        const col = document.createElement('div');
      col.className = 'col-6 raw-3 offset-3';
      col.setAttribute('data-id', usuario.id);

      col.innerHTML = `
        <div class="card mb-3">
          <img src="/imagens/${usuario.imagem}" class="card-img-top">
          <div class="textos p-2">
            <p><strong>${usuario.nome}</strong></p>
            <p>${usuario.idade} anos</p>
            <p>${usuario.rua}, ${usuario.bairro}, ${usuario.estado}</p>
            <p>${usuario.biografia}</p>
          </div>
          <div class="p-2">
            <div class="p-2">
                    <button class="btn btn-warning btn-sm me-1" onclick="preencherFormularioEdicao(${usuario.id})">
                     <i class="bi bi-pencil-square"></i> Alterar
                    </button>

                    <button class="btn btn-danger btn-sm" onclick="removerUsuario(${usuario.id})">
                        <i class="bi bi-trash"></i> Remover
                    </button>
                </div>
          </div>
        </div>
      `;

      containersm.appendChild(col);
   

};



//função para listar todos os usuários
function ListarTodos() {
        
    fetch('/usuarios')
        .then(res => res.json())
        .then(usuarios => {
        const container = document.querySelector('.row'); // Local onde os cards estão

        usuarios.forEach(user => {
            if (document.querySelector(`[data-id="${user.id}"]`)) {
                alert(`Usuário com ID ${user.id} já está sendo exibido.`);
                document.getElementById('buscarId').focus(); //fixar o cursor na pesquisa de usuario
                return;
            }
            const col = document.createElement('div');
            col.className = 'col-6 raw-3 offset-3';
            col.setAttribute('data-id', user.id);

            col.innerHTML = `
            <div class="card mb-3">
                <img src="/imagens/${user.imagem}" class="card-img-top">
                <div class="textos p-2">
                <p><strong>${user.nome}</strong></p>
                <p>${user.idade} anos</p>
                <p>${user.rua}, ${user.bairro}, ${user.estado}</p>
                <p>${user.biografia}</p>
                </div>
                <div class="p-2">
                    <button class="btn btn-warning btn-sm me-1" onclick="preencherFormularioEdicao(${user.id})">
                     <i class="bi bi-pencil-square"></i> Alterar
                    </button>

                    <button class="btn btn-danger btn-sm" onclick="removerUsuario(${user.id})">
                        <i class="bi bi-trash"></i> Remover
                    </button>
                </div>
            </div>
            `;

            container.appendChild(col);
        });
        
    });

};

//função para buscar usuarios pelo ID
function buscarUsuarioPorId(id) {
  fetch(`/usuarios/${id}`)
    .then(res => {
        if (!res.ok) {
            if (res.status === 404) {
            throw new Error(`Usuário com ID ${id} não encontrado.`);
            } else {
            throw new Error('Erro ao buscar usuário.');
            }
      }
      return res.json();
    })
    .then(usuario => {
      
      const containersm = document.querySelector('.row'); // onde estão os cards
      
     
        // Verifica se já existe um card com esse ID
     if (document.querySelector(`[data-id="${usuario.id}"]`)) {
        alert(`Usuário com ID ${usuario.id} já está sendo exibido.`);
        document.getElementById('buscarId').focus(); //fixar o cursor na pesquisa de usuario
        return;
        }
              const col = document.createElement('div');
      col.className = 'col-6 raw-3 offset-3';
      col.setAttribute('data-id', usuario.id);

      col.innerHTML = `
        <div class="card mb-3">
          <img src="/imagens/${usuario.imagem}" class="card-img-top">
          <div class="textos p-2">
            <p><strong>${usuario.nome}</strong></p>
            <p>${usuario.idade} anos</p>
            <p>${usuario.rua}, ${usuario.bairro}, ${usuario.estado}</p>
            <p>${usuario.biografia}</p>
          </div>
          <div class="p-2">
            <div class="p-2">
                    <button class="btn btn-warning btn-sm me-1" onclick="preencherFormularioEdicao(${usuario.id})">
                     <i class="bi bi-pencil-square"></i> Alterar
                    </button>

                    <button class="btn btn-danger btn-sm" onclick="removerUsuario(${usuario.id})">
                        <i class="bi bi-trash"></i> Remover
                    </button>
                </div>
          </div>
        </div>
      `;

      containersm.appendChild(col);
        })
     .catch(erro => {
      alert(erro.message); // mostrar mensagem, usuario nao exista no banco de dados
      document.getElementById('buscarId').focus(); //fixar o cursor na pesquisa de usuario
    });
   
}

//função para deletar usuario
function removerUsuario(id) {
  if (!confirm(`Deseja realmente remover o usuário com ID ${id}?`)) return;

  fetch(`/usuarios/${id}`, {
    method: 'DELETE'
  })
    .then(res => res.json())
    .then(resposta => {
      alert(resposta.mensagem);

      // Remove o card do DOM
      const card = document.querySelector(`[data-id='${id}']`);
      if (card) card.remove();
    })
    .catch(err => {
      console.error(err);
      alert('Erro ao remover usuário.');
    });  

}

//função para preencher o formulario com as informações do usuario
function preencherFormularioEdicao(id) {
  fetch(`/usuarios/${id}`)
    .then(res => {
      if (!res.ok) throw new Error(`Erro ao buscar usuário: ${res.status}`);
      return res.json();
    })
    .then(usuario => {
      console.log("Dados recebidos:", usuario);

      const form = document.getElementById('formUsuarios');

      // Preencher os campos
      form.querySelector('[name="id"]').value = usuario.id;
      form.querySelector('[name="nome"]').value = usuario.nome;
      form.querySelector('[name="idade"]').value = usuario.idade;
      form.querySelector('[name="rua"]').value = usuario.rua;
      form.querySelector('[name="bairro"]').value = usuario.bairro;
      form.querySelector('[name="estado"]').value = usuario.estado;
      form.querySelector('[name="biografia"]').value = usuario.biografia;

      // Trocar o texto do botão
      form.querySelector('input[type="submit"]').value = "Salvar Alterações";
      document.getElementById('btnCancelar').style.display = 'inline-block';
    })
    .catch(err => {
      console.error("Erro ao preencher formulário:", err);
    });
}

function resetarFormulario() {
  const form = document.getElementById('formUsuarios');
  form.reset();
  form.querySelector('input[name="id"]').value = "";
  form.querySelector('input[type="submit"]').value = "Cadastrar";
  document.getElementById('btnCancelar').style.display = 'none';
}

//verificar se tem ID ou nao, para enviar sbmit, ou fetch put
document.getElementById('formUsuarios').addEventListener('submit', function(e) {
  e.preventDefault();

  const form = e.target;
  const id = form.querySelector('input[name="id"]').value;

  // Se não tem ID, é um cadastro → envia normalmente
  if (!id) {
    form.submit();
    return;
  }

  // Se tem ID, é edição → envia via fetch PUT
  const formData = new FormData(form);

  fetch(`/usuarios/${id}`, {
    method: 'PUT',
    body: formData
  })
    .then(res => res.ok ? res.json() : Promise.reject(res))
    .then(() => {
      alert('Usuário atualizado com sucesso!');
      resetarFormulario();
      location.reload(); // recarrega os cards atualizados
    })
    .catch(() => alert('Erro ao editar usuário.'));
});

