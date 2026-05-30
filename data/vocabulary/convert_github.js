/**
 * 转换 KyleBing/english-vocabulary JSON 到小程序格式
 */

const fs = require('fs');
const path = require('path');

// 生成唯一ID
function generateId(prefix) {
  return prefix + '_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
}

// 解析JSON并转换
function convertJSON(inputPath, bookName) {
  const rawData = JSON.parse(fs.readFileSync(inputPath, 'utf8'));

  const bookId = generateId('book');
  const units = {};
  const words = [];

  rawData.forEach((item, index) => {
    // 创建单元（每100个单词一个单元）
    const unitIndex = Math.floor(index / 100) + 1;
    const unitName = `Unit ${unitIndex}`;

    if (!units[unitName]) {
      units[unitName] = {
        _id: generateId('unit'),
        bookId: bookId,
        name: unitName,
        order: unitIndex,
        createdAt: Date.now()
      };
    }

    // 合并释义
    const meanings = item.translations
      ? item.translations.map(t => `${t.type} ${t.translation}`).join('；')
      : '';

    // 获取短语作为例句
    const phrase = item.phrases && item.phrases.length > 0
      ? item.phrases[0].phrase
      : '';
    const phraseTranslation = item.phrases && item.phrases.length > 0
      ? item.phrases[0].translation
      : '';

    if (item.word && meanings) {
      words.push({
        _id: generateId('word'),
        bookId: bookId,
        unitId: units[unitName]._id,
        word: item.word,
        phonetic: '',
        meaning: meanings,
        example: phrase,
        exampleTranslation: phraseTranslation,
        difficulty: 1,
        tags: [],
        createdAt: Date.now()
      });
    }
  });

  return {
    book: { _id: bookId, name: bookName, createdAt: Date.now() },
    units: Object.values(units),
    words: words
  };
}

// 主函数
function main() {
  const jsonDir = '/tmp/english-vocabulary-master/json';
  const outputDir = __dirname;

  const files = [
    { file: '1-初中-顺序.json', name: '初中英语' },
    { file: '2-高中-顺序.json', name: '高中英语' },
    { file: '3-CET4-顺序.json', name: '四级英语' },
    { file: '4-CET6-顺序.json', name: '六级英语' },
    { file: '5-考研-顺序.json', name: '考研英语' },
    { file: '6-托福-顺序.json', name: '托福英语' },
    { file: '7-SAT-顺序.json', name: 'SAT英语' }
  ];

  const allBooks = [];
  const allUnits = [];
  const allWords = [];

  files.forEach(({ file, name }) => {
    const inputPath = path.join(jsonDir, file);
    if (fs.existsSync(inputPath)) {
      console.log(`Processing ${file}...`);
      const result = convertJSON(inputPath, name);
      allBooks.push(result.book);
      allUnits.push(...result.units);
      allWords.push(...result.words);
      console.log(`  - ${result.words.length} words in ${result.units.length} units`);
    }
  });

  // 保存为JSON文件
  const storageData = {
    books: allBooks,
    units: allUnits,
    words: allWords,
    timestamp: Date.now()
  };

  const outputPath = path.join(outputDir, 'github_vocabulary.json');
  fs.writeFileSync(outputPath, JSON.stringify(storageData, null, 2), 'utf8');

  console.log(`\nTotal:`);
  console.log(`  - ${allBooks.length} books`);
  console.log(`  - ${allUnits.length} units`);
  console.log(`  - ${allWords.length} words`);
  console.log(`\nOutput: ${outputPath}`);

  // 生成加载脚本
  const loadScript = `
// 在小程序控制台运行此脚本加载GitHub词库
// 注意：数据量较大，可能需要分批加载

const data = ${JSON.stringify(storageData)};

// 合并到现有数据
const existingBooks = wx.getStorageSync('wp_books') || [];
const existingUnits = wx.getStorageSync('wp_units') || [];
const existingWords = wx.getStorageSync('wp_words') || [];

// 添加新数据
wx.setStorageSync('wp_books', [...existingBooks, ...data.books]);
wx.setStorageSync('wp_units', [...existingUnits, ...data.units]);
wx.setStorageSync('wp_words', [...existingWords, ...data.words]);

console.log('GitHub vocabulary loaded!');
console.log('New books:', data.books.length);
console.log('New units:', data.units.length);
console.log('New words:', data.words.length);
console.log('Total words:', existingWords.length + data.words.length);
`;

  const scriptPath = path.join(outputDir, 'load_github_vocabulary.js');
  fs.writeFileSync(scriptPath, loadScript, 'utf8');
  console.log(`\nLoad script: ${scriptPath}`);
}

main();
