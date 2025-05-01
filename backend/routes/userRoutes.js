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

const multer = require("multer");
const path = require("path");
const db = require("../config/db");

// Lấy thông tin user (trả về JSON)
router.get("/", async (req, res) => {
  try {
    const userInfo = await UserModel.getUserInfo();
    res.json(userInfo); 
  } catch (err) {
    res.status(500).json({ error: "Lỗi lấy dữ liệu" });
  }
});

// Cấu hình lưu file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
      const folder = file.fieldname === "avatar" ? "avatars" : "profile_backgrounds";
      cb(null, `./frontend/assets/image/users/${folder}`);
  },
  filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      const randomCode = req.body.randomCode;
      const prefix = file.fieldname === "avatar" ? "avatar" : "background";
      const filename = `${prefix}_${randomCode}${ext}`;
      cb(null, filename);
  },
});

const upload = multer({ storage });

router.post('/update', upload.fields([
    { name: 'avatar', maxCount: 1 },
    { name: 'background', maxCount: 1 }
  ]),
  async (req, res) => {
    try {
      const { userId, name, randomCode } = req.body;
      const avatar = req.files.avatar?.[0]?.filename;
      const background = req.files.profile_background?.[0]?.filename;

      const user = await db.query("SELECT * FROM users WHERE user_id = $1 AND random_code = $2", 
        [userId, randomCode]);

      if (user.rowCount === 0) {
          return res.status(403).json({ message: "Không xác thực được người dùng." });
      }

      await db.query(`
        UPDATE users
        SET name = $1,
            avatar = COALESCE($2, avatar),
            profile_background = COALESCE($3, profile_background)
        WHERE user_id = $4
    `, [name, avatar, background, userId]);

      res.status(200).json({ message: "Cập nhật thành công" });
    } catch (err) {
      console.error("Lỗi cập nhật profile:", err);
      res.status(500).json({ error: "Lỗi server" });
    }
  }
);

router.post('/update-password', async (req, res) => { 
  try {
      const { user_id, new_password } = req.body;
      console.log("🔒 Update Password Request:", req.body);

      if (!user_id || !new_password) {
          return res.status(400).json({ error: 'Missing user ID or password' });
      }

      await db.query(
          `UPDATE users SET password_hash = $1 WHERE user_id = $2`,
          [new_password, user_id]
      );

      res.json({ message: 'Password updated successfully' });
  } catch (err) {
      console.error('❌ Error updating password:', err);
      res.status(500).json({ error: 'Server error', details: err.message });
  }
});

module.exports = router;