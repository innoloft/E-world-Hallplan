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
    
    // Add create watchlist option
    addCreateWatchlistOption();
    
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

// Add "Create New Watchlist" option to the modal
const addCreateWatchlistOption = () => {
  const watchlistList = document.getElementById('watchlist-list');
  
  // Create container for new watchlist form
  const createContainer = document.createElement('div');
  createContainer.className = 'create-watchlist-container';
  createContainer.id = 'create-watchlist-container';
  
  // Create toggle button
  const toggleButton = document.createElement('button');
  toggleButton.className = 'create-watchlist-toggle';
  toggleButton.type = 'button';
  toggleButton.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20">
      <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
    </svg>
    <span>${window.i18n.t('createNewWatchlist')}</span>
  `;
  
  // Create form (initially hidden)
  const form = document.createElement('div');
  form.className = 'create-watchlist-form hidden';
  form.id = 'create-watchlist-form';
  form.innerHTML = `
    <input
      type="text"
      id="new-watchlist-name"
      class="watchlist-name-input"
      placeholder="${window.i18n.t('watchlistNamePlaceholder')}"
      maxlength="100"
    />
    <div class="create-watchlist-actions">
      <button type="button" class="btn-create-confirm">${window.i18n.t('createButton')}</button>
      <button type="button" class="btn-create-cancel">${window.i18n.t('cancelButton')}</button>
    </div>
  `;
  
  createContainer.appendChild(toggleButton);
  createContainer.appendChild(form);
  watchlistList.appendChild(createContainer);
  
  // Toggle form visibility
  toggleButton.addEventListener('click', () => {
    const isHidden = form.classList.contains('hidden');
    form.classList.toggle('hidden');
    if (isHidden) {
      document.getElementById('new-watchlist-name').focus();
    }
  });
  
  // Handle form submission
  const confirmButton = form.querySelector('.btn-create-confirm');
  const cancelButton = form.querySelector('.btn-create-cancel');
  const nameInput = form.querySelector('#new-watchlist-name');
  
  confirmButton.addEventListener('click', async () => {
    const name = nameInput.value.trim();
    if (name) {
      await handleCreateWatchlist(name);
    }
  });
  
  cancelButton.addEventListener('click', () => {
    form.classList.add('hidden');
    nameInput.value = '';
  });
  
  // Handle Enter key in input
  nameInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const name = nameInput.value.trim();
      if (name) {
        handleCreateWatchlist(name);
      }
    }
  });
};

// Handle creating a new watchlist
const handleCreateWatchlist = async (name) => {
  // This will be called from modal.js but needs access to handler.js functions
  // We'll expose a callback function from handler.js
  if (window.createWatchlistCallback) {
    const newWatchlistId = await window.createWatchlistCallback(name);
    if (newWatchlistId) {
      handleWatchlistSelection(newWatchlistId);
    }
  }
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