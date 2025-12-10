# hospital/crawler/fetch.py
#
# SAFEMAP 산재지정병원 API(IF_0025)에서 JSON 데이터 수집

import requests
from django.conf import settings

# IF_0025 기본 URL (pageNo, numOfRows, returnType 은 파라미터로 조절)
BASE_URL = "https://www.safemap.go.kr/openapi2/IF_0025"


def fetch_hospital_json(page_no: int = 1, num_rows: int = 1000) -> dict:
    """
    SAFEMAP 산재지정병원 API(IF_0025) 호출 후 JSON 반환

    page_no   : 페이지 번호 (1부터 시작)
    num_rows  : 한 페이지당 요청 건수 (서버가 보통 1000건까지 응답)
    """
    params = {
        "serviceKey": settings.SAFEMAP_KEY,  # .env 에 있는 SAFEMAP_KEY 사용
        "pageNo": page_no,
        "numOfRows": num_rows,
        "returnType": "json",
    }

    resp = requests.get(BASE_URL, params=params, timeout=15)
    resp.raise_for_status()
    return resp.json()
