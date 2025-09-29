# Next Major Release - Developer Guide

This guide explains how to contribute breaking changes to the next major version of the Polymesh SDK using the ephemeral integration system.

## 📋 Overview

Breaking changes for the next major release are managed through special branches that follow a specific naming convention. These branches are automatically discovered, validated, and integrated to create preview releases.

## 🌿 Branch Naming Convention

### Format
```
bc-<number>-<description>
```

### Rules
- **Must start with `bc-`**
- **Include a number** (determines integration order)
- **Use lowercase letters, numbers, and hyphens only**
- **Be descriptive** about the breaking change

### Examples
```bash
bc-1-remove-deprecated-apis     # Removes old API methods
bc-2-async-interface-changes    # Makes interfaces asynchronous
bc-5-new-error-handling         # Changes error handling approach
bc-10-update-type-definitions   # Updates TypeScript definitions
```

### Numbering Guidelines
- **Start from 1** for the first breaking change
- **Use sequential numbers** for logical ordering
- **Numbers determine integration order**: bc-1 → bc-2 → bc-5 → bc-10
- **Avoid conflicts**: Check for existing branches with the same number
- **Keep under 50** (higher numbers indicate too many breaking changes)

## 🚀 Creating a Breaking Change Branch

### Step 1: Create the Branch
```bash
# Start from the latest develop
git checkout develop
git pull origin develop

# Create your breaking change branch
git checkout -b bc-3-remove-legacy-widget develop
```

### Step 2: Make Your Changes
Implement your breaking changes in the branch:
```bash
# Make your changes
# Edit files, remove deprecated code, etc.

# Stage changes
git add .
```

### Step 3: Commit with Proper Format
Use conventional commits with breaking change indicators:
```bash
git commit -m "feat!: remove legacy Widget class

BREAKING CHANGE: Removed the deprecated Widget.legacy() method

The old Widget.legacy() method has been removed as part of the v3.0
modernization. Applications should migrate to Widget.current() which
provides the same functionality with improved performance.

Migration:
Replace Widget.legacy() with Widget.current()

Affects: All applications using Widget.legacy()"
```

### Step 4: Push the Branch
```bash
git push origin bc-3-remove-legacy-widget
```

## 📝 Commit Message Format

### Basic Structure

Breaking changes must include **at least one** of the following indicators (per [Conventional Commits v1.0.0](https://www.conventionalcommits.org/)):

**Option 1: Exclamation mark in subject (with optional footer)**
```
<type>!: <description>

[Optional body with additional details]
```

**Option 2: BREAKING CHANGE footer (with or without !)**
```
<type>: <description>

BREAKING CHANGE: <clear description of what breaks and why>

[Optional: Additional details]
```

**Option 3: Both markers**
```
<type>!: <description>

BREAKING CHANGE: <clear description of what breaks and why>

[Optional: Migration guide, affected components, code examples, etc.]
```

### Required Elements

To be detected as a breaking change, your commit **MUST** include at least one of:

#### Option 1: Exclamation Mark Indicator
- Add `!` after the type: `feat!:`, `fix!:`, `refactor!:`, etc.
- The `!` signals a breaking change in the commit subject

#### Option 2: BREAKING CHANGE Footer
```
BREAKING CHANGE: <clear description of what breaks and why>
```
- Must appear in the commit body (not the subject)
- Can be used with or without the `!` indicator

### Optional: Additional Details

The commit body can include migration instructions, affected components, or other relevant details.

## 🔄 Integration Process

### Automatic Workflow
1. **Discovery**: System finds all `bc-*` branches
2. **Validation**: Tests sequential integration for conflicts
3. **Integration**: Cherry-picks commits in numerical order
4. **Testing**: Runs test suite on integrated code
5. **Publishing**: Creates preview release (e.g., `v30.0.0-next.1`)
6. **Documentation**: Generates release notes with metadata

### Manual Triggers
You can manually trigger the integration workflow:
```bash
# Using npm script
yarn preview:generate

# Or via GitHub Actions UI
# Go to Actions tab → "Generate Next Major Preview" → "Run workflow"
```

### Branch Validation
The system automatically validates:
- ✅ Branch naming convention
- ✅ Number uniqueness
- ✅ Sequential integration compatibility
- ✅ Commit message format
- ✅ Test compatibility

## 📦 Preview Releases

### Version Format
Preview releases use semantic versioning with prerelease identifiers:
```
v30.0.0-next.1
v30.0.0-next.2
v30.0.0-next.3
```

### Installation
Users can install preview versions:
```bash
# Install latest next preview
npm install @polymeshassociation/polymesh-sdk@next

# Install specific preview version
npm install @polymeshassociation/polymesh-sdk@30.0.0-next.1
```

## ⚠️ Conflict Resolution

### When Conflicts Occur
If your branch conflicts with others during integration:

1. **Automatic Issue Creation**: GitHub issue created with conflict details
2. **Resolution Required**: Follow the provided resolution steps
3. **Manual Rebase**: Update your branch to resolve conflicts

### Resolution Steps
```bash
# 1. Checkout your conflicted branch
git checkout bc-5-your-branch
git fetch origin develop

# 2. Create temporary integration branch
git checkout -b temp-integration develop

# 3. Apply clean branches first (in numerical order)
git cherry-pick $(git rev-list --reverse origin/develop..origin/bc-1-clean-branch)
git cherry-pick $(git rev-list --reverse origin/develop..origin/bc-2-clean-branch)

# 4. Rebase your branch against the integrated state
git checkout bc-5-your-branch
git rebase temp-integration

# 5. Resolve conflicts and continue
git add .
git rebase --continue

# 6. Force push the updated branch
git push --force-with-lease origin bc-5-your-branch

# 7. Clean up
git branch -D temp-integration
```

## 🔄 Migration to Stable Release

When the next major version is ready:
1. All `bc-*` branches are integrated into `develop`
2. Major version is released from `develop` → `master`
3. Preview releases become the stable release
4. Integrated `bc-*` branches can be deleted
5. Process starts fresh for the next major version

---