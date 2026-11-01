/* Teja AI Assistant frontend (vanilla JS) */
(function(){
  const fab = document.getElementById('teja-ai-fab');
  const panel = document.getElementById('teja-ai-panel');
  const closeBtn = document.getElementById('teja-ai-close');
  const clearBtn = document.getElementById('teja-ai-clear');
  const form = document.getElementById('teja-ai-form');
  const input = document.getElementById('teja-ai-input');
  const messagesEl = document.getElementById('teja-ai-messages');
  const suggestions = document.getElementById('teja-ai-suggestions');

  const SYSTEM_PROMPT = `You are Teja's AI Portfolio Assistant. You speak on behalf of Teja in a professional, confident, and engaging tone. 
Your goal is to impress recruiters, developers, and founders.

About Teja:
- B.Tech CSE Student at SRM University AP (CGPA: 8.12)
- Creative Frontend Engineer & Full Stack Developer
- Specializes in Real-time Web Applications and Cloud-Native Development.

Why hire Teja? (Recruiter Mode)
- Built and deployed real-world applications.
- Deep experience with real-time systems (WebSockets, Firebase).
- AWS & Cloud exposure with a focus on scalable architecture.
- Strong JavaScript, Node.js, and Firebase skills.
- Obsessive focus on production-quality UI/UX and cinematic motion.

Projects:
1. Campus Connect (Flagship)
   - Realtime campus social platform.
   - Tech: JavaScript, Firebase Auth, Firestore.
   - Features: Anonymous Chat, Friend Chat, Group Chat, Real-time Updates, Typing Indicators.
   - Links: [Live Demo](https://campus-connectu-i1ys.vercel.app/) | [Open GitHub](https://github.com/tejapampana09/Campus-Connectu.git)
2. Vital Plasma
   - Plasma donor management system for urgent workflows.
   - Tech: Node.js, REST APIs, Express, MySQL.
   - Links: [Live Demo](https://vital-plasma.onrender.com) | [Open GitHub](https://github.com/tejapampana09/Vital-Plasma.git)
3. QuantumCrop AI
   - AI-powered smart agriculture concept.
   - Tech: Python, Machine Learning.
   - Links: [Live Demo](https://quantumcrop-ai.onrender.com) | [Open GitHub](https://github.com/tejapampana09/QuantumCrop-AI.git)

Resume:
If they ask for a resume, provide this markdown link: [Download Resume](teja%20gadu.pdf)

Contact:
Email: tejapampana36@gmail.com
LinkedIn: [View LinkedIn](https://linkedin.com/in/tejapampana09)
GitHub: [View GitHub](https://github.com/tejapampana09)

Formatting rules:
- Keep answers concise but punchy. Use bullet points where appropriate.
- When providing links or actions, ALWAYS use markdown format exactly like this: [Button Text](URL). Example: [Download Resume](teja gadu.pdf)
- Use emojis naturally to add personality.
- Always remember context from the chat history.`;

  let chatHistory = [];
  let hasOpened = false;
  let sending = false;
  let focusTimer;

  const quickSuggestionsHTML = `
    <button class="teja-ai-suggestion">🚀 Campus Connect</button>
    <button class="teja-ai-suggestion">☁️ AWS Experience</button>
    <button class="teja-ai-suggestion">💻 Technical Skills</button>
    <button class="teja-ai-suggestion">🎓 Education</button>
    <button class="teja-ai-suggestion">📄 Download Resume</button>
  `;

  function showSuggestions() {
    suggestions.innerHTML = quickSuggestionsHTML;
    suggestions.style.display = 'flex';
  }

  function openPanel(){
    panel.inert = false;
    panel.classList.add('open');
    panel.setAttribute('aria-hidden','false');
    fab.setAttribute('aria-expanded','true');
    
    if(!hasOpened) {
      hasOpened = true;
      pushMessage('ai', "👋 Hi, I'm Teja's AI assistant.\n\nI can tell you about:\n• Projects\n• Skills\n• Cloud Experience\n• Education\n• Resume\n\nWhat would you like to know?");
      showSuggestions();
    }
    
    // focus input after open
    clearTimeout(focusTimer);
    focusTimer = setTimeout(() => { if (panel.classList.contains('open')) input.focus(); }, 220);
  }
  function closePanel(){
    clearTimeout(focusTimer);
    fab.focus();
    panel.inert = true;
    panel.classList.remove('open');
    panel.setAttribute('aria-hidden','true');
    fab.setAttribute('aria-expanded','false');
  }

  fab.addEventListener('click', ()=>{
    if(panel.classList.contains('open')) closePanel(); else openPanel();
  });
  closeBtn.addEventListener('click', closePanel);
  clearBtn.addEventListener('click', () => {
    chatHistory = [];
    messagesEl.innerHTML = '';
    showSuggestions();
  });

  // suggestions
  suggestions.addEventListener('click', (e)=>{
    const btn = e.target.closest('.teja-ai-suggestion');
    if(!btn || sending) return;
    const q = btn.textContent.trim().replace(/^(🚀|☁️|💻|🎓|📄)\s*/, '');
    pushMessage('user', q);
    suggestions.style.display = 'none';
    sendMessage(q);
  });

  form.addEventListener('submit', (e)=>{
    e.preventDefault();
    const val = input.value.trim();
    if(!val || sending) return;
    pushMessage('user', val);
    input.value = '';
    suggestions.style.display = 'none';
    sendMessage(val);
  });

  // Build links as DOM nodes; chat text must never be interpreted as HTML.
  function renderMessage(element, text) {
    const pattern = /\[([^\]]+)\]\(([^)]+)\)/g;
    let cursor = 0;
    for (const match of text.matchAll(pattern)) {
      element.append(document.createTextNode(text.slice(cursor, match.index)));
      let url;
      try { url = new URL(match[2], window.location.href); } catch (_) {}
      if (url && ['https:', 'http:', 'mailto:'].includes(url.protocol)) {
        const link = document.createElement('a');
        link.textContent = match[1];
        link.href = url.href;
        link.className = 'ai-action-btn';
        if (url.origin === window.location.origin && url.pathname.endsWith('/teja%20gadu.pdf')) {
          link.download = '';
        } else {
          link.target = '_blank';
          link.rel = 'noopener noreferrer';
        }
        element.append(link);
      } else {
        element.append(document.createTextNode(match[0]));
      }
      cursor = match.index + match[0].length;
    }
    element.append(document.createTextNode(text.slice(cursor)));
  }

  function pushMessage(role, text){
    const el = document.createElement('div');
    el.className = 'teja-ai-message ' + (role==='user' ? 'user' : 'ai');
    renderMessage(el, String(text));
    messagesEl.appendChild(el);
    messagesEl.scrollTop = messagesEl.scrollHeight;
    
    if (role === 'user') {
      chatHistory.push({ role: 'user', content: text });
    } else {
      chatHistory.push({ role: 'assistant', content: text });
    }
    
    // Keep history manageable (last 20 messages)
    if(chatHistory.length > 20) chatHistory = chatHistory.slice(-20);
    
    return el;
  }

  function pushTyping(){
    const el = document.createElement('div');
    el.className = 'teja-ai-typing';
    el.innerHTML = '<div class="typing-text">Teja AI is thinking...</div><div class="typing-dots"><span></span><span></span><span></span></div>';
    messagesEl.appendChild(el);
    messagesEl.scrollTop = messagesEl.scrollHeight;
    return el;
  }

  async function sendMessage(text){
    sending = true;
    const controls = [input, clearBtn, ...form.querySelectorAll('button'), ...suggestions.querySelectorAll('button')];
    controls.forEach(control => control.disabled = true);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);
    const typingEl = pushTyping();
    try{
      const res = await fetch('https://mvs5gdwhxsk756dg4l3algxuia0rbcyi.lambda-url.us-east-1.on.aws/', {
        method:'POST',
        signal: controller.signal,
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ messages: chatHistory, system: SYSTEM_PROMPT })
      });
      if(!res.ok) throw new Error('Network response not ok');
      const data = await res.json();
      const reply = data?.reply || 'Sorry, I could not generate a response right now.';
      typingEl.remove();
      pushMessage('ai', reply);
      
      // Re-display suggestions after AI answers
      showSuggestions();
    }catch(err){
      typingEl.remove();
      pushMessage('ai', 'Sorry, something went wrong.');
      console.error('chat error', err);
    } finally {
      clearTimeout(timeout);
      sending = false;
      controls.forEach(control => control.disabled = false);
    }
  }

  // keyboard shortcut: / to focus input
  window.addEventListener('keydown', (e)=>{
    if (e.key === 'Escape' && panel.classList.contains('open')) { closePanel(); return; }
    if(e.key === '/' && !e.ctrlKey && !e.metaKey && !e.altKey && !document.activeElement.isContentEditable && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA'){
      e.preventDefault();
      if(!panel.classList.contains('open')) openPanel();
      input.focus();
    }
  });

})();
