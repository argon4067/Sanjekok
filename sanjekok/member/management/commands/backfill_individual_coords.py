from django.core.management.base import BaseCommand
from django.conf import settings
from member.models import Individual
import requests
import time

KAKAO_URL = "https://dapi.kakao.com/v2/local/search/address.json"

class Command(BaseCommand):
    help = "t_individual.i_address -> (i_lat, i_lng) 좌표를 카카오 주소검색으로 채웁니다. (NULL만 업데이트)"

    def add_arguments(self, parser):
        parser.add_argument("--limit", type=int, default=0, help="처리할 최대 건수(0이면 전체)")
        parser.add_argument("--sleep", type=float, default=0.05, help="요청 간 sleep(초). 호출 제한 방지용")
        parser.add_argument("--dry-run", action="store_true", help="DB 저장 없이 변환만 수행")

    def handle(self, *args, **options):
        if not getattr(settings, "KAKAO_REST_KEY", None):
            self.stderr.write(self.style.ERROR("settings.KAKAO_REST_KEY 가 설정되어 있어야 합니다."))
            return

        headers = {"Authorization": f"KakaoAK {settings.KAKAO_REST_KEY}"}

        # 좌표가 비어있는 것만 대상
        qs = Individual.objects.filter(i_address__isnull=False).exclude(i_address="").filter(
            i_lat__isnull=True
        ) | Individual.objects.filter(i_address__isnull=False).exclude(i_address="").filter(
            i_lng__isnull=True
        )
        qs = qs.distinct().order_by("accident_id")

        limit = int(options["limit"] or 0)
        sleep_s = float(options["sleep"] or 0.0)
        dry_run = bool(options["dry_run"])

        processed = updated = failed = 0

        for it in qs.iterator(chunk_size=200):
            if limit and processed >= limit:
                break

            processed += 1
            addr = (it.i_address or "").strip()
            if not addr:
                failed += 1
                continue

            try:
                resp = requests.get(KAKAO_URL, params={"query": addr}, headers=headers, timeout=5)
                resp.raise_for_status()
                data = resp.json()
                docs = data.get("documents", [])

                if not docs:
                    failed += 1
                    self.stderr.write(f"[{it.accident_id}] 주소 검색 실패: {addr}")
                    continue

                lat = float(docs[0]["y"])
                lng = float(docs[0]["x"])

                if not dry_run:
                    it.i_lat = lat
                    it.i_lng = lng
                    it.save(update_fields=["i_lat", "i_lng"])

                updated += 1
                self.stdout.write(f"[{it.accident_id}] OK -> ({lat}, {lng}) {addr}")

            except Exception as e:
                failed += 1
                self.stderr.write(f"[{it.accident_id}] ERROR: {e}")

            if sleep_s:
                time.sleep(sleep_s)

        self.stdout.write(self.style.SUCCESS(
            f"done. processed={processed}, updated={updated}, failed={failed}, dry_run={dry_run}"
        ))
