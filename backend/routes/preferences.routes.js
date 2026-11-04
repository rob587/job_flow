const express = require("express");
const router = express.Router();
const pool = require("../config/db");

// GET /api/preferences - Recupera l'ultima preferenza salvata
router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.execute(
      "SELECT * FROM user_preferences ORDER BY updated_at DESC LIMIT 1",
    );
    res.json(rows[0] || null);
  } catch (error) {
    console.error("Errore getPreferences:", error);
    res.status(500).json({ error: "Errore nel recupero delle preferenze." });
  }
});

// POST /api/preferences - Salva o aggiorna le preferenze
router.post("/", async (req, res) => {
  const {
    keywords,
    location = "",
    remoteOnly = false,
    jobType = "any",
  } = req.body;

  if (!keywords || keywords.trim().length < 2) {
    return res
      .status(400)
      .json({ error: "Keywords obbligatorie (min 2 caratteri)." });
  }

  try {
    await pool.execute(
      `INSERT INTO user_preferences (id, keywords, location, remote_only, job_type) 
       VALUES (1, ?, ?, ?, ?) 
       ON DUPLICATE KEY UPDATE 
         keywords = VALUES(keywords),
         location = VALUES(location),
         remote_only = VALUES(remote_only),
         job_type = VALUES(job_type)`,
      [keywords, location, remoteOnly ? 1 : 0, jobType],
    );

    const [rows] = await pool.execute(
      "SELECT * FROM user_preferences WHERE id = 1",
    );
    res.json(rows[0]);
  } catch (error) {
    console.error("Errore savePreferences:", error);
    res.status(500).json({ error: "Errore nel salvataggio delle preferenze." });
  }
});

module.exports = router;
