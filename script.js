const stockInicial = {
  "Boca Juniors 25/26": { S: 3, M: 5, L: 2, XL: 1 },
  "River Plate 25/26": { S: 4, M: 4, L: 3, XL: 2 },
  "Argentina Campeon": { S: 2, M: 2, L: 1, XL: 0 },
  "Racing Club 25/26": { S: 5, M: 3, L: 2, XL: 1 },
  "Camiseta Atomik Titular San Lorenzo de Almagro 2026": { S: 3, M: 2, L: 2, XL: 1 },
  "Independiente 25/26": { S: 2, M: 1, L: 0, XL: 1 }
};

let stockProductos = cargarStock();
let talleSeleccionado = "";
let cantidadSeleccionada = 1;
let carrito = JSON.parse(localStorage.getItem("carritoFAUSZA")) || [];
let usuarioLogeado = localStorage.getItem("usuarioFAUSZA") || "";
let adminAutenticado = false;

const cards = document.querySelectorAll(".card");
const botonesTalles = document.querySelectorAll(".talles button");

document.addEventListener("DOMContentLoaded", () => {
  actualizarCarrito();
  actualizarStockVisual();
  cargarDatosUsuario();
  cargarProductosAdmin();
  inicializarAccesoAdmin();
  inicializarMensajeWhatsApp();
  observarCards();
});

function cargarStock(){
  const guardado = JSON.parse(localStorage.getItem("stockFAUSZA")) || {};

  Object.keys(guardado).forEach(producto => {
    if(producto.includes("Argentina") && producto !== "Argentina Campeon"){
      guardado["Argentina Campeon"] = guardado[producto];
      delete guardado[producto];
    }
  });

  return {
    ...stockInicial,
    ...guardado
  };
}

function persistirStock(){
  localStorage.setItem("stockFAUSZA", JSON.stringify(stockProductos));
}

function observarCards(){
  const mostrarCard = () => {
    cards.forEach(card => {
      const top = card.getBoundingClientRect().top;

      if(top < window.innerHeight - 80){
        card.classList.add("show");
      }
    });
  };

  mostrarCard();
  window.addEventListener("scroll", mostrarCard);
}

function toggleMenu(){
  document.getElementById("mainNav").classList.toggle("open");
}

function abrirModal(nombre, precio){
  if(!usuarioTieneDatos()){
    mostrarNotificacion("Inicia sesion para poder comprar.", "error");
    abrirLogin();
    return;
  }

  const stock = stockProductos[nombre];

  if(!stock){
    mostrarNotificacion("No se encontro stock para este producto.", "error");
    return;
  }

  document.getElementById("modal").style.display = "flex";
  document.getElementById("modalTitulo").innerText = nombre;
  document.getElementById("modalPrecio").innerText = precio;
  actualizarStockTalles(nombre);

  talleSeleccionado = "";
  cantidadSeleccionada = 1;
  document.getElementById("cantidad").innerText = "1";
  botonesTalles.forEach(btn => btn.classList.remove("selected"));
}

function cerrarModal(){
  document.getElementById("modal").style.display = "none";
}

function actualizarStockTalles(nombre){
  const stock = stockProductos[nombre];
  document.getElementById("stockS").innerText = `S: ${stock.S} disponibles`;
  document.getElementById("stockM").innerText = `M: ${stock.M} disponibles`;
  document.getElementById("stockL").innerText = `L: ${stock.L} disponibles`;
  document.getElementById("stockXL").innerText = `XL: ${stock.XL} disponibles`;
}

botonesTalles.forEach(btn => {
  btn.addEventListener("click", () => {
    botonesTalles.forEach(boton => boton.classList.remove("selected"));
    btn.classList.add("selected");
    talleSeleccionado = btn.innerText;
  });
});

function cambiarCantidad(valor){
  cantidadSeleccionada += valor;

  if(cantidadSeleccionada < 1){
    cantidadSeleccionada = 1;
  }

  document.getElementById("cantidad").innerText = cantidadSeleccionada;
}

function agregarAlCarrito(){
  if(!usuarioTieneDatos()){
    mostrarNotificacion("Inicia sesion para poder agregar productos.", "error");
    abrirLogin();
    return;
  }

  if(talleSeleccionado === ""){
    mostrarNotificacion("Selecciona un talle antes de continuar.", "error");
    return;
  }

  const producto = document.getElementById("modalTitulo").innerText;
  const stock = stockProductos[producto][talleSeleccionado];

  if(stock < cantidadSeleccionada){
    mostrarNotificacion("No hay suficiente stock para esa cantidad.", "error");
    return;
  }

  stockProductos[producto][talleSeleccionado] -= cantidadSeleccionada;
  persistirStock();

  for(let i = 0; i < cantidadSeleccionada; i++){
    carrito.push({ producto, talle: talleSeleccionado });
  }

  localStorage.setItem("carritoFAUSZA", JSON.stringify(carrito));
  actualizarCarrito();
  actualizarStockVisual();
  mostrarNotificacion("Producto agregado al carrito.");
  cerrarModal();
}

function actualizarCarrito(){
  document.getElementById("cartCount").innerText = carrito.length;

  const cartItems = document.getElementById("cartItems");
  const emptyCartBtn = document.getElementById("emptyCartBtn");
  cartItems.innerHTML = "";

  if(carrito.length === 0){
    cartItems.innerHTML = '<p class="cart-empty">Todavia no agregaste productos.</p>';
    emptyCartBtn.style.display = "none";
    return;
  }

  emptyCartBtn.style.display = "block";

  carrito.forEach((item, index) => {
    cartItems.innerHTML += `
      <div class="cart-item">
        <strong>${item.producto}</strong><br>
        Talle: ${item.talle}
        <br>
        <button class="btn-eliminar" onclick="eliminarProducto(${index})">Eliminar</button>
      </div>
    `;
  });
}

function eliminarProducto(index){
  const producto = carrito[index].producto;
  const talle = carrito[index].talle;

  if(stockProductos[producto] && stockProductos[producto][talle] !== undefined){
    stockProductos[producto][talle]++;
    persistirStock();
  }

  carrito.splice(index, 1);
  localStorage.setItem("carritoFAUSZA", JSON.stringify(carrito));
  actualizarCarrito();
  actualizarStockVisual();
  mostrarNotificacion("Producto eliminado del carrito.");
}

function vaciarCarrito(){
  if(carrito.length === 0){
    mostrarNotificacion("Tu carrito ya esta vacio.", "error");
    return;
  }

  carrito.forEach(item => {
    const { producto, talle } = item;

    if(stockProductos[producto] && stockProductos[producto][talle] !== undefined){
      stockProductos[producto][talle]++;
    }
  });

  carrito = [];
  persistirStock();
  localStorage.setItem("carritoFAUSZA", JSON.stringify(carrito));
  actualizarCarrito();
  actualizarStockVisual();
  mostrarNotificacion("Carrito vaciado correctamente.");
}

function actualizarStockVisual(){
  document.querySelectorAll(".card").forEach(card => {
    const titulo = card.querySelector("h2").innerText.trim();
    const boton = card.querySelector(".btn");
    const stockTexto = card.querySelector(".stock");
    const talles = stockProductos[titulo];

    if(!talles){
      return;
    }

    const totalStock = Object.values(talles).reduce((total, cantidad) => total + Number(cantidad), 0);

    if(totalStock <= 0){
      stockTexto.innerText = "SIN STOCK";
      stockTexto.classList.add("sin-stock");
      boton.disabled = true;
      boton.innerText = "Sin stock";
    } else {
      stockTexto.innerText = `Stock disponible: ${totalStock}`;
      stockTexto.classList.remove("sin-stock");
      boton.disabled = false;
      boton.innerText = "Comprar ahora";
    }
  });
}

function toggleCart(){
  document.getElementById("cartPanel").classList.toggle("open");
}

function abrirLogin(){
  document.getElementById("loginModal").style.display = "flex";
  document.getElementById("loginNombre").value = localStorage.getItem("usuarioFAUSZA") || "";
  document.getElementById("loginDireccion").value = localStorage.getItem("direccionFAUSZA") || "";
}

function cerrarLogin(){
  document.getElementById("loginModal").style.display = "none";
}

function guardarLogin(event){
  event.preventDefault();

  const usuario = document.getElementById("loginNombre").value.trim();
  const direccion = document.getElementById("loginDireccion").value.trim();

  if(!usuario || !direccion){
    mostrarNotificacion("Completa tu nombre y direccion.", "error");
    return;
  }

  usuarioLogeado = usuario;
  localStorage.setItem("usuarioFAUSZA", usuario);
  localStorage.setItem("direccionFAUSZA", direccion);
  document.getElementById("nombreUsuario").innerText = usuario;
  cerrarLogin();
  mostrarNotificacion(`Datos guardados. Bienvenido ${usuario}.`);
}

function cargarDatosUsuario(){
  if(usuarioLogeado){
    document.getElementById("nombreUsuario").innerText = usuarioLogeado;
  }
}

function usuarioTieneDatos(){
  const usuario = localStorage.getItem("usuarioFAUSZA") || "";
  const direccion = localStorage.getItem("direccionFAUSZA") || "";

  return usuario.trim() !== "" && direccion.trim() !== "";
}

function enviarWhatsApp(){
  if(!usuarioTieneDatos()){
    mostrarNotificacion("Inicia sesion para finalizar la compra.", "error");
    abrirLogin();
    return;
  }

  if(carrito.length === 0){
    mostrarNotificacion("Tu carrito esta vacio.", "error");
    return;
  }

  const direccion = localStorage.getItem("direccionFAUSZA") || "";
  const cliente = usuarioLogeado || "Sin registrar";

  let mensaje = "Hola FAUSZA, quiero comprar:%0A%0A";

  carrito.forEach(item => {
    mensaje += `- ${item.producto} - Talle ${item.talle}%0A`;
  });

  mensaje += `%0ACliente: ${cliente}`;
  mensaje += `%0ADireccion: ${direccion || "Sin direccion cargada"}`;

  window.open(`https://wa.me/5491125012219?text=${mensaje}`, "_blank");
}

function inicializarMensajeWhatsApp(){
  const whatsappHint = document.getElementById("whatsappHint");

  if(!whatsappHint){
    return;
  }

  const mensajes = [
    "Tu consulta no molesta",
    "Para consultar toca WhatsApp",
    "Te ayudamos por WhatsApp"
  ];
  let indiceMensaje = 0;

  const mostrarMensaje = () => {
    whatsappHint.innerText = mensajes[indiceMensaje];
    whatsappHint.classList.add("show");
    indiceMensaje = (indiceMensaje + 1) % mensajes.length;

    setTimeout(() => {
      whatsappHint.classList.remove("show");
    }, 4200);
  };

  setTimeout(mostrarMensaje, 1800);
  setInterval(mostrarMensaje, 12000);
}

function abrirAdmin(){
  document.getElementById("adminModal").style.display = "flex";
  registrarAdminLog("Panel iniciado. Esperando autenticacion.");
}

function inicializarAccesoAdmin(){
  const adminBtn = document.getElementById("adminBtn");
  const params = new URLSearchParams(window.location.search);
  const claveAdmin = params.get("admin");

  if(claveAdmin === "Martin2022"){
    localStorage.setItem("adminVisibleFAUSZA", "true");
    window.history.replaceState({}, document.title, window.location.pathname);
  }

  if(localStorage.getItem("adminVisibleFAUSZA") === "true"){
    adminBtn.hidden = false;
  }
}

function cerrarAdmin(){
  document.getElementById("adminModal").style.display = "none";
}

function cargarProductosAdmin(){
  const select = document.getElementById("adminProducto");
  select.innerHTML = "";

  Object.keys(stockProductos).forEach(producto => {
    const option = document.createElement("option");
    option.value = producto;
    option.textContent = producto;
    select.appendChild(option);
  });
}

function guardarAdmin(event){
  event.preventDefault();

  if(!adminAutenticado){
    const password = document.getElementById("adminPassword").value;

    if(password !== "Martin2022"){
      registrarAdminLog("Acceso denegado: contrasena incorrecta.");
      mostrarNotificacion("Acceso admin denegado.", "error");
      return;
    }

    adminAutenticado = true;
    document.getElementById("adminPasswordGroup").style.display = "none";
    document.getElementById("adminFields").classList.add("open");
    document.getElementById("adminSubmit").innerText = "Actualizar stock";
    registrarAdminLog("Acceso concedido. Selecciona producto, talle y stock.");
    return;
  }

  const producto = document.getElementById("adminProducto").value;
  const talle = document.getElementById("adminTalle").value;
  const nuevoStock = Number(document.getElementById("adminStock").value);

  if(!stockProductos[producto]){
    registrarAdminLog(`Error: producto no encontrado (${producto}).`);
    mostrarNotificacion("Producto no encontrado.", "error");
    return;
  }

  if(!Number.isInteger(nuevoStock) || nuevoStock < 0){
    registrarAdminLog("Error: el stock debe ser un numero entero positivo.");
    mostrarNotificacion("Ingresa un stock valido.", "error");
    return;
  }

  stockProductos[producto][talle] = nuevoStock;
  persistirStock();
  actualizarStockVisual();
  cargarProductosAdmin();
  registrarAdminLog(`Stock actualizado: ${producto} / talle ${talle} = ${nuevoStock}.`);
  mostrarNotificacion("Stock actualizado correctamente.");
}

function registrarAdminLog(mensaje){
  const log = document.getElementById("adminLog");

  if(!log){
    return;
  }

  const hora = new Date().toLocaleTimeString("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });

  log.innerHTML = `<div>[${hora}] ${mensaje}</div>` + log.innerHTML;
}

function mostrarNotificacion(mensaje, tipo = "ok"){
  const notif = document.getElementById("notificacion");
  notif.innerText = mensaje;
  notif.style.background = tipo === "error" ? "rgba(255,59,48,0.96)" : "rgba(29,29,31,0.96)";
  notif.classList.add("show");

  setTimeout(() => {
    notif.classList.remove("show");
  }, 2600);
}
