// auth.js - Управление аутентификацией
const Auth = {
    // Текущий пользователь
    currentUser: null,

    // Инициализация
    init: function() {
        this.loadCurrentUser();
        this.setupAuthCheck();
    },

    // Загрузка текущего пользователя
    loadCurrentUser: function() {
        const userData = localStorage.getItem('currentUser');
        if (userData) {
            this.currentUser = JSON.parse(userData);
        }
    },

    // Сохранение текущего пользователя
    saveCurrentUser: function(user) {
        this.currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(user));
    },

    // Вход
    login: function(login, password) {
        const user = Database.getUserByLogin(login);
        
        if (user && user.password === password) {
            const userData = {
                id: user.id,
                fullName: user.fullName,
                login: user.login,
                email: user.email,
                role: user.role
            };
            
            this.saveCurrentUser(userData);
            return { success: true, user: userData };
        }
        
        return { success: false, message: 'Неверный логин или пароль' };
    },

    // Регистрация
    register: function(userData) {
        // Проверка на уникальность логина
        const existingUser = Database.getUserByLogin(userData.login);
        if (existingUser) {
            return { success: false, message: 'Этот логин уже занят' };
        }

        // Добавление пользователя
        const newUser = Database.addUser(userData);
        
        // Автоматический вход после регистрации
        const userForAuth = {
            id: newUser.id,
            fullName: newUser.fullName,
            login: newUser.login,
            email: newUser.email,
            role: newUser.role
        };
        
        this.saveCurrentUser(userForAuth);
        return { success: true, user: userForAuth };
    },

    // Выход
    logout: function() {
        this.currentUser = null;
        localStorage.removeItem('currentUser');
    },

    // Проверка авторизации
    isLoggedIn: function() {
        return this.currentUser !== null;
    },

    // Проверка роли
    isAdmin: function() {
        return this.isLoggedIn() && this.currentUser.role === 'admin';
    },

    // Получение текущего пользователя
    getUser: function() {
        return this.currentUser;
    },

    // Настройка проверки авторизации на страницах
    setupAuthCheck: function() {
        const protectedPages = ['cabinet.html', 'create-request.html', 'admin.html'];
        const currentPage = window.location.pathname.split('/').pop();
        
        if (protectedPages.includes(currentPage)) {
            if (!this.isLoggedIn()) {
                window.location.href = 'login.html';
                return;
            }
            
            // Дополнительная проверка для админ-панели
            if (currentPage === 'admin.html' && !this.isAdmin()) {
                window.location.href = 'index.html';
                return;
            }
        }
        
        // Обновление UI в зависимости от статуса
        this.updateUI();
    },

    // Обновление UI в зависимости от статуса авторизации
    updateUI: function() {
        const navItems = document.querySelectorAll('[data-auth]');
        
        navItems.forEach(item => {
            const authType = item.getAttribute('data-auth');
            
            switch(authType) {
                case 'guest':
                    item.style.display = this.isLoggedIn() ? 'none' : 'block';
                    break;
                case 'user':
                    item.style.display = this.isLoggedIn() ? 'block' : 'none';
                    break;
                case 'admin':
                    item.style.display = this.isAdmin() ? 'block' : 'none';
                    break;
            }
        });
        
        // Отображение имени пользователя
        const userNameElements = document.querySelectorAll('[data-username]');
        if (this.isLoggedIn() && userNameElements.length > 0) {
            userNameElements.forEach(element => {
                element.textContent = this.currentUser.fullName;
            });
        }
    }
};