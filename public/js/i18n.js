// i18n Translation System
const translations = {
  en: {
    modalTitle: "Select Watchlist",
    modalDescription: "Please select the watchlist you want to use to store your favorites. You can later check the favorites in your \"My Watchlists\" within the E-world Community.",
    selectButton: "Select",
    cancelButton: "Cancel",
    settingsTooltip: "Change Watchlist",
    noWatchlistsFound: "No watchlists available",
    loadingWatchlists: "Loading watchlists...",
    createNewWatchlist: "Create New Watchlist",
    watchlistNamePlaceholder: "Enter watchlist name...",
    createButton: "Create"
  },
  de: {
    modalTitle: "Watchliste auswählen",
    modalDescription: "Bitte wähle die Watchliste aus, in der die Favoriten gespeichert werden sollen. Du kannst die Favoriten später in \"Meine Watchlists\" innerhalb der E-world Community einsehen.",
    selectButton: "Auswählen",
    cancelButton: "Abbrechen",
    settingsTooltip: "Watchliste ändern",
    noWatchlistsFound: "Keine Watchlisten verfügbar",
    loadingWatchlists: "Watchlisten werden geladen...",
    createNewWatchlist: "Neue Watchliste erstellen",
    watchlistNamePlaceholder: "Watchlisten-Name eingeben...",
    createButton: "Erstellen"
  }
};

// Detect user's language
const getUserLanguage = () => {
  const lang = navigator.language || navigator.userLanguage;
  return lang.startsWith('en') ? 'en' : 'de';
};

// Current language
const currentLanguage = getUserLanguage();

// Get translation
const t = (key) => {
  return translations[currentLanguage][key] || translations.en[key] || key;
};

// Export for use in other files
window.i18n = { t, currentLanguage };