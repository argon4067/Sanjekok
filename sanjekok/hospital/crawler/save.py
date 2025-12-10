# hospital/crawler/save.py
#
# 파싱된 병원 데이터를 t_hospital 테이블에 저장
# 중복 기준: (h_hospital_name, h_address) 둘 다 같은 경우에만 같은 병원으로 보고 UPDATE

from typing import List, Dict
from hospital.models import Hospital


def save_hospitals(hospitals: List[Dict]) -> int:
    """
    파싱된 병원 dict 리스트를 DB에 upsert.
    - (h_hospital_name + h_address) 조합이 같을 때만 같은 병원으로 보고 update_or_create
    - 이름만 같거나, 주소만 같은 경우에는 서로 다른 병원으로 저장
    """
    count = 0

    for data in hospitals:
        name = (data.get("h_hospital_name") or "").strip()
        addr = (data.get("h_address") or "").strip()

        # 이름/주소 둘 다 완전히 비어 있으면 의미 없으니 스킵
        if not name and not addr:
            continue

        phone = (data.get("h_phone_number") or "").strip()[:11]

        # 여기 lookup 기준이 "이름 + 주소" 두 개다
        lookup = {
            "h_hospital_name": name,
            "h_address": addr,
        }

        Hospital.objects.update_or_create(
            **lookup,
            defaults={
                "h_phone_number": phone,
                "h_hospital_type": (data.get("h_hospital_type") or "").strip(),
                "h_rc": (data.get("h_rc") or "").strip(),
                "h_rc_info": (data.get("h_rc_info") or "").strip(),
                "h_tr": (data.get("h_tr") or "").strip(),
                "h_ei": (data.get("h_ei") or "").strip(),
            },
        )
        count += 1

    return count
