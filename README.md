# Flask Music Player

A modern, responsive web-based music player application built with Flask, featuring drag-and-drop upload, customizable queues, and a sleek UI.

## Features

- **Music Library Management**: Upload, edit, and delete MP3 files with metadata
- **Custom Cover Art**: Upload PNG/JPG cover images for your songs
- **Queue System**: Drag-and-drop interface for creating and managing playlists
- **Playback Controls**: Play/pause, skip, previous, shuffle, and repeat
- **Search and Filter**: Easily find songs in your library
- **Responsive Design**: Works on desktop and mobile devices
- **Keyboard Shortcuts**: Quick controls for efficient navigation
- **Dark Theme**: Eye-friendly interface for extended listening sessions

## Tech Stack

- **Backend**: Flask (Python)
- **Frontend**: HTML, CSS, JavaScript (Vanilla)
- **Audio Processing**: Mutagen for MP3 metadata
- **Storage**: Local file system + JSON database

## Installation

### Prerequisites

- Python 3.6+ installed
- pip (Python package manager)
- Web browser with HTML5 audio support

### Setup Instructions

1. Clone the repository
   ```
   git clone https://github.com/yourusername/flask-music-player.git
   cd flask-music-player
   ```

2. Create a virtual environment (recommended)
   ```
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies
   ```
   pip install flask mutagen werkzeug
   ```

4. Run the application
   ```
   python app.py
   ```

5. Open your browser and navigate to
   ```
   http://127.0.0.1:6969
   ```

## Project Structure

```
flask-music-player/
├── app.py                 # Flask backend
├── static/
│   ├── css/
│   │   └── styles.css     # CSS styling
│   ├── js/
│   │   └── scripts.js     # JavaScript functionality
│   ├── images/            # Default images
│   └── uploads/           # Uploaded files (created at runtime)
│       ├── audio/         # MP3 files
│       └── images/        # Cover art
├── templates/
│   └── index.html         # Main application template
└── songs.json             # Song database (created at runtime)
```

## Usage

### Adding Songs

1. Click the "+" button in the top bar
2. Fill in the song details (name, artist, description, year)
3. Drag and drop or click to upload an MP3 file (required)
4. Optionally upload cover art (PNG/JPG)
5. Click "ADD SONG!!" to save

### Playing Music

- Click on any song in the library to play it
- Use the player bar at the bottom to control playback
- Click the queue button to view and manage your playlist

### Queue Management

- Drag songs from your library to the queue panel
- Reorder songs in the queue by drag and drop
- Click on any song in the queue to play it immediately

### Keyboard Shortcuts

- **Space**: Play/Pause
- **Left/Right Arrow**: Jump backward/forward 10 seconds
- **Ctrl + Left/Right Arrow**: Previous/Next song
- **Ctrl + S**: Toggle shuffle
- **Ctrl + R**: Toggle repeat
- **Ctrl + Q**: Toggle queue view
- **Ctrl + A**: Add new song
- **Ctrl + K**: Show current song info
- **i**: Show keyboard shortcuts

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Serves the main application |
| `/songs` | GET | Returns all songs in JSON format |
| `/songs` | POST | Adds a new song |
| `/songs/<id>` | PUT | Updates an existing song |
| `/songs/<id>` | DELETE | Deletes a song |

## Song Data Structure

Songs are stored in a JSON file with the following structure:

```json
{
  "id": 1,
  "title": "Song Title",
  "artist": "Artist Name",
  "description": "Song description",
  "song_path": "audio/12345_song.mp3",
  "image_path": "images/12345_cover.png",
  "year": "2023",
  "duration": "3:45",
  "duration_seconds": 225,
  "album": "Album Name"
}
```

## Customization

### Styling

The application uses a dark theme by default. You can customize colors and styling by modifying the `styles.css` file.

### Backend Configuration

In `app.py`, you can configure:

- `UPLOAD_FOLDER`: Path for storing uploaded files
- `MAX_CONTENT_LENGTH`: Maximum upload file size (default: 32MB)
- `ALLOWED_EXTENSIONS`: Permitted file types

## Features In Detail

### Dynamic Queue

The player implements a dynamic queue system that allows users to:
- Add songs to the queue by dragging them from the library
- Reorder the queue by dragging songs to different positions
- View the total remaining duration of queued songs
- Shuffle the queue while preserving the currently playing song

### Audio Controls

The player offers comprehensive audio controls:
- Play/pause toggle
- Previous/next track navigation
- Seekbar for timeline scrubbing
- Repeat single track
- Shuffle playback order
- Real-time duration display

### File Management

The application provides a complete file management system:
- Automatic duration detection using Mutagen
- Secure filename handling
- Proper file cleanup when songs are deleted
- Support for MP3 audio and PNG/JPG images

## License

This project is free for personal use!

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Acknowledgements

- Icon SVGs from [Feather Icons](https://feathericons.com/)
- Font from [Google Fonts](https://fonts.google.com/) (Poppins)

---
