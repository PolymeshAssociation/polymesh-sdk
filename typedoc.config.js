/* eslint-disable @typescript-eslint/explicit-function-return-type */
/** @type {Partial<import("typedoc").TypeDocOptions> & Partial<import("typedoc-plugin-markdown").PluginOptions>} */

/*
 *  This file is used to configure TypeDoc for generating SDK documentation for use in
 *  the polymesh documentation site. https://github.com/PolymeshAssociation/polymesh-documentation-site
 */

const config = {
  // Schema reference for IDE support
  $schema: 'https://typedoc.org/schema.json',

  // Input Configuration
  // Define what TypeDoc should process
  entryPoints: [
    'src/api/client',
    'src/api/entities',
    'src/api/procedures/types.ts',
    'src/types/index.ts',
    'src/types/txGroupConstants.ts',
    'src/types/utils',
    'src/base',
  ],
  entryPointStrategy: 'expand', // Expand directories to find all files

  // Exclusion patterns - files/directories to ignore
  exclude: [
    'src/internal.ts',
    '**/{__tests__,polkadot,testUtils}/**/*', // Test files
    'src/base/Context.ts',
    'src/base/Procedure.ts',
    '**/sandbox.ts',
    'src/api/entities/Namespace.ts',
    'src/types/internal.ts',
    'src/utils/**', // Utility functions
    'src/index.ts',
    'src-temp/', // Temporary files
    '**/node_modules/@polkadot/**', // External dependencies
  ],

  // Visibility filters
  excludeExternals: false, // Include external references
  excludePrivate: true, // Hide private members
  excludeProtected: true, // Hide protected members

  // Output Configuration
  // Where and how to generate documentation
  out: 'sdk-docs', // Output directory
  plugin: ['typedoc-plugin-markdown'], // Use markdown plugin

  // Markdown Plugin - File Options
  fileExtension: '.mdx', // MDX for Docusaurus compatibility
  entryFileName: 'index', // Main entry file name
  mergeReadme: false, // Don't merge README into docs
  flattenOutputFiles: false, // Keep directory structure
  excludeScopesInPaths: false, // Include scope directories

  // TypeDoc Core Output Options
  outputFileStrategy: 'members', // Create separate files for members

  // Documentation Organization & Display
  // How content is structured and displayed
  categorizeByGroup: false, // Don't group by @category tags
  githubPages: false, // Not for GitHub Pages

  // Markdown Plugin - Display Options
  hidePageHeader: true, // Clean headers for Docusaurus
  hideBreadcrumbs: true, // Clean navigation
  hidePageTitle: false, // Keep page titles
  expandObjects: false, // Don't expand objects in declarations
  expandParameters: true, // Show detailed parameter info

  // Markdown Plugin - Content Formatting
  // How different content types are rendered as tables
  parametersFormat: 'htmlTable', // Parameter documentation as HTML tables
  typeAliasPropertiesFormat: 'htmlTable', // Type alias properties as tables
  enumMembersFormat: 'list', // Enum members as lists
  propertyMembersFormat: 'htmlTable', // Object properties as tables
  typeDeclarationFormat: 'htmlTable', // Type declarations as tables
  interfacePropertiesFormat: 'list', // Interface properties as lists
  classPropertiesFormat: 'list', // Class properties as lists

  // Markdown Plugin - Utility Options
  useHTMLEncodedBrackets: false, // Use plain angle brackets
  sanitizeComments: false, // Don't sanitize HTML/JSX in comments - preserve links
  useHTMLAnchors: false, // Don't add HTML anchors (Docusaurus handles this)
  // Link Resolution Options
  useTsLinkResolution: true, // Use TypeScript's link resolution for better compatibility
  preserveLinkText: false, // Show the type as link text instead of the original path in @link tags

  // Page Title Templates
  // Configure page title output to match Docusaurus structure
  pageTitleTemplates: {
    module: args => {
      // Handle module path transformations
      const fullPath = args.name;

      const titleTransforms = [
        ['api/client/', 'Client: '],
        ['api/entities/', 'Entity: '],
        ['api/procedures/', 'Procedure: '],
        ['base/', 'Base: '],
      ];

      // Check each transform and return immediately when a match is found
      for (const [searchText, replacement] of titleTransforms) {
        if (fullPath.startsWith(searchText)) {
          const moduleName = fullPath.replace(searchText, '');
          return `${replacement}${moduleName}`;
        }
      }

      // For other modules (like root 'types'), return as-is
      return args.rawName;
    },
  },

  // Block Tags Configuration
  // JSDoc tags that should be processed and displayed
  blockTags: [
    '@param', // Parameter documentation
    '@remarks', // Additional remarks
    '@returns', // Return value documentation
    '@note', // Special notes
    '@example', // Usage examples
    '@throws', // Exception documentation
    '@see', // See also references
    '@category', // Categorization
    '@template', // Generic type parameters
    '@alias', // Type aliases
    '@deprecated', // Deprecation notices
  ],
};

module.exports = config;
