
const $ = selector => document.querySelector(selector);
const money = amount => "AED " + amount.toLocaleString("en-US");

let activeFilter = "All";
const cart = {};


function characterArt(figure) {
  // Show a real product photo if one is provided.
  if (figure.image) {
    return `
      <img
        class="product-image"
        src="${figure.image}"
        alt="${figure.name} anime figure"
      >`;
  }

  // Otherwise, keep the existing CSS character.
  return `
    <div class="figure-art" style="--hair:${figure.hair};--coat:${figure.coat}">
      <div class="figure-hair"></div>
      <div class="figure-face"></div>
      <div class="figure-eyes"></div>
      <div class="figure-body"></div>
      <div class="figure-coat"></div>
      <div class="figure-base"></div>
    </div>`;
}

function renderProducts() {
  const query = $("#search").value.trim().toLowerCase();

  const filtered = figures.filter(figure => {
    const matchesFilter =
      activeFilter === "All" ||
      (activeFilter === "Under AED 200"
        ? figure.price < 200
        : figure.tag === activeFilter);

    const matchesSearch =
      `${figure.name} ${figure.series} ${figure.tag}`
        .toLowerCase().includes(query);

    return matchesFilter && matchesSearch;
  });

  $("#products").innerHTML = filtered.map(figure => `
    <article class="product">
      <div class="product-art" style="--tone:${figure.tone}">
        <span class="tag">${figure.tag}</span>
        <button class="add-button" data-add="${figure.id}">
          + Add
        </button>
        ${characterArt(figure)}
      </div>
      <div class="product-info">
        <span class="series">${figure.series}</span>
        <h3>${figure.name}</h3>
        <div class="product-bottom">
          <strong>${money(figure.price)}</strong>
          <span>${figure.emoji}</span>
        </div>
      </div>
    </article>
  `).join("");

  $("#empty").hidden = filtered.length > 0;

  document.querySelectorAll("[data-filter]").forEach(button => {
    button.classList.toggle(
      "active",
      button.dataset.filter === activeFilter
    );
  });
}

function updateCart() {
  const entries = Object.entries(cart).filter(([, quantity]) => quantity > 0);
  const count = entries.reduce((sum, [, quantity]) => sum + quantity, 0);

  $("#cartCount").textContent = count;

  let total = 0;

  $("#cartItems").innerHTML = entries.map(([id, quantity]) => {
    const figure = figures.find(item => item.id === Number(id));
    total += figure.price * quantity;

    return `
      <div class="cart-row">
        <span class="cart-emoji" style="background:${figure.tone}">
          ${figure.emoji}
        </span>
        <div class="cart-description">
          <strong>${figure.name}</strong>
          <small>${money(figure.price)} each</small>
          <div class="quantity">
            <button data-qty="${id}" data-delta="-1">−</button>
            <span>${quantity}</span>
            <button data-qty="${id}" data-delta="1">+</button>
          </div>
        </div>
        <strong>${money(figure.price * quantity)}</strong>
      </div>`;
  }).join("");

  if (!entries.length) {
    $("#cartItems").innerHTML =
      '<p class="empty">Your bag is waiting for its first figure ✦</p>';
  }

  $("#subtotal").textContent = money(total);
}

function showToast(message) {
  $("#toast").textContent = message;
  $("#toast").classList.add("visible");
  setTimeout(() => $("#toast").classList.remove("visible"), 2200);
}

$("#products").addEventListener("click", event => {
  const button = event.target.closest("[data-add]");
  if (!button) return;

  const id = Number(button.dataset.add);
  cart[id] = (cart[id] || 0) + 1;
  updateCart();

  const figure = figures.find(item => item.id === id);
  showToast(`${figure.name} added to your bag!`);
});

$("#filters").addEventListener("click", event => {
  const button = event.target.closest("[data-filter]");
  if (!button) return;

  activeFilter = button.dataset.filter;
  renderProducts();
});

$("#search").addEventListener("input", renderProducts);

$("#cartOpen").addEventListener("click", () => {
  $("#overlay").classList.add("open");
});

$("#cartClose").addEventListener("click", () => {
  $("#overlay").classList.remove("open");
});

$("#overlay").addEventListener("click", event => {
  if (event.target === $("#overlay")) {
    $("#overlay").classList.remove("open");
  }
});

$("#cartItems").addEventListener("click", event => {
  const button = event.target.closest("[data-qty]");
  if (!button) return;

  const id = Number(button.dataset.qty);
  cart[id] = (cart[id] || 0) + Number(button.dataset.delta);

  if (cart[id] <= 0) delete cart[id];
  updateCart();
});

$("#checkout").addEventListener("click", () => {
  showToast("Demo checkout — no payment taken.");
});

renderProducts();
updateCart();
