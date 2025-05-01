// Trong file admin-recipe.js
document.addEventListener("DOMContentLoaded", () => {
  const recipesTbody = document.getElementById("recipes-tbody");
  const prevPageBtn = document.getElementById("prev-page");
  const nextPageBtn = document.getElementById("next-page");
  const pageInfo = document.getElementById("page-info");
  const tabs = document.querySelectorAll(".tab");
  const deletePopup = document.getElementById("delete-popup");
  const cancelDeleteBtn = document.getElementById("cancel-delete");
  const confirmDeleteBtn = document.getElementById("confirm-delete");
  const recipeDetailsPopup = document.getElementById("recipe-details-popup");
  const closeRecipeDetailsBtn = document.getElementById("close-recipe-details");
  const approveRecipeBtn = document.getElementById("approve-recipe");
  const rejectRecipeBtn = document.getElementById("reject-recipe");
  const rejectReasonPopup = document.getElementById("reject-reason-popup"); // Thêm popup lý do
  const cancelRejectReasonBtn = document.getElementById("cancel-reject-reason");
  const submitRejectReasonBtn = document.getElementById("submit-reject-reason");
  const notification = document.getElementById("notification");
  const notificationMessage = document.getElementById("notification-message");
  const searchInput = document.querySelector(".search-bar input"); // Thanh tìm kiếm


  let currentPage = 1;
  let currentStatus = "all";
  let recipeIdToDelete = null;
  let currentRecipeId = null; // Thêm biến để lưu recipeId
  let searchQuery = ""; // Biến để lưu từ khóa tìm kiếm  

  const showNotification = (message, type) => {
    notificationMessage.textContent = message;
    notification.classList.remove("success", "error");
    notification.classList.add(type);
    notification.classList.add("show");
    setTimeout(() => {
      notification.classList.remove("show");
    }, 3000);
  };

  const fetchRecipes = async (page, status, search = "") => {
    try {
      const response = await fetch(
        `http://localhost:4000/api/recipesAdmin?page=${page}&status=${status}&search=${encodeURIComponent(search)}`
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Lỗi khi lấy dữ liệu từ API");
      }
      const data = await response.json();

      currentPage = data.currentPage;
      const totalPages = data.totalPages;
      pageInfo.textContent = `${currentPage}/${totalPages}`;
      prevPageBtn.disabled = currentPage === 1;
      nextPageBtn.disabled = !data.hasNext;

      recipesTbody.innerHTML = "";

      data.recipes.forEach(recipe => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td data-label="ID">R${String(recipe.recipe_id).padStart(3, "0")}</td>
          <td data-label="Title">${recipe.title}</td>
          <td data-label="Author">${recipe.author}</td>
          <td data-label="Created At">${new Date(recipe.date_created).toLocaleDateString()}</td>
          <td data-label="Status"><span class="status ${recipe.status}">${recipe.status.charAt(0).toUpperCase() + recipe.status.slice(1)}</span></td>
          <td data-label="Action">
            <button class="action-btn view-btn" data-recipe-id="${recipe.recipe_id}">View</button>
            <button class="action-btn delete-icon" data-recipe-id="${recipe.recipe_id}">Delete</button>
          </td>
        `;
        recipesTbody.appendChild(row);
      });

      const deleteIcons = document.querySelectorAll(".delete-icon");
      deleteIcons.forEach(icon => {
        icon.addEventListener("click", () => {
          recipeIdToDelete = icon.getAttribute("data-recipe-id");
          deletePopup.classList.add("show");
        });
      });

      const viewButtons = document.querySelectorAll(".view-btn");
      viewButtons.forEach(button => {
        button.addEventListener("click", async () => {
          currentRecipeId = button.getAttribute("data-recipe-id"); // Lưu recipeId
          try {
            const response = await fetch(`http://localhost:4000/api/recipesAdmin/${currentRecipeId}`);
            if (!response.ok) {
              throw new Error("Lỗi khi lấy chi tiết công thức");
            }
            const data = await response.json();

            // Render thông tin vào pop-up
            document.getElementById("recipe-title").textContent = data.recipe.title;
            document.getElementById("recipe-thumbnail").src = `/assets/image/recipes/${data.recipe.recipe_id}/thumbnail.png`;
            document.getElementById("recipe-author").textContent = data.recipe.author;
            document.getElementById("recipe-date").textContent = new Date(data.recipe.date_created).toLocaleDateString();
            document.getElementById("recipe-servings").textContent = data.recipe.servings;
            document.getElementById("recipe-cooking-time").textContent = `${data.recipe.cooking_time} minutes`;
            document.getElementById("recipe-description").textContent = data.recipe.description || "No description available";

            // Render danh sách nguyên liệu
            const ingredientsContainer = document.getElementById("recipe-ingredients");
            ingredientsContainer.innerHTML = "";
            if (data.ingredients.length > 0) {
              data.ingredients.forEach(ingredient => {
                const ingredientItem = document.createElement("p");
                ingredientItem.textContent = `${ingredient.name}: ${ingredient.amount} ${ingredient.unit_name}`;
                ingredientsContainer.appendChild(ingredientItem);
              });
            } else {
              ingredientsContainer.textContent = "No ingredients listed";
            }

            // Render các bước nấu ăn
            const stepsContainer = document.getElementById("recipe-steps");
            stepsContainer.innerHTML = "";
            if (data.steps.length > 0) {
              data.steps.forEach(step => {
                const stepItem = document.createElement("div");
                stepItem.classList.add("step-item");
                stepItem.innerHTML = `
                  <p><strong>Step ${step.step_number}</strong></p>
                  <p>${step.description}</p>
                `;
                stepsContainer.appendChild(stepItem);
              });
            } else {
              stepsContainer.textContent = "No steps available";
            }

            // Hiển thị pop-up
            recipeDetailsPopup.classList.add("show");

            // Xử lý nút Approve
            approveRecipeBtn.onclick = async () => {
              try {
                const response = await fetch(`http://localhost:4000/api/recipesAdmin/${currentRecipeId}/status`, {
                  method: "PUT",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ status: "approved" }),
                });
                if (!response.ok) throw new Error("Lỗi khi duyệt công thức");
                recipeDetailsPopup.classList.remove("show");
                showNotification("Recipe approved successfully", "success");
                fetchRecipes(currentPage, currentStatus);
              } catch (error) {
                showNotification("Error approving recipe", "error");
              }
            };

            // Xử lý nút Reject
            rejectRecipeBtn.onclick = () => {
              rejectReasonPopup.classList.add("show"); // Hiển thị popup lý do
            };
          } catch (error) {
            showNotification("Error fetching recipe details", "error");
            console.error("Lỗi:", error);
          }
        });
      });
    } catch (error) {
      recipesTbody.innerHTML = "<tr><td colspan='6'>Lỗi tải dữ liệu!</td></tr>";
      console.error("Lỗi:", error);
    }
  };

  fetchRecipes(currentPage, currentStatus);

  prevPageBtn.addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage--;
      fetchRecipes(currentPage, currentStatus);
    }
  });

  nextPageBtn.addEventListener("click", () => {
    currentPage++;
    fetchRecipes(currentPage, currentStatus);
  });

  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      tabs.forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      currentStatus = tab.textContent.toLowerCase();
      currentPage = 1;
      fetchRecipes(currentPage, currentStatus);
    });
  });

  cancelDeleteBtn.addEventListener("click", () => {
    deletePopup.classList.remove("show");
    recipeIdToDelete = null;
  });

  confirmDeleteBtn.addEventListener("click", async () => {
    if (!recipeIdToDelete) return;

    try {
      const response = await fetch(`http://localhost:4000/api/recipesAdmin/${recipeIdToDelete}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Lỗi khi xóa công thức");
      }
      deletePopup.classList.remove("show");
      showNotification("Recipe deleted successfully", "success");
      fetchRecipes(currentPage, currentStatus);
    } catch (error) {
      showNotification("Error deleting recipe", "error");
      console.error("Lỗi:", error);
    } finally {
      recipeIdToDelete = null;
    }
  });

  // Xử lý nút đóng pop-up chi tiết công thức
  closeRecipeDetailsBtn.addEventListener("click", () => {
    recipeDetailsPopup.classList.remove("show");
  });

  // Xử lý nút Cancel trong reject reason popup
  cancelRejectReasonBtn.addEventListener("click", () => {
    rejectReasonPopup.classList.remove("show");
  });

  // Xử lý nút Submit trong reject reason popup
  submitRejectReasonBtn.addEventListener("click", async () => {
    const reason = document.getElementById("reject-reason").value;

    if (!reason) {
      showNotification("Please provide a reason", "error");
      return;
    }

    try {
      const response = await fetch(`http://localhost:4000/api/recipesAdmin/${currentRecipeId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "rejected" }),
      });
      if (!response.ok) throw new Error("Lỗi khi từ chối công thức");

      rejectReasonPopup.classList.remove("show");
      recipeDetailsPopup.classList.remove("show");
      showNotification("Recipe rejected successfully", "success");
      fetchRecipes(currentPage, currentStatus);
    } catch (error) {
      showNotification("Error rejecting recipe", "error");
      console.error("Lỗi:", error);
    }
  });

  searchInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      searchQuery = searchInput.value.trim();
      currentPage = 1;
      fetchRecipes(currentPage, currentStatus, searchQuery);
    }
  });  
});