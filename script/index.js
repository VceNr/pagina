// Mostrar el formulario de registro
document.getElementById('showRegisterForm').addEventListener('click', () => {
    document.getElementById('registerContainer').classList.remove('hidden');
    document.querySelector('.form-container:not(#registerContainer)').classList.add('hidden');
});

// Mostrar el formulario de inicio de sesión
document.getElementById('showLoginForm').addEventListener('click', () => {
    document.getElementById('registerContainer').classList.add('hidden');
    document.querySelector('.form-container:not(#registerContainer)').classList.remove('hidden');
});

// Manejar el registro de usuarios
document.getElementById('registerForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    const nombre = document.getElementById('registerNombre').value;
    const correo = document.getElementById('registerCorreo').value;
    const contrasena = document.getElementById('registerPassword').value;

    try {
        const response = await fetch('/usuarios', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ nombre, correo, contrasena }),
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Error: ${error}`);
        }

        alert('Usuario registrado exitosamente');
        // Regresar al formulario de inicio de sesión
        document.getElementById('registerContainer').classList.add('hidden');
        document.querySelector('.form-container:not(#registerContainer)').classList.remove('hidden');
    } catch (error) {
        console.error('Error al agregar usuario:', error.message);
        alert('Error al registrar el usuario: ' + error.message);
    }
});

// Manejar el inicio de sesión y redirigir a otra página
document.getElementById('loginForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    const email = document.getElementById('loginCorreo').value.trim();
    const password = document.getElementById('loginPassword').value.trim();

    if (!email || !password) {
        alert('Por favor, completa todos los campos.'); // Mensaje amigable para campos vacíos
        return;
    }

    try {
        const response = await fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ correo: email, contrasena: password })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Error en inicio de sesión: ${errorText}`); // Asegúrate de capturar el mensaje de error del servidor
        }

        const data = await response.json();
        localStorage.setItem("token", data.token);
        window.location.href = '/front/home.html'; // Redirigir a la página de perfil
    } catch (error) {
        console.error('Error:', error);
        alert('Error en inicio de sesión: ' + error.message); // Mensaje de error detallado
    }
});


// Función para verificar el token en cada carga de página
const checkAuth = () => {
    const token = localStorage.getItem("token");
    if (token) {
        // Si el token está presente, se puede realizar una solicitud para obtener los datos del usuario
        fetch('/usuario', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error('No autorizado');
            }
        })
        .then(user => {
            console.log("Usuario autenticado:", user);
            // Aquí puedes redirigir o mostrar información del usuario
        })
        .catch(error => {
            console.error('Error al verificar el token:', error);
            // Si hay un error, tal vez se desee limpiar el token y redirigir al login
            localStorage.removeItem("token");
            window.location.href = 'index.html'; // Volver a la página de inicio de sesión
        });
    }
};

// Llamar a la función de verificación al cargar la página
window.onload = checkAuth;
