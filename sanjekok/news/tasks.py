from apscheduler.schedulers.background import BackgroundScheduler
from django.conf import settings
from .crawler.run import crawl_news  # 크롤러 함수

scheduler = None  # 전역 스케줄러
# python manage.py shell에서 스케줄러 테스트용 
def start_scheduler():
    global scheduler

    # 운영환경(배포)에서는 스케줄러 OFF
    if not settings.DEBUG:
        print("🚫 DEBUG=False → APScheduler 실행 안 함")
        return

    # 중복 실행 방지
    if scheduler is None:
        scheduler = BackgroundScheduler()
        scheduler.add_job(crawl_news, 'interval', hours=12) 
        print("🔄 APScheduler: 시작합니다...")
        scheduler.start()
    else:
        print("이미 실행 중입니다:", scheduler)


def stop_scheduler():
    global scheduler
    if scheduler:
        scheduler.shutdown()
        scheduler = None
        print("🛑 APScheduler: 종료했습니다.")
    else:
        print("실행중인 스케줄러 없음")
