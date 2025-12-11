from django.http import JsonResponse, HttpResponseBadRequest
from django.shortcuts import get_object_or_404
from django.views.decorators.http import require_POST, require_GET

from hospital.models import Hospital
from member.models import Member
from .models import Review


def _get_login_member(request):
    """
    세션에 저장된 member_id 로 로그인 사용자 객체 반환.
    없으면 None.
    """
    member_id = request.session.get("member_id")
    if not member_id:
        return None
    try:
        return Member.objects.get(member_id=member_id)
    except Member.DoesNotExist:
        return None


def _mask_member_id(member_id: str) -> str:
    """
    아이디 뒤 4글자를 **** 로 마스킹.
    예) abcdefg -> abc****  (길이 4 이하이면 전부 *로 표시)
    """
    if not member_id:
        return ""
    s = str(member_id)
    if len(s) <= 4:
        return "*" * len(s)
    return s[:-4] + "****"


@require_POST
def review_create(request):
    """
    리뷰 작성 (AJAX용)
    요청 데이터:
      - hospital_id : 병원 PK
      - rating      : 1~10 정수 (별 5개로 표현)
      - contents    : 리뷰 내용
    세션:
      - member_id   : 로그인한 회원 PK (세션에 저장돼 있다고 가정)
    """
    member = _get_login_member(request)
    if not member:
        return JsonResponse({"error": "로그인이 필요합니다."}, status=401)

    hospital_id = request.POST.get("hospital_id")
    contents = (request.POST.get("contents") or "").strip()
    rating_str = request.POST.get("rating")

    # 유효성 검사
    if not hospital_id or not contents or not rating_str:
        return HttpResponseBadRequest("필수 값이 누락되었습니다.")

    try:
        rating = int(rating_str)
    except ValueError:
        return HttpResponseBadRequest("평점이 올바르지 않습니다.")

    # 1~10 점수로 제한 (프론트에서 별 1~5 → 2,4,6,8,10 등으로 보내는 구조)
    if rating < 1 or rating > 10:
        return HttpResponseBadRequest("평점은 1~10 사이여야 합니다.")

    hospital = get_object_or_404(Hospital, pk=hospital_id)

    review = Review.objects.create(
        hospital=hospital,
        member=member,
        r_contents=contents,
        r_rating=rating,
        # r_created_at 은 auto_now_add 로 자동 저장된다고 가정
    )

    # 화면에 보여줄 아이디: 로그인 ID(m_username) 기준, 없으면 PK 문자열 사용
    raw_id = member.m_username or str(member.member_id)

    return JsonResponse(
        {
            "id": review.id,
            "writer": _mask_member_id(raw_id),
            "contents": review.r_contents,
            "rating": review.r_rating,
            "created_at": review.r_created_at.strftime("%Y-%m-%d"),
            "is_owner": True,  # 방금 작성자는 항상 본인
        }
    )


@require_GET
def review_list(request, hospital_id: int):
    """
    특정 병원에 대한 리뷰 목록 조회 (4개씩 페이지네이션)
    GET /reviews/list/<hospital_id>/?page=1&size=4
    응답:
      {
        "reviews": [
          {
            "id": ...,
            "writer": "abc****",
            "contents": "...",
            "rating": 8,
            "created_at": "2025-10-23",
            "is_owner": true/false
          },
          ...
        ],
        "has_more": true/false
      }
    """
    hospital = get_object_or_404(Hospital, pk=hospital_id)

    # 페이지/사이즈 파라미터
    try:
        page = int(request.GET.get("page", 1))
    except ValueError:
        page = 1
    try:
        size = int(request.GET.get("size", 4))
    except ValueError:
        size = 4
    if page <= 0:
        page = 1
    if size <= 0:
        size = 4

    offset = (page - 1) * size

    qs = (
        Review.objects.filter(hospital=hospital)
        .select_related("member")
        .order_by("-r_created_at")
    )
    total = qs.count()
    reviews = list(qs[offset: offset + size])

    login_member = _get_login_member(request)
    login_member_pk = login_member.member_id if login_member else None  # PK

    data = []
    for r in reviews:
        # 표시용 아이디: m_username이 있으면 그걸, 없으면 PK 문자열
        if r.member:
            raw_id = r.member.m_username or str(r.member.member_id)
            writer_masked = _mask_member_id(raw_id)
        else:
            raw_id = ""
            writer_masked = ""

        data.append(
            {
                "id": r.id,
                "writer": writer_masked,
                "contents": r.r_contents,
                "rating": r.r_rating,
                "created_at": r.r_created_at.strftime("%Y-%m-%d"),
                "is_owner": (login_member_pk == r.member_id),
            }
        )

    has_more = offset + len(reviews) < total

    return JsonResponse({"reviews": data, "has_more": has_more})


@require_POST
def review_delete(request):
    """
    리뷰 삭제 (본인이 작성한 리뷰만)
    POST /reviews/delete/
      - review_id
    """
    member = _get_login_member(request)
    if not member:
        return JsonResponse({"error": "로그인이 필요합니다."}, status=401)

    review_id = request.POST.get("review_id")
    if not review_id:
        return HttpResponseBadRequest("리뷰 ID가 필요합니다.")

    try:
        review = Review.objects.select_related("member").get(pk=int(review_id))
    except (Review.DoesNotExist, ValueError):
        return JsonResponse({"error": "리뷰를 찾을 수 없습니다."}, status=404)

    # 자신의 리뷰인지 확인 (PK 비교)
    if not review.member or review.member.member_id != member.member_id:
        return JsonResponse({"error": "삭제 권한이 없습니다."}, status=403)

    review.delete()
    return JsonResponse({"success": True})
