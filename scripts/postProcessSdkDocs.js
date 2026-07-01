#!/usr/bin/env node
/* eslint-disable @typescript-eslint/explicit-function-return-type */

const fs = require('fs');
const path = require('path');

const SDK_DOCS_DIR = path.join(__dirname, '..', 'sdk-docs');
const CHANGELOGS_DIR = path.join(__dirname, '..', 'changelogs');
const SDK_CHANGELOGS_DIR = path.join(SDK_DOCS_DIR, 'changelogs');
const TOP_LEVEL_CATEGORY_POSITIONS = {
  api: 3,
  base: 5,
  changelogs: 6,
};

/**
 * Recursively walk through directory structure
 */
function walkDir(dir, callback) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      walkDir(filePath, callback);
    } else {
      callback(filePath);
    }
  });
}

/**
 * Copy changelog docs into the generated SDK docs tree
 */
function syncChangelogDocs() {
  if (!fs.existsSync(CHANGELOGS_DIR)) {
    return;
  }

  fs.rmSync(SDK_CHANGELOGS_DIR, { recursive: true, force: true });
  fs.cpSync(CHANGELOGS_DIR, SDK_CHANGELOGS_DIR, { recursive: true });
}

/**
 * Process a single MDX file
 */
function processMdxFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  let newContent = content;

  // Get relative path from SDK_DOCS_DIR
  const relativePath = path.relative(SDK_DOCS_DIR, filePath);

  // Handle special root files
  let label = null;
  let title = null;
  let position = null;

  if (relativePath === 'index.mdx') {
    title = 'Polymesh SDK Readme';
    label = 'SDK Readme';
    position = 1;
    // Update the heading
    newContent = newContent.replace(/^# .+$/m, '# ' + title);
    modified = true;
  } else if (relativePath === 'modules.mdx') {
    title = 'Polymesh SDK Module List';
    label = 'SDK Modules';
    position = 2;
    // Update the heading
    newContent = newContent.replace(/^# .+$/m, '# ' + title);
    modified = true;
  } else if (relativePath === 'types/index.mdx') {
    label = 'Types';
    position = 4;
  } else {
    // Extract the label from the heading (titles should already be formatted by pageTitleTemplates)
    const heading1Match = newContent.match(/^# (.+)$/m);
    if (heading1Match) {
      let simplifiedHeading = heading1Match[1].split('/').pop();

      // Remove type prefixes like "Type Alias: ", "Enumeration: ", etc.
      if (simplifiedHeading.includes(': ')) {
        simplifiedHeading = simplifiedHeading.split(': ').slice(1).join(': ');
      }

      // Remove backslashes and other special characters for YAML
      simplifiedHeading = simplifiedHeading.replace(/\\/g, '');

      // Remove content inside angle brackets (e.g., <T>, <string>, etc.)
      simplifiedHeading = simplifiedHeading.replace(/<[^>]*>/g, '');

      // Capitalize the first letter of the label
      label = simplifiedHeading.charAt(0).toUpperCase() + simplifiedHeading.slice(1);
    }
  }

  // 2. Determine if we need frontmatter and what type
  const needsFrontmatter = label || title || position;

  if (needsFrontmatter) {
    // Check if frontmatter already exists
    let frontmatter = '---\n';

    if (title) {
      frontmatter += 'title: "' + title + '"\n';
    }

    if (label) {
      frontmatter += 'sidebar_label: "' + label + '"\n';
    }

    if (position) {
      frontmatter += 'sidebar_position: ' + position + '\n';
    }

    frontmatter += '---\n\n';

    newContent = frontmatter + newContent;
    modified = true;
  }

  // Write back if modified
  if (modified) {
    fs.writeFileSync(filePath, newContent, 'utf8');
  }

  return modified;
}

/**
 * Check if directory needs a _category_.yml file
 */
function needsCategoryFile(dirPath) {
  // Don't create category file for root directory
  if (dirPath === SDK_DOCS_DIR) {
    return false;
  }

  const files = fs.readdirSync(dirPath);

  // Check if there's an index.mdx file
  const hasIndex = files.some(file => file === 'index.mdx');

  // Check if there are any documentation files or subdirectories
  const hasMdxFilesOrSubdirs = files.some(file => {
    const filePath = path.join(dirPath, file);
    const stat = fs.statSync(filePath);
    return file.endsWith('.mdx') || file.endsWith('.md') || stat.isDirectory();
  });

  // Need category file if no index but has .mdx files or subdirectories
  return !hasIndex && hasMdxFilesOrSubdirs;
}

/**
 * Create _category_.yml file for a directory
 */
function createCategoryFile(dirPath) {
  const dirName = path.basename(dirPath);
  const relativePath = path.relative(SDK_DOCS_DIR, dirPath);

  // Generate label with special case for "api"
  const label =
    dirName.toLowerCase() === 'api' ? 'API' : dirName.charAt(0).toUpperCase() + dirName.slice(1);

  let categoryContent = 'label: "' + label + '"\n';

  if (!relativePath.includes(path.sep) && TOP_LEVEL_CATEGORY_POSITIONS[dirName.toLowerCase()]) {
    categoryContent += 'position: ' + TOP_LEVEL_CATEGORY_POSITIONS[dirName.toLowerCase()] + '\n';
  }

  // Add collapsed: false for Classes folders so they're expanded by default
  if (dirName.toLowerCase() === 'classes') {
    categoryContent += 'collapsed: false\n';
  }

  const categoryPath = path.join(dirPath, '_category_.yml');

  // Only create if it doesn't exist
  if (!fs.existsSync(categoryPath)) {
    fs.writeFileSync(categoryPath, categoryContent, 'utf8');
    return true;
  }

  return false;
}

/**
 * Process all directories to add category files where needed
 */
function processDirectories(startDir) {
  const dirs = [];

  // Collect all directories recursively
  const collectDirs = dir => {
    const files = fs.readdirSync(dir);

    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        dirs.push(filePath);
        collectDirs(filePath);
      }
    }
  };

  collectDirs(startDir);

  // Process directories in reverse order (deepest first)
  dirs.reverse().forEach(dir => {
    if (needsCategoryFile(dir)) {
      createCategoryFile(dir);
    }
  });
}

/**
 * Main processing function
 */
const main = () => {
  if (!fs.existsSync(SDK_DOCS_DIR)) {
    console.error('SDK docs directory not found: ' + SDK_DOCS_DIR);
    process.exit(1);
  }

  syncChangelogDocs();

  // Process all .mdx files
  walkDir(SDK_DOCS_DIR, filePath => {
    if (path.extname(filePath) === '.mdx') {
      processMdxFile(filePath);
    }
  });

  // Process directories for category files
  processDirectories(SDK_DOCS_DIR);
};

// Run the script
if (require.main === module) {
  main();
}

module.exports = { main };
