/** Skeleton mengikuti `treeSkel` di Design/assets/app.js. */
function PersonSkeleton() {
  return (
    <div className="w-full max-w-[330px] rounded-[3px] border border-line bg-white px-[18px] pt-5 pb-[22px] min-[641px]:w-[250px]">
      <div className="mx-auto mb-[18px] size-[100px] animate-pulse rounded-full bg-green-900/10" />
      <div className="mx-auto h-4 w-3/5 animate-pulse rounded bg-green-900/10" />
      <div className="mx-auto mt-3 h-3.5 w-4/5 animate-pulse rounded bg-green-900/10" />
    </div>
  );
}

export default function StrukturLoading() {
  return (
    <section
      className="min-h-[60vh] pt-16 pb-20 min-[641px]:pt-[104px] min-[641px]:pb-[120px]"
      aria-busy="true"
      aria-live="polite"
    >
      <span className="sr-only">Memuat susunan kepengurusan...</span>

      <div className="site-container">
        <div className="mx-auto h-11 w-72 max-w-full animate-pulse rounded bg-green-900/10" />
        <div className="mx-auto mt-[30px] mb-10 h-px w-full max-w-[760px] bg-line" />
        <div className="mx-auto h-[46px] w-64 animate-pulse rounded-[4px] border border-line bg-paper" />
        <div className="mx-auto mt-11 h-[66px] w-full max-w-[400px] animate-pulse rounded-[4px] border border-line bg-[#F7F9F8]" />
        <div className="mx-auto mt-14 h-[26px] w-[280px] max-w-full animate-pulse rounded bg-green-900/10" />

        <div className="mt-10 flex flex-col items-center gap-3.5 min-[641px]:flex-row min-[641px]:justify-center">
          <PersonSkeleton />
          <PersonSkeleton />
          <PersonSkeleton />
        </div>
      </div>
    </section>
  );
}
