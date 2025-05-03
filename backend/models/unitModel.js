const pool = require("../config/db");

const Unit = {
  findOne: async (condition) => {
    const query = `
      SELECT unit_id, unit_name, equivalent_grams
      FROM units
      WHERE unit_name = $1
    `;
    const values = [condition.unit_name];
    const result = await pool.query(query, values);
    return result.rows[0];
  },

  findAll: async () => {
    const query = `
      SELECT unit_id, unit_name, equivalent_grams
      FROM units
      ORDER BY unit_name
    `;
    const result = await pool.query(query);
    return result.rows;
  }
};

module.exports = Unit;