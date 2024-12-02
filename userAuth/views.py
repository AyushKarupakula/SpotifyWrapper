
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
    Authenticates and logs in a user.

    This endpoint accepts a POST request with username and password, 
    and attempts to authenticate the user. If successful, the user is 
    logged in and their details are returned.

    Args:
        request: The HTTP request containing the user's login credentials.

    Returns:
        A JSON response containing the user's details if authentication 
        is successful, or an error message if the credentials are invalid.
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
    Register a new user.

    This endpoint creates a new user account and logs the user in.

    Args:
        request: The HTTP request containing the user registration data.

    Returns:
        A JSON response containing the newly created user's details or an
        error message.

    Raises:
        Exception: If an unexpected error occurs during registration
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

    Returns:
        A JSON response with a success message.
    """

    if 'spotify_token' in request.session:
        del request.session['spotify_token']
    logout(request)
    return Response({'message': 'Logged out successfully'})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_view(request):
    """
    Retrieves the authenticated user's details.

    Args:
        request: The HTTP request containing the authentication credentials.

    Returns:
        A JSON response containing the user's details or an error message.
    """
    serializer = UserSerializer(request.user)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([AllowAny])
def csrf_token(request):
    """
    Retrieves a CSRF token for the client.

    Args:
        request: The HTTP request object.

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
        request: The HTTP request containing the authenticated user's details.

    Returns:
        A JSON response with a success message upon successful account deletion.
    """
    user = request.user
    user.delete()
    return Response({'message': 'Account deleted successfully'}, status=200)