$(document).ready(function () {

    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*]).{8,16}$/;
    const pw1Input = $("#new_password1");     
    const pw2Input = $("#new_password2"); 
    const passwordError = $("#passwordError");
    const rePasswordError = $("#rePasswordError");  

    // 비밀번호 blur 검증
    pw1Input.on("blur", function () {
        if (!passwordRegex.test(pw1Input.val())) {
            passwordError.show();
        } else {
            passwordError.hide();
        }
    });

    // 비밀번호 확인 blur 검증
    pw2Input.on("blur", function () {
        if (pw1Input.val() !== pw2Input.val()) {
            rePasswordError.show();
        } else {
            rePasswordError.hide();
        }
    });


    // 폼 제출 검증
    $("#passwordChangeForm").on("submit", function (e) {
        let valid = true;

        if (!passwordRegex.test(pw1Input.val())) {
            passwordError.show();
            valid = false;
        }

        if (pw1Input.val() !== pw2Input.val()) {
            rePasswordError.show();
            valid = false;
        }

        if (!valid) {
            e.preventDefault();
        }
    });

});