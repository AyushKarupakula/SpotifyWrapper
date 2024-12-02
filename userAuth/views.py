from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.contrib.auth import login, logout, authenticate
from django.contrib.auth.models import User
from .serializers import UserSerializer, RegisterSerializer
from django.middleware.csrf import get_token

@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    """
    Logs in a user and returns the user data.

    Args:
        request: The HTTP request containing the user's credentials.

    Returns:
        A JSON response containing the user data if the credentials are valid, 
        otherwise an error message with a 401 status.
    """

    username = request.data.get('username')
    password = request.data.get('password')
    
    user = authenticate(username=username, password=password)
    if user is not None:
        login(request, user)
        serializer = UserSerializer(user)
        return Response(serializer.data)
    return Response(
        {'message': 'Invalid credentials'}, 
        status=status.HTTP_401_UNAUTHORIZED
    )

@api_view(['POST'])
@permission_classes([AllowAny])
def register_view(request):
    """
    Registers a new user.

    Args:
        request: The HTTP request containing the new user's data.

    Returns:
        A JSON response containing the user data if the registration is successful, 
        otherwise an error message with an appropriate HTTP status.
    """
    try:
        print("Registration data received:", request.data)  # Debug print
        print("Request headers:", request.headers)  # Debug print
        print("Request META:", request.META.get('CSRF_COOKIE', 'No CSRF Cookie'))  # Debug print
        
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            login(request, user)
            return Response(
                UserSerializer(user).data,
                status=status.HTTP_201_CREATED
            )
        print("Serializer errors:", serializer.errors)  # Debug print
        return Response(
            {'error': serializer.errors},  # Send back the actual validation errors
            status=status.HTTP_400_BAD_REQUEST
        )
    except Exception as e:
        print("Registration exception:", str(e))  # Debug print
        import traceback
        print("Full traceback:", traceback.format_exc())  # Debug print
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    # Clear Spotify token from session
    """
    Logs out the user and clears the Spotify token from the session.

    Args:
        request: The HTTP request.

    Returns:
        A JSON response containing a success message.
    """

    if 'spotify_token' in request.session:
        del request.session['spotify_token']
    logout(request)
    return Response({'message': 'Logged out successfully'})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_view(request):
    """
    Retrieves the authenticated user's data.

    Args:
        request: The HTTP request with the authenticated user's details.

    Returns:
        A JSON response containing the user's data.
    """
    
    serializer = UserSerializer(request.user)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([AllowAny])
def csrf_token(request):
    """
    Retrieves a CSRF token for the authenticated user.

    Args:
        request: The HTTP request with the authenticated user's details.

    Returns:
        A JSON response containing the CSRF token.
    """
    return Response({'csrfToken': get_token(request)})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def delete_account(request):
    """
    Deletes the authenticated user's account.

    Args:
        request: The HTTP request with the authenticated user's details.

    Returns:
        A JSON response containing a success message.
    """
    
    user = request.user
    user.delete()
    return Response({'message': 'Account deleted successfully'}, status=200)