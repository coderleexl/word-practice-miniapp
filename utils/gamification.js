/**
 * 游戏化系统
 * XP经验值、连续打卡、每日任务、成就
 */

var storage = require('./storage');

var XP = {
  CORRECT: 10,
  WRONG: 2,
  ROUND_COMPLETE: 50,
  DAILY_QUEST: 20
};

var DAILY_TARGETS = {
  questions: 10,
  accuracy: 80,
  review: 5
};

/**
 * 获取今日日期字符串 YYYY-MM-DD
 */
function today() {
  var d = new Date();
  return d.getFullYear() + '-' +
    String(d.getMonth() + 1).padStart(2, '0') + '-' +
    String(d.getDate()).padStart(2, '0');
}

/**
 * 获取用户游戏化数据
 */
function getGameData() {
  var stats = storage.getUserStats();
  // 确保有游戏化字段
  if (typeof stats.totalXP === 'undefined') {
    stats.totalXP = 0;
  }
  if (typeof stats.dailyXP === 'undefined') {
    stats.dailyXP = 0;
  }
  if (!stats.dailyDate) {
    stats.dailyDate = '';
  }
  if (!stats.dailyQuests) {
    stats.dailyQuests = {
      questions: { target: DAILY_TARGETS.questions, done: 0 },
      accuracy: { target: DAILY_TARGETS.accuracy, done: 0 },
      review: { target: DAILY_TARGETS.review, done: 0 }
    };
  }
  if (!stats.streakDates) {
    stats.streakDates = [];
  }
  if (!stats.achievements) {
    stats.achievements = [];
  }
  return stats;
}

/**
 * 保存游戏化数据
 */
function saveGameData(stats) {
  storage.set(storage.KEYS.USER_STATS, stats);
}

/**
 * 重置每日数据（如果跨天了）
 */
function checkDailyReset(stats) {
  var t = today();
  if (stats.dailyDate !== t) {
    stats.dailyDate = t;
    stats.dailyXP = 0;
    stats.dailyQuests = {
      questions: { target: DAILY_TARGETS.questions, done: 0 },
      accuracy: { target: DAILY_TARGETS.accuracy, done: 0 },
      review: { target: DAILY_TARGETS.review, done: 0 }
    };
  }
  return stats;
}

/**
 * 答题后增加 XP
 * @returns {number} 本轮获得的 XP
 */
function addXPForAnswer(isCorrect) {
  var stats = getGameData();
  stats = checkDailyReset(stats);
  var amount = isCorrect ? XP.CORRECT : XP.WRONG;
  stats.totalXP += amount;
  stats.dailyXP += amount;
  saveGameData(stats);
  return amount;
}

/**
 * 完成一轮练习的奖励
 */
function addXPRoundComplete() {
  var stats = getGameData();
  stats = checkDailyReset(stats);
  stats.totalXP += XP.ROUND_COMPLETE;
  stats.dailyXP += XP.ROUND_COMPLETE;
  saveGameData(stats);
  return XP.ROUND_COMPLETE;
}

/**
 * 更新每日任务进度
 * @param {string} quest - 'questions' | 'accuracy' | 'review'
 * @param {number} value - 当前值（questions 传完成数，accuracy 传正确率，review 传复习数）
 */
function updateDailyQuest(quest, value) {
  var stats = getGameData();
  stats = checkDailyReset(stats);
  if (!stats.dailyQuests[quest]) return false;

  var prev = stats.dailyQuests[quest].done;
  stats.dailyQuests[quest].done = value;

  // 检查是否刚完成
  var justCompleted = prev < stats.dailyQuests[quest].target && value >= stats.dailyQuests[quest].target;
  if (justCompleted) {
    stats.totalXP += XP.DAILY_QUEST;
    stats.dailyXP += XP.DAILY_QUEST;
  }

  saveGameData(stats);
  return justCompleted;
}

/**
 * 记录打卡
 * 完成一轮练习后调用
 */
function recordStreak() {
  var stats = getGameData();
  var t = today();
  if (stats.streakDates.indexOf(t) >= 0) return stats.streakDates.length;
  stats.streakDates.push(t);
  // 只保留最近 365 天
  if (stats.streakDates.length > 365) {
    stats.streakDates = stats.streakDates.slice(-365);
  }
  saveGameData(stats);
  return stats.streakDates.length;
}

/**
 * 计算连续打卡天数
 */
function getStreakDays() {
  var stats = getGameData();
  var dates = stats.streakDates.sort();
  if (dates.length === 0) return 0;

  var streak = 1;
  for (var i = dates.length - 1; i > 0; i--) {
    var curr = new Date(dates[i]);
    var prev = new Date(dates[i - 1]);
    var diff = (curr - prev) / 86400000;
    if (diff === 1) {
      streak++;
    } else if (diff > 1) {
      break;
    }
  }

  // 检查今天是否已打卡
  var t = today();
  if (dates.indexOf(t) < 0) {
    var lastDate = new Date(dates[dates.length - 1]);
    var todayDate = new Date(t);
    var daysDiff = (todayDate - lastDate) / 86400000;
    if (daysDiff > 1) streak = 0; // 断了
  }

  return streak;
}

/**
 * 检查并解锁成就
 * @returns {Array} 新解锁的成就列表
 */
function checkAchievements() {
  var stats = getGameData();
  var newAchievements = [];
  var existing = stats.achievements || [];

  var allAchievements = [
    { id: 'first_practice', name: '初学者', desc: '完成第一次练习', icon: '🎓' },
    { id: 'streak_7', name: '坚持者', desc: '连续打卡 7 天', icon: '🔥' },
    { id: 'streak_30', name: '月度达人', desc: '连续打卡 30 天', icon: '💎' },
    { id: 'words_100', name: '词汇达人', desc: '累计学习 100 词', icon: '📚' },
    { id: 'perfect', name: '满分王', desc: '单次练习满分', icon: '👑' },
    { id: 'xp_1000', name: '经验丰富', desc: '累计获得 1000 XP', icon: '⭐' }
  ];

  var streakDays = getStreakDays();
  var practiceRecords = storage.getPracticeRecords();
  var uniqueWords = {};
  practiceRecords.forEach(function (r) { if (r.wordId) uniqueWords[r.wordId] = true; });
  var wordCount = Object.keys(uniqueWords).length;

  for (var i = 0; i < allAchievements.length; i++) {
    var a = allAchievements[i];
    if (existing.indexOf(a.id) >= 0) continue;

    var unlocked = false;
    switch (a.id) {
      case 'first_practice': unlocked = practiceRecords.length > 0; break;
      case 'streak_7': unlocked = streakDays >= 7; break;
      case 'streak_30': unlocked = streakDays >= 30; break;
      case 'words_100': unlocked = wordCount >= 100; break;
      case 'perfect': unlocked = practiceRecords.some(function (r) { return r.isCorrect; }) && practiceRecords.length > 0; break;
      case 'xp_1000': unlocked = stats.totalXP >= 1000; break;
    }

    if (unlocked) {
      existing.push(a.id);
      newAchievements.push(a);
    }
  }

  stats.achievements = existing;
  saveGameData(stats);
  return newAchievements;
}

/**
 * 获取每日任务列表（含进度）
 */
function getDailyQuests() {
  var stats = getGameData();
  stats = checkDailyReset(stats);
  var quests = stats.dailyQuests;

  return [
    {
      key: 'questions',
      name: '完成 ' + quests.questions.target + ' 道题',
      icon: '📝',
      done: quests.questions.done,
      target: quests.questions.target,
      completed: quests.questions.done >= quests.questions.target
    },
    {
      key: 'accuracy',
      name: '正确率达到 ' + quests.accuracy.target + '%',
      icon: '🎯',
      done: quests.accuracy.done,
      target: quests.accuracy.target,
      completed: quests.accuracy.done >= quests.accuracy.target,
      isPercent: true
    },
    {
      key: 'review',
      name: '复习 ' + quests.review.target + ' 个错题',
      icon: '📖',
      done: quests.review.done,
      target: quests.review.target,
      completed: quests.review.done >= quests.review.target
    }
  ];
}

/**
 * 获取所有成就定义
 */
function getAllAchievements() {
  return [
    { id: 'first_practice', name: '初学者', desc: '完成第一次练习', icon: '🎓' },
    { id: 'streak_7', name: '坚持者', desc: '连续打卡 7 天', icon: '🔥' },
    { id: 'streak_30', name: '月度达人', desc: '连续打卡 30 天', icon: '💎' },
    { id: 'words_100', name: '词汇达人', desc: '累计学习 100 词', icon: '📚' },
    { id: 'perfect', name: '满分王', desc: '单次练习满分', icon: '👑' },
    { id: 'xp_1000', name: '经验丰富', desc: '累计获得 1000 XP', icon: '⭐' }
  ];
}

module.exports = {
  XP: XP,
  addXPForAnswer: addXPForAnswer,
  addXPRoundComplete: addXPRoundComplete,
  updateDailyQuest: updateDailyQuest,
  recordStreak: recordStreak,
  getStreakDays: getStreakDays,
  checkAchievements: checkAchievements,
  getDailyQuests: getDailyQuests,
  getAllAchievements: getAllAchievements,
  getGameData: getGameData
};
