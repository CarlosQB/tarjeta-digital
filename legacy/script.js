// DATOS DEL CONTACTO
const contacto = {
    nombre: "Jose Carlos Quezada",
    telefono: "3327207997",
    correo: "quezadacarlos246@gmail.com"
};

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

// GENERAR QR

const urlTarjeta = "https://carlosqb.github.io/tarjeta-digital/";

const qrContainer = document.getElementById("qrcode");

console.log("QRCode:", typeof QRCode);
console.log("QR Container:", qrContainer);

if (qrContainer && typeof QRCode !== "undefined") {

    new QRCode(qrContainer, {
        text: urlTarjeta,
        width: 180,
        height: 180
    });

}

// SERVICE WORKER
if ('serviceWorker' in navigator) {

    navigator.serviceWorker.register('./service-worker.js')
        .then(() => console.log("Service Worker registrado"))
        .catch(error => console.error(error));

}

// INSTALAR APP
let deferredPrompt;

const btnInstalar = document.getElementById("instalarApp");
const btnIOS = document.getElementById("iosInstall");

// Mostrar ambos botones siempre
if (btnInstalar) {
    btnInstalar.style.display = "block";
}

if (btnIOS) {
    btnIOS.style.display = "block";
}

// Detectar si Chrome permite instalación
window.addEventListener('beforeinstallprompt', (e) => {

    console.log("Instalable detectado");

    e.preventDefault();

    deferredPrompt = e;

});

// Botón Android / Chrome
if (btnInstalar) {

    btnInstalar.addEventListener("click", async () => {

        console.log("Botón instalar presionado");

        // Si Chrome permite instalar
        if (deferredPrompt) {

            deferredPrompt.prompt();

            const resultado = await deferredPrompt.userChoice;

            console.log("Resultado:", resultado);

            deferredPrompt = null;

        } else {

            alert(
`Android:

1. Presiona ⋮ arriba a la derecha
2. Selecciona "Instalar aplicación"

iPhone:

1. Presiona Compartir (□↗)
2. Añadir a pantalla de inicio`
            );

        }

    });

}

// Botón iPhone
if (btnIOS) {

    btnIOS.addEventListener("click", () => {

        alert(
`Para instalar en iPhone:

1. Presiona Compartir (□↗)
2. Selecciona "Añadir a pantalla de inicio"
3. Presiona "Añadir"`
        );

    });

}

// DETECTAR SI YA ESTÁ INSTALADA
window.addEventListener('appinstalled', () => {

    console.log("Aplicación instalada");

    if (btnInstalar) {
        btnInstalar.style.display = "none";
    }

});