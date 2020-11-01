from django.contrib import admin
from django.urls import path
from . import views
from . import user

urlpatterns = [
    path("", views.index_view, name="index"),
    path("search/", views.search_view, name="search"),
    path("search_result/", views.search_result_view, name="search_result"),
    path("autocomplete/", views.autocomplete_view, name="autocomplete"),
    path("details/", views.details_view, name="details"),
    path("login/", user.login, name="login"),
    path("logout/", user.logout, name="logout"),
    path("signup/", user.signup, name="signup"),
]
