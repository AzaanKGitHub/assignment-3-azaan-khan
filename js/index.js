
// refvars
const searchButton = document.getElementById('search-button');
const favoritesButton = document.getElementById('favorites-button');
const searchTab = document.getElementById('search-tab');
const favoritesTab = document.getElementById('favorites-tab');
//local source of truth for data on the client
let albumsStore = []
// favorites store
let favoritesStore = []

// fetch mockAPI album data
async function appInit() {
   const res = await fetch('https://661c2bd4e7b95ad7fa69dcd5.mockapi.io/api/v1/albums');
   albumsStore = await res.json();
   console.log(albumsStore);
}

// TASK 1 Tab Between Views

searchButton.addEventListener('click', handleSearchTab);
favoritesButton.addEventListener('click', handleFavoritesTab);

function handleSearchTab() {
   searchButton.classList.add('active');
   favoritesButton.classList.remove('active');
   searchTab.classList.remove('d-none');
   favoritesTab.classList.add('d-none');
}

function handleFavoritesTab() {
   favoritesButton.classList.add('active');
   searchButton.classList.remove('active');
   favoritesTab.classList.remove('d-none');
   searchTab.classList.add('d-none');
}

// TASK 2 Search Functionality

document.getElementById('search-form').addEventListener('submit', handleSearch);

// handle search form submission
function handleSearch(e) {
   e.preventDefault();
   const query = document.getElementById('query').value.trim().toLowerCase();  // user input

   if (!query) {
      renderSearchResults([]);  // if empty render an empty result set
      return;
   }

   const filteredAlbums = albumsStore.filter(album =>
      album.artistName.toLowerCase().includes(query) ||
      album.albumName.toLowerCase().includes(query)
   );
   renderSearch(filteredAlbums);
}

// renders the search results 
function renderSearch(albums) {
   const results = document.getElementById('search-results');
   results.innerHTML = '';
   albums.forEach(album => {
      const template = document.createElement('template');
      const rating = album.averageRating || 'N/A';
      template.innerHTML = `
           <li class="list-group-item d-flex justify-content-between align-items-start">
               <div class="ms-2 me-auto">
                   <div class="fw-bold">${album.albumName} <span class="badge bg-primary rounded-pill">${rating}</span></div>
                   <span>${album.artistName}</span>
               </div>
               <button type="button" class="btn btn-success" data-id="${album.id}">Add to Favorites</button>
           </li>
       `.trim();
      const listItem = template.content.firstChild;
      results.appendChild(listItem);
   });

   // Add event listeners to each "Add to Favorites" button after rendering
   results.querySelectorAll('button').forEach(button => {
      button.addEventListener('click', addToFavorites);
   });

   if (albums.length === 0) {
      results.innerHTML = '<li class="list-group-item">No albums found.</li>';
   }
}

// TASK 3 and 5 Add to Favorites Button, Using Mock API to save Album Favorites

// helper function to perform POST requests
async function postRequest(url, data) {
   const headers = new Headers();
   headers.append('Content-Type', 'application/json');
   const requestOptions = {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(data),
      redirect: 'follow'
   };

   const response = await fetch(url, requestOptions);
   return response.json();
}


// Function to handle adding albums to favorites
async function addToFavorites(e) {
   const albumId = e.target.getAttribute('data-id');
   const album = albumsStore.find(album => album.id === albumId);

   if (!album) return; // Safety check to ensure the album exists

   // prevents duplicates 
   if (favoritesStore.some(fav => fav.id === albumId)) {
      console.log('This album is already in your favorites.');
      return;
   }

   // Add to local favorites store
   favoritesStore.push(album);
   console.log(album);

   // TASK 5

   // payload for the POST request
   const payload = {
      id: album.id, // Assuming 'id' is required; adjust according to your API's requirements
      albumName: album.albumName,
      artistName: album.artistName,
      averageRating: album.averageRating
   };

   // Call the postRequest function to sync with the backend
   try {
      const response = await postRequest('https://661c2bd4e7b95ad7fa69dcd5.mockapi.io/api/v1/favorites', payload);
      console.log('Synced with API:', response);
      renderFavorites();
   } catch (error) {
      console.error('Failed to add to favorites:', error);
   }
}

// TASK 4 Displaying Favorite Albums to DOM
function renderFavorites() {
   const favoritesDiv = document.getElementById('favorites');
   if (!favoritesDiv) {
      console.error('Favorites container not found on the page.');
      return;
   }

   favoritesDiv.innerHTML = '';

   // display favoritesStore content 
   favoritesStore.forEach(fav => {
      const favItem = document.createElement('li');
      favItem.className = 'list-group-item d-flex justify-content-between align-items-start';
      favItem.innerHTML = `
           <div class="ms-2 me-auto">
               <div class="fw-bold">${fav.albumName}
                   <span class="badge bg-primary rounded-pill">${fav.averageRating || 'N/A'}</span>
               </div>
               <span>${fav.artistName}</span>
           </div>
           <button type="button" class="btn btn-success" onclick="removeFromFavorites('${fav.id}')">Remove From Favorites</button>
       `;
      favoritesDiv.appendChild(favItem);

      // refvar and event listener for the newly created button 
      const removeButton = favItem.querySelector('button');
      removeButton.addEventListener('click', () => removeFromFavorites(fav.id));
   });
}

function removeFromFavorites(albumId) {
   favoritesStore = favoritesStore.filter(fav => fav.id !== albumId);
   renderFavorites();
}

appInit();