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
        """
        String representation of the SpotifyWrap model instance.

        This string is used in the Django admin interface to represent the
        model instance. It includes the username of the User who owns the wrap
        and the date the wrap was generated.

        Returns:
            str: A string representation of the SpotifyWrap instance.
        """
        return f"{self.user.username}'s Wrap - {self.date_generated.strftime('%Y-%m-%d')}"
