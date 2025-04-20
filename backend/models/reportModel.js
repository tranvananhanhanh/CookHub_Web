const pool = require("../config/db");

class ReportModel {
  static async getReportsPaginated(limit, offset) {
    const result = await pool.query(`
      SELECT r.report_id, r.user_id, u.name AS reporter, r.recipe_id, rec.title AS recipe_title, r.created_at, r.report_status
      FROM reports r
      JOIN users u ON r.user_id = u.user_id
      LEFT JOIN recipes rec ON r.recipe_id = rec.recipe_id
      ORDER BY r.report_id ASC
      LIMIT $1 OFFSET $2
    `, [limit, offset]);
    return result.rows;
  }

  static async countReports() {
    const result = await pool.query("SELECT COUNT(*) AS total FROM reports");
    return parseInt(result.rows[0].total);
  }

  static async getReportsByStatusPaginated(status, limit, offset) {
    let query = `
      SELECT r.report_id, r.user_id, u.name AS reporter, r.recipe_id, rec.title AS recipe_title, r.created_at, r.report_status
      FROM reports r
      JOIN users u ON r.user_id = u.user_id
      LEFT JOIN recipes rec ON r.recipe_id = rec.recipe_id
    `;
    const values = [limit, offset];

    if (status !== "all") {
      query += " WHERE r.report_status = $3";
      values.push(status);
    }

    query += " ORDER BY r.report_id ASC LIMIT $1 OFFSET $2";
    const result = await pool.query(query, values);
    return result.rows;
  }

  static async countReportsByStatus(status) {
    let query = "SELECT COUNT(*) AS total FROM reports";
    const values = [];

    if (status !== "all") {
      query += " WHERE report_status = $1";
      values.push(status);
    }

    const result = await pool.query(query, values);
    return parseInt(result.rows[0].total);
  }

  static async searchReportsPaginated(search, status, limit, offset) {
    let query = `
      SELECT r.report_id, r.user_id, u.name AS reporter, r.recipe_id, rec.title AS recipe_title, r.created_at, r.report_status
      FROM reports r
      JOIN users u ON r.user_id = u.user_id
      LEFT JOIN recipes rec ON r.recipe_id = rec.recipe_id
      WHERE (
        CAST(r.report_id AS TEXT) ILIKE $3 
        OR u.name ILIKE $3 
        OR COALESCE(rec.title, '') ILIKE $3
      )
    `;
    const values = [limit, offset, `%${search}%`];

    if (status !== "all") {
      query += " AND r.report_status = $4";
      values.push(status);
    }

    query += " ORDER BY r.report_id ASC LIMIT $1 OFFSET $2";
    const result = await pool.query(query, values);
    return result.rows;
  }

  static async countSearchReports(search, status) {
    let query = `
      SELECT COUNT(*) AS total 
      FROM reports r
      JOIN users u ON r.user_id = u.user_id
      LEFT JOIN recipes rec ON r.recipe_id = rec.recipe_id
      WHERE (
        CAST(r.report_id AS TEXT) ILIKE $1 
        OR u.name ILIKE $1 
        OR COALESCE(rec.title, '') ILIKE $1
      )
    `;
    const values = [`%${search}%`];

    if (status !== "all") {
      query += " AND r.report_status = $2";
      values.push(status);
    }

    const result = await pool.query(query, values);
    return parseInt(result.rows[0].total);
  }

  static async deleteReport(reportId) {
    try {
      const result = await pool.query("DELETE FROM reports WHERE report_id = $1 RETURNING *", [reportId]);
      if (result.rowCount === 0) {
        throw new Error("Report not found");
      }
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error deleting report: ${error.message}`);
    }
  }

  static async getReportDetails(reportId) {
    try {
      const reportQuery = `
        SELECT r.*, u.name AS reporter
        FROM reports r
        LEFT JOIN users u ON r.user_id = u.user_id
        WHERE r.report_id = $1
      `;
      const reportResult = await pool.query(reportQuery, [reportId]);
      if (reportResult.rowCount === 0) {
        throw new Error("Report not found");
      }
      const report = reportResult.rows[0];

      let recipe = null;
      let ingredients = [];
      let steps = [];

      if (report.recipe_id) {
        const recipeQuery = `
          SELECT r.*, u.name AS author
          FROM recipes r
          LEFT JOIN users u ON r.user_id = u.user_id
          WHERE r.recipe_id = $1
        `;
        const recipeResult = await pool.query(recipeQuery, [report.recipe_id]);
        if (recipeResult.rowCount > 0) {
          recipe = recipeResult.rows[0];

          try {
            const ingredientsQuery = `
              SELECT i.name, ri.amount, u.unit_name
              FROM recipe_ingredients ri
              LEFT JOIN ingredients i ON ri.ingredient_id = i.ingredient_id
              LEFT JOIN units u ON ri.unit_id = u.unit_id
              WHERE ri.recipe_id = $1
            `;
            const ingredientsResult = await pool.query(ingredientsQuery, [report.recipe_id]);
            ingredients = ingredientsResult.rows;
          } catch (error) {
            console.error("Error fetching ingredients:", error);
            ingredients = [];
          }

          try {
            const stepsQuery = `
              SELECT step_number, description
              FROM recipe_steps
              WHERE recipe_id = $1
              ORDER BY step_number ASC
            `;
            const stepsResult = await pool.query(stepsQuery, [report.recipe_id]);
            steps = stepsResult.rows;
          } catch (error) {
            console.error("Error fetching steps:", error);
            steps = [];
          }
        }
      }

      return {
        report,
        recipe,
        ingredients,
        steps,
      };
    } catch (error) {
      console.error("Error in getReportDetails:", error);
      throw new Error(`Error fetching report details: ${error.message}`);
    }
  }

  static async updateReportStatus(reportId, status) {
    try {
      const validStatuses = ['pending', 'accepted', 'rejected'];
      if (!validStatuses.includes(status)) {
        throw new Error("Invalid status value");
      }
      const result = await pool.query(
        "UPDATE reports SET report_status = $1 WHERE report_id = $2 RETURNING *",
        [status, reportId]
      );
      if (result.rowCount === 0) {
        throw new Error("Report not found");
      }
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error updating report status: ${error.message}`);
    }
  }
}

module.exports = ReportModel;