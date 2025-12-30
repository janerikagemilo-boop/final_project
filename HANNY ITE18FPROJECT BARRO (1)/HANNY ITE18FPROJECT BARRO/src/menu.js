import { audioManager } from "./audio.js";
import { createParticles } from "./utils.js";

document.addEventListener("DOMContentLoaded", () => {
  // Initialize audio
  audioManager.init();

  // Create particles
  createParticles(30);

  // Button hover effects
  document.querySelectorAll(".menu-btn").forEach((btn) => {
    btn.addEventListener("mouseenter", () => {
      audioManager.playSound("click");
    });
  });

  // Navigation buttons
  document.getElementById("start-btn").addEventListener("click", () => {
    audioManager.playSound("click");
    window.location.href = "ingame.html";
  });

  document.getElementById("how-to-play-btn").addEventListener("click", () => {
    audioManager.playSound("click");
    window.location.href = "instruction.html";
  });

  document.getElementById("about-btn").addEventListener("click", () => {
    audioManager.playSound("click");
    window.location.href = "about.html";
  });

  document.getElementById("settings-btn").addEventListener("click", () => {
    audioManager.playSound("click");
    // Modal is handled in utils.js
  });

  document.getElementById("exit-btn").addEventListener("click", () => {
    audioManager.playSound("click");
    if (confirm("Are you sure you want to exit?")) {
      // Try to close window, fallback to message
      if (window.history.length > 1) {
        window.history.back();
      } else {
        document.body.innerHTML = "<h1>Thanks for playing!</h1>";
        setTimeout(() => {
          window.close();
        }, 2000);
      }
    }
  });

  // Handle volume slider
  const volumeSlider = document.getElementById("volume-slider");
  if (volumeSlider) {
    volumeSlider.addEventListener("input", (e) => {
      audioManager.setVolume(e.target.value);
    });
  }

  // Add keyboard shortcuts
  document.addEventListener("keydown", (e) => {
    switch (e.key.toLowerCase()) {
      case "1":
      case "s":
        document.getElementById("start-btn").click();
        break;
      case "2":
      case "h":
        document.getElementById("how-to-play-btn").click();
        break;
      case "3":
      case "a":
        document.getElementById("about-btn").click();
        break;
      case "4":
      case "o":
        document.getElementById("settings-btn").click();
        break;
      case "escape":
      case "q":
        document.getElementById("exit-btn").click();
        break;
      case "m":
        audioManager.toggleMute();
        break;
    }
  });

  // Add animation to buttons
  const buttons = document.querySelectorAll(".menu-btn");
  buttons.forEach((btn, index) => {
    btn.style.animationDelay = `${index * 0.1}s`;
  });
});
