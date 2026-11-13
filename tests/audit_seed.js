const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../original-source/players.txt');
const content = fs.readFileSync(filePath, 'utf8');
const lines = content.split(/\r?\n/).filter(l => l.trim().length > 0);

console.log('Total non-empty lines in players.txt:', lines.length);

const idSet = new Set();
const validRecords = [];
const rejectedRecords = [];

lines.forEach((line, idx) => {
  const lineNum = idx + 1;
  const parts = line.split(',');
  if (parts.length !== 5) {
    rejectedRecords.push({
      lineNum,
      line,
      reason: `Field count is ${parts.length} (expected exactly 5 comma-separated values: name,id,score,level,team)`
    });
    return;
  }

  const name = parts[0].trim();
  const id = Number(parts[1]);
  const score = Number(parts[2]);
  const level = Number(parts[3]);
  const team = parts[4].trim();

  const errors = [];
  if (!name) errors.push('Empty player name');
  if (!Number.isInteger(id) || id <= 0) errors.push(`Invalid ID '${parts[1]}' (must be positive integer)`);
  if (!Number.isInteger(score) || score < 0) errors.push(`Invalid score '${parts[2]}' (must be non-negative integer)`);
  if (!Number.isInteger(level) || level <= 0) errors.push(`Invalid level '${parts[3]}' (must be positive integer)`);
  if (!team) errors.push('Empty team specification');
  if (idSet.has(id)) errors.push(`Duplicate player ID '${id}' (ID already registered)`);

  if (errors.length > 0) {
    rejectedRecords.push({ lineNum, line, reason: errors.join('; ') });
  } else {
    idSet.add(id);
    validRecords.push({ id, name, score, level, team });
  }
});

console.log('\n--- VALID RECORDS (' + validRecords.length + ') ---');
console.log('First 3 valid:', validRecords.slice(0, 3));
console.log('Last 3 valid:', validRecords.slice(-3));

console.log('\n--- REJECTED / QUARANTINED RECORDS (' + rejectedRecords.length + ') ---');
rejectedRecords.forEach(r => {
  console.log(`Line ${r.lineNum}: "${r.line}" -> Reason: ${r.reason}`);
});
