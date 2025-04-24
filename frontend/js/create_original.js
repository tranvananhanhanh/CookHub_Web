// Xử lý khi trang tải
document.addEventListener("DOMContentLoaded", async () => {
  await fetchUnits(); // Chờ fetchUnits hoàn thành
  addIngredient();

  const addButton = document.getElementById("add-ingredient");
  if (addButton) {
    addButton.addEventListener("click", addIngredient);
  } 
  for (let i = 0; i < 5; i++) {
    addStep();
  }
  reLabelSteps();

  // Xử lý sự kiện submit form
  const recipeForm = document.getElementById("recipe-form");
  if (recipeForm) {
    recipeForm.addEventListener("submit", (e) => {
      e.preventDefault();
      handleSave();
    });
  }
});

async function fetchUnits() {
  try {
    const response = await fetch("/api/units");
    if (!response.ok) throw new Error(`Failed to fetch units ${response.status}`);
    const units = await response.json();
    window.units = units; // Lưu vào biến toàn cục để sử dụng
  } catch (error) {
    console.error("Error fetching units:", error);
    showErrorPopup("Failed to load units. Using default units.");
    window.units = [
      { unit_id: 1, unit_name: "g", equivalent_grams: 1 },
      { unit_id: 2, unit_name: "kg", equivalent_grams: 1000 },
      { unit_id: 3, unit_name: "mg", equivalent_grams: 0.001 },
      { unit_id: 4, unit_name: "mcg", equivalent_grams: 0.000001 },
      { unit_id: 5, unit_name: "oz", equivalent_grams: 28.35 },
      { unit_id: 6, unit_name: "lb", equivalent_grams: 453.59 },
      { unit_id: 7, unit_name: "tsp", equivalent_grams: 5 },
      { unit_id: 8, unit_name: "tbsp", equivalent_grams: 15 },
      { unit_id: 9, unit_name: "cup", equivalent_grams: 240 },
      { unit_id: 10, unit_name: "ml", equivalent_grams: 1 },
      { unit_id: 11, unit_name: "l", equivalent_grams: 1000 },
      { unit_id: 12, unit_name: "pt", equivalent_grams: 473 },
      { unit_id: 13, unit_name: "qt", equivalent_grams: 946 },
      { unit_id: 14, unit_name: "gal", equivalent_grams: 3785 },
    ];
  }
}

let countIngredientItem = 0;
// Hàm thêm dòng nguyên liệu mới
function addIngredient() {
  const container = document.getElementById("ingredients-container");
  const ingredientItem = document.createElement("div");
  ingredientItem.classList.add("ingredient-item");

  // Lấy danh sách đơn vị từ API
  // let units = [];
  // try {
  //   const response = await fetch("/api/units"); 
  //   units = await response.json();
  // } catch (error) {
  //   console.error("Error fetching units:", error);
    // units = [
    //   { unit_name: "g", equivalent_grams: 1 },
    //   { unit_name: "kg", equivalent_grams: 1000 },
    //   { unit_name: "mg", equivalent_grams: 0.001 },
    //   { unit_name: "mcg", equivalent_grams: 0.000001 },
    //   { unit_name: "oz", equivalent_grams: 28.35 },
    //   { unit_name: "lb", equivalent_grams: 453.59 },
    //   { unit_name: "tsp", equivalent_grams: 5 },
    //   { unit_name: "tbsp", equivalent_grams: 15 },
    //   { unit_name: "cup", equivalent_grams: 240 },
    //   { unit_name: "ml", equivalent_grams: 1 },
    //   { unit_name: "l", equivalent_grams: 1000 },
    //   { unit_name: "pt", equivalent_grams: 473 },
    //   { unit_name: "qt", equivalent_grams: 946 },
    //   { unit_name: "gal", equivalent_grams: 3785 },
    // ];
  // }

  const unitOptions = window.units.map(unit => `
    <option value="${unit.unit_id}">${unit.unit_name}</option>
  `).join("");

  ingredientItem.innerHTML = `
    <input type="number" class="quantity text-box" placeholder="Quantity" min="0" step="any">
    <select class="unit text-box" placeholder="Unit">
      <option value="" disabled selected>Select unit</option>
      ${unitOptions}
    </select>
    <input type="text" class="ingredient text-box" pattern="[A-Za-z\s]+" placeholder="Enter ingredient name (in English, e.g., egg, chicken)" required>
    <button type="button" class="remove-ingredient-btn">-</button>
  `;

  countIngredientItem++;
  ingredientItem.querySelector(".remove-ingredient-btn").addEventListener("click", () => {
    removeIngredient(ingredientItem);
  });

  container.appendChild(ingredientItem);
}

function removeIngredient(ingredientItem) {
  if (countIngredientItem <= 1) {
    return;
  }
  ingredientItem.remove();
  countIngredientItem--;
}

let countStepRow = 0;
// Hàm tạo một dòng Step mới
function createStepRow() {
  const container = document.getElementById("instructions-container");
  const stepRow = document.createElement("div");
  stepRow.classList.add("step-row");

  // Tạo ô hiển thị Step
  const label = document.createElement("div");
  label.classList.add("step-label");
  label.textContent = "Step ???";

  // Tạo div step-content chứa input và preview
  const stepContent = document.createElement("div");
  stepContent.classList.add("step-content");

  // Tạo ô nhập thông tin bước
  const input = document.createElement("input");
  input.type = "text";
  input.placeholder = "Enter instruction details...";
  input.classList.add("step-input", "text-box");

  // Tạo vùng preview ảnh
  const imgPreview = document.createElement("div");
  imgPreview.classList.add("img-preview");

  // Ghép input và imgPreview vào step-content
  stepContent.appendChild(input);
  stepContent.appendChild(imgPreview);

  // Tạo khung ảnh cho bước
  const imgBox = document.createElement("div");
  imgBox.classList.add("step-img");
  imgBox.innerHTML = `
    <input type="file" class="step-img-input" accept=".jpg,.jpeg,.png,.gif" multiple style="display:none;">
    <button type="button" class="upload-img-btn">
      <i class="fa-solid fa-cloud-upload-alt"></i>
    </button>
  `;

  // Tạo nút xóa bước
  const removeBtn = document.createElement("button");
  removeBtn.classList.add("remove-step-btn");
  removeBtn.textContent = "-";
  removeBtn.addEventListener("click", () => {
    removeStep(stepRow);
    reLabelSteps(); // Đánh lại số sau khi xóa
  });

  // Ghép các phần tử vào dòng bước
  stepRow.appendChild(label);
  stepRow.appendChild(stepContent);
  stepRow.appendChild(imgBox);
  stepRow.appendChild(removeBtn);
  container.appendChild(stepRow);

  // Tạo mảng chứa file ảnh đã chọn cho mỗi bước
  stepRow.uploadedImages = [];

  // Xử lý upload ảnh
  const fileInput = imgBox.querySelector(".step-img-input");
  const uploadBtn = imgBox.querySelector(".upload-img-btn");
  uploadBtn.addEventListener("click", () => fileInput.click());
  fileInput.addEventListener("change", () => {
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"];
    const files = Array.from(fileInput.files);

    // Kiểm tra định dạng
    const invalidFiles = files.filter(file => !validTypes.includes(file.type));
    if (invalidFiles.length > 0) {
      showErrorPopup("Only JPG, JPEG, PNG, or GIF files are allowed.");
      fileInput.value = "";
      return;
    }

    const totalImages = stepRow.uploadedImages.length + files.length;
    if (totalImages > 3) {
      showErrorPopup("You can only upload a maximum of 3 images per step.");
      fileInput.value = "";
      return;
    }

    // files.forEach((file, index) => {
    //   const img = document.createElement("img");
    //   img.src = URL.createObjectURL(file);
    //   img.classList.add("preview-img");
    //   img.dataset.index = currentImages + index;
    //   img.addEventListener("click", () => openImageModal(img.src));
    //   imgPreview.appendChild(img);
    // });

    files.forEach(file => {
      stepRow.uploadedImages.push(file); // Lưu lại file
  
      const img = document.createElement("img");
      img.src = URL.createObjectURL(file);
      img.classList.add("preview-img");
      img.addEventListener("click", () => openImageModal(img.src));
      imgPreview.appendChild(img);
    });

    fileInput.value = ""; // Clear input để có thể chọn lại cùng 1 file
    // uploadBtn.innerHTML = `<i class="fa-solid fa-cloud-upload-alt"></i><br>(${totalImages}/3)`; // Cập nhật số lượng
  });

  // Xử lý Enter
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const steps = document.querySelectorAll(".step-row");
      const currentIndex = Array.from(steps).indexOf(stepRow);
      const nextStep = steps[currentIndex + 1];
      if (nextStep) {
        nextStep.querySelector(".step-input").focus();
      } else {
        addStep();
        const newSteps = document.querySelectorAll(".step-row");
        newSteps[newSteps.length - 1].querySelector(".step-input").focus();
      }
    }
  });

  reLabelSteps();
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

// Hàm thêm Step
function addStep() {
  countStepRow++;
  createStepRow();
}

function removeStep(stepRow) {
  if (countStepRow <= 1) {
    return;
  }
  stepRow.remove();
  countStepRow--;
}

// Xử lý ảnh thumbnail
document.getElementById("fileInput").addEventListener("change", function (event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    const previewImg = document.getElementById("preview");
    if (previewImg) {
      previewImg.src = e.target.result;
      previewImg.classList.add("show");
    }
  };
  reader.readAsDataURL(file);
});

// Handle Save Function
async function handleSave() {
  const recipeForm = document.getElementById("recipe-form");
  const submitBtn = document.getElementById("submit-btn");
  const formData = new FormData(recipeForm);
  const steps = document.querySelectorAll(".step-row");
  const stepsArray = Array.from(steps);
  const ingredients = document.querySelectorAll(".ingredient-item");

  // Collect input values
  const title = document.querySelector(".recipe-title-border .text-box")?.value.trim();
  const description = document.querySelector(".description-box .text-box")?.value.trim();
  const cookingTime = parseInt(document.getElementById("cooking-time")?.value);
  const servings = parseInt(document.getElementById("servings")?.value);
  const fileInput = document.getElementById("fileInput");
  const coverImage = fileInput?.files[0];

  console.log("Title:", title);
  console.log("Description:", description);
  console.log("Cooking time:", cookingTime);
  console.log("Servings:", servings);
  console.log("Cover image:", coverImage);

  // Validation
  if (!title) {
    showErrorPopup("Please enter a recipe title.");
    return;
  }
  if (title.length > 255) {
    showErrorPopup("Tiêu đề không được vượt quá 255 ký tự.");
    return;
  }
  if (description && description.length > 1000) {
    showErrorPopup("Mô tả không được vượt quá 1000 ký tự.");
    return;
  }
  if (!coverImage) {
    showErrorPopup("Vui lòng tải lên ảnh bìa.");
    return;
  }
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"];
  if (!allowedTypes.includes(coverImage.type)) {
    showErrorPopup("Chỉ hỗ trợ file JPG, JPEG, PNG, hoặc GIF.");
    return;
  }
  if (coverImage.size > 5 * 1024 * 1024) {
    showErrorPopup("File ảnh không được vượt quá 5MB.");
    return;
  }
  if (!cookingTime || cookingTime <= 0) {
    showErrorPopup("Please enter a valid cooking time.");
    return;
  }
  if (!servings || servings <= 0) {
    showErrorPopup("Please enter a valid number of servings.");
    return;
  }
  if (ingredients.length === 0 || Array.from(ingredients).some(ing => {
    const name = ing.querySelector(".ingredient").value.trim();
    const quantity = ing.querySelector(".quantity").value;
    const unit = ing.querySelector(".unit").value;
    return !name || !quantity || !unit;
  })) {
    showErrorPopup("Vui lòng điền đầy đủ thông tin nguyên liệu.");
    return;
  }
  if (steps.length === 0 || stepsArray.some(step => !step.querySelector(".step-input").value.trim())) {
    showErrorPopup("Vui lòng điền mô tả cho tất cả các bước.");
    return;
  }
  if (stepsArray.some(step => step.querySelector(".step-img-input").files.length > 3)) {
    showErrorPopup("Mỗi bước chỉ được upload tối đa 3 ảnh.");
    return;
  }

  for (const step of steps) {
    const images = step.querySelector(".step-img-input").files;
    if (images.length > 3) {
      showErrorPopup("Mỗi bước chỉ được upload tối đa 3 ảnh.");
      return;
    }
    for (const image of images) {
      if (!allowedTypes.includes(image.type)) {
        showErrorPopup("Ảnh chỉ hỗ trợ JPG, JPEG, PNG, hoặc GIF.");
        return;
      }
      if (image.size > 5 * 1024 * 1024) {
        showErrorPopup("Ảnh không được vượt quá 5MB.");
        return;
      }
    }
  }

  // Prepare ingredients array
  const ingredientsArray = Array.from(ingredients).map(ing => ({
    name: ing.querySelector(".ingredient").value.trim(),
    quantity: ing.querySelector(".quantity").value,
    unit_id: ing.querySelector(".unit").value,
  }));

  formData.append("ingredients", JSON.stringify(ingredientsArray));
  formData.append("user_id", 1); // Hardcode tạm thời, cần thay bằng ID người dùng thực

  // Những trường này tự động có trong form rồi
  // formData.append("title", title);
  // formData.append("description", description || "");
  // formData.append("cooking_time", cookingTime);
  // formData.append("servings", servings);
  // formData.append("thumbnail", coverImage);

  // Append steps and images
  stepsArray.forEach((step, index) => {
    const description = step.querySelector(".step-input").value.trim();
    const images = step.uploadedImages || [];

    console.log(`Step ${index} has ${images.length} images:`, images.map(img => img.name)); // Log danh sách file
    formData.append(`steps[${index}][description]`, description);
    // for (let i = 0; i < images.length; i++) {
    //   console.log(`Adding image ${i} for step ${index}:`, images[i].name);
    //   formData.append(`steps[${index}][images][]`, images[i]);
    // }
    images.forEach((image) => {
      formData.append(`steps[${index}][images]`, image); // Loại bỏ [] để khớp với backend
    });
  });

  console.log("FormData entries:", [...formData.entries()]); // Log toàn bộ FormData
  try {
    console.log("Sending FormData:", [...formData.entries()]);
    const response = await fetch("/api/recipes", {
      method: "POST",
      body: formData,
    });
    console.log("Response status:", response.status);
    const data = await response.json();
    console.log("Server response:", data); // Thêm log này
    if (response.ok) {
      showSuccessPopup("Recipe created successfully");
      // setTimeout(() => {
      //   window.location.href = "/create"; // Chuyển hướng sau 2 giây
      // }, 2000);
    } else {
      throw new Error(data.message || "Failed to save recipe.");
    }
  } catch (error) {
    console.error("Fetch error:", error);
    showErrorPopup(error.message || "Có lỗi khi lưu công thức. Vui lòng thử lại.");
  }
}

// Handle Cancel Function
function handleCancel() {
  if (confirm("Are you sure you want to cancel? All changes will be lost.")) {
    window.location.href = "/create";
  }
}

// Modal ảnh
function openImageModal(src) {
  const modal = document.getElementById("image-modal");
  const modalImg = document.getElementById("modal-img");
  modal.style.display = "flex";
  modalImg.src = src;
}

function closeImageModal() {
  const modal = document.getElementById("image-modal");
  modal.style.display = "none";
}

// Đóng modal khi click ngoài
document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("image-modal");
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      closeImageModal();
    }
  });
});

// Popup lỗi
function showErrorPopup(message) {
  const popup = document.getElementById("error-popup");
  const popupContent = popup.querySelector(".popup-content p");
  popupContent.textContent = message;
  popup.style.display = "flex";
}

function closeErrorPopup() {
  const popup = document.getElementById("error-popup");
  popup.style.display = "none";
}

function showSuccessPopup(message) {
  const popup = document.getElementById("error-popup"); // Tái sử dụng error-popup
  const popupContent = popup.querySelector(".popup-content");
  const popupText = popupContent.querySelector("p");
  popupText.textContent = message;
  popupContent.classList.add("success"); // Thêm class success
  popup.style.display = "flex";
  // Tự động đóng sau 2 giây
  setTimeout(() => {
    popup.style.display = "none";
    popupContent.classList.remove("success"); // Xóa class sau khi đóng
  }, 2000);
}