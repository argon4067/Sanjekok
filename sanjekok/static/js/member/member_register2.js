document.addEventListener("DOMContentLoaded", function () {
// 생년월일 입력 필드에 대한 Flatpickr 초기화
    flatpickr("#birth_date", {
        locale: "ko",         // 한국어 설정
        dateFormat: "Y-m-d",   // 저장 가능한 형식
        maxDate: "today",      // 오늘 이전만 선택 가능
    });

   document.getElementById("phone").addEventListener("keydown", function (e) {
    // 허용할 키 (백스페이스, Delete, Tab, 화살표키 등)
    const allowedKeys = [
        "Backspace", "Delete", "Tab", "ArrowLeft", "ArrowRight", "Home", "End"
    ];

    // 숫자키 허용
    if (e.key >= "0" && e.key <= "9") {
        return;
    }

    // 허용키면 통과
    if (allowedKeys.includes(e.key)) {
        return;
    }

    // 그 외 입력 차단
    e.preventDefault();
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

