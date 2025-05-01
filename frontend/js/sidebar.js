// public/scripts/sidebar.js
document.addEventListener("DOMContentLoaded", () => {
  const sidebarItems = document.querySelectorAll(".sidebar-item");

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
          window.location.href = `/${targetPage}`;
      });
  });
});