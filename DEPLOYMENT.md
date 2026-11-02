# Развертывание Student на Render

В репозитории есть `render.yaml`, который описывает:

- PostgreSQL-базу `student-db`;
- backend как Docker Web Service;
- frontend как Static Site.

## Запуск через Render Blueprint

1. Откройте Render и войдите через GitHub.
2. Выберите **New → Blueprint**.
3. Выберите репозиторий `dorzhogun/fun-student`.
4. Выберите ветку `fedorkukhta-student-frontend` или объедините ее с `master`.
5. Подтвердите создание ресурсов из `render.yaml`.

После создания Render автоматически:

- создаст PostgreSQL;
- передаст backend строку подключения через переменные окружения;
- сгенерирует JWT-секрет;
- соберет backend в Docker;
- соберет frontend из `frontend/`;
- свяжет frontend с backend.

Демо-доступ:

```text
admin@example.com / admin
teacher@example.com / teacher
superadmin@example.com / superAdmin
```

Для публичной демонстрации рекомендуется сменить эти пароли и не публиковать их в открытых материалах.
