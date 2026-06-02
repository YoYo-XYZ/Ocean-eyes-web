const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  maxFileSizeLines: 300,
  secretPatterns: [
    /(password|secret|api_key|token|auth_token|private_key)\s*[:=]\s*['"`][a-zA-Z0-9_\-]{8,}['"`]/i
  ],
  allowedExtensions: ['.ts', '.tsx', '.js', '.jsx'],
  ignoreDirs: ['node_modules', '.git', 'dist', 'build']
};

const results = {
  largeFiles: [],
  anyTypeCount: 0,
  anyTypeFiles: [],
  namingViolations: [],
  potentialSecrets: [],
  debugStatements: [],
  errorHandlingSmells: [],
  totalFilesScanned: 0,
  totalLinesScanned: 0
};

function scanDirectory(dir) {
  let files;
  try {
    files = fs.readdirSync(dir);
  } catch (err) {
    console.error(`Failed to read directory ${dir}:`, err.message);
    return;
  }

  for (const file of files) {
    const fullPath = path.join(dir, file);
    let stat;
    try {
      stat = fs.statSync(fullPath);
    } catch (err) {
      continue;
    }

    if (stat.isDirectory()) {
      if (CONFIG.ignoreDirs.includes(file)) continue;
      scanDirectory(fullPath);
    } else if (stat.isFile()) {
      const ext = path.extname(file).toLowerCase();
      if (CONFIG.allowedExtensions.includes(ext)) {
        analyzeFile(fullPath, file, dir);
      }
    }
  }
}

function analyzeFile(filePath, fileName, dirName) {
  results.totalFilesScanned++;
  let content;
  try {
    content = fs.readFileSync(filePath, 'utf8');
  } catch (err) {
    return;
  }

  const lines = content.split(/\r?\n/);
  results.totalLinesScanned += lines.length;

  const relativePath = path.relative(process.cwd(), filePath);

  // 1. File Size Check
  if (lines.length > CONFIG.maxFileSizeLines) {
    results.largeFiles.push({
      path: relativePath,
      lines: lines.length
    });
  }

  // 2. Naming Conventions Check
  // - React components in src/components or src/pages should usually be PascalCase
  const normalizedPath = relativePath.replace(/\\/g, '/');
  if (normalizedPath.includes('/components/') || normalizedPath.includes('/pages/')) {
    const baseName = path.basename(fileName, path.extname(fileName));
    // Skip special files like index, setupTests, or files starting with lowercase if they aren't React components
    if (baseName !== 'index' && !/^[A-Z][a-zA-Z0-9]*$/.test(baseName)) {
      results.namingViolations.push({
        path: relativePath,
        reason: 'React components and pages should use PascalCase naming convention (e.g. VideoPlayer.tsx).'
      });
    }
  }
  // - Custom hooks in src/hooks should start with 'use'
  if (normalizedPath.includes('/hooks/')) {
    const baseName = path.basename(fileName, path.extname(fileName));
    if (!baseName.startsWith('use')) {
      results.namingViolations.push({
        path: relativePath,
        reason: `Custom hooks in src/hooks should be prefixed with 'use' (e.g. useAquariumData.ts).`
      });
    }
  }

  // Line by line analysis
  let fileHasAnyType = false;
  let fileAnyTypeLines = [];
  let fileSecrets = [];
  let fileDebugs = [];
  let fileAsyncSmells = [];

  for (let i = 0; i < lines.length; i++) {
    const lineText = lines[i];
    const lineNumber = i + 1;

    // 3. TS 'any' count (exclude type definition files or special cases if needed, but flag them generally)
    if (/\bany\b/.test(lineText)) {
      // Exclude comments, strings containing 'any', etc. Simple heuristic:
      // Match ': any' or '<any>' or 'as any'
      if (/:\s*any\b/.test(lineText) || /<\s*any\s*>/.test(lineText) || /\bas\s+any\b/.test(lineText)) {
        results.anyTypeCount++;
        fileHasAnyType = true;
        fileAnyTypeLines.push(lineNumber);
      }
    }

    // 4. Secret Patterns Scanner
    for (const pattern of CONFIG.secretPatterns) {
      if (pattern.test(lineText)) {
        // Exclude dummy test values or example values
        if (!/dummy|example|mock|placeholder|test_secret/i.test(lineText)) {
          fileSecrets.push({ line: lineNumber, content: lineText.trim() });
        }
      }
    }

    // 5. Leftover Debug Statements
    if (/\bconsole\.log\b/.test(lineText) || /\bdebugger\b/.test(lineText)) {
      fileDebugs.push({ line: lineNumber, content: lineText.trim() });
    }

    // 6. Basic Async Error Handling Smells
    // Flag async functions or fetches that don't seem to have try/catch or catch nearby
    // This is simple heuristic: if it has fetch/axios/async but no try/catch
    if (/\basync\s+/.test(lineText) && !content.includes('try') && !content.includes('.catch')) {
      fileAsyncSmells.push({ line: lineNumber, content: 'Async function defined without visible error handling structure (try/catch).' });
    }
  }

  if (fileHasAnyType) {
    results.anyTypeFiles.push({
      path: relativePath,
      lines: fileAnyTypeLines
    });
  }

  if (fileSecrets.length > 0) {
    results.potentialSecrets.push({
      path: relativePath,
      findings: fileSecrets
    });
  }

  if (fileDebugs.length > 0) {
    results.debugStatements.push({
      path: relativePath,
      findings: fileDebugs
    });
  }

  if (fileAsyncSmells.length > 0) {
    results.errorHandlingSmells.push({
      path: relativePath,
      findings: fileAsyncSmells
    });
  }
}

// Start Scanning
const targetDir = process.argv[2] ? path.resolve(process.argv[2]) : path.join(process.cwd(), 'src');
console.log(`====================================================`);
console.log(`  OCEANEYES CODE HEALTH & STRUCTURE REVIEW SCANNER`);
console.log(`====================================================`);
console.log(`Scanning target: ${targetDir}\n`);

if (!fs.existsSync(targetDir)) {
  console.error(`Target directory does not exist: ${targetDir}`);
  process.exit(1);
}

scanDirectory(targetDir);

// Generate Markdown and Terminal Report
console.log(`----------------------------------------------------`);
console.log(`📊 SCAN SUMMARY`);
console.log(`----------------------------------------------------`);
console.log(`Total files scanned:       ${results.totalFilesScanned}`);
console.log(`Total lines of code:       ${results.totalLinesScanned}`);
console.log(`Large files (>300 lines):  ${results.largeFiles.length}`);
console.log(`TypeScript 'any' usages:   ${results.anyTypeCount} in ${results.anyTypeFiles.length} files`);
console.log(`Naming violations:         ${results.namingViolations.length}`);
console.log(`Leftover debug statements: ${results.debugStatements.length}`);
console.log(`Potential hardcoded keys:  ${results.potentialSecrets.length}`);
console.log(`Missing async handlers:    ${results.errorHandlingSmells.length}`);
console.log(`----------------------------------------------------\n`);

if (results.largeFiles.length > 0) {
  console.log(`📁 LARGE FILES DETECTED (Refactoring candidates):`);
  results.largeFiles.forEach(f => console.log(`  - ${f.path} (${f.lines} lines)`));
  console.log();
}

if (results.namingViolations.length > 0) {
  console.log(`🔤 NAMING CONVENTION VIOLATIONS:`);
  results.namingViolations.forEach(v => console.log(`  - ${v.path}: ${v.reason}`));
  console.log();
}

if (results.anyTypeFiles.length > 0) {
  console.log(`⚠️ TS 'any' USAGES (Degraded Type Safety):`);
  results.anyTypeFiles.forEach(f => console.log(`  - ${f.path} (Lines: ${f.lines.join(', ')})`));
  console.log();
}

if (results.potentialSecrets.length > 0) {
  console.log(`🔒 POTENTIAL HARDCODED SECRETS (Security Risk):`);
  results.potentialSecrets.forEach(f => {
    console.log(`  - ${f.path}:`);
    f.findings.forEach(find => console.log(`    Line ${find.line}: ${find.content}`));
  });
  console.log();
}

if (results.debugStatements.length > 0) {
  console.log(`🐛 LEFTOVER DEBUG STATEMENTS (Cleanliness):`);
  results.debugStatements.forEach(f => {
    console.log(`  - ${f.path}:`);
    // Only display up to 3 findings to avoid noise
    f.findings.slice(0, 3).forEach(find => console.log(`    Line ${find.line}: ${find.content}`));
    if (f.findings.length > 3) console.log(`    ... and ${f.findings.length - 3} more`);
  });
  console.log();
}

if (results.errorHandlingSmells.length > 0) {
  console.log(`🚨 MISSING ASYNC ERROR HANDLING:`);
  results.errorHandlingSmells.forEach(f => {
    console.log(`  - ${f.path}:`);
    f.findings.forEach(find => console.log(`    Line ${find.line}: ${find.content}`));
  });
  console.log();
}

console.log(`====================================================`);
console.log(`Scanner completed.`);
console.log(`====================================================`);
