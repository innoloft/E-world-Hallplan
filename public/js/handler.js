const urlParams = new URLSearchParams(window.location.search);
const token = urlParams.get("token");
const favorites = urlParams.get("favorites")?.split(",") || [];

InforoMap.on("app/ready", function (e) {
  // InforoMap.initFavorites(favorites);
});

const addFavorites = (exhibitorId) => {
  console.log("addFavorites", exhibitorId);
  if (!token) {
    return;
  }

  //todo api call to loftos API to add exhibitor to favorites
};

const removeFavorites = (exhibitorId) => {
  console.log("removeFavorites", exhibitorId);
  if (!token) {
    return;
  }

  //todo api call to loftos API to remove exhibitor from favorites
};

window.addFavorites = addFavorites;
window.removeFavorites = removeFavorites;
