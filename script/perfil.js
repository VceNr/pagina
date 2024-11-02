document.addEventListener("DOMContentLoaded", async () => {
    const userNombre = document.getElementById("userNombre");
    const userCorreo = document.getElementById("userCorreo");
    const userTelefono = document.getElementById("userTelefono");

    try {
        const token = localStorage.getItem("token"); // Obtener el token del almacenamiento local
        console.log("Token obtenido:", token); // Verifica que el token se obtiene
        const response = await fetch('/usuario', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}` // Asegúrate de que el token se envía en la cabecera
            }
        });
        
        if (!response.ok) {
            throw new Error('Error al obtener datos del usuario'); // Manejo de errores si la respuesta no es OK
        }

        const usuario = await response.json(); // Convertir la respuesta en JSON
        // Mostrar los datos del usuario en el HTML
        userNombre.textContent = usuario.nombre; // Asignar el nombre del usuario
        userCorreo.textContent = usuario.correo; // Asignar el correo del usuario
        userTelefono.textContent = usuario.telefono; // Asignar el teléfono del usuario (asegúrate de que este campo esté en la respuesta)
    } catch (error) {
        console.error('Error:', error); // Imprimir el error en la consola
        alert('No se pudo cargar la información del usuario.'); // Alertar al usuario
    }
});
document.getElementById("logoutButton").addEventListener("click", () => {
    localStorage.removeItem("token"); // or sessionStorage.removeItem("token")
    window.location.href = "/"; // Redirect to the login page or home
});
