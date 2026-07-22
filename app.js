let productos = [];

async function cargarProductos() {
    try {
        const respuesta = await fetch("PROGC0001.csv");
        const texto = await respuesta.text();

        const lineas = texto.split(/\r?\n/);

        if (lineas.length < 2) {
            alert("El CSV está vacío.");
            return;
        }

        const encabezados = lineas[0].split(",");

        const idxCodigo = encabezados.findIndex(h =>
            h.toLowerCase().includes("codigo"));

        const idxNombre = encabezados.findIndex(h =>
            h.toLowerCase().includes("descripcion"));

        const idxPrecio = encabezados.findIndex(h =>
            h.toLowerCase().includes("precio1"));

        productos = [];

        for (let i = 1; i < lineas.length; i++) {

            if (!lineas[i].trim()) continue;

            const columnas = lineas[i].split(",");

            productos.push({
                codigo: (columnas[idxCodigo] || "").trim(),
                nombre: (columnas[idxNombre] || "").trim(),
                precio: (columnas[idxPrecio] || "").trim()
            });
        }

        console.log(productos.length + " productos cargados");

    } catch (e) {
        console.error(e);
        alert("No se pudo cargar PROGC0001.csv");
    }
}

function buscarProducto() {

    const texto = document
        .getElementById("buscar")
        .value
        .trim()
        .toLowerCase();

    if (texto === "") return;

    const producto = productos.find(p =>
        p.codigo === texto ||
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

window.onload = () => {

    cargarProductos();

    document
        .getElementById("buscarBtn")
        .addEventListener("click", buscarProducto);

    document
        .getElementById("buscar")
        .addEventListener("keypress", e => {

            if (e.key === "Enter")
                buscarProducto();

        });

};
