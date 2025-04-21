from flask import Flask, render_template, request, jsonify, redirect, url_for
import os
import json
from datetime import datetime
from werkzeug.utils import secure_filename
import time
from mutagen.mp3 import MP3

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = 'static/uploads'
app.config['MAX_CONTENT_LENGTH'] = 32 * 1024 * 1024  # 32MB max upload
app.config['ALLOWED_EXTENSIONS'] = {'mp3', 'png', 'jpg', 'jpeg'}

# mkdirs if they dont exist
# lazy way to ensure dirs r there
for dir in [app.config['UPLOAD_FOLDER'], 
           os.path.join(app.config['UPLOAD_FOLDER'], 'images'), 
           os.path.join(app.config['UPLOAD_FOLDER'], 'audio')]:
    if not os.path.exists(dir):
        os.makedirs(dir)

# db file path
SONGS_DB = 'static/songs.json'

def allowed_file(filename, filetype):
    if filetype == 'audio':
        return '.' in filename and filename.rsplit('.', 1)[1].lower() in {'mp3'}
    elif filetype == 'image':
        return '.' in filename and filename.rsplit('.', 1)[1].lower() in {'png', 'jpg', 'jpeg'}
    return False

def get_songs():
    if not os.path.exists(SONGS_DB):
        return []
    try:
        with open(SONGS_DB, 'r') as f:
            return json.load(f)
    except:
        return []

def save_songs(songs):
    with open(SONGS_DB, 'w') as f:
        json.dump(songs, f)

def get_duration(file_path):
    # get real duration using mutagen
    try:
        audio = MP3(file_path)
        total_seconds = int(audio.info.length)
        minutes = total_seconds // 60
        seconds = total_seconds % 60
        return f"{minutes}:{seconds:02d}", total_seconds
    except Exception as e:
        print(f"Error getting duration: {e}")
        return "0:00", 0  # Return default values on error

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/songs', methods=['GET'])
def get_all_songs():
    songs = get_songs()
    
    songs.reverse()

    # Calculate total time
    total_seconds = sum(song.get('duration_seconds', 0) for song in songs)
    hours = total_seconds // 3600
    minutes = (total_seconds % 3600) // 60
    
    # fancy formatting yo
    if hours > 0:
        time_str = f"{hours} Hours {minutes} Minutes"
    else:
        time_str = f"{minutes} Minutes"
        
    return jsonify({
        'songs': songs,
        'count': len(songs),
        'total_time': time_str
    })

@app.route('/songs', methods=['POST'])
def add_song():
    # grabbing that json data yo
    data = request.form
    
    song_file = request.files.get('song_file')
    image_file = request.files.get('image_file')
    
    if not song_file or not allowed_file(song_file.filename, 'audio'):
        return jsonify({'error': 'Invalid audio file'}), 400
    
    # secure dem filenames
    song_filename = secure_filename(song_file.filename)
    timestamp = str(int(time.time()))
    song_path = os.path.join('audio', f"{timestamp}_{song_filename}")
    full_song_path = os.path.join(app.config['UPLOAD_FOLDER'], song_path)
    song_file.save(full_song_path)
    
    image_path = ''
    if image_file and allowed_file(image_file.filename, 'image'):
        image_filename = secure_filename(image_file.filename)
        image_path = os.path.join('images', f"{timestamp}_{image_filename}")
        image_file.save(os.path.join(app.config['UPLOAD_FOLDER'], image_path))
    
    # get all those sweet deets
    title = data.get('title', '')
    artist = data.get('artist', '')
    description = data.get('description', '')
    year = data.get('year', '')
    
    # Get actual duration
    duration, duration_seconds = get_duration(full_song_path)
    
    # get da songs
    songs = get_songs()
    
    # make a new song obj
    new_song = {
        'id': len(songs) + 1,
        'title': title,
        'artist': artist,
        'description': description,
        'song_path': song_path,
        'image_path': image_path,
        'year': year,
        'duration': duration,
        'duration_seconds': duration_seconds,
        'album': data.get('album', '')
    }
    
    songs.append(new_song)
    save_songs(songs)
    
    return jsonify(new_song)

@app.route('/songs/<int:song_id>', methods=['PUT'])
def update_song(song_id):
    data = request.form
    songs = get_songs()
    
    for i, song in enumerate(songs):
        if song['id'] == song_id:
            song_file = request.files.get('song_file')
            image_file = request.files.get('image_file')
            
            if song_file and allowed_file(song_file.filename, 'audio'):
                # Remove old file if it exists
                old_path = os.path.join(app.config['UPLOAD_FOLDER'], song['song_path'])
                if os.path.exists(old_path):
                    os.remove(old_path)
                
                timestamp = str(int(time.time()))
                song_filename = secure_filename(song_file.filename)
                song_path = os.path.join('audio', f"{timestamp}_{song_filename}")
                full_song_path = os.path.join(app.config['UPLOAD_FOLDER'], song_path)
                song_file.save(full_song_path)
                songs[i]['song_path'] = song_path
                
                # Update duration for the new file
                duration, duration_seconds = get_duration(full_song_path)
                songs[i]['duration'] = duration
                songs[i]['duration_seconds'] = duration_seconds
            
            if image_file and allowed_file(image_file.filename, 'image'):
                # Remove old image if it exists
                if song['image_path']:
                    old_path = os.path.join(app.config['UPLOAD_FOLDER'], song['image_path'])
                    if os.path.exists(old_path):
                        os.remove(old_path)
                
                timestamp = str(int(time.time()))
                image_filename = secure_filename(image_file.filename)
                image_path = os.path.join('images', f"{timestamp}_{image_filename}")
                image_file.save(os.path.join(app.config['UPLOAD_FOLDER'], image_path))
                songs[i]['image_path'] = image_path
            
            # Update other fields
            songs[i]['title'] = data.get('title', song['title'])
            songs[i]['artist'] = data.get('artist', song['artist'])
            songs[i]['description'] = data.get('description', song['description'])
            # Handle both year and date fields
            if 'year' in data:
                songs[i]['year'] = data.get('year')
            elif 'date' in data:
                songs[i]['date'] = data.get('date')
            songs[i]['album'] = data.get('album', song.get('album', ''))
            
            save_songs(songs)
            return jsonify(songs[i])
    
    return jsonify({'error': 'Song not found'}), 404

@app.route('/songs/<int:song_id>', methods=['DELETE'])
def delete_song(song_id):
    songs = get_songs()
    
    for i, song in enumerate(songs):
        if song['id'] == song_id:
            # clean up them files
            if song['song_path']:
                path = os.path.join(app.config['UPLOAD_FOLDER'], song['song_path'])
                if os.path.exists(path):
                    os.remove(path)
            
            if song['image_path']:
                path = os.path.join(app.config['UPLOAD_FOLDER'], song['image_path'])
                if os.path.exists(path):
                    os.remove(path)
            
            # remove from list
            del songs[i]
            save_songs(songs)
            return jsonify({'success': True})
    
    return jsonify({'error': 'Song not found'}), 404

if __name__ == '__main__':
    app.run(debug=True, host='127.0.0.1', port=6969)