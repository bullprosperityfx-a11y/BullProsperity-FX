document.addEventListener("DOMContentLoaded", () => {
  const startButton = document.getElementById("startButton");

  if (startButton) {
    startButton.href = "https://google.com";
    startButton.textContent = "Jetzt starten";
  }
});
