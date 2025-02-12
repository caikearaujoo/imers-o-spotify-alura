const searchInput = document.getElementById('search-input');
const resultArtist = document.getElementById("result-artist");
const resultPlaylist = document.getElementById('result-playlists');
//OBSERVACAO: ATIVAR A API ANTES DE TENTAR RODAR json-server --watch api-artists/artists.json --port 3000
function requestApi(searchTerm) {
    const url = `http://localhost:3000/artists?name_like=${searchTerm}`;
    fetch(url)
        .then((response) => response.json())
        .then((result) => displayResults(result, searchTerm));
}

function updateFavoriteButtons() {
    document.querySelectorAll(".favorite-btn").forEach(button => {
        button.addEventListener("click", function (event) {
            event.stopPropagation(); // Evita interferências de outros elementos
            console.log("Clicou no botão de favorito!"); // Confirma que o clique foi detectado
            
            const card = this.closest(".artist-card"); // Pegamos o card mais próximo
            if (!card) {
                console.error("Elemento .artist-card não encontrado.");
                return;
            }

            const artistId = card.getAttribute("data-artist-id"); // Pegamos o ID do artista
            const artistData = JSON.parse(this.getAttribute("data-artist-data") || "{}"); // Pegamos os dados do artista
            
            if (artistId) {
                toggleFavorite(artistId, artistData);
            } else {
                console.warn("Erro: ID do artista não encontrado");
            }
        });
    });
}

// Chame essa função sempre que novos artistas forem carregados
function displayResults(result, searchTerm) {
    resultPlaylist.classList.add("hidden");
    const gridContainer = document.querySelector(".grid-container");
    gridContainer.innerHTML = ""; // Limpa os resultados anteriores

    result.forEach(artist => {
        const artistCard = document.createElement("div");
        artistCard.classList.add("artist-card");
        artistCard.setAttribute("data-artist-id", artist.id);

        artistCard.innerHTML = `
            <div class="card-img">
                <img class="artist-img" src="${artist.urlImg}" />
                <button class="favorite-btn" data-artist-data='${JSON.stringify(artist)}'>
                    <i class="far fa-heart"></i>
                </button>
            </div>
            <div class="card-text">
                <span class="artist-name">${artist.name}</span>
                <span class="artist-categorie">Artista</span>
            </div>
        `;

        gridContainer.appendChild(artistCard);
    });

    updateFavoriteButtons(); // Atualiza os eventos dos botões de favoritos

    resultArtist.classList.remove("hidden");
}

document.addEventListener('input', function () {
    const searchTerm = searchInput.value.toLowerCase().trim();

    if (searchTerm === '') {
        resultPlaylist.classList.remove('hidden');
        resultArtist.classList.add('hidden');
        return;
    }

    requestApi(searchTerm);
});

const FAVORITES_KEY = 'spotify-favorites';

function getFavorites() {
    return JSON.parse(localStorage.getItem(FAVORITES_KEY) || '[]');
}

function saveFavorites(favorites) {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
}

function toggleFavorite(artistId, artistData) {
    if (!artistId || !artistData) {
        console.error("Dados do artista ausentes.");
        return;
    }

    let favorites = getFavorites();
    const index = favorites.findIndex(fav => fav.id === artistId);

    if (index === -1) {
        favorites.push(artistData);
    } else {
        favorites.splice(index, 1);
    }

    saveFavorites(favorites);
    updateFavoriteButton(artistId); // Atualiza o ícone do botão
    updateFavoritesSidebar(); // Atualiza a lista na sidebar
}

function updateFavoriteButton(artistId) {
    const favorites = getFavorites();
    document.querySelectorAll(`[data-artist-id="${artistId}"] .favorite-btn i`).forEach(button => {
        button.className = favorites.some(fav => fav.id === artistId) 
            ? 'fas fa-heart'  // Coração preenchido (favoritado)
            : 'far fa-heart';  // Coração vazio
    });
}

function createFavoritesSidebar() {
    const favorites = getFavorites();
    const sidebarList = document.createElement('div');
    sidebarList.className = 'favorites-list';
    
    // Cria um item na sidebar para cada favorito
    favorites.forEach(fav => {
        const item = document.createElement('div');
        item.className = 'favorite-item';
        item.innerHTML = `
            <img src="${fav.urlImg}" alt="${fav.name}" />
            <span>${fav.name}</span>
            <button onclick="toggleFavorite('${fav.id}', null)">
                <i class="fas fa-heart"></i>
            </button>
        `;
        sidebarList.appendChild(item);
    });
    
    return sidebarList;
}

function updateFavoritesSidebar() {
    const sidebarContainer = document.querySelector('.favorites-list-container');
    const oldList = document.querySelector('.favorites-list');
    if (oldList) oldList.remove();  // Remove a lista antiga se existir

    const newList = createFavoritesSidebar();  // Cria nova lista
    sidebarContainer.appendChild(newList);  // Adiciona a nova lista
}

document.addEventListener("DOMContentLoaded", function () {
    updateFavoritesSidebar();
    document.querySelectorAll(".favorite-btn").forEach(button => {
        button.addEventListener("click", function (event) {
            event.stopPropagation(); // Impede que clique em outros elementos interfira

            const card = this.closest(".artist-card"); // Alterado para .artist-card
            if (!card) {
                console.error("Elemento .artist-card não encontrado.");
                return;
            }

            const artistId = card.getAttribute("data-artist-id");
            const artistData = JSON.parse(this.getAttribute("data-artist-data") || "{}");

            console.log("artistId:", artistId);
            console.log("artistData:", artistData);

            toggleFavorite(artistId, artistData);
        });
    });
});

document.getElementById('favorites-button').addEventListener('click', function() {
    const favoritesContainer = document.querySelector('.favorites-list-container');
    favoritesContainer.classList.toggle('hidden'); // Alterna a visibilidade
    updateFavoritesSidebar(); // Atualiza a lista de favoritos
});