from django.urls import path
from . import views

app_name = 'reports'

urlpatterns = [
    path('', views.dashboard_view, name='dashboard'),
    path('api/appointments/', views.appointments_filter_api, name='api_appointments'),
    path('charts/weekday/', views.chart_weekday_view, name='chart_weekday'),
    path('charts/hourly/', views.chart_hourly_view, name='chart_hourly'),
    path('charts/status/', views.chart_status_view, name='chart_status'),
]
