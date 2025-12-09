from django.apps import AppConfig


class NewsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'news'
    
    def ready(self):
        # 스케줄러 실행 연결 
        # from .tasks import start_scheduler
        # start_scheduler()
        
        pass # 실행 연결 X
