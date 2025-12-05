const STORAGE_KEY = "music-tier-list-v1";

let albums = [];
let state = {
  // id альбома -> tier (или "pool" если внизу)
};

async function loadAlbums() {
  const res = await fetch("albums.json");
  albums = await res.json();
}

function loadState() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    state = JSON.parse(saved);
  } else {
    // по умолчанию все в pool
    albums.forEach(a => {
      state[a.id] = "pool";
    });
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function createAlbumCard(album) {
  const div = document.createElement("div");
  div.className = "album-card";
  div.draggable = true;
  div.dataset.id = album.id;

  div.innerHTML = `
    <img src="${album.cover}" alt="${album.title}" />
    <div class="info">
      <div class="title">${album.title}</div>
      <div class="artist">${album.artist}</div>
      <div class="year">${album.year}</div>
    </div>
  `;

  // drag events
  div.addEventListener("dragstart", (e) => {
    e.dataTransfer.setData("text/plain", album.id);
  });

  return div;
}

function render() {
  const pool = document.getElementById("album-pool");
  pool.innerHTML = "";

  const tierDropzones = document.querySelectorAll(".tier-dropzone");
  tierDropzones.forEach(zone => (zone.innerHTML = ""));

  albums.forEach(album => {
    const card = createAlbumCard(album);
    const tier = state[album.id] || "pool";

    if (tier === "pool") {
      pool.appendChild(card);
    } else {
      const zone = document.querySelector(`.tier[data-tier="${tier}"] .tier-dropzone`);
      if (zone) zone.appendChild(card);
      else pool.appendChild(card);
    }
  });
}

function setupDropzones() {
  const dropzones = document.querySelectorAll(".tier-dropzone");

  dropzones.forEach(zone => {
    zone.addEventListener("dragover", (e) => {
      e.preventDefault();
      zone.classList.add("drag-over");
    });

    zone.addEventListener("dragleave", () => {
      zone.classList.remove("drag-over");
    });

    zone.addEventListener("drop", (e) => {
      e.preventDefault();
      zone.classList.remove("drag-over");

      const id = e.dataTransfer.getData("text/plain");
      if (!id) return;

      const tierElement = zone.closest(".tier");
      const tier = tierElement ? tierElement.dataset.tier : "pool";

      state[id] = tier || "pool";
      saveState();
      render();
    });
  });
}

async function init() {
  await loadAlbums();
  loadState();
  setupDropzones();
  render();

  document.getElementById("reset-btn").addEventListener("click", () => {
    albums.forEach(a => (state[a.id] = "pool"));
    saveState();
    render();
  });

  document.getElementById("save-btn").addEventListener("click", () => {
    saveState();
    alert("Сохранено в этом браузере.");
  });
}

init();