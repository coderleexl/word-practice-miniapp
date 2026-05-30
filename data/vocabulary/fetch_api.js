/**
 * 使用 Free Dictionary API 获取单词数据
 * API: https://api.dictionaryapi.dev/api/v2/entries/en/{word}
 */

const https = require('https');
const fs = require('fs');

function fetchWord(word) {
  return new Promise((resolve, reject) => {
    const url = `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`;

    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (Array.isArray(json) && json.length > 0) {
            const entry = json[0];
            const phonetic = entry.phonetics?.find(p => p.text)?.text || '';
            const meanings = entry.meanings?.map(m => {
              const partOfSpeech = m.partOfSpeech;
              const definitions = m.definitions?.slice(0, 2).map(d => d.definition).join('; ');
              return `${partOfSpeech}. ${definitions}`;
            }).join(' | ') || '';

            const example = entry.meanings?.[0]?.definitions?.[0]?.example || '';

            resolve({
              word: entry.word,
              phonetic: phonetic,
              meaning: meanings,
              example: example
            });
          } else {
            resolve(null);
          }
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

async function fetchWords(wordList, delay = 1000) {
  const results = [];

  for (const word of wordList) {
    try {
      const data = await fetchWord(word);
      if (data) {
        results.push(data);
        console.log(`✓ ${word}`);
      } else {
        console.log(`✗ ${word} (not found)`);
      }
    } catch (e) {
      console.log(`✗ ${word} (error: ${e.message})`);
    }

    // Delay to avoid rate limiting
    await new Promise(r => setTimeout(r, delay));
  }

  return results;
}

function toCSV(words, bookName, unitName) {
  const header = 'book,unit,word,phonetic,meaning,example,example_translation';
  const rows = words.map(w => {
    const escape = (s) => `"${(s || '').replace(/"/g, '""')}"`;
    return [
      escape(bookName),
      escape(unitName),
      escape(w.word),
      escape(w.phonetic),
      escape(w.meaning),
      escape(w.example),
      escape('')  // API doesn't provide Chinese translation
    ].join(',');
  });
  return [header, ...rows].join('\n');
}

// 示例单词列表
const sampleWords = [
  'abandon', 'ability', 'able', 'abnormal', 'aboard',
  'abolish', 'about', 'above', 'abroad', 'absence',
  'absolute', 'absorb', 'abstract', 'absurd', 'abundance'
];

// 命令行使用
if (require.main === module) {
  const args = process.argv.slice(2);
  const words = args.length > 0 ? args : sampleWords;

  console.log(`Fetching ${words.length} words...`);
  fetchWords(words).then(results => {
    const csv = toCSV(results, '四级英语', 'Unit 1');
    fs.writeFileSync('fetched_words.csv', csv, 'utf8');
    console.log(`\nSaved ${results.length} words to fetched_words.csv`);
  });
}

module.exports = { fetchWord, fetchWords, toCSV };
