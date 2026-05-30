/**
 * 练习引擎
 * 支持 5 种题型：
 *   meaning   - 看英文选中文
 *   word      - 看中文选英文
 *   spelling  - 拼写单词
 *   matching  - 单词释义配对
 *   cloze     - 例句填空
 */

/**
 * 洗牌
 */
function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    var temp = a[i]; a[i] = a[j]; a[j] = temp;
  }
  return a;
}

/**
 * 从候选词中取干扰项（排除正确答案）
 */
function pickDistractors(allWords, answerWord, count) {
  const pool = allWords.filter((w) => w._id !== answerWord._id);
  // 优先同单元、同难度
  const sameUnit = pool.filter((w) => w.unitId === answerWord.unitId);
  const sameDifficulty = pool.filter((w) => w.difficulty === answerWord.difficulty);
  const preferred = shuffle([...sameUnit, ...sameDifficulty].filter((w, i, arr) =>
    arr.findIndex((x) => x._id === w._id) === i
  ));
  if (preferred.length >= count) return preferred.slice(0, count);
  return shuffle(pool).slice(0, count);
}

/**
 * 生成看英文选中文题
 */
function makeMeaningQuestion(word, allWords) {
  const distractors = pickDistractors(allWords, word, 3);
  const options = shuffle([word, ...distractors]).map((w) => ({
    label: w.meaning,
    value: w._id
  }));
  return {
    id: "q-meaning-" + word._id,
    type: "meaning",
    typeLabel: "看英文选中文",
    word: word,
    prompt: word.word,
    hint: word.phonetic || "",
    answer: word._id,
    options: options
  };
}

/**
 * 生成看中文选英文题
 */
function makeWordQuestion(word, allWords) {
  const distractors = pickDistractors(allWords, word, 3);
  const options = shuffle([word, ...distractors]).map((w) => ({
    label: w.word,
    value: w._id
  }));
  return {
    id: "q-word-" + word._id,
    type: "word",
    typeLabel: "看中文选英文",
    word: word,
    prompt: word.meaning,
    hint: word.exampleTranslation || word.example || "",
    answer: word._id,
    options: options
  };
}

/**
 * 生成拼写单词题
 */
function makeSpellingQuestion(word) {
  return {
    id: "q-spelling-" + word._id,
    type: "spelling",
    typeLabel: "拼写单词",
    word: word,
    prompt: word.meaning,
    hint: word.phonetic || "",
    // 打乱字母作为提示
    scrambled: shuffle(word.word.toLowerCase().split("")).join(""),
    answer: word.word.toLowerCase(),
    answerDisplay: word.word
  };
}

/**
 * 生成单词释义配对题（返回一组，一个配对题包含多对）
 */
function makeMatchingQuestions(words, count) {
  const pool = shuffle(words).slice(0, count || 5);
  return {
    id: "q-matching-" + pool.map((w) => w._id).join("-"),
    type: "matching",
    typeLabel: "单词释义配对",
    pairs: pool.map((w) => ({
      wordId: w._id,
      word: w.word,
      meaning: w.meaning
    })),
    shuffledWords: shuffle(pool.map((w) => ({ wordId: w._id, word: w.word }))),
    shuffledMeanings: shuffle(pool.map((w) => ({ wordId: w._id, meaning: w.meaning })))
  };
}

/**
 * 生成例句填空题
 */
function makeClozeQuestion(word, allWords) {
  if (!word.example) {
    // 没有例句时退化为拼写题
    return makeSpellingQuestion(word);
  }
  const blank = word.word;
  const blankedExample = word.example.replace(
    new RegExp("\\b" + blank + "\\b", "gi"),
    "______"
  );
  // 如果没有替换成功（单词不在例句中），也退化
  if (blankedExample === word.example) {
    return makeSpellingQuestion(word);
  }
  const distractors = pickDistractors(allWords, word, 3);
  const options = shuffle([word, ...distractors]).map((w) => ({
    label: w.word,
    value: w._id
  }));
  return {
    id: "q-cloze-" + word._id,
    type: "cloze",
    typeLabel: "例句填空",
    word: word,
    prompt: blankedExample,
    hint: word.exampleTranslation || "",
    answer: word._id,
    options: options
  };
}

/**
 * 根据题型生成单题
 */
function makeQuestionByType(type, word, allWords) {
  switch (type) {
    case "meaning": return makeMeaningQuestion(word, allWords);
    case "word": return makeWordQuestion(word, allWords);
    case "spelling": return makeSpellingQuestion(word);
    case "cloze": return makeClozeQuestion(word, allWords);
    default: return makeMeaningQuestion(word, allWords);
  }
}

/**
 * 生成一组练习题
 * @param {Array} words - 词表
 * @param {Object} opts - { count, types, reviewWordIds }
 *   count: 题量，默认词表长度
 *   types: 题型比例，如 { meaning: 2, word: 2, spelling: 1, cloze: 1 }
 *   reviewWordIds: 需要重点复习的单词 id 列表
 */
function generatePractice(words, opts) {
  opts = opts || {};
  var count = opts.count || words.length;
  var types = opts.types || { meaning: 1, word: 1 };
  var reviewWordIds = opts.reviewWordIds || [];

  // 构建题型池
  var typePool = [];
  var typeKeys = Object.keys(types);
  for (var i = 0; i < typeKeys.length; i++) {
    var t = typeKeys[i];
    if (t === "matching") continue; // 配对题单独处理
    for (var j = 0; j < types[t]; j++) {
      typePool.push(t);
    }
  }
  if (typePool.length === 0) {
    typePool = ["meaning", "word"];
  }

  // 选词：复习词优先
  var reviewWords = words.filter((w) => reviewWordIds.indexOf(w._id) >= 0);
  var normalWords = words.filter((w) => reviewWordIds.indexOf(w._id) < 0);
  var selectedWords = [];
  var reviewCount = Math.min(Math.ceil(count * 0.4), reviewWords.length);
  selectedWords = selectedWords.concat(shuffle(reviewWords).slice(0, reviewCount));
  var remain = count - selectedWords.length;
  selectedWords = selectedWords.concat(shuffle(normalWords).slice(0, remain));
  selectedWords = shuffle(selectedWords);

  // 生成题目
  var questions = [];
  for (var k = 0; k < selectedWords.length && questions.length < count; k++) {
    var type = typePool[k % typePool.length];
    questions.push(makeQuestionByType(type, selectedWords[k], words));
  }

  // 如果需要配对题
  if (types.matching && types.matching > 0 && words.length >= 3) {
    questions.push(makeMatchingQuestions(words, Math.min(5, words.length)));
  }

  return questions;
}

/**
 * 检查答案
 * @param {Object} question
 * @param {*} userAnswer - 选择题传 option value，拼写传字符串，配对传 { wordId: meaningId } 映射
 * @returns {Object} { correct, detail }
 */
function checkAnswer(question, userAnswer) {
  if (question.type === "spelling") {
    var correct = (userAnswer || "").trim().toLowerCase() === question.answer;
    return {
      correct: correct,
      detail: correct
        ? question.word.word + " = " + question.word.meaning
        : "正确拼写: " + question.answerDisplay
    };
  }

  if (question.type === "matching") {
    // userAnswer: { wordId: meaningId, ... }
    var pairs = question.pairs;
    var allCorrect = true;
    for (var i = 0; i < pairs.length; i++) {
      if (userAnswer[pairs[i].wordId] !== pairs[i].wordId) {
        allCorrect = false;
        break;
      }
    }
    return {
      correct: allCorrect,
      detail: allCorrect ? "全部配对正确！" : "有配对错误，请再试一次"
    };
  }

  // 选择题：meaning / word / cloze
  var isCorrect = userAnswer === question.answer;
  return {
    correct: isCorrect,
    detail: isCorrect
      ? question.word.word + " = " + question.word.meaning
      : "正确答案: " + question.word.word + " = " + question.word.meaning
  };
}

module.exports = {
  shuffle,
  generatePractice,
  makeQuestionByType,
  makeMatchingQuestions,
  checkAnswer,
  QUESTION_TYPES: ["meaning", "word", "spelling", "matching", "cloze"]
};
