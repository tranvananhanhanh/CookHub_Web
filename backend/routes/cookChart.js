const express = require("express");
const TopModel = require("../models/topModel");
const path = require("path");
const router = express.Router();

router.get("/top-recipes", async (req, res) => {
    try {
        const recipes = await TopModel.getTopRatedRecipes();
        res.json({ success: true, data: recipes });
    } catch (error) {
        res.status(500).json({ success: false, message: "Lỗi khi lấy danh sách công thức", error });
    }
});

router.get("/top-chefs", async (req, res) => {
    try {
        const chefs = await TopModel.getTopCheft();
        res.json({ success: true, data: chefs });
    } catch (error) {
        res.status(500).json({ success: false, message: "Lỗi khi lấy danh sách đầu bếp", error });
    }
});

// //  API trả về file HTML
// router.get("/top-chefs-page", (req, res) => {
//     res.sendFile(path.join(__dirname, '..', '..', 'frontend', 'pages', 'chefChart.html'));
// });

// //  API trả về file HTML
// router.get("/top-recipes-page", (req, res) => {
//     res.sendFile(path.join(__dirname, '..', '..', 'frontend', 'pages', 'recipeChart.html'));
// });

module.exports = router;