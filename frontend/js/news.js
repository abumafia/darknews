document.addEventListener('DOMContentLoaded', async function() {
  const urlParams = new URLSearchParams(window.location.search);
  const articleId = urlParams.get('id');
  
  if (!articleId) {
    window.location.href = 'index.html';
    return;
  }
  
  const articleContainer = document.getElementById('news-article');
  
  try {
    // Yangilik ma'lumotlarini olish
    const response = await fetch(`https://darknews.onrender.com/api/articles/${articleId}`);
    const article = await response.json();
    
    // Comment yozish formasi
    const commentFormHTML = `
      <div class="mt-8 p-6 bg-gray-900">
        <h3 class="text-lg font-semibold mb-4">Fikr qoldiring</h3>
        <form id="comment-form" class="space-y-4">
          <div>
            <label for="username" class="block text-sm font-medium text-gray-700">Ismingiz</label>
            <input type="text" id="username" required class="bg-black mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border">
          </div>
          <div>
            <label for="comment" class="block text-sm font-medium text-gray-700">Fikringiz</label>
            <textarea id="comment" rows="3" required class="bg-black mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"></textarea>
          </div>
          <button type="submit" class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">Yuborish</button>
        </form>
      </div>
      
      <div id="comments-section" class="bg-black p-6">
        <h3 class="text-lg font-semibold mb-4">Fikrlar (${article.comments.length})</h3>
        <div id="comments-list" class="space-y-4">
          ${article.comments.length === 0 ? 
            '<p class="text-gray-500">Hozircha fikrlar mavjud emas.</p>' : 
            article.comments.map(comment => `
              <div class="bg-gray-900 p-4 rounded-lg">
                <div class="flex justify-between items-start">
                  <div>
                    <h4 class="font-medium text-blue-500">${comment.username}</h4>
                    <p class="text-sm text-gray-500">${new Date(comment.date).toLocaleString()}</p>
                  </div>
                </div>
                <p class="mt-2 text-green-500">${comment.text}</p>
              </div>
            `).join('')}
        </div>
      </div>
    `;
    
    // Yangilikni ko'rsatish
    articleContainer.innerHTML = `
      <div>
        <div class="bg-black p-6">
          <h2 class="text-2xl font-bold mb-4">${article.title}</h2>
          <div class="flex items-center justify-between mb-6">
            <span class="text-sm text-gray-500">${new Date().toLocaleDateString()}</span>
            <button onclick="handleLike(${article.id}, this)" class="bg-black flex items-center space-x-1 ${article.likedBy.length > 0 ? 'text-red-500' : 'text-gray-500'} hover:text-red-500">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="bg-black round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <span>${article.likes}</span>
            </button>
          </div>
          <div class="prose max-w-none">
            <p class="text-gray-400 leading-relaxed">${article.content}</p>
          </div>
        </div>
        ${commentFormHTML}
      </div>
    `;
    
    // Comment formani ishga tushirish
    document.getElementById('comment-form').addEventListener('submit', async function(e) {
      e.preventDefault();
      
      const username = document.getElementById('username').value;
      const text = document.getElementById('comment').value;
      
      try {
        const response = await fetch(`https://darknews.onrender.com/api/articles/${articleId}/comment`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: 'user_' + Math.random().toString(36).substr(2, 9),
            username,
            text
          })
        });
        
        const newComment = await response.json();
        
        // Commentlarni yangilash
        const commentsList = document.getElementById('comments-list');
        const commentsSection = document.getElementById('comments-section');
        
        if (commentsList.querySelector('.text-gray-500')) {
          commentsList.innerHTML = '';
        }
        
        commentsList.insertAdjacentHTML('afterbegin', `
          <div class="bg-gray-50 p-4 rounded-lg">
            <div class="flex justify-between items-start">
              <div>
                <h4 class="font-medium text-gray-900">${newComment.username}</h4>
                <p class="text-sm text-gray-500">${new Date(newComment.date).toLocaleString()}</p>
              </div>
            </div>
            <p class="mt-2 text-gray-700">${newComment.text}</p>
          </div>
        `);
        
        // Commentlar sonini yangilash
        const commentsTitle = commentsSection.querySelector('h3');
        const commentsCount = commentsList.children.length;
        commentsTitle.textContent = `Fikrlar (${commentsCount})`;
        
        // Formani tozalash
        document.getElementById('comment-form').reset();
        
      } catch (error) {
        console.error('Comment qoldirishda xatolik:', error);
        alert('Comment qoldirishda xatolik yuz berdi. Iltimos, qayta urinib ko\'ring.');
      }
    });
    
  } catch (error) {
    console.error('Yangilikni yuklashda xatolik:', error);
    articleContainer.innerHTML = `
      <div class="p-6 text-center">
        <p class="text-red-500">Yangilikni yuklashda xatolik yuz berdi.</p>
        <a href="index.html" class="mt-4 inline-block text-blue-500 hover:underline">Bosh sahifaga qaytish</a>
      </div>
    `;
  }
});

// Like bosish funksiyasi
async function handleLike(articleId, button) {
  try {
    // Haqiqiy loyihada foydalanuvchi IDsi auth orqali olinadi
    const userId = 'user_' + Math.random().toString(36).substr(2, 9);
    
    const response = await fetch(`https://darknews.onrender.com/api/articles/${articleId}/like`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId })
    });
    
    const data = await response.json();
    
    // Like tugmasini yangilash
    const likeCount = button.querySelector('span');
    likeCount.textContent = data.likes;
    
    // Like bosilganini ko'rsatish
    if (data.isLiked) {
      button.classList.remove('text-gray-500');
      button.classList.add('text-green-500');
    } else {
      button.classList.remove('text-green-500');
      button.classList.add('text-gray-500');
    }
  } catch (error) {
    console.error('Like qilishda xatolik:', error);
  }
}
