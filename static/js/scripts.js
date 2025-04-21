// dem songs need to be tracked
let songs = [];
let currentSongIndex = -1;
let isPlaying = false;
let queueList = []; // track da queue seperately

// grab all the DOM elements we need
const songList = document.getElementById('song-list');
const songCount = document.getElementById('song-count');
const totalDuration = document.getElementById('total-duration');
const audioPlayer = document.getElementById('audio-player');
const playerBar = document.getElementById('player-bar');
const currentSongName = document.getElementById('current-song-name');
const currentSongArtist = document.getElementById('current-song-artist');
const currentSongImage = document.getElementById('current-song-image');
const playPauseButton = document.getElementById('play-pause-button');
const prevButton = document.getElementById('prev-button');
const nextButton = document.getElementById('next-button');
const repeatButton = document.getElementById('repeat-button');
const queueButton = document.getElementById('queue-button');
const playerInfoButton = document.getElementById('player-info-button');
const shuffleButton = document.getElementById('shuffle-player-button');
const currentTimeDisplay = document.getElementById('current-time');
const totalTimeDisplay = document.getElementById('total-time');

// Modal elements - gotta grab em all
const addSongModal = document.getElementById('add-song-modal');
const editSongModal = document.getElementById('edit-song-modal');
const deleteModal = document.getElementById('delete-modal');
const infoModal = document.getElementById('info-modal');
const addButton = document.getElementById('add-button');
const playButton = document.getElementById('play-button');

// Form elements
const addSongForm = document.getElementById('add-song-form');
const editSongForm = document.getElementById('edit-song-form');
const deleteSongName = document.getElementById('delete-song-name');
const confirmDeleteButton = document.getElementById('confirm-delete');
const cancelDeleteButton = document.getElementById('cancel-delete');
const songFileInput = document.getElementById('song-file');
const imageFileInput = document.getElementById('image-file');
const songFileTick = document.querySelector('#song-file').parentElement.querySelector('.file-tick');
const imageFileTick = document.querySelector('#image-file').parentElement.querySelector('.file-tick');
const editSongFileInput = document.getElementById('edit-song-file');
const editImageFileInput = document.getElementById('edit-image-file');
const editSongFileTick = document.querySelector('#edit-song-file').parentElement.querySelector('.file-tick');
const editImageFileTick = document.querySelector('#edit-image-file').parentElement.querySelector('.file-tick');

// Control states
let repeatActive = false;
let queueActive = false;
let shuffleActive = false;

// Queue elements
const queuePlayerButton = document.getElementById('queue-player-button');
const queueContainer = document.getElementById('queue-container');
const mainContainer = document.getElementById('main-container');
const queueListElement = document.getElementById('queue-list');
const closeQueueButton = document.getElementById('close-queue-button');
const queueShuffleButton = document.getElementById('queue-shuffle-button');
const queueDuration = document.getElementById('queue-duration');

// Drag and drop state
let draggedItem = null;
let dragStartIndex = null;

// Init the app
document.addEventListener('DOMContentLoaded', () => {
    // First thing we do is get the songs
    fetchSongs();
    
    // Then we setup all the event listeners
    setupEventListeners();
    
    // Setup seekbar functionality
    setupSeekbar();
    
    // Update time display every second for accuracy
    setInterval(updateTimeDisplay, 1000);
});

// Fetch songs from the backend
function fetchSongs() {
    fetch('/songs')
        .then(response => response.json())
        .then(data => {
            songs = data.songs || [];
            songCount.textContent = `${data.count} Songs`;
            totalDuration.textContent = data.total_time;
            renderSongList();
            
            // Initialize queue with all songs in order
            initializeQueue();
        })
        .catch(error => console.error('Error fetching songs:', error));
}

// Initialize queue with all songs
function initializeQueue() {
    // Reset queue list
    queueList = [...Array(songs.length).keys()];
    renderQueueList();
    updateQueueDuration();
}

// Update queue duration display
function updateQueueDuration() {
    if (currentSongIndex === -1 || queueList.length === 0) {
        queueDuration.textContent = "0 Minutes Left";
        return;
    }
    
    // Calculate remaining time in queue
    let totalSeconds = 0;
    // Get remaining songs in queue after current one
    const currentQueueIndex = queueList.indexOf(currentSongIndex);
    if (currentQueueIndex !== -1) {
        for (let i = currentQueueIndex + 1; i < queueList.length; i++) {
            totalSeconds += songs[queueList[i]].duration_seconds || 0;
        }
    }
    
    // Format time
    if (totalSeconds > 0) {
        const minutes = Math.floor(totalSeconds / 60);
        if (minutes > 60) {
            const hours = Math.floor(minutes / 60);
            const remainingMinutes = minutes % 60;
            queueDuration.textContent = `${hours} Hours ${remainingMinutes} Minutes Left`;
        } else {
            queueDuration.textContent = `${minutes} Minutes Left`;
        }
    } else {
        queueDuration.textContent = "0 Minutes Left";
    }
}

// Set up all event listeners
function setupEventListeners() {
    // show the add song modal when the add button is clicked
    addButton.addEventListener('click', () => {
        addSongModal.style.display = 'flex';
    });

    // Play/pause button in song container
    playButton.addEventListener('click', () => {
        if (currentSongIndex !== -1) {
            // If a song is already playing, toggle play/pause
            togglePlayPause();
        } else if (songs.length > 0) {
            // If no song is playing, play the first song
            playSong(0);
        }
        
        // Update the play button icon
        updatePlayButtonIcon();
    });

    // Add song form submission
    addSongForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(addSongForm);
        
        fetch('/songs', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            // my hacky file input reset
            addSongForm.reset();
            songFileTick.classList.add('hidden');
            imageFileTick.classList.add('hidden');
            addSongModal.style.display = 'none';
            fetchSongs();
        })
        .catch(error => console.error('Error adding song:', error));
    });

    // File input change handlers
    songFileInput.addEventListener('change', () => {
        if (songFileInput.files.length > 0) {
            songFileTick.classList.remove('hidden');
        } else {
            songFileTick.classList.add('hidden');
        }
    });
    
    imageFileInput.addEventListener('change', () => {
        if (imageFileInput.files.length > 0) {
            imageFileTick.classList.remove('hidden');
        } else {
            imageFileTick.classList.add('hidden');
        }
    });

    // Edit file input change handlers
    editSongFileInput.addEventListener('change', () => {
        if (editSongFileInput.files.length > 0) {
            editSongFileTick.classList.remove('hidden');
        } else {
            editSongFileTick.classList.add('hidden');
        }
    });
    
    editImageFileInput.addEventListener('change', () => {
        if (editImageFileInput.files.length > 0) {
            editImageFileTick.classList.remove('hidden');
        } else {
            editImageFileTick.classList.add('hidden');
        }
    });

    // Edit song form submission
    editSongForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(editSongForm);
        const songId = formData.get('id');
        
        fetch(`/songs/${songId}`, {
            method: 'PUT',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            editSongForm.reset();
            editSongModal.style.display = 'none';
            fetchSongs();
        })
        .catch(error => console.error('Error updating song:', error));
    });

    // Delete confirmation
    confirmDeleteButton.addEventListener('click', () => {
        const songId = confirmDeleteButton.dataset.songId;
        
        fetch(`/songs/${songId}`, {
            method: 'DELETE'
        })
        .then(response => response.json())
        .then(data => {
            deleteModal.style.display = 'none';
            fetchSongs();
            
            // If deleted song was playing, stop the player
            if (currentSongIndex !== -1 && songs[currentSongIndex].id == songId) {
                stopPlayback();
            }
        })
        .catch(error => console.error('Error deleting song:', error));
    });

    // Cancel delete
    cancelDeleteButton.addEventListener('click', () => {
        deleteModal.style.display = 'none';
    });

    // Close modals when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === addSongModal) {
            addSongModal.style.display = 'none';
        } else if (e.target === editSongModal) {
            editSongModal.style.display = 'none';
        } else if (e.target === deleteModal) {
            deleteModal.style.display = 'none';
        } else if (e.target === infoModal) {
            infoModal.style.display = 'none';
        }
    });

    // Player controls
    playPauseButton.addEventListener('click', togglePlayPause);
    prevButton.addEventListener('click', playPreviousSong);
    nextButton.addEventListener('click', playNextSong);
    
    // Repeat button functionality - fix it up real good
    repeatButton.addEventListener('click', () => {
        repeatActive = !repeatActive;
        repeatButton.classList.toggle('active', repeatActive);
        audioPlayer.loop = repeatActive; // make it actually loop
        
        // Visual indicator that repeat is active
        if (repeatActive) {
            repeatButton.style.filter = 'brightness(1.5)';
            repeatButton.style.color = '#1DB954'; // spotify green for active
        } else {
            repeatButton.style.filter = 'none';
            repeatButton.style.color = 'white';
        }
    });
    
    // Queue button - Toggle queue view
    queueButton.addEventListener('click', toggleQueueView);
    queuePlayerButton.addEventListener('click', toggleQueueView);
    closeQueueButton.addEventListener('click', toggleQueueView);
    
    // Shuffle buttons - make sure all are synced
    shuffleButton.addEventListener('click', () => {
        toggleShuffle();
    });
    
    // Queue shuffle button
    queueShuffleButton.addEventListener('click', () => {
        toggleShuffle();
    });
    
    // Main container shuffle button
    document.getElementById('shuffle-button').addEventListener('click', () => {
        toggleShuffle();
    });
    
    // Audio player events
    // Handle when a song ends
    audioPlayer.addEventListener('ended', () => {
        // If repeat is active, just restart the song
        if (repeatActive) {
            audioPlayer.currentTime = 0;
            audioPlayer.play();
        } else {
            // Otherwise play the next song
            playNextSong();
        }
    });
    
    audioPlayer.addEventListener('timeupdate', updateProgress);
    
    // Space bar to toggle play/pause - always work with songs available
    document.addEventListener('keydown', (e) => {
        // Check if we're not in an input field
        if (e.code === 'Space' && !e.target.matches('input, textarea')) {
            e.preventDefault(); // Prevent page scrolling
            
            // If a song is loaded, toggle play/pause
            if (currentSongIndex !== -1) {
                togglePlayPause();
            } else if (songs.length > 0) {
                // If no song is playing but we have songs, play the first one
                playSong(0);
            }
            
            // prevent any other handlers from doin stuff
            e.stopPropagation();
            return false;
        }
    });
    
    // Info button in player bar
    if (playerInfoButton) {
        playerInfoButton.addEventListener('click', () => {
            if (currentSongIndex !== -1 && currentSongIndex < songs.length) {
                const song = songs[currentSongIndex];
                const imagePath = song.image_path ? `/static/uploads/${song.image_path}` : '/static/images/default-cover.png';
                
                document.getElementById('info-song-cover').src = imagePath;
                document.getElementById('info-song-title').textContent = song.title;
                document.getElementById('info-song-duration').textContent = song.duration || '0:00';
                document.getElementById('info-song-filesize').textContent = '2.5Mb'; // Placeholder
                document.getElementById('info-song-description').textContent = song.description || 'No description available.';
                
                // Support both date and year formats for display
                if (song.year) {
                    document.getElementById('info-song-year').textContent = song.year;
                } else if (song.date) {
                    if (song.date.includes('-')) {
                        document.getElementById('info-song-year').textContent = song.date.split('-')[0];
                    } else {
                        document.getElementById('info-song-year').textContent = song.date;
                    }
                } else {
                    document.getElementById('info-song-year').textContent = 'Unknown';
                }
                
                infoModal.style.display = 'flex';
            }
        });
    }
}

// Toggle queue view
function toggleQueueView() {
    queueActive = !queueActive;
    
    if (queueActive) {
        // Open queue
        mainContainer.classList.add('queue-open');
        queueContainer.classList.add('open');
        
        // Update visual state of both queue buttons
        queueButton.classList.add('active');
        queuePlayerButton.classList.add('active');
        
        // Apply consistent styling to both buttons
        queueButton.style.filter = 'brightness(1.5)';
        queueButton.style.color = '#1DB954';
        queuePlayerButton.style.filter = 'brightness(1.5)';
        queuePlayerButton.style.color = '#1DB954';
    } else {
        // Close queue
        mainContainer.classList.remove('queue-open');
        queueContainer.classList.remove('open');
        
        // Update visual state of both queue buttons
        queueButton.classList.remove('active');
        queuePlayerButton.classList.remove('active');
        
        // Reset styling
        queueButton.style.filter = 'none';
        queueButton.style.color = 'white';
        queuePlayerButton.style.filter = 'none';
        queuePlayerButton.style.color = 'white';
    }
    
    // Update queue list when toggling
    renderQueueList();
}

// Toggle shuffle
function toggleShuffle() {
    shuffleActive = !shuffleActive;
    
    // Sync all shuffle buttons
    const mainShuffleBtn = document.getElementById('shuffle-button');
    
    // Update classes for all shuffle buttons
    shuffleButton.classList.toggle('active', shuffleActive);
    queueShuffleButton.classList.toggle('active', shuffleActive);
    mainShuffleBtn.classList.toggle('active', shuffleActive);
    
    // Apply shuffle styling to all buttons
    if (shuffleActive) {
        shuffleButton.style.filter = 'brightness(1.5)';
        shuffleButton.style.color = '#1DB954';
        queueShuffleButton.style.filter = 'brightness(1.5)';
        queueShuffleButton.style.color = '#1DB954';
        mainShuffleBtn.style.filter = 'brightness(1.5)';
        mainShuffleBtn.style.color = '#1DB954';
        
        // Shuffle queue (except currently playing)
        shuffleQueue();
    } else {
        shuffleButton.style.filter = 'none';
        shuffleButton.style.color = 'white';
        queueShuffleButton.style.filter = 'none';
        queueShuffleButton.style.color = 'white';
        mainShuffleBtn.style.filter = 'none';
        mainShuffleBtn.style.color = 'white';
        
        // Return to default order
        initializeQueue();
    }
}

// Shuffle the queue
function shuffleQueue() {
    if (songs.length <= 1) return;
    
    // Keep track of current playing song
    const currentQueueIndex = queueList.indexOf(currentSongIndex);
    
    // Create array of all indexes except current
    let remainingItems = [...queueList];
    if (currentQueueIndex !== -1) {
        remainingItems.splice(currentQueueIndex, 1);
    }
    
    // Fisher-Yates shuffle
    for (let i = remainingItems.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [remainingItems[i], remainingItems[j]] = [remainingItems[j], remainingItems[i]];
    }
    
    // Put current song back at its position if it was playing
    if (currentQueueIndex !== -1) {
        queueList = [
            ...remainingItems.slice(0, currentQueueIndex),
            currentSongIndex,
            ...remainingItems.slice(currentQueueIndex)
        ];
    } else {
        queueList = remainingItems;
    }
    
    renderQueueList();
}

// Setup seekbar functionality
function setupSeekbar() {
    const seekbar = document.querySelector('.seekbar');
    const seekbarContainer = document.querySelector('.seekbar-container');
    
    if (!seekbar || !seekbarContainer) return;
    
    seekbarContainer.addEventListener('click', (e) => {
        if (audioPlayer.duration) {
            const rect = seekbar.getBoundingClientRect();
            const position = (e.clientX - rect.left) / rect.width;
            audioPlayer.currentTime = position * audioPlayer.duration;
        }
    });
    
    // For dragging functionality
    let isDragging = false;
    const seekbarHandle = document.querySelector('.seekbar-handle');
    
    if (seekbarHandle) {
        seekbarHandle.addEventListener('mousedown', () => {
            isDragging = true;
        });
        
        document.addEventListener('mousemove', (e) => {
            if (isDragging && audioPlayer.duration) {
                const rect = seekbar.getBoundingClientRect();
                const position = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                
                // Update visuals immediately for smoother experience
                document.querySelector('.seekbar-fill').style.width = `${position * 100}%`;
                document.querySelector('.seekbar-handle').style.left = `${position * 100}%`;
            }
        });
        
        document.addEventListener('mouseup', (e) => {
            if (isDragging && audioPlayer.duration) {
                const rect = seekbar.getBoundingClientRect();
                const position = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                audioPlayer.currentTime = position * audioPlayer.duration;
                isDragging = false;
            }
        });
    }
}

// Update progress for seekbar
function updateProgress() {
    if (audioPlayer.duration) {
        // Calculate and update progress percentage
        const progressPercent = (audioPlayer.currentTime / audioPlayer.duration) * 100;
        
        // Update seekbar fill
        const seekbarFill = document.querySelector('.seekbar-fill');
        if (seekbarFill) {
            seekbarFill.style.width = `${progressPercent}%`;
        }
        
        // Update seekbar handle position
        const seekbarHandle = document.querySelector('.seekbar-handle');
        if (seekbarHandle) {
            seekbarHandle.style.left = `${progressPercent}%`;
        }
    }
}

// Render the song list
function renderSongList() {
    songList.innerHTML = '';
    
    if (!songs || !Array.isArray(songs) || songs.length === 0) {
        songList.innerHTML = '<div class="no-songs">No songs available. Add some!</div>';
        return;
    }
    
    songs.forEach((song, index) => {
        const songItem = document.createElement('div');
        songItem.className = 'song-item';
        songItem.setAttribute('data-index', index);
        
        if (index === currentSongIndex) {
            songItem.classList.add('playing');
        }
        
        // Handle both old and new image path formats
        const imagePath = song.image_path ? `/static/uploads/${song.image_path}` : '/static/images/default-cover.png';
        
        songItem.innerHTML = `
            <img class="song-thumbnail" src="${imagePath}" alt="${song.title} cover">
            <div class="song-details">
                <div class="song-title">${song.title}</div>
                <div class="song-artist">${song.artist}</div>
            </div>
            <div class="song-actions">
                <button class="icon-button edit-button" data-id="${song.id}">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                </button>
                <button class="icon-button delete-button" data-id="${song.id}" data-title="${song.title}">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                </button>
                <button class="icon-button info-button" data-id="${song.id}">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="16" x2="12" y2="12"></line>
                        <line x1="12" y1="8" x2="12.01" y2="8"></line>
                    </svg>
                </button>
            </div>
        `;
        
        // make them song items do things when clicked
        songItem.addEventListener('click', (e) => {
            // Ignore if clicked on a button
            if (!e.target.closest('.icon-button')) {
                playSong(index);
            }
        });
        
        // Make song draggable to queue
        songItem.setAttribute('draggable', 'true');
        songItem.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', index);
            draggedItem = songItem;
        });
        
        songList.appendChild(songItem);
    });
    
    // hook up them buttons for each song
    setupSongItemButtons();
}

// Render queue list
function renderQueueList() {
    if (!queueListElement) return;
    
    queueListElement.innerHTML = '';
    
    if (queueList.length === 0) {
        // Initialize queue if empty
        initializeQueue();
        return;
    }
    
    // Create drop indicator for when dragging
    const dropIndicator = document.createElement('div');
    dropIndicator.className = 'drop-indicator';
    dropIndicator.id = 'queue-drop-indicator';
    
    queueList.forEach((songIndex, i) => {
        const song = songs[songIndex];
        if (!song) return;
        
        const queueItem = document.createElement('div');
        queueItem.className = 'queue-item';
        queueItem.setAttribute('data-queue-index', i);
        queueItem.setAttribute('data-song-index', songIndex);
        
        if (songIndex === currentSongIndex) {
            queueItem.classList.add('playing');
        }
        
        const imagePath = song.image_path ? `/static/uploads/${song.image_path}` : '/static/images/default-cover.png';
        
        queueItem.innerHTML = `
            <img class="song-thumbnail" src="${imagePath}" alt="${song.title} cover">
            <div class="song-details">
                <div class="song-title">${song.title}</div>
                <div class="song-artist">${song.artist}</div>
            </div>
        `;
        
        // Add drag and drop functionality
        queueItem.setAttribute('draggable', 'true');
        
        queueItem.addEventListener('click', () => {
            playSong(songIndex);
        });
        
        // Drag start - when user starts dragging a queue item
        queueItem.addEventListener('dragstart', (e) => {
            draggedItem = queueItem;
            dragStartIndex = i;
            setTimeout(() => {
                queueItem.classList.add('dragging');
            }, 0);
        });
        
        // Drag end - when user stops dragging
        queueItem.addEventListener('dragend', () => {
            queueItem.classList.remove('dragging');
            document.querySelectorAll('.drop-indicator').forEach(indicator => {
                indicator.style.display = 'none';
            });
        });
        
        // Drag over - when item is dragged over another item
        queueItem.addEventListener('dragover', (e) => {
            e.preventDefault();
            // Only show drag indicator in the queue
            const dropIndicator = document.getElementById('queue-drop-indicator');
            if (dropIndicator) {
                const rect = queueItem.getBoundingClientRect();
                const midpoint = rect.top + rect.height / 2;
                
                if (e.clientY < midpoint) {
                    // Show above
                    dropIndicator.style.display = 'block';
                    if (queueItem.previousElementSibling !== dropIndicator) {
                        queueListElement.insertBefore(dropIndicator, queueItem);
                    }
                } else {
                    // Show below
                    dropIndicator.style.display = 'block';
                    if (queueItem.nextElementSibling !== dropIndicator) {
                        queueListElement.insertBefore(dropIndicator, queueItem.nextElementSibling);
                    }
                }
            }
        });
        
        // Drop - when item is dropped onto another item
        queueItem.addEventListener('drop', (e) => {
            e.preventDefault();
            const dropIndex = parseInt(queueItem.getAttribute('data-queue-index'));
            const rect = queueItem.getBoundingClientRect();
            const midpoint = rect.top + rect.height / 2;
            let insertIndex = dropIndex;
            
            // Determine if dropping above or below
            if (e.clientY > midpoint) {
                insertIndex += 1;
            }
            
            // Check if dragging from songs list or within queue
            const draggedSongIndex = e.dataTransfer.getData('text/plain');
            if (draggedSongIndex) {
                // If from songs list, add the song to queue
                const songIndex = parseInt(draggedSongIndex);
                // Remove from current place in queue if exists
                const existingIndex = queueList.indexOf(songIndex);
                if (existingIndex !== -1) {
                    queueList.splice(existingIndex, 1);
                    if (existingIndex < insertIndex) {
                        insertIndex--; // Adjust index if removing from earlier in the list
                    }
                }
                
                // Insert at new position
                queueList.splice(insertIndex, 0, songIndex);
            } else if (dragStartIndex !== null) {
                // Reordering within queue
                const [movedItem] = queueList.splice(dragStartIndex, 1);
                // If dragging from before insert point, adjust insert point
                if (dragStartIndex < insertIndex) {
                    insertIndex--;
                }
                queueList.splice(insertIndex, 0, movedItem);
            }
            
            // Hide drop indicator and re-render queue
            document.querySelectorAll('.drop-indicator').forEach(indicator => {
                indicator.style.display = 'none';
            });
            renderQueueList();
            updateQueueDuration();
        });
        
        queueListElement.appendChild(queueItem);
    });
    
    // Add drop indicator to the queue list
    queueListElement.appendChild(dropIndicator);
    
    // Make queue container a drop target
    queueListElement.addEventListener('dragover', (e) => {
        e.preventDefault();
        
        // Show drop indicator at the end if dragging over empty space
        if (!e.target.closest('.queue-item')) {
            const dropIndicator = document.getElementById('queue-drop-indicator');
            if (dropIndicator) {
                dropIndicator.style.display = 'block';
                queueListElement.appendChild(dropIndicator);
            }
        }
    });
    
    queueListElement.addEventListener('drop', (e) => {
        e.preventDefault();
        
        // Check if not dropping on a specific item (empty space)
        if (!e.target.closest('.queue-item')) {
            const draggedSongIndex = e.dataTransfer.getData('text/plain');
            if (draggedSongIndex) {
                // Add to end of queue
                const songIndex = parseInt(draggedSongIndex);
                // If song already in queue, remove it first
                const existingIndex = queueList.indexOf(songIndex);
                if (existingIndex !== -1) {
                    queueList.splice(existingIndex, 1);
                }
                queueList.push(songIndex);
                renderQueueList();
                updateQueueDuration();
            }
        }
        
        // Hide drop indicator
        document.querySelectorAll('.drop-indicator').forEach(indicator => {
            indicator.style.display = 'none';
        });
    });
}

// Update time displays only
function updateTimeDisplay() {
    if (audioPlayer.duration) {
        // Update current time display
        const currentMinutes = Math.floor(audioPlayer.currentTime / 60);
        const currentSeconds = Math.floor(audioPlayer.currentTime % 60);
        currentTimeDisplay.textContent = `${currentMinutes}:${currentSeconds < 10 ? '0' : ''}${currentSeconds}`;
        
        // Make sure total time is always displayed correctly
        const totalMinutes = Math.floor(audioPlayer.duration / 60);
        const totalSeconds = Math.floor(audioPlayer.duration % 60);
        totalTimeDisplay.textContent = `${totalMinutes}:${totalSeconds < 10 ? '0' : ''}${totalSeconds}`;
        
        // Update the progress bar
        updateProgress();
    }
}

// Play a song by index
function playSong(index) {
    // make sure index is valid
    if (index < 0 || index >= songs.length) return;
    
    const song = songs[index];
    const songPath = `/static/uploads/${song.song_path}`;
    
    // set the audio source n start playin
    audioPlayer.src = songPath;
    audioPlayer.play()
        .then(() => {
            currentSongIndex = index;
            isPlaying = true;
            updatePlayPauseIcon();
            updatePlayButtonIcon(); // Update main play button too
            updatePlayerInfo();
            renderSongList(); // Refresh list to highlight current song
            renderQueueList(); // Refresh queue to highlight current song
            updateQueueDuration(); // Update remaining time
            playerBar.classList.remove('hidden');
            
            // Initialize time displays
            audioPlayer.addEventListener('loadedmetadata', () => {
                const totalMinutes = Math.floor(audioPlayer.duration / 60);
                const totalSeconds = Math.floor(audioPlayer.duration % 60);
                totalTimeDisplay.textContent = `${totalMinutes}:${totalSeconds < 10 ? '0' : ''}${totalSeconds}`;
                currentTimeDisplay.textContent = '0:00';
            }, { once: true });
        })
        .catch(error => {
            console.error('Error playing song:', error);
        });
}

// Toggle play/pause
function togglePlayPause() {
    if (isPlaying) {
        audioPlayer.pause();
        isPlaying = false;
    } else {
        audioPlayer.play();
        isPlaying = true;
    }
    updatePlayPauseIcon();
}

// Update all play/pause icons based on playback state
function updatePlayPauseIcon() {
    if (isPlaying) {
        // Set to pause icon
        playPauseButton.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="6" y="4" width="4" height="16"></rect>
                <rect x="14" y="4" width="4" height="16"></rect>
            </svg>
        `;
    } else {
        // Set to play icon
        playPauseButton.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polygon points="5 3 19 12 5 21 5 3"></polygon>
            </svg>
        `;
    }
    
    // Also update the play button in the song container
    updatePlayButtonIcon();
}

// Update the play button icon in the song container
function updatePlayButtonIcon() {
    if (!playButton) return;
    
    if (isPlaying) {
        // Set to pause icon
        playButton.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="6" y="4" width="4" height="16"></rect>
                <rect x="14" y="4" width="4" height="16"></rect>
            </svg>
        `;
    } else {
        // Set to play icon
        playButton.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polygon points="5 3 19 12 5 21 5 3"></polygon>
            </svg>
        `;
    }
}

// Play the previous song
function playPreviousSong() {
    if (currentSongIndex === -1) return;
    
    // Find current song position in queue
    const currentQueueIndex = queueList.indexOf(currentSongIndex);
    
    if (currentQueueIndex > 0) {
        // Play previous song in queue
        playSong(queueList[currentQueueIndex - 1]);
    } else {
        // Wrap to end of queue
        playSong(queueList[queueList.length - 1]);
    }
}

// Play the next song
function playNextSong() {
    // If repeat is active, replay the current song
    if (repeatActive && currentSongIndex !== -1) {
        // Just restart the current song
        audioPlayer.currentTime = 0;
        audioPlayer.play();
        return;
    }
    
    if (currentSongIndex === -1) {
        // If nothing playing, play first song
        if (songs.length > 0) {
            playSong(queueList[0]);
        }
        return;
    }
    
    // Find current song position in queue
    const currentQueueIndex = queueList.indexOf(currentSongIndex);
    
    if (currentQueueIndex < queueList.length - 1) {
        // Play next song in queue
        playSong(queueList[currentQueueIndex + 1]);
    } else {
        // Wrap to start of queue
        playSong(queueList[0]);
    }
}

// Stop playback entirely
function stopPlayback() {
    audioPlayer.pause();
    audioPlayer.src = '';
    isPlaying = false;
    currentSongIndex = -1;
    playerBar.classList.add('hidden');
    renderSongList();
    renderQueueList();
}

// Update the player info with current song details
function updatePlayerInfo() {
    if (currentSongIndex !== -1 && currentSongIndex < songs.length) {
        const song = songs[currentSongIndex];
        currentSongName.textContent = song.title;
        currentSongArtist.textContent = song.artist;
        
        // Update image in player bar
        const imagePath = song.image_path ? `/static/uploads/${song.image_path}` : '/static/images/default-cover.png';
        currentSongImage.src = imagePath;
        
        // Set total duration
        if (song.duration) {
            totalTimeDisplay.textContent = song.duration;
        }
    }
}

// Setup song item buttons
function setupSongItemButtons() {
    // Edit buttons
    document.querySelectorAll('.edit-button').forEach(button => {
        button.addEventListener('click', (e) => {
            e.stopPropagation();
            const songId = button.dataset.id;
            const song = songs.find(s => s.id == songId);
            
            if (song) {
                document.getElementById('edit-song-id').value = song.id;
                document.getElementById('edit-song-name').value = song.title;
                document.getElementById('edit-singer').value = song.artist;
                document.getElementById('edit-description').value = song.description || '';
                
                // Support both date and year formats
                if (song.year) {
                    document.getElementById('edit-song-year').value = song.year;
                } else if (song.date) {
                    // Extract year from date if it's in ISO format
                    const dateValue = song.date.split('-')[0];
                    if (dateValue && !isNaN(dateValue)) {
                        document.getElementById('edit-song-year').value = dateValue;
                    }
                }
                
                // Reset file ticks
                editSongFileTick.classList.add('hidden');
                editImageFileTick.classList.add('hidden');
                
                editSongModal.style.display = 'flex';
            }
        });
    });
    
    // Delete buttons
    document.querySelectorAll('.delete-button').forEach(button => {
        button.addEventListener('click', (e) => {
            e.stopPropagation();
            const songId = button.dataset.id;
            const songTitle = button.dataset.title;
            
            deleteSongName.textContent = songTitle;
            confirmDeleteButton.dataset.songId = songId;
            
            deleteModal.style.display = 'flex';
        });
    });
    
    // Info buttons
    document.querySelectorAll('.info-button').forEach(button => {
        button.addEventListener('click', (e) => {
            e.stopPropagation();
            const songId = button.dataset.id;
            const song = songs.find(s => s.id == songId);
            
            if (song) {
                const imagePath = song.image_path ? `/static/uploads/${song.image_path}` : '/static/images/default-cover.png';
                
                document.getElementById('info-song-cover').src = imagePath;
                document.getElementById('info-song-title').textContent = song.title;
                document.getElementById('info-song-duration').textContent = song.duration || '0:00';
                document.getElementById('info-song-filesize').textContent = '2.5Mb'; // Placeholder
                document.getElementById('info-song-description').textContent = song.description || 'No description available.';
                
                // Support both date and year formats for display
                if (song.year) {
                    document.getElementById('info-song-year').textContent = song.year;
                } else if (song.date) {
                    if (song.date.includes('-')) {
                        document.getElementById('info-song-year').textContent = song.date.split('-')[0];
                    } else {
                        document.getElementById('info-song-year').textContent = song.date;
                    }
                } else {
                    document.getElementById('info-song-year').textContent = 'Unknown';
                }
                
                infoModal.style.display = 'flex';
            }
        });
    });
}

// Keyboard Shortcuts and Info Modal for Music Player
(function() {
    // Variables to store DOM elements
    let audioPlayer, playerBar, shortcutsInfoModal;
    
    // Function to get DOM elements
    function getDOMElements() {
        audioPlayer = document.getElementById('audio-player');
        playerBar = document.getElementById('player-bar');
        shortcutsInfoModal = document.getElementById('shortcuts-info-modal');
    }
    
    // Create the shortcuts info modal
    function createShortcutsInfoModal() {
        if (!document.getElementById('shortcuts-info-modal')) {
            const modal = document.createElement('div');
            modal.id = 'shortcuts-info-modal';
            modal.className = 'modal';
            
            modal.innerHTML = `
                <div class="modal-content">
                    <h2>Keyboard Shortcuts</h2>
                    <div class="shortcuts-container">
                        <div class="shortcut-group">
                            <h3>Navigation</h3>
                            <div class="shortcut-item">
                                <span class="shortcut-key">→</span>
                                <span class="shortcut-description">Move 10 seconds forward</span>
                            </div>
                            <div class="shortcut-item">
                                <span class="shortcut-key">←</span>
                                <span class="shortcut-description">Move 10 seconds backward</span>
                            </div>
                            <div class="shortcut-item">
                                <span class="shortcut-key">Ctrl + ←</span>
                                <span class="shortcut-description">Previous song</span>
                            </div>
                            <div class="shortcut-item">
                                <span class="shortcut-key">Ctrl + →</span>
                                <span class="shortcut-description">Next song</span>
                            </div>
                        </div>
                        <div class="shortcut-group">
                            <h3>Controls</h3>
                            <div class="shortcut-item">
                                <span class="shortcut-key">Space</span>
                                <span class="shortcut-description">Play/Pause</span>
                            </div>
                            <div class="shortcut-item">
                                <span class="shortcut-key">Ctrl + S</span>
                                <span class="shortcut-description">Toggle Shuffle</span>
                            </div>
                            <div class="shortcut-item">
                                <span class="shortcut-key">Ctrl + R</span>
                                <span class="shortcut-description">Toggle Repeat</span>
                            </div>
                            <div class="shortcut-item">
                                <span class="shortcut-key">Ctrl + Q</span>
                                <span class="shortcut-description">Toggle Queue</span>
                            </div>
                        </div>
                        <div class="shortcut-group">
                            <h3>Other</h3>
                            <div class="shortcut-item">
                                <span class="shortcut-key">Ctrl + A</span>
                                <span class="shortcut-description">Add new song</span>
                            </div>
                            <div class="shortcut-item">
                                <span class="shortcut-key">Ctrl + K</span>
                                <span class="shortcut-description">Current song info</span>
                            </div>
                            <div class="shortcut-item">
                                <span class="shortcut-key">i</span>
                                <span class="shortcut-description">Show shortcuts</span>
                            </div>
                        </div>
                    </div>
                    <div class="modal-buttons">
                        <button id="close-shortcuts-modal">Close</button>
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal);
            
            // Add event listener to close button
            const closeButton = document.getElementById('close-shortcuts-modal');
            closeButton.addEventListener('click', () => {
                modal.style.display = 'none';
            });
            
            // Close modal when clicking outside
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.style.display = 'none';
                }
            });
            
            shortcutsInfoModal = modal;
        }
    }
    
    // Add the info button to the player bar
    function addInfoButton() {
        if (!document.getElementById('shortcuts-info-button') && playerBar) {
            const infoButton = document.createElement('button');
            infoButton.id = 'shortcuts-info-button';
            infoButton.className = 'icon-button';
            infoButton.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="16" x2="12" y2="12"></line>
                    <line x1="12" y1="8" x2="12.01" y2="8"></line>
                </svg>
            `;
            
            // Add to the left side of player bar
            const nowPlayingContainer = playerBar.querySelector('.now-playing-container');
            playerBar.insertBefore(infoButton, nowPlayingContainer);
            
            // Add click event listener
            infoButton.addEventListener('click', () => {
                shortcutsInfoModal.style.display = 'flex';
            });
        }
    }
    
    // Add CSS styles
    function addStyles() {
        if (!document.getElementById('shortcuts-styles')) {
            const styleEl = document.createElement('style');
            styleEl.id = 'shortcuts-styles';
            
            styleEl.textContent = `
                /* Shortcuts Info Modal Styles */
                .shortcuts-container {
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                    margin: 15px 0;
                }
                
                .shortcut-group h3 {
                    margin-bottom: 10px;
                    font-size: 18px;
                    color: #1DB954;
                }
                
                .shortcut-item {
                    display: flex;
                    margin-bottom: 8px;
                    align-items: center;
                }
                
                .shortcut-key {
                    background-color: #333;
                    padding: 4px 8px;
                    border-radius: 4px;
                    font-family: monospace;
                    font-size: 14px;
                    min-width: 100px;
                    display: inline-block;
                    margin-right: 15px;
                    text-align: center;
                }
                
                .shortcut-description {
                    color: #ddd;
                    font-size: 14px;
                }
                
                /* Info button in player bar */
                #shortcuts-info-button {
                    margin-right: 15px;
                    background-color: transparent;
                    padding: 8px;
                }
                
                #shortcuts-info-button:hover {
                    filter: brightness(1.25);
                    color: #1DB954;
                }
            `;
            
            document.head.appendChild(styleEl);
        }
    }
    
})