// script.js - Основной скрипт
document.addEventListener('DOMContentLoaded', function() {
    // Инициализация базы данных
    Database.init();
    
    // Инициализация аутентификации
    Auth.init();
    
    // Инициализация компонентов
    initComponents();
    
    // Загрузка контента для текущей страницы
    loadPageContent();
});

// Инициализация компонентов
function initComponents() {
    // Мобильное меню
    initMobileMenu();
    
    // Формы
    initForms();
    
    // Анимации
    initAnimations();
    
    // Счётчик посетителей
    initVisitorCounter();
}

// Загрузка контента в зависимости от страницы
function loadPageContent() {
    const path = window.location.pathname;
    
    if (path.includes('index.html') || path === '/') {
        loadNews();
        initImageHoverEffects();
    } else if (path.includes('cabinet.html')) {
        loadUserRequests();
        initRequestFilters();
    } else if (path.includes('admin.html')) {
        loadAdminRequests();
        initAdminFilters();
    } else if (path.includes('create-request.html')) {
        loadCategories();
    }
}

// Мобильное меню
function initMobileMenu() {
    const menuToggle = document.getElementById('menuToggle');
    const verticalNav = document.getElementById('verticalNav');
    
    if (menuToggle && verticalNav) {
        menuToggle.addEventListener('click', function(e) {
            e.stopPropagation();
            verticalNav.classList.toggle('active');
        });
        
        // Закрытие при клике вне меню
        document.addEventListener('click', function(e) {
            if (!verticalNav.contains(e.target) && !menuToggle.contains(e.target)) {
                verticalNav.classList.remove('active');
            }
        });
        
        // Закрытие при клике на ссылку
        verticalNav.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                verticalNav.classList.remove('active');
            });
        });
    }
}

// Формы
function initForms() {
    // Форма входа
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // Форма регистрации
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        initRegistrationValidation();
        registerForm.addEventListener('submit', handleRegistration);
    }
    
    // Форма создания заявки
    const requestForm = document.getElementById('requestForm');
    if (requestForm) {
        requestForm.addEventListener('submit', handleCreateRequest);
    }
}

// Анимации
function initAnimations() {
    // Анимация загрузки
    const loadingElements = document.querySelectorAll('.loading');
    loadingElements.forEach(element => {
        element.classList.add('animate');
    });
    
    // Плавное появление элементов
    const fadeElements = document.querySelectorAll('.fade-in');
    fadeElements.forEach((element, index) => {
        setTimeout(() => {
            element.classList.add('visible');
        }, index * 100);
    });
}

// Счётчик посетителей
function initVisitorCounter() {
    const counterElement = document.getElementById('visitorCount');
    if (counterElement) {
        // Обновляем счётчик
        const updateCounter = () => {
            const newCount = Database.incrementVisitorCount();
            const oldCount = parseInt(counterElement.textContent.replace(/\s/g, '')) || 0;
            
            // Анимация изменения числа
            animateCounter(counterElement, oldCount, newCount);
        };
        
        // Первоначальная установка
        const initialCount = Database.getVisitorCount();
        counterElement.textContent = initialCount.toLocaleString();
        
        // Обновление каждые 5 секунд
        setInterval(updateCounter, 5000);
    }
}

// Анимация счётчика
function animateCounter(element, start, end) {
    const duration = 1000;
    const startTime = Date.now();
    
    const update = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Эффект ease-out
        const easeProgress = 1 - Math.pow(1 - progress, 3);
        const current = Math.floor(start + (end - start) * easeProgress);
        
        element.textContent = current.toLocaleString();
        
        if (progress < 1) {
            requestAnimationFrame(update);
        }
    };
    
    requestAnimationFrame(update);
}

// Загрузка новостей
function loadNews() {
    const newsGrid = document.getElementById('newsGrid');
    if (!newsGrid) return;
    
    const news = Database.getNews(4);
    
    if (news.length === 0) {
        newsGrid.innerHTML = '<p class="no-data">Новостей пока нет</p>';
        return;
    }
    
    newsGrid.innerHTML = '';
    news.forEach(item => {
        const newsCard = createNewsCard(item);
        newsGrid.appendChild(newsCard);
    });
}

// Создание карточки новости
function createNewsCard(item) {
    const card = document.createElement('article');
    card.className = 'news-card';
    card.innerHTML = `
        <div class="news-image-container">
            <img src="${item.image}" alt="${item.title}" class="news-image">
            <div class="news-overlay">
                <button class="zoom-btn" aria-label="Увеличить изображение">
                    <i class="fas fa-search-plus"></i>
                </button>
            </div>
        </div>
        <div class="news-content">
            <div class="news-meta">
                <time datetime="${item.date}">${formatDate(item.date)}</time>
                <span class="news-category">${item.category}</span>
            </div>
            <h3 class="news-title">${item.title}</h3>
            <p class="news-excerpt">${item.content.substring(0, 100)}...</p>
            <button class="news-read-more">Читать далее</button>
        </div>
    `;
    
    return card;
}

// Эффекты при наведении на изображения
function initImageHoverEffects() {
    const newsImages = document.querySelectorAll('.news-image');
    
    newsImages.forEach(img => {
        const container = img.parentElement;
        
        container.addEventListener('mouseenter', () => {
            img.style.transform = 'scale(1.05)';
            img.style.transition = 'transform 0.3s ease';
        });
        
        container.addEventListener('mouseleave', () => {
            img.style.transform = 'scale(1)';
        });
        
        // Клик для увеличения
        const zoomBtn = container.querySelector('.zoom-btn');
        if (zoomBtn) {
            zoomBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                showImageModal(img.src, img.alt);
            });
        }
    });
}

// Модальное окно для изображения
function showImageModal(src, alt) {
    const modal = document.createElement('div');
    modal.className = 'image-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <button class="modal-close">&times;</button>
            <img src="${src}" alt="${alt}">
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Закрытие модального окна
    modal.addEventListener('click', (e) => {
        if (e.target === modal || e.target.classList.contains('modal-close')) {
            modal.remove();
        }
    });
}

// Загрузка заявок пользователя
function loadUserRequests() {
    const currentUser = Auth.getUser();
    if (!currentUser) return;
    
    const requests = Database.getUserRequests(currentUser.id);
    const categories = Database.getCategories();
    
    displayUserRequests(requests, categories);
}

// Отображение заявок пользователя
function displayUserRequests(requests, categories) {
    const container = document.getElementById('userRequests');
    if (!container) return;
    
    if (requests.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-inbox"></i>
                <h3>У вас пока нет заявок</h3>
                <p>Создайте свою первую заявку на психологическую помощь</p>
                <a href="create-request.html" class="btn btn-primary">Создать заявку</a>
            </div>
        `;
        return;
    }
    
    let html = `
        <div class="requests-header">
            <h3>Мои заявки (${requests.length})</h3>
            <div class="request-actions">
                <select id="statusFilter" class="filter-select">
                    <option value="all">Все статусы</option>
                    <option value="new">Новые</option>
                    <option value="solved">Решённые</option>
                    <option value="rejected">Отклонённые</option>
                </select>
            </div>
        </div>
        <div class="requests-grid">
    `;
    
    requests.forEach(request => {
        const category = categories.find(c => c.id === request.categoryId);
        html += createRequestCard(request, category);
    });
    
    html += '</div>';
    container.innerHTML = html;
    
    // Инициализация фильтров
    initRequestFilters();
}

// Создание карточки заявки
function createRequestCard(request, category) {
    const statusText = getStatusText(request.status);
    const statusClass = getStatusClass(request.status);
    const date = formatDateTime(request.createdAt);
    
    return `
        <div class="request-card" data-id="${request.id}" data-status="${request.status}">
            <div class="request-header">
                <h4 class="request-title">${request.title}</h4>
                <span class="status-badge ${statusClass}">${statusText}</span>
            </div>
            <div class="request-body">
                <p class="request-description">${request.description}</p>
                <div class="request-meta">
                    <span class="request-category">
                        <i class="fas fa-tag"></i> ${category ? category.name : 'Без категории'}
                    </span>
                    <span class="request-date">
                        <i class="far fa-clock"></i> ${date}
                    </span>
                </div>
            </div>
            <div class="request-actions">
                ${request.status === 'new' ? `
                    <button class="btn btn-danger btn-sm" onclick="deleteUserRequest(${request.id})">
                        <i class="fas fa-trash"></i> Удалить
                    </button>
                ` : ''}
                <button class="btn btn-secondary btn-sm" onclick="viewRequestDetails(${request.id})">
                    <i class="fas fa-eye"></i> Подробнее
                </button>
            </div>
        </div>
    `;
}

// Функции для работы с заявками
function deleteUserRequest(requestId) {
    if (!confirm('Вы уверены, что хотите удалить эту заявку?')) {
        return;
    }
    
    const deleted = Database.deleteRequest(requestId);
    if (deleted) {
        showNotification('Заявка успешно удалена', 'success');
        loadUserRequests(); // Перезагрузка списка
    } else {
        showNotification('Ошибка при удалении заявки', 'error');
    }
}

function viewRequestDetails(requestId) {
    const requests = Database.getRequests();
    const request = requests.find(r => r.id === requestId);
    
    if (!request) {
        showNotification('Заявка не найдена', 'error');
        return;
    }
    
    const modal = document.createElement('div');
    modal.className = 'modal request-details-modal';
    
    const statusText = getStatusText(request.status);
    const statusClass = getStatusClass(request.status);
    const date = formatDateTime(request.createdAt);
    
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Детали заявки</h3>
                <button class="modal-close">&times;</button>
            </div>
            <div class="modal-body">
                <div class="detail-item">
                    <label>Название:</label>
                    <p>${request.title}</p>
                </div>
                <div class="detail-item">
                    <label>Описание:</label>
                    <p>${request.description}</p>
                </div>
                <div class="detail-item">
                    <label>Статус:</label>
                    <span class="status-badge ${statusClass}">${statusText}</span>
                </div>
                <div class="detail-item">
                    <label>Дата создания:</label>
                    <p>${date}</p>
                </div>
                ${request.solvedAt ? `
                    <div class="detail-item">
                        <label>Дата решения:</label>
                        <p>${formatDateTime(request.solvedAt)}</p>
                    </div>
                ` : ''}
                ${request.rejectReason ? `
                    <div class="detail-item">
                        <label>Причина отказа:</label>
                        <p>${request.rejectReason}</p>
                    </div>
                ` : ''}
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary modal-close">Закрыть</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Закрытие модального окна
    modal.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', () => modal.remove());
    });
}

// Функции для работы со статусами
function getStatusText(status) {
    const statusMap = {
        'new': 'Новая',
        'solved': 'Решена',
        'rejected': 'Отклонена'
    };
    return statusMap[status] || 'Неизвестно';
}

function getStatusClass(status) {
    const classMap = {
        'new': 'status-new',
        'solved': 'status-solved',
        'rejected': 'status-rejected'
    };
    return classMap[status] || '';
}

// Утилиты форматирования
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
}

function formatDateTime(dateTimeString) {
    const date = new Date(dateTimeString);
    return date.toLocaleString('ru-RU', {
        day: 'numeric',
        month: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Уведомления
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${getNotificationIcon(type)}"></i>
            <span>${message}</span>
        </div>
        <button class="notification-close">&times;</button>
    `;
    
    document.body.appendChild(notification);
    
    // Автоматическое закрытие
    setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 5000);
    
    // Закрытие по клику
    notification.querySelector('.notification-close').addEventListener('click', () => {
        notification.classList.add('fade-out');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    });
}

function getNotificationIcon(type) {
    const icons = {
        'success': 'check-circle',
        'error': 'exclamation-circle',
        'warning': 'exclamation-triangle',
        'info': 'info-circle'
    };
    return icons[type] || 'info-circle';
}