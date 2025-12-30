// Utility functions for the game

export function saveGameStats(stats) {
  localStorage.setItem("ticTacToeStats", JSON.stringify(stats));
}

export function loadGameStats() {
  const defaultStats = {
    totalGames: 0,
    xWins: 0,
    oWins: 0,
    draws: 0,
    totalTime: 0,
    history: [],
  };

  const saved = localStorage.getItem("ticTacToeStats");
  return saved ? JSON.parse(saved) : defaultStats;
}

export function saveSettings(settings) {
  localStorage.setItem("ticTacToeSettings", JSON.stringify(settings));
}

export function loadSettings() {
  return JSON.parse(localStorage.getItem("ticTacToeSettings")) || {};
}

export function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs
    .toString()
    .padStart(2, "0")}`;
}

export function animateValue(element, start, end, duration) {
  let startTimestamp = null;
  const step = (timestamp) => {
    if (!startTimestamp) startTimestamp = timestamp;
    const progress = Math.min((timestamp - startTimestamp) / duration, 1);
    element.textContent = Math.floor(progress * (end - start) + start);
    if (progress < 1) {
      window.requestAnimationFrame(step);
    }
  };
  window.requestAnimationFrame(step);
}

export function createParticles(count = 50) {
  const container = document.getElementById("particles");
  if (!container) return;

  container.innerHTML = "";

  for (let i = 0; i < count; i++) {
    const particle = document.createElement("div");
    particle.className = "particle";

    // Random properties
    const size = Math.random() * 10 + 5;
    const posX = Math.random() * 100;
    const duration = Math.random() * 20 + 10;
    const delay = Math.random() * 5;

    particle.style.cssText = `
            width: ${size}px;
            height: ${size}px;
            left: ${posX}%;
            background: hsl(${Math.random() * 360}, 100%, 70%);
            animation-duration: ${duration}s;
            animation-delay: ${delay}s;
        `;

    container.appendChild(particle);
  }
}

export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

export function throttle(func, limit) {
  let inThrottle;
  return function () {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// Initialize utilities when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  // Create background particles
  if (document.getElementById("particles")) {
    createParticles(30);
  }

  // Handle modal functionality
  const settingsModal = document.getElementById("settings-modal");
  if (settingsModal) {
    const closeBtn = settingsModal.querySelector(".close-modal");
    const settingsBtn = document.getElementById("settings-btn");
    const saveBtn = document.getElementById("save-settings");

    if (settingsBtn) {
      settingsBtn.addEventListener("click", () => {
        settingsModal.style.display = "flex";
      });
    }

    if (closeBtn) {
      closeBtn.addEventListener("click", () => {
        settingsModal.style.display = "none";
      });
    }

    if (saveBtn) {
      saveBtn.addEventListener("click", () => {
        const settings = {
          gameMode: document.querySelector('input[name="game-mode"]:checked')
            .value,
          aiDifficulty: document.getElementById("ai-difficulty").value,
          boardStyle: document.querySelector(".style-option.active").dataset
            .style,
          sfxEnabled: document.getElementById("sfx-toggle").checked,
        };

        saveSettings(settings);
        settingsModal.style.display = "none";

        // Show success message
        alert("Settings saved successfully!");
      });
    }

    // Style selector
    document.querySelectorAll(".style-option").forEach((option) => {
      option.addEventListener("click", () => {
        document.querySelectorAll(".style-option").forEach((opt) => {
          opt.classList.remove("active");
        });
        option.classList.add("active");
      });
    });

    // Game mode change handler
    document.querySelectorAll('input[name="game-mode"]').forEach((radio) => {
      radio.addEventListener("change", (e) => {
        const aiSelect = document.getElementById("ai-difficulty");
        aiSelect.disabled = e.target.value !== "pvc";
      });
    });

    // Close modal when clicking outside
    window.addEventListener("click", (e) => {
      if (e.target === settingsModal) {
        settingsModal.style.display = "none";
      }
    });
  }
});
