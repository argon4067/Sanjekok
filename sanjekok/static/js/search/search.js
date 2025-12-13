let map;
let userMarker = null;
let incidentMarkers = [];
let infoOverlay = null;

const ctx = window.SEARCH_CONTEXT || { home: "", work: "", accidentList: [] };

/**
 * ✅ 외부 PNG(daumcdn) 의존 제거: SVG 마커를 data URL로 생성
 * - 404 문제 완전 해결
 */
function makeSvgPinMarkerImage(colorHex) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="35" viewBox="0 0 24 35">
      <path d="M12 0C6.6 0 2.2 4.4 2.2 9.8c0 7.2 9.8 25.2 9.8 25.2s9.8-18 9.8-25.2C21.8 4.4 17.4 0 12 0z"
            fill="${colorHex}" stroke="#333" stroke-width="1"/>
      <circle cx="12" cy="10" r="4.2" fill="#fff" opacity="0.95"/>
    </svg>
  `.trim();

  const src = "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(svg);

  return new kakao.maps.MarkerImage(
    src,
    new kakao.maps.Size(24, 35),
    { offset: new kakao.maps.Point(12, 35) }
  );
}

// ✅ 산재 마커(내=빨강 / 타인=노랑) - SVG로 생성(404 없음)
const MY_ACCIDENT_IMG = makeSvgPinMarkerImage("#e53935");      // red
const OTHER_ACCIDENT_IMG = makeSvgPinMarkerImage("#fbc02d");   // yellow

// ✅ 집·근무지 마커(파랑) - 존재 확실한 markerStar 사용
const MY_PLACE_IMG = makeSvgPinMarkerImage("#1e88e5");

// 지도 형태
function initMap() {
  map = new kakao.maps.Map(document.getElementById("map"), {
    center: new kakao.maps.LatLng(37.5665, 126.9780),
    level: 5
  });

  kakao.maps.event.addListener(map, "idle", updateIncidents);

  const homeBtn = document.getElementById("btnHome");
  const workBtn = document.getElementById("btnWork");

  if (ctx.home && ctx.home.trim() !== "") {
    homeBtn.onclick = () => moveToAddress(ctx.home);
  } else {
    homeBtn.onclick = () => alert("등록된 집 주소가 없습니다.");
    homeBtn.classList.add("btn-disabled");
  }

  if (ctx.work && ctx.work.trim() !== "") {
    workBtn.onclick = () => moveToAddress(ctx.work);
  } else {
    workBtn.onclick = () => alert("등록된 근무지 주소가 없습니다.");
    workBtn.classList.add("btn-disabled");
  }

  initAccidentDropdown();
  updateIncidents();
}

// 주소 검색(집/근무지/드롭다운 이동용)
function geocode(address, callback) {
  if (!address || address.trim() === "") {
    alert("유효한 주소가 없습니다.");
    return;
  }

  fetch(`/search/geocode/?query=${encodeURIComponent(address)}`)
    .then(res => {
      if (!res.ok) throw new Error("지오코딩 요청 실패 (status: " + res.status + ")");
      return res.json();
    })
    .then(data => {
      if (!data.documents || data.documents.length === 0) {
        alert("주소를 찾을 수 없습니다.");
        return;
      }
      callback(data.documents[0]);
    })
    .catch(err => {
      console.error("GEOCODE ERROR:", err);
      alert("주소 검색 중 오류가 발생했습니다.");
    });
}

// 지도 이동
function moveToAddress(address) {
  if (!address || address.trim() === "") {
    alert("등록된 주소가 없습니다.");
    return;
  }

  geocode(address, result => {
    const lat = parseFloat(result.y);
    const lng = parseFloat(result.x);
    const pos = new kakao.maps.LatLng(lat, lng);

    map.setCenter(pos);
    map.setLevel(5);

    // ✅ 집/근무지 마커는 파란 별
    if (!userMarker) {
      userMarker = new kakao.maps.Marker({
        map,
        position: pos,
        image: MY_PLACE_IMG
      });
    } else {
      userMarker.setPosition(pos);
      userMarker.setImage(MY_PLACE_IMG);
    }
  });
}

// ✅ "현재 지도 화면(bounds) 안" 산재만 조회
function updateIncidents() {
  if (!map) return;

  const bounds = map.getBounds();
  const sw = bounds.getSouthWest();
  const ne = bounds.getNorthEast();

  const url = `/search/incidents/?swLat=${sw.getLat()}&swLng=${sw.getLng()}&neLat=${ne.getLat()}&neLng=${ne.getLng()}`;

  fetch(url)
    .then(res => {
      if (!res.ok) throw new Error("산재 조회 요청 실패 (status: " + res.status + ")");
      return res.json();
    })
    .then(data => {
      if (!data || data.error) {
        console.error("INCIDENT API ERROR:", data && data.error);
        return;
      }

      const count = data.totalCount ?? 0;
      const countEl = document.getElementById("totalCount");
      if (countEl) countEl.textContent = count;

      // ✅ 산재 마커만 제거 (파란 userMarker는 유지)
      incidentMarkers.forEach(m => m.setMap(null));
      incidentMarkers = [];

      if (!data.items || !Array.isArray(data.items)) return;

      data.items.forEach(item => {
        if (item.lat == null || item.lng == null) return;

        const pos = new kakao.maps.LatLng(item.lat, item.lng);
        const marker = new kakao.maps.Marker({
          map,
          position: pos,
          image: item.is_mine ? MY_ACCIDENT_IMG : OTHER_ACCIDENT_IMG
        });

        kakao.maps.event.addListener(marker, "click", () => {
          showIncidentInfoWindow(item);
        });

        incidentMarkers.push(marker);
      });
    })
    .catch(err => {
      console.error("INCIDENT FETCH ERROR:", err);
    });
}

// 산재 상세정보(말풍선)
function showIncidentInfoWindow(item) {
  if (infoOverlay) infoOverlay.setMap(null);

  const content = `
    <div class="infowindow-wrap">
      <div class="infowindow-box">
        <div class="info-title">산업재해 정보</div>

        <div><strong>업종(대분류):</strong> ${item.i_industry_type1 || "-"}</div>
        <div><strong>업종(중분류):</strong> ${item.i_industry_type2 || "-"}</div>
        <div><strong>재해일자:</strong> ${item.i_accident_date || "-"}</div>
        <div><strong>발생형태:</strong> ${item.i_injury || "-"}</div>
        <div><strong>질병:</strong> ${item.i_disease_type || "-"}</div>
        <div><strong>발생주소:</strong> ${item.i_address || "-"}</div>
      </div>
      <div class="infowindow-arrow"></div>
    </div>
  `;

  infoOverlay = new kakao.maps.CustomOverlay({
    position: new kakao.maps.LatLng(item.lat, item.lng),
    content,
    yAnchor: 1.3
  });

  infoOverlay.setMap(map);
}

// 사고지역 드롭다운(내가 등록한 산재 목록: 이동용)
function initAccidentDropdown() {
  const btn = document.getElementById("accidentDropdownBtn");
  const menu = document.getElementById("accidentDropdownMenu");
  if (!btn || !menu) return;

  if (!ctx.accidentList || ctx.accidentList.length === 0) {
    btn.textContent = "등록된 사고지역 없음";
    btn.disabled = true;
    btn.classList.add("btn-disabled");
    return;
  }

  menu.innerHTML = "";

  ctx.accidentList.forEach(ac => {
    const d = document.createElement("div");
    d.className = "dropdown-item";
    d.textContent = ac.alias;

    d.onclick = () => {
      btn.textContent = ac.alias + " ▼";
      menu.style.display = "none";
      moveToAddress(ac.address);
    };

    menu.appendChild(d);
  });

  btn.onclick = () => {
    menu.style.display = menu.style.display === "block" ? "none" : "block";
  };

  document.addEventListener("click", e => {
    if (!btn.contains(e.target) && !menu.contains(e.target)) {
      menu.style.display = "none";
    }
  });
}

window.onload = initMap;
