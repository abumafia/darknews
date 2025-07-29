document.addEventListener('DOMContentLoaded', function() {
  // Navigation
  const sections = {
    dashboard: document.getElementById('dashboard'),
    articles: document.getElementById('articles'),
    comments: document.getElementById('comments')
  };

  document.querySelectorAll('nav a').forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const target = this.getAttribute('href').substring(1);
      
      // Hide all sections
      Object.values(sections).forEach(section => {
        section.classList.add('hidden');
      });
      
      // Show target section
      if (sections[target]) {
        sections[target].classList.remove('hidden');
      }
      
      // Load data if needed
      if (target === 'articles') {
        loadArticles();
      } else if (target === 'comments') {
        loadComments();
      }
    });
  });

  // Load dashboard stats
  loadDashboardStats();

  // Article modal
  const addArticleModal = document.getElementById('add-article-modal');
  const addArticleBtn = document.getElementById('add-article-btn');
  const closeModalBtn = document.getElementById('close-modal');
  const cancelArticleBtn = document.getElementById('cancel-article');
  const articleForm = document.getElementById('article-form');

  addArticleBtn.addEventListener('click', () => {
    addArticleModal.classList.remove('hidden');
  });

  closeModalBtn.addEventListener('click', () => {
    addArticleModal.classList.add('hidden');
  });

  cancelArticleBtn.addEventListener('click', () => {
    addArticleModal.classList.add('hidden');
  });

  articleForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const title = document.getElementById('article-title').value;
    const content = document.getElementById('article-content').value;
    
    try {
      const response = await fetch('http://localhost:3000/api/admin/articles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, content })
      });
      
      if (response.ok) {
        const newArticle = await response.json();
        addArticleModal.classList.add('hidden');
        articleForm.reset();
        loadArticles();
        loadDashboardStats();
        
        // Add to recent articles
        addRecentArticle(newArticle);
      } else {
        throw new Error('Failed to add article');
      }
    } catch (error) {
      console.error('Error adding article:', error);
      alert('Xatolik yuz berdi. Yangilik qo\'shib bo\'lmadi.');
    }
  });

  // Load dashboard stats
  async function loadDashboardStats() {
    try {
      const response = await fetch('http://localhost:3000/api/admin/stats');
      const data = await response.json();
      
      document.getElementById('visits-count').textContent = data.visits;
      document.getElementById('articles-count').textContent = data.articlesCount;
      document.getElementById('comments-count').textContent = data.commentsCount;
      
      // Load recent articles
      loadRecentArticles();
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  }

  // Load recent articles
  async function loadRecentArticles() {
    try {
      const response = await fetch('http://localhost:3000/api/articles');
      const articles = await response.json();
      
      const recentArticlesContainer = document.getElementById('recent-articles');
      recentArticlesContainer.innerHTML = '';
      
      const recentArticles = articles.slice(0, 3);
      
      if (recentArticles.length === 0) {
        recentArticlesContainer.innerHTML = '<p class="text-gray-500">Hozircha yangiliklar mavjud emas.</p>';
        return;
      }
      
      recentArticles.forEach(article => {
        const articleEl = document.createElement('div');
        articleEl.className = 'border-b border-gray-200 pb-4 last:border-0 last:pb-0';
        articleEl.innerHTML = `
          <h4 class="font-semibold">${article.title}</h4>
          <p class="text-sm text-gray-500 mt-1 line-clamp-2">${article.content}</p>
          <div class="flex items-center justify-between mt-2 text-sm">
            <span class="text-gray-500">${new Date(article.createdAt || new Date()).toLocaleDateString()}</span>
            <div class="flex items-center space-x-3">
              <span class="flex items-center space-x-1 text-gray-500">
                <i class="fas fa-heart"></i>
                <span>${article.likes}</span>
              </span>
              <span class="flex items-center space-x-1 text-gray-500">
                <i class="fas fa-comment"></i>
                <span>${article.comments.length}</span>
              </span>
            </div>
          </div>
        `;
        recentArticlesContainer.appendChild(articleEl);
      });
    } catch (error) {
      console.error('Error loading recent articles:', error);
    }
  }

  // Add single recent article
  function addRecentArticle(article) {
    const recentArticlesContainer = document.getElementById('recent-articles');
    
    if (recentArticlesContainer.querySelector('.text-gray-500')) {
      recentArticlesContainer.innerHTML = '';
    }
    
    const articleEl = document.createElement('div');
    articleEl.className = 'border-b border-gray-200 pb-4';
    articleEl.innerHTML = `
      <h4 class="font-semibold">${article.title}</h4>
      <p class="text-sm text-gray-500 mt-1 line-clamp-2">${article.content}</p>
      <div class="flex items-center justify-between mt-2 text-sm">
        <span class="text-gray-500">${new Date(article.createdAt || new Date()).toLocaleDateString()}</span>
        <div class="flex items-center space-x-3">
          <span class="flex items-center space-x-1 text-gray-500">
            <i class="fas fa-heart"></i>
            <span>${article.likes}</span>
          </span>
          <span class="flex items-center space-x-1 text-gray-500">
            <i class="fas fa-comment"></i>
            <span>${article.comments.length}</span>
          </span>
        </div>
      </div>
    `;
    
    recentArticlesContainer.insertBefore(articleEl, recentArticlesContainer.firstChild);
    
    // Limit to 3 articles
    if (recentArticlesContainer.children.length > 3) {
      recentArticlesContainer.removeChild(recentArticlesContainer.lastChild);
    }
  }

  // Load all articles for management
  async function loadArticles() {
    try {
      const response = await fetch('http://localhost:3000/api/articles');
      const articles = await response.json();
      
      const articlesTable = document.getElementById('articles-table');
      articlesTable.innerHTML = '';
      
      if (articles.length === 0) {
        articlesTable.innerHTML = `
          <tr>
            <td colspan="6" class="px-6 py-4 text-center text-gray-500">Hozircha yangiliklar mavjud emas</td>
          </tr>
        `;
        return;
      }
      
      articles.forEach(article => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${article.id}</td>
          <td class="px-6 py-4 whitespace-nowrap">
            <div class="text-sm font-medium text-gray-500">${article.title}</div>
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${article.likes}</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${article.comments.length}</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
            ${new Date(article.createdAt || new Date()).toLocaleDateString()}
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
            <button onclick="deleteArticle(${article.id})" class="text-red-600 hover:text-red-900">O'chirish</button>
          </td>
        `;
        articlesTable.appendChild(row);
      });
    } catch (error) {
      console.error('Error loading articles:', error);
    }
  }

  // Load all comments for management
  async function loadComments() {
    try {
      const response = await fetch('http://localhost:3000/api/admin/comments');
      const comments = await response.json();
      
      const commentsTable = document.getElementById('comments-table');
      commentsTable.innerHTML = '';
      
      if (comments.length === 0) {
        commentsTable.innerHTML = `
          <tr>
            <td colspan="6" class="px-6 py-4 text-center text-gray-500">Hozircha izohlar mavjud emas</td>
          </tr>
        `;
        return;
      }
      
      comments.forEach(comment => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td class="bg-black px-6 py-4 whitespace-nowrap text-sm text-gray-500">${comment.id}</td>
          <td class="px-6 py-4 whitespace-nowrap">
            <div class="text-sm font-medium text-blue-500">${comment.username}</div>
          </td>
          <td class="px-6 py-4">
            <div class="text-sm text-gray-500 max-w-xs truncate">${comment.text}</div>
          </td>
          <td class="px-6 py-4 whitespace-nowrap">
            <div class="text-sm text-gray-500">${comment.articleTitle}</div>
            <div class="text-sm text-gray-500">ID: ${comment.articleId}</div>
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-green-500">
            ${new Date(comment.date).toLocaleString()}
          </td>
          <td class="px-6 py-4 blackspace-nowrap text-sm font-medium">
            <button onclick="deleteComment(${comment.id})" class="text-red-600 hover:text-red-900">O'chirish</button>
          </td>
        `;
        commentsTable.appendChild(row);
      });
    } catch (error) {
      console.error('Error loading comments:', error);
    }
  }

  // Global functions for delete buttons
  window.deleteArticle = async function(articleId) {
    if (!confirm('Haqiqatan ham bu yangilikni o\'chirmoqchimisiz?')) return;
    
    try {
      const response = await fetch(`http://localhost:3000/api/admin/articles/${articleId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        loadArticles();
        loadDashboardStats();
      } else {
        throw new Error('Failed to delete article');
      }
    } catch (error) {
      console.error('Error deleting article:', error);
      alert('Xatolik yuz berdi. Yangilikni o\'chirib bo\'lmadi.');
    }
  };

  window.deleteComment = async function(commentId) {
    if (!confirm('Haqiqatan ham bu izohni o\'chirmoqchimisiz?')) return;
    
    try {
      const response = await fetch(`http://localhost:3000/api/admin/comments/${commentId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        loadComments();
        loadDashboardStats();
      } else {
        throw new Error('Failed to delete comment');
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
      alert('Xatolik yuz berdi. Izohni o\'chirib bo\'lmadi.');
    }
  };
});