# hospital/views.py

from django.conf import settings
from django.http import JsonResponse
from django.shortcuts import render, get_object_or_404
from django.urls import reverse
from django.views.decorators.http import require_GET

import requests

from member.models import Member, Individual
from .models import Hospital  # t_hospital 테이블과 연결된 모델


# 카카오 주소 검색 API (병원 상세 페이지에서만 사용)
KAKAO_GEOCODE_URL = "https://dapi.kakao.com/v2/local/search/address.json"


def geocode_address(address: str):
    """
    카카오 주소 검색 API를 이용해 주소 → (lat, lng) 변환
    (병원 상세 페이지용. 목록 조회에는 사용하지 않음)
    """
    if not address:
        return None, None

    headers = {"Authorization": f"KakaoAK {settings.KAKAO_REST_KEY}"}
    params = {"query": address}

    try:
        resp = requests.get(
            KAKAO_GEOCODE_URL, headers=headers, params=params, timeout=5
        )
        resp.raise_for_status()
        docs = resp.json().get("documents", [])
        if not docs:
            return None, None

        first = docs[0]
        lng = float(first["x"])
        lat = float(first["y"])
        return lat, lng
    except Exception:
        return None, None


def _address_rank(base_addr: str, target_addr: str) -> int:
    """
    문자열 주소 기준으로 '가까움' 등급을 계산.
    0: 같은 시/도 + 같은 구/군 + 같은 읍/면/동
    1: 같은 시/도 + 같은 구/군
    2: 같은 시/도만 같음
    3: 나머지
    """
    if not base_addr or not target_addr:
        return 3

    parts = base_addr.split()
    si = parts[0] if len(parts) >= 1 else ""
    gungu = parts[1] if len(parts) >= 2 else ""
    dong = parts[2] if len(parts) >= 3 else ""

    rank = 3

    if si and si in target_addr:
        rank = 2
        if gungu and gungu in target_addr:
            rank = 1
            if dong and dong in target_addr:
                rank = 0

    return rank


def hospital_search(request):
    """
    병원 검색 화면
    - 세션의 member_id 로 Member 조회
    - 집/근무지/사고목록(여러 건)을 템플릿에 내려보냄
    """
    home_address = ""
    work_address = ""
    accidents_ctx = []   # [{id, title(i_title), address}, ...]

    member_id = request.session.get("member_id")

    if member_id:
        try:
            member = Member.objects.get(member_id=member_id)

            # 집 / 근무지 주소
            home_address = member.m_address or ""
            work_address = member.m_jaddress or ""

            # 회원이 속한 업종들의 모든 사고 (최신순)
            industries = member.industries.all()
            accidents = (
                Individual.objects
                .filter(member_industry__in=industries)
                .order_by("-i_accident_date", "-accident_id")
            )

            for acc in accidents:
                accidents_ctx.append({
                    "id": acc.accident_id,
                    "title": acc.i_title,        # ★ 산재제목 필드 그대로 사용
                    "address": acc.i_address or "",
                })

        except Member.DoesNotExist:
            pass

    ctx = {
        "home_address": home_address,
        "work_address": work_address,
        "accidents": accidents_ctx,   # ★ JS 에서 ctx.accidents 로 사용
    }
    return render(request, "hospital/hospital.html", ctx)


def hospital_api(request):
    """
    기준 주소(addr)와 t_hospital의 h_address 를 문자열로 비교해서
    '가까운 순(행정구 단위)' Top10을 반환.
    """
    base_addr = (request.GET.get("addr") or "").strip()
    sort = request.GET.get("sort", "distance")

    hospitals = []
    for h in Hospital.objects.all():
        addr = h.h_address or ""
        rank = _address_rank(base_addr, addr)

        hospitals.append({
            "id": h.id,
            "name": h.h_hospital_name,
            "address": addr,
            "road_address": addr,
            "tel": h.h_phone_number,
            "addr_rank": rank,   # 정렬용
            "rating": 0.0,       # 형식만 유지
            "review_count": 0,
            "detail_url": reverse("hospital_detail", args=[h.id]),
        })

    # 1단계: 주소 랭크 + 주소 문자열 기준 정렬
    hospitals.sort(key=lambda h: (h["addr_rank"], h["address"]))
    top10 = hospitals[:10]

    # 2단계: 정렬 옵션 (rating/review 는 현재 0이므로 형식상만)
    if sort == "rating":
        top10.sort(key=lambda h: (-h["rating"], h["addr_rank"], h["address"]))
    elif sort == "review":
        top10.sort(key=lambda h: (-h["review_count"], h["addr_rank"], h["address"]))

    # 프론트에 보내는 필드만 추려서 응답
    result = []
    for h in top10:
        result.append({
            "id": h["id"],
            "name": h["name"],
            "address": h["address"],
            "road_address": h["road_address"],
            "tel": h["tel"],
            "detail_url": h["detail_url"],
        })

    return JsonResponse({"hospitals": result})


def hospital_detail(request, hospital_id: int):
    """
    단일 병원 상세 정보
    - t_hospital 에서 병원 1개 조회 후 주소를 지오코딩해서 지도 표시용 lat/lng 전달
    """
    hospital = get_object_or_404(Hospital, pk=hospital_id)
    lat, lng = geocode_address(hospital.h_address)

    context = {
        "KAKAO_KEY": settings.KAKAO_KEY,
        "hospital_id": hospital.id,
        "name": hospital.h_hospital_name,
        "address": hospital.h_address,
        "road_address": hospital.h_address,
        "tel": hospital.h_phone_number,
        "lat": lat,
        "lng": lng,
    }
    return render(request, "hospital/hospital_detail.html", context)


@require_GET
def hospital_geocode(request):
    """
    필요하다면 사용할 수 있는 지오코딩 API (현재 목록에서는 사용하지 않음).
    """
    query = request.GET.get("query")
    if not query:
        return JsonResponse({"documents": []})

    headers = {"Authorization": f"KakaoAK {settings.KAKAO_REST_KEY}"}
    params = {"query": query}

    try:
        resp = requests.get(
            KAKAO_GEOCODE_URL, headers=headers, params=params, timeout=5
        )
        resp.raise_for_status()
        return JsonResponse(resp.json())
    except requests.RequestException as e:
        return JsonResponse({"documents": [], "error": str(e)}, status=500)
