let stockProductos =
  JSON.parse(localStorage.getItem('stockFAUSZA')) || {

    "Boca Juniors 25/26": {
      S: 3,
      M: 5,
      L: 2,
      XL: 1
    },

    "River Plate 25/26": {
      S: 4,
      M: 4,
      L: 3,
      XL: 2
    },

    "Argentina Campeón": {
      S: 2,
      M: 2,
      L: 1,
      XL: 0
    },

    "Racing Club 25/26": {
      S: 5,
      M: 3,
      L: 2,
      XL: 1
    },
"Camiseta Atomik Titular San Lorenzo de Almagro 2026": {
  S: 3,
  M: 2,
  L: 2,
  XL: 1
},

    "Independiente 25/26": {
      S: 2,
      M: 1,
      L: 0,
      XL: 1
    }

};

const cards = document.querySelectorAll('.card');

let talleSeleccionado = "";

let carrito =
  JSON.parse(localStorage.getItem('carritoFAUSZA')) || [];

let usuarioLogeado =
  localStorage.getItem('usuarioFAUSZA') || "";

actualizarCarrito();

if(usuarioLogeado){

  document.getElementById('nombreUsuario').innerText =
    usuarioLogeado;

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

  let stock =
    stockProductos[producto][talleSeleccionado];

  if(stock <= 0){

    alert("Sin stock para este talle");

    return;

  }

  stockProductos[producto][talleSeleccionado]--;
  localStorage.setItem(
  'stockFAUSZA',
  JSON.stringify(stockProductos)
);

  carrito.push({
    producto,
    talle: talleSeleccionado
  });

  localStorage.setItem(
    'carritoFAUSZA',
    JSON.stringify(carrito)
  );

  actualizarCarrito();

  actualizarStockVisual();

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

  const producto =
    carrito[index].producto;

  const talle =
    carrito[index].talle;

  stockProductos[producto][talle]++;
  localStorage.setItem(
  'stockFAUSZA',
  JSON.stringify(stockProductos)
);

  carrito.splice(index, 1);

  localStorage.setItem(
    'carritoFAUSZA',
    JSON.stringify(carrito)
  );

  actualizarCarrito();

  actualizarStockVisual();

}

function actualizarStockVisual(){

  const cards =
    document.querySelectorAll('.card');

  cards.forEach(card => {

    const titulo =
      card.querySelector('h2').innerText;

    const boton =
      card.querySelector('.btn');

    let totalStock = 0;

    const talles =
      stockProductos[titulo];

    for(let talle in talles){

      totalStock += talles[talle];

    }

    let stockTexto =
      card.querySelector('.stock');

    if(!stockTexto){

      stockTexto =
        document.createElement('p');

      stockTexto.classList.add('stock');

      boton.before(stockTexto);

    }

    if(totalStock <= 0){

      stockTexto.innerText = "SIN STOCK";

      stockTexto.style.color = "red";

      boton.disabled = true;

      boton.innerText = "Sin stock";

      boton.style.opacity = "0.5";

    } else {

      stockTexto.innerText =
        "Stock disponible: " + totalStock;

      stockTexto.style.color = "#00ff88";

      boton.disabled = false;

      boton.innerText = "Comprar ahora";

      boton.style.opacity = "1";

    }

  });

}

function toggleCart(){

  document
    .getElementById('cartPanel')
    .classList.toggle('open');

}

function login(){

  const usuario = prompt('Ingresá tu nombre');

  if(!usuario) return;

  const direccion = prompt(
    'Ingresá tu dirección.\n\nEjemplo:\nAv. Rivadavia 1234, casa blanca con portón negro'
  );

  if(!direccion) return;

  usuarioLogeado = usuario;

  localStorage.setItem(
    'usuarioFAUSZA',
    usuario
  );

  localStorage.setItem(
    'direccionFAUSZA',
    direccion
  );

  document.getElementById('nombreUsuario').innerText =
    usuario;

  alert('Bienvenido ' + usuario);

}

function enviarWhatsApp(){

  if(carrito.length === 0){

    alert("Tu carrito está vacío");

    return;

  }

  const direccion =
    localStorage.getItem('direccionFAUSZA') || "";

  let mensaje =
    "Hola FAUSZA, quiero comprar:%0A%0A";

  carrito.forEach(item => {

    mensaje +=
      `• ${item.producto} - Talle ${item.talle}%0A`;

  });

  mensaje +=
    `%0A%0A👤 Cliente: ${usuarioLogeado}`;

  mensaje +=
    `%0A📍 Dirección: ${direccion}`;

  const numero = "5491125012219";

  window.open(
    `https://wa.me/${numero}?text=${mensaje}`,
    '_blank'
  );

}

actualizarStockVisual();
function abrirAdmin(){

  let password =
    prompt("Contraseña admin");

  if(password !== "Martin2022"){
    alert("Contraseña incorrecta");
    return;
  }

  let producto =
    prompt("Nombre exacto del producto");

  if(!stockProductos[producto]){
    alert("Producto no encontrado");
    return;
  }

  let talle =
    prompt("Talle: S M L XL");

  let nuevoStock =
    parseInt(prompt("Nuevo stock"));

  stockProductos[producto][talle] =
    nuevoStock;

  localStorage.setItem(
    'stockFAUSZA',
    JSON.stringify(stockProductos)
  );

  actualizarStockVisual();

  alert("Stock actualizado");

}
