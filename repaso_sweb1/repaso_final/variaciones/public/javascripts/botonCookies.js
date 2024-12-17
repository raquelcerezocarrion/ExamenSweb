function aceptar() {
    // Ocultar el banner de cookies
    var cookiesBanner = document.getElementById("cookies-banner");
    cookiesBanner.style.display = "none";

    // Enviar la solicitud POST con fetch para almacenar la aceptación en el servidor
    fetch('/cookies', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ cookiesAccepted: true })
    })
    .then(response => {
        if (response.ok) {
            console.log('Cookies aceptadas en el servidor');
        } else {
            console.error('Error al aceptar las cookies');
        }
    })
    .catch(error => console.error('Error en la solicitud:', error));
}

function rechazar() {
    window.location.href = "https://www.google.com";
}