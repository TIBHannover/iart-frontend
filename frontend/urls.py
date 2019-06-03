from django.contrib import admin
from django.urls import path
from . import views

urlpatterns = [
    path('', views.index_view, name='index'),
    path('search/', views.search_view, name='search'),
    path('suggestion/', views.suggestion_view, name='suggestion'),
    path('detail/', views.detail_view, name='detail')
]
