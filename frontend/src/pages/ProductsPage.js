import { useEffect, useState } from 'react';
import { getProducts, createProduct, updateProduct, deleteProduct, getStores } from '../api/api';
import { useAuth } from '../context/AuthContext';

function ProductsPage({ onNavigate }) {
  const { token, user } = useAuth();
  const [products, setProducts] = useState([]);
  const [stores, setStores] = useState([]);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({ nombre: '', descripcion: '', precio: '', stock: '', categoria: '', tienda_id: '', es_premium: false });
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState(null);

  const userRoles = user?.roles || [];
  const isAdmin = userRoles.includes('Administrador');
  const isGerente = userRoles.includes('Gerente');
  const isEmpleado = userRoles.includes('Empleado');

  useEffect(() => {
    loadProducts();
    loadStores();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const loadStores = async () => {
    try {
      const data = await getStores(token);
      setStores(data.stores || []);
      // if tienda_id not selected, set default to first store
      if (!form.tienda_id && data.stores && data.stores.length > 0) {
        setForm(f => ({ ...f, tienda_id: String(data.stores[0].id) }));
      }
    } catch (err) {
      // non-fatal
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

  const openEdit = (product) => {
    setEditForm({ ...product });
    setEditing(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      const payload = {
        nombre: editForm.nombre,
        descripcion: editForm.descripcion,
        precio: Number(editForm.precio),
        stock: Number(editForm.stock),
        categoria: editForm.categoria,
        tienda_id: Number(editForm.tienda_id),
        es_premium: !!editForm.es_premium,
        estado: editForm.estado,
        imagen_url: editForm.imagen_url || null,
      };
      await updateProduct(token, editForm.id, payload);
      setMessage('Producto actualizado correctamente.');
      setEditing(false);
      setEditForm(null);
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
                <td>{(stores.find(s => s.id === product.tienda_id) || {}).nombre || product.tienda_id}</td>
                <td>{product.precio}</td>
                <td>{product.stock}</td>
                <td>{product.es_premium ? 'Sí' : 'No'}</td>
                <td>
                  {(isAdmin || isGerente) && <button onClick={() => openEdit(product)}>Editar</button>}
                  {(isAdmin || isGerente || isEmpleado) && <button onClick={() => handleUpdate(product)}>Actualizar stock</button>}
                  {isAdmin && <button className="danger" onClick={() => handleDelete(product)}>Eliminar</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && editForm && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Editar producto #{editForm.id}</h3>
            <form onSubmit={handleEditSubmit} className="vertical-form">
              <label>
                Nombre
                <input value={editForm.nombre} onChange={e => setEditForm({ ...editForm, nombre: e.target.value })} required />
              </label>
              <label>
                Descripción
                <input value={editForm.descripcion || ''} onChange={e => setEditForm({ ...editForm, descripcion: e.target.value })} />
              </label>
              <label>
                Precio
                <input value={editForm.precio} onChange={e => setEditForm({ ...editForm, precio: e.target.value })} type="number" step="0.01" required />
              </label>
              <label>
                Stock
                <input value={editForm.stock} onChange={e => setEditForm({ ...editForm, stock: e.target.value })} type="number" required />
              </label>
              <label>
                Categoría
                <input value={editForm.categoria || ''} onChange={e => setEditForm({ ...editForm, categoria: e.target.value })} />
              </label>
              <label>
                Tienda
                <select value={String(editForm.tienda_id)} onChange={e => setEditForm({ ...editForm, tienda_id: e.target.value })}>
                  {stores.map(s => (
                    <option key={s.id} value={s.id}>{s.nombre}</option>
                  ))}
                </select>
              </label>
              <label>
                Estado
                <select value={editForm.estado || 'activo'} onChange={e => setEditForm({ ...editForm, estado: e.target.value })}>
                  <option value="activo">activo</option>
                  <option value="inactivo">inactivo</option>
                  <option value="descontinuado">descontinuado</option>
                </select>
              </label>
              <label>
                Imagen URL
                <input value={editForm.imagen_url || ''} onChange={e => setEditForm({ ...editForm, imagen_url: e.target.value })} />
              </label>
              <div className="modal-actions">
                <button type="submit">Guardar</button>
                <button type="button" onClick={() => { setEditing(false); setEditForm(null); }}>Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductsPage;
