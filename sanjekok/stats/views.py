from django.shortcuts import render
from datetime import date
from member.models import Member

def stats_home(request):
    member = Member.objects.first()
    industry = member.industries.first()

    # 나이 계산
    today = date.today()
    birth = member.m_birth_date
    age = today.year - birth.year - ((today.month, today.day) < (birth.month, birth.day))

    # ✔ 해당 회원의 산재 리스트 가져오기
    individual_list = member.individuals.all()

    return render(request, "stats.html", {
        "member": member,
        "industry": industry,
        "age": age,
        "individual_list": individual_list,
    })
