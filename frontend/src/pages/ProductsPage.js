import { useEffect, useState } from 'react';
import { getProducts, createProduct, updateProduct, deleteProduct, getStores } from '../api/api';
import { useAuth } from '../context/AuthContext';

function StockBadge({ stock }) {
  if (stock === 0)  return <span className="badge badge-danger">Sin stock</span>;
  if (stock <= 5)   return <span className="badge badge-warning">{stock} bajo</span>;
  return <span className="badge badge-success">{stock}</span>;
}

function ProductsPage() {
  const { token, user } = useAuth();
  const [products, setProducts] = useState([]);
  const [stores, setStores] = useState([]);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ nombre: '', descripcion: '', precio: '', stock: '', categoria: '', tienda_id: '', es_premium: false });
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState(null);

  const userRoles = user?.roles || [];
  const isAdmin   = userRoles.includes('Administrador');
  const isGerente = userRoles.includes('Gerente');
  const isEmpleado = userRoles.includes('Empleado');

  useEffect(() => { loadProducts(); loadStores(); }, []); // eslint-disable-line

  const loadProducts = async () => {
    setError('');
    try {
      const data = await getProducts(token);
      setProducts(data.products || []);
    } catch (err) { setError(err.message); }
  };

  const loadStores = async () => {
    try {
      const data = await getStores(token);
      setStores(data.stores || []);
      if (!form.tienda_id && data.stores?.length > 0)
        setForm(f => ({ ...f, tienda_id: String(data.stores[0].id) }));
    } catch (_) {}
  };

  const handleCreate = async e => {
    e.preventDefault(); setError(''); setMessage('');
    try {
      await createProduct(token, {
        nombre: form.nombre, descripcion: form.descripcion,
        precio: Number(form.precio), stock: Number(form.stock),
        categoria: form.categoria, tienda_id: Number(form.tienda_id),
        es_premium: form.es_premium,
      });
      setMessage('Producto creado correctamente.');
      setForm({ nombre: '', descripcion: '', precio: '', stock: '', categoria: '', tienda_id: stores[0]?.id || '1', es_premium: false });
      setShowCreate(false);
      loadProducts();
    } catch (err) { setError(err.message); }
  };

  const handleEditSubmit = async e => {
    e.preventDefault(); setError(''); setMessage('');
    try {
      await updateProduct(token, editForm.id, {
        nombre: editForm.nombre, descripcion: editForm.descripcion,
        precio: Number(editForm.precio), stock: Number(editForm.stock),
        categoria: editForm.categoria, tienda_id: Number(editForm.tienda_id),
        es_premium: !!editForm.es_premium, estado: editForm.estado,
        imagen_url: editForm.imagen_url || null,
      });
      setMessage('Producto actualizado correctamente.');
      setEditing(false); setEditForm(null);
      loadProducts();
    } catch (err) { setError(err.message); }
  };

  const handleUpdate = async product => {
    const stock = prompt('Nuevo stock', product.stock);
    if (stock == null) return;
    setError(''); setMessage('');
    try {
      await updateProduct(token, product.id, { stock: Number(stock) });
      setMessage('Stock actualizado.');
      loadProducts();
    } catch (err) { setError(err.message); }
  };

  const handleDelete = async product => {
    if (!window.confirm(`¿Eliminar "${product.nombre}"?`)) return;
    setError(''); setMessage('');
    try {
      await deleteProduct(token, product.id);
      setMessage('Producto eliminado.');
      loadProducts();
    } catch (err) { setError(err.message); }
  };

  const storeName = id => (stores.find(s => s.id === id) || {}).nombre || id;

  return (
    <div>
      {error   && <div className="alert alert-error">⚠ {error}</div>}
      {message && <div className="alert alert-success">✓ {message}</div>}

      {/* Header */}
      <div className="section-header">
        <div>
          <div className="section-title">Inventario de Productos</div>
          <div className="section-subtitle">{products.length} productos registrados</div>
        </div>
        {(isAdmin || isGerente) && (
          <button className="btn btn-primary btn-sm" onClick={() => setShowCreate(v => !v)}>
            {showCreate ? '✕ Cancelar' : '+ Nuevo producto'}
          </button>
        )}
      </div>

      {/* Create form */}
      {showCreate && (
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="card-header">
            <div className="card-title">Nuevo producto</div>
          </div>
          <form onSubmit={handleCreate} className="vform">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label>Nombre</label>
                <input value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} required />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label>Descripción</label>
                <input value={form.descripcion} onChange={e => setForm({ ...form, descripcion: e.target.value })} />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label>Precio</label>
                <input value={form.precio} onChange={e => setForm({ ...form, precio: e.target.value })} type="number" step="0.01" required />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label>Stock</label>
                <input value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} type="number" required />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label>Categoría</label>
                <input value={form.categoria} onChange={e => setForm({ ...form, categoria: e.target.value })} />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label>Tienda</label>
                <select value={form.tienda_id} onChange={e => setForm({ ...form, tienda_id: e.target.value })}>
                  {stores.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
                </select>
              </div>
            </div>
            <label className="checkbox-row">
              <input type="checkbox" checked={form.es_premium} onChange={e => setForm({ ...form, es_premium: e.target.checked })} />
              Producto premium
            </label>
            <div style={{ display: 'flex', gap: 10 }}>
              <button type="submit" className="btn btn-primary btn-sm">Crear producto</button>
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowCreate(false)}>Cancelar</button>
            </div>
          </form>
        </div>
      )}

      {/* Table */}
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Nombre</th>
              <th>Categoría</th>
              <th>Tienda</th>
              <th>Precio</th>
              <th>Stock</th>
              <th>Premium</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p.id}>
                <td style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>{p.id}</td>
                <td style={{ fontWeight: 600 }}>{p.nombre}</td>
                <td><span style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>{p.categoria || '—'}</span></td>
                <td style={{ fontSize: '0.85rem' }}>{storeName(p.tienda_id)}</td>
                <td style={{ fontWeight: 600 }}>${Number(p.precio).toFixed(2)}</td>
                <td><StockBadge stock={p.stock} /></td>
                <td>{p.es_premium ? <span className="badge badge-premium">⭐ Premium</span> : <span style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>—</span>}</td>
                <td>
                  <div className="td-actions">
                    {(isAdmin || isGerente) && (
                      <button className="btn btn-secondary btn-sm" onClick={() => { setEditForm({ ...p }); setEditing(true); }}>Editar</button>
                    )}
                    {(isAdmin || isGerente || isEmpleado) && (
                      <button className="btn btn-secondary btn-sm" onClick={() => handleUpdate(p)}>Stock</button>
                    )}
                    {isAdmin && (
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p)}>Eliminar</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr><td colSpan={8} style={{ textAlign: 'center', color: 'var(--muted)', padding: '32px' }}>No hay productos registrados.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Edit modal */}
      {editing && editForm && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Editar producto #{editForm.id}</h3>
              <button className="modal-close" onClick={() => { setEditing(false); setEditForm(null); }}>✕</button>
            </div>
            <form onSubmit={handleEditSubmit} className="vform">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label>Nombre</label>
                  <input value={editForm.nombre} onChange={e => setEditForm({ ...editForm, nombre: e.target.value })} required />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label>Descripción</label>
                  <input value={editForm.descripcion || ''} onChange={e => setEditForm({ ...editForm, descripcion: e.target.value })} />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label>Precio</label>
                  <input value={editForm.precio} onChange={e => setEditForm({ ...editForm, precio: e.target.value })} type="number" step="0.01" required />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label>Stock</label>
                  <input value={editForm.stock} onChange={e => setEditForm({ ...editForm, stock: e.target.value })} type="number" required />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label>Categoría</label>
                  <input value={editForm.categoria || ''} onChange={e => setEditForm({ ...editForm, categoria: e.target.value })} />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label>Tienda</label>
                  <select value={String(editForm.tienda_id)} onChange={e => setEditForm({ ...editForm, tienda_id: e.target.value })}>
                    {stores.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
                  </select>
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label>Estado</label>
                  <select value={editForm.estado || 'activo'} onChange={e => setEditForm({ ...editForm, estado: e.target.value })}>
                    <option value="activo">Activo</option>
                    <option value="inactivo">Inactivo</option>
                    <option value="descontinuado">Descontinuado</option>
                  </select>
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label>Imagen URL</label>
                  <input value={editForm.imagen_url || ''} onChange={e => setEditForm({ ...editForm, imagen_url: e.target.value })} />
                </div>
              </div>
              <label className="checkbox-row">
                <input type="checkbox" checked={!!editForm.es_premium} onChange={e => setEditForm({ ...editForm, es_premium: e.target.checked })} />
                Producto premium
              </label>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => { setEditing(false); setEditForm(null); }}>Cancelar</button>
                <button type="submit" className="btn btn-primary">Guardar cambios</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductsPage;
