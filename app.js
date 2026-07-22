let productos = [];

const cargarBtn = () => document.getElementById("cargarBtn");
const buscarBtn = () => document.getElementById("buscarBtn");

window.addEventListener("load", () => {

    cargarBtn().addEventListener("click", cargarCSV);
    buscarBtn().addEventListener("click", buscarProducto);

    document.getElementById("scanBtn").addEventListener("click", iniciarEscaner);

    document.getElementById("buscar").addEventListener("keydown", e => {
        if (e.key === "Enter") buscarProducto();
    });

});

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
let codeReader = null;
let scannerActivo = false;

async function iniciarEscaner() {

    if (scannerActivo) return;

    scannerActivo = true;

    codeReader = new ZXingBrowser.BrowserMultiFormatReader();

    try {

        const devices = await ZXingBrowser.BrowserCodeReader.listVideoInputDevices();

        let deviceId = devices[0].deviceId;

        for (const d of devices) {

            if (d.label.toLowerCase().includes("back") ||
                d.label.toLowerCase().includes("rear")) {

                deviceId = d.deviceId;

            }

        }

        await codeReader.decodeFromVideoDevice(
            deviceId,
            "reader",

            (result, err) => {

                if (result) {

                    const codigo = result.getText();

                    document.getElementById("buscar").value = codigo;

                    buscarProducto();

                    if (navigator.vibrate) {

                        navigator.vibrate(100);

                    }

                }

            }

        );

    } catch (e) {

        alert("No se pudo abrir la cámara.");

        console.log(e);

        scannerActivo = false;

    }

}

function detenerEscaner(){

    if(codeReader){

        codeReader.reset();

        scannerActivo=false;

    }

}
