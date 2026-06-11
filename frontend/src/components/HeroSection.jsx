// HERO SECTION - used inside Home.jsx (not used separately anymore)
// This component exists but Home.jsx has its own hero section inline.
// Keeping it here for reference if we want to extract later.

const HeroSection = () => {
  return (
    <section style={{ padding: '60px 20px', textAlign: 'center' }}>
      <h1 style={{ fontSize: '3rem', color: '#fff', fontWeight: '800' }}>Welcome to Pizzeria</h1>
      <p style={{ color: '#666' }}>Order fresh, hot pizza delivered to your door</p>
    </section>
  );
};

export default HeroSection;
