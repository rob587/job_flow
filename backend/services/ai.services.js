const axios = require("axios");
require("dotenv").config();

/**
 * Invia un prompt a Groq e restituisce il testo generato
 */
async function callGroq(prompt) {
  try {
    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: process.env.GROQ_MODEL || "openai/gpt-oss-20b",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.1,
        response_format: { type: "json_object" },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
        timeout: 15000,
      },
    );

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error(
      "Errore chiamata Groq:",
      error.response?.data || error.message,
    );
    throw new Error("Errore durante la valutazione AI");
  }
}

/**
 * Valuta un singolo annuncio rispetto ai criteri dell'utente
 * @param {Object} job - L'annuncio normalizzato
 * @param {Object} criteria - { keywords, remoteOnly, jobType }
 */
async function evaluateJob(job, criteria) {
  // Tronchiamo la descrizione per non superare i limiti di token (i modelli 8b hanno contesto limitato)
  const shortDescription = (job.description || "").substring(0, 1500);

  const prompt = `
Sei un assistente esperto nella ricerca di lavoro. Devi valutare se questo annuncio è adatto a un candidato.

CRITERI DEL CANDIDATO:
- Parole chiave cercate: "${criteria.keywords}"
- Solo lavoro remoto: ${criteria.remoteOnly ? "SÌ" : "NO"}
- Tipo di contratto preferito: ${criteria.jobType}

ANNUNCIO DA VALUTARE:
- Titolo: ${job.title}
- Azienda: ${job.company}
- Location: ${job.location}
- Descrizione: ${shortDescription}

COMPITO:
Restituisci un oggetto JSON con questa esatta struttura:
{
  "score": <numero da 0 a 100>,
  "is_remote": <true o false>,
  "seniority": "<junior, mid, senior o unknown>",
  "reason": "<breve spiegazione in italiano, max 100 caratteri>"
}

REGOLE:
1. Dai score alto (80-100) solo se il titolo e la descrizione corrispondono bene alle parole chiave.
2. Se l'utente cerca solo remoto e l'annuncio non lo è, il score massimo è 30.
3. Se l'annuncio richiede seniority molto superiore a "junior" (ma l'utente cerca junior), abbassa il score.
4. Sii severo: è meglio scartare un annuncio dubbio che far perdere tempo all'utente.
`;

  try {
    const rawResponse = await callGroq(prompt);
    const parsed = JSON.parse(rawResponse);

    // Validazione difensiva: se l'AI sbaglia formato, usiamo un fallback
    return {
      score: Math.min(100, Math.max(0, parseInt(parsed.score) || 0)),
      is_remote: Boolean(parsed.is_remote),
      seniority: ["junior", "mid", "senior", "unknown"].includes(
        parsed.seniority,
      )
        ? parsed.seniority
        : "unknown",
      reason: (parsed.reason || "Valutazione non disponibile").substring(
        0,
        500,
      ),
    };
  } catch (error) {
    console.error(`Valutazione fallita per "${job.title}":`, error.message);
    // Fallback: se l'AI fallisce, diamo un punteggio neutro ma non blocchiamo il flusso
    return {
      score: 50,
      is_remote: job.location?.toLowerCase().includes("remote") || false,
      seniority: "unknown",
      reason: "Valutazione AI non disponibile al momento.",
    };
  }
}

/**
 * Valuta una lista di annunci in parallelo (con limite per non saturare l'API)
 * @param {Array} jobs - Lista di annunci
 * @param {Object} criteria - Criteri dell'utente
 */
async function evaluateJobsBatch(jobs, criteria) {
  console.log(`Valutazione AI di ${jobs.length} annunci in corso...`);

  // Processiamo in blocchi da 5 per non superare i rate limit di Groq
  const BATCH_SIZE = 5;
  const evaluatedJobs = [];

  for (let i = 0; i < jobs.length; i += BATCH_SIZE) {
    const batch = jobs.slice(i, i + BATCH_SIZE);

    // Eseguiamo la valutazione in parallelo per il blocco corrente
    const batchResults = await Promise.all(
      batch.map(async (job) => {
        const evaluation = await evaluateJob(job, criteria);
        return { ...job, ...evaluation }; // Unisce i dati originali con il risultato AI
      }),
    );

    evaluatedJobs.push(...batchResults);

    // Piccola pausa tra i blocchi per rispettare i rate limit (se necessario)
    if (i + BATCH_SIZE < jobs.length) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  console.log(`Valutazione completata.`);

  // Restituiamo gli annunci ordinati per score (dal più alto al più basso)
  return evaluatedJobs.sort((a, b) => b.ai_score - a.ai_score);
}

module.exports = {
  evaluateJob,
  evaluateJobsBatch,
};
