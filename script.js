// --- Lógica da Calculadora ---
let curr = "0";
let prev = "";
let op = undefined;
let reset = false;

// Variáveis para armazenar os elementos do DOM
let currEl;
let prevEl;
let scaleDisplay;

function update() {
  if (currEl && prevEl) {
    // Para não exibir números longos demais no display
    const formattedCurr = formatNumberDisplay(curr);
    currEl.innerText = formattedCurr;
    prevEl.innerText = op ? `${prev.replace(".", ",")} ${op}` : "";
  }
}

// Nova função para formatar o número para exibição
function formatNumberDisplay(numberString) {
  // Converte a string interna (que usa ponto) para number e de volta para string, limitando casas
  let num = parseFloat(numberString);
  if (isNaN(num)) return "Erro";

  // Limita a 10 casas decimais para evitar notação científica em valores curtos
  let str = num.toFixed(10).replace(/(\.0+|0+)$/, ""); // Remove zeros finais

  // Se o número for muito grande, o JS já pode ter convertido para notação científica,
  // caso contrário, limita o tamanho total
  if (str.length > 15) {
    str = num.toPrecision(10); // Reduz o tamanho com precisão
  }

  return str.replace(".", ","); // Exibe a vírgula para o usuário
}

function append(num) {
  if (curr === "0" || reset) {
    curr = "";
    reset = false;
  }
  // Internamente, usamos ponto para cálculos
  if (num === "," && curr.includes(".")) return;
  if (num === ",") num = ".";

  // Limita a entrada de dígitos
  if (curr.replace(".", "").length >= 15) return;

  curr += num;
  update();
}

function choose(o) {
  if (curr === "" || curr === "." || curr === "-") return; // Evita operação com entrada incompleta
  if (prev !== "") compute();
  op = o;
  prev = curr;
  reset = true;
  update();
}

function compute() {
  let res;
  const p = parseFloat(prev);
  const c = parseFloat(curr);
  if (isNaN(p) || isNaN(c)) return;

  switch (op) {
    case "+":
      res = p + c;
      break;
    case "-":
      res = p - c;
      break;
    case "×":
      res = p * c;
      break;
    case "÷":
      res = c === 0 ? "Erro" : p / c;
      break;
    default:
      return;
  }

  if (res === "Erro") {
    curr = "Erro";
  } else {
    // Converte o resultado para string, usando ponto decimal interno
    curr = res.toString();
  }

  op = undefined;
  prev = "";
  update();
}

function clearAll() {
  curr = "0";
  prev = "";
  op = undefined;
  update();
}

function del() {
  curr = curr.toString().slice(0, -1);
  if (curr === "" || curr === "-") curr = "0";
  update();
}

// --- Funções de Configurações e Modais ---

function toggleTheme() {
  document.body.classList.toggle("dark-mode");
}

let currentScale = 1.0;

function adjustScale(delta) {
  currentScale += delta;
  // Limites: 80% a 140%
  if (currentScale < 0.8) currentScale = 0.8;
  if (currentScale > 1.4) currentScale = 1.4;

  document.documentElement.style.setProperty("--base-scale", currentScale);
  if (scaleDisplay) {
    scaleDisplay.innerText = Math.round(currentScale * 100) + "%";
  }
}

// Funções de modal renomeadas para a nova estrutura
function openSettings() {
  openModal("settingsModal");
}

function openHelp() {
  openModal("helpModal");
}

function openModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.style.display = "flex";
}

function closeModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.style.display = "none";
}

// Função clickOutside removida, pois a lógica foi movida para o DOMContentLoaded

// --- Inicialização e Event Listeners (Corrigido para usar IDs e data-*) ---

document.addEventListener("DOMContentLoaded", function () {
  // 1. Obtém os elementos do DOM agora que eles estão prontos
  currEl = document.getElementById("curr");
  prevEl = document.getElementById("prev");
  scaleDisplay = document.getElementById("scaleVal");

  // 2. Conexão de Botões

  // Botões de Modal/Interface
  // Note que no HTML eu usei openSettingsBtn e openHelpBtn, que agora estão conectados
  document
    .getElementById("openSettingsBtn")
    .addEventListener("click", () => openModal("settingsModal"));
  document
    .getElementById("openHelpBtn")
    .addEventListener("click", () => openModal("helpModal"));

  // Botões Principais da Calculadora
  document.getElementById("clearBtn").addEventListener("click", clearAll);
  document.getElementById("deleteBtn").addEventListener("click", del);
  document.getElementById("computeBtn").addEventListener("click", compute);

  // Botões Numéricos e Ponto Decimal (O ponto decimal é tratado como numérico no seu HTML)
  const numberButtons = document.querySelectorAll(".k-num");
  numberButtons.forEach((button) => {
    button.addEventListener("click", () => {
      // Usa o texto interno do botão (ex: '7', '0').
      // Se você adicionar um botão para o ponto (.), ele também será capturado.
      // O valor '0' no HTML do botão span: 0
      const value =
        button.innerText.trim() === "0" ? "0" : button.innerText.trim();
      append(value);
    });
  });

  // Botões de Operação
  const operatorButtons = document.querySelectorAll(".k-op");
  operatorButtons.forEach((button) => {
    // Usa o valor do atributo data-op (ex: '÷', '×')
    const operator = button.getAttribute("data-op");
    if (operator) {
      button.addEventListener("click", () => {
        choose(operator);
      });
    }
  });

  // 3. Conexão de Configurações (Acessibilidade)
  document
    .getElementById("toggleThemeBtn")
    .addEventListener("click", toggleTheme);

  // Botões de Aumentar/Diminuir Escala
  document.querySelectorAll(".btn-font").forEach((button) => {
    const delta = parseFloat(button.getAttribute("data-scale"));
    if (!isNaN(delta)) {
      button.addEventListener("click", () => {
        adjustScale(delta);
      });
    }
  });

  // 4. Conexão do Fechamento de Modais

  // Botões de fechar (✕, Concluído) - usando a classe .close-modal-btn
  document.querySelectorAll(".close-modal-btn").forEach((button) => {
    button.addEventListener("click", () => {
      const modalId = button.getAttribute("data-modal-id");
      closeModal(modalId);
    });
  });

  // Fechamento ao clicar fora (nos overlays) - usando a classe .modal-overlay
  document.querySelectorAll(".modal-overlay").forEach((modal) => {
    modal.addEventListener("click", (e) => {
      // Verifica se o clique foi diretamente no overlay (e não no cartão modal)
      if (e.target.classList.contains("modal-overlay")) {
        closeModal(modal.id);
      }
    });
  });

  // 5. Ajustes finais de inicialização
  adjustScale(0); // Inicializa o display da escala para 100%
  update(); // Inicializa o display da calculadora
});
