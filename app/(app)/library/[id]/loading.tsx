export default function LibraryEntryDetailLoading() {
  return (
    <div className="flex flex-col gap-6">
      {/* Hero skeleton */}
      <div
        className="animate-pulse rounded-[22px] border-2 border-[#3B1F47] p-6"
        style={{ background: "#FFFCFE" }}
      >
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start sm:gap-6">
          {/* Cover placeholder */}
          <div className="h-[180px] w-[120px] flex-shrink-0 rounded-lg bg-[#FFD0E7]" />
          <div className="flex flex-1 flex-col gap-3">
            <div className="h-8 w-3/4 rounded-full bg-[#FFD0E7]" />
            <div className="h-5 w-1/2 rounded-full bg-[#E8D5F5]" />
            <div className="h-6 w-20 rounded-full bg-[#FFD0E7]" />
          </div>
        </div>
      </div>

      {/* Stats skeleton */}
      <div
        className="animate-pulse rounded-[22px] border-2 border-[#3B1F47] p-6"
        style={{ background: "#FFFCFE" }}
      >
        <div className="flex flex-col gap-3">
          <div className="h-4 w-full rounded-full bg-[#FFD0E7]" />
          <div className="h-4 w-2/3 rounded-full bg-[#E8D5F5]" />
          <div className="h-4 w-1/2 rounded-full bg-[#E8D5F5]" />
        </div>
      </div>

      {/* Synopsis skeleton */}
      <div
        className="animate-pulse rounded-[22px] border-2 border-[#3B1F47] p-6"
        style={{ background: "#FFFCFE" }}
      >
        <div className="flex flex-col gap-2">
          <div className="h-6 w-24 rounded-full bg-[#FFD0E7]" />
          <div className="h-4 w-full rounded-full bg-[#E8D5F5]" />
          <div className="h-4 w-full rounded-full bg-[#E8D5F5]" />
          <div className="h-4 w-3/4 rounded-full bg-[#E8D5F5]" />
        </div>
      </div>
    </div>
  );
}
