const express = require('express');
const router = express.Router();
const userModel = require('../models/user');
const recipeModel = require('../models/recipe');

router.get('/dashboard-stats', async (req, res) => {
    try {
        const userStats = await userModel.getUserStats();
        console.log('userStats:', userStats);

        const recipeStats = await recipeModel.getRecipeStats();
        console.log('recipeStats:', recipeStats);

        const topChefs = await recipeModel.getTopChefs();
        console.log('topChefs:', topChefs);

        const response = {
            totalCustomers: userStats.total_customers,
            monthlyNewCustomers: userStats.monthly_new_customers,
            ageDistribution: [
                userStats.age_distribution.under_18,
                userStats.age_distribution['18_25'],
                userStats.age_distribution['25_50'],
                userStats.age_distribution.over_50
            ],
            genderDistribution: [
                userStats.gender_distribution.female,
                userStats.gender_distribution.male,
                userStats.gender_distribution.other
            ],
            totalRecipes: recipeStats.totalRecipes,
            monthlyNewRecipes: recipeStats.monthlyNewRecipes,
            recipeStatistics: recipeStats.recipeStatistics.map(r => r.count),
            topChefs: topChefs.map(chef => ({ name: chef.name, rating: chef.rating || 0 })),
        };
        res.json(response);
    } catch (error) {
        console.error('Lỗi khi lấy thống kê dashboard:', error);
        res.status(500).json({ error: 'Lỗi máy chủ nội bộ' });
    }
});

module.exports = router;