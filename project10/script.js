const produtos = [
    { id: 1, nome: 'Produto A', preco: 100, descricao: 'Breve A', descricaoLonga: 'Descrição longa do Produto A', imagem: 'https://via.placeholder.com/150' },
    { id: 2, nome: 'Produto B', preco: 200, descricao: 'Breve B', descricaoLonga: 'Descrição longa do Produto B', imagem: 'https://via.placeholder.com/150' },
  ];
  
  let carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
  
  function salvarCarrinho() {
    localStorage.setItem('carrinho', JSON.stringify(carrinho));
  }
  
  if (document.getElementById('produtos-container')) {
    const container = document.getElementById('produtos-container');
    produtos.forEach(prod => {
      const card = document.createElement('div');
      card.className = 'card';
      card.innerHTML = `
        <img src="${prod.imagem}" alt="${prod.nome}" />
        <h3>${prod.nome}</h3>
        <p>${prod.descricao}</p>
        <p>R$ ${prod.preco.toFixed(2)}</p>
        <button onclick="window.location.href='detalhes.html?id=${prod.id}'">Select</button>
      `;
      container.appendChild(card);
    });
  }
  
  if (document.getElementById('detalhes-container')) {
    const params = new URLSearchParams(window.location.search);
    const id = parseInt(params.get('id'));
    const produto = produtos.find(p => p.id === id);
    if (produto) {
      const container = document.getElementById('detalhes-container');
      container.innerHTML = `
        <div class="card">
          <img src="${produto.imagem}" alt="${produto.nome}" />
          <h2>${produto.nome}</h2>
          <p><strong>ID:</strong> ${produto.id}</p>
          <p><strong>Preço:</strong> R$ ${produto.preco.toFixed(2)}</p>
          <p>${produto.descricaoLonga}</p>
          <button onclick="addToCart(${produto.id})">Add to Cart</button>
          <button onclick="window.location.href='produtos.html'">See More Products</button>
        </div>
      `;
    }
  }
  
  function addToCart(id) {
    const produto = produtos.find(p => p.id === id);
    const item = carrinho.find(i => i.id === id);
    if (item) {
      item.quantidade++;
    } else {
      carrinho.push({ ...produto, quantidade: 1 });
    }
    salvarCarrinho();
    alert('Produto adicionado ao carrinho!');
  }
  
  if (document.getElementById('carrinho-container')) {
    const container = document.getElementById('carrinho-container');
    let total = 0;
    const lista = document.createElement('div');
    carrinho.forEach((item, index) => {
      const subtotal = item.quantidade * item.preco;
      total += subtotal;
      const produtoDiv = document.createElement('div');
      produtoDiv.innerHTML = `
        <p><strong>ID:</strong> ${item.id}</p>
        <p><strong>Nome:</strong> ${item.nome}</p>
        <p><strong>Preço:</strong> R$ ${item.preco.toFixed(2)}</p>
        <p><strong>Quantidade:</strong> <input type='number' min='1' value='${item.quantidade}' onchange='atualizarQuantidade(${index}, this.value)' /></p>
        <hr />
      `;
      lista.appendChild(produtoDiv);
    });
    container.appendChild(lista);
    const totalDiv = document.createElement('p');
    totalDiv.id = 'total';
    totalDiv.innerHTML = `<strong>Total: R$ ${total.toFixed(2)}</strong>`;
    container.appendChild(totalDiv);
    container.innerHTML += `
      <button onclick="finalizarPedido()">Place Order</button>
      <button onclick="cancelarPedido()">Cancel Order</button>
      <button onclick="window.location.href='produtos.html'">See More Products</button>
    `;
  }
  
  function atualizarQuantidade(index, novaQtd) {
    carrinho[index].quantidade = parseInt(novaQtd);
    salvarCarrinho();
    location.reload();
  }
  
  function finalizarPedido() {
    const numeroPedido = Math.floor(Math.random() * 1000000);
    alert(`Pedido confirmado! Número: ${numeroPedido}`);
    carrinho = [];
    salvarCarrinho();
    location.reload();
  }
  
  function cancelarPedido() {
    carrinho = [];
    salvarCarrinho();
    location.reload();
  }
  