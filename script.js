const cards = document.querySelectorAll('.card');

let talleSeleccionado = "";

let carrito =
  JSON.parse(localStorage.getItem('carritoFAUSZA')) || [];

let usuarioLogeado =
  localStorage.getItem('usuarioFAUSZA') || "";

actualizarCarrito();

if(usuarioLogeado){

  document.getElementById('loginBtn').innerText =
    "👤 " + usuarioLogeado;

}

window.addEventListener('scroll', () => {

  cards.forEach(card => {

    const top = card.getBoundingClientRect().top;

    if(top < window.innerHeight - 100){
      card.classList.add('show');
    }

  });

});

function abrirModal(nombre, precio){

  document.getElementById('modal').style.display = 'flex';

  document.getElementById('modalTitulo').innerText = nombre;

  document.getElementById('modalPrecio').innerText = precio;

  talleSeleccionado = "";

  document.querySelectorAll('.talles button').forEach(btn => {

    btn.style.background = "#1a1a1a";
    btn.style.border = "1px solid #333";

  });

}

function cerrarModal(){

  document.getElementById('modal').style.display = 'none';

}

const botonesTalles =
  document.querySelectorAll('.talles button');

botonesTalles.forEach(btn => {

  btn.addEventListener('click', () => {

    botonesTalles.forEach(b => {

      b.style.background = "#1a1a1a";
      b.style.border = "1px solid #333";

    });

    btn.style.background = "#4da3ff";
    btn.style.border = "1px solid #4da3ff";

    talleSeleccionado = btn.innerText;

  });

});

function agregarAlCarrito(){

  if(talleSeleccionado === ""){

    alert("Seleccioná un talle");

    return;

  }

  const producto =
    document.getElementById('modalTitulo').innerText;

  carrito.push({
    producto,
    talle: talleSeleccionado
  });

  localStorage.setItem(
    'carritoFAUSZA',
    JSON.stringify(carrito)
  );

  actualizarCarrito();

  cerrarModal();

}

function actualizarCarrito(){

  document.getElementById('cartCount').innerText =
    carrito.length;

  const cartItems =
    document.getElementById('cartItems');

  cartItems.innerHTML = "";

  carrito.forEach((item, index) => {

    cartItems.innerHTML += `
      <div class="cart-item">

        <strong>${item.producto}</strong><br>

        Talle: ${item.talle}

        <br><br>

        <button
          class="btn-eliminar"
          onclick="eliminarProducto(${index})">

          Eliminar

        </button>

      </div>
    `;

  });

}

function eliminarProducto(index){

  carrito.splice(index, 1);

  localStorage.setItem(
    'carritoFAUSZA',
    JSON.stringify(carrito)
  );

  actualizarCarrito();

}

function toggleCart(){

  document
    .getElementById('cartPanel')
    .classList.toggle('open');

}

function login(){

  const usuario = prompt('Ingresá tu nombre');

  if(usuario){

    usuarioLogeado = usuario;

    localStorage.setItem(
      'usuarioFAUSZA',
      usuario
    );

    document.getElementById('loginBtn').innerText =
      "👤 " + usuario;

    alert('Bienvenido ' + usuario);

  }

}

function enviarWhatsApp(){

  if(carrito.length === 0){

    alert("Tu carrito está vacío");

    return;

  }

  let mensaje =
    "Hola FAUSZA, quiero comprar:%0A%0A";

  carrito.forEach(item => {

    mensaje +=
      `• ${item.producto} - Talle ${item.talle}%0A`;

  });

  mensaje +=
    `%0A%0A👤 Cliente: ${usuarioLogeado}`;

  const numero = "5491125012219";

  window.open(
    `https://wa.me/${numero}?text=${mensaje}`,
    '_blank'
  );

}
