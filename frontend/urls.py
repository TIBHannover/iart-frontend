from django.contrib import admin
from django.urls import path
from . import views

urlpatterns = [
    path('', views.index_view, name='index'),
    path('list/', views.list_view, name='list'),
    path('search/', views.search_view, name='search'),
]
