const pool = require("../config/db");
const { fetchAllJobs } = require("../services/fetcher.service");
const { evaluateJobsBatch } = require("../services/ai.service");

async function searchJobs(req, res) {
  const {
    keywords,
    location = "",
    remoteOnly = false,
    jobType = "any",
  } = req.body;

  // 1. Validazione input
  if (!keywords || keywords.trim().length < 2) {
    return res
      .status(400)
      .json({ error: "Inserisci almeno 2 caratteri come parola chiave." });
  }

  const startTime = Date.now();

  try {
    // 2. Fetch dei dati grezzi da Adzuna/Remotive
    const rawJobs = await fetchAllJobs(keywords, location, remoteOnly);

    if (rawJobs.length === 0) {
      return res.status(200).json({
        message: "Nessun annuncio trovato per questa ricerca.",
        jobs: [],
        stats: {
          fetched: 0,
          evaluated: 0,
          saved: 0,
          duration: Date.now() - startTime,
        },
      });
    }

    // 3. Valutazione AI (filtro e score)
    const criteria = { keywords, remoteOnly, jobType };
    const evaluatedJobs = await evaluateJobsBatch(rawJobs, criteria);

    // 4. Filtro finale: scartiamo quelli con score troppo basso
    const MIN_SCORE = 40;
    const relevantJobs = evaluatedJobs.filter((job) => job.score >= MIN_SCORE);

    // 5. Salvataggio nel database con deduplicazione
    let savedCount = 0;
    for (const job of relevantJobs) {
      try {
        const [result] = await pool.execute(
          `INSERT INTO jobs 
            (external_id, source, title, company, description, url, location, 
             is_remote, seniority, ai_score, ai_reason, published_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE
             ai_score = VALUES(ai_score),
             ai_reason = VALUES(ai_reason),
             fetched_at = CURRENT_TIMESTAMP`,
          [
            job.external_id,
            job.source,
            job.title,
            job.company,
            job.description,
            job.url,
            job.location,
            job.is_remote ? 1 : 0,
            job.seniority,
            job.score,
            job.reason,
            job.published_at,
          ],
        );

        // Se affectedRows è 1 (insert) o 2 (update), il record è stato gestito
        if (result.affectedRows > 0) savedCount++;
      } catch (dbError) {
        console.error(
          `⚠️ Errore salvataggio annuncio "${job.title}":`,
          dbError.message,
        );
        // Continuiamo con gli altri annunci anche se uno fallisce
      }
    }

    // 6. Log dell'esecuzione (utile per metriche e debug)
    await pool.execute(
      `INSERT INTO fetch_logs (source, fetched_count, inserted_count) 
       VALUES (?, ?, ?)`,
      ["mixed", rawJobs.length, savedCount],
    );

    // 7. Risposta finale
    const duration = Date.now() - startTime;
    res.status(200).json({
      message: `Trovati ${relevantJobs.length} annunci rilevanti.`,
      jobs: relevantJobs,
      stats: {
        fetched: rawJobs.length,
        evaluated: evaluatedJobs.length,
        saved: savedCount,
        duration_ms: duration,
      },
    });
  } catch (error) {
    console.error("🔥 Errore in searchJobs:", error);
    res
      .status(500)
      .json({ error: "Errore durante la ricerca. Riprova più tardi." });
  }
}

async function getSavedJobs(req, res) {
  const { limit = 20, offset = 0, minScore = 0 } = req.query;

  try {
    const [rows] = await pool.execute(
      `SELECT * FROM jobs 
       WHERE ai_score >= ? 
       ORDER BY ai_score DESC, fetched_at DESC 
       LIMIT ? OFFSET ?`,
      [parseInt(minScore), parseInt(limit), parseInt(offset)],
    );

    const [countResult] = await pool.execute(
      "SELECT COUNT(*) as total FROM jobs WHERE ai_score >= ?",
      [parseInt(minScore)],
    );

    res.status(200).json({
      jobs: rows,
      pagination: {
        total: countResult[0].total,
        limit: parseInt(limit),
        offset: parseInt(offset),
      },
    });
  } catch (error) {
    console.error("🔥 Errore in getSavedJobs:", error);
    res
      .status(500)
      .json({ error: "Errore nel recupero degli annunci salvati." });
  }
}
