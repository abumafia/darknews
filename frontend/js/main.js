document.addEventListener('DOMContentLoaded', async function() {
  const newsContainer = document.getElementById('news-container');
  const searchInput = document.getElementById('search-input');
  const searchResults = document.getElementById('search-results');
  
  // Load articles
  async function loadArticles() {
    try {
      const response = await fetch('http://localhost:3000/api/articles');
      if (!response.ok) throw new Error('Network response was not ok');
      return await response.json();
    } catch (error) {
      console.error('Error loading articles:', error);
      throw error;
    }
  }

  // Display articles
  async function displayArticles() {
    try {
      const articles = await loadArticles();
      
      if (articles.length === 0) {
        newsContainer.innerHTML = `
          <div class="glass-card col-span-full text-center py-12">
            <i class="fas fa-newspaper text-3xl text-gray-400 mb-3"></i>
            <p class="text-gray-300">Hozircha yangiliklar mavjud emas.</p>
          </div>
        `;
        return;
      }
      
      newsContainer.innerHTML = articles.map(article => `
        <div class="bg-black glass-card rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <div class="bg-black p-6">
            <h2 class="text-green-500 text-xl font-bold mb-2">${article.title}</h2>
            <p class="text-gray-300 mb-4 line-clamp-3">${article.content}</p>
            
            <div class="flex items-center justify-between pt-3 border-t border-gray-700">
              <a href="news.html?id=${article.id}" class="text-blue-400 hover:text-blue-300 text-sm font-medium">
                Batafsil o'qish
              </a>
              
              <button onclick="handleLike(${article.id}, this)" 
                      class="flex items-center space-x-1 ${article.likes > 0 ? 'text-red-500' : 'text-gray-400'} hover:text-red-400">
                <i class="far fa-heart"></i>
                <span>${article.likes}</span>
              </button>
            </div>
          </div>
        </div>
      `).join('');
    } catch (error) {
      newsContainer.innerHTML = `
        <div class="glass-card col-span-full text-center py-12">
          <i class="fas fa-exclamation-triangle text-3xl text-red-400 mb-3"></i>
          <p class="text-red-400">Yangiliklarni yuklashda xatolik yuz berdi</p>
          <button onclick="location.reload()" class="mt-3 px-4 py-2 bg-blue-600/80 hover:bg-blue-700/80 rounded text-white">
            Qayta urinish
          </button>
        </div>
      `;
    }
  }

  // Search function
  async function performSearch(query) {
    try {
      searchResults.innerHTML = `
        <div class="p-4 flex items-center justify-center">
          <i class="fas fa-spinner fa-spin text-blue-400 mr-2"></i>
          <span class="text-gray-300">Qidirilmoqda...</span>
        </div>
      `;
      searchResults.classList.remove('hidden');

      const response = await fetch(`http://localhost:3000/api/articles/search?q=${encodeURIComponent(query)}`);
      if (!response.ok) throw new Error('Search failed');
      const results = await response.json();

      if (results.length === 0) {
        searchResults.innerHTML = `
          <div class="p-4 text-center text-gray-400">
            <i class="far fa-frown text-lg"></i>
            <p class="mt-2">Hech narsa topilmadi</p>
          </div>
        `;
      } else {
        searchResults.innerHTML = results.map(article => `
          <a href="news.html?id=${article.id}" class="block p-3 hover:bg-gray-800/80 border-b border-gray-700/50 transition-colors">
            <h3 class="font-medium text-white">${article.title}</h3>
            <p class="text-sm text-gray-300 mt-1 truncate">${article.excerpt}</p>
            <div class="flex items-center mt-2 text-xs text-blue-400">
              <span>${new Date(article.createdAt).toLocaleDateString()}</span>
              <span class="mx-2">•</span>
              <span>${article.views} ko'rish</span>
            </div>
          </a>
        `).join('');
      }
    } catch (error) {
      searchResults.innerHTML = `
        <div class="p-4 text-center text-red-400">
          <i class="fas fa-exclamation-triangle mr-2"></i>
          <span>Qidiruvda xatolik yuz berdi</span>
        </div>
      `;
    }
  }

  // Debounce function
  function debounce(func, delay) {
    let timeoutId;
    return function(...args) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
  }

  // Event listeners
  searchInput.addEventListener('input', debounce((e) => {
    const query = e.target.value.trim();
    if (query.length >= 2) {
      performSearch(query);
    } else {
      searchResults.classList.add('hidden');
      searchResults.innerHTML = '';
    }
  }, 300));

  document.addEventListener('click', (e) => {
    if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
      searchResults.classList.add('hidden');
    }
  });

  searchInput.addEventListener('focus', () => {
    if (searchInput.value.trim().length >= 2 && searchResults.innerHTML !== '') {
      searchResults.classList.remove('hidden');
    }
  });

  // Initial load
  await displayArticles();
});

// Like function
async function handleLike(articleId, button) {
  try {
    const userId = 'user_' + Math.random().toString(36).substr(2, 9);
    const response = await fetch(`http://localhost:3000/api/articles/${articleId}/like`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId })
    });
    
    if (!response.ok) throw new Error('Like failed');
    
    const data = await response.json();
    const icon = button.querySelector('i');
    const likeCount = button.querySelector('span');
    
    likeCount.textContent = data.likes;
    
    if (data.isLiked) {
      button.classList.remove('text-gray-400');
      button.classList.add('text-red-500');
      icon.classList.remove('far');
      icon.classList.add('fas');
    } else {
      button.classList.remove('text-red-500');
      button.classList.add('text-gray-400');
      icon.classList.remove('fas');
      icon.classList.add('far');
    }
  } catch (error) {
    console.error('Like qilishda xatolik:', error);
  }
}