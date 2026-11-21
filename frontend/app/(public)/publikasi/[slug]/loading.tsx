export default function PublikasiDetailLoading() {
  return (
    <section
      className="min-h-[60vh] pt-16 pb-20 min-[641px]:pt-[104px] min-[641px]:pb-[120px]"
      aria-busy="true"
      aria-live="polite"
    >
      <span className="sr-only">Memuat detail publikasi...</span>

      <div className="site-container">
        <div className="mx-auto max-w-[720px]">
          <div className="mb-7 flex flex-col gap-2 min-[641px]:flex-row">
            <div className="h-11 w-full animate-pulse rounded-[4px] border border-line bg-[#F7F9F8]" />
            <div className="h-11 w-20 animate-pulse rounded-[4px] bg-green-800/20" />
          </div>
        </div>

        <div className="mx-auto max-w-[720px]">
          <div className="h-3 w-40 animate-pulse rounded bg-green-900/10" />
          <div className="mt-5 h-10 w-4/5 animate-pulse rounded bg-green-900/10" />
          <div className="mt-4 h-3.5 w-2/5 animate-pulse rounded bg-green-900/10" />
          <div className="my-8 aspect-video w-full animate-pulse rounded-[4px] bg-green-900/10" />
          <div className="space-y-3">
            {[0, 1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className={`h-3.5 animate-pulse rounded bg-green-900/10 ${
                  item === 4 ? "w-2/3" : "w-full"
                }`}
              />
            ))}
          </div>
          <div className="mt-10 h-px w-full bg-line" />
        </div>
      </div>
    </section>
  );
}
