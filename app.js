let productos = [];

async function cargarCSV() {
    try {
        const respuesta = await fetch("PROGC0001.csv");
        const texto = await respuesta.text();

        const lineas = texto.split(/\r?\n/);

        for (let i = 1; i < lineas.length; i++) {

            if (!lineas[i]) continue;

            const c = lineas[i].split(",");

            productos.push({
                codigo: c[0],
                nombre: c[1],
                precio: c[2]
            });
        }

        console.log(productos.length + " productos cargados");

    } catch (e) {
        console.log(e);
    }
}

function buscarProducto() {

    const buscar =
        document
        .getElementById("buscar")
        .value
        .trim();

    const p =
        productos.find(x => x.codigo == buscar);

    if (!p) {

        document.getElementById("producto").innerHTML =
            "Producto no encontrado";

        document.getElementById("precio").innerHTML = "";

        document.getElementById("codigo").innerHTML = "";

        return;
    }

    document.getElementById("producto").innerHTML =
        p.nombre;

    document.getElementById("precio").innerHTML =
        "B/. " + p.precio;

    document.getElementById("codigo").innerHTML =
        p.codigo;

}

cargarCSV();
