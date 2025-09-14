# 🧮 Math XP – Gamified Progress Tracking System

This project is a **gamified system for evaluating student progress** during individual lessons.  
It does not include learning materials — instead, it provides a motivational framework that helps teachers track achievements and engage students through levels, quests, and rewards.  

The repository includes:
- A **Google Sheets script** for automated progress tracking and achievement detection  
- A **spreadsheet template** ready to use for lessons  
- Designed to **reduce teacher workload** while keeping students motivated and aware of their progress  

---

## 📖 Інструкція українською

### Встановлення  
1. Завантажити шаблон `.xlsx` з репозиторію  
2. Додати шаблон на свій Google Drive  
3. Відкрити його в Google Sheets  
4. Вибрати **Розширення**  
5. Обрати **Apps Script**  
6. Створити новий скрипт і вставити туди код, або завантажити файл зі скриптом  
7. Зберегти скрипт і оновити сторінку таблиці  
8. З’явиться меню **🧮 Math XP**  
9. Виконати будь-яку дію → підтвердити доступ (Google покаже попередження)  
10. ⚠️ Перед тим як давати учню доступ до редагування — уважно ознайомтеся з інструкцією  

### Використання  
- Меню **Math XP** має 3 розділи: завдання в класі, домашні завдання, бонуси  
- Для додавання балів оберіть відповідну опцію  
- Система автоматично рахує **XP, рівні, монети, ачивки, квести**  
- **Dashboard** – загальна інформація та список квестів (з колонки D, рядок 6)  
- **Data** – список усіх дій; помилкові можна видалити вручну  
- **Quests** – опис квестів  
- **Achievements** – надаються за виконання завдань та бонуси (рахуються тільки рівні > 0)  
- **Shop** – купівля предметів за монети:  
  - Виберіть предмет → натисніть **BUY NOW**  
  - Назва стане закресленою, кількість оновиться, монети спишуться  
  - Візуальні зміни робляться вручну — розташуйте картинки на Dashboard самостійно  
  - До покупки предмети доступні у клітинках, врахуйте це перед тим як давати учню права редагування  

---

## 📖 Instructions in English

### Installation  
1. Download the `.xlsx` template from the repository  
2. Upload it to your Google Drive  
3. Open it in Google Sheets  
4. Go to **Extensions**  
5. Select **Apps Script**  
6. Create a new script and paste the provided code, or upload the script file  
7. Save the script and refresh the sheet  
8. A new menu **🧮 Math XP** will appear  
9. Perform any first action → confirm access (Google will show a security prompt)  
10. ⚠️ Read the usage instructions before giving the student editing rights  

### Usage  
- The **Math XP** menu has 3 sections: class tasks, homework, bonuses  
- To add points, choose the desired option  
- The system automatically calculates **XP, levels, coins, achievements, and quests**  
- **Dashboard** – shows overall info and quest list (column D starting from row 6)  
- **Data** – chronological list of all actions; mistakes can be deleted manually  
- **Quests** – contains quest descriptions  
- **Achievements** – awarded automatically for tasks and bonuses (only levels > 0 count)  
- **Shop** – buy items with coins:  
  - Select an item → click **BUY NOW**  
  - The item name will become strikethrough, count will update, coins will be deducted  
  - Visual changes are not automatic — place images manually on Dashboard  
  - Before purchase, items are still available in cells; consider this before granting editing rights  

---

## ⚠️ Notes
- Technical sheets (`Achievements_Log`, `Quests_Log`) are hidden automatically. Unhide them if needed.  
- Always keep a backup copy of the template before student use.  
- Google may warn about an “unverified app” — this is normal for custom scripts. Review the permissions carefully.  
