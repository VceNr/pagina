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

        const data = await response.text();
        console.log(data); // Mensaje de éxito
        alert('Usuario registrado exitosamente');

        // Regresar al formulario de inicio de sesión
        document.getElementById('registerContainer').classList.add('hidden');
        document.querySelector('.form-container:not(#registerContainer)').classList.remove('hidden');
    } catch (error) {
        console.error('Error al agregar usuario:', error.message);
        alert('Error al registrar el usuario');
    }
});

// Manejar el inicio de sesión y redirigir a otra página
document.getElementById('loginForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    const correo = document.getElementById('loginCorreo').value;
    const contrasena = document.getElementById('loginPassword').value;

    try {
        const response = await fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ correo, contrasena }),
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Error: ${error}`);
        }

        const data = await response.text(); // Aquí recibimos el mensaje de éxito
        console.log(data); // Mensaje de éxito en el login
        alert('Login exitoso');

        // Redirigir a otra página (por ejemplo, home.html)
        window.location.href = 'front/home.html'; // Cambia 'home.html' por la página que desees
    } catch (error) {
        console.error('Error en el login:', error.message);
        alert('Error en el login: ' + error.message);
    }
});
