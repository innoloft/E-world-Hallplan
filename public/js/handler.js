const urlParams = new URLSearchParams(window.location.search);

// Config
let API_URL = "https://api.innoloft.com";
let APP_ID = "8085445";
if (urlParams.get("env") === "dev") {
  API_URL = "https://testing.api.innoloft.com";
  APP_ID = "7648562";
}
const watchlistName = "Hallenplan (2026 - automatisch erstellt)";
const watchlistLabel = "hallplan-2026";

const token = urlParams.get("token");

let watchlistId = null;
let favorites = [];

// LocalStorage key for watchlist preference
const STORAGE_KEY = 'hallplan_watchlist_preference';

// LocalStorage utility functions
const getStoredWatchlistId = () => {
  return localStorage.getItem(STORAGE_KEY);
};

const setStoredWatchlistId = (id) => {
  localStorage.setItem(STORAGE_KEY, id);
};

const clearStoredWatchlistId = () => {
  localStorage.removeItem(STORAGE_KEY);
};

InforoMap.on("app/ready", async function (e) {
  if (!token) {
    //Do not load favorites if not logged in
    // alert(
    //   "Bitte loggen Sie sich ein, damit die Merkliste gespeichert werden kann."
    // );
    return;
  }
  watchlistId = await getHallplanWatchlistId();
  favorites = await getFavorites(watchlistId, 0);
  const favoritesEntryIds = favorites
    .filter((entry) => entry.entity.type === "organization")
    .map((entry) => entry.entity.id);
  InforoMap.api.initFavorites(favoritesEntryIds);
});

// Validate that a watchlist ID still exists
const validateWatchlistId = async (id) => {
  try {
    const response = await fetch(`${API_URL}/watchlists/${id}`, {
      headers: {
        appId: APP_ID,
        Authorization: `Bearer ${token}`,
      },
    });
    return response.ok;
  } catch {
    return false;
  }
};

const getHallplanWatchlistId = async () => {
  // 1. Check localStorage first
  const storedId = getStoredWatchlistId();
  if (storedId) {
    const isValid = await validateWatchlistId(storedId);
    if (isValid) {
      console.log('Using stored watchlist preference:', storedId);
      showSettingsButton();
      return storedId;
    }
    // If invalid, clear storage and continue
    console.warn('Stored watchlist ID is invalid, clearing preference');
    clearStoredWatchlistId();
  }

  let watchlists;

  // 2. Fetch watchlists
  try {
    const response = await fetch(API_URL + `/watchlists`, {
      headers: {
        appId: APP_ID,
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await response.json();
    checkExpired(data);

    // Filter watchlists with the addEntry and removeEntry actions ("actions": ["edit", "share", "delete", "addEntry", "removeEntry"])
    watchlists = data.filter(
      (w) =>
        w.actions &&
        w.actions.includes("addEntry") &&
        w.actions.includes("removeEntry")
    );

    // watchlists = data.filter((w) => w.labels && w.labels.includes(watchlistLabel));

    // 3. Handle multiple watchlists - show modal
    if (watchlists.length > 1) {
      const selectedId = await window.watchlistModal.show(watchlists);
      setStoredWatchlistId(selectedId);
      showSettingsButton();
      return selectedId;
    }

    // 4. Single watchlist found
    if (watchlists.length === 1) {
      return watchlists[0].id;
    }
  } catch (error) {
    console.error("Error fetching watchlists:", error);
    return null;
  }

  // 5. Create watchlist if none exist
  try {
    const response = await fetch(API_URL + "/watchlists", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        appId: APP_ID,
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: watchlistName,
        icon: "star",
        description: "Automatisch generierte Watchlist für den Hallenplan",
        labels: [watchlistLabel]
      }),
    });
    const data = await response.json();
    checkExpired(data);
    return data.id || data.watchlistId;
  } catch (error) {
    console.error("Error creating watchlist:", error);
  }
};

const getFavorites = async (watchlistId, offset) => {
  let favorites = [];
  if (!watchlistId) {
    return favorites;
  }

  try {
    const response = await fetch(
      API_URL + `/watchlists/${watchlistId}/entries?limit=25&offset=${offset}`,
      {
        headers: {
          appId: APP_ID,
          Authorization: `Bearer ${token}`,
        },
      }
    );
    const data = await response.json();
    checkExpired(data);
    const headers = response.headers.get("amount-all");
    if (headers > data.length + offset) {
      const nextFavorites = await getFavorites(
        watchlistId,
        data.length + offset
      );
      favorites = data.concat(nextFavorites);
    } else {
      favorites = data;
    }
  } catch (error) {
    console.error("Error fetching watchlist entries:", error);
  }

  return favorites;
};

const addFavorites = async (exhibitorId) => {
  if (!watchlistId) {
    return;
  }
  const object = { entity: { id: exhibitorId, type: "organization" } };
  try {
    const response = await fetch(
      API_URL + `/watchlists/${watchlistId}/entries`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          appId: APP_ID,
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(object),
      }
    );
    const data = await response.json();
    checkExpired(data);
    object.id = data.id;
    if (!favorites.find((entry) => entry.entity.id === object.entity.id)) {
      favorites.push(object);
    }
  } catch (error) {
    console.error("Error adding exhibitor to watchlist:", error);
  }
};

const removeFavorites = async (exhibitorId) => {
  if (!watchlistId) {
    return;
  }
  const entry = favorites.find(
    (entry) =>
      entry.entity.id == exhibitorId && entry.entity.type === "organization"
  );
  if (!entry) {
    return;
  }

  const entryId = entry.id;

  try {
    const response = await fetch(
      API_URL + `/watchlists/${watchlistId}/entries/${entryId}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          appId: APP_ID,
          Authorization: `Bearer ${token}`,
        },
      }
    );
    const status = response.status;
    if (status === 204) {
      favorites = favorites.filter((entry) => entry.id !== entryId);
      return;
    }
    const data = await response.json();
    checkExpired(data);
  } catch (error) {
    console.error("Error removing exhibitor from watchlist:", error);
  }
};

const checkExpired = (response) => {
  if (response.message === "token_expired") {
    reloadParent("Sitzung abgelaufen. Seite wird neu geladen.");
  }
};

const reloadParent = (message) => {
  alert(message);
  throw new Error(message);
  // window.parent.location.reload();
};

window.addFavorites = addFavorites;
window.removeFavorites = removeFavorites;


// Settings button functionality
const showSettingsButton = () => {
  const settingsButton = document.getElementById('settings-button');
  if (settingsButton) {
    settingsButton.classList.remove('hidden');
    // Set tooltip text based on language
    settingsButton.setAttribute('title', window.i18n.t('settingsTooltip'));
  }
};

const hideSettingsButton = () => {
  const settingsButton = document.getElementById('settings-button');
  if (settingsButton) {
    settingsButton.classList.add('hidden');
  }
};

// Initialize settings button event listener
const initSettingsButton = () => {
  const settingsButton = document.getElementById('settings-button');
  if (settingsButton) {
    settingsButton.addEventListener('click', async () => {
      // Fetch watchlists and show modal with current selection
      try {
        const response = await fetch(API_URL + `/watchlists?label=${watchlistLabel}`, {
          headers: {
            appId: APP_ID,
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        checkExpired(data);
        
        const watchlists = data.filter((w) => w.labels && w.labels.includes(watchlistLabel));
        
        if (watchlists.length > 1) {
          const currentWatchlistId = getStoredWatchlistId();
          const selectedId = await window.watchlistModal.show(watchlists, currentWatchlistId);
          setStoredWatchlistId(selectedId);
          location.reload();
        }
      } catch (error) {
        console.error("Error fetching watchlists:", error);
      }
    });
  }
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initSettingsButton);
} else {
  initSettingsButton();
}
