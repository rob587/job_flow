import { useState, useEffect } from "react";
import SearchBar from "./components/SearchBar";
import JobCard from "./components/JobCard";
import Loader from "./components/Loader";
import { jobService, preferencesService } from "./api/client";

function App() {
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [stats, setStats] = useState(null);

  // All'avvio, carichiamo gli annunci già salvati nel DB e le preferenze
  useEffect(() => {
    const initApp = async () => {
      try {
        const savedRes = await jobService.getSaved({ limit: 6 });

        // Controllo difensivo: se jobs non esiste o non è un array, usiamo array vuoto
        const savedJobs = Array.isArray(savedRes.data?.jobs)
          ? savedRes.data.jobs
          : [];

        if (savedJobs.length > 0) {
          setJobs(savedJobs);
          setHasSearched(true);
        }
      } catch (err) {
        console.error("Errore init:", err);
      }
    };
    initApp();
  }, []);
  const handleSearch = async (criteria) => {
    setIsLoading(true);
    setError(null);
    setJobs([]);
    setStats(null);

    try {
      // Salva le preferenze in background (non blocca la ricerca)
      preferencesService.save(criteria).catch(console.error);

      // Esegui la ricerca vera e propria
      const response = await jobService.search(criteria);

      setJobs(response.data.jobs);
      setStats(response.data.stats);
      setHasSearched(true);
    } catch (err) {
      setError(
        err.response?.data?.error ||
          "Si è verificato un errore durante la ricerca. Riprova.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* HEADER */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Job<span className="text-brand-600">Flow</span>
            </h1>
          </div>
          <div className="text-sm font-medium text-slate-500 hidden sm:block">
            Powered by AI 🤖
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="max-w-6xl mx-auto px-4 pt-8">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-3">
            Trova il lavoro giusto,{" "}
            <span className="text-brand-600">senza perdere tempo</span>.
          </h2>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Aggreghiamo offerte da Adzuna e Remotive, e usiamo l'AI per filtrare
            solo gli annunci che fanno davvero al caso tuo.
          </p>
        </div>

        {/* Barra di Ricerca */}
        <SearchBar onSearch={handleSearch} isLoading={isLoading} />

        {/* Statistiche ricerca (mostrate solo dopo una ricerca) */}
        {stats && !isLoading && (
          <div className="mt-6 flex flex-wrap gap-4 justify-center text-sm text-slate-600">
            <span className="bg-white px-3 py-1 rounded-full border border-slate-200 shadow-sm">
              📥 Scaricati: <strong>{stats.fetched}</strong>
            </span>
            <span className="bg-white px-3 py-1 rounded-full border border-slate-200 shadow-sm">
              🧠 Valutati AI: <strong>{stats.evaluated}</strong>
            </span>
            <span className="bg-white px-3 py-1 rounded-full border border-slate-200 shadow-sm">
              💾 Salvati: <strong>{stats.saved}</strong>
            </span>
            <span className="bg-white px-3 py-1 rounded-full border border-slate-200 shadow-sm">
              ⏱️ Tempo:{" "}
              <strong>{(stats.duration_ms / 1000).toFixed(1)}s</strong>
            </span>
          </div>
        )}

        {/* Stato Errore */}
        {error && (
          <div className="mt-8 p-4 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-center">
            {error}
          </div>
        )}

        {/* Loader */}
        {isLoading && <Loader />}

        {/* Lista Risultati */}
        {!isLoading && hasSearched && (
          <div className="mt-10">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-800">
                {jobs.length > 0
                  ? "Offerte consigliate per te"
                  : "Nessun risultato"}
              </h3>
              <span className="text-sm text-slate-500">
                {jobs.length} offerte trovate
              </span>
            </div>

            {jobs.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl border border-slate-200 border-dashed">
                <p className="text-slate-500 mb-2">
                  Nessun annuncio rilevante trovato con questi criteri.
                </p>
                <p className="text-sm text-slate-400">
                  Prova ad allargare la ricerca (es. rimuovi "Solo Remoto" o usa
                  parole chiave più generiche).
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {jobs.map((job) => (
                  <JobCard
                    key={`${job.source}-${job.external_id || job.id}`}
                    job={job}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Stato Iniziale (nessuna ricerca fatta) */}
        {!hasSearched && !isLoading && (
          <div className="mt-16 text-center text-slate-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-16 w-16 mx-auto mb-4 opacity-50"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <p className="text-lg font-medium">Inizia la tua ricerca</p>
            <p className="text-sm mt-1">
              Inserisci una parola chiave sopra per trovare il tuo prossimo
              lavoro.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
