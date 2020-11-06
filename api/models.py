from django.db import models


class ApiResponse(models.Model):
    hash = models.CharField(unique=True, max_length=8192)
    content = models.BinaryField()

