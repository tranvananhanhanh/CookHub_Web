// Hàm hiển thị popup lỗi
function showErrorPopup(message) {
    const popup = document.querySelector("#error-popup.popup");
    if (popup) {
        const popupMessage = popup.querySelector(".popup-content .popup-message.error-message");
        if (popupMessage) {
            console.log("Showing error popup with message:", message);
            popupMessage.textContent = message;
            popup.classList.add("open");
        } else {
            console.error("Error popup message element not found");
        }
    } else {
        console.error("Error popup not found, falling back to alert:", message);
        alert(message);
    }
}

// Hàm hiển thị popup thành công
function showSuccessPopup(message) {
    const popup = document.querySelector("#success-popup.popup");
    if (popup) {
        const popupMessage = popup.querySelector(".popup-content .popup-message.success-message");
        if (popupMessage) {
            console.log("Showing success popup with message:", message);
            popupMessage.textContent = message;
            popup.classList.add("open");
        } else {
            console.error("Success popup message element not found");
        }
    } else {
        console.error("Success popup not found, falling back to alert:", message);
        alert(message);
    }
}

// Hàm đóng popup
function closePopup(popupElement) {
    if (popupElement) {
        console.log("Closing popup:", popupElement.id);
        popupElement.classList.remove("open");
    }
}

// Hàm đóng popup lỗi
function closeErrorPopup() {
    const popup = document.querySelector("#error-popup.popup");
    closePopup(popup);
}

// Hàm đóng popup thành công
function closeSuccessPopup() {
    const popup = document.querySelector("#success-popup.popup");
    closePopup(popup);
}

// Gắn sự kiện đóng cho các nút OK hoặc cancel
document.addEventListener("DOMContentLoaded", () => {
    const errorPopup = document.querySelector("#error-popup.popup");
    const successPopup = document.querySelector("#success-popup.popup");

    if (errorPopup) {
        const okButton = errorPopup.querySelector(".popup-btn#OK-btn");
        const cancelButton = errorPopup.querySelector(".popup-btn#popup-cancel-btn");

        if (okButton || cancelButton) {
            if (okButton) {
                okButton.addEventListener("click", closeErrorPopup);
                console.log("OK button event listener added for error popup");
            }

            if (cancelButton) {
                cancelButton.addEventListener("click", closeErrorPopup);
                console.log("OK button event listener added for error popup");
            }
        } else {
            console.error("OK button or cancel button not found in error popup");
        }
    }

    if (successPopup) {
        const okButton = successPopup.querySelector(".popup-btn#OK-btn");
        if (okButton) {
            okButton.addEventListener("click", closeSuccessPopup);
            console.log("OK button event listener added for success popup");
        } else {
            console.error("OK button not found in success popup");
        }
    }
});