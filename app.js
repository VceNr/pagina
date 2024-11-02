const express = require('express');
const cors = require('cors');
const sql = require('mssql');
const path = require('path');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();

// Configuración de la conexión a la base de datos
const config = {
    user: 'vcenr',
    password: 'vce.nr1212',
    server: 'proyecz.database.windows.net',
    database: 'proyecto',
    options: {
        encrypt: true,
        trustServerCertificate: false
    },
};

// Establecer el puerto
const PORT = process.env.PORT || 3000;
app.set("port", PORT);
app.use(bodyParser.json());
app.use(cors());
app.use(express.static(path.join(__dirname))); // Servir archivos estáticos

// Ruta para servir el archivo HTML
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'front/index.html'));
});

// Conectar a la base de datos
sql.connect(config)
    .then(() => {
        app.listen(app.get("port"), () => {
            // Solo se mantiene el mensaje de inicio del servidor
        });
    })
    .catch(err => {
        process.exit(1);
    });

// Endpoint para registrar un nuevo usuario
app.post('/usuarios', async (req, res) => {
    const { nombre, correo, contrasena } = req.body;

    // Validar datos
    if (!nombre || !correo || !contrasena) {
        return res.status(400).json({ error: 'Faltan datos requeridos: nombre, correo y contrasena' });
    }

    try {
        const hashedPassword = await bcrypt.hash(contrasena, 10);
        const request = new sql.Request();
        const query = `INSERT INTO dbo.usuarios (nombre, correo, contrasena) VALUES (@nombre, @correo, @contrasena)`;

        request.input('nombre', sql.NVarChar, nombre);
        request.input('correo', sql.NVarChar, correo);
        request.input('contrasena', sql.NVarChar, hashedPassword);

        await request.query(query);
        res.status(201).json({ message: 'Usuario agregado exitosamente' });
    } catch (error) {
        res.status(500).json({ error: 'Error al agregar el usuario en la base de datos: ' + error.message });
    }
});

// Endpoint para login
app.post('/login', async (req, res) => {
    const { correo, contrasena } = req.body;

    // Validar datos
    if (!correo || !contrasena) {
        return res.status(400).json({ error: 'Faltan datos requeridos: correo y contrasena' });
    }

    try {
        const request = new sql.Request();
        request.input('correo', sql.NVarChar, correo);
        const result = await request.query('SELECT * FROM dbo.usuarios WHERE correo = @correo');

        if (result.recordset.length === 0) {
            return res.status(401).json({ error: 'Usuario no encontrado' });
        }

        const user = result.recordset[0];

        // Verificar la contraseña
        const match = await bcrypt.compare(contrasena, user.contrasena);
        if (!match) {
            return res.status(401).json({ error: 'Contraseña incorrecta' });
        }

        // Crear el token
        const token = jwt.sign({ id: user.id, nombre: user.nombre, correo: user.correo }, process.env.JWT_SECRET || 'secretKey', { expiresIn: '1h' });
        res.status(200).json({ token });
    } catch (error) {
        res.status(500).json({ error: 'Error en el login: ' + error.message });
    }
});

// Middleware para autenticar el token
const authenticateJWT = (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1];
    if (token) {
        jwt.verify(token, process.env.JWT_SECRET || 'secretKey', (err, user) => {
            if (err) {
                return res.sendStatus(403);
            }
            req.user = user;
            next();
        });
    } else {
        res.sendStatus(401);
    }
};

// Endpoint para obtener los datos del usuario logueado
app.get('/usuario', authenticateJWT, (req, res) => {
    res.json(req.user);
});

// Endpoint para obtener productos
app.get('/productos', async (req, res) => {
    try {
        const request = new sql.Request();
        const result = await request.query('SELECT id, nombre, descripcion, precio, cantidad_en_stock, fecha_creacion FROM productos');
        res.status(200).json(result.recordset);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener los productos' });
    }
});

// Ruta para agregar productos
app.post('/productos', async (req, res) => {
    const { nombre, descripcion, precio, cantidad_en_stock } = req.body;

    // Validar datos
    if (!nombre || !descripcion || !precio || !cantidad_en_stock) {
        return res.status(400).json({ error: 'Faltan datos requeridos: nombre, descripcion, precio y cantidad_en_stock' });
    }

    try {
        const request = new sql.Request();
        const query = `INSERT INTO productos (nombre, descripcion, precio, cantidad_en_stock, fecha_creacion) 
                       VALUES (@nombre, @descripcion, @precio, @cantidad_en_stock, GETDATE())`;

        request.input('nombre', sql.NVarChar, nombre);
        request.input('descripcion', sql.NVarChar, descripcion);
        request.input('precio', sql.Decimal, precio);
        request.input('cantidad_en_stock', sql.Int, cantidad_en_stock);

        await request.query(query);
        res.status(201).json({ message: 'Producto agregado exitosamente' });
    } catch (error) {
        res.status(500).json({ error: 'Error al agregar el producto en la base de datos: ' + error.message });
    }
});
