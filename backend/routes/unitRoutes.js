const express = require("express");
const router = express.Router();
const Unit = require("../models/unitModel");

// Lấy danh sách đơn vị
router.get("/", async (req, res) => {
  try {
    const units = await Unit.findAll();
    res.status(200).json(units);
  } catch (error) {
    console.error("Error fetching units:", error);
    res.status(500).json({ message: "Server error while fetching units." });
  }
});

module.exports = router;