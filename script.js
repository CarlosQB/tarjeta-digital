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