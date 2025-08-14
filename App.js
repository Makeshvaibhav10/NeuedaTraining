import React, { useState } from 'react';
import './App.css'; // Link to normal CSS

// Child component that receives a song and vote function
const Song = ({ song, recordVote }) => {
  return (
    <div className="song-card">
      <h3 className="song-title">{song.title}</h3>
      <p className="song-artist">by {song.artist}</p>
      <div className="vote-section">
        <p className="vote-count">Votes: {song.votes} 🗳️</p>
        <button onClick={recordVote} className="vote-button">
          Vote for this song! 👍
        </button>
      </div>
    </div>
  );
};
const SongList = () => {
  // All songs with their individual vote counts
  const [songs] = useState({
    originalSong1: { title: "Usure Pogudhu", artist: "AR Rahman", votes: 0 },
    originalSong2: { title: "Po Nee Po", artist: "Anirudh", votes: 0 },
    changedSong1: { title: "Neethane", artist: "AR Rahman", votes: 0 },
    changedSong2: { title: "Why this Kolaveri??", artist: "Anirudh", votes: 0 }
  });
  
  const [songVotes, setSongVotes] = useState({
    originalSong1: 0,
    originalSong2: 0,
    changedSong1: 0,
    changedSong2: 0
  });

  const [isOriginal, setIsOriginal] = useState(true);

  const getCurrentSongs = () => {
    if (isOriginal) {
      return [
        { ...songs.originalSong1, votes: songVotes.originalSong1 },
        { ...songs.originalSong2, votes: songVotes.originalSong2 }
      ];
    } else {
      return [
        { ...songs.changedSong1, votes: songVotes.changedSong1 },
        { ...songs.changedSong2, votes: songVotes.changedSong2 }
      ];
    }
  };

  const voteForSong1 = () => {
    const songKey = isOriginal ? 'originalSong1' : 'changedSong1';
    setSongVotes(prev => ({ ...prev, [songKey]: prev[songKey] + 1 }));
  };

  const voteForSong2 = () => {
    const songKey = isOriginal ? 'originalSong2' : 'changedSong2';
    setSongVotes(prev => ({ ...prev, [songKey]: prev[songKey] + 1 }));
  };

  const toggleSongs = () => {
    setIsOriginal(!isOriginal);
  };

  const currentSongs = getCurrentSongs();

  return (
    <div className="app-container min-h-screen bg-gradient-to-br from-purple-100 to-blue-100 py-8">
      <div className="song-list-container max-w-4xl mx-auto px-4">
        <h1 className="main-heading text-4xl font-bold text-center text-gray-800 mb-8">
          🎵 My Song Collection
        </h1>

        <div className="song-list flex flex-wrap justify-center">
          <Song song={currentSongs[0]} recordVote={voteForSong1} />
          <Song song={currentSongs[1]} recordVote={voteForSong2} />
        </div>

        <div className="button-wrapper text-center mt-8">
          <button 
            onClick={toggleSongs} 
            className="change-button bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg text-lg transition-colors duration-200 transform hover:scale-105"
          >
            {isOriginal ? "Change Songs 🔄" : "Go Back ⬅️"}
          </button>
        </div>

        <div className="info-text text-center mt-6 text-gray-600 text-lg">
          Click the button to change songs, or vote for your favorites!
        </div>
      </div>
    </div>
  );
};

const App = () => {
  return (
    <div>
      <SongList />
    </div>
  );
};

export default App;