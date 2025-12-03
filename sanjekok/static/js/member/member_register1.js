
document.addEventListener("DOMContentLoaded", function () {

    const usernameInput = document.getElementById("username");
    const pw1Input = document.getElementById("password1");
    const pw2Input = document.getElementById("re-password2");

    const usernameError = document.getElementById("usernameError");
    const passwordError = document.getElementById("passwordError");
    const rePasswordError = document.getElementById("rePasswordError");

    const usernameRegex = /^[a-z0-9]{6,16}$/;
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*]).{8,16}$/;

    usernameInput.addEventListener("blur", function () {
        if (!usernameRegex.test(usernameInput.value.trim())) {
            usernameError.style.display = "block";
        } else {
            usernameError.style.display = "none";
        }
    });

    pw1Input.addEventListener("blur", function () {
        if (!passwordRegex.test(pw1Input.value)) {
            passwordError.style.display = "block";
        } else {
            passwordError.style.display = "none";
        }
    });

    pw2Input.addEventListener("blur", function () {
        if (pw1Input.value !== pw2Input.value) {
            rePasswordError.style.display = "block";
        } else {
            rePasswordError.style.display = "none";
        }
    });

    const form = document.getElementById("registerForm");

    if (form) {
        form.addEventListener("submit", function (e) {

            let valid = true;

            if (!usernameRegex.test(usernameInput.value.trim())) {
                usernameError.style.display = "block";
                valid = false;
            }

            if (!passwordRegex.test(pw1Input.value)) {
                passwordError.style.display = "block";
                valid = false;
            }

            if (pw1Input.value !== pw2Input.value) {
                rePasswordError.style.display = "block";
                valid = false;
            }

            if (!valid) e.preventDefault();
        });
    }
    
    // 생년월일 입력 필드에 대한 Flatpickr 초기화
    flatpickr("#birth_date", {
        dateFormat: "Y-m-d",   // 저장 가능한 형식
        maxDate: "today",      // 오늘 이전만 선택 가능
    });
});
// 다음 주소 API 호출 함수
function searchAddress(targetId) {
    new daum.Postcode({
        oncomplete: function(data) {
            document.getElementById(targetId).value = data.address;
        }
    }).open();
}