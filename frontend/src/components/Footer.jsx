// FOOTER - using Bootstrap classes

const Footer = () => {
  return (
    <footer className="bg-deeper border-top border-dark-custom text-center py-5">
      <p className="brand-logo mb-1" style={{ letterSpacing: '3px', fontSize: '1.2rem' }}>PIZZERIA</p>
      <p className="text-secondary mb-3" style={{ fontSize: '0.85rem', letterSpacing: '1px' }}>Fresh. Hot. Delivered.</p>
      <div className="bg-brand mx-auto mb-3" style={{ width: '40px', height: '2px' }}></div>
      <p className="text-secondary" style={{ fontSize: '0.75rem', color: '#333' }}>© 2026 Pizzeria. All rights reserved.</p>
    </footer>
  );
};

export default Footer;
