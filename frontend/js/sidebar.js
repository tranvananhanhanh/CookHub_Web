document.addEventListener("DOMContentLoaded", () => {
  const sidebarItems = document.querySelectorAll(".sidebar-item");
  const logoutBtn = document.querySelector("#logout-btn"); // Đảm bảo nút logout có ID này

  // Xác định trang hiện tại dựa trên URL
  const currentPage = window.location.pathname.split("/").pop() || "admin-dashboard";

  // Đặt trạng thái active cho mục tương ứng
  sidebarItems.forEach(item => {
      const page = item.getAttribute("data-page");
      if (page === currentPage) {
          item.classList.add("active");
      } else {
          item.classList.remove("active");
      }

      // Xử lý sự kiện click để điều hướng
      item.addEventListener("click", () => {
          const targetPage = item.getAttribute("data-page");
          if (targetPage) { // Chỉ điều hướng nếu data-page tồn tại
              window.location.href = `/${targetPage}`;
          }
      });
  });

  // Xử lý sự kiện click cho nút logout
  if (logoutBtn) {
      logoutBtn.addEventListener("click", (event) => {
          event.stopPropagation(); // Ngăn các sự kiện click khác
          window.location.href = "http://localhost:4000/"; // Chuyển về trang gốc
      });
  }
});