class AudioManager {
  constructor() {
    this.sounds = {
      background: new Audio("./DXRK.mp3"),
      click: new Audio("./click.mp3"),
      win: new Audio("./winning.mp3"),
      draw: new Audio("./draw.mp3"),
    };

    this.isMuted = localStorage.getItem("muteState") === "true";
    this.volume = parseFloat(localStorage.getItem("volume")) || 0.5;
    this.sfxEnabled = localStorage.getItem("sfxEnabled") !== "false";

    this.init();
  }

  init() {
    // Set initial volume
    Object.values(this.sounds).forEach((sound) => {
      sound.volume = this.volume;
      sound.muted = this.isMuted;
    });

    // Loop background music
    this.sounds.background.loop = true;

    // Try to play background music (autoplay might be blocked)
    this.playBackgroundMusic();

    this.setupEventListeners();
    this.updateUI();
  }

  playBackgroundMusic() {
    if (!this.isMuted) {
      this.sounds.background.play().catch((e) => {
        console.log("Autoplay blocked:", e);
      });
    }
  }

  playSound(soundName) {
    if (!this.sfxEnabled || this.isMuted) return;

    const sound = this.sounds[soundName];
    if (sound) {
      sound.currentTime = 0;
      sound.play().catch((e) => console.log("Sound play failed:", e));
    }
  }

  playWinSound() {
    this.playSound("win");
  }

  playDrawSound() {
    this.playSound("draw");
  }

  toggleMute() {
    this.isMuted = !this.isMuted;

    Object.values(this.sounds).forEach((sound) => {
      sound.muted = this.isMuted;
    });

    localStorage.setItem("muteState", this.isMuted);
    this.updateUI();
  }

  setVolume(volume) {
    this.volume = volume / 100;

    Object.values(this.sounds).forEach((sound) => {
      sound.volume = this.volume;
    });

    localStorage.setItem("volume", this.volume);
  }

  toggleSFX() {
    this.sfxEnabled = !this.sfxEnabled;
    localStorage.setItem("sfxEnabled", this.sfxEnabled);
  }

  updateUI() {
    const icon = document.getElementById("sound-icon");
    const muteBtn = document.getElementById("mute-toggle");

    if (icon) {
      icon.textContent = this.isMuted ? "🔇" : "🔊";
    }

    if (muteBtn) {
      muteBtn.title = this.isMuted ? "Unmute" : "Mute";
    }
  }

  setupEventListeners() {
    // Mute button
    const muteBtn = document.getElementById("mute-toggle");
    if (muteBtn) {
      muteBtn.addEventListener("click", () => this.toggleMute());
    }

    // Volume slider
    const volumeSlider = document.getElementById("volume-slider");
    if (volumeSlider) {
      volumeSlider.value = this.volume * 100;
      volumeSlider.addEventListener("input", (e) => {
        this.setVolume(e.target.value);
      });
    }

    // SFX toggle
    const sfxToggle = document.getElementById("sfx-toggle");
    if (sfxToggle) {
      sfxToggle.checked = this.sfxEnabled;
      sfxToggle.addEventListener("change", () => this.toggleSFX());
    }
  }
}

// Export singleton instance
export const audioManager = new AudioManager();

// Helper functions
export function playSound(soundName) {
  audioManager.playSound(soundName);
}

export function playWinSound() {
  audioManager.playWinSound();
}

export function playDrawSound() {
  audioManager.playDrawSound();
}

export function toggleMute() {
  audioManager.toggleMute();
}
