const CodeSection = ({ title, note, actions, children, className = '' }) => (
  <section className={`code-section-frame${className ? ` ${className}` : ''}`}>
    <header className="code-section-heading">
      <div className="code-section-title-group">
        <h2>{title}</h2>
        {note && <span className="code-section-note">{note}</span>}
      </div>
      {actions && <div className="code-section-actions">{actions}</div>}
    </header>
    <div className="code-section-body">{children}</div>
  </section>
);

export default CodeSection;
