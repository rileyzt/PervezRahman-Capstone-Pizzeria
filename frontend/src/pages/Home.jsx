// HOME PAGE - using Bootstrap grid and card classes

import { Link } from 'react-router-dom';

const categories = [
  { name: 'Pizza', desc: 'Classic & gourmet pizzas', path: '/menu/pizza' },
  { name: 'Sides', desc: 'Garlic bread, fries & more', path: '/menu/sides' },
  { name: 'Beverages', desc: 'Coke, mojitos & shakes', path: '/menu/beverages' },
  { name: 'Combo', desc: 'Meal deals & value packs', path: '/menu/combo' },
  { name: 'New Launches', desc: 'Try our latest creations', path: '/menu/new_launches' },
  { name: 'Bestsellers', desc: 'Most loved by customers', path: '/menu/bestsellers' },
];

const Home = () => {
  return (
    <div>
      <section className="bg-deeper d-flex flex-column align-items-center justify-content-center text-center py-5" style={{ minHeight: '520px' }}>
        <h1 className="fw-bold text-white hero-title" style={{ fontSize: '3.5rem', lineHeight: 1.1 }}>Delicious Pizza,</h1>
        <h1 className="fw-bold text-brand hero-title" style={{ fontSize: '3.5rem', lineHeight: 1.1 }}>Delivered Fast.</h1>
        <p className="text-secondary mt-3 mb-4" style={{ maxWidth: '450px' }}>
          Fresh ingredients. Bold flavors. Straight to your door.
        </p>
        <Link to="/menu" className="btn btn-danger px-5 py-3 fw-bold">Order Now</Link>
      </section>

      <section className="container py-5">
        <h2 className="fw-bold text-white text-center mb-4">Explore the Menu</h2>
        <div className="row g-3">
          {categories.map((cat) => (
            <div className="col-md-4" key={cat.name}>
              <Link to={cat.path} className="text-decoration-none">
                <div className="card menu-card p-4 border-dark-custom">
                  <h5 className="fw-semibold text-white mb-1">{cat.name}</h5>
                  <p className="text-secondary mb-0" style={{ fontSize: '0.85rem' }}>{cat.desc}</p>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </section>

      <section className="container pb-5">
        <h2 className="fw-bold text-white text-center mb-4">Why Pizzeria?</h2>
        <div className="card p-4 border-dark-custom">
          <div className="row text-center">
            <div className="col-md-4">
              <h3 className="fw-bold text-brand" style={{ fontSize: '2.5rem' }}>30</h3>
              <p className="text-secondary">Minute Delivery</p>
            </div>
            <div className="col-md-4 border-start border-dark-custom">
              <h3 className="fw-bold text-brand" style={{ fontSize: '2.5rem' }}>50+</h3>
              <p className="text-secondary">Menu Items</p>
            </div>
            <div className="col-md-4 border-start border-dark-custom">
              <h3 className="fw-bold text-brand" style={{ fontSize: '2.5rem' }}>10K+</h3>
              <p className="text-secondary">Happy Customers</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
