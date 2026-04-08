let currentSrc = "";
let currentPrompt = "";
const history = [];

async function generateImage() {
  const prompt = document.getElementById("prompt").value.trim();
  const size = document.getElementById("size").value;
  const style = document.getElementById("style").value;
  const btn = document.getElementById("genBtn");
  const errMsg = document.getElementById("errMsg");
  const resultBox = document.getElementById("resultBox");
  const actionRow = document.getElementById("actionRow");

  if (!prompt) return;

  errMsg.style.display = "none";
  btn.disabled = true;
  btn.textContent = "Generating...";
  actionRow.style.display = "none";

  resultBox.innerHTML = `
    <div>
      <div class="spinner"></div>
      <p class="loading-text">Creating your image, please wait...</p>
    </div>
  `;

  try {
    const res = await fetch("https://sourov-image-generator.onrender.com/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, size, style })
    });

    const data = await res.json();
    if (!data.image) throw new Error("No image returned");

    currentSrc = data.image;
    currentPrompt = prompt;

    const img = document.createElement("img");
    img.src = currentSrc;
    img.alt = prompt;

    resultBox.innerHTML = "";
    resultBox.appendChild(img);
    actionRow.style.display = "flex";

    addToHistory(currentSrc, prompt);

  } catch (err) {
    resultBox.innerHTML = `
      <div class="placeholder">
        <div class="icon">⚠️</div>
        <p>Could not generate image</p>
      </div>
    `;
    errMsg.style.display = "block";
  }

  btn.disabled = false;
  btn.textContent = "✦ Generate Image";
}

function addToHistory(src, prompt) {
  history.unshift({ src, prompt });
  if (history.length > 6) history.pop();

  const row = document.getElementById("historyRow");
  const card = document.getElementById("historyCard");
  card.style.display = "block";
  row.innerHTML = "";

  history.forEach(item => {
    const img = document.createElement("img");
    img.src = item.src;
    img.className = "thumb";
    img.title = item.prompt;
    img.onclick = () => showThumb(item.src, item.prompt);
    row.appendChild(img);
  });
}

function showThumb(src, prompt) {
  currentSrc = src;
  currentPrompt = prompt;

  const resultBox = document.getElementById("resultBox");
  resultBox.innerHTML = `<img src="${src}" alt="${prompt}" />`;
  document.getElementById("actionRow").style.display = "flex";
  document.getElementById("prompt").value = prompt;
}

function downloadImage() {
  if (!currentSrc) return;
  const a = document.createElement("a");
  a.href = currentSrc;
  a.download = "sourov-generated.png";
  a.target = "_blank";
  a.click();
}

function copyPrompt() {
  if (!currentPrompt) return;
  navigator.clipboard.writeText(currentPrompt).then(() => {
    alert("Prompt copied!");
  });
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("prompt").addEventListener("keydown", e => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      generateImage();
    }
  });
});
