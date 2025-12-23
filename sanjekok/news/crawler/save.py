# DB 저장

from news.models import News
from datetime import datetime
from django.utils import timezone

import os
import requests
import time
from django.conf import settings

NEWS_IMG_DIR = os.path.join(settings.BASE_DIR, "static/img/news")
DEFAULT_IMG = "img/news/default.png"

def save_news(data):
    """
    파싱된 dict 데이터를 받아 DB에 저장
    """

    # 작성일자(문자열) → 날짜(datetime) 변환
    try:
        created_at = datetime.strptime(data["created_at_raw"], "%Y-%m-%d")

    except:
        created_at = timezone.now() # 작성일자 값이 없으면 DB저장날짜로

    News.objects.update_or_create(
        n_link=data["link"],   # 중복 체크. 상세링크 기준 
        defaults={
            "n_title": data["title"],
            "n_writer": data["writer"],
            "n_contents": data["content"],
            "n_image_url": data["img_url"],
            "n_created_at": created_at,
        }
    )
