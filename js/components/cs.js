// Systems & CS Fundamentals Resource Desk

window.renderCSTab = function() {
  const container = document.getElementById('tab-cs');
  
  const resources = [
    {
      category: 'System Design (HLD & LLD)',
      icon: '🏗️',
      color: '#a78bfa',
      description: 'Architecting scalable applications and object-oriented design.',
      links: [
        { title: 'System Design Primer (GitHub)', url: 'https://github.com/donnemartin/system-design-primer', type: 'Repo', desc: 'The absolute gold standard for learning how to design large-scale systems.' },
        { title: 'ByteByteGo / Alex Xu', url: 'https://bytebytego.com/', type: 'Course', desc: 'Highly visual explanations of complex system architectures.' },
        { title: 'Grokking the System Design Interview', url: 'https://www.educative.io/courses/grokking-the-system-design-interview', type: 'Course', desc: 'The classic text-based course that covers all standard interview questions.' },
        { title: 'System Design Interview Channel', url: 'https://www.youtube.com/c/SystemDesignInterview', type: 'YouTube', desc: 'Deep dives into real-world architectures by Mikhail.' },
        { title: 'Awesome System Design', url: 'https://github.com/madd86/awesome-system-design', type: 'Repo', desc: 'Curated list of system design resources and articles.' }
      ]
    },
    {
      category: 'Database Management',
      icon: '🗄️',
      color: '#f59e0b',
      description: 'SQL, NoSQL, internals, transactions, and indexing.',
      links: [
        { title: 'Hussein Nasser (Database Engineering)', url: 'https://www.youtube.com/c/HusseinNasser-software-engineering', type: 'YouTube', desc: 'The best channel for deep, practical database and backend engineering.' },
        { title: 'CMU Database Systems (15-445)', url: 'https://15445.courses.cs.cmu.edu/', type: 'Course', desc: 'Andy Pavlo’s legendary lectures on how databases actually work under the hood.' },
        { title: 'Use the Index, Luke!', url: 'https://use-the-index-luke.com/', type: 'Article', desc: 'A guide to database performance and indexing for developers.' },
        { title: 'Designing Data-Intensive Applications', url: 'https://dataintensive.net/', type: 'Book', desc: 'The definitive book on modern data engineering and distributed databases.' }
      ]
    },
    {
      category: 'Operating Systems',
      icon: '⚙️',
      color: '#38bdf8',
      description: 'Processes, concurrency, memory management, and virtualization.',
      links: [
        { title: 'OSTEP (Operating Systems: Three Easy Pieces)', url: 'https://pages.cs.wisc.edu/~remzi/OSTEP/', type: 'Book (Free)', desc: 'The best modern OS textbook. Covers virtualization, concurrency, and persistence.' },
        { title: 'CS162 (UC Berkeley OS)', url: 'https://cs162.org/', type: 'Course', desc: 'Excellent deep dive into operating system concepts and implementations.' },
        { title: 'Little OS Book', url: 'https://littleosbook.github.io/', type: 'Book (Free)', desc: 'A hands-on guide to building your own operating system from scratch.' },
        { title: 'Jacob Sorber (C & Systems)', url: 'https://www.youtube.com/c/JacobSorber', type: 'YouTube', desc: 'Fantastic explanations of C, threads, pointers, and systems programming.' }
      ]
    },
    {
      category: 'Computer Networks',
      icon: '🌐',
      color: '#10b981',
      description: 'Protocols, routing, HTTP, TCP/UDP, and security.',
      links: [
        { title: 'Computer Networking: A Top-Down Approach', url: 'https://www.pearson.com/', type: 'Book', desc: 'The standard academic text that is actually incredibly readable and practical.' },
        { title: 'Ben Eater (Networking from Scratch)', url: 'https://eater.net/', type: 'YouTube', desc: 'Builds networking concepts literally from wires to protocols.' },
        { title: 'High Performance Browser Networking', url: 'https://hpbn.co/', type: 'Book (Free)', desc: 'Ilya Grigorik’s guide to TCP, UDP, TLS, and how the web actually works.' },
        { title: 'Beej\'s Guide to Network Programming', url: 'https://beej.us/guide/bgnet/', type: 'Guide', desc: 'The classic, slightly humorous guide to C sockets and internet programming.' }
      ]
    },
    {
      category: 'General CS & Interview Prep',
      icon: '📚',
      color: '#ec4899',
      description: 'Comprehensive guides, roadmaps, and cheat sheets.',
      links: [
        { title: 'Developer Roadmap', url: 'https://roadmap.sh/', type: 'Guide', desc: 'Visual roadmaps for frontend, backend, devops, and more.' },
        { title: 'Tech Interview Handbook', url: 'https://www.techinterviewhandbook.org/', type: 'Repo', desc: 'Yangshun Tay’s curated guide to crushing software engineering interviews.' },
        { title: 'Teach Yourself CS', url: 'https://teachyourselfcs.com/', type: 'Guide', desc: 'If you are self-taught or forgot your degree, follow this exact syllabus.' },
        { title: 'CS50 (Harvard)', url: 'https://cs50.harvard.edu/x/', type: 'Course', desc: 'The gold standard introduction to computer science.' }
      ]
    }
  ];

  let html = `
    <div style="padding: 24px; max-width:1200px; margin:0 auto;">
      <div style="display:flex; justify-content:space-between; align-items:flex-end; margin-bottom:32px;">
        <div>
          <h2 style="font-family:var(--font-display); font-size:28px; font-weight:800; color:var(--ink); margin:0 0 8px 0; letter-spacing:-0.5px;">Systems & CS Resources</h2>
          <div style="font-family:var(--font-body); font-size:14px; color:var(--ink-soft); max-width:700px; line-height:1.6;">
            A curated collection of the absolute best repositories, books, and courses for mastering computer science fundamentals and system design. Bookmark this page for interview season.
          </div>
        </div>
      </div>
      
      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(350px, 1fr)); gap:24px;">
        ${resources.map(m => `
          <div style="background:var(--bg-panel); border:1px solid var(--border); border-radius:16px; overflow:hidden; display:flex; flex-direction:column;">
            
            <div style="padding:20px; border-bottom:1px solid var(--border); background:rgba(255,255,255,0.02); display:flex; align-items:center; gap:12px;">
              <div style="width:40px; height:40px; border-radius:10px; background:${m.color}20; color:${m.color}; display:flex; justify-content:center; align-items:center; font-size:20px;">${m.icon}</div>
              <div>
                <h3 style="font-family:var(--font-display); font-size:16px; font-weight:700; color:var(--ink); margin:0 0 4px 0;">${m.category}</h3>
                <div style="font-family:var(--font-body); font-size:12px; color:var(--ink-soft);">${m.description}</div>
              </div>
            </div>
            
            <div style="padding:20px; display:flex; flex-direction:column; gap:16px; flex:1;">
              ${m.links.map(link => {
                let badgeColor = '#38bdf8'; // default
                if (link.type === 'Repo') badgeColor = '#a78bfa';
                else if (link.type === 'Course') badgeColor = '#f59e0b';
                else if (link.type === 'YouTube') badgeColor = '#ef4444';
                else if (link.type === 'Book (Free)' || link.type === 'Book') badgeColor = '#10b981';
                
                return `
                  <a href="${link.url}" target="_blank" style="text-decoration:none; display:block; padding:12px; border-radius:8px; border:1px solid transparent; transition:all 0.2s; background:rgba(255,255,255,0.02);"
                     onmouseover="this.style.background='rgba(255,255,255,0.05)'; this.style.borderColor='var(--border-strong)'"
                     onmouseout="this.style.background='rgba(255,255,255,0.02)'; this.style.borderColor='transparent'">
                    <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:6px;">
                      <span style="font-family:var(--font-display); font-size:14.5px; font-weight:600; color:var(--accent);">${esc(link.title)}</span>
                      <span style="font-family:var(--font-mono); font-size:10px; font-weight:700; color:${badgeColor}; background:${badgeColor}20; padding:2px 8px; border-radius:10px; border:1px solid ${badgeColor}40;">${link.type}</span>
                    </div>
                    <div style="font-family:var(--font-body); font-size:13px; color:var(--ink-soft); line-height:1.5;">${esc(link.desc)}</div>
                  </a>
                `;
              }).join('')}
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
  container.innerHTML = html;
  container.style.display = 'block';
};
