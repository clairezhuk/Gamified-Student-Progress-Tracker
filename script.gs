let homeworkAttempts = {};

function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('🧮 Math XP')
    .addSubMenu(ui.createMenu('✅ Завдання в класі')
      .addItem('+5 XP: Просте', 'classSimple')
      .addItem('+10 XP: Середнє', 'classMedium')
      .addItem('+15 XP: Складне', 'classHard')
    )
    .addSubMenu(ui.createMenu('🏠 Домашнє завдання')
      .addItem('+10 XP: Просте — одразу правильно', 'homeworkSimpleCorrect')
      .addItem('+20 XP: Середнє — одразу правильно', 'homeworkMediumCorrect')
      .addItem('+30 XP: Складне — одразу правильно', 'homeworkHardCorrect')
      .addSeparator()
      .addItem('+1 XP: Спроба', 'homeworkAttempt')
      .addItem('✅ Завершено: Просте — вказати кількість спроб', 'homeworkSimpleFinal')
      .addItem('✅ Завершено: Середнє — вказати кількість спроб', 'homeworkMediumFinal')
      .addItem('✅ Завершено: Складне — вказати кількість спроб', 'homeworkHardFinal')
    )
    .addSubMenu(ui.createMenu('✨ Бонуси')
      .addItem('+10 XP: Самостійна знайдена помилка', 'bonusSelfFix')
      .addItem('+5 XP: Гарне пояснення', 'bonusExplain')
      .addItem('+15 XP: Творчий підхід / нова задача', 'bonusCreative')
    )
    .addToUi();
}

// === Запис XP ===
function addXP(type, points) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Data');
  sheet.appendRow([new Date(), type, points]);
  checkAchievements(); // Check achievements after XP is added
  checkQuests();
}

// === Перевірка ачівок ===
function checkAchievements() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const dataSheet = ss.getSheetByName('Data');
  const achSheet = ss.getSheetByName('Achievements_Log') || ss.insertSheet('Achievements_Log');
  
  achSheet.hideSheet();
  
  const data = dataSheet.getDataRange().getValues().slice(1); // exclude headers
  
  checkSprint(data, achSheet);
  checkAccuracy(data, achSheet);
  checkPersistence(data, achSheet);
  checkSelfTeacher(data, achSheet);
  checkExplanationMaster(data, achSheet);
  checkCreativity(data, achSheet);

  renderDashboard();
}

// === Запис ачівок ===
function addAchievementIfNotExists(name, dateStr, level, achSheet) {
  const records = achSheet.getDataRange().getValues();
  const alreadyLogged = records.some(row => row[0] === dateStr && row[1] === name && row[2] === level);
  if (alreadyLogged) return;

  let xp=0;
  if(level>0){
    xp = 10+level*10;
    achSheet.appendRow([dateStr, name, level, true]);
    const dataSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Data');
    dataSheet.appendRow([new Date(), `Ачівка: ${name} (рівень ${level})`, xp]);
  }

}

// === Оновлення запису ачівок ===
function getAchievementsList() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const achSheet = ss.getSheetByName('Achievements_Log');
  if (!achSheet) return [];

  const data = achSheet.getDataRange().getValues().slice(1); // exclude headers if any
  // Map to "Name (Level X)"
  return data.map(row => `${row[1]} (Level ${row[2]})`);
}


function renderDashboard() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let dashboard = ss.getSheetByName('Dashboard');
  if (!dashboard) {
    dashboard = ss.insertSheet('Dashboard');
  }
  const achievements = getAchievementsList();

  dashboard.getRange('A6').setValue('🏆Ачівки:');
  if (achievements.length === 0) {
    dashboard.getRange('B6').setValue('Немає ачівок');
  } else {
    dashboard.getRange(6, 2, achievements.length).setValues(achievements.map(a => [a]));
  }

  // Optional: adjust column width for better appearance
  dashboard.autoResizeColumn(1);
  dashboard.autoResizeColumn(2);
}

// === Механіка магазину ===
function buySelectedItems() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Shop");
  const range = sheet.getActiveRange();
  const row = range.getRow();
  const col = range.getColumn();

  // Only allow selection in columns B (2), C (3), or D (4) and from row 2 down
  if (row < 2 || col < 2 || col > 4) {
    SpreadsheetApp.getUi().alert("Виберіть клітинку в колонці B, C або D (з рядка 2 і нижче).");
    return;
  }

  const itemCell = sheet.getRange(row, 2); // Column B
  const itemName = itemCell.getValue();

  // Update column E
  const eCell = sheet.getRange(row, 5); // Column E
  const currentValue = eCell.getValue();
  const newValue = isNaN(currentValue) || currentValue === "" ? 1 : Number(currentValue) + 1;
  eCell.setValue(newValue);

  // Apply strikethrough formatting to column B cell
  itemCell.setFontLine("line-through");

  // Show confirmation message
  SpreadsheetApp.getUi().alert(`Предмет "${itemName}" куплено, добавте картинку на Dashboard`);

  SpreadsheetApp.flush();
}





// === Завдання в класі ===
function classSimple() { addXP("Клас: Просте завдання", 5); }
function classMedium() { addXP("Клас: Середнє завдання", 10); }
function classHard()   { addXP("Клас: Складне завдання", 15); }

// === Домашні — одразу правильно ===
function homeworkSimpleCorrect() { addXP("ДЗ: Просте одразу правильно", 10); }
function homeworkMediumCorrect() { addXP("ДЗ: Середнє одразу правильно", 20); }
function homeworkHardCorrect()   { addXP("ДЗ: Складне одразу правильно", 30); }

// === Домашні — спроби ===
function homeworkAttempt() {
  const taskId = getTaskId();
  if (!homeworkAttempts[taskId]) homeworkAttempts[taskId] = 1;
  else homeworkAttempts[taskId]++;
  addXP("ДЗ: спроба з помилкою", 1);
}

// === Завершення ДЗ з урахуванням спроб ===
function homeworkSimpleFinal()   { finalizeHomework("Просте", 10); }
function homeworkMediumFinal()   { finalizeHomework("Середнє", 20); }
function homeworkHardFinal()     { finalizeHomework("Складне", 30); }

function finalizeHomework(level, baseXP) {
  const ui = SpreadsheetApp.getUi();
  const taskId = getTaskId();

  const response = ui.prompt(`Скільки було всього спроб у задачі (${level})?`, ui.ButtonSet.OK_CANCEL);
  if (response.getSelectedButton() !== ui.Button.OK) return;

  const attempts = parseInt(response.getResponseText());
  if (isNaN(attempts) || attempts < 1) {
    ui.alert("Некоректне число спроб.");
    return;
  }

  const bonusXP = Math.max(baseXP - attempts, 1);
  addXP(`ДЗ: ${level} завершено з ${attempts} спробами`, bonusXP);
}

// === Бонуси ===
function bonusSelfFix()   { addXP("Бонус: Самостійно знайшов помилку", 10); }
function bonusExplain()   { addXP("Бонус: Гарне пояснення", 5); }
function bonusCreative()  { addXP("Бонус: Творчий підхід / нова задача", 15); }

// === Генератор ID завдання ===
function getTaskId() {
  // Створює унікальний ключ завдання по даті (можна адаптувати)
  const now = new Date();
  return now.toISOString().slice(0, 10) + '-' + now.getHours();
}

// === Ачівки ===
function checkSprint(data, achSheet) {
  const today = new Date().toDateString();
  const classTasksToday = data.filter(row => {
    const date = new Date(row[0]).toDateString();
    const type = row[1];
    return date === today && type.includes("Клас");
  });

  const count = classTasksToday.length;

  let level = 0;
  level = Math.floor(count / 5);
  if (level > 0) addAchievementIfNotExists("🏃Спрінт", today, level, achSheet);
}

// Точність – не менше 2 задач із дз в один день без помилок
function checkAccuracy(data, achSheet) {
  const today = new Date().toDateString();
  // Фільтруємо домашні завдання з відсутністю спроб (помилок)
  // Припустимо, що "одразу правильно" в описі — немає спроб
  const correctHomeworksToday = data.filter(row => {
    const date = new Date(row[0]).toDateString();
    const type = row[1];
    return date === today && type.includes("ДЗ") && !type.includes("спроба") && type.includes("одразу правильно");
  });

  const count = correctHomeworksToday.length;
  let level = Math.floor(count / 2);
  addAchievementIfNotExists("🎯Точність", today, level, achSheet);
  
}

// Наполегливість – не менше 2 спроб виправити в дз в один день
function checkPersistence(data, achSheet) {
  const today = new Date().toDateString();
  // Фільтруємо рядки з типом "ДЗ: спроба з помилкою"
  const attemptsToday = data.filter(row => {
    const date = new Date(row[0]).toDateString();
    const type = row[1];
    return date === today && type.includes("спроба");
  });


  const count = attemptsToday.length;
  let level = Math.floor(count / 2);
  addAchievementIfNotExists("🧗Наполегливість", today, level, achSheet);

}

// Сам собі вчитель – 3 разів отримано бонус «Самостійна знайдена помилка» (сукупно)
function checkSelfTeacher(data, achSheet) {
  // Підрахунок бонусів у всіх записах
  const count = data.filter(row => row[1] === "Бонус: Самостійно знайшов помилку").length;
  let level = Math.floor(count / 3);
  addAchievementIfNotExists("🎓Сам собі вчитель", "всього", level, achSheet);

}

// Майстер пояснень – 3 разів бонус «Гарне пояснення»
function checkExplanationMaster(data, achSheet) {
  const count = data.filter(row => row[1] === "Бонус: Гарне пояснення").length;

  let level = Math.floor(count / 3);
  addAchievementIfNotExists("💡Майстер пояснень", "всього", level, achSheet);
}

// Креативність – 3 разів бонус «Творчий підхід / нова задача»
function checkCreativity(data, achSheet) {
  const count = data.filter(row => row[1] === "Бонус: Творчий підхід / нова задача").length;
  let level = Math.floor(count / 3);
  addAchievementIfNotExists("🎨Креативність", "всього", level, achSheet);
}


// === Головна перевірка квестів ===
function checkQuests() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const achSheet = ss.getSheetByName('Achievements_Log');
  if (!achSheet) return;
  
  const data = achSheet.getDataRange().getValues().slice(1) // skip headers
    .filter(r => Number(r[2]) > 0); // тільки ачівки з рівнем > 0

  // список квестів
  const quests = [
    {name: "🃏 Колекціонер 🃏", checkFn: () => isQuestCompleted_Collector(data)},
    {name: "🏃‍♂️ Марафон 🏃‍♂️", checkFn: () => isQuestCompleted_Marathon(data)},
    {name: "🌱 Зростання 🌱", checkFn: () => isQuestCompleted_Growth(data)},
    {name: "🧭 Дослідник 🧭", checkFn: () => isQuestCompleted_Explorer(data)},
    {name: "⚡ Ривок продуктивності ⚡", checkFn: () => isQuestCompleted_Burst(data)},
    {name: "🎨 Майстер колекцій 🎨", checkFn: () => isQuestCompleted_Collections(data)},
    {name: "⚖️ Баланс ⚖️", checkFn: () => isQuestCompleted_Balance(data)},
    {name: "🚀 Прорив 🚀", checkFn: () => isQuestCompleted_Breakthrough(data)},
    {name: "🎯 Перфекціоніст 🎯", checkFn: () => isQuestCompleted_Perfectionist(data)},
    {name: "📚 Вчитель-натхненник 📚", checkFn: () => isQuestCompleted_Teacher(data)},
    {name: "🏆 Майстер квестів 🏆", checkFn: () => isQuestCompleted_QuestMaster()}
  ];

  let questSheet = ss.getSheetByName('Quests_Log');
  if (!questSheet) {
    questSheet = ss.insertSheet('Quests_Log');
  }
  questSheet.hideSheet();

  quests.forEach(q => {
    if (q.checkFn()) {
      addQuestIfNotExists(q.name);
    }
  });
}

// === Додавання квеста ===
function addQuestIfNotExists(name) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let questSheet = ss.getSheetByName('Quests_Log');
  if (!questSheet) {
    questSheet = ss.insertSheet('Quests_Log');
  }
  questSheet.hideSheet();

  const records = questSheet.getDataRange().getValues();
  const already = records.some(r => r[0] === name);
  if (already) return;

  questSheet.appendRow([name, new Date(), true]);

  // показати на Dashboard
  let dash = ss.getSheetByName('Dashboard');
  if (!dash) dash = ss.insertSheet('Dashboard');

  let row = 6;
  while (dash.getRange(row, 4).getValue() !== "") row++;
  dash.getRange(row, 4).setValue(name);
}


// === Допоміжні функції ===
function groupByDate(data) {
  const map = {};
  data.forEach(r => {
    const date = r[0];
    const name = r[1];
    const level = r[2];
    if (!map[date]) map[date] = [];
    map[date].push({name, level});
  });
  return map;
}

// === Логіка квестів ===

// Колекціонер: зібрати кожну ачівку хоча б 1 рівня
function isQuestCompleted_Collector(data) {
  const needed = ["🎯Точність", "🧗Наполегливість", "🏃Спрінт", "🎓Сам собі вчитель", "💡Майстер пояснень", "🎨Креативність"];
  return needed.every(n => data.some(r => r[1] === n && Number(r[2]) >= 1));
}

// Марафон: 8 разів отримати Спрінт ≥1
function isQuestCompleted_Marathon(data) {
  const sprints = data.filter(r => r[1] === "🏃Спрінт" && Number(r[2]) >= 1);
  return sprints.length >= 8;
}

// Зростання: 3 різні ачівки з рівнем ≥3
function isQuestCompleted_Growth(data) {
  const unique = new Set(data.filter(r => Number(r[2]) >= 3).map(r => r[1]));
  return unique.size >= 3;
}

// Дослідник: 3 різні ачівки в один день
function isQuestCompleted_Explorer(data) {
  const byDate = groupByDate(data.filter(r => /\d/.test(r[0])));
  return Object.values(byDate).some(list => {
    const uniq = new Set(list.map(r => r.name));
    return uniq.size >= 3;
  });
}

// Вибух продуктивності: 5 різні ачівки в один день
function isQuestCompleted_Burst(data) {
  const byDate = groupByDate(data.filter(r => /\d/.test(r[0])));
  return Object.values(byDate).some(list => {
    const uniq = new Set(list.map(r => r.name));
    return uniq.size >= 5;
  });
}



// Майстер колекцій: три спеціальні ачівки ≥2
function isQuestCompleted_Collections(data) {
  const needed = ["🎓Сам собі вчитель", "💡Майстер пояснень", "🎨Креативність"];
  return needed.every(n => data.some(r => r[1] === n && Number(r[2]) >= 2));
}

// Баланс: Точність, Наполегливість, Спрінт ≥1 протягом 1 тижня
function isQuestCompleted_Balance(data) {
  const byDate = groupByDate(data);
  const dates = Object.keys(byDate);
  for (let d of dates) {
    const day = new Date(d);
    const weekEnd = new Date(day);
    weekEnd.setDate(weekEnd.getDate() + 6);

    const inWeek = data.filter(r => {
      const t = new Date(r[0]);
      return t >= day && t <= weekEnd;
    }).map(r => r[1]);

    if (["🎯Точність", "🧗Наполегливість", "🏃Спрінт"].every(n => inWeek.includes(n))) {
      return true;
    }
  }
  return false;
}

// Прорив: будь-яка ачівка рівень ≥5
function isQuestCompleted_Breakthrough(data) {
  return data.some(r => Number(r[2]) >= 5);
}

// Перфекціоніст: Точність ≥3 в один день
function isQuestCompleted_Perfectionist(data) {
  const byDate = groupByDate(data);
  return Object.values(byDate).some(list => list.some(r => r.name === "🎯Точність" && Number(r.level) >= 3));
}

// Вчитель-натхненник: сумарно ≥5 рівнів у трьох бонусних
function isQuestCompleted_Teacher(data) {
  const names = ["🎓Сам собі вчитель", "💡Майстер пояснень", "🎨Креативність"];
  let total = 0;
  data.forEach(r => {
    if (names.includes(r[1])) total += Number(r[2]);
  });
  return total >= 5;
}

// Майстер квестів: виконати 5 різних квестів
function isQuestCompleted_QuestMaster() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const qSheet = ss.getSheetByName('Quests_Log');
  if (!qSheet) return false;
  const data = qSheet.getDataRange().getValues();
  return data.length >= 6; // 1 рядок заголовків + 5 виконаних
}
