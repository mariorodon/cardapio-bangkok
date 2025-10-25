let carrinho = [];
const TAXA_ENTREGA = 2.00;

function adicionarCarrinho(produto, preco, btn) {
  const existente = carrinho.find(i => i.produto === produto);
  if (existente) existente.quantidade++;
  else carrinho.push({ produto, preco, quantidade: 1 });

  atualizarCarrinho();

  // feedback visual
  if (btn) {
    btn.innerHTML = '<i class="fas fa-check"></i> Adicionado';
    btn.disabled = true;
    setTimeout(() => {
      btn.innerHTML = '<i class="fas fa-plus"></i> Adicionar';
      btn.disabled = false;
    }, 900);
  }
}

function removerItem(index) {
  if (index < 0 || index >= carrinho.length) return;
  carrinho[index].quantidade--;
  if (carrinho[index].quantidade <= 0) carrinho.splice(index, 1);
  atualizarCarrinho();
}

function limparCarrinho() {
  if (confirm("Tem certeza que deseja limpar o carrinho?")) {
    carrinho = [];
    atualizarCarrinho();
  }
}

function atualizarCarrinho() {
  const lista = document.getElementById("listaCarrinho");
  const subtotalEl = document.getElementById("subtotal");
  const taxaEl = document.getElementById("taxa");
  const totalEl = document.getElementById("total");
  const retiradaEntrega = document.getElementById("retiradaEntrega").value;

  lista.innerHTML = "";
  if (carrinho.length === 0) {
    lista.innerHTML = '<p style="text-align:center;color:gray">Carrinho vazio</p>';
    subtotalEl.textContent = "0.00";
    taxaEl.textContent = "0.00";
    totalEl.textContent = "0.00";
    return;
  }

  let subtotal = 0;
  carrinho.forEach((item, i) => {
    const div = document.createElement("div");
    div.className = "item-carrinho";
    div.innerHTML = `
      <div class="item-info">
        <span class="quantidade">${item.quantidade}×</span>
        <span class="nome">${item.produto}</span>
      </div>
      <div class="item-preco">
        <span>R$ ${(item.preco * item.quantidade).toFixed(2)}</span>
        <button onclick="removerItem(${i})" title="Remover item"><i class="fas fa-trash"></i></button>
      </div>
    `;
    lista.appendChild(div);
    subtotal += item.preco * item.quantidade;
  });

  const taxa = (retiradaEntrega === "Entrega") ? TAXA_ENTREGA : 0;
  const total = subtotal + taxa;

  subtotalEl.textContent = subtotal.toFixed(2);
  taxaEl.textContent = taxa.toFixed(2);
  totalEl.textContent = total.toFixed(2);
}

document.getElementById("retiradaEntrega").addEventListener("change", atualizarCarrinho);

function finalizarPedido() {
  if (carrinho.length === 0) return alert("Carrinho vazio!");

  const nome = document.getElementById("nomeCliente").value.trim();
  if (!nome) return alert("Informe seu nome!");

  const retiradaEntrega = document.getElementById("retiradaEntrega").value;
  const pagamento = document.getElementById("pagamento").value;
  const observacao = document.getElementById("observacao").value.trim();

  const taxa = (retiradaEntrega === "Entrega") ? TAXA_ENTREGA : 0;
  let mensagem = `*BANGKOK LANCHES - NOVO PEDIDO*%0A%0A`;
  mensagem += `*Cliente:* ${nome}%0A`;
  mensagem += `*Entrega:* ${retiradaEntrega}%0A`;
  mensagem += `*Pagamento:* ${pagamento}%0A%0A*Itens:*%0A`;

  let total = 0;
  carrinho.forEach(i => {
    mensagem += `▪️ x${i.quantidade}  ${i.produto} - R$ ${(i.quantidade * i.preco).toFixed(2)}%0A`;
    total += i.preco * i.quantidade;
  });

  mensagem += `%0A*Subtotal:* R$ ${total.toFixed(2)}%0A`;
  mensagem += `*Taxa de entrega:* R$ ${taxa.toFixed(2)}%0A`;
  mensagem += `*Total geral:* R$ ${(total + taxa).toFixed(2)}%0A%0A`;
  mensagem += `*Observações:* ${observacao || "Nenhuma"}%0A`;

  const telefone = "5548996899468";
  window.open(`https://wa.me/${telefone}?text=${mensagem}`, "_blank");
}

// ==== MODAL DE OPÇÕES DE REFRIGERANTE 2 Litros ====
let botaoRefrigerante = null;

function abrirOpcoesRefrigerante(btn) {
  botaoRefrigerante = btn;
  document.getElementById("modalRefrigerante").style.display = "flex";
}

function fecharModal() {
  document.getElementById("modalRefrigerante").style.display = "none";
  botaoRefrigerante = null;
  document.querySelectorAll('input[name="sabor"]').forEach(r => r.checked = false);
}

function confirmarRefrigerante() {
  const saborSelecionado = document.querySelector('input[name="sabor"]:checked');
  if (!saborSelecionado) {
    alert("Escolha um sabor antes de confirmar!");
    return;
  }

  const sabor = saborSelecionado.value;
  const preco = parseFloat(saborSelecionado.dataset.preco);

  adicionarCarrinho(`Refrigerante 2L (${sabor})`, preco, botaoRefrigerante);
  fecharModal();
}

// ===== SISTEMA DE REGISTRO DE VENDAS =====
function registrarVenda(total, itens) {
  const vendas = JSON.parse(localStorage.getItem("vendas")) || [];
  const agora = new Date();
  vendas.push({
    data: agora.toISOString(),
    total: total,
    itens: itens
  });
  localStorage.setItem("vendas", JSON.stringify(vendas));
}

const oldFinalizarPedido = finalizarPedido;
finalizarPedido = function () {
  if (carrinho.length === 0) return alert("Carrinho vazio!");
  const nome = document.getElementById("nomeCliente").value.trim();
  if (!nome) return alert("Informe seu nome!");

  const retiradaEntrega = document.getElementById("retiradaEntrega").value;
  const taxa = (retiradaEntrega === "Entrega") ? TAXA_ENTREGA : 0;
  let total = carrinho.reduce((sum, i) => sum + i.preco * i.quantidade, 0) + taxa;

  // salva a venda localmente
  registrarVenda(total, carrinho.map(i => ({ produto: i.produto, qtd: i.quantidade, preco: i.preco })));

  // chama o original
  oldFinalizarPedido();
};

// ==== BOTÃO FLUTUANTE DO CARRINHO ====
function atualizarContadorCarrinho() {
  const contador = document.getElementById("contadorCarrinho");
  if (!contador) return;
  const totalItens = carrinho.reduce((sum, i) => sum + i.quantidade, 0);
  contador.textContent = totalItens;
  document.getElementById("botaoCarrinhoFlutuante").style.display =
    totalItens > 0 ? "flex" : "none";
}

function rolarCarrinho() {
  document.querySelector(".carrinho").scrollIntoView({ behavior: "smooth" });
}

const oldAtualizarCarrinho2 = atualizarCarrinho;
atualizarCarrinho = function() {
  oldAtualizarCarrinho2();
  atualizarContadorCarrinho();
};

atualizarContadorCarrinho();


atualizarCarrinho();
