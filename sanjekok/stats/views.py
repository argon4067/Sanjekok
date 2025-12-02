
from django.shortcuts import render
from datetime import date

def stats_home(request):
    
    return render(request, "stats.html")