// MENU PAGE 

import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getMenuItems, searchMenu, getSmartRecommendations } from '../services/api';
import MenuItemCard from '../components/MenuItemCard';

const categories = ['all', 'pizza', 'sides', 'beverages', 'combo', 'new_launches', 'bestsellers'];

const Menu = () => {
  const { category } = useParams();
  const [items, setItems] = useState([]);
  const [activeCategory, setActiveCategory] = useState(category || 'all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // AI Smart Recommendation state
  const [recommendQuery, setRecommendQuery] = useState('');
  const [recommendedItems, setRecommendedItems] = useState([]);
  const [recommendMsg, setRecommendMsg] = useState('');
  const [recommendLoading, setRecommendLoading] = useState(false);

  useEffect(() => { fetchItems(); }, [activeCategory]);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const cat = activeCategory === 'all' ? '' : activeCategory;
      const response = await getMenuItems(cat);
      setItems(response.data);
    } catch (error) {
      console.log('Error fetching menu:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) { fetchItems(); return; }
    try {
      setLoading(true);
      const response = await searchMenu(searchQuery);
      setItems(response.data);
    } catch (error) {
      console.log('Error searching:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleSearch();
  };

  // AI Smart Recommendation handler
  const handleRecommend = async () => {
    if (!recommendQuery.trim()) return;
    try {
      setRecommendLoading(true);
      setRecommendedItems([]);
      setRecommendMsg('');
      const response = await getSmartRecommendations(recommendQuery);
      setRecommendedItems(response.data.items);
      setRecommendMsg(response.data.message);
    } catch (error) {
      console.log('Recommendation error:', error);
      setRecommendMsg('Could not get recommendations right now');
    } finally {
      setRecommendLoading(false);
    }
  };

  const handleRecommendKeyPress = (e) => {
    if (e.key === 'Enter') handleRecommend();
  };

  return (
    <div className="container py-5">
      <h1 className="fw-bold text-white mb-4">Our Menu</h1>

      <div className="card mb-4" style={{ background: 'linear-gradient(135deg, #1a1a2e, #16213e)', border: '1px solid #E50914' }}>
        <div className="card-body">
          <h6 className="text-white fw-bold mb-2">AI Smart Recommendation</h6>
          <p className="text-secondary mb-3" style={{ fontSize: '0.85rem' }}>
            Describe what you are in the mood for and our AI will pick the best items for you
          </p>
          <div className="d-flex gap-2">
            <input
              type="text"
              className="form-control py-2"
              placeholder='Try: "something spicy and vegetarian" or "light snack under 200"'
              value={recommendQuery}
              onChange={(e) => setRecommendQuery(e.target.value)}
              onKeyDown={handleRecommendKeyPress}
              style={{ background: '#0d1117', color: '#fff', border: '1px solid #333' }}
            />
            <button
              className="btn btn-danger px-4 fw-semibold"
              onClick={handleRecommend}
              disabled={recommendLoading}
            >
              {recommendLoading ? 'Finding...' : 'Recommend'}
            </button>
          </div>

          {recommendedItems.length > 0 && (
            <div className="mt-3">
              <p className="text-secondary mb-2" style={{ fontSize: '0.85rem' }}>{recommendMsg}</p>
              <div className="row g-3">
                {recommendedItems.map((item) => (
                  <div className="col-md-4" key={item._id}>
                    <MenuItemCard item={item} />
                  </div>
                ))}
              </div>
              <button
                className="btn btn-outline-secondary btn-sm mt-2"
                onClick={() => { setRecommendedItems([]); setRecommendMsg(''); setRecommendQuery(''); }}
              >
                Clear Recommendations
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="d-flex gap-2 mb-4">
        <input
          type="text"
          className="form-control py-2"
          placeholder="Search for pizza, sides, drinks..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleKeyPress}
        />
        <button className="btn btn-danger px-4 fw-semibold" onClick={handleSearch}>Search</button>
      </div>

      <div className="d-flex flex-wrap gap-2 mb-4">
        {categories.map((cat) => (
          <button
            key={cat}
            className={activeCategory === cat ? 'btn btn-danger btn-sm tab-active' : 'btn btn-dark btn-sm'}
            onClick={() => { setActiveCategory(cat); setSearchQuery(''); }}
            style={{ textTransform: 'capitalize' }}
          >
            {cat === 'all' ? 'All' : cat.replace('_', ' ')}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-center text-secondary py-5">Loading menu...</p>
      ) : items.length === 0 ? (
        <p className="text-center text-secondary py-5">No items found</p>
      ) : (
        <div className="row g-3">
          {items.map((item) => (
            <div className="col-md-4" key={item._id}>
              <MenuItemCard item={item} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Menu;

