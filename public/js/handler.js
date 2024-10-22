const urlParams = new URLSearchParams(window.location.search);
const token = urlParams.get("token");
const favorites = urlParams.get("favorites")?.split(",") || [];

InforoMap.on("app/ready", function (e) {
  // InforoMap.initFavorites(favorites);
});

InforoMap.on("feature/marker-click", function (e) {
  const exhibitor = e.exhibitorId;
  if (favorites.includes(exhibitor)) {
    removeFavorites(exhibitor);
  } else {
    addFavorites(exhibitor);
  }
});

const addFavorites = (exhibitorId) => {
  if (!token) {
    return;
  }

  //todo api call to loftos API to add exhibitor to favorites
};

const removeFavorites = (exhibitorId) => {
  if (!token) {
    return;
  }

  //todo api call to loftos API to remove exhibitor from favorites
};
