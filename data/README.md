# Question catalog

These files are static machine-readable catalog data, kept separate from the UI code.

- `topics.json`: topic names indexed by the topic ID used by problems
- `problems.json`: `[title, difficulty, topicIds, leetcodeSlug]` records
- `companies.json`: company name → `[problemId, frequency, recencyFlags]` records

`js/data-loader.js` loads the three files and exposes them as `window.DATA` before the application starts. Edit the application modules, not this generated catalog, unless you intentionally want to change the dataset.
