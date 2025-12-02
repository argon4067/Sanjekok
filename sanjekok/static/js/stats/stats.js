document.addEventListener("DOMContentLoaded", () => {
    const btn = document.getElementById("myInjuryBtn");
    const dropdown = document.getElementById("injuryDropdown");
    const periodButtons = document.querySelectorAll(".period-btn");
    const visualArea = document.getElementById("stats-visual-area");

    const injuryDetail = document.getElementById("injuryDetail");

    // 드롭다운 열기
    btn.addEventListener("click", () => {
        dropdown.classList.toggle("hidden");
    });

    // 산재 선택
    dropdown.querySelectorAll("li").forEach(item => {
        item.addEventListener("click", () => {

            const title = item.dataset.title;
            const injury = item.dataset.injury;
            const disease = item.dataset.disease;
            const date = item.dataset.date;

            let html = "";

            if (title) {
                html += `<p>산재명: ${title}</p>`;
            }
            if (injury) {
                html += `<p>발생 형태: ${injury}</p>`;
            }
            if (disease) {
                html += `<p>질병: ${disease}</p>`;
            }
            if (date) {
                html += `<p>발생일자: ${date}</p>`;
            }

            // 출력 영역 업데이트
            injuryDetail.innerHTML = html;

            // 분석기간 초기화 + 통계 숨김
            periodButtons.forEach((b) => b.classList.remove("active"));
            visualArea.classList.add("hidden");

            dropdown.classList.add("hidden");
        });
    });

    // 분석 기간 클릭 -> 통계 표시
    periodButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            periodButtons.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            visualArea.classList.remove("hidden");
        });
    });
});
