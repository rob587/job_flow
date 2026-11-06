import React from "react";

const JobCard = () => {
  const getScoreColor = (score) => {
    if (score >= 80) return "bg-emerald-500";
    if (score >= 60) return "bg-amber-500";
    return "bg-rose-500";
  };

  const getScoreTextColor = (score) => {
    if (score >= 80) return "text-emerald-700 bg-emerald-50 border-emerald-200";
    if (score >= 60) return "text-amber-700 bg-amber-50 border-amber-200";
    return "text-rose-700 bg-rose-50 border-rose-200";
  };

  // Formatta la data
  const formatDate = (dateString) => {
    if (!dateString) return "Data non disponibile";
    const date = new Date(dateString);
    return date.toLocaleDateString("it-IT", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <>
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow flex flex-col h-full">
        {/* Header: Titolo e Azienda */}
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="text-lg font-bold text-slate-900 leading-tight mb-1">
              {job.title}
            </h3>
            <p className="text-brand-600 font-medium">{job.company}</p>
          </div>

          {/* Badge Score */}
          <div
            className={`px-3 py-1 rounded-full border text-sm font-bold flex items-center space-x-1 ${getScoreTextColor(job.ai_score)}`}
          >
            <span>{job.ai_score}/100</span>
          </div>
        </div>

        {/* Barra Score Visiva */}
        <div className="w-full bg-slate-100 rounded-full h-1.5 mb-4">
          <div
            className={`h-1.5 rounded-full ${getScoreColor(job.ai_score)}`}
            style={{ width: `${job.ai_score}%` }}
          ></div>
        </div>

        {/* Info secondarie */}
        <div className="flex flex-wrap gap-2 mb-4 text-xs font-medium text-slate-600">
          <span className="bg-slate-100 px-2 py-1 rounded-md flex items-center">
            📍 {job.location}
          </span>
          {job.is_remote && (
            <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-md">
              🌍 Remoto
            </span>
          )}
          <span className="bg-slate-100 px-2 py-1 rounded-md">
            📅 {formatDate(job.published_at)}
          </span>
        </div>

        {/* Motivazione AI */}
        <div className="mb-5 flex-grow">
          <p className="text-sm text-slate-600 italic border-l-2 border-brand-200 pl-3">
            "{job.ai_reason}"
          </p>
        </div>

        {/* Footer: Pulsante */}
        <div className="mt-auto pt-4 border-t border-slate-100 flex justify-between items-center">
          <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
            Fonte: {job.source}
          </span>
          <a
            href={job.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-semibold text-brand-600 hover:text-brand-800 flex items-center space-x-1"
          >
            <span>Vedi Offerta</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
          </a>
        </div>
      </div>
    </>
  );
};

export default JobCard;
