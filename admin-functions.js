// admin-functions.js
const AdminFunctions = {
    // Загрузка всех заявок для админа
    loadAllRequests: function() {
        const requests = Database.getRequests();
        const categories = Database.getCategories();
        const users = Database.getUsers();
        
        return requests.map(request => {
            const category = categories.find(c => c.id === request.categoryId);
            const user = users.find(u => u.id === request.userId);
            
            return {
                ...request,
                categoryName: category ? category.name : 'Неизвестно',
                userName: user ? user.fullName : 'Неизвестно',
                userEmail: user ? user.email : 'Неизвестно'
            };
        });
    },
    
    // Обновление статуса заявки
    updateRequestStatus: function(requestId, status, reason = null) {
        const success = Database.updateRequestStatus(requestId, status, reason);
        
        if (success) {
            const statusText = getStatusText(status);
            showNotification(`Статус заявки изменён на "${statusText}"`, 'success');
            return true;
        }
        
        showNotification('Ошибка при изменении статуса', 'error');
        return false;
    },
    
    // Управление категориями
    getCategories: function() {
        return Database.getCategories();
    },
    
    addCategory: function(name) {
        if (!name || name.trim() === '') {
            showNotification('Введите название категории', 'error');
            return false;
        }
        
        const category = Database.addCategory(name.trim());
        showNotification(`Категория "${category.name}" добавлена`, 'success');
        return category;
    },
    
    deleteCategory: function(categoryId) {
        if (!confirm('Удалить эту категорию? Заявки в этой категории сохранят свою категорию, но она будет отображаться как "Неизвестно".')) {
            return false;
        }
        
        const success = Database.deleteCategory(categoryId);
        
        if (success) {
            showNotification('Категория удалена', 'success');
            return true;
        }
        
        showNotification('Ошибка при удалении категории', 'error');
        return false;
    },
    
    // Статистика
    getStatistics: function() {
        const requests = Database.getRequests();
        const users = Database.getUsers();
        const categories = Database.getCategories();
        
        const totalRequests = requests.length;
        const newRequests = requests.filter(r => r.status === 'new').length;
        const solvedRequests = requests.filter(r => r.status === 'solved').length;
        const rejectedRequests = requests.filter(r => r.status === 'rejected').length;
        
        const totalUsers = users.length;
        const activeUsers = users.filter(u => u.role !== 'admin').length;
        
        return {
            totalRequests,
            newRequests,
            solvedRequests,
            rejectedRequests,
            totalUsers,
            activeUsers,
            categories: categories.length
        };
    },
    
    // Поиск заявок
    searchRequests: function(query, filters = {}) {
        let requests = this.loadAllRequests();
        
        // Фильтрация по статусу
        if (filters.status && filters.status !== 'all') {
            requests = requests.filter(r => r.status === filters.status);
        }
        
        // Фильтрация по категории
        if (filters.category && filters.category !== 'all') {
            const categoryId = parseInt(filters.category);
            requests = requests.filter(r => r.categoryId === categoryId);
        }
        
        // Поиск по тексту
        if (query && query.trim() !== '') {
            const searchQuery = query.toLowerCase().trim();
            requests = requests.filter(r => 
                r.title.toLowerCase().includes(searchQuery) ||
                r.description.toLowerCase().includes(searchQuery) ||
                r.userName.toLowerCase().includes(searchQuery) ||
                r.userEmail.toLowerCase().includes(searchQuery)
            );
        }
        
        // Сортировка
        requests.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        return requests;
    },
    
    // Экспорт данных
    exportData: function(type = 'json') {
        const data = {
            requests: Database.getRequests(),
            users: Database.getUsers(),
            categories: Database.getCategories(),
            news: Database.getNews(),
            exportDate: new Date().toISOString()
        };
        
        if (type === 'json') {
            const dataStr = JSON.stringify(data, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            this.downloadFile(dataBlob, 'psychology-service-data.json');
        }
    },
    
    // Импорт данных
    importData: function(jsonData) {
        try {
            const data = JSON.parse(jsonData);
            
            if (data.requests) localStorage.setItem('requests', JSON.stringify(data.requests));
            if (data.users) localStorage.setItem('users', JSON.stringify(data.users));
            if (data.categories) localStorage.setItem('categories', JSON.stringify(data.categories));
            if (data.news) localStorage.setItem('news', JSON.stringify(data.news));
            
            showNotification('Данные успешно импортированы', 'success');
            return true;
        } catch (error) {
            showNotification('Ошибка при импорте данных: ' + error.message, 'error');
            return false;
        }
    },
    
    // Вспомогательная функция для скачивания
    downloadFile: function(blob, filename) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
};