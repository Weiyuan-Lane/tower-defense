export class AudioManager {
  constructor() {
    this.musicVolume = 0.7;
    this.sfxVolume = 0.8;
    this.musicElements = {};
    this.sfxElements = {};
    this.currentMusic = null;

    this.loadAudio();
  }

  loadAudio() {
    // This would load audio files in a real implementation
    // For now, we'll just define the audio tracks we'd use

    // Music tracks
    this.musicTracks = {
      // menu: 'assets/audio/menu-music.mp3',
      gameplay: 'assets/audio/gameplay-music.mp3',
      // boss: 'assets/audio/boss-music.mp3'
    };

    // Sound effects
    this.soundEffects = {
      // towerPlace: 'assets/audio/tower-place.mp3',
      towerShoot: 'assets/audio/tower-shoot.mp3',
      // enemyDeath: 'assets/audio/enemy-death.mp3',
      // buttonClick: 'assets/audio/button-click.mp3',
      gameOver: 'assets/audio/game-over.mp3',
      // waveStart: 'assets/audio/wave-start.mp3',
      upgrade: 'assets/audio/upgrade.mp3'
    };

    // Create HTML audio elements
    this.createAudioElements();
  }

  createAudioElements() {
    // Create music elements
    for (const [key, trackSrc] of Object.entries(this.musicTracks)) {
      const audio = new Audio();
      audio.volume = this.musicVolume;
      audio.loop = true;

      // Try to load the audio file if it exists
      try {
        audio.src = trackSrc;
      } catch (e) {
        console.warn(`Could not load audio: ${trackSrc}.mp3`, e);
      }

      this.musicElements[key] = audio;
    }

    // Create sound effect elements
    for (const [key, sfxSrc] of Object.entries(this.soundEffects)) {
      const audio = new Audio();
      audio.volume = this.sfxVolume;

      // Try to load the audio file if it exists
      try {
        audio.src = sfxSrc;
      } catch (e) {
        console.warn(`Could not load audio: ${sfxSrc}`, e);
      }

      this.sfxElements[key] = audio;
    }
  }

  playMusic(trackName) {
    // Stop current music if any
    this.stopMusic();

    // Get the audio element
    const audio = this.musicElements[trackName];
    if (!audio) {
      console.warn(`Music track not found: ${trackName}`);
      return;
    }

    // Play the music
    try {
      audio.currentTime = 0;
      audio.volume = this.musicVolume;
      audio.play().catch(e => {
        console.warn(`Error playing music: ${e.message}`);
      });
      this.currentMusic = trackName;
    } catch (e) {
      console.warn(`Error playing music: ${e.message}`);
    }
  }

  stopMusic() {
    // Stop all music tracks
    for (const audio of Object.values(this.musicElements)) {
      try {
        audio.pause();
        audio.currentTime = 0;
      } catch (e) {
        console.warn(`Error stopping music: ${e.message}`);
      }
    }
    this.currentMusic = null;
  }

  playSfx(sfxName) {
    // Get the audio element
    const originalAudio = this.sfxElements[sfxName];
    if (!originalAudio) {
      console.warn(`Sound effect not found: ${sfxName}`);
      return;
    }

    // Play the sound effect
    try {
      const audio = new Audio(originalAudio.src);
      audio.volume = this.sfxVolume;
      audio.currentTime = 0;
      audio.play().catch(e => {
        console.warn(`Error playing sound effect: ${e.message}`);
      });
    } catch (e) {
      console.warn(`Error playing sound effect: ${e.message}`);
    }
  }

  setMusicVolume(volume) {
    this.musicVolume = volume;
  }

  setSfxVolume(volume) {
    this.sfxVolume = volume;
  }
}
