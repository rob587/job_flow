export default function Loader() {
  return (
    <div className="flex flex-col items-center justify-center py-20 animate-pulse">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 border-4 border-brand-100 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-brand-600 rounded-full border-t-transparent animate-spin"></div>
      </div>
      <h3 className="mt-6 text-lg font-semibold text-slate-700">
        Analisi in corso...
      </h3>
      <p className="mt-2 text-sm text-slate-500 text-center max-w-xs">
        Stiamo scaricando gli annunci e interrogando l'AI per trovare i match
        perfetti. Ci vorranno circa 10-20 secondi.
      </p>
    </div>
  );
}
