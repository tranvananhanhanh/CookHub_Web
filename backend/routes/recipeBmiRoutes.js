const express = require("express");
const router = express.Router();
const CaloModel = require("../models/CaloModel");

// API: Lấy danh sách món ăn theo status (Overweight, Normal, etc.)
router.get("/:status", async (req, res) => {
  const { status } = req.params;

  try {
    const recipes = await CaloModel.getRecipesByStatus(status); // Trả về mảng các món
    if (!recipes || recipes.length === 0) {
      console.log(`Không tìm thấy món ăn với status: ${status}`);
      return res.status(404).json({ message: "Không tìm thấy món ăn phù hợp" });
    }

    console.log(`Tìm thấy ${recipes.length} món ăn cho status: ${status}`);
    res.json(recipes); // Trả về danh sách JSON
  } catch (err) {
    console.error("Lỗi truy vấn CaloModel:", err);
    res.status(500).json({ message: "Lỗi server" });
  }
});

module.exports = router;
