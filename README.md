# SpotifyWrapper

A Django web application that provides detailed Spotify listening statistics and visualizations, similar to Spotify Wrapped but available year-round.

## Features

- User authentication and account management
- Spotify account integration
- Detailed listening statistics
- Visual representation of music preferences
- Historical data tracking

## Prerequisites

- Python 3.8 or higher
- pip (Python package installer)
- A Spotify Developer account
- Spotify API credentials

## Project Structure

spotifyWrapper/
├── spotifyWrapper/    # Main project directory
│   ├── settings.py    # Project settings
│   ├── urls.py        # Main URL configuration
│   └── views.py       # Main views
├── userAuth/          # Authentication app
│   ├── templates/     # Authentication templates
│   ├── forms.py       # User forms
│   ├── urls.py        # Authentication URLs
│   └── views.py       # Authentication views
├── spotifyApp/        # Spotify integration app
│   ├── templates/     # Spotify-related templates
│   ├── urls.py        # Spotify URLs
│   └── views.py       # Spotify views
├── manage.py          # Django management script
├── requirements.txt   # Project dependencies
└── .env              # Environment variables (not in repo)

## Setup Instructions

1. **Clone the Repository**
   ```bash
   git clone [repository-url]
   cd SpotifyWrapper
   ```

2. **Set Up Virtual Environment**
   ```bash
   # Create virtual environment
   python -m venv venv

   # Activate virtual environment
   # On Windows:
   venv\Scripts\activate
   # On Mac/Linux:
   source venv/bin/activate
   ```

3. **Install Dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Environment Variables**
   Create a `.env` file in the project root with:
   ```
   SPOTIFY_CLIENT_ID=your_client_id_here
   SPOTIFY_CLIENT_SECRET=your_client_secret_here
   SPOTIFY_REDIRECT_URI=http://localhost:8000/spotify/callback/
   SECRET_KEY=your_django_secret_key_here
   DEBUG=True
   ```

5. **Database Setup**
   ```bash
   # Create migrations
   python manage.py makemigrations

   # Apply migrations
   python manage.py migrate

   # Create admin user
   python manage.py createsuperuser
   ```

6. **Run Development Server**
   ```bash
   python manage.py runserver
   ```

   Access the site at http://localhost:8000

## Spotify API Setup

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Create a new application
3. Set the redirect URI to `http://localhost:3000/spotify/callback`
4. Copy the Client ID and Client Secret to your `.env` file

## Available URLs

- `/` - Home page
- `/login/` - User login
- `/signup/` - User registration
- `/account/` - Account management
- `/spotify/link/` - Link Spotify account
- `/spotify/report/` - View statistics
- `/admin/` - Admin interface
- `/contact/` - Contact information

## Development

### Running Tests
