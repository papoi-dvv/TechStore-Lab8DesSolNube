import { useEffect, useState } from 'react';
import { getProducts, createProduct, updateProduct, deleteProduct } from '../api/api';
import { useAuth } from '../context/AuthContext';

function ProductsPage({ onNavigate }) {
  const { token } = useAuth();
  const [products, setProducts] = useState([]);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({ nombre: '', descripcion: '', precio: '', stock: '', categoria: '', tienda_id: '1', es_premium: false });

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setError('');
    try {
      const data = await getProducts(token);
      setProducts(data.products || []);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCreate = async e => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      await createProduct(token, {
        nombre: form.nombre,
        descripcion: form.descripcion,
        precio: Number(form.precio),
        stock: Number(form.stock),
        categoria: form.categoria,
        tienda_id: Number(form.tienda_id),
        es_premium: form.es_premium,
      });
      setMessage('Producto creado correctamente.');
      setForm({ nombre: '', descripcion: '', precio: '', stock: '', categoria: '', tienda_id: '1', es_premium: false });
      loadProducts();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleUpdate = async (product) => {
    const stock = prompt('Nuevo stock', product.stock);
    if (stock == null) return;
    setError('');
    setMessage('');
    try {
      await updateProduct(token, product.id, { stock: Number(stock) });
      setMessage('Producto actualizado correctamente.');
      loadProducts();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (product) => {
    if (!window.confirm(`Eliminar ${product.nombre}?`)) return;
    setError('');
    setMessage('');
    try {
      await deleteProduct(token, product.id);
      setMessage('Producto eliminado correctamente.');
      loadProducts();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="page-card">
      <h2>Inventario de Productos</h2>
      <button className="link-button" onClick={() => onNavigate('dashboard')}>Volver al panel</button>
      {error && <div className="error">{error}</div>}
      {message && <div className="success">{message}</div>}
      <div className="section">
        <h3>Crear producto</h3>
        <form onSubmit={handleCreate} className="vertical-form">
          <label>
            Nombre
            <input value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} required />
          </label>
          <label>
            Descripción
            <input value={form.descripcion} onChange={e => setForm({ ...form, descripcion: e.target.value })} />
          </label>
          <label>
            Precio
            <input value={form.precio} onChange={e => setForm({ ...form, precio: e.target.value })} type="number" step="0.01" required />
          </label>
          <label>
            Stock
            <input value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} type="number" required />
          </label>
          <label>
            Categoría
            <input value={form.categoria} onChange={e => setForm({ ...form, categoria: e.target.value })} />
          </label>
          <label>
            Tienda
            <select value={form.tienda_id} onChange={e => setForm({ ...form, tienda_id: e.target.value })}>
              <option value="1">Sucursal Central</option>
              <option value="2">Sucursal Norte</option>
            </select>
          </label>
          <label className="checkbox-label">
            <input type="checkbox" checked={form.es_premium} onChange={e => setForm({ ...form, es_premium: e.target.checked })} />
            Producto premium
          </label>
          <button type="submit">Crear producto</button>
        </form>
      </div>
      <div className="section">
        <h3>Productos</h3>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Tienda</th>
              <th>Precio</th>
              <th>Stock</th>
              <th>Premium</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {products.map(product => (
              <tr key={product.id}>
                <td>{product.id}</td>
                <td>{product.nombre}</td>
                <td>{product.tienda_id}</td>
                <td>{product.precio}</td>
                <td>{product.stock}</td>
                <td>{product.es_premium ? 'Sí' : 'No'}</td>
                <td>
                  <button onClick={() => handleUpdate(product)}>Actualizar stock</button>
                  <button className="danger" onClick={() => handleDelete(product)}>Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ProductsPage;
