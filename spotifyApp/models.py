from django.db import models
from django.contrib.auth.models import User

# Create your models here.

class SpotifyWrap(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    date_generated = models.DateTimeField(auto_now_add=True)
    wrap_data = models.JSONField()
    title = models.CharField(max_length=100)  # For identifying different wraps
    
    class Meta:
        ordering = ['-date_generated']

    def __str__(self):
        return f"{self.user.username}'s Wrap - {self.date_generated.strftime('%Y-%m-%d')}"
