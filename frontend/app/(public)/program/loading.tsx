export default function ProgramLoading() {
  return (
    <section
      className="min-h-[60vh] pt-16 pb-20 min-[641px]:pt-[104px] min-[641px]:pb-[120px]"
      aria-busy="true"
      aria-live="polite"
    >
      <span className="sr-only">Memuat program kerja...</span>

      <div className="site-container">
        <div className="mx-auto h-11 w-52 animate-pulse rounded bg-green-900/10" />
        <div className="mx-auto mt-4 h-4 w-full max-w-[520px] animate-pulse rounded bg-green-900/10" />
        <div className="mx-auto mt-[30px] mb-10 h-px w-full max-w-[760px] bg-line" />

        <div className="mx-auto mt-8 h-12 max-w-[560px] animate-pulse rounded-[4px] border border-line bg-[#F7F9F8]" />
        <div className="mx-auto mt-3.5 h-5 w-40 animate-pulse rounded bg-green-900/10" />
        <div className="mt-2 flex justify-center">
          <div className="inline-flex gap-1 rounded-[4px] border border-line bg-paper p-1">
            {["w-[72px]", "w-[88px]", "w-[96px]", "w-[80px]"].map((width) => (
              <div
                key={width}
                className={`h-[38px] animate-pulse rounded-[3px] bg-green-900/10 ${width}`}
              />
            ))}
          </div>
        </div>

        <ul className="mx-auto mt-10 grid max-w-(--container) gap-3.5 min-[641px]:block min-[641px]:border-t min-[641px]:border-line">
          {[0, 1, 2].map((item) => (
            <li
              key={item}
              className="grid grid-cols-1 gap-0 rounded-[4px] border border-line bg-white p-[18px] min-[641px]:grid-cols-[160px_1fr_140px] min-[641px]:gap-x-6 min-[641px]:rounded-none min-[641px]:border-x-0 min-[641px]:border-t-0 min-[641px]:border-b min-[641px]:bg-transparent min-[641px]:px-0 min-[641px]:pt-[26px] min-[641px]:pb-[22px]"
            >
              <span className="h-[26px] w-24 animate-pulse rounded-[3px] bg-green-900/10" />
              <div>
                <div className="mt-3 h-[18px] w-2/5 animate-pulse rounded bg-green-900/10 min-[641px]:mt-2" />
                <div className="mt-3.5 h-3 w-[90%] animate-pulse rounded bg-green-900/10" />
                <div className="mt-2 h-3 w-[70%] animate-pulse rounded bg-green-900/10" />
              </div>
              <div className="hidden pt-2 min-[641px]:block">
                <div className="ml-auto h-3 w-[70px] animate-pulse rounded bg-green-900/10" />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
