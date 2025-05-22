const express = require("express");
const router = express.Router();
const ReportModel = require("../models/reportModelAdmin");

router.get("/", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const status = req.query.status || "all";
    const search = req.query.search || "";
    const limit = 7;
    const offset = (page - 1) * limit;

    let reports, totalReports;

    if (search) {
      reports = await ReportModel.searchReportsPaginated(search, status, limit, offset);
      totalReports = await ReportModel.countSearchReports(search, status);
    } else {
      reports = await ReportModel.getReportsByStatusPaginated(status, limit, offset);
      totalReports = await ReportModel.countReportsByStatus(status);
    }

    const totalPages = Math.ceil(totalReports / limit);

    res.json({
      reports,
      currentPage: page,
      totalPages,
      hasNext: page < totalPages,
    });
  } catch (err) {
    res.status(500).json({ error: `Lỗi lấy dữ liệu: ${err.message}` });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const reportId = parseInt(req.params.id);
    await ReportModel.deleteReport(reportId);
    res.status(200).json({ message: "Report deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: `Lỗi xóa report: ${err.message}` });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const reportId = parseInt(req.params.id);
    const reportDetails = await ReportModel.getReportDetails(reportId);
    res.json(reportDetails);
  } catch (err) {
    res.status(500).json({ error: `Lỗi lấy chi tiết báo cáo: ${err.message}` });
  }
});

router.put("/:id/status", async (req, res) => {
  try {
    const reportId = parseInt(req.params.id);
    const { status } = req.body;
    const updatedReport = await ReportModel.updateReportStatus(reportId, status);
    res.json({ message: "Report status updated successfully", report: updatedReport });
  } catch (err) {
    res.status(500).json({ error: `Lỗi cập nhật trạng thái báo cáo: ${err.message}` });
  }
});

module.exports = router;