// search.js
// - 템플릿에서 KAKAO_KEY, HOME_TM, WORK_TM, accident_list(드롭다운)을 전달받는 구조를 가정
// - 백엔드: /accident-proxy (이미 TM->la/lo 변환해서 반환한다고 가정)

let map;
let centerMarker;
let accidentMarkers = [];
const RADIUS_METERS = 1000; // 반경 필터 (원하면 변경)

// 안전한 전역 기본값
if (typeof HOME_TM === "undefined") window.HOME_TM = { x: 0, y: 0 };
if (typeof WORK_TM === "undefined") window.WORK_TM = { x: 0, y: 0 };

// 로드 & 초기화
function initMap() {
  if (!KAKAO_KEY) {
    console.error("KAKAO_KEY가 정의되어 있지 않습니다. 템플릿에서 전달 확인하세요.");
    return;
  }

  // SDK가 이미 로드된 상태라 가정 (템플릿에서 <script src="https://dapi.kakao.com/...&libraries=services"> 로드)
  if (!window.kakao || !kakao.maps) {
    console.error("Kakao Maps SDK가 로드되지 않았습니다.");
    return;
  }

  const container = document.querySelector(".map-placeholder") || document.getElementById("map");
  if (!container) {
    console.error(".map-placeholder 또는 #map 요소를 찾을 수 없습니다.");
    return;
  }

  map = new kakao.maps.Map(container, {
    center: new kakao.maps.LatLng(37.5665, 126.9780),
    level: 4
  });

  centerMarker = new kakao.maps.Marker({
    position: map.getCenter(),
    map
  });

  // UI 바인딩: 버튼/드롭다운
  bindUI();

  // 지도 idle 시 주변 건수/마커 갱신
  kakao.maps.event.addListener(map, "idle", () => {
    const center = map.getCenter();
    fetchAndRenderNearbyAccidents(center.getLat(), center.getLng());
  });

  // 기본 첫 이동: HOME_TM 또는 WORK_TM이 유효하면 이동
  if (isValidTM(HOME_TM)) moveToTM(HOME_TM);
  else if (isValidTM(WORK_TM)) moveToTM(WORK_TM);
}

// TM 유효성 검사
function isValidTM(tm) {
  if (!tm) return false;
  const x = Number(tm.x);
  const y = Number(tm.y);
  if (!isFinite(x) || !isFinite(y)) return false;
  if (x === 0 && y === 0) return false;
  return true;
}

// TM -> LatLng 변환 (coordTrans.fromTM128 사용)
function tmToLatLngClient(tmX, tmY) {
  return new Promise((resolve, reject) => {
    if (!kakao?.maps?.services?.coordTrans?.fromTM128) {
      return reject(new Error("coordTrans.fromTM128 사용 불가. SDK 라이브러리 로드 확인."));
    }
    // Kakao coordTrans expects LatLng(y, x)
    const tmPoint = new kakao.maps.LatLng(Number(tmY), Number(tmX));
    kakao.maps.services.coordTrans.fromTM128(tmPoint, (result, status) => {
      if (status === kakao.maps.services.Status.OK) {
        resolve({ lat: result.y, lng: result.x });
      } else {
        reject(new Error("TM->LatLng 변환 실패: " + status));
      }
    });
  });
}

// 지도 중심 이동 (TM 좌표로 전달)
async function moveToTM(tm) {
  if (!isValidTM(tm)) {
    console.warn("moveToTM: 유효하지 않은 TM:", tm);
    return;
  }

  try {
    const { lat, lng } = await tmToLatLngClient(tm.x, tm.y);
    const pos = new kakao.maps.LatLng(lat, lng);
    map.setCenter(pos);
    centerMarker.setPosition(pos);
    // fetch는 idle 이벤트에서 자동으로 수행되지만 즉시 반영하고 싶으면 호출
    fetchAndRenderNearbyAccidents(lat, lng);
  } catch (err) {
    console.error("moveToTM 실패:", err);
  }
}

// 사고 데이터 호출 및 반경 필터링 후 마커 표시
async function fetchAndRenderNearbyAccidents(centerLat, centerLng) {
  try {
    const res = await fetch(`/accident-proxy?numOfRows=500&pageNo=1`);
    const text = await res.text();
    let data;
    try { data = JSON.parse(text); } 
    catch (e) {
      console.warn("accident-proxy 응답 JSON 파싱 실패:", e);
      updateTotalCount(0);
      clearAccidentMarkers();
      return;
    }

    // data.response.body.items -> items 구조 통일 처리
    const itemsRaw = data?.response?.body?.items;
    let items = [];
    if (!itemsRaw) items = [];
    else if (Array.isArray(itemsRaw)) items = itemsRaw;
    else if (itemsRaw.item) items = Array.isArray(itemsRaw.item) ? itemsRaw.item : [itemsRaw.item];
    else items = [];

    // items는 서버에서 la, lo 필드를 갖고 있다고 가정 (서버에서 TM->lat/lng 변환 완료)
    const nearby = items.filter(it => {
      const la = parseFloat(it.la);
      const lo = parseFloat(it.lo);
      if (!isFinite(la) || !isFinite(lo)) return false;
      const d = haversineDistance(centerLat, centerLng, la, lo);
      return d <= RADIUS_METERS;
    });

    updateTotalCount(nearby.length);
    renderAccidentMarkers(nearby);

  } catch (err) {
    console.error("fetchAndRenderNearbyAccidents 실패:", err);
    updateTotalCount(0);
    clearAccidentMarkers();
  }
}

// 마커 렌더링
function renderAccidentMarkers(items) {
  clearAccidentMarkers();
  items.forEach(it => {
    const lat = parseFloat(it.la);
    const lng = parseFloat(it.lo);
    if (!isFinite(lat) || !isFinite(lng)) return;

    const m = new kakao.maps.Marker({
      position: new kakao.maps.LatLng(lat, lng),
      map
    });

    const content = `
      <div style="padding:6px; font-size:12px;">
        <strong>${escapeHtml(it.area_nm || "")}</strong><br>
        발생년도: ${escapeHtml(it.syd_year || "")}<br>
        관할: ${escapeHtml(it.jurang || it.area_nm || "")}<br>
        소재지: ${escapeHtml(it.locplc || "")}
      </div>`;

    const info = new kakao.maps.InfoWindow({ content });
    kakao.maps.event.addListener(m, "click", () => info.open(map, m));
    accidentMarkers.push(m);
  });
}

function clearAccidentMarkers() {
  accidentMarkers.forEach(m => m.setMap(null));
  accidentMarkers = [];
}

// 총 건수 업데이트 DOM
function updateTotalCount(n) {
  const el = document.getElementById("totalCount");
  if (el) el.textContent = Number(n || 0);
}

// Haversine (m)
function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const toRad = v => v * Math.PI / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat/2)**2 + Math.cos(toRad(lat1))*Math.cos(toRad(lat2))*Math.sin(dLon/2)**2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

function escapeHtml(s) {
  return String(s || "")
    .replace(/&/g, "&amp;").replace(/</g, "&lt;")
    .replace(/>/g, "&gt;").replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// UI 바인딩: 집/근무지/사고지역 드롭다운 등
function bindUI() {
  const homeBtn = document.getElementById("homeBtn");
  const workBtn = document.getElementById("workBtn");
  const incidentBtn = document.getElementById("incidentBtn");
  const incidentMenu = document.getElementById("incidentMenu");

  if (homeBtn) {
    if (isValidTM(HOME_TM)) {
      homeBtn.disabled = false;
      homeBtn.addEventListener("click", () => moveToTM(HOME_TM));
    } else {
      homeBtn.disabled = true;
    }
  }

  if (workBtn) {
    if (isValidTM(WORK_TM)) {
      workBtn.disabled = false;
      workBtn.addEventListener("click", () => moveToTM(WORK_TM));
    } else {
      workBtn.disabled = true;
    }
  }

  if (incidentBtn && incidentMenu) {
    incidentBtn.addEventListener("click", (e) => {
      incidentMenu.style.display = incidentMenu.style.display === "block" ? "none" : "block";
    });

    // 드롭다운 항목은 템플릿에서 <div data-x data-y data-nickname data-address> 로 제공
    incidentMenu.querySelectorAll("div[data-x][data-y]").forEach(el => {
      el.addEventListener("click", async () => {
        const tx = el.dataset.x;
        const ty = el.dataset.y;
        // TM -> LatLng 변환 후 이동
        try {
          await moveToTM({ x: tx, y: ty });
        } catch (e) {
          console.error("사고지역 이동 실패", e);
        }
        incidentMenu.style.display = "none";
      });
    });

    // 외부 클릭으로 닫기
    document.addEventListener("click", (ev) => {
      if (!incidentBtn.contains(ev.target) && !incidentMenu.contains(ev.target)) {
        incidentMenu.style.display = "none";
      }
    });
  }
}

// 문서 준비 시 initMap 호출
document.addEventListener("DOMContentLoaded", () => {
  // Kakao SDK가 이미 로드되어 있다면 바로 init, 아직이면 onload 콜백으로 처리
  if (window.kakao && kakao.maps) {
    initMap();
  } else {
    // 템플릿에서 SDK를 넣었을 때 보장되므로 보통 여기서 실패 안 함
    console.error("Kakao SDK 미탑재: 템플릿 <script> 삽입 확인");
  }
});
