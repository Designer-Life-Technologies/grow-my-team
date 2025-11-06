# 📝 Release Notes Generation Guide

This guide shows you how to create user-focused release notes and automate the process.

## 🎯 AI Prompt for Generating Release Notes

Use this prompt with any AI assistant (ChatGPT, Claude, etc.) to generate great release notes:

```
You are a product communication expert writing release notes for end users.

CONTEXT:
- Product: Grow My Team
- Target audience: Job applicants and HR managers
- Changes in this release: [List of changes, commits, or features]

INSTRUCTIONS:
1. Write release notes that focus ONLY on user experience and benefits
2. Skip all technical details, code changes, or implementation specifics
3. Use simple, fun, conversational language
4. Use emojis to make it visually appealing and easy to scan
5. For EVERY change, explain "Why is this better?" from the user's perspective

FORMAT:
# 🚀 Release Notes

## [Feature/Change Name]

[One sentence describing what changed in plain English]

**Why is this better?**
- [Benefit 1] - [Specific explanation of how this helps the user]
- [Benefit 2] - [Specific explanation of how this helps the user]
- [Benefit 3] - [Specific explanation of how this helps the user]
- [Benefit 4] - [Specific explanation of how this helps the user]

RULES:
- NO technical jargon (no "API", "authentication", "component state", etc.)
- NO developer-focused language
- Focus on outcomes, not implementation
- Use concrete examples when possible (e.g., "Application already exists" instead of "Error 400")
- Keep it short and scannable
- Each benefit should answer: "What's in it for me?"
- Use active, positive language
- Include a "Coming Soon" section if relevant to build excitement

TONE:
- Friendly and approachable
- Enthusiastic but not over-the-top
- Empathetic to user pain points
- Clear and direct

CHANGES TO DOCUMENT:
[Paste your git log, commit messages, or list of changes here]

Generate user-focused release notes following the format above.
```

---

## 🤖 Automating Release Notes

### Option 1: GitHub Actions + Git Cliff (Recommended)

**Step 1:** Install Git Cliff
```bash
brew install git-cliff
```

**Step 2:** Create `.github/workflows/release-notes.yml`
```yaml
name: Generate Release Notes

on:
  push:
    tags:
      - 'v*'  # Triggers on version tags like v1.0.0

jobs:
  release-notes:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0  # Get full history
      
      - name: Generate Release Notes
        uses: orhun/git-cliff-action@v3
        with:
          config: cliff.toml
          args: --latest --strip header
        env:
          OUTPUT: docs/RELEASE_NOTES.md
      
      - name: Commit Release Notes
        run: |
          git config user.name "github-actions[bot]"
          git config user.email "github-actions[bot]@users.noreply.github.com"
          git add docs/RELEASE_NOTES.md
          git commit -m "docs: update release notes for ${{ github.ref_name }}"
          git push
```

**Step 3:** Create `cliff.toml` in project root
```toml
[changelog]
header = "# 🚀 Release Notes\n\n"
body = """
{% for group, commits in commits | group_by(attribute="group") %}
### {{ group | upper_first }}
{% for commit in commits %}
- {{ commit.message | split(pat="\n") | first | trim }}
  {% if commit.breaking %}**BREAKING**: {{ commit.breaking_description }}{% endif %}
{% endfor %}
{% endfor %}
"""

[git]
conventional_commits = true
filter_unconventional = true
commit_parsers = [
  { message = "^feat", group = "🎉 New Features" },
  { message = "^fix", group = "🐛 Bug Fixes" },
  { message = "^perf", group = "⚡ Performance" },
  { message = "^docs", group = "📚 Documentation" },
]
```

**Why this is better:**
- ✅ Fully automated - runs on every tag
- ✅ Uses commit messages to generate notes
- ✅ Commits back to your repo automatically

---

### Option 2: Release Drafter (Simpler Setup)

**Step 1:** Create `.github/workflows/release-drafter.yml`
```yaml
name: Release Drafter

on:
  push:
    branches:
      - main
  pull_request:
    types: [opened, reopened, synchronize]

jobs:
  update_release_draft:
    runs-on: ubuntu-latest
    steps:
      - uses: release-drafter/release-drafter@v5
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

**Step 2:** Create `.github/release-drafter.yml`
```yaml
name-template: 'v$RESOLVED_VERSION'
tag-template: 'v$RESOLVED_VERSION'
categories:
  - title: '🎉 New Features'
    labels:
      - 'feature'
      - 'enhancement'
  - title: '🐛 Bug Fixes'
    labels:
      - 'fix'
      - 'bugfix'
  - title: '📚 Documentation'
    labels:
      - 'documentation'
template: |
  ## What's Changed
  
  $CHANGES
  
  **Why is this better?**
  - Improved user experience
  - Better performance
  - More reliable
```

---

### Option 3: Manual with Git Cliff

```bash
# Tag a release
git tag -a v1.0.0 -m "Release v1.0.0"

# Generate release notes
git cliff --tag v1.0.0 -o docs/RELEASE_NOTES.md

# Review and edit for user benefits

# Commit and push
git add docs/RELEASE_NOTES.md
git commit -m "docs: add release notes for v1.0.0"
git push origin v1.0.0
```

---

## 📋 Using Conventional Commits

Format your commit messages to enable automation:

```bash
feat: add guest application flow
fix: improve error message display
docs: update applicant auth documentation
perf: optimize resume upload
```

**Commit Types:**
- `feat:` → New Features 🎉
- `fix:` → Bug Fixes 🐛
- `docs:` → Documentation 📚
- `perf:` → Performance ⚡
- `refactor:` → Code Refactoring 🔧
- `test:` → Tests ✅
- `chore:` → Maintenance 🧹

**Why this is better:**
- Automatic categorization
- Clear change history
- Better collaboration
- Easier to generate changelogs

---

## 💡 Pro Tips

1. **Write good commit messages** - They become your release notes
2. **Use PR descriptions** - Some tools can pull from PR descriptions too
3. **Review before publishing** - Auto-generate, then manually add "why this matters"
4. **Keep a template** - Have a standard format for user-focused benefits
5. **Test locally first** - Run `git cliff` locally before setting up automation

---

## 🎯 Quick Start Workflow

1. **Make changes** using conventional commits
2. **Tag a release**: `git tag -a v1.0.0 -m "Release v1.0.0"`
3. **Generate notes**: Use AI prompt or Git Cliff
4. **Review and edit**: Add user benefits and "why this matters"
5. **Commit**: `git add docs/RELEASE_NOTES.md && git commit -m "docs: release notes"`
6. **Push**: `git push origin v1.0.0`

---

## 📚 Example Output

See `RELEASE_NOTES.md` for an example of user-focused release notes that:
- Skip technical details
- Focus on benefits
- Use simple language
- Include emojis for visual appeal
- Answer "What's in it for me?"

---

## 🔮 Future Enhancements

Consider adding:
- AI-powered release note generation via GitHub Actions
- Automatic posting to Slack/Discord
- User-facing changelog page on your website
- Email notifications to users about new features
