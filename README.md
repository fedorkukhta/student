Запуск проекта Student 
1. Установите программы
Установите Java 21, Node.js LTS и PostgreSQL.
2. Скачайте проект
Скачайте архив проекта, распакуйте его и откройте PowerShell в папке student.
3. Создайте базу данных
В PostgreSQL создайте базу данных:
CREATE DATABASE students_db;
4. Запустите backend
.\mvnw.cmd spring-boot:run
Не закрывайте это окно PowerShell.
5. Запустите frontend
Откройте второе окно PowerShell и выполните:
cd student\frontend
npm install
npm run dev
6. Откройте сайт
Откройте в браузере: http://localhost:5173
Вход
Email: admin@example.com
Пароль: admin
<img width="475" height="485" alt="image" src="https://github.com/user-attachments/assets/5ff18e0f-92af-4466-9904-6760b6ef69e5" />
