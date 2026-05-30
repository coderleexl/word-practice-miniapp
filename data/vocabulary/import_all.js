/**
 * 批量导入所有词库到小程序存储格式
 * 生成可直接加载到 wx.Storage 的数据
 */

const fs = require('fs');
const path = require('path');

// 生成唯一ID
function generateId(prefix) {
  return prefix + '_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
}

// 解析CSV
function parseCSV(text) {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return [];

  const headers = parseCSVLine(lines[0]);
  const rows = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const values = parseCSVLine(line);
    const row = {};
    for (let j = 0; j < headers.length; j++) {
      row[headers[j].trim()] = (values[j] || '').trim();
    }
    rows.push(row);
  }
  return rows;
}

function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += ch;
    }
  }
  result.push(current);
  return result;
}

// 处理单个CSV文件
function processCSV(filePath, bookName) {
  const content = fs.readFileSync(filePath, 'utf8');
  const rows = parseCSV(content);

  const bookId = generateId('book');
  const units = {};
  const words = [];

  rows.forEach(row => {
    const unitName = row.unit || '默认单元';
    if (!units[unitName]) {
      units[unitName] = {
        _id: generateId('unit'),
        bookId: bookId,
        name: unitName,
        order: Object.keys(units).length + 1,
        createdAt: Date.now()
      };
    }

    if (row.word && row.meaning) {
      words.push({
        _id: generateId('word'),
        bookId: bookId,
        unitId: units[unitName]._id,
        word: row.word,
        phonetic: row.phonetic || '',
        meaning: row.meaning,
        example: row.example || '',
        exampleTranslation: row.example_translation || '',
        difficulty: 1,
        tags: [],
        createdAt: Date.now()
      });
    }
  });

  return {
    book: {
      _id: bookId,
      name: bookName,
      createdAt: Date.now()
    },
    units: Object.values(units),
    words: words
  };
}

// 主函数
function main() {
  const vocabularyDir = __dirname;
  const csvFiles = [
    { file: 'business_english.csv', name: '商务英语' },
    { file: 'cpp_developer.csv', name: 'C++程序员英语' },
    { file: 'prd_ui_words.csv', name: '界面与需求' },
    { file: 'sample_cet4.csv', name: '四级英语' }
  ];

  const allBooks = [];
  const allUnits = [];
  const allWords = [];

  csvFiles.forEach(({ file, name }) => {
    const filePath = path.join(vocabularyDir, file);
    if (fs.existsSync(filePath)) {
      console.log(`Processing ${file}...`);
      const result = processCSV(filePath, name);
      allBooks.push(result.book);
      allUnits.push(...result.units);
      allWords.push(...result.words);
      console.log(`  - ${result.words.length} words in ${result.units.length} units`);
    }
  });

  // 生成存储数据
  const storageData = {
    books: allBooks,
    units: allUnits,
    words: allWords,
    timestamp: Date.now()
  };

  // 保存为JSON文件
  const outputPath = path.join(vocabularyDir, 'vocabulary_data.json');
  fs.writeFileSync(outputPath, JSON.stringify(storageData, null, 2), 'utf8');

  console.log(`\nTotal:`);
  console.log(`  - ${allBooks.length} books`);
  console.log(`  - ${allUnits.length} units`);
  console.log(`  - ${allWords.length} words`);
  console.log(`\nOutput: ${outputPath}`);

  // 生成加载脚本
  const loadScript = `
// 在小程序控制台运行此脚本加载数据
const data = ${JSON.stringify(storageData, null, 2)};

// 加载到存储
wx.setStorageSync('wp_books', data.books);
wx.setStorageSync('wp_units', data.units);
wx.setStorageSync('wp_words', data.words);

console.log('Data loaded successfully!');
console.log('Books:', data.books.length);
console.log('Units:', data.units.length);
console.log('Words:', data.words.length);
`;

  const scriptPath = path.join(vocabularyDir, 'load_data.js');
  fs.writeFileSync(scriptPath, loadScript, 'utf8');
  console.log(`\nLoad script: ${scriptPath}`);
}

main();
