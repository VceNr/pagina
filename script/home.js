// Función para obtener los productos y mostrarlos en la página
async function obtenerProductos() {
    try {
        const response = await fetch('/productos'); // Ruta del servidor que devuelve los productos
        if (!response.ok) {
            throw new Error('Error al obtener productos');
        }

        const productos = await response.json(); // Convertir la respuesta en JSON
        const contenedorProductos = document.getElementById('productos-container');

        // Crear una tabla para mostrar los productos
        let html = '<table>';
        html += `
            <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Descripción</th>
                <th>Precio</th>
                <th>Cantidad en Stock</th>
                <th>Fecha de Creación</th>
            </tr>`;

        // Iterar sobre los productos y generar filas de la tabla
        productos.forEach(producto => {
            html += `
                <tr>
                    <td>${producto.id}</td>
                    <td>${producto.nombre}</td>
                    <td>${producto.descripcion}</td>
                    <td>${producto.precio}</td>
                    <td>${producto.cantidad_en_stock}</td>
                    <td>${producto.fecha_creacion}</td>
                </tr>`;
        });

        html += '</table>';
        contenedorProductos.innerHTML = html; // Insertar la tabla en el contenedor

    } catch (error) {
        console.error('Error:', error);
        document.getElementById('productos-container').innerText = 'Error al cargar productos';
    }
}

// Llamar a la función para obtener los productos al cargar la página
window.onload = obtenerProductos;
