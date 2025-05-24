let currentUserId = null;
let availableCategories = [];

document.addEventListener("DOMContentLoaded", async () => {
    const urlParams = new URLSearchParams(window.location.search);
    currentUserId = urlParams.get('userId');

    const submitBtn = document.getElementById("submit-btn");

    if (!currentUserId) {
        console.error("User ID not found in URL. Please ensure the URL contains '?userId=YOUR_USER_ID'.");
        showErrorPopup("User ID is missing. Cannot create or save recipe.");
        if (submitBtn) {
            submitBtn.disabled = true; // Vô hiệu hóa nút lưu nếu không có userId
            submitBtn.value = 'Save (User ID Missing)';
        }
        // Không return ở đây để các hàm setup khác vẫn chạy, nhưng form sẽ không submit được
    } else {
        console.log("Current User ID:", currentUserId);
    }

    await setupUnitOptions();
    await loadCategories();
    setupInitialState();
    setupEventListeners();
});

let availableUnits = [];

// Tải danh sách đơn vị từ API hoặc sử dụng giá trị mặc định
async function setupUnitOptions() {
    try {
        const response = await fetch("/api/units");
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        availableUnits = await response.json();
        console.log("Đã tải đơn vị:", availableUnits);
        document.querySelectorAll('.unit').forEach(select => populateUnitSelect(select));
    } catch (error) {
        console.error("Lỗi khi tải đơn vị:", error);
        showErrorPopup("Failed to load units. Using default values.");
        availableUnits = [
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

// Điền danh sách đơn vị vào thẻ select
function populateUnitSelect(selectElement) {
    const placeholder = selectElement.querySelector('option[disabled][selected]');
    selectElement.innerHTML = '';
    if (placeholder) selectElement.appendChild(placeholder);

    availableUnits.forEach(unit => {
        const option = document.createElement('option');
        option.value = unit.unit_id;
        option.textContent = unit.unit_name;
        selectElement.appendChild(option);
    });
}

// Thiết lập trạng thái ban đầu
function setupInitialState() {
    addIngredient();
    const instructionsContainer = document.getElementById("instructions-container");
    if (instructionsContainer) {
        for (let i = 0; i < 5; i++) {
            addStep(instructionsContainer);
        }
        reLabelSteps();
    }
    updateDescriptionCounter();
}

// Tự động điều chỉnh kích thước textarea
function autoResizeTextarea(element, initialHeight) {
    element.style.height = initialHeight + 'px';
    const newHeight = element.scrollHeight;
    if (newHeight > initialHeight) {
        element.style.height = newHeight + 'px';
    }
}

// Thiết lập các sự kiện lắng nghe
function setupEventListeners() {
    const addIngredientBtn = document.querySelector(".add-ingredient");
    const addStepBtn = document.querySelector(".add-step-btn");
    const recipeForm = document.getElementById("recipe-form");
    const cancelBtn = document.querySelector(".cancel-btn");
    const fileInput = document.getElementById("fileInput");
    const imageModal = document.getElementById("image-modal");

    if (addIngredientBtn) addIngredientBtn.addEventListener("click", addIngredient);
    if (addStepBtn) {
        const instructionsContainer = document.getElementById("instructions-container");
        if (instructionsContainer) addStepBtn.addEventListener("click", () => {
            if (instructionsContainer.querySelectorAll(".step-row").length < 50) {
                addStep(instructionsContainer);
            } else {
                showErrorPopup("Maximum 50 steps allowed.");
            }
        });
    }
    if (recipeForm) recipeForm.addEventListener("submit", handleSave);
    if (cancelBtn) cancelBtn.addEventListener("click", handleCancel);
    if (fileInput) fileInput.addEventListener("change", handleThumbnailPreview);

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

    if (descriptionInput) {
        descriptionInput.addEventListener("input", () => {
            updateDescriptionCounter();
            autoResizeTextarea(descriptionInput, 48);
        });
    }

    if (imageModal) imageModal.addEventListener("click", (e) => {
        if (e.target === imageModal) closeImageModal();
    });

    // Gắn sự kiện cho nút OK của success-popup để reset form sau khi đóng
    const successPopup = document.querySelector("#success-popup.popup");
    if (successPopup) {
        const okButton = successPopup.querySelector(".popup-btn#OK-btn");
        if (okButton) {
            okButton.addEventListener("click", () => {
                closeSuccessPopup();
                recipeForm.reset();
                resetClientSideUI();
            });
        }
    }
}

// Xử lý phím Enter để chuyển focus
function handleEnterKey(event, nextElementToFocus) {
    if (event.key === 'Enter' && event.target.tagName !== 'TEXTAREA') {
        event.preventDefault();
        if (nextElementToFocus) {
            nextElementToFocus.focus();
        }
    }
}

// Cập nhật bộ đếm ký tự mô tả
function updateDescriptionCounter() {
    const descriptionInput = document.querySelector(".description-box .text-box");
    const counterElement = document.getElementById("description-counter");
    if (descriptionInput && counterElement) {
        const currentLength = descriptionInput.value.length;
        const maxLength = 1000;
        counterElement.textContent = `${currentLength}/${maxLength}`;
    }
}

// Cập nhật bộ đếm ký tự bước
function updateStepCounter(textarea, counterElement) {
    const currentLength = textarea.value.length;
    const maxLength = 500;
    if (counterElement) {
        counterElement.textContent = `${currentLength}/${maxLength}`;
    }
}

// Chuẩn hóa văn bản: xóa dấu cách thừa, viết hoa chữ cái đầu
function normalizeText(text) {
    if (!text || typeof text !== 'string') { // Thêm kiểm tra đầu vào
        return '';
    }

    return text.trim()
        .replace(/\s+/g, ' ')
        .toLowerCase()
        .replace(/\b\w/g, c => c.toUpperCase());
}

// Thêm nguyên liệu mới
function addIngredient() {
    const container = document.getElementById("ingredients-container");
    if (!container) return;

    const ingredientItem = document.createElement("div");
    ingredientItem.classList.add("ingredient-item");

    const unitOptions = availableUnits.map(unit => `
        <option value="${unit.unit_id}">${unit.unit_name}</option>
    `).join("");

    ingredientItem.innerHTML = `
        <input type="number" class="quantity text-box" placeholder="Quantity" min="0" step="any">
        <select class="unit">
          <option value="" disabled selected>Unit</option>
          ${unitOptions}
        </select>
        <input type="text" class="ingredient text-box" placeholder="Ingredient" required>
        <button type="button" class="remove-ingredient-btn">-</button>
    `;

    const unitSelect = ingredientItem.querySelector(".unit");
    if (unitSelect) populateUnitSelect(unitSelect);

    ingredientItem.querySelector(".remove-ingredient-btn").addEventListener("click", () => {
        removeIngredient(ingredientItem);
    });

    const nameInput = ingredientItem.querySelector(".ingredient.text-box");
    if (nameInput) {
        nameInput.addEventListener("keydown", handleIngredientEnter);
    }

    const quantityInput = ingredientItem.querySelector(".quantity.text-box");
    if (quantityInput) {
        quantityInput.addEventListener("keydown", (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                const unitSelectElement = ingredientItem.querySelector('.unit');
                if (unitSelectElement) {
                    unitSelectElement.focus();
                }
            }
        });
    }

    container.appendChild(ingredientItem);
    updateIngredientRemoveButtons();
}

// Xóa nguyên liệu
function removeIngredient(ingredientItem) {
    const container = document.getElementById("ingredients-container");
    if (container && container.querySelectorAll(".ingredient-item").length > 1) {
        ingredientItem.remove();
        updateIngredientRemoveButtons();
    } else {
        showErrorPopup("At least one ingredient is required.");
    }
}

// Cập nhật trạng thái nút xóa nguyên liệu
function updateIngredientRemoveButtons() {
    const container = document.getElementById("ingredients-container");
    const items = container.querySelectorAll(".ingredient-item");
    const disableRemove = items.length <= 1;
    items.forEach(item => {
        const removeBtn = item.querySelector(".remove-ingredient-btn");
        if (removeBtn) removeBtn.disabled = disableRemove;
    });
}

// Xử lý phím Enter cho nguyên liệu
function handleIngredientEnter(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        const currentItem = event.target.closest('.ingredient-item');
        const nextItem = currentItem.nextElementSibling;

        if (nextItem && nextItem.classList.contains('ingredient-item')) {
            const nextQuantityInput = nextItem.querySelector('.quantity.text-box');
            if (nextQuantityInput) nextQuantityInput.focus();
        } else {
            addIngredient();
            const container = document.getElementById("ingredients-container");
            const newItem = container.lastElementChild;
            const newQuantityInput = newItem?.querySelector('.quantity.text-box');
            if (newQuantityInput) newQuantityInput.focus();
        }
    }
}

// Thêm bước mới
function addStep(container) {
    if (!container) container = document.getElementById("instructions-container");
    if (!container) return;
    createStepRow(container);
    reLabelSteps();
}

// Tạo hàng bước mới
function createStepRow(container) {
    const stepRow = document.createElement("div");
    stepRow.classList.add("step-row");

    stepRow.uploadedImages = [];

    stepRow.innerHTML = `
        <div class="step-label">Step ???</div>
        <div class="step-content">
            <div class="step-description-box">
                <textarea placeholder="Enter step instructions..." class="step-input" maxlength="500"></textarea>
            </div>
            <div class="step-counter" style="text-align: right; font-size: 0.8em; color: #666;">
                <span class="step-counter-text">0/500</span>
            </div>
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

    const removeBtn = stepRow.querySelector(".remove-step-btn");
    const fileInput = stepRow.querySelector(".step-img-input");
    const uploadBtn = stepRow.querySelector(".upload-img-btn");
    const descriptionInput = stepRow.querySelector(".step-input");
    const counterElement = stepRow.querySelector(".step-counter-text");

    removeBtn.addEventListener("click", () => {
        removeStep(stepRow);
    });

    uploadBtn.addEventListener("click", () => fileInput.click());
    fileInput.addEventListener("change", (event) => handleStepImageUpload(event, stepRow));

    if (descriptionInput && counterElement) {
        descriptionInput.addEventListener("input", () => {
            updateStepCounter(descriptionInput, counterElement);
            autoResizeTextarea(descriptionInput, 24);
        });
        updateStepCounter(descriptionInput, counterElement);
    }

    container.appendChild(stepRow);
    updateStepRemoveButtons();
}

// Xử lý tải ảnh lên cho bước
function handleStepImageUpload(event, stepRow) {
    const fileInput = event.target;
    const imgPreviewContainer = stepRow.querySelector(".img-preview");
    const files = Array.from(fileInput.files);
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"];
    const maxImages = 3;

    const currentImageCount = stepRow.uploadedImages.length;
    const potentialTotal = currentImageCount + files.length;

    if (potentialTotal > maxImages) {
        showErrorPopup(`Only up to ${maxImages} images are allowed per step.`);
        fileInput.value = "";
        return;
    }
    let validationError = false;
    files.forEach(file => {
        if (!allowedTypes.includes(file.type)) {
            showErrorPopup(`Invalid file type: ${file.name}. Only JPG, JPEG, PNG, GIF are allowed.`);
            validationError = true;
        }
        if (file.size > 5 * 1024 * 1024) {
            showErrorPopup(`File ${file.name} is too large. Maximum size is 5MB.`);
            validationError = true;
        }
    });
    if (validationError) {
        fileInput.value = "";
        return;
    }

    files.forEach(file => {
        stepRow.uploadedImages.push(file);

        const imgContainer = document.createElement('div');
        imgContainer.style.position = 'relative';
        imgContainer.style.display = 'inline-block';
        imgContainer.style.margin = '5px';

        const img = document.createElement("img");
        img.src = URL.createObjectURL(file);
        img.classList.add("preview-img");
        img.style.maxWidth = '80px';
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
                URL.revokeObjectURL(img.src);
            }
            imgContainer.remove();
        };

        imgContainer.appendChild(img);
        imgContainer.appendChild(removeImgBtn);
        imgPreviewContainer.appendChild(imgContainer);
    });

    fileInput.value = "";
}

// Xóa bước
function removeStep(stepRow) {
    const container = document.getElementById("instructions-container");
    if (container && container.querySelectorAll(".step-row").length > 1) {
        stepRow.uploadedImages.forEach(file => URL.revokeObjectURL(stepRow.querySelector(`img[src^="blob:"]`)?.src));
        stepRow.remove();
        updateStepRemoveButtons();
        reLabelSteps();
    } else {
        showErrorPopup("At least one step is required.");
    }
}

// Đánh số lại các bước
function reLabelSteps() {
    const container = document.getElementById("instructions-container");
    const stepRows = container.querySelectorAll(".step-row");
    stepRows.forEach((row, index) => {
        const label = row.querySelector(".step-label");
        if (label) label.textContent = `Step ${index + 1}`;
    });
}

// Cập nhật trạng thái nút xóa bước
function updateStepRemoveButtons() {
    const container = document.getElementById("instructions-container");
    const items = container.querySelectorAll(".step-row");
    const disableRemove = items.length <= 1;
    items.forEach(item => {
        const removeBtn = item.querySelector(".remove-step-btn");
        if (removeBtn) removeBtn.disabled = disableRemove;
    });
}

// Xử lý xem trước ảnh bìa
function handleThumbnailPreview(event) {
    const file = event.target.files[0];
    const previewImg = document.getElementById("preview");

    if (previewImg) {
        if (file) {
            const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"];
            if (!allowedTypes.includes(file.type)) {
                showErrorPopup("Invalid cover image type. Only JPG, JPEG, PNG, GIF are allowed.");
                event.target.value = "";
                previewImg.src = "#";
                previewImg.style.display = 'none';
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                showErrorPopup("Cover image is too large. Maximum size is 5MB.");
                event.target.value = "";
                previewImg.src = "#";
                previewImg.style.display = 'none';
                return;
            }
            const reader = new FileReader();
            reader.onload = function (e) {
                previewImg.src = e.target.result;
                previewImg.style.display = 'block';
                previewImg.style.maxWidth = '100%';
                previewImg.style.marginTop = '10px';
            };
            reader.readAsDataURL(file);
        } else {
            previewImg.src = "#";
            previewImg.style.display = 'none';
        }
    } else {
        console.error("Không tìm thấy phần tử ảnh xem trước (#preview).");
    }
}

// Xử lý lưu công thức
async function handleSave(event) {
    event.preventDefault();
    const recipeForm = document.getElementById("recipe-form");
    const submitBtn = document.getElementById("submit-btn");

    if (!currentUserId) { // Kiểm tra lại currentUserId trước khi thực hiện bất kỳ hành động nào
        showErrorPopup("User ID is missing. Cannot create recipe.");
        return; // Ngăn chặn việc gửi form
    }

    submitBtn.disabled = true;
    submitBtn.value = 'Saving...';

    if (!validateClientSideForm()) {
        submitBtn.disabled = false;
        submitBtn.value = 'Save';
        return;
    }

    let recipeId = null;

    // Phần 1: Gửi thông tin cơ bản của công thức (không bao gồm thumbnail)
    const basicFormData = new FormData();
    basicFormData.append("user_id", currentUserId);

    const rawTitle = document.querySelector(".recipe-title-border .text-box")?.value;
    const title = normalizeText(rawTitle);
    if (title) {
        basicFormData.append("title", title);
    }

    const cookingTime = document.getElementById("cooking-time")?.value;
    if (cookingTime) {
        basicFormData.append("cooking_time", cookingTime);
    }

    const servings = document.getElementById("servings")?.value;
    if (servings) {
        basicFormData.append("servings", servings);
    }

    const rawDescription = document.querySelector(".description-box .text-box")?.value;
    const description = rawDescription.trim();
    if (description) {
        basicFormData.append("description", description);
    }

    console.log("--- Dữ liệu FormData cơ bản ---");
    for (let [key, value] of basicFormData.entries()) {
        console.log(`[FormData cơ bản] ${key}: ${value}`);
    }
    console.log("---------------------");

    try {
        const basicResponse = await fetch("/api/create/recipes", {
            method: "POST",
            body: basicFormData,
        });

        const basicData = await basicResponse.json();
        console.log("Trạng thái phản hồi công thức cơ bản:", basicResponse.status);
        console.log("Phản hồi công thức cơ bản:", basicData);

        if (!basicResponse.ok) {
            throw new Error(basicData.message || `Server error: ${basicResponse.status} ${basicResponse.statusText}`);
        }

        recipeId = basicData.recipe_id;
        if (!recipeId) {
            throw new Error("No recipe ID received from basic recipe creation");
        }

        // Phần 2: Gửi nguyên liệu, các bước và thumbnail VÀ CATEGORIES
        const detailsFormData = new FormData();
        detailsFormData.append("recipe_id", recipeId);

        const thumbnailInput = document.getElementById("fileInput");
        if (thumbnailInput?.files?.[0]) {
            detailsFormData.append("thumbnail", thumbnailInput.files[0]);
        }

        // Nguyên liệu
        const ingredientsArray = [];
        document.querySelectorAll("#ingredients-container .ingredient-item").forEach(item => {
            const quantity = item.querySelector(".quantity.text-box")?.value;
            const unit_id = item.querySelector(".unit")?.value;
            const rawName = item.querySelector(".ingredient.text-box")?.value;
            const name = normalizeText(rawName);
            if (quantity && unit_id && name) {
                ingredientsArray.push({ quantity, unit_id, name });
            } else if (name || quantity || unit_id) {
                console.warn(`[handleSave] Bỏ qua nguyên liệu có thể chưa hoàn chỉnh: ${quantity}${unit_id} ${name}`);
            }
        });
        if (ingredientsArray.length > 0) {
            detailsFormData.append("ingredients", JSON.stringify(ingredientsArray));
        } else {
            detailsFormData.append("ingredients", JSON.stringify([]));
            console.log("[handleSave] Không tìm thấy nguyên liệu hợp lệ, gửi mảng rỗng.");
        }

        // Các bước
        document.querySelectorAll("#instructions-container .step-row").forEach((stepRow, index) => {
            const rawDescription = stepRow.querySelector(".step-content .step-description-box .step-input")?.value;
            const description = rawDescription.trim();
            console.log(`[handleSave] Đã chuẩn bị mô tả bước ${index}: "${description}" (Độ dài: ${description.length})`);
            detailsFormData.append(`steps[${index}][description]`, description || "");

            stepRow.uploadedImages.forEach((file, imgIndex) => {
                if (file instanceof File) {
                    console.log(`[handleSave] Thêm ảnh bước: Trường=steps[${index}][images], Tên=${file.name}, Kích thước=${file.size}, Loại=${file.type}`);
                    detailsFormData.append(`steps[${index}][images]`, file);
                } else {
                    console.error(`[handleSave] Lỗi: Đối tượng không phải File cho bước ${index}, chỉ số ảnh ${imgIndex}. Bỏ qua.`);
                }
            });
        });

        const selectedCategoryIds = [];
        document.querySelectorAll('#categories-container input[name="category_ids"]:checked').forEach(checkbox => {
            selectedCategoryIds.push(checkbox.value);
        });

        // Gửi dưới dạng JSON string array
        if (selectedCategoryIds.length > 0) {
            detailsFormData.append("category_ids", JSON.stringify(selectedCategoryIds));
        } else {
            // Điều này không nên xảy ra nếu validateClientSideForm hoạt động đúng
            console.warn("[handleSave] Không có category nào được chọn, gửi mảng rỗng.");
            detailsFormData.append("category_ids", JSON.stringify([]));
        }

        // Log chi tiết FormData trước khi gửi
        console.log("--- Dữ liệu FormData chi tiết trước khi gửi ---");
        for (let [key, value] of detailsFormData.entries()) {
            if (value instanceof File) {
                console.log(`[FormData chi tiết] ${key}: Tệp: ${value.name}, Kích thước: ${value.size}, Loại: ${value.type}`);
            } else {
                console.log(`[FormData chi tiết] ${key}: ${value}`);
            }
        }
        console.log("---------------------");

        const detailsResponse = await fetch(`/api/create/recipes/${recipeId}/details`, {
            method: "POST",
            body: detailsFormData,
        });

        // Log phản hồi đầy đủ
        console.log("Trạng thái phản hồi chi tiết:", detailsResponse.status);
        const responseText = await detailsResponse.text();
        console.log("Phản hồi chi tiết (raw):", responseText);
        let detailsData;
        try {
            detailsData = JSON.parse(responseText);
            console.log("Phản hồi chi tiết (JSON):", detailsData);
        } catch (error) {
            console.error("Lỗi parse JSON phản hồi chi tiết:", error.message);
            throw new Error(`Invalid JSON response: ${responseText}`);
        }

        if (!detailsResponse.ok) {
            throw new Error(detailsData.message || `Server error: ${detailsResponse.status} ${detailsResponse.statusText}`);
        }

        showSuccessPopup(detailsData.message || "Recipe created successfully!");

    } catch (error) {
        console.error("Lỗi khi lưu công thức:", error);
        showErrorPopup(`Failed to save recipe: ${error.message}`);
        if (recipeId) {
            try {
                await fetch(`/api/create/recipes/${recipeId}`, {
                    method: "DELETE",
                });
                console.log(`Đã xóa công thức ${recipeId} do gửi chi tiết thất bại`);
            } catch (cleanupError) {
                console.error("Không thể xóa công thức:", cleanupError);
            }
        }
    } finally {
        submitBtn.disabled = false;
        submitBtn.value = 'Save';

        if (!currentUserId && submitBtn) {
            submitBtn.disabled = true;
            submitBtn.value = 'Save (User ID Missing)';
        }
    }
}

// Kiểm tra dữ liệu phía client
function validateClientSideForm() {
    let isValid = true;
    const messages = [];
    const categoryErrorDiv = document.getElementById("category-error");
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"];
    const maxSize = 5 * 1024 * 1024;

    const title = document.querySelector(".recipe-title-border .text-box")?.value.trim();
    const description = document.querySelector(".description-box .text-box")?.value.trim();
    const cookingTime = document.getElementById("cooking-time")?.value;
    const servings = document.getElementById("servings")?.value;
    const fileInput = document.getElementById("fileInput");
    const coverImage = fileInput?.files[0];
    const ingredientItems = document.querySelectorAll("#ingredients-container .ingredient-item");
    const stepRows = document.querySelectorAll("#instructions-container .step-row");
    console.log(`[validateClientSideForm] Số bước: ${stepRows.length}`);

    if (!title) messages.push("Please enter a recipe title.");
    if (title && title.length > 255) messages.push("Title cannot exceed 255 characters.");
    if (description && description.length > 1000) messages.push("Description cannot exceed 1000 characters.");
    if (!coverImage) messages.push("Please upload a cover image.");
    if (coverImage && !allowedTypes.includes(coverImage.type)) messages.push("Cover image: Only JPG, JPEG, PNG, or GIF allowed.");
    if (coverImage && coverImage.size > maxSize) messages.push("Cover image: File size cannot exceed 5MB.");
    if (!cookingTime || parseInt(cookingTime) <= 0) messages.push("Please enter a valid cooking time (positive number).");
    if (!servings || parseInt(servings) <= 0) messages.push("Please enter a valid number of servings (positive number).");
    if (categoryErrorDiv) categoryErrorDiv.style.display = "none";

    if (ingredientItems.length === 0) {
        messages.push("Please add at least one ingredient.");
    } else if (Array.from(ingredientItems).some(ing => {
        const name = ing.querySelector(".ingredient.text-box")?.value.trim();
        const quantity = ing.querySelector(".quantity.text-box")?.value;
        const unit = ing.querySelector(".unit")?.value;
        return !name || !quantity || !unit;
    })) {
        messages.push("Please fill in quantity, unit, and name for all ingredients.");
    }

    if (stepRows.length === 0) {
        messages.push("Please add at least one instruction step.");
    } else if (stepRows.length > 50) {
        messages.push("Maximum 50 steps allowed.");
    } else {
        Array.from(stepRows).forEach((step, index) => {
            const description = step.querySelector(".step-input")?.value.trim();
            console.log(`[validateClientSideForm] Mô tả bước ${index + 1}: "${description}"`);
            if (!description) {
                messages.push(`Please enter a description for Step ${index + 1}.`);
            }
            if (description.length > 500) {
                messages.push(`Description for Step ${index + 1} cannot exceed 500 characters.`);
            }
        });
    }

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

    const selectedCategories = document.querySelectorAll('#categories-container input[name="category_ids"]:checked');
    if (selectedCategories.length === 0) {
        messages.push("Please select at least one category.");
        if (categoryErrorDiv) {
            categoryErrorDiv.textContent = "Please select at least one category.";
            categoryErrorDiv.style.display = "block";
        }
    }

    if (messages.length > 0) {
        showErrorPopup(messages.join(" "));
        isValid = false;
    }

    return isValid;
}

// Đặt lại giao diện phía client
function resetClientSideUI() {
    const previewImg = document.getElementById("preview");
    if (previewImg) {
        previewImg.src = "#";
        previewImg.style.display = 'none';
    }
    const fileInput = document.getElementById("fileInput");
    if (fileInput) fileInput.value = null;

    const ingredientsContainer = document.getElementById("ingredients-container");
    ingredientsContainer.innerHTML = '';
    addIngredient();

    const stepsContainer = document.getElementById("instructions-container");
    stepsContainer.innerHTML = '';
    for (let i = 0; i < 5; i++) {
        addStep(stepsContainer);
    }
    reLabelSteps();

    updateDescriptionCounter();

    document.querySelectorAll('#categories-container input[name="category_ids"]:checked').forEach(checkbox => {
        checkbox.checked = false;
    });
    const categoryErrorDiv = document.getElementById("category-error");
    if (categoryErrorDiv) categoryErrorDiv.style.display = "none";
}

// Xử lý hủy bỏ
function handleCancel() {
    const title = document.querySelector(".recipe-title-border .text-box")?.value.trim();
    const thumbnail = document.getElementById("fileInput")?.files?.[0];
    if (title || thumbnail) {
        if (confirm("Are you sure you want to cancel? All unsaved changes will be lost.")) {
            window.location.reload();
        }
    } else {
        window.location.reload();
    }
}

// Mở modal ảnh
function openImageModal(src) {
    const modal = document.getElementById("image-modal");
    const modalImg = document.getElementById("modal-img");
    if (modal && modalImg) {
        modal.style.display = "flex";
        modalImg.src = src;
    }
}

// Đóng modal ảnh
function closeImageModal() {
    const modal = document.getElementById("image-modal");
    if (modal) {
        modal.style.display = "none";
        modal.querySelector('#modal-img').src = '';
    }
}

// Hàm mới: Tải danh sách categories từ API
async function loadCategories() {
    try {
        const response = await fetch("/api/create/categories"); // API endpoint mới cần tạo ở backend
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        availableCategories = await response.json();
        console.log("Đã tải categories:", availableCategories);
        populateCategoriesCheckboxes();
    } catch (error) {
        console.error("Lỗi khi tải categories:", error);
        showErrorPopup("Failed to load categories. Please try refreshing.");
        // Có thể cung cấp một vài category mặc định nếu API lỗi
        availableCategories = [ /* { category_id: 1, category_name: 'Default 1'}, ... */];
        populateCategoriesCheckboxes();
    }
}

// Hàm mới: Điền categories vào container dưới dạng checkbox
// function populateCategoriesCheckboxes() {
//     const container = document.getElementById("categories-container");
//     if (!container) {
//         console.error("Không tìm thấy categories-container.");
//         return;
//     }
//     container.innerHTML = ''; // Xóa các checkbox cũ (nếu có)

//     if (availableCategories.length === 0) {
//         container.innerHTML = '<p>No categories available at the moment.</p>';
//         return;
//     }

//     availableCategories.forEach(category => {
//         const label = document.createElement('label');
//         label.classList.add('category-checkbox-label');

//         const checkbox = document.createElement('input');
//         checkbox.type = 'checkbox';
//         checkbox.name = 'category_ids'; // Quan trọng: name để gom nhóm khi gửi form
//         checkbox.value = category.category_id;

//         label.appendChild(checkbox);
//         label.appendChild(document.createTextNode(` ${category.category_name}`)); // Thêm text cho category
//         container.appendChild(label);
//     });
// }

// Hàm mới: Điền categories vào container dưới dạng checkbox, nhóm theo type
function populateCategoriesCheckboxes() {
    const container = document.getElementById("categories-container");
    if (!container) {
        console.error("Không tìm thấy categories-container.");
        return;
    }
    container.innerHTML = ''; // Xóa các checkbox cũ

    if (availableCategories.length === 0) {
        container.innerHTML = '<p>No categories available at the moment.</p>';
        return;
    }

    // Nhóm categories theo 'type'
    const categoriesByType = availableCategories.reduce((acc, category) => {
        const type = category.type || 'Other'; // Nhóm các category không có type vào 'Other'
        if (!acc[type]) {
            acc[type] = [];
        }
        acc[type].push(category);
        return acc;
    }, {});

    // Tạo HTML cho từng nhóm type
    for (const type in categoriesByType) {
        if (categoriesByType.hasOwnProperty(type)) {
            const typeGroupContainer = document.createElement('div');
            typeGroupContainer.classList.add('category-type-group');

            const typeHeader = document.createElement('h4'); // Hoặc h3, h5 tùy theo cấu trúc trang
            typeHeader.classList.add('category-type-header');
            typeHeader.textContent = type;
            typeGroupContainer.appendChild(typeHeader);

            const checkboxesWrapper = document.createElement('div'); // Bọc các checkbox của group này
            checkboxesWrapper.classList.add('category-checkboxes-wrapper');

            categoriesByType[type].forEach(category => {
                const label = document.createElement('label');
                label.classList.add('category-checkbox-label');

                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.name = 'category_ids';
                checkbox.value = category.category_id;

                label.appendChild(checkbox);
                label.appendChild(document.createTextNode(` ${category.category_name}`));
                checkboxesWrapper.appendChild(label);
            });
            typeGroupContainer.appendChild(checkboxesWrapper);
            container.appendChild(typeGroupContainer);
        }
    }
}