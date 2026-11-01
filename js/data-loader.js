// Loads the static question catalog before the application starts.
// Keeping catalog data out of the UI code makes the source easier to navigate.
window.DATA = { topics: [], problems: [], companies: {} };

window.dataReady = Promise.all([
  fetch('/data/topics.json').then(response => response.json()),
  fetch('/data/problems.json').then(response => response.json()),
  fetch('/data/companies.json').then(response => response.json())
]).then(([topics, problems, companies]) => {
  window.DATA.topics = topics;
  window.DATA.problems = problems;
  window.DATA.companies = companies;
  return window.DATA;
}).catch(error => {
  console.error('Could not load the question catalog:', error);
  throw new Error('Question catalog failed to load. Start the app with `npm start`.');
});
