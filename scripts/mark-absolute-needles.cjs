/**
 * Mark 72 absolute needles (gold) and 32 solution needles (silver)
 * Adds absoluteNeedle: '72' | '32' field to matching points in zone files
 */

const fs = require('fs')
const path = require('path')

// 72 Absolute Needles - mapped to point IDs/names from the book
// Format: { match: string (pinyin partial match), zone: string, type: '72' | '32' }
const ABSOLUTE_72 = [
  // Zone 44
  'Shen Jian', // 44 - Shenjian
  'San Ling', // 44 - San ling (3 points)
  'San Zheng Ji', // 44 - San zheng ji (3 points)
  'Di Zong', // 44.09
  'Jian Zhong', // 44.06
  'San Shen', // 44 - San shen (3 points)

  // Zone 55
  'Mu Fu', // 55 - Mufu / 66.02

  // Zone 66
  'San Sheng', // 66 - San sheng (3 points)

  // Zone 77
  'Wai San Guan', // 77.27
  'Shuang Long', // 77 - Shuang long (2 points)

  // Zone 88
  'Jin Yin', // 88 - Jin yin (2 points)
  'Mu Huang', // 88 - Muhuang
  'Tu Ling', // 88 - Tuling
  'Huo Fu', // 88 - Huo fu
  'Huo Liang', // 88 - Huoliang
  'Huo Chang', // 88 - Huo chang
  'Mu Liang', // 88 - Muliang
  'Mu Chang', // 88 - Muchang
  'San Ling', // 88 - San ling (different from zone 44)

  // Zone 11
  'Feng Chao', // 11 - Feng chao (3 points)
  'Shuang Ling', // 11 - Shuang ling (2 points)
  'Mu Ling', // 11 - Muling
  'Fu Ke', // 11.24
  'Mu Huo', // 11.10
  'Baguan San', // 11
  'Baguan Si', // 11
  'Ba Guan San', // 11
  'Ba Guan Si', // 11

  // Zone 22
  'Zhong Bai', // 22.06
  'Wan Shun', // 22.08-09
  'Shang Gao', // 22
  'Xia Gao', // 22
  'San Cha', // 22 - San cha (3 points)
  'Ling Gu', // 22.05

  // Zone 99
  'Shen Er San', // 99 (3 points)
  'Wai Er', // 99

  // Zone 33
  'Xin Ling', // 33 (3 points)
  'Gan Ling', // 33 (3 points)
]

const SOLUTION_32 = [
  'Di Zong', // 44.09 (also in 72)
  'Jin Yin', // 88 (also in 72)
  'Jie', // 88.28
  'Shen Er San', // 99 (also in 72)
  'Tian Er', // 99
  'Shou Jie', // 22.10
  'Shou Wu', // 33.08
  'Qian Jin', // 33.09
  'Fen Zhi', // DT.01-02
]

// Read all zone files and find matching points
const zonesDir = path.join(__dirname, '..', 'src', 'data', 'zones')
const files = fs.readdirSync(zonesDir).filter(f => f.endsWith('.ts'))

let totalMarked72 = 0
let totalMarked32 = 0

function normalizeForMatch(str) {
  return str.toLowerCase()
    .replace(/[àáâãäåāăǎ]/g, 'a')
    .replace(/[èéêëēĕėěẹ]/g, 'e')
    .replace(/[ìíîïīĭǐ]/g, 'i')
    .replace(/[òóôõöōŏǒ]/g, 'o')
    .replace(/[ùúûüūŭůǔ]/g, 'u')
    .replace(/[ǖǘǚǜ]/g, 'u')
    .replace(/[^a-z\s]/g, '')
    .trim()
}

function matchesAny(pinyinName, list) {
  const normalized = normalizeForMatch(pinyinName)
  return list.some(term => {
    const normalizedTerm = normalizeForMatch(term)
    return normalized.includes(normalizedTerm) || normalizedTerm.includes(normalized)
  })
}

for (const file of files) {
  const filePath = path.join(zonesDir, file)
  let content = fs.readFileSync(filePath, 'utf8')
  let changed = false

  // Find all points with their pinyin names
  const pointBlocks = content.split(/(?=\s{2,4}\{[\s\n]*id:)/)

  for (let i = 0; i < pointBlocks.length; i++) {
    const block = pointBlocks[i]
    const pinyinMatch = block.match(/pinyinName:\s*'([^']*)'/)
    if (!pinyinMatch) continue

    const pinyinName = pinyinMatch[1]

    // Skip if already has absoluteNeedle
    if (block.includes('absoluteNeedle')) continue

    const is72 = matchesAny(pinyinName, ABSOLUTE_72)
    const is32 = matchesAny(pinyinName, SOLUTION_32)

    if (is72 || is32) {
      const type = is72 ? '72' : '32'
      // Add absoluteNeedle after pinyinName line
      const replacement = pinyinMatch[0] + `,\n    absoluteNeedle: '${type}' as const`
      content = content.replace(pinyinMatch[0], replacement)
      changed = true
      if (is72) totalMarked72++
      if (is32 && !is72) totalMarked32++
      console.log(`  ${type === '72' ? '🥇' : '🥈'} ${pinyinName} (${file})`)
    }
  }

  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8')
  }
}

console.log(`\nDone! Marked ${totalMarked72} as 72-absolute (gold), ${totalMarked32} as 32-solution (silver)`)
