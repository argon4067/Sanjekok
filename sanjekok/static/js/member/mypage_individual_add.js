$(document).ready(function () {

    // 날짜
    flatpickr("#i_accident_date", {
        locale: "ko",
        dateFormat: "Y-m-d",
        maxDate: "today",
    });

    // 대분류/중분류 목록
    const industryMap = {
        "광업": ["석탄광업 및 채석업", "석회석·금속·비금속광업 및 기타광업"],
        "제조업": [
            "식료품제조업","섬유 및 섬유제품 제조업","목재 및 종이제품 제조업",
            "출판·인쇄·제지업","화학 및 고무제품 제조업",
            "의약품·화장품·연탄·석유제품제조업",
            "기계기구·금속·비금속광물제품제조업","금속제련업",
            "전기기계기구·정밀기구·전자제품제조업",
            "자동차 및 수리업","수제품 및 기타제품 제조업"
        ],
        "전기·가스·증기 및 수도사업": ["전기·가스·증기 및 수도사업"],
        "건설업": ["건설업"],
        "운수·창고 및 통신업": [
            "철도·항공·창고·운수관련서비스업","육상 및 수상운수업","통신업"
        ],
        "임업": ["임업"],
        "어업": ["어업"],
        "농업": ["농업"],
        "금융 및 보험업": ["금융 및 보험업"],
        "기타의 사업": [
            "시설관리및사업지원서비스업","해외파견자","전문·보건·교육·여가관련서비스업",
            "도소매·음식·숙박업","부동산업 및 임대업","국가 및 지방자치단체의 사업",
            "주한미군","기타의 각종사업"
        ]
    };


    /* ---------------------------------------------------
       1) 대분류 / 중분류 초기화
       --------------------------------------------------- */
    const $cat1 = $("#category1");
    const $cat2 = $("#category2");

    // HTML에서 옵션 제거 후 JS로만 채움
    $cat1.empty().append(`<option value="">대분류 선택</option>`);

    $.each(industryMap, function (key) {
        $cat1.append(`<option value="${key}">${key}</option>`);
    });

    // 대분류 → 중분류
    $cat1.on("change", function () {
        const selected = $(this).val();
        $cat2.empty().append(`<option value="">중분류 선택</option>`);

        if (!selected) return;

        industryMap[selected].forEach(item =>
            $cat2.append(`<option value="${item}">${item}</option>`)
        );
    });


    /* ---------------------------------------------------
       2) 중분류 선택 → industry_id 설정
       --------------------------------------------------- */
    $("#category2").on("change", function () {

        const type1 = $("#category1").val();
        const type2 = $("#category2").val();

        const found = industries.find(
            item => item.type1 === type1 && item.type2 === type2
        );

        $("#industry_id").val(found ? found.id : "");
    });



    /* ---------------------------------------------------
       3) 발생형태 / 질병 모달
       --------------------------------------------------- */
    const occList = [ ... ];
    const disList = [ ... ];

    const $occInput = $("#occInput");
    const $disInput = $("#disInput");

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

    $occInput.on("click", function () {
        if (!$(this).prop("disabled")) openModal("occ");
    });

    $disInput.on("click", function () {
        if (!$(this).prop("disabled")) openModal("dis");
    });

    $(".close-btn").on("click", function () {
        closeModal();
    });

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

    function closeModal() {
        $("#modal").hide();
    }

    function createGrid(list, $targetInput) {
        const $modalGrid = $("#modalGrid");

        $.each(list, function (_, item) {
            const $div = $("<div>").text(item);
            $div.on("click", function () {
                $targetInput.val(item);
                closeModal();
            });
            $modalGrid.append($div);
        });
    }

});


// 주소 API
function searchAddress(targetId) {
    new daum.Postcode({
        oncomplete: function (data) {
            $("#" + targetId).val(data.address);
        }
    }).open();
}
