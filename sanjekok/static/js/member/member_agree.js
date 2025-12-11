document.addEventListener("DOMContentLoaded", () => {

    function openModal(id) {
        document.getElementById(id).style.display = "flex";
    }

    function closeModal(id) {
        document.getElementById(id).style.display = "none";
    }

    // 닫기 버튼 이벤트
    document.querySelectorAll("[data-close]").forEach(btn => {
        btn.addEventListener("click", function () {
            closeModal(this.getAttribute("data-close"));
        });
    });

    // ---------------------------------------------------------
    //  공통: 스크롤 끝 확인 기능
    // ---------------------------------------------------------
    function activateAfterScroll(contentId, checkboxId, buttonId) {
        const content = document.getElementById(contentId);
        const checkbox = document.getElementById(checkboxId);
        const button = document.getElementById(buttonId);

        function checkScrollEnd() {
            if (content.scrollTop + content.clientHeight >= content.scrollHeight - 5) {
                checkbox.disabled = false;
                checkbox.checked = true;
                button.disabled = false;
                content.removeEventListener("scroll", checkScrollEnd);
            }
        }

        content.addEventListener("scroll", checkScrollEnd);
    }

    // ---------------------------------------------------------
    // 개인정보 모달
    // ---------------------------------------------------------
    document.getElementById("show-priv-modal-btn").addEventListener("click", function () {
        document.getElementById("privScrolledAgree").checked = false;
        document.getElementById("privScrolledAgree").disabled = true;
        document.getElementById("privAgreeBtn").disabled = true;

        activateAfterScroll("privContent", "privScrolledAgree", "privAgreeBtn");

        openModal("modalPrivOverlay");
    });

    document.getElementById("privAgreeBtn").addEventListener("click", function () {
        document.getElementById("agree_priv").checked = true;
        closeModal("modalPrivOverlay");
        updateAllAgreeState();
    });

    // ---------------------------------------------------------
    // 이용약관 모달
    // ---------------------------------------------------------
    document.getElementById("show-term-modal-btn").addEventListener("click", function () {
        document.getElementById("termScrolledAgree").checked = false;
        document.getElementById("termScrolledAgree").disabled = true;
        document.getElementById("termAgreeBtn").disabled = true;

        activateAfterScroll("termContent", "termScrolledAgree", "termAgreeBtn");

        openModal("modalTermOverlay");
    });

    document.getElementById("termAgreeBtn").addEventListener("click", function () {
        document.getElementById("agree_term").checked = true;
        closeModal("modalTermOverlay");
        updateAllAgreeState();
    });

    // ---------------------------------------------------------
    // 마케팅 모달
    // ---------------------------------------------------------
    document.getElementById("show-marketing-modal-btn").addEventListener("click", function () {
        openModal("modalMarketingOverlay");
    });

    // ---------------------------------------------------------
    // 전체 동의 체크박스
    // ---------------------------------------------------------
    document.getElementById("agree_all").addEventListener("change", function () {
        const checked = this.checked;

        document.querySelectorAll(".required-agree, .optional-agree").forEach(el => {
            el.checked = checked;
        });
    });

    // 필수 체크박스 변경 시 전체동의 상태 갱신
    document.querySelectorAll(".required-agree, .optional-agree").forEach(el => {
        el.addEventListener("change", updateAllAgreeState);
    });

    function updateAllAgreeState() {
        const all = document.querySelectorAll(".required-agree, .optional-agree");
        const allChecked = Array.from(all).every(el => el.checked);
        document.getElementById("agree_all").checked = allChecked;
    }

    // ---------------------------------------------------------
    //  폼 제출 체크 (필수 동의 안 하면 제출 불가)
    // ---------------------------------------------------------
    document.getElementById("agreeForm").addEventListener("submit", function (e) {
        const required = document.querySelectorAll(".required-agree");

        for (let r of required) {
            if (!r.checked) {
                alert("[필수] 항목에 모두 동의해야 합니다.");
                e.preventDefault();
                return false;
            }
        }
    });

});