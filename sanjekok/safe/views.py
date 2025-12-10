from django.shortcuts import render
from .decorators import login_required
from django.core.paginator import Paginator

from .models import Safe

@login_required
def safe_main(request):
    ...
    
