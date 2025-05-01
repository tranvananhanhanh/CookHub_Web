// Hàm thêm dòng nguyên liệu mới
function addIngredient() {
    const container = document.getElementById("ingredients-container");
    const ingredientItem = document.createElement("div");
    ingredientItem.classList.add("ingredient-item");
    ingredientItem.innerHTML = `
      <input type="text" class="quantity text-box" placeholder="Quantity">
      <input type="text" class="unit text-box" placeholder="Unit">
      <input type="text" class="ingredient text-box" placeholder="Ingredient">
      <button class="remove-ingredient" onclick="removeIngredient(this)">-</button>
    `; 
    container.appendChild(ingredientItem);
  }
  
  // Hàm xóa dòng nguyên liệu
  function removeIngredient(button) {
    button.parentElement.remove();
  }

  // Hàm tạo một dòng Step mới
  function createStepRow() {
    const container = document.getElementById("instructions-container");
    // Tạo div chứa dòng bước
    const stepRow = document.createElement("div");
    stepRow.classList.add("step-row");
    // Tạo ô hiển thị Step 
    const label = document.createElement("div");
    label.classList.add("step-label");
    label.textContent = "Step ???";
    // Tạo ô nhập thông tin bước
    const input = document.createElement("input");
    input.type = "text";
    input.placeholder = "Enter instruction details...";
    input.classList.add("step-input", "text-box");
    // Tạo khung ảnh cho bước
    const imgBox = document.createElement("div");
    imgBox.classList.add("step-img");
    imgBox.innerHTML = '<i class="fa-solid fa-cloud-upload-alt"></i>';
    imgBox.addEventListener("click", () => {
      alert("Upload image");
    });
    // Tạo nút xóa bước
    const removeBtn = document.createElement("button");
    removeBtn.classList.add("remove-step-btn");
    removeBtn.textContent = "-";
    removeBtn.addEventListener("click", () => {
      stepRow.remove();
      reLabelSteps(); // Đánh lại số sau khi xóa
    });
    // Ghép các phần tử vào dòng bước
    stepRow.appendChild(label);
    stepRow.appendChild(input);
    stepRow.appendChild(imgBox);
    stepRow.appendChild(removeBtn);

    container.appendChild(stepRow);
  }
  // Hàm đánh lại số Step cho tất cả các dòng
  function reLabelSteps() {
    const container = document.getElementById("instructions-container");
    const stepRows = container.querySelectorAll(".step-row");
  
    stepRows.forEach((row, index) => {
      const label = row.querySelector(".step-label");
      label.textContent = `Step ${index + 1}`;
    });
  }
  
  // Hàm thêm Step (gọi khi nhấn nút "Add Another Step")
  function addStep() {
    createStepRow();
    reLabelSteps();
  }
  

  document.addEventListener("DOMContentLoaded", () => {
    addIngredient();
    // Thêm mặc định 5 bước
    for (let i = 0; i < 5; i++) {
      createStepRow();
    }
    reLabelSteps();
  });
  
  document.getElementById("fileInput").addEventListener("change", function(event) {
    const file = event.target.files[0];
    if (!file) return;
  
    const reader = new FileReader();
  
    reader.onload = function(e) {
      const previewImg = document.getElementById("preview");
      if (previewImg) {
        previewImg.src = e.target.result;
        previewImg.classList.add("show"); // Bật hiển thị
      }
    };
  
    reader.readAsDataURL(file);
  });
  
  function handleSave() {
    alert("Recipe saved!");
  }
  
  function handleCancel() {
    alert("Action canceled!");
  }
  