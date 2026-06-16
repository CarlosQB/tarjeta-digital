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

// QR
// Cuando subas tu página cambia esta URL
const urlTarjeta =
window.location.href;

new QRCode(document.getElementById("qrcode"), {
    text: urlTarjeta,
    width: 200,
    height: 200
});