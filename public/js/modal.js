// Watchlist Selection Modal

let selectedWatchlistId = null;
let resolveModalPromise = null;

// Show the watchlist selection modal
const showWatchlistModal = (watchlists, currentWatchlistId = null) => {
  return new Promise((resolve) => {
    resolveModalPromise = resolve;
    
    const modal = document.getElementById('watchlist-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalDescription = document.getElementById('modal-description');
    const watchlistList = document.getElementById('watchlist-list');
    const cancelButton = document.getElementById('modal-cancel');
    
    // Set translated text
    modalTitle.textContent = window.i18n.t('modalTitle');
    modalDescription.textContent = window.i18n.t('modalDescription');
    cancelButton.textContent = window.i18n.t('cancelButton');
    
    // Populate watchlist list
    populateWatchlistList(watchlists, currentWatchlistId);
    
    // Show modal
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    
    // Focus first watchlist item or the selected one
    const selectedItem = currentWatchlistId
      ? watchlistList.querySelector(`[data-watchlist-id="${currentWatchlistId}"]`)
      : watchlistList.querySelector('.watchlist-item');
    if (selectedItem) {
      selectedItem.focus();
    }
  });
};

// Hide the modal
const hideWatchlistModal = () => {
  const modal = document.getElementById('watchlist-modal');
  modal.classList.add('hidden');
  document.body.style.overflow = '';
  selectedWatchlistId = null;
};

// Populate the watchlist list
const populateWatchlistList = (watchlists, currentWatchlistId = null) => {
  const watchlistList = document.getElementById('watchlist-list');
  watchlistList.innerHTML = '';
  
  watchlists.forEach((watchlist, index) => {
    const item = document.createElement('div');
    item.className = 'watchlist-item';
    item.tabIndex = 0;
    item.setAttribute('role', 'button');
    item.setAttribute('data-watchlist-id', watchlist.id);
    
    const radio = document.createElement('input');
    radio.type = 'radio';
    radio.name = 'watchlist';
    radio.id = `watchlist-${watchlist.id}`;
    radio.value = watchlist.id;
    
    // Pre-select the current watchlist if provided, otherwise select the first one
    const shouldSelect = currentWatchlistId
      ? watchlist.id === currentWatchlistId
      : index === 0;
    
    if (shouldSelect) {
      radio.checked = true;
      selectedWatchlistId = watchlist.id;
    }
    
    const label = document.createElement('label');
    label.htmlFor = `watchlist-${watchlist.id}`;
    
    const nameSpan = document.createElement('span');
    nameSpan.className = 'watchlist-name';
    nameSpan.textContent = watchlist.name;
    
    const descSpan = document.createElement('span');
    descSpan.className = 'watchlist-description';
    descSpan.textContent = watchlist.description || '';
    
    label.appendChild(nameSpan);
    if (watchlist.description) {
      label.appendChild(descSpan);
    }
    
    item.appendChild(radio);
    item.appendChild(label);
    
    // Click handler
    item.addEventListener('click', () => {
      radio.checked = true;
      selectedWatchlistId = watchlist.id;
      handleWatchlistSelection(watchlist.id);
    });
    
    // Keyboard handler
    item.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        radio.checked = true;
        selectedWatchlistId = watchlist.id;
        handleWatchlistSelection(watchlist.id);
      }
    });
    
    // Radio change handler
    radio.addEventListener('change', () => {
      selectedWatchlistId = watchlist.id;
    });
    
    watchlistList.appendChild(item);
  });
};

// Handle watchlist selection
const handleWatchlistSelection = (watchlistId) => {
  if (resolveModalPromise) {
    resolveModalPromise(watchlistId);
    resolveModalPromise = null;
  }
  hideWatchlistModal();
};

// Initialize modal event listeners
const initModalEventListeners = () => {
  const modal = document.getElementById('watchlist-modal');
  const overlay = modal.querySelector('.watchlist-modal-overlay');
  const cancelButton = document.getElementById('modal-cancel');
  
  // Cancel button
  cancelButton.addEventListener('click', () => {
    // If user cancels, use the first selected watchlist
    if (selectedWatchlistId && resolveModalPromise) {
      resolveModalPromise(selectedWatchlistId);
      resolveModalPromise = null;
    }
    hideWatchlistModal();
  });
  
  // Overlay click to close
  overlay.addEventListener('click', () => {
    if (selectedWatchlistId && resolveModalPromise) {
      resolveModalPromise(selectedWatchlistId);
      resolveModalPromise = null;
    }
    hideWatchlistModal();
  });
  
  // ESC key to close
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
      if (selectedWatchlistId && resolveModalPromise) {
        resolveModalPromise(selectedWatchlistId);
        resolveModalPromise = null;
      }
      hideWatchlistModal();
    }
  });
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initModalEventListeners);
} else {
  initModalEventListeners();
}

// Export functions
window.watchlistModal = {
  show: showWatchlistModal,
  hide: hideWatchlistModal
};