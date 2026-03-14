const fs = require('fs');
const path = require('path');

const BASE = path.join(__dirname, '..', 'src', 'data', 'zones');

// Define all merge groups
const MERGE_CONFIG = [
  {
    file: 'zone88.ts',
    groups: [
      {
        newId: '88.01-03', mainId: '88.01', secondaryIds: ['88.02', '88.03'],
        hebrewName: 'שלושת חודרי הרגל', englishName: 'Three Penetrating Points',
      },
      {
        newId: '88.04-06', mainId: '88.04', secondaryIds: ['88.05', '88.06'],
        hebrewName: 'שלוש אחיות', englishName: 'Three Sisters',
      },
      {
        newId: '88.07-08', mainId: '88.07', secondaryIds: ['88.08'],
        hebrewName: 'הצטננות', englishName: 'Common Cold',
      },
      {
        newId: '88.09-11', mainId: '88.09', secondaryIds: ['88.10', '88.11'],
        hebrewName: 'שלושה חודרי כליה', englishName: 'Three Penetrating Kidney',
      },
      {
        newId: '88.12-14', mainId: '88.12', secondaryIds: ['88.13', '88.14'],
        hebrewName: 'שלושה צהובים עליונים', englishName: 'Upper Three Yellows',
      },
      {
        newId: '88.20-22', mainId: '88.20', secondaryIds: ['88.21', '88.22'],
        hebrewName: 'שלוש מעיינות', englishName: 'Three Fountains',
      },
      {
        newId: '88.23-24', mainId: '88.23', secondaryIds: ['88.24'],
        hebrewName: 'זהב קדמי', englishName: 'Gold Front',
      },
      {
        newId: '88.29-31', mainId: '88.29', secondaryIds: ['88.30', '88.31'],
        hebrewName: 'שלושה חודרי רגל פנימיים', englishName: 'Three Inner Penetrating Points',
      },
    ],
  },
  {
    file: 'zone77.ts',
    groups: [
      {
        newId: '77.05-07', mainId: '77.05', secondaryIds: ['77.06', '77.07'],
        hebrewName: 'שלושת המשקלות', englishName: 'Three Weights (San Zhong)',
      },
    ],
  },
  {
    file: 'zone33.ts',
    groups: [
      {
        newId: '33.01-03', mainId: '33.01', secondaryIds: ['33.02', '33.03'],
        hebrewName: 'שער / זווית / ישר עוקב', englishName: 'Qi Men / Qi Jiao / Qi Zheng',
      },
      {
        newId: '33.08-09', mainId: '33.08', secondaryIds: ['33.09'],
        hebrewName: 'חמש / אלף מתכות יד', englishName: 'Arm Five/Thousand Metal',
      },
    ],
  },
  {
    file: 'zone22.ts',
    groups: [
      {
        newId: '22.08-09', mainId: '22.08', secondaryIds: ['22.09'],
        hebrewName: 'זרימת שורש כף יד', englishName: 'Wrist Flow (Wan Shun)',
      },
    ],
  },
];

// Parse a zone file into point blocks
function parseFile(content) {
  const lines = content.replace(/\r\n/g, '\n').split('\n');
  const blocks = [];
  let blockLines = [];
  let inBlock = false;
  let headerEndIdx = -1;
  let lastBlockEndIdx = -1;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line === '  {' && !inBlock) {
      if (headerEndIdx < 0) headerEndIdx = i;
      inBlock = true;
      blockLines = [line];
    } else if (line === '  },' && inBlock) {
      blockLines.push(line);
      const text = blockLines.join('\n');
      const idMatch = text.match(/id: '([^']+)'/);
      blocks.push({ id: idMatch ? idMatch[1] : 'unknown', text });
      blockLines = [];
      inBlock = false;
      lastBlockEndIdx = i;
    } else if (inBlock) {
      blockLines.push(line);
    }
  }

  const header = lines.slice(0, headerEndIdx).join('\n');
  const footer = lines.slice(lastBlockEndIdx + 1).join('\n');

  return { header, blocks, footer };
}

// Extract a single-quoted string field from point text
function extractField(text, fieldName) {
  // Match field: 'value' with possible newline+indent before the quote
  const regex = new RegExp(fieldName + ":\\s*\\n?\\s*'((?:[^'\\\\]|\\\\.)*)'");
  const match = text.match(regex);
  return match ? match[1] : null;
}

// Combine locations from multiple points
function combineLocations(memberBlocks) {
  if (memberBlocks.length === 1) {
    return extractField(memberBlocks[0].text, 'location');
  }

  const mainLoc = extractField(memberBlocks[0].text, 'location');

  // Check if main point's location already mentions all sub-points
  const othersReferenced = memberBlocks.slice(1).every(b =>
    mainLoc && (mainLoc.includes(b.id) || mainLoc.includes(extractField(b.text, 'pinyinName')))
  );

  if (othersReferenced) {
    return mainLoc;
  }

  // Combine with prefixes
  return memberBlocks.map(b => {
    const id = b.id;
    const pinyin = extractField(b.text, 'pinyinName');
    const loc = extractField(b.text, 'location');
    return `${id} ${pinyin}: ${loc}`;
  }).join('\\n');
}

// Replace a field value in point text (handles single-line and next-line values)
function replaceFieldValue(text, fieldName, oldValue, newValue) {
  // Try direct replacement first
  const direct = text.replace(
    `${fieldName}: '${oldValue}'`,
    `${fieldName}: '${newValue}'`
  );
  if (direct !== text) return direct;

  // Try with value on next line (indented)
  const regex = new RegExp(
    `(${fieldName}:\\s*\\n\\s*)'${oldValue.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}'`
  );
  return text.replace(regex, `$1'${newValue}'`);
}

function processFile(config) {
  const filePath = path.join(BASE, config.file);
  const rawContent = fs.readFileSync(filePath, 'utf8');
  const hasCRLF = rawContent.includes('\r\n');
  const content = rawContent;
  const { header, blocks, footer } = parseFile(content);

  // Build sets
  const removeSet = new Set();
  for (const group of config.groups) {
    for (const id of group.secondaryIds) {
      removeSet.add(id);
    }
  }

  const mainMap = new Map();
  for (const group of config.groups) {
    const allIds = [group.mainId, ...group.secondaryIds];
    const memberBlocks = allIds.map(id => blocks.find(b => b.id === id));

    if (memberBlocks.some(b => !b)) {
      console.error(`ERROR: Missing blocks for ${group.newId} in ${config.file}`);
      console.error('  Missing:', allIds.filter((id, i) => !memberBlocks[i]));
      continue;
    }

    const mainBlock = memberBlocks[0];
    let modified = mainBlock.text;

    // 1. Replace id
    modified = modified.replace(`id: '${group.mainId}'`, `id: '${group.newId}'`);

    // 2. Combine pinyinName
    const pinyinNames = memberBlocks.map(b => extractField(b.text, 'pinyinName')).filter(Boolean);
    const mainPinyin = extractField(mainBlock.text, 'pinyinName');
    modified = replaceFieldValue(modified, 'pinyinName', mainPinyin, pinyinNames.join(' / '));

    // 3. Combine chineseName
    const chineseNames = memberBlocks.map(b => extractField(b.text, 'chineseName')).filter(Boolean);
    const mainChinese = extractField(mainBlock.text, 'chineseName');
    modified = replaceFieldValue(modified, 'chineseName', mainChinese, chineseNames.join(' / '));

    // 4. Replace hebrewName
    const mainHebrew = extractField(mainBlock.text, 'hebrewName');
    modified = replaceFieldValue(modified, 'hebrewName', mainHebrew, group.hebrewName);

    // 5. Replace englishName
    const mainEnglish = extractField(mainBlock.text, 'englishName');
    modified = replaceFieldValue(modified, 'englishName', mainEnglish, group.englishName);

    // 6. Combine location
    const combinedLoc = combineLocations(memberBlocks);
    const mainLoc = extractField(mainBlock.text, 'location');
    if (combinedLoc !== mainLoc) {
      modified = replaceFieldValue(modified, 'location', mainLoc, combinedLoc);
    }

    // 7. Replace imageId if it matches mainId
    const mainImageId = extractField(modified, 'imageId');
    if (mainImageId === group.mainId) {
      modified = modified.replace(`imageId: '${mainImageId}'`, `imageId: '${group.newId}'`);
    }

    mainMap.set(group.mainId, modified);
  }

  // Rebuild file
  const newBlocks = [];
  for (const block of blocks) {
    if (removeSet.has(block.id)) {
      continue;
    } else if (mainMap.has(block.id)) {
      newBlocks.push(mainMap.get(block.id));
    } else {
      newBlocks.push(block.text);
    }
  }

  let newContent = header + '\n' + newBlocks.join('\n') + footer;
  if (hasCRLF) {
    newContent = newContent.replace(/\n/g, '\r\n');
  }
  fs.writeFileSync(filePath, newContent, 'utf8');

  const removed = blocks.length - newBlocks.length;
  console.log(`${config.file}: ${blocks.length} → ${newBlocks.length} points (removed ${removed})`);
  for (const group of config.groups) {
    console.log(`  ${group.newId}: merged ${group.secondaryIds.length + 1} → 1`);
  }
}

// Run
console.log('Merging Dao Ma groups...\n');
for (const config of MERGE_CONFIG) {
  processFile(config);
}
console.log('\nDone! Run "npm run build" to verify.');
