document.addEventListener("DOMContentLoaded", function () {

    const form = document.getElementById("filterForm");

    // ------------------------------------------
    // 1) 자료유형(type) 체크박스
    // ------------------------------------------
    const typeCheckboxes = document.querySelectorAll('input[name="type"]');
    const cbAll = document.querySelector('input[name="type"][value="전체"]');
    const cbItems = Array.from(typeCheckboxes).filter(cb => cb !== cbAll);

    // “전체” 클릭 시 → 나머지 해제
    cbAll.addEventListener("change", () => {
        if (cbAll.checked) {
            cbItems.forEach(cb => cb.checked = false);
        }
    });

    // 하위 유형 클릭 시 → 전체 상태 자동 관리
    cbItems.forEach(cb => {
        cb.addEventListener("change", () => {

            const checkedCount = cbItems.filter(x => x.checked).length;

            if (checkedCount === cbItems.length) {
                // 전부 체크 → 전체 자동 체크
                cbAll.checked = true;
            } else {
                // 하나라도 빠짐 → 전체 체크 해제
                cbAll.checked = false;
            }
        });
    });

    // ------------------------------------------
    // 2) 언어(lang) 체크박스 (단일 선택)
    // ------------------------------------------
    const langCheckboxes = document.querySelectorAll('input[name="lang"]');

    langCheckboxes.forEach(cb => {
        cb.addEventListener("change", () => {

            // 눌린 체크박스 제외하고 모두 해제
            langCheckboxes.forEach(other => {
                if (other !== cb) other.checked = false;
            });
        });
    });
});

    // ------------------------------------------
    // 3) 최근 본 자료 슬라이드
    // ------------------------------------------

document.addEventListener("DOMContentLoaded", function () {
  const slider = document.querySelector(".recent-slider");
  const prevBtn = document.querySelector(".slider-btn.prev");
  const nextBtn = document.querySelector(".slider-btn.next");

  if (!slider || !prevBtn || !nextBtn) return;

  const cards = slider.querySelectorAll(".recent-card");
  if (cards.length === 0) return;

  const gap = parseInt(getComputedStyle(slider).gap) || 0;
  const cardWidth = cards[0].offsetWidth + gap;

  // ✅ 보여줄 카드 수 (PC 최대 3, 모바일 1)
  const visibleCount =
    window.innerWidth <= 768 ? 1 : Math.min(3, cards.length);

  // ✅ 슬라이더 폭을 "실제 카드 수"에 맞게 조정
  slider.style.width = `${cardWidth * visibleCount - gap}px`;

  // 이동 거리
  const STEP =
    window.innerWidth <= 768 ? cardWidth : cardWidth * visibleCount;

  prevBtn.addEventListener("click", () => {
    slider.scrollBy({ left: -STEP, behavior: "smooth" });
  });

  nextBtn.addEventListener("click", () => {
    slider.scrollBy({ left: STEP, behavior: "smooth" });
  });
});


