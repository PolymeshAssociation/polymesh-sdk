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
 * Returns a single markdown formatted link shifted by depth * 2 spaces
 * For example - `  - [Asset](../wiki/api.entities.Asset)`
 */
const getLink = function (label, link, depth) {
  const spaces = ' '.repeat(depth * 2);
  return `${spaces}- [${label}](${link})\n`;
};

/**
 * Returns a dropdown formatted markdown string with a specific heading and description
 * For example -
 * <details>
 *   <summary>
 *     <b>Client</b>
 *   </summary>
 *
 *   ....Nested links....
 * </details>
 *
 * Note that the blank line after the </summary> tag is must for correct formatting of dropdown content
 */
const getDropdown = function (heading, description) {
  return `<details>
  <summary>
    <b>${heading}</b>
  </summary>

${description}
</details>`;
};

/**
 * Converts the generated hierarchy structure into markdown format
 */
const getMarkdownLinks = function (hierarchies, depth) {
  const subModules = Object.keys(hierarchies);
  let line = '';
  subModules.forEach(function (name) {
    const subModule = hierarchies[name];
    const modifiedName = startCase(camelCase(name));
    const subModulePath = subModule.__value;

    if (subModulePath) {
      const link = getLink(modifiedName, subModulePath, depth);
      delete subModule.__value;
      if (depth === 0 && name === 'types') {
        line += getDropdown('Types', `  ${link}${getMarkdownLinks(subModule, depth + 2)}`);
      } else {
        line += link + getMarkdownLinks(subModule, depth + 1);
      }
    } else if (['api', 'common', 'namespaces'].includes(name)) {
      // This skips extra nesting for these folders
      line += getMarkdownLinks(subModule, depth);
    } else {
      line += getDropdown(modifiedName, getMarkdownLinks(subModule, depth + 1));
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
