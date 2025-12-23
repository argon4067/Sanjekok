import time
import requests
from io import BytesIO
from PIL import Image
from pathlib import Path
from news.models import News
from django.conf import settings
import hashlib

# 저장 폴더
NEWS_IMG_DIR = Path(settings.BASE_DIR) / "static/img/news"
NEWS_IMG_DIR.mkdir(parents=True, exist_ok=True)  # 폴더 없으면 생성

def download_news_image(url, save_name, max_size_kb=100):
    try:
        response = requests.get(url, stream=True)
        response.raise_for_status()
        img = Image.open(BytesIO(response.content))
        img_format = img.format if img.format else "PNG"

        buffer = BytesIO()
        quality = 95

        if img_format.upper() in ["JPEG", "JPG"]:
            img.save(buffer, format="JPEG", quality=quality)
        else:
            img.save(buffer, format="PNG", optimize=True)

        while buffer.getbuffer().nbytes > max_size_kb * 1024 and quality > 10:
            buffer = BytesIO()
            if img_format.upper() in ["JPEG", "JPG"]:
                quality -= 5
                img.save(buffer, format="JPEG", quality=quality)
            else:
                width, height = img.size
                img = img.resize((int(width * 0.9), int(height * 0.9)))
                img.save(buffer, format="PNG", optimize=True)

        # 실제 저장 경로
        save_path = NEWS_IMG_DIR / save_name
        with open(save_path, "wb") as f:
            f.write(buffer.getvalue())

        return f"img/news/{save_name}"  # DB에 저장할 상대경로

    except Exception as e:
        print("이미지 다운로드 실패:", e)
        return None


def crawl_news_images(max_size_kb=100):
    print("\n===== 🟢 뉴스 이미지 처리 시작 =====")

    qs = News.objects.filter(
        n_image_url__startswith="http"
    ).order_by("-n_created_at")

    processed_urls = {}  # URL별 처리된 로컬 경로를 캐시하는 딕셔너리

    for idx, news in enumerate(qs, start=1):
        external_url = news.n_image_url
        print(f"🖼️  {idx}/{len(qs)} 처리 중: {external_url[:80]}")

        # 1. 메모리 캐시 확인
        if external_url in processed_urls:
            news.n_image_url = processed_urls[external_url]
            news.save(update_fields=["n_image_url"])
            print(f"  -> 캐시된 경로 사용: {news.n_image_url}")
            continue

        # 2. 파일 이름 생성 (URL 해시 기반)
        try:
            url_hash = hashlib.sha256(external_url.encode('utf-8')).hexdigest()
            # 파일 확장자 유지, 없으면 .jpg 사용
            file_extension = Path(external_url.split("?")[0]).suffix or '.jpg'
            save_name = f"{url_hash}{file_extension}"
            save_path = NEWS_IMG_DIR / save_name
            local_db_path = f"img/news/{save_name}"
        except Exception as e:
            print(f"  -> 파일 이름 생성 실패: {e}")
            continue

        # 3. 디스크에 파일이 이미 있는지 확인
        if save_path.exists():
            print(f"  -> 기존 파일 재사용: {local_db_path}")
            news.n_image_url = local_db_path
            news.save(update_fields=["n_image_url"])
            processed_urls[external_url] = local_db_path  # 캐시에 추가
            continue

        # 4. 이미지가 없다면 다운로드
        print(f"  -> 새 이미지 다운로드: {save_name}")
        local_path = download_news_image(
            external_url,
            save_name,
            max_size_kb=max_size_kb
        )

        if local_path:
            news.n_image_url = local_path
            news.save(update_fields=["n_image_url"])
            processed_urls[external_url] = local_path  # 캐시에 추가

        time.sleep(0.5)

    print("✅ 이미지 처리 완료")
