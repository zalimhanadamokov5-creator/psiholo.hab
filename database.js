// database.js - Имитация базы данных
const Database = {
    // Инициализация данных
    init: function() {
        if (!localStorage.getItem('db_initialized')) {
            this.initUsers();
            this.initCategories();
            this.initRequests();
            this.initNews();
            this.initVisitorCount();
            localStorage.setItem('db_initialized', 'true');
        }
    },

    // Пользователи
    initUsers: function() {
        if (!localStorage.getItem('users')) {
            const users = [
                {
                    id: 1,
                    fullName: 'Администратор',
                    login: 'admin',
                    email: 'admin@psychology-help.ru',
                    password: 'admin',
                    role: 'admin',
                    registrationDate: new Date().toISOString()
                },
                {
                    id: 2,
                    fullName: 'Иванов Иван Иванович',
                    login: 'user',
                    email: 'user@example.ru',
                    password: 'user123',
                    role: 'user',
                    registrationDate: new Date().toISOString()
                }
            ];
            localStorage.setItem('users', JSON.stringify(users));
        }
    },

    // Категории заявок
    initCategories: function() {
        if (!localStorage.getItem('categories')) {
            const categories = [
                { id: 1, name: 'Тревожность и стресс' },
                { id: 2, name: 'Депрессия' },
                { id: 3, name: 'Отношения и семья' },
                { id: 4, name: 'Самооценка и уверенность' },
                { id: 5, name: 'Карьера и профессиональное развитие' },
                { id: 6, name: 'Травмы и кризисы' }
            ];
            localStorage.setItem('categories', JSON.stringify(categories));
        }
    },

    // Заявки
    initRequests: function() {
        if (!localStorage.getItem('requests')) {
            const requests = [
                {
                    id: 1,
                    userId: 2,
                    title: 'Помощь с тревожностью',
                    description: 'Испытываю постоянную тревогу без видимых причин',
                    categoryId: 1,
                    status: 'solved',
                    createdAt: '2023-10-01T10:30:00Z',
                    solvedAt: '2023-10-05T14:20:00Z'
                },
                {
                    id: 2,
                    userId: 2,
                    title: 'Проблемы в отношениях',
                    description: 'Частые конфликты с партнером',
                    categoryId: 3,
                    status: 'new',
                    createdAt: '2023-10-12T15:45:00Z'
                }
            ];
            localStorage.setItem('requests', JSON.stringify(requests));
        }
    },

    // Новости
    initNews: function() {
        if (!localStorage.getItem('news')) {
            const news = [
                {
                    id: 1,
                    title: 'Новый групповой тренинг по управлению стрессом',
                    category: 'Тренинги',
                    content: 'Приглашаем всех желающих на наш новый тренинг по управлению стрессом. Тренинг пройдет в онлайн-формате.',
                    image: 'images/news-1.jpg',
                    date: '2023-10-15'
                },
                {
                    id: 2,
                    title: 'Введение новой услуги: семейная психология онлайн',
                    category: 'Услуги',
                    content: 'Теперь вы можете получить профессиональную помощь семейного психолога не выходя из дома.',
                    image: 'images/news-2.jpg',
                    date: '2023-10-10'
                },
                {
                    id: 3,
                    title: 'Бесплатный вебинар: "Как справиться с тревогой"',
                    category: 'Мероприятия',
                    content: 'Приглашаем на бесплатный вебинар с нашим ведущим психологом. Регистрация обязательна.',
                    image: 'images/news-3.jpg',
                    date: '2023-10-05'
                },
                {
                    id: 4,
                    title: 'Отзыв клиента: "Как психология помогла мне найти себя"',
                    category: 'Отзывы',
                    content: 'История успеха нашего клиента, который смог преодолеть кризис и найти новое призвание.',
                    image: 'images/news-4.jpg',
                    date: '2023-09-28'
                }
            ];
            localStorage.setItem('news', JSON.stringify(news));
        }
    },

    // Счётчик посещений
    initVisitorCount: function() {
        if (!localStorage.getItem('visitorCount')) {
            localStorage.setItem('visitorCount', '1250');
        }
    },

    // CRUD операции для пользователей
    getUserById: function(id) {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        return users.find(user => user.id === id);
    },

    getUserByLogin: function(login) {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        return users.find(user => user.login === login);
    },

    addUser: function(user) {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        user.id = users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1;
        user.registrationDate = new Date().toISOString();
        user.role = 'user';
        users.push(user);
        localStorage.setItem('users', JSON.stringify(users));
        return user;
    },

    // CRUD для заявок
    getRequests: function() {
        return JSON.parse(localStorage.getItem('requests') || '[]');
    },

    getUserRequests: function(userId) {
        const requests = this.getRequests();
        return requests.filter(request => request.userId === userId);
    },

    addRequest: function(request) {
        const requests = JSON.parse(localStorage.getItem('requests') || '[]');
        request.id = requests.length > 0 ? Math.max(...requests.map(r => r.id)) + 1 : 1;
        request.createdAt = new Date().toISOString();
        request.status = 'new';
        requests.push(request);
        localStorage.setItem('requests', JSON.stringify(requests));
        return request;
    },

    updateRequestStatus: function(requestId, status, reason = null) {
        const requests = JSON.parse(localStorage.getItem('requests') || '[]');
        const index = requests.findIndex(r => r.id === requestId);
        
        if (index !== -1) {
            requests[index].status = status;
            if (status === 'solved') {
                requests[index].solvedAt = new Date().toISOString();
            }
            if (reason) {
                requests[index].rejectReason = reason;
            }
            localStorage.setItem('requests', JSON.stringify(requests));
            return true;
        }
        return false;
    },

    deleteRequest: function(requestId) {
        const requests = JSON.parse(localStorage.getItem('requests') || '[]');
        const filteredRequests = requests.filter(r => r.id !== requestId);
        localStorage.setItem('requests', JSON.stringify(filteredRequests));
        return requests.length !== filteredRequests.length;
    },

    // Категории
    getCategories: function() {
        return JSON.parse(localStorage.getItem('categories') || '[]');
    },

    addCategory: function(name) {
        const categories = JSON.parse(localStorage.getItem('categories') || '[]');
        const newCategory = {
            id: categories.length > 0 ? Math.max(...categories.map(c => c.id)) + 1 : 1,
            name: name
        };
        categories.push(newCategory);
        localStorage.setItem('categories', JSON.stringify(categories));
        return newCategory;
    },

    deleteCategory: function(categoryId) {
        const categories = JSON.parse(localStorage.getItem('categories') || '[]');
        const filteredCategories = categories.filter(c => c.id !== categoryId);
        localStorage.setItem('categories', JSON.stringify(filteredCategories));
        return categories.length !== filteredCategories.length;
    },

    // Новости
    getNews: function(limit = 4) {
        const news = JSON.parse(localStorage.getItem('news') || '[]');
        return news.slice(0, limit);
    },

    // Счётчик посетителей
    incrementVisitorCount: function() {
        let count = parseInt(localStorage.getItem('visitorCount') || '1250');
        count += Math.floor(Math.random() * 3) + 1; // Случайное увеличение
        localStorage.setItem('visitorCount', count.toString());
        return count;
    },

    getVisitorCount: function() {
        return parseInt(localStorage.getItem('visitorCount') || '1250');
    }
};