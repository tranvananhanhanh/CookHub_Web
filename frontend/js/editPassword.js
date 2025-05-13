// import bcrypt from 'bcryptjs';

document.addEventListener("DOMContentLoaded", () => {
    const editBtn = document.querySelector('.edit-profile-form .edit-button');
    const editPassModal = document.querySelector('.modal-edit-pass');
    const closeBtns = document.querySelectorAll('.edit-pass-form .js-modal-close');
    
    const form = document.getElementById("edit-pass-form");

    const currentPassInput = document.getElementById("current-pass");
    const newPassInput = document.getElementById("new-pass");
    const confirmPassInput = document.getElementById("confirm-new-pass");

    const currentPassError = document.getElementById("current-pass-error");
    const newPassError = document.getElementById("new-pass-error");
    const confirmPassError = document.getElementById("confirm-pass-error");

    let currentPasswordHash = "";
    let isCurrentPassCorrect = false;

    // Hàm lấy userId từ URL
    function getUserIdFromUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        const userIdStr = urlParams.get('userId'); // Giả sử param là 'userId'
        return userIdStr ? parseInt(userIdStr, 10) : null;
    }

    let userId = getUserIdFromUrl();
    console.log("[UserProfile] Target User ID to load:", userId);

    async function fetchPasswordHash() {
        let apiUrl = "http://localhost:4000/api/users";
        if (userId) {
            apiUrl += `?user_id=${userId}`;
        }
        console.log("[UserProfile] Fetching user profile from:", apiUrl);
        const res = await fetch(apiUrl);

        const user = await res.json();
        const currentUser = user[0];

        if (currentUser) {
            currentPasswordHash = currentUser.password_hash;
        }
    }

    fetchPasswordHash();

    function clearErrors() {
        currentPassError.textContent = "";
        newPassError.textContent = "";
        confirmPassError.textContent = "";
    }

    // Mặc định ẩn các trường mới
    function hideNewPassFields() {
        newPassInput.style.display = "none";
        confirmPassInput.style.display = "none";
    }

    function showNewPassFields() {
        newPassInput.style.display = "block";
        confirmPassInput.style.display = "block";
    }

    hideNewPassFields();

    function showEditPassForm() {
        editPassModal.classList.add('open');
        form.reset();
        hideNewPassFields();
        clearErrors();
    }

    function hideEditPassForm() {
        editPassModal.classList.remove('open');
    }
    
    for (const closeBtn of closeBtns) {
        closeBtn.addEventListener('click', hideEditPassForm);
    }

    editBtn.addEventListener('click', showEditPassForm);

    currentPassInput.addEventListener("keydown", async (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            clearErrors();
            const inputPass = currentPassInput.value;

            if (!currentPasswordHash) {
                currentPassError.textContent = "Cannot find user";
                return;
            }

            // const match = await bcrypt.compare(inputPass, currentPasswordHash);
            const match = (inputPass === currentPasswordHash);
            if (match) {
                isCurrentPassCorrect = true;
                currentPassError.textContent = "";
                showNewPassFields();
                newPassInput.focus();
            } else {
                isCurrentPassCorrect = false;
                hideNewPassFields();
                currentPassError.textContent = "Current password is incorrect";
            }
        }
    });

    newPassInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            confirmPassInput.focus();
        }
    });    

    confirmPassInput.addEventListener("keydown", async (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            await validateAndSubmit();
        }
    });

    async function validateAndSubmit() {
        clearErrors();
    
        const inputPass = currentPassInput.value;
        const newPass = newPassInput.value;
        const confirmPass = confirmPassInput.value;
    
        if (!currentPasswordHash) {
            currentPassError.textContent = "Cannot find user";
            return;
        }
    
        // const match = await bcrypt.compare(inputPass, currentPasswordHash);
        const match = (inputPass === currentPasswordHash);
        if (!match) {
            currentPassError.textContent = "Current password is incorrect";
            hideNewPassFields();
            return;
        }
    
        showNewPassFields();
    
        if (newPass === "") {
            newPassError.textContent = "Please enter new password";
            return;
        }
    
        if (newPass !== confirmPass) {
            confirmPassError.textContent = "Confirm password does not match";
            return;
        }
    
        // Gửi lên server
        try {
            const response = await fetch(`http://localhost:4000/api/users/update-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: userId,
                    new_password: newPass 
                })
            });
    
            const data = await response.json();
    
            if (data.message === "Password updated successfully") {
                showSuccessPopup("Change password successfully!");
                setTimeout(() => {
                    console.log("[EditPassword] Redirecting to profile page");
                    window.location.href = `/profile?userId=${userId}`;
                }, 1500);
            } else {
                alert("Failed to update password.");
            }
        } catch (err) {
            console.error("Error updating password:", err);
            alert("Server error.");
        }
    }    

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        await validateAndSubmit();
    });
});