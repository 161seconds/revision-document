const foundationCards = [
  { label: 'Typography', detail: 'Readable hierarchy' },
  { label: 'Color & Contrast', detail: 'Accessible palettes' },
  { label: 'Interaction', detail: 'Responsive states' },
];

export default function App() {
  return (
    <main className="page">
      <section className="hero-copy">
        <h1 className="hero-title">Nested Website Fixture</h1>
        <p className="hero-hook">The served app lives in website/, one level below the repo root.</p>
      </section>
      <section id="features" className="feature-grid">
        <article className="feature-card">One</article>
        <article className="feature-card">Two</article>
      </section>
      <section className="foundation-grid" aria-label="Foundation cards">
        {foundationCards.map((card) => (
          <article className="foundation-card" key={card.label}>
            <span className="foundation-card-label">{card.label}</span>
            <p className="foundation-card-detail">{card.detail}</p>
          </article>
        ))}
      </section>
      <section className="action-row" aria-label="Workshop actions">
        <span className="primary-action" role="button" tabIndex="0">Learn more</span>
        <span className="secondary-action" role="button" tabIndex="0">Learn more</span>
      </section>
    </main>
  );
}
