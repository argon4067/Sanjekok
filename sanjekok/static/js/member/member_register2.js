$(document).ready(function () {

    // 생년월일 Flatpickr 초기화
    flatpickr("#m_birth_date", {
        locale: "ko",
        dateFormat: "Y-m-d",
        maxDate: "today",
    });

    // 전화번호 필드에 숫자만 입력되도록 설정
    $("#cel1, #cel2_1, #cel2_2").on("input", function () {
        this.value = this.value.replace(/[^0-9]/g, '');
    });

    // 이메일 도메인 선택 로직
    $('#emailaddr').on('change', function() {
        const selectedValue = $(this).val();
        if (selectedValue) {
            // 도메인을 선택한 경우
            $('#email_dns').val(selectedValue).prop('readonly', true);
        } else {
            // '직접입력'을 선택한 경우
            $('#email_dns').val('').prop('readonly', false).focus();
        }
    });

$(document).ready(function () {

    // 생년월일 Flatpickr 초기화
    flatpickr("#m_birth_date", {
        locale: "ko",
        dateFormat: "Y-m-d",
        maxDate: "today",
    });

    // 전화번호 필드에 숫자만 입력되도록 설정
    $("#cel1, #cel2_1, #cel2_2").on("input", function () {
        this.value = this.value.replace(/[^0-9]/g, '');
    });

    // 이메일 도메인 선택 로직
    $('#emailaddr').on('change', function() {
        const selectedValue = $(this).val();
        if (selectedValue) {
            // 도메인을 선택한 경우
            $('#email_dns').val(selectedValue).prop('readonly', true);
        } else {
            // '직접입력'을 선택한 경우
            $('#email_dns').val('').prop('readonly', false).focus();
        }
    });

    // 폼 제출 시 유효성 검사
    $('form').on('submit', function(e) {
        const $submitButton = $('.btn-next');
        let isValid = true;

        // 중복 제출 방지
        if ($submitButton.is(':disabled')) {
            e.preventDefault();
            return;
        }

        // 필드 값 가져오기
        const name = $('#m_name').val().trim();
        const birthDate = $('#m_birth_date').val().trim();
        const address = $('#m_address').val().trim();
        const jaddress = $('#m_jaddress').val().trim();
        const cel1 = $('#cel1').val().trim();
        const cel2_1 = $('#cel2_1').val().trim();
        const cel2_2 = $('#cel2_2').val().trim();
        const emailId = $('#email_id').val().trim();
        const emailDns = $('#email_dns').val().trim();

        // 이름 검사 (필수)
        const nameRegex = /^[가-힣]{1,10}$/;
        if (!nameRegex.test(name)) {
            alert('이름은 1~10자의 한글만 입력 가능합니다.');
            $('#m_name').focus();
            isValid = false;
        }

        // 생년월일 검사 (필수)
        if (isValid && !birthDate) {
            alert('생년월일을 입력해주세요.');
            $('#m_birth_date').focus();
            isValid = false;
        }

        // 집 주소 검사 (필수)
        if (isValid && !address) {
            alert('집 주소를 입력해주세요.');
            $('#m_address').focus();
            isValid = false;
        }

        // 직장 주소 검사 (필수)
        if (isValid && !jaddress) {
            alert('직장 주소를 입력해주세요.');
            $('#m_jaddress').focus();
            isValid = false;
        }

        // 전화번호 검사 (선택 사항)
        // 전화번호 필드 중 하나라도 입력되었다면 모두 입력되었는지 확인
        if (isValid && (cel1 || cel2_1 || cel2_2)) {
            if (cel1.length < 3 || cel2_1.length < 4 || cel2_2.length < 4) {
                alert('전화번호를 올바르게 입력해주세요.');
                $('#cel1').focus();
                isValid = false;
            }
        }

        // 이메일 검사 (선택 사항)
        // 이메일 필드 중 하나라도 입력되었다면 유효성 검사 수행
        if (isValid && (emailId || emailDns)) {
            const fullEmail = `${emailId}@${emailDns}`;
            const emailRegex = /^[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*\.[a-zA-Z]{2,3}$/i;
            if (!emailRegex.test(fullEmail) || fullEmail.length > 100) {
                $('#EmailError').text('이메일 형식이 올바르지 않거나 너무 깁니다. (최대 100자)').show();
                isValid = false;
            } else {
                $('#EmailError').hide();
            }
        } else {
            $('#EmailError').hide(); // 필수가 아니므로 비어있으면 에러 메시지 숨김
        }


        if (!isValid) {
            e.preventDefault(); // 폼 제출 중단
        } else {
            $submitButton.prop('disabled', true).text('가입 처리 중...');
        }
    });

    if (window.firstErrorField) {
        let elementToFocus;
        if (window.firstErrorField === 'm_sex') {
            elementToFocus = $('#sex_male');
        } else {
            elementToFocus = $('#' + window.firstErrorField);
        }

        if (elementToFocus && elementToFocus.length) {
            elementToFocus.focus();
        }
    }
});

// 다음 주소 API
function searchAddress(targetId) {
    new daum.Postcode({
        oncomplete: function (data) {
            $("#" + targetId).val(data.address);
        }
    }).open();
}
    
    if (window.firstErrorField) {
        let elementToFocus;
        if (window.firstErrorField === 'm_sex') {
            
            elementToFocus = $('#sex_male'); 
        } else {
            elementToFocus = $('#' + window.firstErrorField); 
        }
        
        if (elementToFocus && elementToFocus.length) { 
            elementToFocus.focus();
        }
    }
});

// 다음 주소 API
function searchAddress(targetId) {
    new daum.Postcode({
        oncomplete: function (data) {
            $("#" + targetId).val(data.address);
        }
    }).open();
}