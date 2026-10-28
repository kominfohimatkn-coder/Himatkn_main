export default function PublicLoading() {
  return (
    <div aria-busy="true" aria-live="polite">
      <span className="sr-only">Memuat halaman...</span>

      <section className="home-hero min-h-150" data-tone="dark">
        <div className="home-hero-inner">
          <div className="mx-auto h-14 w-full max-w-180 animate-pulse bg-on-dark/10" />
          <div className="mx-auto mt-3 h-14 w-4/5 max-w-155 animate-pulse bg-on-dark/10" />
          <div className="mx-auto mt-6 h-3 w-64 max-w-full animate-pulse bg-on-dark/10" />
          <div className="mt-8 flex justify-center gap-2.5">
            <div className="h-11 w-40 animate-pulse bg-gold/30" />
            <div className="h-11 w-36 animate-pulse bg-on-dark/10" />
          </div>
        </div>
      </section>

      <section className="public-section bg-paper">
        <div className="site-container">
          <div className="h-2 w-24 animate-pulse bg-gold/30" />
          <div className="mt-5 h-10 w-full max-w-155 animate-pulse bg-ink/10" />
          <div className="mt-3 h-10 w-4/5 max-w-120 animate-pulse bg-ink/10" />
          <div className="mt-6 h-3 w-full max-w-140 animate-pulse bg-ink/10" />
          <div className="mt-2 h-3 w-3/4 max-w-105 animate-pulse bg-ink/10" />
          <div className="mt-10 grid gap-0 border-t border-l border-line-dark sm:grid-cols-3">
            {[0, 1, 2].map((item) => (
              <div
                key={item}
                className="h-36 animate-pulse border-r border-b border-line-dark bg-ink/5"
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
