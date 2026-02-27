export default function LoadingShimmer() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-6 bg-slate-800 rounded w-1/3"></div>
      <div className="h-32 bg-slate-800 rounded"></div>
      <div className="h-6 bg-slate-800 rounded w-2/3"></div>
    </div>
  );
}
