// static/js/news/news_list.js
document.addEventListener("DOMContentLoaded", function () {
  if (typeof flatpickr === "undefined") return;

  const startEl = document.querySelector("#startDate");
  const endEl = document.querySelector("#endDate");
  if (!startEl || !endEl) return;  // 둘 중 하나라도 없으면 더 진행하지 않음

  let startPicker = null;
  let endPicker = null;

  // ✅ 초기 상태로 되돌리기(“처음 들어온 것 같은 상태”)
  function resetDateState() {
    // 값 비우기
    if (startPicker) startPicker.clear();
    if (endPicker) endPicker.clear();

    // 제한 초기화
    if (endPicker) {
      endPicker.set("minDate", null);     // 종료일: 제한 없음(단, 오늘까지만)
      endPicker.set("maxDate", "today");
    }
    if (startPicker) {
      startPicker.set("maxDate", "today"); // 시작일: 오늘까지만
    }
  }

  startPicker = flatpickr(startEl, {
    locale: "ko",
    dateFormat: "Y-m-d",
    maxDate: "today",
    allowInput: false,
    onChange: function (selectedDates) {
      const start = selectedDates && selectedDates[0] ? selectedDates[0] : null;

      // 종료일은 시작일 이전 선택 불가
      endPicker.set("minDate", start || null);

      // 이미 종료일이 선택되어 있고 start보다 이전이면 종료일 비우기
      const end = endPicker.selectedDates && endPicker.selectedDates[0] ? endPicker.selectedDates[0] : null;
      if (start && end && end < start) {
        endPicker.clear();
      }
    }
  });

  endPicker = flatpickr(endEl, {
    locale: "ko",
    dateFormat: "Y-m-d",
    maxDate: "today",
    allowInput: false,
    onChange: function (selectedDates) {
      const end = selectedDates && selectedDates[0] ? selectedDates[0] : null;

      // 시작일은 종료일 이후 선택 불가
      startPicker.set("maxDate", end || "today");

      // 이미 시작일이 선택되어 있고 end보다 이후면 시작일 비우기
      const start = startPicker.selectedDates && startPicker.selectedDates[0] ? startPicker.selectedDates[0] : null;
      if (start && end && start > end) {
        startPicker.clear();
      }
    }
  });

  // 초기값이 서버에서 렌더링되어 들어오는 경우를 대비해 연동 적용
  if (startEl.value) {
    const startDate = startPicker.parseDate(startEl.value, "Y-m-d");
    if (startDate) endPicker.set("minDate", startDate);
  }
  if (endEl.value) {
    const endDate = endPicker.parseDate(endEl.value, "Y-m-d");
    if (endDate) startPicker.set("maxDate", endDate);
  }
});

