let carrinho = [];
const TAXA_ENTREGA = 2.0;

// ===== TOAST =====
function mostrarToast(mensagem) {
  const toast = document.getElementById("toast");
  if (!toast) return;

  toast.textContent = mensagem;
  toast.classList.add("show");

  clearTimeout(toast._timeout);
  toast._timeout = setTimeout(() => {
    toast.classList.remove("show");
  }, 2000);
}

// ===== CARRINHO =====
function adicionarCarrinho(produto, preco, btn) {
  const existente = carrinho.find((i) => i.produto === produto);

  if (existente) {
    existente.quantidade++;
  } else {
    carrinho.push({ produto, preco, quantidade: 1 });
  }

  atualizarCarrinho();
  mostrarToast(`${produto} adicionado ao carrinho!`);

  if (btn) {
    const textoOriginal = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-check"></i> Adicionado';
    btn.disabled = true;

    setTimeout(() => {
      btn.innerHTML = textoOriginal;
      btn.disabled = false;
    }, 1500);
  }
}

function removerItem(index) {
  if (index < 0 || index >= carrinho.length) return;

  carrinho[index].quantidade--;

  if (carrinho[index].quantidade <= 0) {
    carrinho.splice(index, 1);
  }

  atualizarCarrinho();
}

function limparCarrinho() {
  if (confirm("Tem certeza que deseja limpar o carrinho?")) {
    carrinho = [];
    atualizarCarrinho();
    mostrarToast("Carrinho limpo!");
  }
}

function atualizarCarrinho() {
  const lista = document.getElementById("listaCarrinho");
  const subtotalEl = document.getElementById("subtotal");
  const taxaEl = document.getElementById("taxa");
  const totalEl = document.getElementById("total");
  const retiradaEntregaEl = document.getElementById("retiradaEntrega");

  if (!lista || !subtotalEl || !taxaEl || !totalEl || !retiradaEntregaEl) return;

  const retiradaEntrega = retiradaEntregaEl.value;

  lista.innerHTML = "";

  if (carrinho.length === 0) {
    lista.innerHTML = '<p style="text-align:center;color:gray">Carrinho vazio</p>';
    subtotalEl.textContent = "0.00";
    taxaEl.textContent = "0.00";
    totalEl.textContent = "0.00";
    atualizarContadorCarrinho();
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
        <span>R$ ${(item.preco * item.quantidade).toFixed(2).replace(".", ",")}</span>
        <button onclick="removerItem(${i})" title="Remover item">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    `;

    lista.appendChild(div);
    subtotal += item.preco * item.quantidade;
  });

  const taxa = retiradaEntrega === "Entrega" ? TAXA_ENTREGA : 0;
  const total = subtotal + taxa;

  subtotalEl.textContent = subtotal.toFixed(2);
  taxaEl.textContent = taxa.toFixed(2);
  totalEl.textContent = total.toFixed(2);

  atualizarContadorCarrinho();
}

// ===== FINALIZAR PEDIDO =====
function finalizarPedidoOriginal() {
  if (carrinho.length === 0) {
    alert("Carrinho vazio!");
    return;
  }

  const nome = document.getElementById("nomeCliente")?.value.trim();
  if (!nome) {
    alert("Informe seu nome!");
    return;
  }

  const retiradaEntrega = document.getElementById("retiradaEntrega")?.value || "Entrega";
  const pagamento = document.getElementById("pagamento")?.value || "Dinheiro";
  const observacao = document.getElementById("observacao")?.value.trim() || "";

  const taxa = retiradaEntrega === "Entrega" ? TAXA_ENTREGA : 0;

  let mensagem = `*BANGKOK LANCHES - NOVO PEDIDO*%0A%0A`;
  mensagem += `*Cliente:* ${nome}%0A`;
  mensagem += `*Entrega:* ${retiradaEntrega}%0A`;
  mensagem += `*Pagamento:* ${pagamento}%0A%0A`;
  mensagem += `*Itens:*%0A`;

  let total = 0;

  carrinho.forEach((item) => {
    const subtotalItem = item.quantidade * item.preco;
    mensagem += `▪️ x${item.quantidade} ${item.produto} - R$ ${subtotalItem.toFixed(2)}%0A`;
    total += subtotalItem;
  });

  mensagem += `%0A*Subtotal:* R$ ${total.toFixed(2)}%0A`;
  mensagem += `*Taxa de entrega:* R$ ${taxa.toFixed(2)}%0A`;
  mensagem += `*Total geral:* R$ ${(total + taxa).toFixed(2)}%0A%0A`;
  mensagem += `*Observações:* ${observacao || "Nenhuma"}%0A`;

  const telefone = "5548996899468";
  window.open(`https://wa.me/${telefone}?text=${mensagem}`, "_blank");
}

function registrarVenda(total, itens) {
  const vendas = JSON.parse(localStorage.getItem("vendas")) || [];
  const agora = new Date();

  vendas.push({
    data: agora.toISOString(),
    total: total,
    itens: itens,
  });

  localStorage.setItem("vendas", JSON.stringify(vendas));
}

function finalizarPedido() {
  if (carrinho.length === 0) {
    alert("Carrinho vazio!");
    return;
  }

  const nome = document.getElementById("nomeCliente")?.value.trim();
  if (!nome) {
    alert("Informe seu nome!");
    return;
  }

  const retiradaEntrega = document.getElementById("retiradaEntrega")?.value || "Entrega";
  const taxa = retiradaEntrega === "Entrega" ? TAXA_ENTREGA : 0;

  const total =
    carrinho.reduce((sum, item) => sum + item.preco * item.quantidade, 0) + taxa;

  registrarVenda(
    total,
    carrinho.map((item) => ({
      produto: item.produto,
      qtd: item.quantidade,
      preco: item.preco,
    }))
  );

  finalizarPedidoOriginal();
}

// ===== MODAL REFRIGERANTE 2L =====
let botaoRefrigerante = null;

function abrirOpcoesRefrigerante(btn) {
  botaoRefrigerante = btn;
  const modal = document.getElementById("modalRefrigerante");
  if (modal) {
    modal.style.display = "flex";
  }
}

function fecharModal() {
  const modal = document.getElementById("modalRefrigerante");
  if (modal) {
    modal.style.display = "none";
  }

  botaoRefrigerante = null;

  document.querySelectorAll('input[name="sabor"]').forEach((radio) => {
    radio.checked = false;
  });
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

// ===== RENDERIZAÇÃO DOS PRODUTOS =====
function renderizarProdutos() {
  const container = document.getElementById("listaProdutos");
  if (!container || typeof produtos === "undefined") return;

  container.innerHTML = "";

  produtos.forEach((categoria) => {
    const titulo = document.createElement("div");
    titulo.classList.add("categoria");
    titulo.innerHTML = `<i class="${categoria.icone || ""}"></i> ${categoria.categoria}`;
    container.appendChild(titulo);

    categoria.itens.forEach((item) => {
      const div = document.createElement("div");
      div.classList.add("produto");

      let botaoHtml = "";

      if (item.tipo === "modalRefrigerante") {
        botaoHtml = `
          <button onclick="abrirOpcoesRefrigerante(this)">
            <i class="fas fa-plus"></i> Adicionar
          </button>
        `;
      } else {
        botaoHtml = `
          <button onclick="adicionarCarrinho('${item.nome.replace(/'/g, "\\'")}', ${item.preco}, this)">
            <i class="fas fa-plus"></i> Adicionar
          </button>
        `;
      }

      div.innerHTML = `
        <h3>${item.nome}</h3>
        <p class="descricao">${item.descricao}</p>
        <p>R$ ${item.preco.toFixed(2).replace(".", ",")}</p>
        ${botaoHtml}
      `;

      container.appendChild(div);
    });
  });
}

// ===== BOTÃO FLUTUANTE =====
function atualizarContadorCarrinho() {
  const contador = document.getElementById("contadorCarrinho");
  const botao = document.getElementById("botaoCarrinhoFlutuante");

  if (!contador || !botao) return;

  const totalItens = carrinho.reduce((sum, item) => sum + item.quantidade, 0);
  contador.textContent = totalItens;
  botao.style.display = totalItens > 0 ? "flex" : "none";
}

function rolarCarrinho() {
  const carrinhoEl = document.querySelector(".carrinho");
  if (carrinhoEl) {
    carrinhoEl.scrollIntoView({ behavior: "smooth" });
  }
}

// ===== INICIALIZAÇÃO =====
document.addEventListener("DOMContentLoaded", function () {
  renderizarProdutos();
  atualizarCarrinho();

  const retiradaEntrega = document.getElementById("retiradaEntrega");
  if (retiradaEntrega) {
    retiradaEntrega.addEventListener("change", atualizarCarrinho);
  }
});

// === BLOQUEIO DE ACESSO FORA DO HORÁRIO DE FUNCIONAMENTO ===
window.addEventListener("DOMContentLoaded", function() {
  const agora = new Date();
  const dia = agora.getDay(); // 0=Dom, 1=Seg, 2=Ter, 3=Qua, 4=Qui, 5=Sex, 6=Sáb
  const hora = agora.getHours();
  const minuto = agora.getMinutes();
 
  // Dias e horário de funcionamento: quarta (3) a sábado (6), 19:30–23:30
  const diaPermitido = dia >= 3 && dia <= 6;
  const horarioPermitido =
    (hora > 19 || (hora === 19 && minuto >= 30)) &&
    (hora < 22 || (hora === 22 && minuto <= 30));

  if (!(diaPermitido && horarioPermitido)) {
    const overlay = document.createElement("div");
    overlay.style.position = "fixed";
    overlay.style.top = "0";
    overlay.style.left = "0";
    overlay.style.width = "100%";
    overlay.style.height = "100%";
    overlay.style.background = "rgba(0,0,0,0.95)";
    overlay.style.color = "white";
    overlay.style.display = "flex";
    overlay.style.flexDirection = "column";
    overlay.style.alignItems = "center";
    overlay.style.justifyContent = "center";
    overlay.style.zIndex = "9999";
    overlay.style.textAlign = "center";
    overlay.style.padding = "20px";
    overlay.innerHTML = `
      <h1>⏰ Estamos fechados!</h1>
      <p>Nosso horário de funcionamento é:</p>
      <p><strong>Quarta a Sábado, das 19h30 às 22h30</strong></p>
      <p>Volte nesse horário para fazer seu pedido 😋</p>
    `;
    document.body.appendChild(overlay);
  }
});
