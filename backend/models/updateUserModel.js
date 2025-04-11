const pool = require("../config/db");

async function updateUserProfile(random_code, fields) {
    const { name, avatar, profile_background } = fields;

    const values = [];
    const updates = [];
    let idx = 1;

    if (name !== undefined) {
        updates.push(`name = $${idx++}`);
        values.push(name);
    }

    if (avatar !== undefined) {
        updates.push(`avatar = $${idx++}`);
        values.push(avatar);
    }

    if (profile_background !== undefined) {
        updates.push(`profile_background = $${idx++}`);
        values.push(profile_background);
    }

    if (updates.length === 0) return; // không có gì để cập nhật

    values.push(random_code);
    const sql = `UPDATE users SET ${updates.join(", ")} WHERE user_id = $${idx}`;

    await pool.query(sql, values);
}

module.exports = { updateUserProfile };