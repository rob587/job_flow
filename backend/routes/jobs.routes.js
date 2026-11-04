const express = require("express");
const router = express.Router();
const jobsController = require("../controllers/jobs.controller");

//Cerca nuovi annunci (chiama fetch + AI)
router.post("/search", jobsController.searchJobs);

//Lista annunci salvati nel DB (con paginazione)
router.get("/", jobsController.getSavedJobs);

// Dettaglio singolo annuncio
router.get("/:id", jobsController.getJobById);

//Elimina annuncio
router.delete("/:id", jobsController.deleteJob);

module.exports = router;
