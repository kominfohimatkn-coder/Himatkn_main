export default function PublicLoading() {
  return (
    <div aria-busy="true" aria-live="polite">
      <span className="sr-only">Memuat halaman...</span>

      <section className="relative flex min-h-[654px] flex-col justify-center overflow-hidden bg-green-950 max-[640px]:min-h-[620px]">
        <div className="site-container relative z-10 pt-[120px] pb-10 max-[640px]:pt-[140px] max-[640px]:pb-[150px]">
          <div className="h-12 w-full max-w-[560px] animate-pulse rounded-[4px] bg-white/10 max-[640px]:mx-auto" />
          <div className="mt-3 h-12 w-4/5 max-w-[460px] animate-pulse rounded-[4px] bg-white/10 max-[640px]:mx-auto" />
          <div className="mt-[18px] h-4 w-72 max-w-full animate-pulse rounded-[4px] bg-white/10 max-[640px]:mx-auto" />
          <div className="mt-[26px] flex gap-3 max-[640px]:justify-center">
            <div className="h-11 w-44 animate-pulse rounded-[4px] bg-white/20" />
            <div className="h-11 w-36 animate-pulse rounded-[4px] bg-white/10" />
          </div>
          <div className="mt-[110px] max-w-[915px] animate-pulse border-t border-white/25 pt-4 max-[640px]:hidden">
            <div className="h-4 w-40 rounded bg-white/10" />
            <div className="mt-2 h-3 w-24 rounded bg-white/10" />
          </div>
        </div>
      </section>

      <section className="bg-mint py-24 max-[640px]:py-[72px]">
        <div className="site-container grid gap-10 min-[961px]:grid-cols-[1fr_1.25fr] min-[961px]:gap-16">
          <div>
            <div className="h-3 w-28 animate-pulse rounded bg-green-900/10" />
            <div className="mt-4 h-9 w-full max-w-[420px] animate-pulse rounded bg-green-900/10" />
            <div className="mt-6 h-4 w-full max-w-[360px] animate-pulse rounded bg-green-900/10" />
          </div>
          <div className="border-t border-[#C9D7CF]">
            {[0, 1, 2].map((item) => (
              <div
                key={item}
                className="grid gap-4 border-b border-[#C9D7CF] py-[26px] min-[641px]:grid-cols-[110px_1fr]"
              >
                <div className="h-3 w-20 animate-pulse rounded bg-green-900/10" />
                <div className="space-y-2">
                  <div className="h-4 w-full max-w-[420px] animate-pulse rounded bg-green-900/10" />
                  <div className="h-4 w-3/4 animate-pulse rounded bg-green-900/10" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-line bg-paper py-24 max-[640px]:py-[72px]">
        <div className="site-container">
          <div className="h-3 w-28 animate-pulse rounded bg-green-900/10" />
          <div className="mt-4 h-9 w-full max-w-[460px] animate-pulse rounded bg-green-900/10" />
          <div className="mt-10 h-40 w-full animate-pulse rounded-[4px] border border-dashed border-[#C9D4CE] bg-white" />
        </div>
      </section>

      <section className="border-t border-line bg-paper py-24 max-[640px]:py-[72px]">
        <div className="site-container">
          <div className="h-3 w-28 animate-pulse rounded bg-green-900/10" />
          <div className="mt-4 h-9 w-full max-w-[460px] animate-pulse rounded bg-green-900/10" />
          <div className="mt-10 border-t border-line">
            {[0, 1, 2].map((item) => (
              <div
                key={item}
                className="grid gap-4 border-b border-line py-[30px] min-[901px]:grid-cols-[180px_1fr] min-[901px]:gap-6"
              >
                <div className="aspect-[3/2] w-[180px] max-w-full animate-pulse rounded-[4px] bg-green-900/10" />
                <div className="space-y-3">
                  <div className="h-4 w-3/4 animate-pulse rounded bg-green-900/10" />
                  <div className="h-3 w-40 animate-pulse rounded bg-green-900/10" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-green-950 py-24 max-[640px]:py-[72px]">
        <div className="site-container">
          <div className="h-3 w-36 animate-pulse rounded bg-white/10" />
          <div className="mt-4 h-9 w-full max-w-[460px] animate-pulse rounded bg-white/10" />
          <div className="mt-10 h-24 w-full animate-pulse rounded-[4px] border border-line-on-dark bg-white/5" />
        </div>
      </section>
    </div>
  );
}
