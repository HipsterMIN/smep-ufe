/* eslint-disable no-undef */

import fs from 'node:fs/promises';
import path from 'node:path';
import { execSync } from 'node:child_process';

const ROOT = process.cwd();
const DATE_STAMP = new Date().toISOString().slice(0, 10).replace(/-/g, '');
const OUTPUT_BASENAME = `nprotect-request-evidence-smep-ufe-${DATE_STAMP}`;
const SKIP_DIRS = new Set([
  '.git',
  'node_modules',
  'dist',
  'out',
  'test-results',
  'playwright-report',
  'coverage',
]);

const toPosix = (value) => value.replace(/\\/g, '/');

const runGit = (command) => {
  try {
    return execSync(command, { cwd: ROOT, stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
  } catch {
    return null;
  }
};

const walkFiles = async (dirPath) => {
  const entries = await fs.readdir(dirPath, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) continue;
      files.push(...(await walkFiles(fullPath)));
      continue;
    }
    files.push(fullPath);
  }

  return files;
};

const findByExactName = (files, fileName) =>
  files.filter((filePath) => path.basename(filePath).toLowerCase() === fileName.toLowerCase());

const findDirectories = async (targetTailPath) => {
  const normalizedTail = toPosix(targetTailPath).toLowerCase();
  const results = [];

  const scan = async (dirPath) => {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      if (SKIP_DIRS.has(entry.name)) continue;
      const fullPath = path.join(dirPath, entry.name);
      const normalizedPath = toPosix(fullPath).toLowerCase();
      if (normalizedPath.endsWith(normalizedTail)) {
        results.push(fullPath);
      }
      await scan(fullPath);
    }
  };

  await scan(ROOT);
  return results;
};

const readJsonIfExists = async (targetPath) => {
  try {
    const raw = await fs.readFile(targetPath, 'utf8');
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

const getItem11ConfigEvidence = async () => {
  const candidates = [
    'src/security/nprotect/nprotectConfig.js',
    'src/security/nprotect/nprotectManager.js',
    'src/context/NProtectContext.jsx',
    'src/hooks/useNProtect.js',
    'src/pages/Login.jsx',
    'src/pages/SSOLogin.jsx',
    '.env.example',
  ];

  const existing = [];
  for (const relativePath of candidates) {
    const absPath = path.join(ROOT, relativePath);
    try {
      await fs.access(absPath);
      existing.push(absPath);
    } catch {
      // ignore
    }
  }

  return existing;
};

const generateRows = async () => {
  const allFiles = await walkFiles(ROOT);
  const packageJsonPath = path.join(ROOT, 'package.json');
  const packageJson = await readJsonIfExists(packageJsonPath);
  const configEvidencePaths = await getItem11ConfigEvidence();
  const webInfDefaultDirs = await findDirectories('WEB-INF/resources/default');
  const webInfMobileDirs = await findDirectories('WEB-INF/resources/mobile');

  const rows = [];
  const pushRow = (row) => rows.push(row);

  const nppfsJs = findByExactName(allFiles, 'nppfs-1.13.0.js');
  pushRow({
    no: 1,
    requestItem: 'nppfs-1.13.0.js',
    applied: nppfsJs.length > 0 ? 'Y' : 'N',
    absolutePath: nppfsJs[0] || '-',
    captureFileName: 'smep-ufe_01_nppfs_js_path_or_not_found.png',
    note: nppfsJs.length > 0 ? '파일 존재' : '프로젝트 내 미존재',
  });

  const installJsp = findByExactName(allFiles, 'nppfs.install.jsp');
  pushRow({
    no: 2,
    requestItem: 'nppfs.install.jsp',
    applied: installJsp.length > 0 ? 'Y' : 'N',
    absolutePath: installJsp[0] || '-',
    captureFileName: 'smep-ufe_02_nppfs_install_jsp_path_or_not_found.png',
    note: installJsp.length > 0 ? '파일 존재' : 'JSP 파일 미존재',
  });

  const keyJsp = findByExactName(allFiles, 'nppfs.key.jsp');
  pushRow({
    no: 3,
    requestItem: 'nppfs.key.jsp',
    applied: keyJsp.length > 0 ? 'Y' : 'N',
    absolutePath: keyJsp[0] || '-',
    captureFileName: 'smep-ufe_03_nppfs_key_jsp_path_or_not_found.png',
    note: keyJsp.length > 0 ? '파일 존재' : 'JSP 파일 미존재',
  });

  const keypadJsp = findByExactName(allFiles, 'nppfs.keypad.jsp');
  pushRow({
    no: 4,
    requestItem: 'nppfs.keypad.jsp',
    applied: keypadJsp.length > 0 ? 'Y' : 'N',
    absolutePath: keypadJsp[0] || '-',
    captureFileName: 'smep-ufe_04_nppfs_keypad_jsp_path_or_not_found.png',
    note: keypadJsp.length > 0 ? '파일 존재' : 'JSP 파일 미존재',
  });

  const nprotectProps = findByExactName(allFiles, 'nprotect.properties');
  pushRow({
    no: 5,
    requestItem: 'nprotect.properties',
    applied: nprotectProps.length > 0 ? 'Y' : 'N',
    absolutePath: nprotectProps[0] || '-',
    captureFileName: 'smep-ufe_05_nprotect_properties_path_or_not_found.png',
    note: nprotectProps.length > 0 ? '파일 존재' : '설정 파일 미존재',
  });

  pushRow({
    no: 6,
    requestItem: 'com.nprotect.pluginfree.v1.5.1.java17.20240807',
    applied: 'N',
    absolutePath: '-',
    captureFileName: 'smep-ufe_06_nprotect_plugin_jar_not_found.png',
    note: '프런트 저장소로 JAR 미사용(백엔드 항목)',
  });

  pushRow({
    no: 7,
    requestItem: 'WEB-INF-resources-default',
    applied: webInfDefaultDirs.length > 0 ? 'Y' : 'N',
    absolutePath: webInfDefaultDirs[0] || '-',
    captureFileName: 'smep-ufe_07_webinf_default_path_or_not_found.png',
    note: webInfDefaultDirs.length > 0 ? '디렉터리 존재' : 'WEB-INF/JSP 리소스 구조 미사용',
  });

  pushRow({
    no: 8,
    requestItem: 'WEB-INF-resources-mobile',
    applied: webInfMobileDirs.length > 0 ? 'Y' : 'N',
    absolutePath: webInfMobileDirs[0] || '-',
    captureFileName: 'smep-ufe_08_webinf_mobile_path_or_not_found.png',
    note: webInfMobileDirs.length > 0 ? '디렉터리 존재' : 'WEB-INF/JSP 리소스 구조 미사용',
  });

  const nosLibPath = path.join(ROOT, 'nosLib', 'nos-react-3.0.6.tgz');
  let nosLibExists = false;
  try {
    await fs.access(nosLibPath);
    nosLibExists = true;
  } catch {
    nosLibExists = false;
  }
  pushRow({
    no: 9,
    requestItem: 'noslib-nos-react-3.0.6.tgz',
    applied: nosLibExists ? 'Y' : 'N',
    absolutePath: nosLibExists ? nosLibPath : '-',
    captureFileName: 'smep-ufe_09_noslib_tgz_path_or_not_found.png',
    note: nosLibExists ? '실제 파일명은 nosLib/nos-react-3.0.6.tgz' : '파일 미존재',
  });

  const nosDependency = packageJson?.dependencies?.nos ?? null;
  pushRow({
    no: 10,
    requestItem: 'package.json dependencies 내 nos 경로',
    applied: nosDependency ? 'Y' : 'N',
    absolutePath: nosDependency ? packageJsonPath : '-',
    captureFileName: 'smep-ufe_10_packagejson_nos_dependency.png',
    note: nosDependency ? `nos=${nosDependency}` : 'dependencies.nos 미존재',
  });

  pushRow({
    no: 11,
    requestItem: 'config 선언 파일 경로 및 캡처(nosManagerConfig 등)',
    applied: configEvidencePaths.length > 0 ? 'Y' : 'N',
    absolutePath: configEvidencePaths.length > 0 ? configEvidencePaths.join('\n') : '-',
    captureFileName: 'smep-ufe_11_nos_config_declarations.png',
    note: configEvidencePaths.length > 0
      ? 'nProtect 래퍼/정책 선언 파일 확인'
      : 'nProtect 설정 선언 파일 미존재',
  });

  return rows;
};

const buildMarkdown = (metadata, rows) => {
  const header = [
    '# 설치계획서 증빙자료 회신(안) - smep-ufe',
    '',
    `- 작성일: ${metadata.generatedAtKst}`,
    `- 프로젝트: ${metadata.projectName}`,
    `- 저장소 경로: \`${metadata.rootPath}\``,
    `- 브랜치: \`${metadata.branch || 'N/A'}\``,
    `- 커밋 SHA: \`${metadata.commitSha || 'N/A'}\``,
    '',
    '## 점검 결과 표',
    '',
    '| No | 요청 항목 | 적용 여부(Y/N) | 실제 경로(절대경로) | 캡처 파일명(권장) | 비고 |',
    '|---|---|---|---|---|---|',
  ];

  const body = rows.map((row) => {
    const safePath = String(row.absolutePath).replace(/\r?\n/g, '<br/>');
    return `| ${row.no} | ${row.requestItem} | ${row.applied} | ${safePath} | ${row.captureFileName} | ${row.note} |`;
  });

  const footer = [
    '',
    '## 제출 캡처 권고(프런트)',
    '- 루트 구조 캡처 1장: `package.json`, `src`, `nosLib`, `docs`가 보이도록 촬영',
    '- `nosLib` 폴더 캡처 1장: `nos-react-3.0.6.tgz` 파일명/경로 포함',
    '- `package.json` 캡처 1장: `dependencies.nos` 항목 포함',
    '- nProtect 설정 코드 캡처 2장 이상: `nprotectConfig.js`, `nprotectManager.js`',
    '- 미존재 항목 검색결과 캡처 1장: `nppfs*.jsp`, `nprotect.properties`, `WEB-INF/resources/*`',
    '',
    '## 주의 사항',
    '- 현재 프런트는 `evidence-only` 정책(`VITE_NPROTECT_EVIDENCE_ONLY=true`)으로 nProtect 초기화를 수행하지 않음',
    '- 본 문서는 증빙 제출 목적이며, 실동작 연계 전환 시 정책 및 런타임 설정 재검토 필요',
  ];

  return [...header, ...body, ...footer].join('\n');
};

const main = async () => {
  const rows = await generateRows();
  const artifactsDir = path.join(ROOT, 'artifacts');
  await fs.mkdir(artifactsDir, { recursive: true });

  const now = new Date();
  const generatedAtKst = new Intl.DateTimeFormat('ko-KR', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);

  const metadata = {
    generatedAt: now.toISOString(),
    generatedAtKst,
    projectName: path.basename(ROOT),
    rootPath: ROOT,
    branch: runGit('git rev-parse --abbrev-ref HEAD'),
    commitSha: runGit('git rev-parse HEAD'),
  };

  const jsonOutput = {
    ...metadata,
    rows,
  };

  const markdownOutput = buildMarkdown(metadata, rows);
  const jsonPath = path.join(artifactsDir, `${OUTPUT_BASENAME}.json`);
  const markdownPath = path.join(artifactsDir, `${OUTPUT_BASENAME}.md`);

  await fs.writeFile(jsonPath, JSON.stringify(jsonOutput, null, 2), 'utf8');
  await fs.writeFile(markdownPath, markdownOutput, 'utf8');

  console.log(`nProtect request evidence generated: ${path.relative(ROOT, jsonPath)}`);
  console.log(`nProtect request evidence generated: ${path.relative(ROOT, markdownPath)}`);
};

main().catch((error) => {
  console.error('Failed to generate nProtect request evidence', error);
  process.exit(1);
});
