/**
 * 本地存储管理
 * 所有数据持久化到 wx.Storage，key 统一管理避免冲突。
 */

const KEYS = {
  BOOKS: "wp_books",
  UNITS: "wp_units",
  WORDS: "wp_words",
  PRACTICE_RECORDS: "wp_practice_records",
  REVIEW_ITEMS: "wp_review_items",
  EXAM_RECORDS: "wp_exam_records",
  USER_STATS: "wp_user_stats",
  SELECTED_BOOK: "wp_selected_book",
  SELECTED_UNIT: "wp_selected_unit"
};

// ── 基础读写 ──

function get(key, fallback) {
  try {
    const raw = wx.getStorageSync(key);
    return raw || fallback;
  } catch (e) {
    return fallback;
  }
}

function set(key, value) {
  try {
    wx.setStorageSync(key, value);
  } catch (e) {
    console.error("storage.set failed:", key, e);
  }
}

// ── ID 生成 ──

function generateId(prefix) {
  return prefix + "_" + Date.now() + "_" + Math.random().toString(36).slice(2, 8);
}

// ── 教材 Books ──

function getBooks() {
  return get(KEYS.BOOKS, []);
}

function saveBook(book) {
  const books = getBooks();
  const existing = books.findIndex((b) => b._id === book._id);
  if (existing >= 0) {
    books[existing] = { ...books[existing], ...book, updatedAt: Date.now() };
  } else {
    book._id = book._id || generateId("book");
    book.createdAt = Date.now();
    books.push(book);
  }
  set(KEYS.BOOKS, books);
  return book;
}

function deleteBook(bookId) {
  const books = getBooks().filter((b) => b._id !== bookId);
  set(KEYS.BOOKS, books);
  // 同时删除关联的单元和单词
  const units = getUnits().filter((u) => u.bookId !== bookId);
  set(KEYS.UNITS, units);
  const words = getWords().filter((w) => w.bookId !== bookId);
  set(KEYS.WORDS, words);
}

function getSelectedBookId() {
  return get(KEYS.SELECTED_BOOK, null);
}

function setSelectedBookId(bookId) {
  set(KEYS.SELECTED_BOOK, bookId);
}

// ── 单元 Units ──

function getUnits(bookId) {
  const all = get(KEYS.UNITS, []);
  return bookId ? all.filter((u) => u.bookId === bookId) : all;
}

function saveUnit(unit) {
  const units = getUnits();
  const existing = units.findIndex((u) => u._id === unit._id);
  if (existing >= 0) {
    units[existing] = { ...units[existing], ...unit };
  } else {
    unit._id = unit._id || generateId("unit");
    unit.createdAt = Date.now();
    units.push(unit);
  }
  set(KEYS.UNITS, units);
  return unit;
}

function deleteUnit(unitId) {
  const units = getUnits().filter((u) => u._id !== unitId);
  set(KEYS.UNITS, units);
  const words = getWords().filter((w) => w.unitId !== unitId);
  set(KEYS.WORDS, words);
}

function getSelectedUnitId() {
  return get(KEYS.SELECTED_UNIT, null);
}

function setSelectedUnitId(unitId) {
  set(KEYS.SELECTED_UNIT, unitId);
}

// ── 单词 Words ──

function getWords(filter) {
  const all = get(KEYS.WORDS, []);
  if (!filter) return all;
  return all.filter((w) => {
    if (filter.bookId && w.bookId !== filter.bookId) return false;
    if (filter.unitId && w.unitId !== filter.unitId) return false;
    return true;
  });
}

function saveWords(wordList) {
  const all = getWords();
  const existingIds = new Set(all.map((w) => w._id));
  const wordById = {};
  all.forEach((w) => { wordById[w._id] = w; });

  wordList.forEach((w) => {
    if (w._id && existingIds.has(w._id)) {
      wordById[w._id] = { ...wordById[w._id], ...w };
    } else {
      w._id = w._id || generateId("word");
      w.createdAt = Date.now();
      wordById[w._id] = w;
    }
  });

  set(KEYS.WORDS, Object.values(wordById));
}

function saveWord(word) {
  saveWords([word]);
  return word;
}

function deleteWords(filter) {
  const all = getWords();
  const remaining = all.filter((w) => {
    if (filter.wordId && w._id === filter.wordId) return false;
    if (filter.bookId && w.bookId === filter.bookId) return false;
    if (filter.unitId && w.unitId === filter.unitId) return false;
    return true;
  });
  set(KEYS.WORDS, remaining);
}

// ── 练习记录 PracticeRecords ──

function getPracticeRecords(userId) {
  const all = get(KEYS.PRACTICE_RECORDS, []);
  return userId ? all.filter((r) => r.userId === userId) : all;
}

function savePracticeRecord(record) {
  const records = getPracticeRecords();
  record._id = record._id || generateId("record");
  record.createdAt = Date.now();
  records.push(record);
  // 保留最近 5000 条
  if (records.length > 5000) {
    records.splice(0, records.length - 5000);
  }
  set(KEYS.PRACTICE_RECORDS, records);
  return record;
}

// ── 错题复习 ReviewItems ──

function getReviewItems(userId) {
  const all = get(KEYS.REVIEW_ITEMS, []);
  return userId ? all.filter((r) => r.userId === userId) : all;
}

function saveReviewItem(item) {
  const items = getReviewItems();
  const existing = items.findIndex((r) => r.wordId === item.wordId);
  const now = Date.now();

  if (existing >= 0) {
    const old = items[existing];
    const newWrongCount = (old.wrongCount || 0) + 1;
    // 复习间隔递进策略
    // 错1次：当天复习（立即可用）
    // 错2次：次日复习
    // 错3次以上：3天后复习（重点复习）
    let nextReviewAt;
    if (newWrongCount <= 1) {
      nextReviewAt = now; // 立即可复习
    } else if (newWrongCount === 2) {
      nextReviewAt = now + 24 * 60 * 60 * 1000; // 次日
    } else {
      nextReviewAt = now + 3 * 24 * 60 * 60 * 1000; // 3天后
    }

    items[existing] = {
      ...old,
      wrongCount: newWrongCount,
      lastWrongAt: now,
      nextReviewAt: nextReviewAt,
      mastered: false,
      priority: newWrongCount >= 3 ? "high" : "normal" // 错3次以上标记为重点
    };
  } else {
    items.push({
      _id: generateId("review"),
      userId: item.userId || "local",
      wordId: item.wordId,
      wrongCount: 1,
      nextReviewAt: now, // 首次错立即可复习
      lastWrongAt: now,
      mastered: false,
      priority: "normal"
    });
  }
  set(KEYS.REVIEW_ITEMS, items);
}

function markMastered(wordId) {
  const items = getReviewItems();
  const idx = items.findIndex((r) => r.wordId === wordId);
  if (idx >= 0) {
    items[idx].mastered = true;
    items[idx].updatedAt = Date.now();
    set(KEYS.REVIEW_ITEMS, items);
  }
}

function getDueReviewItems(userId) {
  const now = Date.now();
  return getReviewItems(userId).filter((r) => !r.mastered && r.nextReviewAt <= now);
}

// ── 模拟考试记录 ExamRecords ──

function getExamRecords() {
  return get(KEYS.EXAM_RECORDS, []);
}

function saveExamRecord(record) {
  const records = getExamRecords();
  record._id = record._id || generateId("exam");
  record.createdAt = Date.now();
  records.push(record);
  set(KEYS.EXAM_RECORDS, records);
  return record;
}

// ── 用户统计 UserStats ──

function getUserStats() {
  return get(KEYS.USER_STATS, {
    totalPractices: 0,
    totalCorrect: 0,
    totalQuestions: 0,
    streakDays: 0,
    lastPracticeDate: null,
    totalXP: 0,
    dailyXP: 0,
    dailyDate: '',
    dailyQuests: null,
    streakDates: [],
    achievements: []
  });
}

function updateUserStats(correct, total) {
  const stats = getUserStats();
  const today = new Date().toISOString().slice(0, 10);
  stats.totalPractices += 1;
  stats.totalCorrect += correct;
  stats.totalQuestions += total;

  if (stats.lastPracticeDate !== today) {
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    stats.streakDays = stats.lastPracticeDate === yesterday ? stats.streakDays + 1 : 1;
    stats.lastPracticeDate = today;
  }

  set(KEYS.USER_STATS, stats);
  return stats;
}

// ── 初始化示例数据 ──

function initSampleDataIfEmpty() {
  if (getBooks().length > 0) return;

  const bookId = generateId("book");
  saveBook({ _id: bookId, name: "示例教材", grade: "小学", publisher: "示例出版社" });

  const unitId = generateId("unit");
  saveUnit({ _id: unitId, bookId, name: "Unit 1", order: 1 });

  const sampleWords = [
    { _id: generateId("word"), bookId, unitId, word: "apple", phonetic: "/ˈæpəl/", meaning: "苹果", example: "I eat an apple every day.", exampleTranslation: "我每天吃一个苹果", difficulty: 1, tags: ["noun"] },
    { _id: generateId("word"), bookId, unitId, word: "book", phonetic: "/bʊk/", meaning: "书", example: "This is my English book.", exampleTranslation: "这是我的英语书", difficulty: 1, tags: ["noun"] },
    { _id: generateId("word"), bookId, unitId, word: "write", phonetic: "/raɪt/", meaning: "写", example: "Please write the word again.", exampleTranslation: "请再写一遍这个单词", difficulty: 2, tags: ["verb"] },
    { _id: generateId("word"), bookId, unitId, word: "school", phonetic: "/skuːl/", meaning: "学校", example: "We go to school on Monday.", exampleTranslation: "我们星期一去学校", difficulty: 1, tags: ["noun"] },
    { _id: generateId("word"), bookId, unitId, word: "happy", phonetic: "/ˈhæpi/", meaning: "开心的", example: "The child is happy.", exampleTranslation: "这个孩子很开心", difficulty: 1, tags: ["adjective"] }
  ];
  saveWords(sampleWords);
  setSelectedBookId(bookId);
  setSelectedUnitId(unitId);
}

module.exports = {
  KEYS, get, set,
  generateId,
  // Books
  getBooks, saveBook, deleteBook, getSelectedBookId, setSelectedBookId,
  // Units
  getUnits, saveUnit, deleteUnit, getSelectedUnitId, setSelectedUnitId,
  // Words
  getWords, saveWords, saveWord, deleteWords,
  // Practice
  getPracticeRecords, savePracticeRecord,
  // Review
  getReviewItems, saveReviewItem, markMastered, getDueReviewItems,
  // Exam
  getExamRecords, saveExamRecord,
  // Stats
  getUserStats, updateUserStats,
  // Init
  initSampleDataIfEmpty
};
