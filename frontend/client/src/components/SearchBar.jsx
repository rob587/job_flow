import { useState } from "react";

const SearchBar = ({ onSearch, isLoading }) => {
  const [keywords, setKeywords] = useState("");
  const [location, setLocation] = useState("");
  const [remoteOnly, setRemoteOnly] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!keywords.trim()) return;

    onSearch({
      keywords,
      location,
      remoteOnly,
      jobType: "full-time",
    });
  };
  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200"
      >
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* Input Keywords */}
          <div className="md:col-span-5">
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Cosa cerchi?
            </label>
            <input
              type="text"
              placeholder="Es. Junior Frontend, React Developer..."
              className="input-field"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              disabled={isLoading}
            />
          </div>

          {/* Input Location */}
          <div className="md:col-span-4">
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Dove? (opzionale)
            </label>
            <input
              type="text"
              placeholder="Es. Milano, Roma, Italia..."
              className="input-field"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              disabled={isLoading}
            />
          </div>

          {/* Checkbox Remoto */}
          <div className="md:col-span-3 flex items-end pb-2">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                className="w-5 h-5 text-brand-600 border-slate-300 rounded focus:ring-brand-500"
                checked={remoteOnly}
                onChange={(e) => setRemoteOnly(e.target.checked)}
                disabled={isLoading}
              />
              <span className="text-sm font-medium text-slate-700">
                Solo Remoto
              </span>
            </label>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="submit"
            className="btn-primary flex items-center space-x-2"
            disabled={isLoading || !keywords.trim()}
          >
            <span>{isLoading ? "Ricerca in corso..." : "Cerca Offerte"}</span>
            {!isLoading && (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            )}
          </button>
        </div>
      </form>
    </>
  );
};

export default SearchBar;
