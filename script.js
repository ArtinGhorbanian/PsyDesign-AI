/* ==========================================================================
   PsyDesign AI: Frontend Application Logic
   ==========================================================================
   
   Description: This script handles all client-side functionality for the
                PsyDesign AI application, including:
                - DOM element selection and management.
                - API communication with the FastAPI backend.
                - Dynamic rendering of brand identity results.
                - State management for the current session.
                - Event handling for user interactions (e.g., clicks, inputs).
                - UI animations and effects, like the custom cursor.
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

    // --------------------------------------------------------------------------
    // 1. STATE MANAGEMENT
    //    Variables to hold the application's state, such as current data,
    //    history, and audio playback status.
    // --------------------------------------------------------------------------
    let currentAnalysisData = null; // Stores the JSON analysis of the currently displayed brand
    let currentHistory = []; // Caches the list of past designs from the server
    let currentAudio = null; // Holds the active Audio object for TTS playback
    let currentlyPlayingButton = null; // Tracks the play/pause button of the active audio


    // --------------------------------------------------------------------------
    // 2. DOM ELEMENT SELECTORS
    //    Centralized access to all necessary DOM elements.
    // --------------------------------------------------------------------------
    const DOMElements = {
        generateBtn: document.getElementById('generate-btn'),
        brandDescriptionInput: document.getElementById('brand-description'),
        loaderContainer: document.getElementById('loader-container'),
        brandOutput: document.getElementById('brand-output'),
        historyList: document.getElementById('history-list'),
        menuToggle: document.getElementById('menu-toggle'),
        sidebar: document.getElementById('sidebar'),
        newDesignBtn: document.getElementById('new-design-btn'),
        inputSectionWrapper: document.getElementById('input-section-wrapper'),
        sidebarOverlay: document.getElementById('sidebar-overlay'),
        sidebarCloseBtn: document.getElementById('sidebar-close-btn'),
        languageSelector: document.getElementById('language-selector'),
        currentLangText: document.getElementById('current-lang-text'),
        languageOptions: document.getElementById('language-options'),
        allLangOptions: document.querySelectorAll('#language-options li'),
        customCursor: document.querySelector('.custom-cursor')
    };


    // --------------------------------------------------------------------------
    // 3. UI & UX ENHANCEMENTS
    //    Functions related to visual effects and user experience.
    // --------------------------------------------------------------------------

    /**
     * Initializes a custom cursor that follows the user's mouse.
     * It adds a class to the body when hovering over interactive elements.
     * This effect is disabled on touch devices.
     */
    const initCustomCursor = () => {
        // Check if the device is a fine-pointer device (like a mouse)
        if (window.matchMedia("(pointer: fine)").matches) {
            let mouse = { x: -100, y: -100 };
            let pos = { x: 0, y: 0 };
            const speed = 0.1; // Smoothing factor for cursor movement

            window.addEventListener('mousemove', e => {
                mouse.x = e.clientX;
                mouse.y = e.clientY;
            });

            // Animation loop for smooth cursor movement
            const updateCursorPosition = () => {
                pos.x += (mouse.x - pos.x) * speed;
                pos.y += (mouse.y - pos.y) * speed;
                DOMElements.customCursor.style.transform = `translate3d(${pos.x - (DOMElements.customCursor.offsetWidth / 2)}px, ${pos.y - (DOMElements.customCursor.offsetHeight / 2)}px, 0)`;
                requestAnimationFrame(updateCursorPosition);
            };
            updateCursorPosition();

            // Add hover effect on interactive elements
            const interactiveElements = 'a, button, .history-item, textarea, input, li, .sidebar-logo-container';
            document.body.addEventListener('mouseover', (e) => {
                const isInteractive = !!e.target.closest(interactiveElements);
                document.body.classList.toggle('link-hover', isInteractive);
            });
        }
    };

    /**
     * Toggles the visibility of the sidebar and the overlay.
     * Manages the visibility of the hamburger menu icon.
     */
    const toggleSidebar = () => {
        const isOpen = DOMElements.sidebar.classList.toggle('open');
        DOMElements.sidebarOverlay.classList.toggle('active', isOpen);
        DOMElements.menuToggle.classList.toggle('hidden', isOpen);
    };


    // --------------------------------------------------------------------------
    // 4. CORE APPLICATION LOGIC
    // --------------------------------------------------------------------------

    /**
     * Sets up the language selector based on the current page language.
     * Handles opening/closing the dropdown and navigating on language change.
     */
    const setupLanguageSelector = () => {
        const currentLangValue = document.documentElement.lang || 'en';
        const selectedOption = Array.from(DOMElements.allLangOptions).find(li => li.dataset.value === currentLangValue);

        if (selectedOption) {
            DOMElements.currentLangText.textContent = selectedOption.textContent;
            selectedOption.classList.add('selected');
        }

        DOMElements.languageSelector.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent the document click listener from closing it immediately
            DOMElements.languageSelector.classList.toggle('open');
        });

        DOMElements.allLangOptions.forEach(li => {
            li.addEventListener('click', () => {
                window.location.href = `/?lang=${li.dataset.value}`;
            });
        });
    };

    /**
     * Switches the view back to the initial input screen.
     * Clears the input, hides results, and resets the active history item.
     */
    const showInputScreen = () => {
        DOMElements.inputSectionWrapper.style.display = 'block';
        DOMElements.loaderContainer.style.display = 'none';
        DOMElements.brandOutput.style.display = 'none';
        DOMElements.brandDescriptionInput.value = '';
        setActiveHistoryItem(null); // Deselect any active history item
    };

    /**
     * Highlights the currently selected history item in the sidebar.
     * @param {number|null} id The ID of the history item to activate.
     */
    const setActiveHistoryItem = (id) => {
        document.querySelectorAll('.history-item').forEach(el => {
            const isActive = id !== null && parseInt(el.dataset.id, 10) === id;
            el.classList.toggle('active', isActive);
        });
    };
    
    /**
     * Dynamically loads a Google Font by creating a <link> element in the <head>.
     * Prevents loading the same font multiple times.
     * @param {string} fontName The name of the Google Font to load.
     */
    const loadGoogleFont = (fontName) => {
        const fontId = `font-${fontName.replace(/\s+/g, '-')}`;
        if (document.getElementById(fontId)) return; // Font already loaded

        const link = document.createElement('link');
        link.id = fontId;
        link.rel = 'stylesheet';
        link.href = `https://fonts.googleapis.com/css2?family=${fontName.replace(/\s+/g, '+')}:wght@400;700&display=swap`;
        document.head.appendChild(link);
    };


    // --------------------------------------------------------------------------
    // 5. API INTERACTIONS
    // --------------------------------------------------------------------------

    /**
     * Fetches the design history from the backend and renders it in the sidebar.
     */
    async function fetchAndRenderHistory() {
        try {
            const response = await fetch('/api/history');
            if (!response.ok) throw new Error('Failed to fetch history.');
            
            currentHistory = await response.json();
            DOMElements.historyList.innerHTML = ''; // Clear previous list
            
            currentHistory.forEach(item => {
                const li = document.createElement('li');
                li.className = 'history-item';
                li.dataset.id = item.id;
                li.title = item.description; // Tooltip for long descriptions
                li.innerHTML = `
                    <p>${item.description}</p>
                    <button class="delete-history-btn" title="Delete"><i data-lucide="x" size="16"></i></button>
                `;

                // Attach event listener for deleting the item
                li.querySelector('.delete-history-btn').addEventListener('click', (e) => {
                    e.stopPropagation(); // Prevent the item click from firing
                    handleDeleteHistory(item.id, li);
                });

                // Attach event listener for displaying the item
                li.addEventListener('click', () => displayHistoryItem(item.id));

                DOMElements.historyList.appendChild(li);
            });
            
            lucide.createIcons(); // Re-render icons after adding new elements
        } catch (error) {
            console.error('Error loading history:', error);
            // Optionally, display a message to the user in the UI
        }
    }

    /**
     * Handles the brand generation request.
     * Sends the description to the backend and displays the results or an error.
     */
    async function handleGenerateClick() {
        const description = DOMElements.brandDescriptionInput.value.trim();
        if (!description) {
            alert('Please describe your brand concept.');
            return;
        }

        // Show loader and hide other sections
        DOMElements.inputSectionWrapper.style.display = 'none';
        DOMElements.loaderContainer.style.display = 'block';
        DOMElements.brandOutput.style.display = 'none';

        try {
            const response = await fetch('/api/generate-brand', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ description, language: document.documentElement.lang }),
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.detail || 'Server error occurred.');
            }
            
            const data = await response.json();
            displayResults(data.analysis, data.logo_url);
            await fetchAndRenderHistory(); // Refresh history list
            setActiveHistoryItem(data.id); // Highlight the new item
        
        } catch (error) {
            console.error('Error:', error);
            alert(`Failed to generate brand identity: ${error.message}`);
            showInputScreen(); // Revert to input screen on error
        } finally {
            DOMElements.loaderContainer.style.display = 'none';
        }
    }

    /**
     * Sends a request to delete a history item from the database.
     * @param {number} id The ID of the item to delete.
     * @param {HTMLElement} element The list item element to remove from the DOM.
     */
    async function handleDeleteHistory(id, element) {
        if (!confirm('Are you sure you want to delete this design?')) return;

        try {
            const response = await fetch(`/api/history/${id}`, { method: 'DELETE' });
            if (!response.ok) throw new Error('Failed to delete item.');

            // Animate removal
            element.style.transition = 'opacity 0.3s, transform 0.3s';
            element.style.opacity = '0';
            element.style.transform = 'translateX(-20px)';
            
            setTimeout(() => {
                element.remove();
                // If the deleted item was the active one, go back to the home screen
                if (element.classList.contains('active')) {
                    showInputScreen();
                }
            }, 300);

        } catch (error) {
            console.error('Error deleting history item:', error);
            alert('Could not delete the item.');
        }
    }
    
    /**
     * Handles sending a chat message to the persona API and displaying the reply.
     */
    async function handleChatSend() {
        const chatInput = document.getElementById('chat-input');
        const message = chatInput.value.trim();

        if (!message || !currentAnalysisData) return;

        appendChatMessage(message, 'user');
        chatInput.value = '';
        chatInput.disabled = true;

        try {
            const response = await fetch('/api/chat-with-persona', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    analysis: JSON.stringify(currentAnalysisData),
                    message,
                    language: document.documentElement.lang
                }),
            });

            if (!response.ok) throw new Error("Chat API Error");
            
            const data = await response.json();
            appendChatMessage(data.reply || 'Sorry, I could not respond.', 'persona');

        } catch (error) {
            console.error('Chat error:', error);
            appendChatMessage('An error occurred. Please try again.', 'persona');
        } finally {
            chatInput.disabled = false;
            chatInput.focus();
        }
    }

    /**
     * Handles the Text-to-Speech (TTS) request for a chat message.
     * @param {HTMLElement} button The button that was clicked to trigger TTS.
     */
    async function handleTTS(button) {
        const textToSpeak = button.dataset.text;

        if (currentlyPlayingButton === button) {
            // If the same button is clicked again, stop the audio
            stopCurrentAudio();
        } else {
            // Stop any currently playing audio before starting a new one
            stopCurrentAudio();
            
            currentlyPlayingButton = button;
            button.innerHTML = '<i data-lucide="x" size="18"></i>'; // Change to a "stop" icon
            lucide.createIcons();
            
            try {
                const response = await fetch('/api/tts', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ text: textToSpeak }),
                });

                if (!response.ok) throw new Error('Failed to generate audio.');

                const audioBlob = await response.blob();
                const audioUrl = URL.createObjectURL(audioBlob);
                currentAudio = new Audio(audioUrl);
                currentAudio.play();
                
                // When the audio finishes, reset the state
                currentAudio.onended = stopCurrentAudio;

            } catch (error) {
                console.error('TTS error:', error);
                alert('Could not play audio.');
                stopCurrentAudio(); // Reset on error
            }
        }
    }
    
    /**
     * Downloads the generated logo using a server-side proxy to avoid CORS issues.
     */
    async function handleDownloadLogo() {
        const btn = document.getElementById('download-logo-btn');
        const logoImg = document.getElementById('main-logo-img');
        if (!logoImg || btn.disabled) return;

        btn.innerHTML = '<div class="download-loader"></div>'; // Show loading spinner
        btn.disabled = true;

        try {
            const logoUrl = logoImg.src;
            // Use the proxy endpoint
            const proxyUrl = `/api/proxy-image?url=${encodeURIComponent(logoUrl)}`;
            
            const response = await fetch(proxyUrl);
            if (!response.ok) throw new Error(`Failed to fetch image: ${response.statusText}`);
            
            const imageBlob = await response.blob();
            const blobUrl = URL.createObjectURL(imageBlob);
            
            // Create a temporary link to trigger the download
            const link = document.createElement('a');
            link.href = blobUrl;
            const brandName = currentAnalysisData?.brand_names?.[0]?.replace(/\s+/g, '_') || 'brand';
            link.download = `logo_${brandName}.png`;
            
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            URL.revokeObjectURL(blobUrl); // Clean up the blob URL

        } catch (error) {
            console.error("Download Error:", error);
            alert(`Could not download the logo: ${error.message}`);
        } finally {
            // Restore the button to its original state
            btn.disabled = false;
            btn.innerHTML = '<i data-lucide="download"></i>';
            lucide.createIcons();
        }
    }


    // --------------------------------------------------------------------------
    // 6. DYNAMIC RENDERING
    // --------------------------------------------------------------------------

    /**
     * Renders the complete brand analysis results into the main content area.
     * @param {object} analysisData The JSON object with brand details.
     * @param {string} logoUrl The URL of the generated logo image.
     */
    function displayResults(analysisData, logoUrl) {
        currentAnalysisData = analysisData;
        const t = getResultTranslations();
        
        const { brand_personality, visual_identity, target_audience_persona, brand_names, slogans, brand_story } = analysisData;
        
        const headingFont = visual_identity.font_pairing.heading.name;
        const bodyFont = visual_identity.font_pairing.body.name;
        loadGoogleFont(headingFont);
        loadGoogleFont(bodyFont);

        DOMElements.brandOutput.innerHTML = `
            <div class="result-card">
                <h2>${t.report_title}</h2>
                <div class="grid-2">
                    <div class="grid-item"><h4>${t.brand_archetype}</h4><p>${brand_personality.archetype}</p></div>
                    <div class="grid-item"><h4>${t.tone_of_voice}</h4><p>${brand_personality.tone_of_voice}</p></div>
                    <div class="grid-item" style="grid-column: 1 / -1;"><h4>${t.core_values}</h4><ul>${brand_personality.values.map(v => `<li>${v}</li>`).join('')}</ul></div>
                </div>
            </div>
            
            <div class="result-card">
                <h2>${t.logo_title}</h2>
                <div class="logo-container">
                    <img src="${logoUrl}" alt="Generated Brand Logo" id="main-logo-img">
                    <button class="download-logo-btn" id="download-logo-btn" title="Download Logo"><i data-lucide="download"></i></button>
                </div>
            </div>

            <div class="result-card">
                <h2>${t.font_pairing_live}</h2>
                <div class="font-preview-container">
                    <p class="font-preview-heading" style="font-family: '${headingFont}', var(--font-heading);">${t.font_preview_heading_text}</p>
                    <p class="font-preview-body" style="font-family: '${bodyFont}', var(--font-body);">${t.font_preview_body_text}</p>
                </div>
                <p class="font-info">${t.heading}: ${headingFont} | ${t.body}: ${bodyFont}</p>
            </div>

            <div class="result-card">
                <h2>${t.brand_story_title}</h2>
                <p><em>"${brand_story}"</em></p>
            </div>

            <div class="result-card">
                <h2>${t.brand_names_title}</h2>
                <ul class="suggestions-list">${brand_names.map(name => `<li>${name}</li>`).join('')}</ul>
            </div>

            <div class="result-card">
                <h2>${t.slogans_title}</h2>
                <ul class="suggestions-list">${slogans.map(slogan => `<li>${slogan}</li>`).join('')}</ul>
            </div>

            <div class="result-card">
                <h3>${t.target_audience}: ${target_audience_persona.name}</h3>
                <div class="grid-2">
                    <div class="grid-item"><p><strong>${t.age}:</strong> ${target_audience_persona.age_range}</p></div>
                    <div class="grid-item"><p><strong>${t.occupation}:</strong> ${target_audience_persona.occupation}</p></div>
                </div>
                <div class="grid-item" style="margin-top: 1.5rem;"><h4>${t.interests}</h4><ul>${target_audience_persona.interests.map(i => `<li>${i}</li>`).join('')}</ul></div>
                <div class="grid-item" style="margin-top: 1.5rem;"><h4>${t.pain_points}</h4><ul>${target_audience_persona.pain_points.map(p => `<li>${p}</li>`).join('')}</ul></div>
            </div>

            <div class="result-card persona-chat-container">
                <h2>${t.chat_title}</h2>
                <div id="chat-box" class="chat-box"></div>
                <div class="chat-input-area">
                    <input type="text" id="chat-input" placeholder="${t.chat_placeholder}">
                    <button id="chat-send-btn"><i data-lucide="send"></i></button>
                </div>
            </div>
        `;

        DOMElements.inputSectionWrapper.style.display = 'none';
        DOMElements.brandOutput.style.display = 'flex';

        // Add event listeners for newly created elements
        document.getElementById('chat-send-btn').addEventListener('click', handleChatSend);
        document.getElementById('chat-input').addEventListener('keyup', e => { if (e.key === 'Enter') handleChatSend(); });
        document.getElementById('download-logo-btn').addEventListener('click', handleDownloadLogo);
        lucide.createIcons();
    }
    
    /**
     * Displays a specific design from the history cache.
     * @param {number} id The ID of the history item to display.
     */
    function displayHistoryItem(id) {
        const item = currentHistory.find(h => h.id == id);
        if (item) {
            displayResults(item.analysis, item.logo_url);
            setActiveHistoryItem(id);
            if (DOMElements.sidebar.classList.contains('open')) {
                toggleSidebar(); // Close sidebar on mobile after selection
            }
        }
    }
    
    /**
     * Appends a new message to the chat box UI.
     * @param {string} text The message content.
     * @param {('user'|'persona')} sender The sender of the message.
     */
    function appendChatMessage(text, sender) {
        const chatBox = document.getElementById('chat-box');
        if (!chatBox) return;

        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message ${sender}`;

        const bubble = document.createElement('div');
        bubble.className = 'message-bubble';
        bubble.textContent = text;
        messageDiv.appendChild(bubble);

        // Add copy and speak buttons only for persona messages
        if (sender === 'persona') {
            const actionsDiv = document.createElement('div');
            actionsDiv.className = 'chat-message-actions';
            actionsDiv.innerHTML = `
                <button class="chat-action-btn copy-btn" title="Copy text"><i data-lucide="copy" size="16"></i></button>
                <button class="chat-action-btn speak-btn" title="Read aloud" data-text="${text.replace(/"/g, '&quot;')}">
                    <img src="/static/speaker-filled-audio-tool.png" alt="Speak">
                </button>
            `;
            messageDiv.appendChild(actionsDiv);
            
            // Attach listeners for the new buttons
            const copyBtn = actionsDiv.querySelector('.copy-btn');
            copyBtn.addEventListener('click', () => {
                navigator.clipboard.writeText(text).then(() => {
                    copyBtn.innerHTML = '<i data-lucide="check" size="16"></i>';
                    lucide.createIcons();
                    setTimeout(() => {
                        copyBtn.innerHTML = '<i data-lucide="copy" size="16"></i>';
                        lucide.createIcons();
                    }, 1500);
                });
            });

            const speakBtn = actionsDiv.querySelector('.speak-btn');
            speakBtn.addEventListener('click', () => handleTTS(speakBtn));
        }

        chatBox.appendChild(messageDiv);
        lucide.createIcons();
        chatBox.scrollTop = chatBox.scrollHeight; // Auto-scroll to the bottom
    }


    // --------------------------------------------------------------------------
    // 7. HELPERS & UTILITIES
    // --------------------------------------------------------------------------

    /**
     * Stops the currently playing TTS audio and resets the button icon.
     */
    function stopCurrentAudio() {
        if (currentAudio) {
            currentAudio.pause();
            currentAudio = null;
        }
        if (currentlyPlayingButton) {
            currentlyPlayingButton.innerHTML = `<img src="/static/speaker-filled-audio-tool.png" alt="Speak">`;
            currentlyPlayingButton = null;
        }
    }
    
    /**
     * Provides a dictionary of translated strings for the dynamically rendered
     * result cards, based on the current page language.
     * @returns {object} The translation object for the current language.
     */
    function getResultTranslations() {
        const translations = {
            en: { report_title: "Brand Psychology Report", logo_title: "Generated Logo", chat_title: "Chat with Your Brand Persona", chat_placeholder: "Ask about brand voice...", brand_archetype: "Brand Archetype", tone_of_voice: "Tone of Voice", core_values: "Core Values", font_pairing_live: "Live Font Pairing Preview", heading: "Heading", body: "Body", target_audience: "Target Audience", age: "Age", occupation: "Occupation", interests: "Interests", pain_points: "Pain Points", brand_names_title: "Suggested Brand Names", slogans_title: "Suggested Slogans", brand_story_title: "Brand Story", font_preview_heading_text: "This is a Heading.", font_preview_body_text: "This is the body text. It's designed to give you a feel for the selected font in a paragraph." },
            es: { report_title: "Informe de Psicología de Marca", logo_title: "Logo Generado", chat_title: "Chatea con la Persona de tu Marca", chat_placeholder: "Pregunta sobre el tono...", brand_archetype: "Arquetipo de Marca", tone_of_voice: "Tono de Voz", core_values: "Valores Fundamentales", font_pairing_live: "Previsualización de Fuentes en Vivo", heading: "Título", body: "Cuerpo", target_audience: "Público Objetivo", age: "Edad", occupation: "Ocupación", interests: "Intereses", pain_points: "Puntos de Dolor", brand_names_title: "Nombres de Marca Sugeridos", slogans_title: "Lemas Sugeridos", brand_story_title: "Historia de la Marca", font_preview_heading_text: "Esto es un Título.", font_preview_body_text: "Este es el texto del cuerpo. Está diseñado para que te hagas una idea de la fuente seleccionada en un párrafo." },
            fr: { report_title: "Rapport de Psychologie de Marque", logo_title: "Logo Généré", chat_title: "Discutez avec le Persona", chat_placeholder: "Posez des questions...", brand_archetype: "Archétype de Marque", tone_of_voice: "Ton de la Voix", core_values: "Valeurs Fondamentales", font_pairing_live: "Aperçu en Direct des Polices", heading: "Titre", body: "Corps", target_audience: "Public Cible", age: "Âge", occupation: "Profession", interests: "Intérêts", pain_points: "Points de Douleur", brand_names_title: "Noms de Marque Suggérés", slogans_title: "Slogans Suggérés", brand_story_title: "Histoire de la Marque", font_preview_heading_text: "Ceci est un Titre.", font_preview_body_text: "Ceci est le corps du texte. Il est conçu pour vous donner une idée de la police sélectionnée dans un paragraphe." },
            hi: { report_title: "ब्रांड मनोविज्ञान रिपोर्ट", logo_title: "उत्पन्न लोगो", chat_title: "अपने ब्रांड व्यक्तित्व से चैट करें", chat_placeholder: "आवाज़ के बारे में पूछें...", brand_archetype: "ब्रांड आद्यरूप", tone_of_voice: "आवाज़ का लहजा", core_values: "मूलभूत मूल्य", font_pairing_live: "लाइव फ़ॉन्ट पूर्वावलोकन", heading: "शीर्षक", body: "मुख्य-भाग", target_audience: "लक्षित दर्शक", age: "आयु", occupation: "व्यवसाय", interests: "रूचियाँ", pain_points: "समस्याएं", brand_names_title: "सुझाए गए ब्रांड नाम", slogans_title: "सुझाए गए नारे", brand_story_title: "ब्रांड की कहानी", font_preview_heading_text: "यह एक शीर्षक है।", font_preview_body_text: "यह मुख्य लेख है। इसे आपको एक पैराग्राफ में चयनित फ़ॉन्ट का अनुभव देने के लिए डिज़ाइन किया गया है।" },
            zh: { report_title: "品牌心理学报告", logo_title: "生成的标志", chat_title: "与您的品牌形象聊天", chat_placeholder: "询问品牌声音...", brand_archetype: "品牌原型", tone_of_voice: "语气", core_values: "核心价值观", font_pairing_live: "字体实时预览", heading: "标题", body: "正文", target_audience: "目标受众", age: "年龄", occupation: "职业", interests: "兴趣", pain_points: "痛点", brand_names_title: "建议的品牌名称", slogans_title: "建议的口号", brand_story_title: "品牌故事", font_preview_heading_text: "这是一个标题。", font_preview_body_text: "这是正文文本。它旨在让您感受所选字体在段落中的效果。" },
            ar: { report_title: "تقرير سيكولوجية العلامة التجارية", logo_title: "الشعار المُولَّد", chat_title: "تحدث مع شخصية علامتك", chat_placeholder: "اسأل عن نبرة العلامة...", brand_archetype: "النموذج الأصلي للعلامة", tone_of_voice: "نبرة الصوت", core_values: "القيم الأساسية", font_pairing_live: "معاينة حية للخطوط", heading: "عنوان", body: "متن", target_audience: "الجمهور المستهدف", age: "العمر", occupation: "المهنة", interests: "الاهتمامات", pain_points: "نقاط الألم", brand_names_title: "أسماء تجارية مقترحة", slogans_title: "شعارات مقترحة", brand_story_title: "قصة العلامة التجارية", font_preview_heading_text: "هذا عنوان.", font_preview_body_text: "هذا هو نص المتن. وهو مصمم ليعطيك إحساسًا بالخط المحدد في فقرة." },
        };
        return translations[document.documentElement.lang] || translations['en'];
    }


    // --------------------------------------------------------------------------
    // 8. INITIALIZATION & EVENT LISTENERS
    //    Code that runs once the DOM is ready.
    // --------------------------------------------------------------------------
    
    /**
     * Main initialization function.
     */
    const init = () => {
        lucide.createIcons();
        fetchAndRenderHistory();
        setupLanguageSelector();
        initCustomCursor();

        // --- Global Event Listeners ---
        DOMElements.generateBtn.addEventListener('click', handleGenerateClick);
        DOMElements.menuToggle.addEventListener('click', toggleSidebar);
        DOMElements.sidebarOverlay.addEventListener('click', toggleSidebar);
        DOMElements.sidebarCloseBtn.addEventListener('click', toggleSidebar);
        DOMElements.newDesignBtn.addEventListener('click', showInputScreen);

        // Close language dropdown if clicked outside
        document.addEventListener('click', () => {
            if (DOMElements.languageSelector.classList.contains('open')) {
                DOMElements.languageSelector.classList.remove('open');
            }
        });
    };

    // Run the initialization function
    init();
});