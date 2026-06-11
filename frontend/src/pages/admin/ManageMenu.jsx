// ADMIN - MANAGE MENU - with AI Description Generator button

import { useState, useEffect } from 'react';
import { getMenuItems, createMenuItem, updateMenuItem, deleteMenuItem, aiGenerateDescription } from '../../services/api';

const ManageMenu = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('pizza');
  const [image, setImage] = useState('');
  const [error, setError] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => { fetchItems(); }, []);

  const fetchItems = async () => {
    try { const res = await getMenuItems(''); setItems(res.data); } catch (err) { console.log(err); } finally { setLoading(false); }
  };

  const resetForm = () => { setName(''); setDescription(''); setPrice(''); setCategory('pizza'); setImage(''); setEditingId(null); setShowForm(false); setError(''); };

  const handleEdit = (item) => {
    setName(item.name); setDescription(item.description); setPrice(item.price.toString()); setCategory(item.category); setImage(item.image || ''); setEditingId(item._id); setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!name || !description || !price || !category) { setError('Please fill all fields'); return; }
    try {
      const data = { name, description, price: Number(price), category, image };
      if (editingId) { await updateMenuItem(editingId, data); } else { await createMenuItem(data); }
      resetForm(); fetchItems();
    } catch (err) { setError(err.response?.data?.message || 'Something went wrong'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this item?')) return;
    try { await deleteMenuItem(id); fetchItems(); } catch (err) { alert('Failed to delete'); }
  };

  // AI: generate description using Gemini
  const handleAIGenerate = async () => {
    if (!name) { setError('Enter item name first, then click AI Generate'); return; }
    try {
      setAiLoading(true);
      setError('');
      const response = await aiGenerateDescription({ name, category });
      setDescription(response.data.description);
    } catch (err) {
      setError('AI failed. Check your API key in .env');
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="container py-5" style={{ maxWidth: '800px' }}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="fw-bold text-white mb-0">Manage Menu</h1>
        <button className="btn btn-danger fw-semibold" onClick={() => { resetForm(); setShowForm(!showForm); }}>
          {showForm ? 'Cancel' : '+ Add Item'}
        </button>
      </div>
      {showForm && (
        <div className="card border-dark-custom p-4 mb-4">
          <h5 className="fw-semibold text-white mb-3">{editingId ? 'Edit Item' : 'Add New Item'}</h5>
          {error && <div className="alert py-2 mb-3" style={{ background: 'rgba(229,9,20,0.1)', border: 'none', color: '#E50914', fontSize: '0.9rem' }}>{error}</div>}

          <form onSubmit={handleSubmit}>
            <input className="form-control mb-2" placeholder="Item name" value={name} onChange={(e) => setName(e.target.value)} />
            <div className="d-flex gap-2 mb-2">
              <input className="form-control" placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
              <button type="button" className="btn btn-sm fw-semibold text-nowrap" style={{ background: '#7C3AED', color: '#fff', minWidth: '120px' }} onClick={handleAIGenerate} disabled={aiLoading}>
                {aiLoading ? 'Generating...' : 'AI Generate'}
              </button>
            </div>

            <input className="form-control mb-2" placeholder="Price (₹)" type="number" value={price} onChange={(e) => setPrice(e.target.value)} />
            <select className="form-select mb-2" value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="pizza">Pizza</option>
              <option value="sides">Sides</option>
              <option value="beverages">Beverages</option>
              <option value="combo">Combo</option>
              <option value="new_launches">New Launches</option>
              <option value="bestsellers">Bestsellers</option>
            </select>
            <input className="form-control mb-3" placeholder="Image path (e.g. /images/margherita.jpg)" value={image} onChange={(e) => setImage(e.target.value)} />
            <button type="submit" className="btn btn-danger w-100 fw-semibold">{editingId ? 'Update Item' : 'Add Item'}</button>
          </form>
        </div>
      )}
      {loading ? (
        <p className="text-center text-secondary py-5">Loading...</p>
      ) : items.length === 0 ? (
        <p className="text-center text-secondary py-5">No items in menu. Add some!</p>
      ) : (
        items.map((item) => (
          <div className="card border-dark-custom p-3 mb-2" key={item._id}>
            <div className="d-flex align-items-center gap-3">
              <div className="flex-grow-1">
                <span className="fw-semibold text-white">{item.name}</span>
                <br />
                <small className="text-secondary text-capitalize">{item.category}</small>
              </div>
              <span className="text-brand fw-bold">₹{item.price}</span>
              <button className="btn btn-dark btn-sm border-secondary" onClick={() => handleEdit(item)}>Edit</button>
               <button className="btn btn-sm" style={{ background: 'rgba(229,9,20,0.15)', color: '#E50914', border: '1px solid rgba(229,9,20,0.3)' }} onClick={() => handleDelete(item._id)}>Delete</button>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default ManageMenu;
