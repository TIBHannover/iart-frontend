from django.db import models


# Create your models here.
class Image(models.Model):
    # question_text = models.CharField(max_length=200)
    # hash_1 = models.CharField(max_length=200)
    hash_path = models.CharField(max_length=128)
    width = models.IntegerField()
    height = models.IntegerField()
