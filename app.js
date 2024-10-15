const express = require('express');
const cors = require('cors');
const sql = require('mssql');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();

// Configuración de la conexión a la base de datos
const config = {
    user: 'vcenr',
    password: 'vce.nr1212',
    server: 'proyecz.database.windows.net',
    database: 'proyecto',
    options: {
        encrypt: true, // Azure requiere conexiones encriptadas
        trustServerCertificate: false
    },
};

// Establecer el puerto
const PORT = process.env.PORT || 3000;
app.set("port", PORT);
app.use(bodyParser.json());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos (CSS)
app.use(express.static(path.join(__dirname))); // Asegúrate de que el CSS está en la misma carpeta

// Ruta para servir el archivo HTML
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Conectar a la base de datos
sql.connect(config)
    .then(() => {
        console.log('Conexión exitosa a la base de datos de Azure SQL.');
        app.listen(app.get("port"), () => {
            console.log("Server on port", app.get("port"));
        });
    })
    .catch(err => {
        console.error('Error conectando a la base de datos:', err);
        process.exit(1);
    });

// Endpoint para registrar un nuevo usuario
app.post('/usuarios', async (req, res) => {
    const { nombre, correo, contrasena } = req.body;

    if (!nombre || !correo || !contrasena) {
        return res.status(400).send('Faltan datos requeridos: nombre, correo y contrasena');
    }

    try {
        const request = new sql.Request();
        const query = `INSERT INTO dbo.usuarios (nombre, correo, contrasena) VALUES (@nombre, @correo, @contrasena)`;

        request.input('nombre', sql.NVarChar, nombre);
        request.input('correo', sql.NVarChar, correo);
        request.input('contrasena', sql.NVarChar, contrasena); // Guardar la contraseña sin hashear

        await request.query(query);
        res.status(201).send('Usuario agregado exitosamente');
    } catch (error) {
        console.error('Error al agregar el usuario:', error.message);
        res.status(500).send('Error al agregar el usuario en la base de datos: ' + error.message);
    }
});

// Endpoint para login
app.post('/login', async (req, res) => {
    const { correo, contrasena } = req.body;

    // Verifica si faltan datos
    if (!correo || !contrasena) {
        return res.status(400).send('Faltan datos requeridos: correo y contrasena');
    }

    try {
        const request = new sql.Request();
        request.input('correo', sql.NVarChar, correo);
        const result = await request.query('SELECT * FROM dbo.usuarios WHERE correo = @correo');

        // Verifica si se encontró el usuario
        if (result.recordset.length === 0) {
            return res.status(401).send('Usuario no encontrado');
        }
        
        const user = result.recordset[0];

        // Aquí se compara la contraseña directamente
        if (user.contrasena !== contrasena) {
            return res.status(401).send('Contraseña incorrecta');
        }

        // Si la autenticación es exitosa
        res.status(200).send('Login exitoso');
    } catch (error) {
        console.error('Error en el login:', error);
        res.status(500).send('Error en el login: ' + error.message);
    }
});
app.get('/productos', async (req, res) => {
    try {
        const request = new sql.Request();
        const result = await request.query('SELECT id, nombre, descripcion, precio, cantidad_en_stock, fecha_creacion FROM productos');
        
        res.status(200).json(result.recordset); // Enviar los productos como JSON
    } catch (error) {
        console.error('Error al obtener los productos:', error);
        res.status(500).send('Error al obtener los productos');
    }
});
