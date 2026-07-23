let productos = [];

const cargarBtn = () => document.getElementById("cargarBtn");
const buscarBtn = () => document.getElementById("buscarBtn");

window.addEventListener("load", () => {

    cargarProductosGuardados();

    cargarBtn().addEventListener("click", cargarCSV);
    buscarBtn().addEventListener("click", buscarProducto);

    document.getElementById("scanBtn").addEventListener("click", () => iniciarEscaner("buscar"));
    document.getElementById("scanNuevoBtn").addEventListener("click", () => iniciarEscaner("codigoNuevo"));
    document.getElementById("guardarBtn").addEventListener("click", guardarProducto);

    document.getElementById("buscar").addEventListener("keydown", e => {
        if (e.key === "Enter") buscarProducto();
    });

});

  

function cargarProductosGuardados() {

    const guardados = localStorage.getItem("productos");

    if (guardados) {
        productos = JSON.parse(guardados);
    }

}

function guardarEnStorage() {
    localStorage.setItem("productos", JSON.stringify(productos));
}

function normalizarCodigo(codigo) {

    if (!codigo) return "";

    // Quita ceros al inicio (ej. 0123456789012 y 123456789012 se tratan como el mismo código)
    return codigo.trim().replace(/^0+(?=\d)/, "");

}

function buscarPorCodigo(lista, codigo) {

    // 1) Primero intenta un match EXACTO (por si de verdad hay dos códigos distintos)
    const exacto = lista.find(x => x.codigo === codigo);
    if (exacto) return exacto;

    // 2) Si no hay match exacto, ignora ceros al inicio (caso típico EAN-13 vs UPC-A)
    return lista.find(x => normalizarCodigo(x.codigo) === normalizarCodigo(codigo));

}

function cargarCSV() {

    const archivo = document.getElementById("csvFile").files[0];

    if (!archivo) {
        alert("Selecciona primero el archivo CSV.");
        return;
    }

    const lector = new FileReader();

    lector.onload = function(e){

        const texto = e.target.result;

        const lineas = texto.split(/\r?\n/);

        lineas.forEach(linea=>{

            if(linea.trim()=="") return;

            const c = linea.split(";");

            if(c.length < 7) return;

            const codigo = c[0].trim();
            const nombre = c[2].trim();
            const precio = c[6].trim();

            const existente = buscarPorCodigo(productos, codigo);

            if (existente) {
                existente.nombre = nombre;
                existente.precio = precio;
            } else {
                productos.push({ codigo, nombre, precio });
            }

        });

        guardarEnStorage();

        alert(productos.length+" productos en total.");

    };

    lector.readAsText(archivo,"ISO-8859-1");

}

function guardarProducto() {

    const codigo = document.getElementById("codigoNuevo").value.trim();
    const nombre = document.getElementById("nombreNuevo").value.trim();
    const precio = document.getElementById("precioNuevo").value.trim();

    const mensaje = document.getElementById("mensajeGuardado");

    if (!codigo || !nombre || !precio) {
        mensaje.textContent = "Completa código, nombre y precio.";
        mensaje.className = "error";
        return;
    }

    const existente = buscarPorCodigo(productos, codigo);

    if (existente) {
        existente.nombre = nombre;
        existente.precio = precio;
        mensaje.textContent = "Producto actualizado ✔";
    } else {
        productos.push({ codigo, nombre, precio });
        mensaje.textContent = "Producto agregado ✔";
    }

    mensaje.className = "ok";

    guardarEnStorage();

    document.getElementById("codigoNuevo").value = "";
    document.getElementById("nombreNuevo").value = "";
    document.getElementById("precioNuevo").value = "";

}

function buscarProducto(){

    const codigo=document.getElementById("buscar").value.trim();

    const p=buscarPorCodigo(productos, codigo);

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
let campoDestino = "buscar";

async function iniciarEscaner(destino) {

    if (escaneando) return;
    escaneando = true;
    campoDestino = destino || "buscar";

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

    document.getElementById(campoDestino).value = texto;

    if (campoDestino === "buscar") {
        buscarProducto();
    }

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
