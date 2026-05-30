/**
 * 用 Free Dictionary API 批量获取单词
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

// 商务英语扩展词汇
const businessWords = [
  // 会议相关
  'agenda', 'minutes', 'postpone', 'attendee', 'presentation', 'proposal', 'quarterly',
  'chairperson', 'conference', 'seminar', 'workshop', 'webinar', 'panel', 'forum',
  // 谈判相关
  'negotiate', 'agreement', 'contract', 'clause', 'compromise', 'deadline', 'discount',
  'invoice', 'quotation', 'bid', 'tender', 'procurement', 'vendor', 'supplier',
  // 财务相关
  'revenue', 'profit', 'budget', 'expenditure', 'asset', 'liability', 'audit', 'dividend',
  'cashflow', 'inventory', 'depreciation', 'amortization', 'equity', 'debt', 'interest',
  // 人力资源
  'recruit', 'resume', 'probation', 'promotion', 'compensation', 'appraisal', 'terminate',
  'onboarding', 'training', 'benefits', 'pension', 'overtime', 'resignation', 'layoff',
  // 市场营销
  'brand', 'campaign', 'target', 'launch', 'competitor', 'strategy', 'survey',
  'segmentation', 'positioning', 'advertising', 'publicity', 'endorsement', 'merchandise',
  // 国际贸易
  'import', 'export', 'tariff', 'customs', 'shipment', 'warehouse', 'logistics', 'compliance',
  'freight', 'insurance', 'certificate', 'inspection', 'quarantine', 'embargo', 'sanction',
  // 商务沟通
  'memo', 'bulletin', 'circular', 'notification', 'announcement', 'feedback', 'suggestion',
  'complaint', 'inquiry', 'response', 'follow-up', 'escalation', 'resolution'
];

// C++程序员扩展词汇
const cppWords = [
  // 基础语法
  'variable', 'function', 'parameter', 'return', 'loop', 'condition', 'statement', 'syntax',
  'expression', 'operator', 'operand', 'literal', 'constant', 'enum', 'typedef', 'sizeof',
  // 数据类型
  'integer', 'floating', 'character', 'boolean', 'array', 'string', 'pointer', 'reference',
  'struct', 'union', 'class', 'void', 'auto', 'decltype', 'constexpr', 'const',
  // 面向对象
  'class', 'object', 'constructor', 'destructor', 'inheritance', 'polymorphism', 'encapsulation',
  'abstraction', 'virtual', 'override', 'interface', 'abstract', 'friend', 'this', 'super',
  // 内存管理
  'memory', 'allocate', 'deallocate', 'leak', 'heap', 'stack', 'segmentation', 'garbage',
  'malloc', 'calloc', 'realloc', 'free', 'new', 'delete', 'smart_pointer', 'unique_ptr',
  // 编译调试
  'compiler', 'linker', 'debug', 'breakpoint', 'compile', 'runtime', 'exception', 'warning',
  'preprocessor', 'macro', 'include', 'ifdef', 'endif', 'pragma', 'template', 'typename',
  // 标准库
  'vector', 'template', 'iterator', 'algorithm', 'container', 'namespace', 'header', 'preprocessor',
  'map', 'set', 'list', 'queue', 'stack', 'deque', 'pair', 'tuple', 'optional', 'variant',
  // 设计模式
  'singleton', 'factory', 'observer', 'strategy', 'adapter', 'decorator', 'proxy', 'bridge',
  'composite', 'flyweight', 'chain', 'command', 'interpreter', 'iterator', 'mediator', 'memento',
  // 开发工具
  'repository', 'branch', 'merge', 'commit', 'pull_request', 'dependency', 'build', 'framework',
  'debugger', 'profiler', 'linter', 'formatter', 'cmake', 'makefile', 'git', 'svn'
];

async function fetchBatch(words, delay = 500) {
  const results = [];
  for (const word of words) {
    try {
      const data = await fetchWord(word);
      if (data) {
        results.push(data);
        process.stdout.write('.');
      }
    } catch (e) {
      // ignore errors
    }
    await new Promise(r => setTimeout(r, delay));
  }
  console.log('');
  return results;
}

async function main() {
  console.log('Fetching business English words...');
  const businessResults = await fetchBatch(businessWords);
  console.log(`Got ${businessResults.length} business words`);

  console.log('\nFetching C++ developer words...');
  const cppResults = await fetchBatch(cppWords);
  console.log(`Got ${cppResults.length} C++ words`);

  // 保存结果
  const output = {
    business: businessResults,
    cpp: cppResults,
    timestamp: Date.now()
  };

  fs.writeFileSync('api_vocabulary.json', JSON.stringify(output, null, 2), 'utf8');
  console.log('\nSaved to api_vocabulary.json');
}

main();
