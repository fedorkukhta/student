# Student frontend

React + TypeScript + Vite frontend for the Student REST API.

## Запуск

Из корня репозитория:

```bash
cd frontend
npm install
npm run dev
```

В режиме разработки запросы `/api` проксируются на `http://localhost:8080`.
Для другого адреса API можно передать `VITE_API_URL`, например:

```bash
VITE_API_URL=https://api.example.com npm run build
```

## Возможности

- вход через `POST /api/v1/auth/login`;
- сохранение JWT в `localStorage`;
- список и поиск студентов;
- создание, редактирование контактных данных и удаление студентов для администратора;
- просмотр студентов для преподавателя;
- создание и удаление пользователей для супер-администратора.

Локальные учетные записи, создаваемые backend-инициализатором:

| Роль | Email | Пароль |
|---|---|---|
| Super admin | `superadmin@example.com` | `superAdmin` |
| Admin | `admin@example.com` | `admin` |
| Teacher | `teacher@example.com` | `teacher` |
