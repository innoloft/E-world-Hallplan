const urlParams = new URLSearchParams(window.location.search);

// Config
let API_URL = "https://api.innoloft.com";
let APP_ID = "8085445";
if (urlParams.get("env") === "dev") {
  API_URL = "https://testing.api.innoloft.com";
  APP_ID = "7648562";
}
const watchlistName = "Hallenplan (2025 - automatisch erstellt)";

const token = urlParams.get("token");

let watchlistId = null;

InforoMap.on("app/ready", async function (e) {
  watchlistId = await getHallplanWatchlistId();
  let favorites = await getFavorites(watchlistId);
  // InforoMap.initFavorites(favorites);
});

const getHallplanWatchlistId = async () => {
  let watchlist;

  try {
    const response = await fetch(API_URL + "/watchlists", {
      headers: {
        appId: APP_ID,
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await response.json();
    checkExpired(data);
    watchlist = data.find((w) => w.name === watchlistName);
    if (watchlist) {
      return watchlist.id;
    }
  } catch (error) {
    console.error("Error fetching watchlists:", error);
    return null;
  }

  // create watchlist with "hallenplan" name
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
      }),
    });
    const data = await response.json();
    checkExpired(data);
    return data.id || data.watchlistId;
  } catch (error) {
    console.error("Error creating watchlist:", error);
  }
};

const getFavorites = async (watchlistId) => {
  let favorites = [];

  try {
    const response = await fetch(
      API_URL + `/watchlists/${watchlistId}/entries`,
      {
        headers: {
          appId: APP_ID,
          Authorization: `Bearer ${token}`,
        },
      }
    );
    const data = await response.json();
    checkExpired(data);
    favorites = data
      .filter((entry) => entry.entity.type === "organization")
      .map((entry) => entry.entity.id);
  } catch (error) {
    console.error("Error fetching watchlist entries:", error);
  }

  return favorites;
};

const addFavorites = async (exhibitorId) => {
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
        body: JSON.stringify({
          entity: {
            id: exhibitorId,
            type: "organization",
          },
        }),
      }
    );
    const data = await response.json();
    checkExpired(data);
  } catch (error) {
    console.error("Error adding exhibitor to watchlist:", error);
  }
};

const removeFavorites = async (exhibitorId) => {
  try {
    const response = await fetch(
      API_URL + `/watchlists/${watchlistId}/entries/${exhibitorId}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          appId: APP_ID,
          Authorization: `Bearer ${token}`,
        },
      }
    );
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
  console.log("RELOAD");
  // window.parent.location.reload();
};

window.addFavorites = addFavorites;
window.removeFavorites = removeFavorites;
