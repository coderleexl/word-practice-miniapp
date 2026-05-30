/**
 * 将 KyleBing/english-vocabulary 格式转换为小程序格式
 *
 * 源格式：
 * {
 *   "word": "talk",
 *   "us": "tɔk",
 *   "uk": "tɔːk",
 *   "translations": [{"translation": "说话", "type": "v"}],
 *   "phrases": [{"phrase": "talk about", "translation": "谈论"}],
 *   "sentences": [{"sentence": "I talk.", "translation": "我说话。"}]
 * }
 *
 * 目标格式：
 * {
 *   "word": "talk",
 *   "phonetic": "/tɔːk/",
 *   "meaning": "v. 说话；谈话",
 *   "example": "I could hear Sarah talking.",
 *   "exampleTranslation": "我听到萨拉在讲话。"
 * }
 */

const fs = require('fs');
const path = require('path');

function convertWord(item) {
  // 合并所有释义
  const meanings = item.translations
    ? item.translations.map(t => `${t.type} ${t.translation}`).join('；')
    : '';

  // 获取第一个例句
  const example = item.sentences && item.sentences.length > 0
    ? item.sentences[0].sentence
    : '';
  const exampleTranslation = item.sentences && item.sentences.length > 0
    ? item.sentences[0].translation
    : '';

  // 音标优先用英式
  const phonetic = item.uk ? `/${item.uk}/` : (item.us ? `/${item.us}/` : '');

  return {
    word: item.word,
    phonetic: phonetic,
    meaning: meanings,
    example: example,
    exampleTranslation: exampleTranslation
  };
}

function convertFile(inputPath, outputPath, bookName, unitName) {
  const rawData = JSON.parse(fs.readFileSync(inputPath, 'utf8'));

  // 支持数组或单个对象
  const items = Array.isArray(rawData) ? rawData : [rawData];

  const converted = items.map(item => {
    const word = convertWord(item);
    word.book = bookName;
    word.unit = unitName;
    return word;
  });

  // 转成 CSV 格式
  const header = 'book,unit,word,phonetic,meaning,example,example_translation';
  const rows = converted.map(w => {
    const escape = (s) => `"${(s || '').replace(/"/g, '""')}"`;
    return [
      escape(w.book),
      escape(w.unit),
      escape(w.word),
      escape(w.phonetic),
      escape(w.meaning),
      escape(w.example),
      escape(w.exampleTranslation)
    ].join(',');
  });

  const csv = [header, ...rows].join('\n');
  fs.writeFileSync(outputPath, csv, 'utf8');
  console.log(`Converted ${converted.length} words to ${outputPath}`);
  return converted.length;
}

// 批量转换目录下所有 JSON 文件
function convertDirectory(inputDir, outputDir, bookName) {
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const files = fs.readdirSync(inputDir).filter(f => f.endsWith('.json'));
  let total = 0;

  files.forEach(file => {
    const inputPath = path.join(inputDir, file);
    const unitName = path.basename(file, '.json');
    const outputPath = path.join(outputDir, `${unitName}.csv`);

    try {
      const count = convertFile(inputPath, outputPath, bookName, unitName);
      total += count;
    } catch (e) {
      console.error(`Error converting ${file}:`, e.message);
    }
  });

  console.log(`\nTotal: ${total} words from ${files.length} files`);
}

// 导出
module.exports = { convertWord, convertFile, convertDirectory };

// 命令行使用
if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.length < 3) {
    console.log('Usage: node convert.js <inputDir> <outputDir> <bookName>');
    console.log('Example: node convert.js ./json ./csv "初中英语"');
    process.exit(1);
  }
  convertDirectory(args[0], args[1], args[2]);
}
