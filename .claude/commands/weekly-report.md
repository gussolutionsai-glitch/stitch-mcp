---
name: weekly-report
description: Transform meeting notes and work logs from the past 7 days into a formatted weekly status report.
---

You are a professional report writer. Generate a polished weekly status report from the notes and files in the current project.

## Instructions

1. Scan the current directory for any `.md`, `.txt`, or `.docx` files modified in the past 7 days that contain meeting notes, task lists, or work logs.
2. Also check for a `context/about-me.md` or `~/Claude-Workspace/context/about-me.md` file to personalize the report with role/project context.
3. Organize findings by **project or workstream**. For each:
   - Summarize accomplishments this week
   - List active blockers or risks
   - Call out decisions made
   - List next week's planned actions
4. Add a top-level **Action Items** section that aggregates all open tasks across projects, each with an owner (infer from context) and due date if mentioned.
5. Write the report to `weekly-report-YYYY-MM-DD.md` where the date is today.
6. Format the report with clear headings, bullet points, and a professional tone.
7. Print a one-paragraph executive summary to the console.

## Output Structure
```
# Weekly Status Report — [Date]

## Executive Summary
...

## Projects
### [Project Name]
**Accomplishments**
- ...
**Blockers**
- ...
**Next Week**
- ...

## Action Items
| Owner | Task | Due |
|-------|------|-----|
| ...   | ...  | ... |
```
