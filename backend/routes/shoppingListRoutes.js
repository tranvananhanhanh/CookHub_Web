const express = require("express");
const path = require("path");
const router = express.Router();
const client = require("../config/db"); // Kết nối PostgreSQL
const PDFDocument = require("pdfkit");

// Hàm helper: Kiểm tra nếu không gian còn lại cho một dòng là đủ, nếu không thì thêm trang mới.
function checkAndAddPage(doc, lineHeight = 20) {
  if (doc.y + lineHeight > doc.page.height - doc.page.margins.bottom) {
    doc.addPage();
  }
}

router.post("/", async (req, res) => {
  try {
    const { recipeIds, exportType } = req.body;

    if (!recipeIds || !Array.isArray(recipeIds) || recipeIds.length === 0) {
      return res.status(400).json({ error: "Danh sách recipeIds không hợp lệ." });
    }

    // Khởi tạo PDFDocument
    const doc = new PDFDocument();
    doc.registerFont("Roboto", path.join(__dirname, "../fonts/Roboto_Condensed-Regular.ttf"));
    doc.font("Roboto");
    doc.on("error", (err) => {
      console.error("PDF generation error:", err);
    });

    // Cài đặt header trả về file PDF
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", 'attachment; filename="shopping_list.pdf"');

    // Pipe PDF ra response
    doc.pipe(res);

    // Tiêu đề chung cho file PDF
    doc.fontSize(18).text("Danh sách nguyên liệu cần mua", { align: "center" });
    doc.moveDown();

    if (exportType === "aggregated") {
      // --- Xuất dạng gộp toàn bộ ---
      const query = `
        SELECT 
          i.name AS ingredient_name,
          COALESCE(u.unit_name, 'gram') AS unit_name,
          SUM(ri.amount) AS total_amount
        FROM recipe_ingredients ri
        JOIN ingredients i ON ri.ingredient_id = i.ingredient_id
        LEFT JOIN units u ON ri.unit_id = u.unit_id
        WHERE ri.recipe_id = ANY($1)
        GROUP BY i.name, COALESCE(u.unit_name, 'gram')
        ORDER BY i.name ASC
      `;
      const result = await client.query(query, [recipeIds]);
      const ingredients = result.rows;

      // Vẽ bảng danh sách nguyên liệu gộp
      const xName = 50;
      const xQuantity = 350;
      let y = doc.y;

      // Tiêu đề cột
      doc.fontSize(12).text("Tên nguyên liệu", xName, y);
      doc.text("Số lượng", xQuantity, y);
      y += 20;
      doc.moveTo(xName, y - 5)
         .lineTo(xQuantity + 100, y - 5)
         .stroke();
      y += 10;
      doc.y = y;

      // Liệt kê nguyên liệu gộp
      ingredients.forEach((ingredient) => {
        checkAndAddPage(doc, 20);
        const rowY = doc.y; // Lưu tọa độ y hiện tại của dòng
        const amount = ingredient.total_amount || 0;
        const unitName = ingredient.unit_name;
      
        // Định dạng số: loại bỏ số 0 thừa sau dấu phẩy
        const formattedAmount = amount.toFixed(2).replace(/\.?0+$/, '');
      
        // In tên nguyên liệu và số lượng trên cùng dòng
        doc.fontSize(12).text(ingredient.ingredient_name, xName, rowY);
        doc.fontSize(12).text(formattedAmount + " " + unitName, xQuantity, rowY);
      
        // Cập nhật doc.y xuống dòng tiếp theo (ví dụ tăng 20 đơn vị)
        doc.y = rowY + 20;
      });
      

    } else if (exportType === "individual") {
      // --- Xuất theo từng món ---
      const query = `
        SELECT 
          r.recipe_id,
          r.title,
          i.name AS ingredient_name,
          COALESCE(u.unit_name, 'gram') AS unit_name,
          ri.amount
        FROM recipes r
        JOIN recipe_ingredients ri ON r.recipe_id = ri.recipe_id
        JOIN ingredients i ON ri.ingredient_id = i.ingredient_id
        LEFT JOIN units u ON ri.unit_id = u.unit_id
        WHERE r.recipe_id = ANY($1)
        ORDER BY r.recipe_id, i.name ASC
      `;
      const result = await client.query(query, [recipeIds]);
      const rows = result.rows;

      // Nhóm dữ liệu theo recipe_id
      const recipesMap = {};
      rows.forEach((row) => {
        if (!recipesMap[row.recipe_id]) {
          recipesMap[row.recipe_id] = {
            title: row.title,
            ingredients: [],
          };
        }
        recipesMap[row.recipe_id].ingredients.push({
          ingredient_name: row.ingredient_name,
          unit_name: row.unit_name,
          amount: row.amount,
        });
      });

      // Xử lý từng món
      for (const recipeId in recipesMap) {
        const recipe = recipesMap[recipeId];

        // Căn giữa tiêu đề món
        const pageWidth = doc.page.width;
        const marginLeft = doc.page.margins.left;
        const marginRight = doc.page.margins.right;
        const usableWidth = pageWidth - marginLeft - marginRight;

        checkAndAddPage(doc, 30);
        doc.fontSize(16)
           .fillColor("blue")
           .text(`Món: ${recipe.title}`, marginLeft, doc.y, {
             align: "center",
             width: usableWidth
           });
        doc.moveDown(0.5);

        // Vẽ bảng nguyên liệu cho món
        const xName = 70;
        const xQuantity = 350;
        let y = doc.y;

        // Tiêu đề cột
        doc.fontSize(12).fillColor("black").text("Tên nguyên liệu", xName, y);
        doc.text("Số lượng", xQuantity, y);
        y += 20;
        doc.moveTo(xName, y - 5)
           .lineTo(xQuantity + 100, y - 5)
           .stroke();
        y += 10;
        doc.y = y;

        recipe.ingredients.forEach((ing) => {
          checkAndAddPage(doc, 20);
          const rowY = doc.y; // Lưu vị trí hiện tại của dòng
          const amount = ing.amount || 0;
          
          // Định dạng số: loại bỏ số 0 thừa sau dấu phẩy
          const formattedAmount = amount.toFixed(2).replace(/\.?0+$/, '');
          
          // In tên nguyên liệu và số lượng trên cùng dòng
          doc.fontSize(12).text(ing.ingredient_name, xName, rowY);
          doc.fontSize(12).text(formattedAmount + " " + ing.unit_name, xQuantity, rowY);
          
          // Di chuyển xuống dòng mới
          doc.y = rowY + 20;
        });
          
        doc.moveDown();
      }
    } else {
      doc.fontSize(12).fillColor("red").text("Kiểu xuất không hợp lệ!");
    }

    doc.end();

  } catch (error) {
    console.error("Lỗi tạo danh sách mua sắm:", error);
    res.status(500).json({ error: "Lỗi tạo danh sách mua sắm." });
  }
});

module.exports = router;
