document.addEventListener("DOMContentLoaded", () => {
  const reportsTbody = document.getElementById("reports-tbody");
  const prevPageBtn = document.getElementById("prev-page");
  const nextPageBtn = document.getElementById("next-page");
  const pageInfo = document.getElementById("page-info");
  const tabs = document.querySelectorAll(".tab");
  const deletePopup = document.getElementById("delete-popup");
  const cancelDeleteBtn = document.getElementById("cancel-delete");
  const confirmDeleteBtn = document.getElementById("confirm-delete");
  const reportDetailsPopup = document.getElementById("report-details-popup");
  const closeReportDetailsBtn = document.getElementById("close-report-details");
  const acceptReportBtn = document.getElementById("accept-report");
  const rejectReportBtn = document.getElementById("reject-report");
  const acceptOptionPopup = document.getElementById("accept-option-popup");

  const cancelAcceptOptionBtn = document.getElementById("cancel-approve");
  const submitAcceptOptionBtn = document.getElementById("confirm-approve");

  const rejectReasonPopup = document.getElementById("reject-reason-popup");
  const cancelRejectReasonBtn = document.getElementById("cancel-reject-reason");
  const submitRejectReasonBtn = document.getElementById("submit-reject-reason");
  const notification = document.getElementById("notification");
  const notificationMessage = document.getElementById("notification-message");
  const searchInput = document.querySelector(".search-bar input");

  let currentPage = 1;
  let currentStatus = "all";
  let reportIdToDelete = null;
  let currentReportId = null;
  let currentRecipeId = null;
  let currentRecipeUserId = null;
  let searchQuery = "";

  const showNotification = (message, type) => {
    notificationMessage.textContent = message;
    notification.classList.remove("success", "error");
    notification.classList.add(type);
    notification.classList.add("show");
    setTimeout(() => {
      notification.classList.remove("show");
    }, 3000);
  };

  const fetchReports = async (page, status, search = "") => {
    try {
      const response = await fetch(
        `http://localhost:4000/api/reports?page=${page}&status=${status}&search=${encodeURIComponent(search)}`
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

      reportsTbody.innerHTML = "";

      data.reports.forEach(report => {
        const status = report.report_status ?? "pending";
        const statusText = status.charAt(0).toUpperCase() + status.slice(1);
        const row = document.createElement("tr");
        row.innerHTML = `
          <td data-label="Report ID">${report.report_id}</td>
          <td data-label="Reporter">${report.reporter ?? "Unknown"}</td>
          <td data-label="Recipe">${report.recipe_title || "Recipe not found"}</td>
          <td data-label="Created At">${report.created_at ? new Date(report.created_at).toLocaleDateString() : "Unknown"}</td>
          <td data-label="Status"><span class="status ${status}">${statusText}</span></td>
          <td data-label="Action">
            <button class="action-btn view-btn" data-report-id="${report.report_id}" data-recipe-id="${report.recipe_id ?? ''}">View</button>
            <button class="action-btn delete-icon" data-report-id="${report.report_id}">Delete</button>
          </td>
        `;
        reportsTbody.appendChild(row);
      });

      const deleteIcons = document.querySelectorAll(".delete-icon");
      deleteIcons.forEach(icon => {
        icon.addEventListener("click", () => {
          reportIdToDelete = icon.getAttribute("data-report-id");
          deletePopup.classList.add("show");
        });
      });

      const viewButtons = document.querySelectorAll(".view-btn");
      viewButtons.forEach(button => {
        button.addEventListener("click", async () => {
          currentReportId = button.getAttribute("data-report-id");
          currentRecipeId = button.getAttribute("data-recipe-id");

          try {
            const response = await fetch(`http://localhost:4000/api/reports/${currentReportId}`);
            if (!response.ok) {
              const errorData = await response.json();
              throw new Error(errorData.error || "Lỗi khi lấy chi tiết báo cáo");
            }
            const data = await response.json();

            currentRecipeUserId = data.recipe ? data.recipe.user_id : null;

            document.getElementById("report-reporter").textContent = data.report.reporter ?? "Unknown";
            document.getElementById("report-date").textContent = data.report.created_at ? new Date(data.report.created_at).toLocaleDateString() : "Unknown";
            document.getElementById("report-reason").textContent = data.report.reason || "No reason provided";

            if (data.recipe) {
              document.getElementById("recipe-title").textContent = data.recipe.title ?? "Unknown";
              document.getElementById("recipe-author").textContent = data.recipe.author ?? "Unknown";
              document.getElementById("recipe-date").textContent = data.recipe.date_created ? new Date(data.recipe.date_created).toLocaleDateString() : "N/A";
              document.getElementById("recipe-thumbnail").src = `/assets/image/recipes/${data.recipe.recipe_id}/thumbnail.png`;
              document.getElementById("recipe-servings").textContent = data.recipe.servings ?? "N/A";
              document.getElementById("recipe-cooking-time").textContent = data.recipe.cooking_time ? `${data.recipe.cooking_time} minutes` : "N/A";
              document.getElementById("recipe-description").textContent = data.recipe.description || "No description available";

              const ingredientsContainer = document.getElementById("recipe-ingredients");
              ingredientsContainer.innerHTML = "";
              if (data.ingredients && data.ingredients.length > 0) {
                data.ingredients.forEach(ingredient => {
                  if (ingredient.name && ingredient.amount && ingredient.unit_name) {
                    const ingredientItem = document.createElement("p");
                    ingredientItem.textContent = `${ingredient.name}: ${ingredient.amount} ${ingredient.unit_name}`;
                    ingredientsContainer.appendChild(ingredientItem);
                  }
                });
              } else {
                ingredientsContainer.textContent = "No ingredients listed";
              }

              const stepsContainer = document.getElementById("recipe-steps");
              stepsContainer.innerHTML = "";
              if (data.steps && data.steps.length > 0) {
                data.steps.forEach(step => {
                  if (step.step_number && step.description) {
                    const stepItem = document.createElement("div");
                    stepItem.classList.add("step-item");
                    stepItem.innerHTML = `
                      <p><strong>Step ${step.step_number}</strong></p>
                      <p>${step.description}</p>
                    `;
                    stepsContainer.appendChild(stepItem);
                  }
                });
              } else {
                stepsContainer.textContent = "No steps available";
              }
            } else {
              document.getElementById("recipe-title").textContent = "Recipe not found";
              document.getElementById("recipe-author").textContent = "N/A";
              document.getElementById("recipe-date").textContent = "N/A";
              document.getElementById("recipe-thumbnail").src = `/assets/image/recipes/${data.recipe.recipe_id}/thumbnail.png`;
              document.getElementById("recipe-servings").textContent = "N/A";
              document.getElementById("recipe-cooking-time").textContent = "N/A";
              document.getElementById("recipe-description").textContent = "Recipe not available";
              document.getElementById("recipe-ingredients").textContent = "N/A";
              document.getElementById("recipe-steps").textContent = "N/A";
            }

            acceptReportBtn.style.display = data.recipe ? "inline-block" : "none";

            reportDetailsPopup.classList.add("show");
          } catch (error) {
            showNotification("Error fetching report details: " + error.message, "error");
            console.error("Lỗi:", error);
          }
        });
      });
    } catch (error) {
      reportsTbody.innerHTML = "<tr><td colspan='6'>Lỗi tải dữ liệu!</td></tr>";
      console.error("Lỗi:", error);
    }
  };

  fetchReports(currentPage, currentStatus);

  prevPageBtn.addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage--;
      fetchReports(currentPage, currentStatus, searchQuery);
    }
  });

  nextPageBtn.addEventListener("click", () => {
    currentPage++;
    fetchReports(currentPage, currentStatus, searchQuery);
  });

  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      tabs.forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      currentStatus = tab.textContent.toLowerCase();
      currentPage = 1;
      fetchReports(currentPage, currentStatus, searchQuery);
    });
  });

  cancelDeleteBtn.addEventListener("click", () => {
    deletePopup.classList.remove("show");
    reportIdToDelete = null;
  });

  confirmDeleteBtn.addEventListener("click", async () => {
    if (!reportIdToDelete) return;

    try {
      const response = await fetch(`http://localhost:4000/api/reports/${reportIdToDelete}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Lỗi khi xóa báo cáo");
      }
      deletePopup.classList.remove("show");
      showNotification("Report deleted successfully", "success");
      fetchReports(currentPage, currentStatus, searchQuery);
    } catch (error) {
      showNotification("Error deleting report", "error");
      console.error("Lỗi:", error);
    } finally {
      reportIdToDelete = null;
    }
  });

  closeReportDetailsBtn.addEventListener("click", () => {
    reportDetailsPopup.classList.remove("show");
  });

  acceptReportBtn.addEventListener("click", () => {
    acceptOptionPopup.classList.add("show");
  });

  cancelAcceptOptionBtn.addEventListener("click", () => {
    acceptOptionPopup.classList.remove("show");
  });



  submitAcceptOptionBtn.addEventListener("click", async () => {

    try {
      const updateStatusResponse = await fetch(`http://localhost:4000/api/reports/${currentReportId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "accepted" }),
      });
      if (!updateStatusResponse.ok) throw new Error("Lỗi khi cập nhật trạng thái báo cáo");

      
      const deleteResponse = await fetch(`http://localhost:4000/api/recipes/${currentRecipeId}`, {
        method: "DELETE",
      });
      if (!deleteResponse.ok) throw new Error("Lỗi khi xóa công thức");
      showNotification("Recipe deleted and report accepted", "success");

      acceptOptionPopup.classList.remove("show");
      reportDetailsPopup.classList.remove("show");
      fetchReports(currentPage, currentStatus, searchQuery);
    } catch (error) {
      showNotification("Error processing report", "error");
      console.error("Lỗi:", error);
    }
  });

  rejectReportBtn.addEventListener("click", () => {
    rejectReasonPopup.classList.add("show");
  });

  cancelRejectReasonBtn.addEventListener("click", () => {
    rejectReasonPopup.classList.remove("show");
  });

  submitRejectReasonBtn.addEventListener("click", async () => {
    const reason = document.getElementById("reject-reason").value;

    if (!reason) {
      showNotification("Please provide a reason", "error");
      return;
    }

    try {
      const response = await fetch(`http://localhost:4000/api/reports/${currentReportId}/status`, {
        method: "PUT", 
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "rejected" }),
      });
      if (!response.ok) throw new Error("Lỗi khi từ chối báo cáo");

      rejectReasonPopup.classList.remove("show");
      reportDetailsPopup.classList.remove("show");
      showNotification("Report rejected successfully", "success");
      fetchReports(currentPage, currentStatus, searchQuery);
    } catch (error) {
      showNotification("Error rejecting report", "error");
      console.error("Lỗi:", error);
    }
  });

  searchInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      searchQuery = searchInput.value.trim();
      currentPage = 1;
      fetchReports(currentPage, currentStatus, searchQuery);
    }
  });
});