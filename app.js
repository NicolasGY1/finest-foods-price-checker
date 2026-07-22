let productos = [];

const cargarBtn = () => document.getElementById("cargarBtn");
const buscarBtn = () => document.getElementById("buscarBtn");

window.addEventListener("load", () => {

    cargarBtn().addEventListener("click", cargarCSV);
    buscarBtn().addEventListener("click", buscarProducto);

    document.getElementById("buscar").addEventListener("keydown", e => {
        if (e.key === "Enter") buscarProducto();
    });

});

function cargarCSV() {

    const archivo = document.getElementById("csvFile").files[0];

    if (!archivo) {
        alert("Selecciona primero el archivo CSV.");
        return;
    }

    const lector = new FileReader();

    lector.onload = function(e){

        const texto = e.target.result;

        productos = [];

        const lineas = texto.split(/\r?\n/);

        lineas.forEach(linea=>{

            if(linea.trim()=="") return;

            const c = linea.split(";");

            if(c.length < 7) return;

            productos.push({

                codigo: c[0].trim(),

                nombre: c[2].trim(),

                precio: c[6].trim()

            });

        });

        localStorage.setItem("productos",JSON.stringify(productos));

        alert(productos.length+" productos cargados.");

    };

    lector.readAsText(archivo,"ISO-8859-1");

}

function buscarProducto(){

    if(productos.length==0){

        const guardados=localStorage.getItem("productos");

        if(guardados){

            productos=JSON.parse(guardados);

        }

    }

    const codigo=document.getElementById("buscar").value.trim();

    const p=productos.find(x=>x.codigo===codigo);

    if(!p){

        document.getElementById("producto").textContent="Producto no encontrado";
        document.getElementById("precio").textContent="";
        document.getElementById("codigo").textContent="";
        return;

    }

    document.getElementById("producto").textContent=p.nombre;
    document.getElementById("precio").textContent="B/. "+p.precio;
    document.getElementById("codigo").textContent="Código: "+p.codigo;

}
let scanner = null;

document.getElementById("scanBtn").onclick = iniciarEscaner;

function iniciarEscaner() {

    if (scanner) {
        return;
    }

    scanner = new Html5Qrcode("reader");

    scanner.start(
        {
            facingMode: "environment"
        },
        {
            fps: 10,
            qrbox: 250
        },
        (codigo) => {

            document.getElementById("buscar").value = codigo;

            buscarProducto();

            scanner.stop().then(() => {
                scanner.clear();
                scanner = null;
            });

        },
        () => {}
    );

}
document.getElementById("scanBtn").addEventListener("click", async () => {

    if (typeof Html5Qrcode === "undefined") {
        alert("La librería del escáner no cargó.");
        return;
    }

    const html5QrCode = new Html5Qrcode("reader");

    try {

        await html5QrCode.start(
            { facingMode: "environment" },
           {
    fps: 30,
    qrbox: {
        width: 300,
        height: 120
    },
    aspectRatio: 1.777,
    disableFlip: true
},
    aspectRatio: 1.777
},
            (decodedText) => {

                document.getElementById("buscar").value = decodedText;

                buscarProducto();

                html5QrCode.stop();

            }
        );

    } catch (e) {

        alert("Error al abrir la cámara: " + e);

    }

});
