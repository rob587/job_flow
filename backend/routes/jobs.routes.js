const express = require("express");
const router = express.Router();
const jobsController = require("../controllers/jobs.controller");

// POST /api/jobs/search - Cerca nuovi annunci (chiama fetch + AI)
router.post("/search", jobsController.searchJobs);

// GET /api/jobs - Lista annunci salvati nel DB (con paginazione)
router.get("/", jobsController.getSavedJobs);

// GET /api/jobs/:id - Dettaglio singolo annuncio
router.get("/:id", jobsController.getJobById);

// DELETE /api/jobs/:id - Elimina annuncio
router.delete("/:id", jobsController.deleteJob);

module.exports = router;
