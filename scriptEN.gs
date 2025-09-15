let homeworkAttempts = {};

function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('🧮 Math XP')
    .addSubMenu(ui.createMenu('✅ Class Tasks')
      .addItem('+5 XP: Simple', 'classSimple')
      .addItem('+10 XP: Medium', 'classMedium')
      .addItem('+15 XP: Hard', 'classHard')
    )
    .addSubMenu(ui.createMenu('🏠 Homework')
      .addItem('+10 XP: Simple — correct immediately', 'homeworkSimpleCorrect')
      .addItem('+20 XP: Medium — correct immediately', 'homeworkMediumCorrect')
      .addItem('+30 XP: Hard — correct immediately', 'homeworkHardCorrect')
      .addSeparator()
      .addItem('+1 XP: Attempt', 'homeworkAttempt')
      .addItem('✅ Completed: Simple — enter attempts', 'homeworkSimpleFinal')
      .addItem('✅ Completed: Medium — enter attempts', 'homeworkMediumFinal')
      .addItem('✅ Completed: Hard — enter attempts', 'homeworkHardFinal')
    )
    .addSubMenu(ui.createMenu('✨ Bonuses')
      .addItem('+10 XP: Self-found mistake', 'bonusSelfFix')
      .addItem('+5 XP: Good explanation', 'bonusExplain')
      .addItem('+15 XP: Creative approach / new task', 'bonusCreative')
    )
    .addToUi();
}

// === Add XP record ===
function addXP(type, points) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Data');
  sheet.appendRow([new Date(), type, points]);
  checkAchievements(); // Check achievements after XP is added
  checkQuests();
}

// === Check achievements ===
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

// === Log achievements ===
function addAchievementIfNotExists(name, dateStr, level, achSheet) {
  const records = achSheet.getDataRange().getValues();
  const alreadyLogged = records.some(row => row[0] === dateStr && row[1] === name && row[2] === level);
  if (alreadyLogged) return;

  let xp=0;
  if(level>0){
    xp = 10+level*10;
    achSheet.appendRow([dateStr, name, level, true]);
    const dataSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Data');
    dataSheet.appendRow([new Date(), `Achievement: ${name} (level ${level})`, xp]);
  }

}


// === Update achievements list ===
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

  dashboard.getRange('A6').setValue('Achievements:');
  if (achievements.length === 0) {
    dashboard.getRange('B6').setValue('No achievements');
  } else {
    dashboard.getRange(6, 2, achievements.length).setValues(achievements.map(a => [a]));
  }

  // Optional: adjust column width for better appearance
  dashboard.autoResizeColumn(1);
  dashboard.autoResizeColumn(2);
}

// === Shop mechanic ===
function buySelectedItems() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Shop");
  const range = sheet.getActiveRange();
  const row = range.getRow();
  const col = range.getColumn();

  // Only allow selection in columns B (2), C (3), or D (4) and from row 2 down
  if (row < 2 || col < 2 || col > 4) {
    SpreadsheetApp.getUi().alert("Select a cell in column B, C, or D (row 2 or lower).");
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
  SpreadsheetApp.getUi().alert(`Item  "${itemName}" purchased, add the image to Dashboard`);

  SpreadsheetApp.flush();
}





// === Class tasks ===
function classSimple() { addXP("Class: Simple task", 5); }
function classMedium() { addXP("Class: Medium task", 10); }
function classHard()   { addXP("Class: Hard task", 15); }

// === Homework — immediately correct ===
function homeworkSimpleCorrect() { addXP("Homework: Simple correct immediately", 10); }
function homeworkMediumCorrect() { addXP("Homework: Medium correct immediately", 20); }
function homeworkHardCorrect()   { addXP("Homework: Hard correct immediately", 30); }

// === Homework — attempts ===
function homeworkAttempt() {
  const taskId = getTaskId();
  if (!homeworkAttempts[taskId]) homeworkAttempts[taskId] = 1;
  else homeworkAttempts[taskId]++;
  addXP("Homework: attempt with mistake", 1);
}

// === Homework completion with attempts ===
function homeworkSimpleFinal()   { finalizeHomework("Simple", 10); }
function homeworkMediumFinal()   { finalizeHomework("Medium", 20); }
function homeworkHardFinal()     { finalizeHomework("Hard", 30); }

function finalizeHomework(level, baseXP) {
  const ui = SpreadsheetApp.getUi();
  const taskId = getTaskId();

  const response = ui.prompt(`How many attempts in task (${level})?`, ui.ButtonSet.OK_CANCEL);
  if (response.getSelectedButton() !== ui.Button.OK) return;

  const attempts = parseInt(response.getResponseText());
  if (isNaN(attempts) || attempts < 1) {
    ui.alert("Invalid number of attempts.");
    return;
  }

  const bonusXP = Math.max(baseXP - attempts, 1);
  addXP(`Homework: ${level} completed with ${attempts} attempts`, bonusXP);
}

// === Bonuses ===
function bonusSelfFix()   { addXP("Bonus: Self-found mistake", 10); }
function bonusExplain()   { addXP("Bonus: Good explanation", 5); }
function bonusCreative()  { addXP("Bonus: Creative approach / new task", 15); }

// === Task ID generator ===
function getTaskId() {
  const now = new Date();
  return now.toISOString().slice(0, 10) + '-' + now.getHours();
}

// === Achievements ===
function checkSprint(data, achSheet) {
  const today = new Date().toDateString();
  const classTasksToday = data.filter(row => {
    const date = new Date(row[0]).toDateString();
    const type = row[1];
    return date === today && type.includes("Class");
  });

  const count = classTasksToday.length;

  let level = 0;
  level = Math.floor(count / 5);
  if (level > 0) addAchievementIfNotExists("🏃‍♂️Sprint", today, level, achSheet);
}

// Accuracy – at least 2 homework tasks correct in one day
function checkAccuracy(data, achSheet) {
  const today = new Date().toDateString();
  const correctHomeworksToday = data.filter(row => {
    const date = new Date(row[0]).toDateString();
    const type = row[1];
    return date === today && type.includes("Homework") && !type.includes("attempt") && type.includes("immediately");
  });

  const count = correctHomeworksToday.length;
  let level = Math.floor(count / 2);
  addAchievementIfNotExists("🎯Accuracy", today, level, achSheet);
  
}

function checkPersistence(data, achSheet) {
  const today = new Date().toDateString();
  const attemptsToday = data.filter(row => {
    const date = new Date(row[0]).toDateString();
    const type = row[1];
    return date === today && type.includes("attempt");
  });


  const count = attemptsToday.length;
  let level = Math.floor(count / 2);
  addAchievementIfNotExists("🧗Persistence", today, level, achSheet);

}

function checkSelfTeacher(data, achSheet) {
  const count = data.filter(row => row[1] === "Bonus: Self-found mistake").length;
  let level = Math.floor(count / 3);
  addAchievementIfNotExists("🎓Self-Teacher", "total", level, achSheet);

}

// Explanation Master – 3 bonuses "Good explanation"
function checkExplanationMaster(data, achSheet) {
  const count = data.filter(row => row[1] === "Bonus: Good explanation").length;
  let level = Math.floor(count / 3);
  addAchievementIfNotExists("💡Explanation Master", "total", level, achSheet);
}

// Creativity – 3 bonuses "Creative approach / new task"
function checkCreativity(data, achSheet) {
  const count = data.filter(row => row[1] === "Bonus: Creative approach / new task").length;
  let level = Math.floor(count / 3);
  addAchievementIfNotExists("🎨Creativity", "total", level, achSheet);
}


// === Quests ===
function checkQuests() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const achSheet = ss.getSheetByName('Achievements_Log');
  if (!achSheet) return;
  
  const data = achSheet.getDataRange().getValues().slice(1) // skip headers
    .filter(r => Number(r[2]) > 0); // level> 0


  const quests = [
    {name: "🃏 Collector 🃏", checkFn: () => isQuestCompleted_Collector(data)},
    {name: "🏃‍♂️ Marathon 🏃‍♂️", checkFn: () => isQuestCompleted_Marathon(data)},
    {name: "🌱 Growth 🌱", checkFn: () => isQuestCompleted_Growth(data)},
    {name: "🧭 Explorer 🧭", checkFn: () => isQuestCompleted_Explorer(data)},
    {name: "⚡ Productivity Burst ⚡", checkFn: () => isQuestCompleted_Burst(data)},
    {name: "🎨 Master of Collections 🎨", checkFn: () => isQuestCompleted_Collections(data)},
    {name: "⚖️ Balance ⚖️", checkFn: () => isQuestCompleted_Balance(data)},
    {name: "🚀 Breakthrough 🚀", checkFn: () => isQuestCompleted_Breakthrough(data)},
    {name: "🎯 Perfectionist 🎯", checkFn: () => isQuestCompleted_Perfectionist(data)},
    {name: "📚 Inspiring Teacher 📚", checkFn: () => isQuestCompleted_Teacher(data)},
    {name: "🏆 Quest Master 🏆", checkFn: () => isQuestCompleted_QuestMaster()}
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

// === Add quest ===
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

  // show in Dashboard
  let dash = ss.getSheetByName('Dashboard');
  if (!dash) dash = ss.insertSheet('Dashboard');

  let row = 6;
  while (dash.getRange(row, 4).getValue() !== "") row++;
  dash.getRange(row, 4).setValue(name);
}


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




function isQuestCompleted_Collector(data) {
  const needed = ["🎯Accuracy", "🧗Persistence", "🏃‍♂️Sprint", "🎓Self-Teacher", "💡Explanation Master", "🎨Creativity"];
  return needed.every(n => data.some(r => r[1] === n && Number(r[2]) >= 1));
}


function isQuestCompleted_Marathon(data) {
  const sprints = data.filter(r => r[1] === "🏃‍♂️Sprint" && Number(r[2]) >= 1);
  return sprints.length >= 8;
}


function isQuestCompleted_Growth(data) {
  const unique = new Set(data.filter(r => Number(r[2]) >= 3).map(r => r[1]));
  return unique.size >= 3;
}


function isQuestCompleted_Explorer(data) {
  const byDate = groupByDate(data.filter(r => /\d/.test(r[0])));
  return Object.values(byDate).some(list => {
    const uniq = new Set(list.map(r => r.name));
    return uniq.size >= 3;
  });
}


function isQuestCompleted_Burst(data) {
  const byDate = groupByDate(data.filter(r => /\d/.test(r[0])));
  return Object.values(byDate).some(list => {
    const uniq = new Set(list.map(r => r.name));
    return uniq.size >= 5;
  });
}




function isQuestCompleted_Collections(data) {
  const needed = ["🎓Self-Teacher", "💡Explanation Master", "🎨Creativity"];
  return needed.every(n => data.some(r => r[1] === n && Number(r[2]) >= 2));
}


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

    if (["🎯Accuracy", "🧗Persistence", "🏃‍♂️Sprint"].every(n => inWeek.includes(n))) {
      return true;
    }
  }
  return false;
}

function isQuestCompleted_Breakthrough(data) {
  return data.some(r => Number(r[2]) >= 5);
}


function isQuestCompleted_Perfectionist(data) {
  const byDate = groupByDate(data);
  return Object.values(byDate).some(list => list.some(r => r.name === "🎯Accuracy" && Number(r.level) >= 3));
}


function isQuestCompleted_Teacher(data) {
  const names = ["🎓Self-Teacher", "💡Explanation Master", "🎨Creativity"];
  let total = 0;
  data.forEach(r => {
    if (names.includes(r[1])) total += Number(r[2]);
  });
  return total >= 5;
}


function isQuestCompleted_QuestMaster() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const qSheet = ss.getSheetByName('Quests_Log');
  if (!qSheet) return false;
  const data = qSheet.getDataRange().getValues();
  return data.length >= 6; // 1 header + 5 complited
}
