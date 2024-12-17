function validateForm() {
    var password = document.getElementById("pass").value;
    var confirm_password = document.getElementById("pass2").value;

    if(password.length < 8) {

        alert("La contraseña debe tener al menos 8 caracterres.");
        return false;
    }

    if(password !== confirm_password) {
        alert("Las contraseñas no coinciden.");
        return false;
    }

    return true;
}