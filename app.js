let productos = [];

async function cargarProductos() {
    try {
        const respuesta = await fetch("PROGC0001.csv");
        const texto = await respuesta.text();

        const lineas = texto.split(/\r?\n/);

        productos = [];

        for (let i = 0; i < lineas.length; i++) {

            const linea = lineas[i].trim();

            if (linea === "") continue;

            const campos = linea.split(";");

            if (campos.length < 7) continue;

            const codigo = campos[0].trim();
            const nombre = campos[2].trim();
            const precio = campos[6].trim();

            if (codigo !== "") {

                productos.push({
                    codigo,
                    nombre,
                    precio
                });

            }

        }

        console.log("Productos cargados:", productos.length);

    } catch (e) {

        alert("No se pudo leer PROGC0001.csv");

        console.error(e);

    }
}

function buscarProducto() {

    const texto = document
        .getElementById("buscar")
        .value
        .trim()
        .toLowerCase();

    const producto = productos.find(p =>
        p.codigo.toLowerCase() === texto ||
        p.nombre.toLowerCase().includes(texto)
    );

    if (!producto) {

        document.getElementById("producto").textContent =
            "Producto no encontrado";

        document.getElementById("precio").textContent = "";

        document.getElementById("codigo").textContent = "";

        return;
    }

    document.getElementById("producto").textContent =
        producto.nombre;

    document.getElementById("precio").textContent =
        "B/. " + producto.precio;

    document.getElementById("codigo").textContent =
        "Código: " + producto.codigo;

}

window.onload = function () {

    cargarProductos();

    document
        .getElementById("buscarBtn")
        .onclick = buscarProducto;

};
