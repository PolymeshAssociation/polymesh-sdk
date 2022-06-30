/* eslint-disable */
const path = require('path');
const fs = require('fs');
const { camelCase, startCase } = require('lodash');

/**
 * Reads all the Module links created by typedoc
 */
const getModulesFromTypeDocSidebar = function (sidebarData) {
  const modules = [];
  sidebarData.split(/\r?\n/).forEach(function (line, index) {
    if (index > 5) {
      const regex = /!?\[([^\]]*)\]\(([^\\)]+)\)/;
      const matches = line.match(regex);

      if (matches) {
        modules.push(matches);
      }
    }
  });
  return modules;
};

/**
 * Reduces all the markdown links to a hierarchy with creating folder structure and setting values as their wiki paths
 */
const convertModulesToHierarchy = function (modules) {
  return modules.reduce(function (hierarchy, module) {
    let clone = hierarchy;
    module[1].split('/').forEach(function (item) {
      if (!clone[item]) {
        clone[item] = {};
      }
      clone = clone[item];
    });
    clone.__value = module[2];
    return hierarchy;
  }, {});
};

/**
 * Converts the generated hierarchy structure into markdown format
 */
const getMarkdownLinks = function (hierarchies, depth) {
  const subModules = Object.keys(hierarchies);
  let line = '';
  subModules.forEach(function (name) {
    const subModule = hierarchies[name];
    const spaces = ' '.repeat(depth * 2);
    const modifiedName = startCase(camelCase(name));
    const subModulePath = subModule.__value;

    if (depth === 0 && name === 'types') {
      line += '\n#### Types\n\n';
    }

    if (subModulePath) {
      line += `${spaces}- [${modifiedName}](${subModulePath})\n`;
      delete subModule.__value;
      line += getMarkdownLinks(subModule, depth + 1);
    } else if (!['api', 'common', 'namespaces'].includes(name)) {
      line += `\n#### ${modifiedName}\n\n`;
      line += getMarkdownLinks(subModule, depth + 1);
    } else {
      line += getMarkdownLinks(subModule, depth);
    }
  });
  return line;
};

const sidebarFilePath = path.resolve('docs', '_Sidebar.md');

const sidebarData = fs.readFileSync(sidebarFilePath, { encoding: 'utf8' });

const modules = getModulesFromTypeDocSidebar(sidebarData);

const hierarchy = convertModulesToHierarchy(modules);

const markdownLinks = getMarkdownLinks(hierarchy, 0);

fs.writeFileSync(
  sidebarFilePath,
  `## @polymeshassociation/polymesh-sdk

- [Home](../wiki/Home)

### Modules
${markdownLinks}
`
);
