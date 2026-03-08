const AnimatedBackground = () => (
  <div className="fixed inset-0 overflow-hidden gradient-bg" style={{ zIndex: -1 }}>
    <div className="orb orb-1" aria-hidden="true" />
    <div className="orb orb-2" aria-hidden="true" />
    <div className="orb orb-3" aria-hidden="true" />
    <div className="orb orb-4" aria-hidden="true" />
  </div>
);
export default AnimatedBackground;
