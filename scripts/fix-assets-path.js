#!/usr/bin/env node
/**
 * 修复构建后的 HTML 文件中的资源路径
 * 确保所有资源路径包含 base 路径前缀
 */

const fs = require('fs');
const path = require('path');

const BASE_PATH = '/test_tool_for_AI';
const DIST_DIR = path.join(__dirname, '..', 'dist');
const HTML_FILE = path.join(DIST_DIR, 'index.html');

console.log('修复 HTML 文件中的资源路径...');

if (!fs.existsSync(HTML_FILE)) {
  console.error('错误: index.html 文件不存在');
  process.exit(1);
}

let html = fs.readFileSync(HTML_FILE, 'utf8');

// 修复所有资源路径
// 匹配 src="/assets/ 或 href="/assets/ 的情况
html = html.replace(
  /(src|href)="\/assets\//g,
  `$1="${BASE_PATH}/assets/`
);

// 修复可能的其他绝对路径
html = html.replace(
  /(src|href)="\/(?!test_tool_for_AI)/g,
  `$1="${BASE_PATH}/`
);

fs.writeFileSync(HTML_FILE, html, 'utf8');

console.log('✅ 资源路径修复完成');
console.log(`✅ Base 路径: ${BASE_PATH}`);

