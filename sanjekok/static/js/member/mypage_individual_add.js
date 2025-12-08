$(document).ready(function () {

    // 생년월일 Flatpickr 초기화
    flatpickr("#i_accident_date", {
        locale: "ko",
        dateFormat: "Y-m-d",
        maxDate: "today",
    });

    /* 발생형태 리스트 */
    const occList = [
        "떨어짐","넘어짐","부딪힘","물체에 맞음","무너짐","끼임",
        "절단·베임·찔림","감전","폭발·파열","화재","깔림·뒤집힘",
        "이상온도 물체접촉","빠짐·익사","광산사고","불균형 및 무리한 동작",
        "화학물질 누출·접촉","산소결핍","사업장내 교통사고",
        "사업장외 교통사고","업무상질병","체육행사등의 사고",
        "폭력행위","동물상해","기타","분류불능"
    ];

    /* 질병 리스트 */
    const disList = [
        "직업병","진폐증","소음성난청","이상기압","진동장해","물리적인자 기타",
        "이황화탄소","트리클로로에틸렌(TCE)","기타유기화합물","벤젠","타르","염화비닐",
        "디이소시아네이트","석면","기타화학물질","연","수은","크롬",
        "카드뮴","망간","감염성질환","독성간염","직업성피부질환","직업성암",
        "직업병 기타","작업관련성 질병","뇌혈관질환","심장질환","뇌·심혈관질환",
        "신체부담작업","비사고성요통","사고성요통","수근관증후군",
        "간질환","정신질환","작업관련성 기타"
    ];

    $(document).ready(function () {

        const $occInput = $("#occInput");
        const $disInput = $("#disInput");

        /* 라디오 변경 시 input 활성화 */
        $("input[name='mode']").on("change", function () {
            const mode = $("input[name='mode']:checked").val();

            if (mode === "occ") {
                $occInput.prop("disabled", false);
                $disInput.prop("disabled", true).val("");
            } else if (mode === "dis") {
                $occInput.prop("disabled", true).val("");
                $disInput.prop("disabled", false);
            } else {
                $occInput.prop("disabled", false);
                $disInput.prop("disabled", false);
            }
        });

        /* input 클릭 → 모달 오픈 */
        $occInput.on("click", function () {
            if (!$occInput.prop("disabled")) {
                openModal("occ");
            }
        });

        $disInput.on("click", function () {
            if (!$disInput.prop("disabled")) {
                openModal("dis");
            }
        });

        /* 모달 닫기 */
        $("#modal").on("click", ".close-btn", function () {
            closeModal();
        });

        /* 모달 열기 함수 */
        function openModal(type) {
            const $modal = $("#modal");
            const $modalGrid = $("#modalGrid");
            const $modalTitle = $("#modalTitle");

            $modalGrid.empty();

            if (type === "occ") {
                $modalTitle.text("발생형태 선택");
                createGrid(occList, $occInput);
            } else {
                $modalTitle.text("질병 선택");
                createGrid(disList, $disInput);
            }

            $modal.css("display", "flex");
        }

        /* 모달 닫기 함수 */
        function closeModal() {
            $("#modal").hide();
        }

        /* 그리드 생성 (jQuery) */
        function createGrid(list, $targetInput) {
            const $modalGrid = $("#modalGrid");

            $.each(list, function (index, item) {
                const $div = $("<div>").text(item);

                $div.on("click", function () {
                    $targetInput.val(item);
                    closeModal();
                });

                $modalGrid.append($div);
            });
        }
    });
});


// 다음 주소 API
function searchAddress(targetId) {
    new daum.Postcode({
        oncomplete: function (data) {
            $("#" + targetId).val(data.address);
        }
    }).open();
}