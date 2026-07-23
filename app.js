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
let escaneando = false;
let streamActivo = null;
let zxingReader = null;

async function iniciarEscaner() {

    if (escaneando) return;
    escaneando = true;

    const video = document.getElementById("reader");

    // 1) Intentar con el escáner NATIVO del navegador (más rápido, usa el hardware del teléfono)
    if ("BarcodeDetector" in window) {
        try {
            const formatos = await BarcodeDetector.getSupportedFormats();
            if (formatos.includes("ean_13")) {
                await iniciarEscanerNativo(video);
                return;
            }
        } catch (err) {
            console.log("BarcodeDetector no disponible, se usará ZXing:", err);
        }
    }

    // 2) Respaldo: ZXing (funciona en cualquier navegador, ej. iPhone/Safari)
    iniciarEscanerZXing(video);

}

async function iniciarEscanerNativo(video) {

    try {

        const detector = new BarcodeDetector({ formats: ["ean_13"] });

        streamActivo = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: "environment" }
        });

        video.srcObject = streamActivo;
        await video.play();

        const loop = async () => {

            if (!escaneando) return;

            try {
                const codigos = await detector.detect(video);
                if (codigos.length > 0) {
                    onCodigoDetectado(codigos[0].rawValue);
                    return;
                }
            } catch (e) {
                console.log(e);
            }

            requestAnimationFrame(loop);

        };

        loop();

    } catch (err) {

        console.log(err);
        alert("No se pudo abrir la cámara.");
        escaneando = false;

    }

}

function iniciarEscanerZXing(video) {

    try {

        const hints = new Map();
        hints.set(ZXing.DecodeHintType.POSSIBLE_FORMATS, [ZXing.BarcodeFormat.EAN_13]);

        zxingReader = new ZXing.BrowserMultiFormatReader(hints);

        zxingReader.decodeFromConstraints(
            { video: { facingMode: "environment" } },
            video,
            (resultado, error) => {
                if (resultado) {
                    onCodigoDetectado(resultado.getText());
                }
            }
        );

    } catch (err) {

        console.log(err);
        alert("No se pudo abrir la cámara.");
        escaneando = false;

    }

}

function onCodigoDetectado(texto) {

    document.getElementById("buscar").value = texto;

    buscarProducto();

    if (navigator.vibrate) {
        navigator.vibrate(100);
    }

    detenerEscaner();

}

function detenerEscaner() {

    escaneando = false;

    if (streamActivo) {
        streamActivo.getTracks().forEach(t => t.stop());
        streamActivo = null;
    }

    if (zxingReader) {
        zxingReader.reset();
        zxingReader = null;
    }

    const video = document.getElementById("reader");
    video.srcObject = null;

}
