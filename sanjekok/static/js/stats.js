document.addEventListener("DOMContentLoaded", () => {
    const buttons = document.querySelectorAll(".period-btn");
    const visualArea = document.getElementById("stats-visual-area");

    buttons.forEach(btn => {
        btn.addEventListener("click", () => {
            // 버튼 active 변경
            buttons.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");

            // 통계 영역 표시
            visualArea.classList.remove("hidden");

            console.log(btn.dataset.year + "년 통계 요청");
        });
    });
});
