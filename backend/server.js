const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

const jobsRoutes = require("./routes/jobs.routes");
const preferencesRoutes = require("./routes/preferences.routes");

app.use("/api/jobs", jobsRoutes);
app.use("/api/preferences", preferencesRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "JobFlow API", timestamp: new Date() });
});

// Gestione errori globale
app.use((err, req, res, next) => {
  console.error("Errore non gestito:", err.stack);
  res.status(500).json({ error: "Errore interno del server" });
});

// Avvio server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server JobFlow in ascolto sulla porta ${PORT}`);
});
