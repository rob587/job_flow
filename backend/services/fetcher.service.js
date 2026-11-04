const axios = require("axios");
require("dotenv").config();

/**
 * Recupera offerte di lavoro da Adzuna API
 * @param {string} keywords - Es. "junior frontend"
 * @param {string} location - Es. "italy" o "milano"
 * @param {string} countryCode - Codice paese Adzuna (default: 'it' per Italia)
 */
async function fetchFromAdzuna(keywords, location = "", countryCode = "it") {
  try {
    const appId = process.env.ADZUNA_APP_ID;
    const appKey = process.env.ADZUNA_APP_KEY;

    if (!appId || !appKey) {
      throw new Error("Credenziali Adzuna mancanti nel file .env");
    }

    // Costruiamo l'URL. Adzuna vuole il paese nel path (es. /it/search/1)
    const baseUrl = `https://api.adzuna.com/v1/api/jobs/${countryCode}/search/1`;

    const params = {
      app_id: appId,
      app_key: appKey,
      results_per_page: 20, // Limitiamo per non bruciare le 250 chiamate giornaliere
      what: keywords,
      content_type: "application/json",
    };

    // Se l'utente specifica una location (es. Milano), la aggiungiamo
    if (location) {
      params.where = location;
    }

    const response = await axios.get(baseUrl, { params });

    // Normalizziamo la risposta di Adzuna nel nostro formato standard
    return response.data.results.map((job) => ({
      external_id: String(job.id),
      source: "adzuna",
      title: job.title,
      company: job.company?.display_name || "Azienda sconosciuta",
      description: job.description || "",
      url: job.redirect_url,
      location: job.location?.display_name || "Non specificata",
      published_at: job.created
        ? new Date(job.created).toISOString().slice(0, 19).replace("T", " ")
        : null,
    }));
  } catch (error) {
    console.error("Errore Adzuna:", error.message);
    return []; // Restituiamo array vuoto per non bloccare l'intero processo
  }
}

/**
 * Recupera offerte di lavoro da Remotive API (solo lavori remoti tech)
 * @param {string} searchQuery - Es. "frontend"
 */
async function fetchFromRemotive(searchQuery = "frontend") {
  try {
    // Remotive non richiede API key per l'endpoint pubblico
    const url = "https://remotive.com/api/remote-jobs";
    const response = await axios.get(url, { params: { search: searchQuery } });

    return response.data.jobs.map((job) => ({
      external_id: String(job.id),
      source: "remotive",
      title: job.title,
      company: job.company_name,
      description: job.description,
      url: job.url,
      location: job.candidate_required_location || "Worldwide",
      // In Remotive, se non c'è una data, salviamo null
      published_at: job.publication_date
        ? new Date(job.publication_date)
            .toISOString()
            .slice(0, 19)
            .replace("T", " ")
        : null,
    }));
  } catch (error) {
    console.error("Errore Remotive:", error.message);
    return [];
  }
}

/**
 * Funzione principale che unisce le fonti
 * Usa Promise.allSettled per gestire errori parziali
 */
async function fetchAllJobs(keywords, location, remoteOnly) {
  console.log(`Ricerca in corso per: "${keywords}"...`);

  // Promesse da eseguire in parallelo
  const promises = [fetchFromAdzuna(keywords, location)];

  // Se l'utente cerca solo lavori remoti, aggiungiamo anche Remotive
  if (remoteOnly) {
    promises.push(fetchFromRemotive(keywords));
  }

  const results = await Promise.allSettled(promises);

  // Uniamo tutti gli array di risultati
  let allJobs = [];
  results.forEach((result, index) => {
    if (result.status === "fulfilled") {
      allJobs = allJobs.concat(result.value);
    } else {
      console.error(`❌ Fallimento fonte ${index}:`, result.reason);
    }
  });

  console.log(`📦 Totale annunci grezzi scaricati: ${allJobs.length}`);
  return allJobs;
}

module.exports = {
  fetchFromAdzuna,
  fetchFromRemotive,
  fetchAllJobs,
};
