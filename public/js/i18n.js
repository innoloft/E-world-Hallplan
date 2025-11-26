// i18n Translation System
const translations = {
  en: {
    modalTitle: "Select Watchlist",
    modalDescription: "Multiple watchlists found. Please select one:",
    selectButton: "Select",
    cancelButton: "Cancel",
    settingsTooltip: "Change Watchlist",
    noWatchlistsFound: "No watchlists available",
    loadingWatchlists: "Loading watchlists..."
  },
  de: {
    modalTitle: "Watchliste auswählen",
    modalDescription: "Mehrere Watchlisten gefunden. Bitte wählen Sie eine aus:",
    selectButton: "Auswählen",
    cancelButton: "Abbrechen",
    settingsTooltip: "Watchliste ändern",
    noWatchlistsFound: "Keine Watchlisten verfügbar",
    loadingWatchlists: "Watchlisten werden geladen..."
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