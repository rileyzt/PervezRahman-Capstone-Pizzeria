// MENU ITEM CARD — using Bootstrap card classes

import { useCart } from '../context/CartContext';

const MenuItemCard = ({ item }) => {
  const { addToCart } = useCart();

  return (
    <div className="card menu-card border-dark-custom overflow-hidden h-100">
      {/* Image */}
      <div className="bg-deeper" style={{ height: '180px', overflow: 'hidden' }}>
        {item.image ? (
          <img src={item.image} alt={item.name} className="w-100 h-100" style={{ objectFit: 'cover' }} />
        ) : (
          <div className="d-flex align-items-center justify-content-center w-100 h-100 bg-card-hover">
            <span className="text-brand fw-bold" style={{ fontSize: '3rem' }}>{item.name[0]}</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="card-body p-3">
        <h6 className="fw-semibold text-white mb-1">{item.name}</h6>
        <p className="text-secondary mb-3" style={{ fontSize: '0.8rem', lineHeight: '1.4' }}>{item.description}</p>
        <div className="d-flex justify-content-between align-items-center">
          <span className="text-brand fw-bold" style={{ fontSize: '1.1rem' }}>₹{item.price}</span>
          <button className="btn btn-danger btn-sm fw-semibold px-3" onClick={() => addToCart(item)}>
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default MenuItemCard;
