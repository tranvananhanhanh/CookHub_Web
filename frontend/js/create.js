// --- START OF FILE js/create_refactored.js ---
document.addEventListener("DOMContentLoaded", async () => {
    await setupUnitOptions();
    setupInitialState();
    setupEventListeners();
});

let availableUnits = [];

async function setupUnitOptions() {
    try {
        const response = await fetch("/api/units");
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        availableUnits = await response.json();
        console.log("Units loaded:", availableUnits);
        document.querySelectorAll('.unit').forEach(select => populateUnitSelect(select));
    } catch (error) {
        console.error("Error fetching units:", error);
        showPopup("Failed to load units. Using default fallback.", "error");
        availableUnits = [ // Fallback units (giữ nguyên từ bản gốc)
            { unit_id: 1, unit_name: "g", equivalent_grams: 1 }, { unit_id: 2, unit_name: "kg", equivalent_grams: 1000 },
            { unit_id: 3, unit_name: "mg", equivalent_grams: 0.001 }, { unit_id: 4, unit_name: "mcg", equivalent_grams: 0.000001 },
            { unit_id: 5, unit_name: "oz", equivalent_grams: 28.35 }, { unit_id: 6, unit_name: "lb", equivalent_grams: 453.59 },
            { unit_id: 7, unit_name: "tsp", equivalent_grams: 5 }, { unit_id: 8, unit_name: "tbsp", equivalent_grams: 15 },
            { unit_id: 9, unit_name: "cup", equivalent_grams: 240 }, { unit_id: 10, unit_name: "ml", equivalent_grams: 1 },
            { unit_id: 11, unit_name: "l", equivalent_grams: 1000 }, { unit_id: 12, unit_name: "pt", equivalent_grams: 473 },
            { unit_id: 13, unit_name: "qt", equivalent_grams: 946 }, { unit_id: 14, unit_name: "gal", equivalent_grams: 3785 },
        ];
        document.querySelectorAll('.unit').forEach(select => populateUnitSelect(select));
    }
}

function populateUnitSelect(selectElement) {
    // Giữ nguyên placeholder nếu có
    const placeholder = selectElement.querySelector('option[disabled][selected]');
    selectElement.innerHTML = ''; // Xóa các option cũ
    if (placeholder) selectElement.appendChild(placeholder); // Thêm lại placeholder

    availableUnits.forEach(unit => {
        const option = document.createElement('option');
        option.value = unit.unit_id;
        option.textContent = unit.unit_name;
        selectElement.appendChild(option);
    });
}

function setupInitialState() {
    addIngredient();
    // Thêm 5 step rows ban đầu như code gốc
    const instructionsContainer = document.getElementById("instructions-container");
    if (instructionsContainer) {
        for (let i = 0; i < 5; i++) {
            addStep(instructionsContainer); // Truyền container vào
        }
        reLabelSteps();
    }
    updateDescriptionCounter(); // Cập nhật bộ đếm ban đầu
}

function setupEventListeners() {
    // Sử dụng các ID và class từ HTML gốc
    const addIngredientBtn = document.querySelector(".add-ingredient"); // Class từ HTML gốc
    const addStepBtn = document.querySelector(".add-step-btn"); // Class từ HTML gốc
    const recipeForm = document.getElementById("recipe-form");
    const cancelBtn = document.querySelector(".cancel-btn"); // Class từ HTML gốc
    const fileInput = document.getElementById("fileInput"); // Thumbnail input
    const imageModal = document.getElementById("image-modal");
    const popupCloseBtns = document.querySelectorAll(".popup-close-btn");

    // --- Event Listeners ---
    if (addIngredientBtn) addIngredientBtn.addEventListener("click", addIngredient);
    if (addStepBtn) {
        const instructionsContainer = document.getElementById("instructions-container");
        if (instructionsContainer) addStepBtn.addEventListener("click", () => addStep(instructionsContainer));
    }
    if (recipeForm) recipeForm.addEventListener("submit", handleSave); // handleSave sẽ gọi e.preventDefault()
    if (cancelBtn) cancelBtn.addEventListener("click", handleCancel);
    if (fileInput) fileInput.addEventListener("change", handleThumbnailPreview);

    // --- Enter Key Navigation Listeners ---
    const titleInput = document.querySelector(".recipe-title-border .text-box");
    const cookingTimeInput = document.getElementById("cooking-time");
    const servingsInput = document.getElementById("servings");
    const descriptionInput = document.querySelector(".description-box .text-box");

    if (titleInput && cookingTimeInput) {
        titleInput.addEventListener("keydown", (e) => handleEnterKey(e, cookingTimeInput));
    }
    if (cookingTimeInput && servingsInput) {
        cookingTimeInput.addEventListener("keydown", (e) => handleEnterKey(e, servingsInput));
    }
    if (servingsInput && descriptionInput) {
        servingsInput.addEventListener("keydown", (e) => handleEnterKey(e, descriptionInput));
    }

    // --- Description Counter Listener ---
    if (descriptionInput) {
        descriptionInput.addEventListener("input", updateDescriptionCounter);
    }

    // --- Modal and Popup Listeners ---
    if (imageModal) imageModal.addEventListener("click", (e) => {
        if (e.target === imageModal) closeImageModal();
    });
    popupCloseBtns.forEach(btn => btn.addEventListener('click', () => closePopup(btn.closest('.error-popup')))); // Sử dụng class gốc '.error-popup'
}

// --- Helper for Enter Key Navigation ---
function handleEnterKey(event, nextElementToFocus) {
    // Chỉ điều hướng nếu Enter được nhấn và không phải trong textarea (trừ khi muốn)
    if (event.key === 'Enter' && event.target.tagName !== 'TEXTAREA') {
        event.preventDefault(); // Ngăn submit form hoặc xuống dòng (cho input)
        if (nextElementToFocus) {
            nextElementToFocus.focus();
        }
    }
}


// --- Description Counter ---
function updateDescriptionCounter() {
    const descriptionInput = document.querySelector(".description-box .text-box");
    const counterElement = document.getElementById("description-counter"); // Cần thêm element này vào HTML
    if (descriptionInput && counterElement) {
        const currentLength = descriptionInput.value.length;
        const maxLength = 1000; // Giữ nguyên giới hạn
        counterElement.textContent = `${currentLength}/${maxLength}`;
        // Tùy chọn: đổi màu nếu vượt quá giới hạn (dù maxlength nên ngăn chặn)
        // counterElement.style.color = currentLength > maxLength ? 'red' : '';
    }
}


// --- Ingredient Management (Giữ nguyên class gốc) ---
function addIngredient() {
    const container = document.getElementById("ingredients-container");
    if (!container) return;

    const ingredientItem = document.createElement("div");
    ingredientItem.classList.add("ingredient-item"); // Class gốc

    const unitOptions = availableUnits.map(unit => `
        <option value="${unit.unit_id}">${unit.unit_name}</option>
    `).join("");

    // Sử dụng cấu trúc và class gốc
    ingredientItem.innerHTML = `
        <input type="number" class="quantity text-box" placeholder="Quantity" min="0" step="any">
        <select class="unit text-box"> <!-- Bỏ placeholder ở select -->
          <option value="" disabled selected>Select unit</option>
          ${unitOptions}
        </select>
        <input type="text" class="ingredient text-box" placeholder="Enter ingredient name (in English, e.g., egg, chicken)" required>
        <button type="button" class="remove-ingredient-btn">-</button>
      `;

    // Điền đơn vị *sau khi* thêm select vào DOM
    const unitSelect = ingredientItem.querySelector(".unit.text-box");
    if (unitSelect) populateUnitSelect(unitSelect); // Gọi hàm điền đơn vị

    // Thêm event listener cho nút xóa
    ingredientItem.querySelector(".remove-ingredient-btn").addEventListener("click", () => {
        removeIngredient(ingredientItem);
    });

    // Thêm event listener cho Enter key trên input ingredient name
    const nameInput = ingredientItem.querySelector(".ingredient.text-box");
    if (nameInput) {
        nameInput.addEventListener("keydown", handleIngredientEnter);
    }

    const quantityInput = ingredientItem.querySelector(".quantity.text-box");
    if (quantityInput) {
        quantityInput.addEventListener("keydown", (event) => {
            if (event.key === 'Enter') {
                event.preventDefault(); // Ngăn chặn submit form
                console.log("Enter nhấn ở ô số lượng, chuyển focus sang ô chọn đơn vị.");
                // Chuyển focus đến ô chọn đơn vị trong cùng hàng
                const unitSelectElement = ingredientItem.querySelector('.unit.text-box');
                if (unitSelectElement) {
                    unitSelectElement.focus();
                }
            }
        });
    }
    
    container.appendChild(ingredientItem);
    updateIngredientRemoveButtons();
}

function removeIngredient(ingredientItem) {
    const container = document.getElementById("ingredients-container");
    // Chỉ xóa nếu còn nhiều hơn 1 item
    if (container && container.querySelectorAll(".ingredient-item").length > 1) {
        ingredientItem.remove();
        updateIngredientRemoveButtons();
    } else {
        // Không xóa hàng cuối cùng, có thể hiển thị thông báo nếu muốn
        showErrorPopup("At least one ingredient is required.");
    }
}

function updateIngredientRemoveButtons() {
    const container = document.getElementById("ingredients-container");
    const items = container.querySelectorAll(".ingredient-item");
    const disableRemove = items.length <= 1;
    items.forEach(item => {
        const removeBtn = item.querySelector(".remove-ingredient-btn");
        if (removeBtn) removeBtn.disabled = disableRemove;
    });
}

function handleIngredientEnter(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        const currentItem = event.target.closest('.ingredient-item');
        const nextItem = currentItem.nextElementSibling;

        if (nextItem && nextItem.classList.contains('ingredient-item')) {
            // Focus vào quantity của dòng tiếp theo
            const nextQuantityInput = nextItem.querySelector('.quantity.text-box');
            if (nextQuantityInput) nextQuantityInput.focus();
        } else {
            // Nếu là dòng cuối, tạo dòng mới và focus vào quantity của nó
            addIngredient();
            const container = document.getElementById("ingredients-container");
            const newItem = container.lastElementChild; // Dòng vừa mới thêm
            const newQuantityInput = newItem?.querySelector('.quantity.text-box');
            if (newQuantityInput) newQuantityInput.focus();
        }
    }
}


// --- Step Management (Giữ nguyên class gốc) ---
function addStep(container) { // Nhận container làm tham số
    if (!container) container = document.getElementById("instructions-container");
    if (!container) return;
    createStepRow(container);
    reLabelSteps();
}

function createStepRow(container) {
    const stepRow = document.createElement("div");
    stepRow.classList.add("step-row"); // Class gốc

    stepRow.uploadedImages = []; // Lưu file ở đây

    // Sử dụng cấu trúc và class gốc
    stepRow.innerHTML = `
        <div class="step-label">Step ???</div>
        <div class="step-content">
            <input type="text" placeholder="Enter instruction details..." class="step-input text-box">
            <div class="img-preview"></div>
        </div>
        <div class="step-img">
            <input type="file" class="step-img-input" accept=".jpg,.jpeg,.png,.gif" multiple style="display:none;">
            <button type="button" class="upload-img-btn">
                <i class="fa-solid fa-cloud-upload-alt"></i>
            </button>
        </div>
        <button type="button" class="remove-step-btn">-</button>
    `;

    // --- Event Listeners cho step row ---
    const removeBtn = stepRow.querySelector(".remove-step-btn");
    const fileInput = stepRow.querySelector(".step-img-input");
    const uploadBtn = stepRow.querySelector(".upload-img-btn");
    const descriptionInput = stepRow.querySelector(".step-input.text-box"); // Input mô tả step

    removeBtn.addEventListener("click", () => {
        removeStep(stepRow); // Gọi hàm xóa
    });

    uploadBtn.addEventListener("click", () => fileInput.click());
    fileInput.addEventListener("change", (event) => handleStepImageUpload(event, stepRow));

    // Enter trong description input -> tạo step mới hoặc focus step tiếp theo
    descriptionInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            const stepsContainer = document.getElementById("instructions-container");
            const allSteps = stepsContainer.querySelectorAll(".step-row");
            const currentIndex = Array.from(allSteps).indexOf(stepRow);
            const nextStepRow = allSteps[currentIndex + 1];
            if (nextStepRow) {
                nextStepRow.querySelector(".step-input.text-box")?.focus();
            } else {
                addStep(stepsContainer); // Thêm step mới
                const newSteps = stepsContainer.querySelectorAll(".step-row");
                newSteps[newSteps.length - 1]?.querySelector(".step-input.text-box")?.focus();
            }
        }
    });

    container.appendChild(stepRow);
    updateStepRemoveButtons(); // Cập nhật trạng thái nút xóa
}

// --- Giữ nguyên các hàm step còn lại (removeStep, reLabelSteps, handleStepImageUpload) ---
// --- Chỉ cần đảm bảo chúng sử dụng class gốc khi querySelector ---

function handleStepImageUpload(event, stepRow) {
    const fileInput = event.target;
    const imgPreviewContainer = stepRow.querySelector(".img-preview"); // Class gốc
    const files = Array.from(fileInput.files);
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"];
    const maxImages = 3;

    // --- Validation ---
    const currentImageCount = stepRow.uploadedImages.length;
    const potentialTotal = currentImageCount + files.length;

    if (potentialTotal > maxImages) {
        showErrorPopup(`You can only upload a maximum of ${maxImages} images per step.`);
        fileInput.value = "";
        return;
    }
    let validationError = false;
    files.forEach(file => {
        if (!allowedTypes.includes(file.type)) {
            showErrorPopup(`Invalid file type: ${file.name}. Only JPG, JPEG, PNG, GIF allowed.`);
            validationError = true;
        }
        if (file.size > 5 * 1024 * 1024) {
            showErrorPopup(`File too large: ${file.name}. Maximum size is 5MB.`);
            validationError = true;
        }
    });
    if (validationError) {
        fileInput.value = "";
        return;
    }

    // --- Add Previews and Store Files ---
    files.forEach(file => {
        stepRow.uploadedImages.push(file);

        const imgContainer = document.createElement('div');
        imgContainer.style.position = 'relative'; // Cho nút xóa
        imgContainer.style.display = 'inline-block'; // Hiển thị cạnh nhau
        imgContainer.style.margin = '5px';

        const img = document.createElement("img");
        img.src = URL.createObjectURL(file);
        img.classList.add("preview-img"); // Giữ class nếu có style
        img.style.maxWidth = '80px'; // Style preview nhỏ
        img.style.maxHeight = '80px';
        img.style.cursor = 'pointer';
        img.alt = `Preview ${file.name}`;
        img.addEventListener("click", () => openImageModal(img.src));

        const removeImgBtn = document.createElement('button');
        removeImgBtn.innerHTML = '×';
        removeImgBtn.type = 'button';
        removeImgBtn.style.position = 'absolute';
        removeImgBtn.style.top = '0';
        removeImgBtn.style.right = '0';
        removeImgBtn.style.background = 'rgba(255, 0, 0, 0.7)';
        removeImgBtn.style.color = 'white';
        removeImgBtn.style.border = 'none';
        removeImgBtn.style.borderRadius = '50%';
        removeImgBtn.style.width = '18px';
        removeImgBtn.style.height = '18px';
        removeImgBtn.style.lineHeight = '16px';
        removeImgBtn.style.textAlign = 'center';
        removeImgBtn.style.cursor = 'pointer';
        removeImgBtn.style.fontSize = '12px';
        removeImgBtn.onclick = () => {
            const indexToRemove = stepRow.uploadedImages.indexOf(file);
            if (indexToRemove > -1) {
                stepRow.uploadedImages.splice(indexToRemove, 1);
                URL.revokeObjectURL(img.src); // Giải phóng bộ nhớ
            }
            imgContainer.remove();
            // Cập nhật bộ đếm nếu có
        };

        imgContainer.appendChild(img);
        imgContainer.appendChild(removeImgBtn);
        imgPreviewContainer.appendChild(imgContainer);
    });

    fileInput.value = "";
}

function removeStep(stepRow) {
    const container = document.getElementById("instructions-container");
    // Chỉ xóa nếu còn nhiều hơn 1 step
    if (container && container.querySelectorAll(".step-row").length > 1) {
        stepRow.uploadedImages.forEach(file => URL.revokeObjectURL(stepRow.querySelector(`img[src^="blob:"]`)?.src)); // Clean up blob URLs
        stepRow.remove();
        updateStepRemoveButtons(); // Cập nhật trạng thái nút xóa
        reLabelSteps(); // Đánh lại số sau khi xóa
    } else {
        showErrorPopup("At least one instruction step is required.");
    }
}

function reLabelSteps() {
    const container = document.getElementById("instructions-container");
    const stepRows = container.querySelectorAll(".step-row");
    stepRows.forEach((row, index) => {
        const label = row.querySelector(".step-label"); // Class gốc
        if (label) label.textContent = `Step ${index + 1}`;
    });
}

function updateStepRemoveButtons() {
    const container = document.getElementById("instructions-container");
    const items = container.querySelectorAll(".step-row");
    const disableRemove = items.length <= 1;
    items.forEach(item => {
        const removeBtn = item.querySelector(".remove-step-btn"); // Class gốc
        if (removeBtn) removeBtn.disabled = disableRemove;
    });
}


// --- Thumbnail Preview (Sửa lỗi) ---
function handleThumbnailPreview(event) {
    const file = event.target.files[0];
    const previewImg = document.getElementById("preview"); // ID từ HTML gốc

    if (previewImg) { // Chỉ cần check previewImg tồn tại
        if (file) {
            // --- Validation (giữ nguyên) ---
            const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"];
            if (!allowedTypes.includes(file.type)) {
                showErrorPopup("Invalid thumbnail type. Only JPG, JPEG, PNG, GIF allowed.");
                event.target.value = "";
                previewImg.src = "#"; // Reset src
                previewImg.style.display = 'none'; // Ẩn đi
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                showErrorPopup("Thumbnail image too large. Maximum size is 5MB.");
                event.target.value = "";
                previewImg.src = "#";
                previewImg.style.display = 'none';
                return;
            }
            // --- Hiển thị preview ---
            const reader = new FileReader();
            reader.onload = function (e) {
                previewImg.src = e.target.result;
                previewImg.style.display = 'block'; // Hiển thị ảnh khi load xong
                previewImg.style.maxWidth = '100%'; // Đảm bảo vừa khung
                previewImg.style.marginTop = '10px'; // Giữ style gốc
            };
            reader.readAsDataURL(file);
        } else {
            // Không có file được chọn
            previewImg.src = "#";
            previewImg.style.display = 'none'; // Ẩn đi
        }
    } else {
        console.error("Preview image element (#preview) not found.");
    }
}


// --- Form Submission (Handle Save Function - Giữ nguyên class gốc) ---
async function handleSave(event) {
    event.preventDefault(); // Luôn ngăn chặn submit mặc định
    const recipeForm = document.getElementById("recipe-form");
    const submitBtn = document.getElementById("submit-btn"); // ID gốc
    submitBtn.disabled = true;
    submitBtn.value = 'Saving...'; // Thay đổi text của input type=submit

    // --- Validation (Sử dụng hàm riêng để rõ ràng hơn) ---
    if (!validateClientSideForm()) {
        submitBtn.disabled = false;
        submitBtn.value = 'Save';
        return;
    }

    // --- Prepare FormData ---
    const formData = new FormData(recipeForm);
    // Xóa các field không cần thiết hoặc sẽ được xử lý riêng
    formData.delete('thumbnail'); // Xóa placeholder thumbnail nếu có
    formData.delete('steps'); // Xóa placeholder steps nếu có

    // 1. Thêm thumbnail file (nếu có)
    const thumbnailInput = document.getElementById("fileInput");
    if (thumbnailInput?.files?.[0]) {
        formData.append("thumbnail", thumbnailInput.files[0]);
    }

    // 2. Ingredients (Lấy từ các input và JSON stringify)
    const ingredientsArray = [];
    document.querySelectorAll("#ingredients-container .ingredient-item").forEach(item => {
        const quantity = item.querySelector(".quantity.text-box")?.value;
        const unit_id = item.querySelector(".unit.text-box")?.value;
        const name = item.querySelector(".ingredient.text-box")?.value.trim();
        if (quantity && unit_id && name) {
            ingredientsArray.push({ name, quantity, unit_id });
        }
    });
    formData.append("ingredients", JSON.stringify(ingredientsArray));

    // 3. Steps và Step Images
    document.querySelectorAll("#instructions-container .step-row").forEach((stepRow, index) => {
        const description = stepRow.querySelector(".step-input.text-box")?.value.trim();
        // Gửi description dưới dạng steps[index][description] như code backend cũ mong đợi
        formData.append(`steps[${index}][description]`, description);

        // Gửi ảnh step dưới dạng steps[index][images]
        // Backend mới (createRoutes_refactored.js) dùng uploadFinalSteps.any()
        // Nó sẽ nhận file dựa trên fieldname gốc. Frontend cần gửi đúng fieldname.
        stepRow.uploadedImages.forEach((file, imgIndex) => {
            // Tên field phải khớp với cách frontend tạo ra nó và backend nhận diện
            // Dựa trên HTML/JS gốc, tên field là động steps[index][images]
            // formData.append(`steps[${index}]`, file, file.name);
            // Sửa từ steps[${index}][images] thành steps[${index}]
            if (file instanceof File) {
                console.log(`[handleSave] Appending step image: Field=steps[${index}], Name=${file.name}, Size=${file.size}, Type=${file.type}`);
                // Đảm bảo 'file' thực sự là một đối tượng File hợp lệ
                formData.append(`steps[${index}]`, file, file.name);
            } else {
                console.error(`[handleSave] LỖI: Đối tượng không phải là File cho step ${index}, image index ${imgIndex}. Bỏ qua.`);
            }
        });
    });

    // 4. User ID (Hardcode)
    formData.append("user_id", 1);

    // --- Log FormData (để debug) ---
    console.log("--- FormData to be sent ---");
    for (let [key, value] of formData.entries()) {
        if (value instanceof File) {
            console.log(key, `File: ${value.name}, Size: ${value.size}, Type: ${value.type}`);
        } else {
            console.log(key, value);
        }
    }
    console.log("---------------------------");


    // --- API Call ---
    try {
        const response = await fetch("/api/recipes", { // Endpoint gốc
            method: "POST",
            body: formData,
        });

        const data = await response.json();
        console.log("Server response:", data);

        if (response.ok) {
            showSuccessPopup("Recipe created successfully!"); // Dùng popup success
            // Reset form hoặc chuyển hướng sau khi thành công
            setTimeout(() => {
                recipeForm.reset();
                resetClientSideUI(); // Hàm reset UI tùy chỉnh
            }, 1500);
        } else {
            throw new Error(data.message || `Server error: ${response.status}`);
        }
    } catch (error) {
        console.error("Error saving recipe:", error);
        showErrorPopup(`Failed to save recipe: ${error.message}`); // Dùng popup error
    } finally {
        submitBtn.disabled = false;
        submitBtn.value = 'Save'; // Reset text nút
    }
}

function validateClientSideForm() {
    let isValid = true;
    const messages = [];
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"];
    const maxSize = 5 * 1024 * 1024;

    // --- Lấy các element theo class/ID gốc ---
    const title = document.querySelector(".recipe-title-border .text-box")?.value.trim();
    const description = document.querySelector(".description-box .text-box")?.value.trim();
    const cookingTime = document.getElementById("cooking-time")?.value;
    const servings = document.getElementById("servings")?.value;
    const fileInput = document.getElementById("fileInput");
    const coverImage = fileInput?.files[0];
    const ingredientItems = document.querySelectorAll("#ingredients-container .ingredient-item");
    const stepRows = document.querySelectorAll("#instructions-container .step-row");

    // --- Validation Logic (giữ nguyên từ gốc, chỉ sửa cách lấy element) ---
    if (!title) messages.push("Please enter a recipe title.");
    if (title && title.length > 255) messages.push("Title cannot exceed 255 characters.");
    if (description && description.length > 1000) messages.push("Description cannot exceed 1000 characters.");
    if (!coverImage) messages.push("Please upload a cover image.");
    if (coverImage && !allowedTypes.includes(coverImage.type)) messages.push("Cover image: Only JPG, JPEG, PNG, or GIF files are allowed.");
    if (coverImage && coverImage.size > maxSize) messages.push("Cover image: File size cannot exceed 5MB.");
    if (!cookingTime || parseInt(cookingTime) <= 0) messages.push("Please enter a valid cooking time.");
    if (!servings || parseInt(servings) <= 0) messages.push("Please enter a valid number of servings.");

    if (ingredientItems.length === 0) {
        messages.push("Please add at least one ingredient.");
    } else if (Array.from(ingredientItems).some(ing => {
        const name = ing.querySelector(".ingredient.text-box")?.value.trim();
        const quantity = ing.querySelector(".quantity.text-box")?.value;
        const unit = ing.querySelector(".unit.text-box")?.value;
        return !name || !quantity || !unit;
    })) {
        messages.push("Please fill in quantity, unit, and name for all ingredients.");
    }

    if (stepRows.length === 0) {
        messages.push("Please add at least one instruction step.");
    } else if (Array.from(stepRows).some(step => !step.querySelector(".step-input.text-box")?.value.trim())) {
        messages.push("Please enter a description for all steps.");
    }
    // Kiểm tra ảnh step
    let invalidStepImage = false;
    Array.from(stepRows).forEach((step, index) => {
        if (step.uploadedImages.length > 3) {
            messages.push(`Step ${index + 1}: Maximum 3 images allowed.`);
            invalidStepImage = true;
        }
        step.uploadedImages.forEach(imgFile => {
            if (!allowedTypes.includes(imgFile.type)) {
                messages.push(`Step ${index + 1}: Invalid image type (${imgFile.name}).`);
                invalidStepImage = true;
            }
            if (imgFile.size > maxSize) {
                messages.push(`Step ${index + 1}: Image file too large (${imgFile.name}).`);
                invalidStepImage = true;
            }
        });
    });


    if (messages.length > 0) {
        showErrorPopup(messages.join("<br>")); // Hiển thị tất cả lỗi
        isValid = false;
    }

    return isValid;
}

function resetClientSideUI() {
    // Reset thumbnail preview
    const previewImg = document.getElementById("preview");
    if (previewImg) {
        previewImg.src = "#";
        previewImg.style.display = 'none';
    }
    // Clear file input value programmatically (might not work reliably due to security)
    const fileInput = document.getElementById("fileInput");
    if (fileInput) fileInput.value = null;


    // Reset ingredients (giữ lại 1 dòng)
    const ingredientsContainer = document.getElementById("ingredients-container");
    ingredientsContainer.innerHTML = ''; // Xóa hết
    addIngredient(); // Thêm lại 1 dòng mới

    // Reset steps (giữ lại 5 dòng như ban đầu)
    const stepsContainer = document.getElementById("instructions-container");
    stepsContainer.innerHTML = ''; // Xóa hết
    for (let i = 0; i < 5; i++) {
        addStep(stepsContainer);
    }
    reLabelSteps(); // Đánh số lại

    // Reset description counter
    updateDescriptionCounter();
}


// --- Cancel Action ---
function handleCancel() {
    // Kiểm tra xem có thay đổi chưa (đơn giản)
    const title = document.querySelector(".recipe-title-border .text-box")?.value.trim();
    const thumbnail = document.getElementById("fileInput")?.files?.[0];
    if (title || thumbnail) { // Chỉ cần có title hoặc thumbnail là coi như có thay đổi
        if (confirm("Are you sure you want to cancel? All unsaved changes will be lost.")) {
            // recipeForm.reset(); // Reset form
            // resetClientSideUI(); // Reset UI
            window.location.reload(); // Tải lại trang là cách đơn giản nhất
        }
    } else {
        window.location.reload(); // Không có thay đổi, tải lại luôn
    }
}

// --- Image Modal (Giữ nguyên) ---
function openImageModal(src) {
    const modal = document.getElementById("image-modal"); // ID gốc
    const modalImg = document.getElementById("modal-img"); // ID gốc
    if (modal && modalImg) {
        modal.style.display = "flex";
        modalImg.src = src;
    }
}

function closeImageModal() {
    const modal = document.getElementById("image-modal"); // ID gốc
    if (modal) {
        modal.style.display = "none";
        modal.querySelector('#modal-img').src = ''; // Clear src
    }
}

// --- Popups (Sử dụng class gốc .error-popup) ---
function showErrorPopup(message) {
    // Tìm popup lỗi đầu tiên (giả sử chỉ có 1 hoặc dùng cái đầu tiên)
    const popup = document.querySelector("#error-popup"); // ID gốc
    if (popup) {
        const popupContent = popup.querySelector(".popup-content p"); // Phần tử p gốc
        if (popupContent) popupContent.innerHTML = message; // Dùng innerHTML cho <br>
        popup.style.display = "flex";
        // Reset style nếu dùng chung popup cho success
        popup.querySelector(".popup-content").classList.remove("success");
    } else {
        alert(message); // Fallback
    }
}

function closePopup(popupElement) { // Hàm đóng chung
    if (popupElement) {
        popupElement.style.display = "none";
    }
}

// Sửa lại closeErrorPopup để dùng hàm chung
function closeErrorPopup() {
    closePopup(document.querySelector("#error-popup"));
}


function showSuccessPopup(message) {
    const popup = document.querySelector("#error-popup"); // Tái sử dụng popup gốc
    if (popup) {
        const popupContentDiv = popup.querySelector(".popup-content");
        const popupText = popupContentDiv.querySelector("p");
        if (popupText) popupText.textContent = message;
        popupContentDiv.classList.add("success"); // Thêm class success (cần CSS định nghĩa)
        popup.style.display = "flex";
        // Tự động đóng sau 2 giây (như gốc)
        setTimeout(() => {
            closePopup(popup);
            popupContentDiv.classList.remove("success"); // Xóa class khi đóng
        }, 2000);
    } else {
        alert(message); // Fallback
    }
}
// --- END OF FILE js/create_refactored.js ---