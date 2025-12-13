# member/signals.py
from django.conf import settings
from django.db.models.signals import pre_save
from django.dispatch import receiver
import requests

from .models import Individual

KAKAO_URL = "https://dapi.kakao.com/v2/local/search/address.json"

def geocode_address(addr: str):
    if not addr:
        return None
    headers = {"Authorization": f"KakaoAK {settings.KAKAO_REST_KEY}"}
    resp = requests.get(KAKAO_URL, params={"query": addr}, headers=headers, timeout=5)
    resp.raise_for_status()
    docs = resp.json().get("documents", [])
    if not docs:
        return None
    return float(docs[0]["y"]), float(docs[0]["x"])  # (lat, lng)

@receiver(pre_save, sender=Individual)
def fill_individual_latlng(sender, instance: Individual, **kwargs):
    addr = (instance.i_address or "").strip()
    if not addr:
        return

    # 주소가 바뀌지 않았고 좌표도 이미 있으면 스킵
    if instance.pk:
        old = Individual.objects.filter(pk=instance.pk).only("i_address", "i_lat", "i_lng").first()
        if old and old.i_address == instance.i_address and old.i_lat and old.i_lng:
            return

    # 좌표가 이미 있으면 스킵(원하면 이 줄을 제거하고 '주소 바뀌면 재계산'만 하게도 가능)
    if instance.i_lat and instance.i_lng:
        return

    try:
        result = geocode_address(addr)
        if result:
            instance.i_lat, instance.i_lng = result
    except Exception:
        # 실패해도 저장은 진행(좌표만 NULL로 남음)
        return
