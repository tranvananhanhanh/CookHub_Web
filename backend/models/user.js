const pool = require("../config/db");

const getUserStats = async () => {
    const client = await pool.connect();
    try {
        const res = await client.query(`
            SELECT 
                COUNT(*) AS total_customers,
                COUNT(*) FILTER (WHERE EXTRACT(MONTH FROM created_at) = EXTRACT(MONTH FROM CURRENT_DATE)) AS monthly_new_customers,
                json_build_object(
                    'under_18', COUNT(*) FILTER (WHERE age < 18),
                    '18_25', COUNT(*) FILTER (WHERE age BETWEEN 18 AND 25),
                    '25_50', COUNT(*) FILTER (WHERE age BETWEEN 25 AND 50),
                    'over_50', COUNT(*) FILTER (WHERE age > 50)
                ) AS age_distribution,
                json_build_object(
                    'female', COUNT(*) FILTER (WHERE gender = 'female'),
                    'male', COUNT(*) FILTER (WHERE gender = 'male'),
                    'other', COUNT(*) FILTER (WHERE gender = 'other')
                ) AS gender_distribution
            FROM users
            WHERE is_banned = FALSE;
        `);
        return res.rows[0];
    } finally {
        client.release();
    }
};

module.exports = { getUserStats };