// DATOS DEL CONTACTO
const contacto = {
    nombre: "Jose Carlos Quezada",
    telefono: "3327207997",
    correo: "quezadacarlos246@gmail.com"
};

console.log("Script cargado");

// DESCARGAR CONTACTO
document.getElementById("guardarContacto").addEventListener("click", () => {

    const vCard =
`BEGIN:VCARD
VERSION:3.0
FN:${contacto.nombre}
TEL:${contacto.telefono}
EMAIL:${contacto.correo}
END:VCARD`;

    const blob = new Blob([vCard], {
        type: "text/vcard"
    });

    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "JoseCarlosQuezada.vcf";
    a.click();

    URL.revokeObjectURL(url);
});

// QR
const urlTarjeta = "https://carlosqb.github.io/tarjeta-digital/";

new QRCode(document.getElementById("qrcode"), {
    text: urlTarjeta,
    width: 200,
    height: 200
});

// SERVICE WORKER
if ('serviceWorker' in navigator) {

    navigator.serviceWorker.register('./service-worker.js')
        .then(() => {
            console.log("Service Worker registrado");
        })
        .catch((error) => {
            console.error("Error registrando Service Worker:", error);
        });

}

// INSTALAR APP
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {

    console.log("Instalable detectado");

    e.preventDefault();

    deferredPrompt = e;

    const btnInstalar = document.getElementById("instalarApp");

    if (btnInstalar) {
        btnInstalar.style.display = "block";
    }

});

const btnInstalar = document.getElementById("instalarApp");

if (btnInstalar) {

    btnInstalar.addEventListener("click", async () => {

        console.log("Botón instalar presionado");

        if (!deferredPrompt) {
            alert("La instalación aún no está disponible en este dispositivo.");
            return;
        }

        deferredPrompt.prompt();

        const resultado = await deferredPrompt.userChoice;

        console.log("Resultado:", resultado);

        deferredPrompt = null;

        btnInstalar.style.display = "none";

    });

}

// DETECTAR SI YA ESTÁ INSTALADA
window.addEventListener('appinstalled', () => {

    console.log("Aplicación instalada");

    if (btnInstalar) {
        btnInstalar.style.display = "none";
    }

});