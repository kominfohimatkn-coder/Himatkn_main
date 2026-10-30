export default function StrukturLoading() {
  return (
    <div
      className="structure-page"
      data-tone="dark"
      aria-busy="true"
      aria-live="polite"
    >
      <span className="sr-only">Memuat susunan kepengurusan...</span>

      <section className="structure-hero">
        <div className="site-container">
          <div className="h-2 w-32 animate-pulse bg-gold/30" />
          <div className="mt-5 flex gap-2">
            <div className="h-7 w-28 animate-pulse border border-gold/20 bg-on-dark/10" />
            <div className="h-7 w-24 animate-pulse border border-gold/20 bg-on-dark/10" />
          </div>
          <div className="mt-5 h-16 w-full max-w-180 animate-pulse bg-on-dark/10" />
          <div className="mt-4 h-3 w-full max-w-140 animate-pulse bg-on-dark/10" />
        </div>
      </section>

      <section className="structure-content">
        <div className="site-container">
          <div className="mx-auto h-11 w-full max-w-78 animate-pulse border border-gold/20 bg-on-dark/10" />
          <div className="mx-auto mt-5 h-12 w-full max-w-140 animate-pulse bg-on-dark/10" />
          <div className="mx-auto mt-10 h-10 w-64 max-w-full animate-pulse bg-on-dark/10" />
          <div className="mx-auto mt-10 grid max-w-190 grid-cols-2 gap-4 sm:grid-cols-3">
            {[0, 1, 2, 3, 4, 5].map((item) => (
              <div
                key={item}
                className="aspect-[4/5] animate-pulse border border-gold/20 bg-on-dark/10"
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
