const chatBody = document.getElementById('chatBody');
const userInput = document.getElementById('userInput');
const sendButton = document.getElementById('sendButton');

sendButton.addEventListener('click', sendMessage);
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});

function sendMessage() {
    const message = userInput.value.trim();
    if (!message) return;

    appendMessage('user-message', message);
    userInput.value = '';

    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'message bot-message';
    loadingDiv.innerHTML = `
        <div class="typing-indicator">
            <span class="typing-dot"></span>
            <span class="typing-dot"></span>
            <span class="typing-dot"></span>
        </div>
    `;
    loadingDiv.setAttribute('aria-live', 'polite');
    loadingDiv.setAttribute('aria-label', 'Assistant is typing');
    chatBody.appendChild(loadingDiv);
    chatBody.scrollTop = chatBody.scrollHeight;

    fetchResponse(message, loadingDiv);
}

function sendPredefinedMessage(message) {
    appendMessage('user-message', message);

    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'message bot-message';
    loadingDiv.innerHTML = `
        <div class="typing-indicator">
            <span class="typing-dot"></span>
            <span class="typing-dot"></span>
            <span class="typing-dot"></span>
        </div>
    `;
    loadingDiv.setAttribute('aria-live', 'polite');
    loadingDiv.setAttribute('aria-label', 'Assistant is typing');
    chatBody.appendChild(loadingDiv);
    chatBody.scrollTop = chatBody.scrollHeight;

    fetchResponse(message, loadingDiv);
}

function appendMessage(className, text) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${className}`;
    const formattedText = formatText(text);
    messageDiv.innerHTML = formattedText;
    chatBody.appendChild(messageDiv);
    setTimeout(() => {
        messageDiv.classList.add('visible');
    }, 10);
    chatBody.scrollTop = chatBody.scrollHeight;
    return messageDiv;
}

function formatText(text) {
    let paragraphs = text.split('\n\n').map(p => p.trim()).filter(p => p.length > 0);
    if (paragraphs.length === 1) {
        paragraphs = text.split('\n').map(p => p.trim()).filter(p => p.length > 0);
    }

    const formatted = paragraphs.map(paragraph => {
        if (paragraph.startsWith('* **') && paragraph.includes(':**')) {
            const headingText = paragraph.match(/\*\s*\*\*(.*?):\*\*/)[1];
            return `<strong>${headingText}:</strong>${paragraph.replace(`* **${headingText}:**`, '').trim()}`;
        }
        return paragraph.startsWith('* ') ? `• ${paragraph.slice(2)}` : paragraph;
    }).join('<br><br>');

    return formatted;
}

async function fetchResponse(prompt, loadingDiv) {
    try {
        const response = await fetch('http://localhost:5000/api/prompt', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt })
        });

        if (!response.ok) {
            throw new Error('Failed to fetch response');
        }

        const data = await response.json();
        const botResponse = data.response;

        chatBody.removeChild(loadingDiv);
        typeBotResponse(botResponse);
    } catch (error) {
        console.error('Error:', error);
        chatBody.removeChild(loadingDiv);
        appendMessage('bot-message', `Sorry, something went wrong: ${error.message}`);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const toggleButton = document.getElementById("themeToggle");
    const body = document.body;

    if (localStorage.getItem("theme") === "dark") {
        body.classList.add("dark");
        if (toggleButton) {
            toggleButton.textContent = "☀️ Light Mode";
            toggleButton.setAttribute("aria-label", "Switch to Light Mode");
        }
    }

    if (toggleButton) {
        toggleButton.addEventListener("click", () => {
            body.classList.toggle("dark");
            const isDark = body.classList.contains("dark");
            toggleButton.textContent = isDark ? "☀️ Light Mode" : "🌙 Dark Mode";
            toggleButton.setAttribute("aria-label", isDark ? "Switch to Light Mode" : "Switch to Dark Mode");
            localStorage.setItem("theme", isDark ? "dark" : "light");
        });
    }

    const helpModal = document.getElementById('helpModal');
    const span = document.getElementsByClassName("close")[0];

    document.getElementById('helpButton').addEventListener('click', () => {
        helpModal.style.display = "block";
    });

    span.onclick = function () {
        helpModal.style.display = "none";
    }

    window.onclick = function (event) {
        if (event.target == helpModal) {
            helpModal.style.display = "none";
        }
    }
});

function typeBotResponse(text) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message bot-message';
    messageDiv.classList.add('visible');
    chatBody.appendChild(messageDiv);

    let index = 0;
    const speed = 15;

    const typeInterval = setInterval(() => {
        messageDiv.innerHTML = formatText(text.substring(0, index));
        chatBody.scrollTop = chatBody.scrollHeight;
        index++;
        if (index > text.length) {
            clearInterval(typeInterval);
        }
    }, speed);
}
