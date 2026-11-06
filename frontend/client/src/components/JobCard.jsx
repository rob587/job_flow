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
  return <div>JobCard</div>;
};

export default JobCard;
