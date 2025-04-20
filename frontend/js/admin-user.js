document.addEventListener("DOMContentLoaded", () => {
  const usersTbody = document.getElementById("users-tbody");
  const prevPageBtn = document.getElementById("prev-page");
  const nextPageBtn = document.getElementById("next-page");
  const pageInfo = document.getElementById("page-info");
  const tabs = document.querySelectorAll(".tab");
  const deletePopup = document.getElementById("delete-popup");
  const cancelDeleteBtn = document.getElementById("cancel-delete");
  const confirmDeleteBtn = document.getElementById("confirm-delete");
  const userDetailsPopup = document.getElementById("user-details-popup");
  const closeUserDetailsBtn = document.getElementById("close-user-details");
  const activateUserBtn = document.getElementById("activate-user");
  const banUserBtn = document.getElementById("ban-user");
  const notification = document.getElementById("notification");
  const notificationMessage = document.getElementById("notification-message");
  const searchInput = document.querySelector(".search-bar input"); // Thanh tìm kiếm
  const searchIcon = document.querySelector(".search-icon"); // Biểu tượng kính lúp

  let currentPage = 1;
  let currentStatus = "all";
  let userIdToDelete = null;
  let searchQuery = ""; // Biến để lưu từ khóa tìm kiếm  

  // Hàm hiển thị thông báo
  const showNotification = (message, type) => {
    notificationMessage.textContent = message;
    notification.classList.remove("success", "error");
    notification.classList.add(type);
    notification.classList.add("show");
    setTimeout(() => {
      notification.classList.remove("show");
    }, 3000);
  };

  // Hàm lấy dữ liệu người dùng từ API và render
  const fetchUsers = async (page, status, search = "") => {
    try {
      const response = await fetch(
        `http://localhost:4000/api/users?page=${page}&status=${status}&search=${encodeURIComponent(search)}`
      );
      if (!response.ok) {
        throw new Error("Lỗi khi lấy dữ liệu từ API...");
      }
      const data = await response.json();

      currentPage = data.currentPage;
      const totalPages = data.totalPages;
      pageInfo.textContent = `${currentPage}/${totalPages}`;
      prevPageBtn.disabled = currentPage === 1;
      nextPageBtn.disabled = !data.hasNext;

      usersTbody.innerHTML = "";

      data.users.forEach(user => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td data-label="User ID">${user.user_id}</td>
          <td data-label="User Name">${user.name}</td>
          <td data-label="Email">${user.email}</td>
          <td data-label="Created At">${new Date(user.created_at).toLocaleDateString()}</td>
          <td data-label="Last Login">${user.last_login ? new Date(user.last_login).toLocaleDateString() : "Chưa đăng nhập"}</td>
          <td data-label="Status"><span class="${user.is_banned ? 'status banned' : 'status active'}">${user.is_banned ? "Banned" : "Active"}</span></td>
          <td data-label="Action">
            <button class="action-btn view-btn" data-user-id="${user.user_id}">View</button>
            <button class="action-btn delete-icon" data-user-id="${user.user_id}">Delete</button>
          </td>
        `;
        usersTbody.appendChild(row);
      });

      // Thêm sự kiện click cho các nút View
      const viewButtons = document.querySelectorAll(".view-btn");
      viewButtons.forEach(button => {
        button.addEventListener("click", async () => {
          const userId = button.getAttribute("data-user-id");
          try {
            const response = await fetch(`http://localhost:4000/api/users/${userId}`);
            if (!response.ok) {
              throw new Error("Lỗi khi lấy thông tin chi tiết");
            }
            const data = await response.json();

            // Render thông tin vào pop-up
            document.getElementById("user-name").textContent = data.user.name;
            document.getElementById("user-email").textContent = data.user.email;
            document.getElementById("user-age").textContent = data.user.age;
            document.getElementById("user-status").textContent = data.user.is_banned ? "Banned" : "Active";
            // document.getElementById("user-status").className = data.user.is_banned ? "status banned" : "status active";
            document.getElementById("user-status").innerText = data.user.is_banned ? "Banned" : "Active";
            document.getElementById("user-joined").textContent = new Date(data.user.created_at).toLocaleDateString();

            // Social Platforms
            const socialLinksContainer = document.getElementById("social-links");
            socialLinksContainer.innerHTML = "";
            if (data.socialLinks.length > 0) {
              data.socialLinks.forEach(link => {
                const platformIcon = link.platform === "facebook" ? "🌐" : link.platform === "instagram" ? "📷" : "🐦";
                const linkElement = document.createElement("a");
                linkElement.href = link.url;
                linkElement.textContent = platformIcon;
                linkElement.style.marginRight = "10px";
                socialLinksContainer.appendChild(linkElement); 
              });
            } else {
              socialLinksContainer.textContent = "No social links";
            }

            // Recipe Statistics
            document.getElementById("recipe-total").textContent = data.recipeStats.total;
            document.getElementById("recipe-pending").textContent = data.recipeStats.pending;
            document.getElementById("recipe-approved").textContent = data.recipeStats.approved;
            document.getElementById("recipe-rejected").textContent = data.recipeStats.rejected;
            document.getElementById("recipe-deleted").textContent = data.recipeStats.deleted;
            document.getElementById("recipe-rating").textContent = data.recipeStats.avgRating;
            document.getElementById("recipe-saved").textContent = data.recipeStats.savedCount;

            // User's Recipes
            const recipesContainer = document.getElementById("user-recipes-list");
            recipesContainer.innerHTML = "";
            if (data.recipes.length > 0) {
              data.recipes.forEach(recipe => {
                const recipeItem = document.createElement("div");
                recipeItem.classList.add("recipe-item");
                recipeItem.innerHTML = `
                  <span>📜 ${recipe.title}</span>
                  <span class="recipe-status ${recipe.status}">${recipe.status.charAt(0).toUpperCase() + recipe.status.slice(1)}</span>
                `;
                recipesContainer.appendChild(recipeItem);
              });
            } else {
              recipesContainer.textContent = "No recipes";
            }

            // Hiển thị pop-up
            userDetailsPopup.classList.add("show");

            // Xử lý nút Activate
            activateUserBtn.onclick = async () => {
              try {
                const response = await fetch(`http://localhost:4000/api/users/${userId}/status`, {
                  method: "PUT",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ isBanned: false }),
                });
                if (!response.ok) throw new Error("Lỗi khi cập nhật trạng thái");
                userDetailsPopup.classList.remove("show");
                showNotification("User activated successfully", "success");
                fetchUsers(currentPage, currentStatus);
              } catch (error) {
                showNotification("Error updating status", "error");
              }
            };

            // Xử lý nút Ban
            banUserBtn.onclick = async () => {
              try {
                const response = await fetch(`http://localhost:4000/api/users/${userId}/status`, {
                  method: "PUT",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ isBanned: true }),
                });
                if (!response.ok) throw new Error("Lỗi khi cập nhật trạng thái");
                userDetailsPopup.classList.remove("show");
                showNotification("User banned successfully", "success");
                fetchUsers(currentPage, currentStatus);
              } catch (error) {
                showNotification("Error updating status", "error");
              }
            };
          } catch (error) {
            showNotification("Error fetching user details", "error");
            console.error("Lỗi:", error);
          }
        });
      });

      // Thêm sự kiện click cho các icon xóa
      const deleteIcons = document.querySelectorAll(".delete-icon");
      deleteIcons.forEach(icon => {
        icon.addEventListener("click", () => {
          userIdToDelete = icon.getAttribute("data-user-id");
          deletePopup.classList.add("show");
        });
      });
    } catch (error) {
      usersTbody.innerHTML = "<tr><td colspan='7'>Lỗi tải dữ liệu!</td></tr>";
      console.error("Lỗi:", error);
    }
  };

  fetchUsers(currentPage, currentStatus);

  prevPageBtn.addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage--;
      fetchUsers(currentPage, currentStatus);
    }
  });

  nextPageBtn.addEventListener("click", () => {
    currentPage++;
    fetchUsers(currentPage, currentStatus);
  });

  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      tabs.forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      currentStatus = tab.textContent.toLowerCase();
      currentPage = 1;
      fetchUsers(currentPage, currentStatus);
    });
  });

  cancelDeleteBtn.addEventListener("click", () => {
    deletePopup.classList.remove("show");
    userIdToDelete = null;
  });

  confirmDeleteBtn.addEventListener("click", async () => {
    if (!userIdToDelete) return;

    try {
      const response = await fetch(`http://localhost:4000/api/users/${userIdToDelete}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Lỗi khi xóa người dùng");
      }
      deletePopup.classList.remove("show");
      showNotification("User deleted successfully", "success");
      fetchUsers(currentPage, currentStatus);
    } catch (error) {
      showNotification("Error deleting user", "error");
      console.error("Lỗi:", error);
    } finally {
      userIdToDelete = null;
    }
  });

  // Xử lý nút đóng pop-up thông tin chi tiết
  closeUserDetailsBtn.addEventListener("click", () => {
    userDetailsPopup.classList.remove("show");
  });

  // Xử lý tìm kiếm khi nhấn Enter trong thanh tìm kiếm
  searchInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      searchQuery = searchInput.value.trim();
      currentPage = 1; // Reset về trang đầu khi tìm kiếm
      fetchUsers(currentPage, currentStatus, searchQuery);
    }
  });

});