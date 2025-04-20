const express = require("express");
const router = express.Router();
const UserModel = require("../models/userModel");

router.get("/", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const status = req.query.status || "all";
    const search = req.query.search || ""; // Thêm query parameter search
    const limit = 7;
    const offset = (page - 1) * limit;

    let users, totalUsers;

    if (search) {
      // Nếu có từ khóa tìm kiếm, gọi hàm searchUsersPaginated
      users = await UserModel.searchUsersPaginated(search, status, limit, offset);
      totalUsers = await UserModel.countSearchUsers(search, status);
    } else {
      // Nếu không có từ khóa tìm kiếm, gọi hàm getUsersByStatusPaginated
      users = await UserModel.getUsersByStatusPaginated(status, limit, offset);
      totalUsers = await UserModel.countUsersByStatus(status);
    }
    const totalPages = Math.ceil(totalUsers / limit);



    res.json({
      users,
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
    const userId = parseInt(req.params.id);
    await UserModel.deleteUser(userId);
    res.status(200).json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: `Lỗi xóa user: ${err.message}` });
  }
});

// Lấy thông tin chi tiết người dùng
router.get("/:id", async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const userDetails = await UserModel.getUserDetails(userId);
    res.json(userDetails);
  } catch (err) {
    res.status(500).json({ error: `Lỗi lấy thông tin chi tiết: ${err.message}` });
  }
});

// Cập nhật trạng thái người dùng
router.put("/:id/status", async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const { isBanned } = req.body;
    const updatedUser = await UserModel.updateUserStatus(userId, isBanned);
    res.json({ message: "User status updated successfully", user: updatedUser });
  } catch (err) {
    res.status(500).json({ error: `Lỗi cập nhật trạng thái: ${err.message}` });
  }
});

module.exports = router;