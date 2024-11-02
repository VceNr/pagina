document.addEventListener("DOMContentLoaded", async () => {
    const productosContainer = document.getElementById("productos-container");
    const formAgregarProducto = document.getElementById("form-agregar-producto");

    // Función para cargar y mostrar los productos
    async function cargarProductos() {
        try {
            const response = await fetch('/productos');
            if (!response.ok) {
                throw new Error('Error al obtener productos');
            }
            
            const productos = await response.json();
            let tabla = `<table>
                            <tr>
                                <th>ID</th>
                                <th>Nombre</th>
                                <th>Descripción</th>
                                <th>Precio</th>
                                <th>Cantidad en Stock</th>
                                <th>Fecha de Creación</th>
                            </tr>`;

            productos.forEach(producto => {
                tabla += `<tr>
                            <td>${producto.id}</td>
                            <td>${producto.nombre}</td>
                            <td>${producto.descripcion}</td>
                            <td>${producto.precio}</td>
                            <td>${producto.cantidad_en_stock}</td>
                            <td>${new Date(producto.fecha_creacion).toLocaleDateString()}</td>
                          </tr>`;
            });

            tabla += `</table>`;
            productosContainer.innerHTML = tabla;
        } catch (error) {
            console.error('Error:', error);
            productosContainer.innerHTML = '<p>Error al cargar los productos.</p>';
        }
    }

    // Cargar productos al iniciar la página
    await cargarProductos();

    // Manejar el envío del formulario para agregar un producto
    formAgregarProducto.addEventListener("submit", async (event) => {
        event.preventDefault();

        const nombre = document.getElementById("nombre").value;
        const descripcion = document.getElementById("descripcion").value;
        const precio = parseFloat(document.getElementById("precio").value);
        const cantidad_en_stock = parseInt(document.getElementById("cantidad_en_stock").value);

        try {
            const response = await fetch('/productos', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ nombre, descripcion, precio, cantidad_en_stock })
            });

            if (!response.ok) {
                throw new Error('Error al agregar el producto');
            }

            alert('Producto agregado exitosamente');
            formAgregarProducto.reset();
            await cargarProductos(); // Recargar la lista de productos
        } catch (error) {
            console.error('Error:', error);
            alert('Error al agregar el producto');
        }
    });
});
