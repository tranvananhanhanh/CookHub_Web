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

    // Lấy thông tin user hiện tại từ localStorage
    const currentUserJSON = localStorage.getItem("currentUser");
    const currentUserObj = currentUserJSON ? JSON.parse(currentUserJSON) : null;
    const userId = currentUserObj?.user_id || null;

    async function fetchPasswordHash() {
        const res = await fetch("http://localhost:4000/api/users");
        const users = await res.json();
        const currentUser = users.find(u => u.user_id === userId);
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
                window.location.href = "/profile";
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