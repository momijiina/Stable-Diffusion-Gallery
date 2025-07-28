// Global variables
let imagesData = [];
let keywordsData = {};
let filteredImages = [];

// DOM elements
const galleryGrid = document.getElementById('galleryGrid');
const searchInput = document.getElementById('searchInput');
const clearSearch = document.getElementById('clearSearch');
const modelFilter = document.getElementById('modelFilter');
const sortBy = document.getElementById('sortBy');
const imageCount = document.getElementById('imageCount');
const navButtons = document.querySelectorAll('.nav-btn');
const tabContents = document.querySelectorAll('.tab-content');
const imageModal = document.getElementById('imageModal');
const modalBackdrop = document.getElementById('modalBackdrop');
const modalClose = document.getElementById('modalClose');

// Initialize app
document.addEventListener('DOMContentLoaded', async () => {
    await loadData();
    setupEventListeners();
    renderGallery();
    populateModelSelects();
});

// Load data from JSON files
async function loadData() {
    try {
        const [imagesResponse, keywordsResponse] = await Promise.all([
            fetch('data/images.json'),
            fetch('data/keywords.json')
        ]);

        const imagesJson = await imagesResponse.json();
        const keywordsJson = await keywordsResponse.json();

        imagesData = imagesJson.images || [];
        keywordsData = keywordsJson.keywords || {};

        filteredImages = [...imagesData];
    } catch (error) {
        console.error('Error loading data:', error);
        showError('データの読み込みに失敗しました');
    }
}

// Setup event listeners
function setupEventListeners() {
    // Navigation
    navButtons.forEach(btn => {
        btn.addEventListener('click', () => switchTab(btn.dataset.tab));
    });

    // Search
    searchInput.addEventListener('input', debounce(handleSearch, 300));
    clearSearch.addEventListener('click', clearSearchInput);
    modelFilter.addEventListener('change', handleSearch);
    sortBy.addEventListener('change', handleSearch);

    // Modal
    modalBackdrop.addEventListener('click', closeModal);
    modalClose.addEventListener('click', closeModal);
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeModal();
    });
}

// Switch tabs
function switchTab(tabName) {
    navButtons.forEach(btn => btn.classList.remove('active'));
    tabContents.forEach(content => content.classList.remove('active'));

    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    document.getElementById(`${tabName}-tab`).classList.add('active');
}

// Debounce function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Handle search
function handleSearch() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    const selectedModel = modelFilter.value;
    const sortOption = sortBy.value;

    // Filter images
    filteredImages = imagesData.filter(image => {
        // Model filter
        if (selectedModel && image.model_name !== selectedModel) {
            return false;
        }

        // Search filter
        if (searchTerm) {
            // Search in Japanese tags
            const tagMatch = image.tags.some(tag => 
                tag.toLowerCase().includes(searchTerm)
            );

            // Search in English prompts using keyword mapping
            const englishKeywords = getEnglishKeywords(searchTerm);
            const promptMatch = englishKeywords.some(keyword =>
                image.prompt.toLowerCase().includes(keyword.toLowerCase()) ||
                image.negative_prompt.toLowerCase().includes(keyword.toLowerCase())
            );

            // Search in title
            const titleMatch = image.title.toLowerCase().includes(searchTerm);

            if (!tagMatch && !promptMatch && !titleMatch) {
                return false;
            }
        }

        return true;
    });

    // Sort images
    sortImages(sortOption);

    // Render filtered results
    renderGallery();
}

// Get English keywords from Japanese search term
function getEnglishKeywords(japaneseText) {
    const keywords = [];
    
    // Direct keyword mapping
    Object.keys(keywordsData).forEach(japaneseKey => {
        if (japaneseText.includes(japaneseKey)) {
            keywords.push(...keywordsData[japaneseKey]);
        }
    });

    // If no mapping found, use the search term as is
    if (keywords.length === 0) {
        keywords.push(japaneseText);
    }

    return keywords;
}

// Sort images
function sortImages(sortOption) {
    switch (sortOption) {
        case 'newest':
            filteredImages.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            break;
        case 'oldest':
            filteredImages.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
            break;
        case 'title':
            filteredImages.sort((a, b) => a.title.localeCompare(b.title));
            break;
    }
}

// Clear search input
function clearSearchInput() {
    searchInput.value = '';
    handleSearch();
}

// Handle tag click for search
function handleTagClick(tag) {
    searchInput.value = tag;
    handleSearch();
    // Switch to gallery tab if not already there
    switchTab('gallery');
}

// Render gallery
function renderGallery() {
    imageCount.textContent = filteredImages.length;

    if (filteredImages.length === 0) {
        galleryGrid.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-search"></i>
                <h3>画像が見つかりません</h3>
                <p>検索条件を変更してお試しください</p>
            </div>
        `;
        return;
    }

    galleryGrid.innerHTML = filteredImages.map(image => `
        <div class="gallery-item" onclick="openModal('${image.id}')">
            <img src="images/${image.filename}" alt="${image.title}" class="gallery-item-image" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMDAgNzBDOTQuNDc3MiA3MCA5MCA3NC40NzcyIDkwIDgwVjEyMEM5MCAxMjUuNTIzIDk0LjQ3NzIgMTMwIDEwMCAxMzBIMTQwQzE0NS41MjMgMTMwIDE1MCAxMjUuNTIzIDE1MCAxMjBWODBDMTUwIDc0LjQ3NzIgMTQ1LjUyMyA3MCA1MCA3MEgxMDBaIiBmaWxsPSIjRDFENUQ5Ii8+CjxwYXRoIGQ9Ik0xMTAgOTBDMTA1LjAyOSA5MCA5NSA5NC45NzA2IDk1IDEwMEM5NSAxMDUuMDI5IDEwNS4wMjkgMTEwIDExMCAxMTBDMTE0Ljk3MSAxMTAgMTI1IDEwNS4wMjkgMTI1IDEwMEMxMjUgOTQuOTcwNiAxMTQuOTcxIDkwIDExMCA5MFoiIGZpbGw9IiM5Q0EzQUYiLz4KPC9zdmc+Cg=='">
            <div class="gallery-item-content">
                <h3 class="gallery-item-title">${image.title}</h3>
                <div class="gallery-item-model">${image.model_name}</div>
                <p class="gallery-item-prompt">${image.prompt}</p>
                <div class="gallery-item-tags">
                    ${image.tags.map(tag => `<span class="tag clickable-tag" onclick="event.stopPropagation(); handleTagClick('${tag}')">${tag}</span>`).join('')}
                </div>
            </div>
        </div>
    `).join('');
}

// Populate model selects
function populateModelSelects() {
    const uniqueModels = [...new Set(imagesData.map(image => image.model_name))];
    const modelOptions = uniqueModels.map(modelName => 
        `<option value="${modelName}">${modelName}</option>`
    ).join('');

    modelFilter.innerHTML = '<option value="">すべてのモデル</option>' + modelOptions;
}

// Open image modal
function openModal(imageId) {
    const image = imagesData.find(img => img.id === imageId);
    if (!image) return;

    document.getElementById('modalTitle').textContent = image.title;
    document.getElementById('modalImage').src = `images/${image.filename}`;
    document.getElementById('modalPrompt').textContent = image.prompt;
    document.getElementById('modalNegativePrompt').textContent = image.negative_prompt || 'なし';
    
    // Enhanced model information display
    const modelInfo = `
        <div class="model-detail">
            <strong>${image.model_name}</strong> (${image.architecture})<br>
            <span class="model-specialty">${image.specialty || 'モデル情報'}</span><br>
            <small>解像度: ${image.base_resolution || 'N/A'}</small>
        </div>
    `;
    
    document.getElementById('modalModel').innerHTML = modelInfo;

    // Parameters
    const parametersGrid = document.getElementById('modalParameters');
    parametersGrid.innerHTML = `
        <div class="parameter-item">
            <div class="parameter-label">Steps</div>
            <div class="parameter-value">${image.parameters.steps}</div>
        </div>
        <div class="parameter-item">
            <div class="parameter-label">CFG Scale</div>
            <div class="parameter-value">${image.parameters.cfg_scale}</div>
        </div>
        <div class="parameter-item">
            <div class="parameter-label">Seed</div>
            <div class="parameter-value">${image.parameters.seed}</div>
        </div>
        <div class="parameter-item">
            <div class="parameter-label">Sampler</div>
            <div class="parameter-value">${image.parameters.sampler}</div>
        </div>
    `;

    // Tags with click functionality
    const tagsContainer = document.getElementById('modalTags');
    tagsContainer.innerHTML = image.tags.map(tag => 
        `<span class="tag clickable-tag" onclick="handleTagClick('${tag}'); closeModal();">${tag}</span>`
    ).join('');

    imageModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Close image modal
function closeModal() {
    imageModal.classList.remove('active');
    document.body.style.overflow = '';
}

// Show error message
function showError(message) {
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #ef4444;
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        font-weight: 500;
    `;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 5000);
}
