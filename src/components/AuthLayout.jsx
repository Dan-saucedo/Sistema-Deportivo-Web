import '../styles/auth.css';

const AuthLayout = ({ children }) => {
  return (
    <div className="auth-container">
      {/* Panel Izquierdo */}
      <aside className="auth-brand-panel">
        <div className="auth-logo">
          <span className="auth-logo-acronym">UTR</span>
          <span className="auth-logo-text">
            UNIVERSIDAD TECNOLÓGICA
            <br />
            EL RETOÑO
          </span>
        </div>

        <div className="auth-hero">
          <span className="auth-badge">DEPORTES · COMUNIDAD UTR</span>
          <h1 className="auth-hero-title">
            Tu siguiente jugada empieza aquí.
          </h1>
          <p className="auth-hero-subtitle">
            Pide el material. Reúne a tu equipo.
            <br />
            Disfruta tu campus.
          </p>

          <div className="auth-court-wrapper">
            <svg viewBox="0 0 400 180" fill="none" xmlns="http://www.w3.org/2000/svg" width="100%">
              <rect x="4" y="4" width="392" height="172" rx="14" stroke="#7C93F8" strokeWidth="6" />
              <line x1="200" y1="4" x2="200" y2="176" stroke="#7C93F8" strokeWidth="5" />
              <circle cx="200" cy="90" r="36" stroke="#7C93F8" strokeWidth="5" />
              <rect x="4" y="48" width="54" height="84" stroke="#7C93F8" strokeWidth="5" />
              <rect x="342" y="48" width="54" height="84" stroke="#7C93F8" strokeWidth="5" />
            </svg>
            <div className="auth-court-pill">Menos espera. Más juego.</div>
          </div>
        </div>

        <div className="auth-brand-footer">
          SISTEMA DE PRÉSTAMO DE MATERIAL DEPORTIVO
        </div>
      </aside>

      {/* Panel Derecho */}
      <main className="auth-form-panel">
        <div className="auth-form-box">{children}</div>

        <footer className="auth-disclaimer">
          Acceso exclusivo para la comunidad UTR.
          <br />
          Tus datos se utilizan para gestionar los préstamos.
        </footer>
      </main>
    </div>
  );
};

export default AuthLayout;