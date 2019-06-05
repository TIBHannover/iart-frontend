from django.contrib import admin
from django.urls import path
from . import views

urlpatterns = [
    path('', views.index_view, name='index'),
    path('search/', views.search_view, name='search'),
    path('autocomplete/', views.autocomplete_view, name='autocomplete'),
    path('details/', views.details_view, name='details')
]
