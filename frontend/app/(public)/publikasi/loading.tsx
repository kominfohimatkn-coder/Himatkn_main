export default function PublikasiLoading() {
  return (
    <section
      className="min-h-[60vh] pt-16 pb-20 min-[641px]:pt-[104px] min-[641px]:pb-[120px]"
      aria-busy="true"
      aria-live="polite"
    >
      <span className="sr-only">Memuat publikasi...</span>

      <div className="site-container">
        <div className="mx-auto h-11 w-40 animate-pulse rounded bg-green-900/10" />
        <div className="mx-auto mt-4 h-4 w-full max-w-[480px] animate-pulse rounded bg-green-900/10" />
        <div className="mx-auto mt-[30px] mb-10 h-px w-full max-w-[760px] bg-line" />

        <div className="mx-auto mt-8 h-12 max-w-[560px] animate-pulse rounded-[4px] border border-line bg-[#F7F9F8]" />
        <div className="mx-auto mt-3.5 h-5 w-40 animate-pulse rounded bg-green-900/10" />

        <ul className="mx-auto mt-4 max-w-(--container) border-t border-line">
          {[0, 1, 2].map((item) => (
            <li
              key={item}
              className="grid grid-cols-1 gap-3.5 border-b border-line py-[30px] min-[641px]:grid-cols-[180px_1fr] min-[641px]:gap-6"
            >
              <div className="aspect-3/2 w-[180px] max-w-full animate-pulse rounded-[4px] bg-green-900/10" />
              <div>
                <div className="h-[18px] w-3/5 animate-pulse rounded bg-green-900/10" />
                <div className="mt-3.5 h-3 w-[95%] animate-pulse rounded bg-green-900/10" />
                <div className="mt-2 h-3 w-3/4 animate-pulse rounded bg-green-900/10" />
                <div className="mt-4 flex items-center justify-between gap-4">
                  <div className="h-2.5 w-20 animate-pulse rounded bg-green-900/10" />
                  <div className="h-3 w-32 animate-pulse rounded bg-green-900/10" />
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
