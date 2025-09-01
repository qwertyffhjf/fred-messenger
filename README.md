# LGMU Messenger 🚀

Современный, безопасный и кроссплатформенный мессенджер с функциями Telegram, включающий end-to-end шифрование, аудио/видео звонки, поддержку ботов и плагинов.

## ✨ Основные возможности

### 💬 Общение
- **Текстовые сообщения** с поддержкой эмодзи и стикеров
- **Групповые чаты** и приватные беседы
- **Голосовые сообщения** с записью аудио
- **Пересылка и ответы** на сообщения
- **Реакции** на сообщения (лайки, эмодзи)
- **Редактирование** и удаление сообщений
- **Закрепление** важных сообщений

### 📞 Звонки
- **Аудио звонки** высокого качества
- **Видео звонки** с поддержкой WebRTC
- **Групповые звонки** до 10 участников
- **Запись звонков** (с согласия участников)

### 🔒 Безопасность
- **End-to-end шифрование** всех сообщений
- **Двухфакторная аутентификация** (2FA)
- **Шифрование файлов** и медиа
- **Безопасные сессии** с автоматическим выходом
- **Приватность** - контроль над видимостью профиля

### 👤 Профили и контакты
- **Детальные профили** с фото, статусом, био
- **Управление контактами** и черными списками
- **Поиск пользователей** по имени/username
- **Статусы онлайн/оффлайн** с временем последней активности

### 🎨 Интерфейс
- **Современный дизайн** в стиле Telegram
- **Темная и светлая темы** с автоматическим переключением
- **Адаптивный дизайн** для всех устройств
- **Поддержка жестов** на мобильных устройствах
- **Кастомизация** цветов и размеров шрифтов

### 🌍 Мультиязычность
- **Поддержка 8 языков**: Английский, Русский, Немецкий, Французский, Испанский, Китайский, Японский, Корейский
- **Автоматическое определение** языка системы
- **Локализация** всех элементов интерфейса

### 🤖 Боты и плагины
- **Система ботов** для автоматизации
- **Плагины** для расширения функциональности
- **API для разработчиков** для создания собственных ботов
- **Магазин плагинов** с рейтингами и отзывами

## 🚀 Технологии

### Backend
- **Node.js** + **Express** - веб-сервер
- **Socket.IO** - real-time коммуникация
- **MongoDB** + **Mongoose** - база данных
- **WebRTC** - аудио/видео звонки
- **JWT** - аутентификация
- **bcrypt** - хеширование паролей
- **RSA/AES** - шифрование

### Frontend
- **React 18** + **TypeScript** - пользовательский интерфейс
- **Electron** - десктопное приложение
- **Styled Components** - стилизация
- **Framer Motion** - анимации
- **React Query** - управление состоянием
- **Socket.IO Client** - real-time соединение

### Мобильная версия
- **React Native** - кроссплатформенная мобильная разработка
- **Expo** - инструменты разработки
- **Нативные модули** для камеры, микрофона, уведомлений

## 📋 Требования

### Системные требования
- **Node.js** 18+ 
- **MongoDB** 6.0+
- **npm** или **yarn**
- **Git**

### Поддерживаемые платформы
- **Windows** 10/11
- **macOS** 10.15+
- **Linux** (Ubuntu 20.04+, CentOS 8+)
- **Android** 8.0+
- **iOS** 13.0+

## 🛠️ Установка и запуск

### 1. Клонирование репозитория
```bash
git clone https://github.com/your-username/lgmu-messenger.git
cd lgmu-messenger
```

### 2. Установка зависимостей
```bash
# Установка всех зависимостей
npm install

# Или с использованием yarn
yarn install
```

### 3. Настройка окружения
Создайте файл `.env` в корневой директории:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/lgmu_messenger

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-here

# Client URL
CLIENT_URL=http://localhost:3000

# File Upload
MAX_FILE_SIZE=52428800
UPLOAD_PATH=./uploads

# Encryption
ENCRYPTION_KEY_ROTATION_HOURS=24

# Logging
LOG_LEVEL=info
```

### 4. Запуск MongoDB
```bash
# Ubuntu/Debian
sudo systemctl start mongod

# macOS
brew services start mongodb-community

# Windows
net start MongoDB
```

### 5. Запуск приложения

#### Режим разработки
```bash
# Запуск сервера и клиента одновременно
npm run dev

# Или по отдельности
npm run server:dev    # Сервер на порту 5000
npm run client:dev    # Клиент на порту 3000
```

#### Продакшн режим
```bash
# Сборка и запуск
npm run build
npm start
```

#### Запуск Electron приложения
```bash
npm run electron-dev
```

## 📱 Сборка для разных платформ

### Windows
```bash
npm run package-win
```

### macOS
```bash
npm run package-mac
```

### Linux
```bash
npm run package-linux
```

### Мобильные приложения
```bash
# Android
cd mobile && npm run android

# iOS
cd mobile && npm run ios
```

## 🔧 Конфигурация

### Настройки сервера
Основные настройки находятся в файле `server/src/config/config.ts`:

```typescript
export const config = {
  server: {
    port: process.env.PORT || 5000,
    host: process.env.HOST || 'localhost',
  },
  database: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/lgmu_messenger',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    },
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'default-secret',
    expiresIn: '7d',
  },
  encryption: {
    keyRotationHours: 24,
    algorithm: 'aes-256-gcm',
  },
};
```

### Настройки клиента
Настройки клиента в `client/src/config/config.ts`:

```typescript
export const config = {
  api: {
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000',
    timeout: 10000,
  },
  socket: {
    url: process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000',
    options: {
      transports: ['websocket', 'polling'],
    },
  },
  webrtc: {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
    ],
  },
};
```

## 🧪 Тестирование

### Запуск тестов
```bash
# Все тесты
npm test

# Только серверные тесты
npm run test:server

# Только клиентские тесты
npm run test:client

# Тесты с покрытием
npm run test:coverage
```

### E2E тесты
```bash
npm run test:e2e
```

## 📊 Мониторинг и логирование

### Логи
- **Серверные логи**: `server/logs/`
- **Клиентские логи**: DevTools Console
- **Уровни логирования**: error, warn, info, debug

### Метрики
- **Производительность**: встроенные метрики Node.js
- **Мониторинг**: поддержка Prometheus/Grafana
- **Алерты**: автоматические уведомления о проблемах

## 🔒 Безопасность

### Шифрование
- **RSA 2048** для обмена ключами
- **AES-256-GCM** для шифрования сообщений
- **Автоматическая ротация** ключей каждые 24 часа
- **Подпись сообщений** для предотвращения подмены

### Аутентификация
- **JWT токены** с коротким временем жизни
- **Refresh токены** для безопасного обновления
- **Двухфакторная аутентификация** (TOTP)
- **Ограничение попыток** входа

### Сетевая безопасность
- **HTTPS/WSS** для всех соединений
- **CORS** настройки для защиты от CSRF
- **Helmet.js** для защиты заголовков
- **Rate limiting** для предотвращения DDoS

## 🚀 Развертывание

### Docker
```bash
# Сборка образа
docker build -t lgmu-messenger .

# Запуск контейнера
docker run -p 5000:5000 -p 3000:3000 lgmu-messenger
```

### Docker Compose
```bash
docker-compose up -d
```

### Kubernetes
```bash
kubectl apply -f k8s/
```

### Облачные платформы
- **Heroku**: `git push heroku main`
- **Vercel**: автоматическое развертывание
- **AWS**: поддержка Elastic Beanstalk
- **Google Cloud**: поддержка App Engine

## 🤝 Вклад в проект

### Как внести вклад
1. **Fork** репозитория
2. Создайте **feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit** изменения (`git commit -m 'Add amazing feature'`)
4. **Push** в branch (`git push origin feature/amazing-feature`)
5. Откройте **Pull Request**

### Стандарты кода
- **ESLint** + **Prettier** для форматирования
- **TypeScript** для типизации
- **Jest** для тестирования
- **Conventional Commits** для сообщений коммитов

### Структура проекта
```
lgmu-messenger/
├── server/                 # Backend сервер
│   ├── src/
│   │   ├── models/        # Mongoose модели
│   │   ├── routes/        # API маршруты
│   │   ├── socket/        # Socket.IO обработчики
│   │   ├── security/      # Шифрование и безопасность
│   │   └── webrtc/        # WebRTC сервер
│   └── package.json
├── client/                 # Desktop клиент (Electron)
│   ├── src/
│   │   ├── components/    # React компоненты
│   │   ├── pages/         # Страницы приложения
│   │   ├── stores/        # Zustand stores
│   │   ├── styles/        # Styled Components
│   │   └── utils/         # Утилиты
│   └── package.json
├── mobile/                 # Мобильное приложение
│   ├── src/
│   └── package.json
└── shared/                 # Общий код
    ├── types/             # TypeScript типы
    └── constants/         # Константы
```

## 📄 Лицензия

Этот проект лицензирован под MIT License - см. файл [LICENSE](LICENSE) для деталей.

## 🆘 Поддержка

### Документация
- [API Reference](docs/api.md)
- [User Guide](docs/user-guide.md)
- [Developer Guide](docs/developer-guide.md)
- [Deployment Guide](docs/deployment.md)

### Сообщество
- **Discord**: [Присоединяйтесь к серверу](https://discord.gg/lgmu-messenger)
- **Telegram**: [Канал проекта](https://t.me/lgmu_messenger)
- **GitHub Issues**: [Сообщите о баге](https://github.com/your-username/lgmu-messenger/issues)
- **GitHub Discussions**: [Обсуждения](https://github.com/your-username/lgmu-messenger/discussions)

### Контакты
- **Email**: support@lgmu-messenger.com
- **Website**: https://lgmu-messenger.com
- **Twitter**: [@lgmu_messenger](https://twitter.com/lgmu_messenger)

## 🙏 Благодарности

- **Telegram** за вдохновение дизайном
- **WhatsApp** за идеи безопасности
- **Discord** за концепцию ботов
- **Signal** за подход к шифрованию
- Всем **контрибьюторам** проекта

---

**LGMU Messenger** - Создано с ❤️ командой LGMU

*Сделайте общение безопасным, быстрым и удобным!*
