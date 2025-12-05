# Cursor Rules - AI-Augmented Engineering

## Core Workflow

### NEVER Code Immediately - Always Plan First

1. **Scan codebase first**
   - Find ALL relevant files
   - List them for user review
   - Wait for approval before coding
   - DO NOT guess - show your reasoning

2. **Ask clarifying questions** in this format:
```
   1. [Question about requirements]
      a. [Option A]
      b. [Option B]
   2. [Technical question]
      a. [Technical option A]
      b. [Technical option B]
```

3. **Create detailed plan** with:
   - Clear phases with unique IDs
   - Scope boundaries
   - Implementation approach
   - Save in `./docs/plans/` (if exists)

4. **Get explicit approval** before implementation

5. **Work on single phases** - One task at a time

6. **Request code review** after completion

## Code Quality Standards

### Before Writing Code

- Check existing components - reuse before creating new
- Scan design system for similar components
- Follow existing patterns and architecture
- Use relevant documentation as context

### Code Requirements

- TypeScript interfaces for validation
- Proper error handling (no application crashes)
- Comments explaining complex logic
- Semantic variable and function names
- Files under 500 lines (refactor if larger)
- Client and server-side validation

### Pre-Deployment Checklist

✅ Linter passes (BLOCK deployment if fails)
✅ TypeScript errors resolved
✅ Build successful: `npm run build && npm start`
✅ Tested locally
✅ All components render correctly

## Documentation

### Auto-Document After Changes

Add file-level comments with context:
```typescript
/**
 * [Brief description of what file does]
 *
 * Recent changes (2024-01-15):
 * - [What changed and why]
 *
 * Next agent: [Important context for next AI or developer]
 */
```

### Documentation Rules

- Save plans: `./docs/plans/` (if structure exists)
- Save docs: `./docs/<area>/` (if structure exists)
- Include working code examples
- Explain the "why" behind decisions
- Reference external docs and URLs
- Update after introducing changes

## Git Workflow - Open Source Standards

### Commit Message Convention (Conventional Commits)

**Format:** `<type>(<scope>): <subject>`

**Types:**
- `feat`: New feature for user
- `fix`: Bug fix
- `docs`: Documentation only
- `style`: Formatting, missing semicolons, etc
- `refactor`: Code change that neither fixes bug nor adds feature
- `perf`: Performance improvement
- `test`: Adding or updating tests
- `chore`: Build process, dependencies, tooling
- `ci`: CI/CD configuration changes
- `revert`: Revert previous commit

**Examples:**
```bash
feat(auth): add OAuth2 login support
fix(api): resolve race condition in user creation
docs(readme): update installation instructions
refactor(components): extract Button logic to custom hook
perf(queries): optimize database indexes for user search
test(utils): add unit tests for date formatting
chore(deps): upgrade React to v18.3.0
ci(github): add automated security scanning
```

**Commit Body (when needed):**
```
feat(chat): implement real-time message editing

- Add edit button to message component
- Store edit history in database
- Emit WebSocket events for live updates
- Add 5-minute edit window restriction

Closes #123
Refs #456
```

**Breaking Changes:**
```
feat(api)!: change user endpoint response structure

BREAKING CHANGE: User API now returns nested profile object
instead of flat structure. Update clients accordingly.

Before: { id, name, email, bio }
After: { id, profile: { name, email, bio } }
```

### Branch Management

- DO NOT delete local branches after merge (preserve history)
- Use descriptive names following pattern:
  - `feat/feature-name` - New features
  - `fix/bug-description` - Bug fixes
  - `docs/what-changed` - Documentation
  - `refactor/area-name` - Code refactoring
  - `test/what-testing` - Test additions
  - `chore/task-name` - Maintenance tasks
- Push to origin/main but keep branch locally
- Local branches serve as backup

### Pull Request Standards

**PR Title:** Follow commit convention
```
feat(dashboard): add user analytics panel
```

**PR Description Template:**
```markdown
## 🎯 Description
Brief overview of what this PR does and why.

## 📝 Type of Change
- [ ] 🐛 Bug fix (non-breaking change which fixes an issue)
- [ ] ✨ New feature (non-breaking change which adds functionality)
- [ ] 💥 Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] 📚 Documentation update
- [ ] 🎨 Style/UI update (formatting, renaming)
- [ ] ♻️ Code refactoring
- [ ] ⚡ Performance improvement
- [ ] ✅ Test update
- [ ] 🔧 Configuration change
- [ ] 🏗️ Build/CI change

## 🔗 Related Issues
Closes #123
Fixes #456
Related to #789

## 🧪 Testing
### How Has This Been Tested?
- [ ] Unit tests
- [ ] Integration tests
- [ ] Manual testing
- [ ] E2E tests

### Test Configuration:
- Node version: 20.x
- OS: macOS / Linux / Windows
- Browser (if applicable): Chrome 120+

## 📸 Screenshots (if applicable)
### Before
[Screenshot or description]

### After
[Screenshot or description]

## ✅ Checklist
- [ ] My code follows the project's style guidelines
- [ ] I have performed a self-review of my own code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] New and existing unit tests pass locally with my changes
- [ ] Any dependent changes have been merged and published

## 📚 Documentation
- [ ] README updated (if needed)
- [ ] API documentation updated (if needed)
- [ ] Inline code comments added
- [ ] CHANGELOG.md updated

## 🔄 Breaking Changes
If this PR introduces breaking changes, describe:
- What breaks
- Migration path
- Deprecation timeline (if applicable)

## 💭 Additional Context
Any additional information that reviewers should know.

## 🎬 Demo
Link to deployed preview or video demo (if applicable)
```

### Issue/Feature Description Standards

**For Bug Reports:**
```markdown
## 🐛 Bug Description
Clear and concise description of what the bug is.

## 📋 Steps to Reproduce
1. Go to '...'
2. Click on '...'
3. Scroll down to '...'
4. See error

## ✅ Expected Behavior
What you expected to happen.

## ❌ Actual Behavior
What actually happened.

## 📸 Screenshots
If applicable, add screenshots.

## 🌍 Environment
- OS: [e.g., macOS 14.0]
- Browser: [e.g., Chrome 120, Safari 17]
- Version: [e.g., v1.2.3]
- Node version: [e.g., 20.10.0]

## 📝 Additional Context
Any other context about the problem.

## 🔍 Possible Solution
If you have ideas on how to fix this (optional).
```

**For Feature Requests:**
```markdown
## 💡 Feature Description
Clear and concise description of the feature.

## 🎯 Problem Statement
What problem does this solve? Who is this for?

## 💭 Proposed Solution
Describe how you envision this feature working.

## 🔄 Alternatives Considered
Other solutions you've thought about.

## 📊 Impact
- Users affected: [e.g., all users, admin only]
- Priority: [low/medium/high]
- Effort estimate: [small/medium/large]

## ✅ Success Criteria
How do we know when this is done?
- [ ] Criterion 1
- [ ] Criterion 2

## 📚 Additional Context
Screenshots, mockups, or references.
```

### CHANGELOG Management

**Keep `CHANGELOG.md` updated following [Keep a Changelog](https://keepachangelog.com/):**
```markdown
# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]
### Added
- New feature X for user authentication
- Support for dark mode in settings

### Changed
- Updated UI component library to v2.0
- Improved performance of search queries

### Deprecated
- Old API endpoint `/v1/users` (use `/v2/users` instead)

### Removed
- Legacy authentication method

### Fixed
- Bug where users couldn't upload images
- Memory leak in WebSocket connection

### Security
- Patched XSS vulnerability in comments section

## [1.2.0] - 2024-01-15
### Added
- Real-time notifications
- User profile customization

### Fixed
- Login redirect issue

## [1.1.0] - 2024-01-01
...
```

**Update CHANGELOG:**
- When completing a PR
- Before creating a release
- Group changes by category
- Include PR/issue references

### Release Notes Standards

**For GitHub Releases:**
```markdown
# v1.2.0 - Codename (e.g., "Winter Storm")

## 🎉 Highlights

The biggest updates in this release:
- 🔐 **OAuth2 Authentication**: Now supports Google and GitHub login
- ⚡ **Performance**: 50% faster page load times
- 🎨 **New UI**: Redesigned dashboard with dark mode

## ✨ New Features

- Add OAuth2 authentication providers (#123) @username
- Implement dark mode across all pages (#145) @username
- Add real-time collaboration features (#156) @username

## 🐛 Bug Fixes

- Fix memory leak in WebSocket connections (#134) @username
- Resolve infinite scroll issue on mobile (#142) @username
- Correct timezone handling in date picker (#151) @username

## 🔧 Improvements

- Optimize database queries for 50% faster load times (#138) @username
- Improve accessibility with ARIA labels (#144) @username
- Update TypeScript to v5.3 (#149) @username

## 💥 Breaking Changes

⚠️ **Action Required**: If you're using the API:

- User endpoint now returns nested profile structure
- Old endpoint `/v1/auth` removed, use `/v2/auth`
- Migration guide: [link to docs]

## 📚 Documentation

- Updated API documentation
- Added authentication guide
- New video tutorials

## 🙏 Contributors

Big thanks to all contributors:
@user1, @user2, @user3

**Full Changelog**: https://github.com/owner/repo/compare/v1.1.0...v1.2.0
```

## Code Review Guidelines (for Contributors)

### When Reviewing PRs

**Check for:**
- ✅ Code follows project conventions
- ✅ Tests are included and pass
- ✅ Documentation is updated
- ✅ No obvious security vulnerabilities
- ✅ Performance considerations addressed
- ✅ Accessibility standards met
- ✅ Error handling is robust

**Review Comment Format:**
```markdown
**[BLOCKING]** This must be fixed before merge
Explanation and suggestion for fix.

**[SUGGESTION]** Consider this improvement
Optional enhancement that would be nice to have.

**[QUESTION]** Clarification needed
Ask about design decision or implementation detail.

**[PRAISE]** 🎉 Great work!
Acknowledge good solutions and practices.
```

### When Your PR is Reviewed

- ✅ Address all blocking comments
- ✅ Respond to all comments (even if just "Fixed in abc123")
- ✅ Re-request review after addressing feedback
- ✅ Mark conversations as resolved when done
- ✅ Be open to suggestions and learning

## Component Development

### Storybook Integration (if available)

Check if project has Storybook:
- `.storybook/` folder exists OR
- `package.json` has `@storybook/*` dependencies OR
- `package.json` has `storybook` scripts

**If Storybook exists in project:**
- ALWAYS create `.stories.tsx` for each component
- Test all states: default, loading, error, empty
- Verify visually before marking complete
- Consider accessibility

**If NO Storybook:**
- Skip stories creation
- Use alternative verification (tests, browser)

### Component Reuse Rule

- ALWAYS check existing components before creating new
- Prefer composition over duplication
- List similar components before creating new ones

Example:
```
❌ DON'T: Create new button from scratch
✅ DO: Find and use existing Button component
```

## Asset Management

- Save all external assets locally in project
- Use descriptive names: `user-icon.svg`, `sparkles-white.png`
- Store in appropriate directories: `public/icons/`
- Update paths to local references
- Add new files to Git

## Security

- NEVER modify security implementations without explicit user request
- Preserve all security patterns and validation
- Do not change webhook URLs or API endpoints without consent
- Maintain double validation for critical data
- Follow [OWASP](https://owasp.org/) security best practices
- Report security issues privately (not in public issues)

## Refactoring

### Refactor-As-You-Go

- Refactor immediately after completing task
- Keep files under 500 lines
- Use nested structure for large modules
- Split large files into smaller components
- Balance with time constraints

## Open Source Best Practices

### README Requirements

Ensure README includes:
- 📖 Clear project description
- 🚀 Quick start guide
- 📦 Installation instructions
- 💻 Usage examples
- 🤝 Contributing guidelines link
- 📄 License information
- 🌟 Badges (build status, coverage, version)
- 📸 Screenshots/GIFs for visual projects

### CONTRIBUTING.md

Create/maintain `CONTRIBUTING.md` with:
- Code of conduct
- Development setup
- Coding standards
- Testing requirements
- PR process
- Issue reporting guidelines
- Contact information

### LICENSE

- Include clear license (MIT, Apache, GPL, etc.)
- Add copyright information
- Reference in README

### Code of Conduct

- Adopt standard code of conduct (Contributor Covenant)
- Make it visible (`CODE_OF_CONDUCT.md`)
- Enforce respectfully

## Key Principles

**Remember:**

- **Quality over speed** - Solid foundations enable sustainable velocity
- **Plan first, code second** - No immediate coding without approval
- **Documentation is investment** - Increases value over time
- **Clear communication** - Write for future contributors
- **Open source mindset** - Your code represents the community
- **Force scanning** - Show reasoning, don't guess
- **Reuse components** - Check design system first
- **You (engineer) × AI = 3x capability** - This is augmented engineering

**Open Source Mantras:**
- 📝 "If it's not documented, it doesn't exist"
- 🔍 "Make it easy for others to contribute"
- 🎯 "Clear commits tell a story"
- 🤝 "Review with empathy, code with clarity"
- 🌍 "Think global, code accessible"

This is AI-augmented engineering, not AI-vibe-led engineering.
This is community-driven development, not solo hacking.
