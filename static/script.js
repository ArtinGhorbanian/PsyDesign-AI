(() => {
    "use strict";

    const SUPPORTED_LANGUAGES = new Set(["en", "es", "fr", "hi", "zh", "ar"]);
    const LANGUAGE_LOCALES = {
        en: "en-US",
        es: "es-ES",
        fr: "fr-FR",
        hi: "hi-IN",
        zh: "zh-CN",
        ar: "ar-SA"
    };

    const ENGLISH_COPY = {
        skip: "Skip to main content",
        openMenu: "Open menu",
        closeMenu: "Close menu",
        newDesign: "New design",
        history: "Design history",
        historyLoading: "Loading saved designs…",
        historyEmpty: "No saved designs yet.",
        historyError: "Saved designs could not be loaded.",
        retry: "Retry",
        language: "Language",
        eyebrow: "Brand strategy workspace",
        briefTitle: "Describe the brand",
        briefIntro: "Give the strategist enough context to make deliberate choices.",
        descriptionLabel: "Brand concept",
        descriptionHelp: "Include the audience, offer, personality, and what should feel different.",
        descriptionPlaceholder: "Example: A thoughtful refillable coffee brand for busy city creatives who want a calmer daily ritual.",
        sampleLegend: "Start with an example",
        sampleCoffee: "Sustainable coffee ritual",
        sampleWellness: "Calm workplace wellness",
        sampleLearning: "Playful language learning",
        sampleCoffeeValue: "A sustainable refillable coffee brand for busy city creatives who want a calmer, more intentional morning ritual.",
        sampleWellnessValue: "A practical workplace wellness service for small remote teams, with a warm expert voice and five-minute guided resets.",
        sampleLearningValue: "A playful language-learning app for curious adults who want useful conversations, gentle progress, and no classroom pressure.",
        privacySummary: "Mode and data use",
        privacyDemo: "Demo mode creates local sample reports. Descriptions remain in this app’s history until you delete them.",
        privacyLive: "Live mode sends descriptions and persona messages to the configured AI provider. Reports remain in local history until you delete them.",
        modeDemo: "Demo mode",
        modeLive: "AI mode",
        generate: "Build brand direction",
        generating: "Building direction…",
        generationNote: "A complete report usually takes a moment.",
        resultsEyebrow: "Brand direction",
        resultsTitle: "Your strategy report",
        emptyTitle: "A clear brief becomes a useful system.",
        emptyBody: "Describe your idea above, or revisit a saved report from design history.",
        loadingTitle: "Building the brand direction",
        loadingBody: "Connecting personality, audience, voice, and visual cues…",
        errorTitle: "The report could not be created.",
        retryGenerate: "Try again",
        required: "Describe the brand before generating a report.",
        tooShort: "Add a little more detail—at least 12 characters.",
        generationStarted: "Brand generation started.",
        generationSuccess: "Your brand direction is ready.",
        generationError: "Something interrupted generation. Your description is still here, so you can try again.",
        historyDeleted: "The saved design was deleted.",
        confirmDelete: "Delete this saved design? This cannot be undone.",
        deleteDesign: "Delete saved design",
        openDesign: "Open saved design",
        savedOn: "Saved {date}",
        reportKicker: "Brand psychology report",
        reportTitle: "Strategic direction for {name}",
        untitledBrand: "your brand",
        reportModeDemo: "Demo report",
        reportModeLive: "AI report",
        snapshot: "Identity snapshot",
        archetype: "Brand archetype",
        tone: "Tone of voice",
        values: "Core values",
        visual: "Visual identity",
        logo: "Generated logo",
        logoAlt: "Generated logo for {name}",
        logoUnavailable: "The logo is unavailable or its address is not trusted.",
        downloadLogo: "Download logo",
        downloading: "Preparing download…",
        downloadError: "The logo could not be downloaded.",
        fonts: "Recommended font pairing",
        heading: "Heading",
        body: "Body",
        storyAndLanguage: "Story and brand language",
        story: "Brand story",
        names: "Suggested names",
        slogans: "Suggested slogans",
        socialBio: "Social media bio",
        audience: "Audience persona",
        age: "Age range",
        occupation: "Occupation",
        interests: "Interests",
        painPoints: "Pain points",
        campaign: "Campaign direction",
        campaignIdea: "Marketing campaign idea",
        logoConcept: "Logo concept",
        chat: "Talk with the brand persona",
        chatHelp: "Test how this brand should sound in a customer conversation.",
        chatEmpty: "Ask about messaging, positioning, audience needs, or campaign ideas.",
        chatLabel: "Message to the brand persona",
        chatPlaceholder: "Ask how the brand would respond…",
        send: "Send",
        sending: "Thinking…",
        copy: "Copy",
        copied: "Copied",
        copyError: "The message could not be copied.",
        speak: "Read aloud",
        stopSpeaking: "Stop reading",
        speechError: "Audio is unavailable on this device.",
        chatError: "I could not respond just now. Please try again.",
        notAvailable: "Not available",
        invalidReport: "This saved report is incomplete and cannot be displayed.",
        sectionNumber: "Section {number}"
    };

    const LOCALIZED_COPY = {
        es: {
            skip: "Saltar al contenido principal", openMenu: "Abrir menú", closeMenu: "Cerrar menú", newDesign: "Nuevo diseño", history: "Historial de diseños", historyLoading: "Cargando diseños guardados…", historyEmpty: "Aún no hay diseños guardados.", historyError: "No se pudieron cargar los diseños guardados.", retry: "Reintentar", language: "Idioma", eyebrow: "Espacio de estrategia de marca", briefTitle: "Describe la marca", briefIntro: "Da al estratega suficiente contexto para tomar decisiones intencionales.", descriptionLabel: "Concepto de marca", descriptionHelp: "Incluye el público, la oferta, la personalidad y qué debería sentirse diferente.", descriptionPlaceholder: "Ejemplo: Una marca de café rellenable para creativos urbanos que buscan un ritual diario más tranquilo.", sampleLegend: "Empieza con un ejemplo", sampleCoffee: "Ritual de café sostenible", sampleWellness: "Bienestar laboral sereno", sampleLearning: "Idiomas de forma lúdica", sampleCoffeeValue: "Una marca de café sostenible y rellenable para creativos urbanos ocupados que quieren un ritual matutino más tranquilo e intencional.", sampleWellnessValue: "Un servicio práctico de bienestar laboral para pequeños equipos remotos, con voz experta y cálida y pausas guiadas de cinco minutos.", sampleLearningValue: "Una aplicación lúdica de idiomas para adultos curiosos que quieren conversaciones útiles, progreso amable y ninguna presión escolar.", privacySummary: "Modo y uso de datos", privacyDemo: "El modo demo crea informes de muestra locales. Las descripciones quedan en el historial hasta que las elimines.", privacyLive: "El modo IA envía descripciones y mensajes al proveedor configurado. Los informes quedan en el historial local hasta que los elimines.", modeDemo: "Modo demo", modeLive: "Modo IA", generate: "Crear dirección de marca", generating: "Creando dirección…", generationNote: "Un informe completo suele tardar un momento.", resultsEyebrow: "Dirección de marca", resultsTitle: "Tu informe estratégico", emptyTitle: "Un brief claro se convierte en un sistema útil.", emptyBody: "Describe tu idea arriba o vuelve a un informe guardado.", loadingTitle: "Creando la dirección de marca", loadingBody: "Conectando personalidad, público, voz y claves visuales…", errorTitle: "No se pudo crear el informe.", retryGenerate: "Intentar de nuevo", required: "Describe la marca antes de generar un informe.", tooShort: "Añade un poco más de detalle: al menos 12 caracteres.", generationStarted: "La generación de marca ha comenzado.", generationSuccess: "Tu dirección de marca está lista.", generationError: "Algo interrumpió la generación. Tu descripción sigue aquí para que puedas reintentar.", historyDeleted: "El diseño guardado se eliminó.", confirmDelete: "¿Eliminar este diseño guardado? No se puede deshacer.", deleteDesign: "Eliminar diseño guardado", openDesign: "Abrir diseño guardado", savedOn: "Guardado el {date}", reportKicker: "Informe de psicología de marca", reportTitle: "Dirección estratégica para {name}", untitledBrand: "tu marca", reportModeDemo: "Informe demo", reportModeLive: "Informe IA", snapshot: "Resumen de identidad", archetype: "Arquetipo de marca", tone: "Tono de voz", values: "Valores centrales", visual: "Identidad visual", logo: "Logo generado", logoAlt: "Logo generado para {name}", logoUnavailable: "El logo no está disponible o su dirección no es fiable.", downloadLogo: "Descargar logo", downloading: "Preparando descarga…", downloadError: "No se pudo descargar el logo.", fonts: "Combinación tipográfica recomendada", heading: "Titular", body: "Texto", storyAndLanguage: "Historia y lenguaje de marca", story: "Historia de marca", names: "Nombres sugeridos", slogans: "Lemas sugeridos", socialBio: "Biografía para redes", audience: "Persona del público", age: "Rango de edad", occupation: "Ocupación", interests: "Intereses", painPoints: "Puntos de dolor", campaign: "Dirección de campaña", campaignIdea: "Idea de campaña de marketing", logoConcept: "Concepto del logo", chat: "Habla con la persona de marca", chatHelp: "Prueba cómo debería sonar esta marca ante un cliente.", chatEmpty: "Pregunta sobre mensajes, posicionamiento, necesidades o campañas.", chatLabel: "Mensaje para la persona de marca", chatPlaceholder: "Pregunta cómo respondería la marca…", send: "Enviar", sending: "Pensando…", copy: "Copiar", copied: "Copiado", copyError: "No se pudo copiar el mensaje.", speak: "Leer en voz alta", stopSpeaking: "Detener lectura", speechError: "El audio no está disponible en este dispositivo.", chatError: "No pude responder ahora. Inténtalo de nuevo.", notAvailable: "No disponible", invalidReport: "Este informe guardado está incompleto y no puede mostrarse.", sectionNumber: "Sección {number}"
        },
        fr: {
            skip: "Aller au contenu principal", openMenu: "Ouvrir le menu", closeMenu: "Fermer le menu", newDesign: "Nouveau design", history: "Historique des designs", historyLoading: "Chargement des designs…", historyEmpty: "Aucun design enregistré.", historyError: "Impossible de charger les designs enregistrés.", retry: "Réessayer", language: "Langue", eyebrow: "Espace de stratégie de marque", briefTitle: "Décrivez la marque", briefIntro: "Donnez au stratège assez de contexte pour faire des choix réfléchis.", descriptionLabel: "Concept de marque", descriptionHelp: "Précisez le public, l’offre, la personnalité et ce qui doit sembler différent.", descriptionPlaceholder: "Exemple : Une marque de café rechargeable pour les créatifs urbains qui souhaitent un rituel quotidien plus calme.", sampleLegend: "Commencer par un exemple", sampleCoffee: "Rituel café durable", sampleWellness: "Bien-être au travail", sampleLearning: "Langues ludiques", sampleCoffeeValue: "Une marque de café durable et rechargeable pour les créatifs urbains occupés qui veulent un rituel matinal plus calme et intentionnel.", sampleWellnessValue: "Un service pratique de bien-être pour de petites équipes à distance, avec une voix experte chaleureuse et des pauses guidées de cinq minutes.", sampleLearningValue: "Une application ludique de langues pour les adultes curieux qui veulent des conversations utiles, des progrès doux et aucune pression scolaire.", privacySummary: "Mode et utilisation des données", privacyDemo: "Le mode démo crée des rapports d’exemple locaux. Les descriptions restent dans l’historique jusqu’à leur suppression.", privacyLive: "Le mode IA envoie les descriptions et messages au fournisseur configuré. Les rapports restent dans l’historique local jusqu’à leur suppression.", modeDemo: "Mode démo", modeLive: "Mode IA", generate: "Créer la direction de marque", generating: "Création en cours…", generationNote: "Un rapport complet prend généralement un moment.", resultsEyebrow: "Direction de marque", resultsTitle: "Votre rapport stratégique", emptyTitle: "Un brief clair devient un système utile.", emptyBody: "Décrivez votre idée ci-dessus ou rouvrez un rapport enregistré.", loadingTitle: "Création de la direction de marque", loadingBody: "Mise en relation de la personnalité, du public, de la voix et des repères visuels…", errorTitle: "Le rapport n’a pas pu être créé.", retryGenerate: "Réessayer", required: "Décrivez la marque avant de générer un rapport.", tooShort: "Ajoutez un peu plus de détail — au moins 12 caractères.", generationStarted: "La génération de marque a commencé.", generationSuccess: "Votre direction de marque est prête.", generationError: "La génération a été interrompue. Votre description est conservée pour réessayer.", historyDeleted: "Le design enregistré a été supprimé.", confirmDelete: "Supprimer ce design enregistré ? Cette action est irréversible.", deleteDesign: "Supprimer le design", openDesign: "Ouvrir le design", savedOn: "Enregistré le {date}", reportKicker: "Rapport de psychologie de marque", reportTitle: "Direction stratégique pour {name}", untitledBrand: "votre marque", reportModeDemo: "Rapport démo", reportModeLive: "Rapport IA", snapshot: "Aperçu de l’identité", archetype: "Archétype de marque", tone: "Ton de voix", values: "Valeurs fondamentales", visual: "Identité visuelle", logo: "Logo généré", logoAlt: "Logo généré pour {name}", logoUnavailable: "Le logo est indisponible ou son adresse n’est pas fiable.", downloadLogo: "Télécharger le logo", downloading: "Préparation du téléchargement…", downloadError: "Le logo n’a pas pu être téléchargé.", fonts: "Association de polices recommandée", heading: "Titre", body: "Corps", storyAndLanguage: "Récit et langage de marque", story: "Histoire de marque", names: "Noms suggérés", slogans: "Slogans suggérés", socialBio: "Bio pour les réseaux", audience: "Persona du public", age: "Tranche d’âge", occupation: "Profession", interests: "Centres d’intérêt", painPoints: "Points de friction", campaign: "Direction de campagne", campaignIdea: "Idée de campagne marketing", logoConcept: "Concept du logo", chat: "Parler avec le persona de marque", chatHelp: "Testez la manière dont cette marque devrait s’exprimer face à un client.", chatEmpty: "Questionnez le message, le positionnement, les besoins ou les campagnes.", chatLabel: "Message au persona de marque", chatPlaceholder: "Demandez comment la marque répondrait…", send: "Envoyer", sending: "Réflexion…", copy: "Copier", copied: "Copié", copyError: "Le message n’a pas pu être copié.", speak: "Lire à voix haute", stopSpeaking: "Arrêter la lecture", speechError: "L’audio n’est pas disponible sur cet appareil.", chatError: "Je ne peux pas répondre pour le moment. Réessayez.", notAvailable: "Non disponible", invalidReport: "Ce rapport enregistré est incomplet et ne peut pas être affiché.", sectionNumber: "Section {number}"
        },
        hi: {
            skip: "मुख्य सामग्री पर जाएँ", openMenu: "मेनू खोलें", closeMenu: "मेनू बंद करें", newDesign: "नया डिज़ाइन", history: "डिज़ाइन इतिहास", historyLoading: "सहेजे गए डिज़ाइन लोड हो रहे हैं…", historyEmpty: "अभी कोई डिज़ाइन सहेजा नहीं गया है।", historyError: "सहेजे गए डिज़ाइन लोड नहीं हो सके।", retry: "फिर प्रयास करें", language: "भाषा", eyebrow: "ब्रांड रणनीति कार्यक्षेत्र", briefTitle: "ब्रांड का वर्णन करें", briefIntro: "सोचे-समझे निर्णयों के लिए रणनीतिकार को पर्याप्त संदर्भ दें।", descriptionLabel: "ब्रांड अवधारणा", descriptionHelp: "दर्शक, पेशकश, व्यक्तित्व और क्या अलग महसूस होना चाहिए, यह बताएँ।", descriptionPlaceholder: "उदाहरण: व्यस्त शहरी रचनाकारों के लिए रिफिलेबल कॉफी ब्रांड जो शांत दैनिक रस्म चाहते हैं।", sampleLegend: "एक उदाहरण से शुरू करें", sampleCoffee: "सस्टेनेबल कॉफी रस्म", sampleWellness: "शांत कार्यस्थल वेलनेस", sampleLearning: "खेलपूर्ण भाषा सीखना", sampleCoffeeValue: "व्यस्त शहरी रचनाकारों के लिए एक टिकाऊ रिफिलेबल कॉफी ब्रांड, जो शांत और उद्देश्यपूर्ण सुबह की रस्म चाहते हैं।", sampleWellnessValue: "छोटी रिमोट टीमों के लिए व्यावहारिक वेलनेस सेवा, गर्म विशेषज्ञ आवाज़ और पाँच मिनट के निर्देशित विरामों के साथ।", sampleLearningValue: "जिज्ञासु वयस्कों के लिए खेलपूर्ण भाषा ऐप, जो उपयोगी बातचीत, सहज प्रगति और बिना कक्षा के दबाव के सीखना चाहते हैं।", privacySummary: "मोड और डेटा उपयोग", privacyDemo: "डेमो मोड स्थानीय नमूना रिपोर्ट बनाता है। विवरण हटाने तक इस ऐप के इतिहास में रहते हैं।", privacyLive: "AI मोड विवरण और संदेश कॉन्फ़िगर किए गए प्रदाता को भेजता है। रिपोर्ट हटाने तक स्थानीय इतिहास में रहती हैं।", modeDemo: "डेमो मोड", modeLive: "AI मोड", generate: "ब्रांड दिशा बनाएँ", generating: "दिशा बन रही है…", generationNote: "पूरी रिपोर्ट में आमतौर पर थोड़ा समय लगता है।", resultsEyebrow: "ब्रांड दिशा", resultsTitle: "आपकी रणनीति रिपोर्ट", emptyTitle: "स्पष्ट ब्रीफ़ एक उपयोगी प्रणाली बनता है।", emptyBody: "ऊपर अपना विचार बताएँ या इतिहास से सहेजी रिपोर्ट खोलें।", loadingTitle: "ब्रांड दिशा बन रही है", loadingBody: "व्यक्तित्व, दर्शक, आवाज़ और दृश्य संकेत जोड़े जा रहे हैं…", errorTitle: "रिपोर्ट नहीं बन सकी।", retryGenerate: "फिर प्रयास करें", required: "रिपोर्ट बनाने से पहले ब्रांड का वर्णन करें।", tooShort: "थोड़ा और विवरण जोड़ें—कम से कम 12 अक्षर।", generationStarted: "ब्रांड निर्माण शुरू हुआ।", generationSuccess: "आपकी ब्रांड दिशा तैयार है।", generationError: "निर्माण रुक गया। आपका विवरण सुरक्षित है, इसलिए फिर प्रयास कर सकते हैं।", historyDeleted: "सहेजा गया डिज़ाइन हटा दिया गया।", confirmDelete: "यह सहेजा डिज़ाइन हटाएँ? इसे वापस नहीं किया जा सकता।", deleteDesign: "सहेजा डिज़ाइन हटाएँ", openDesign: "सहेजा डिज़ाइन खोलें", savedOn: "{date} को सहेजा", reportKicker: "ब्रांड मनोविज्ञान रिपोर्ट", reportTitle: "{name} के लिए रणनीतिक दिशा", untitledBrand: "आपका ब्रांड", reportModeDemo: "डेमो रिपोर्ट", reportModeLive: "AI रिपोर्ट", snapshot: "पहचान सारांश", archetype: "ब्रांड आद्यरूप", tone: "आवाज़ का लहजा", values: "मूल मूल्य", visual: "दृश्य पहचान", logo: "बनाया गया लोगो", logoAlt: "{name} के लिए बनाया गया लोगो", logoUnavailable: "लोगो उपलब्ध नहीं है या उसका पता विश्वसनीय नहीं है।", downloadLogo: "लोगो डाउनलोड करें", downloading: "डाउनलोड तैयार हो रहा है…", downloadError: "लोगो डाउनलोड नहीं हो सका।", fonts: "सुझाई गई फ़ॉन्ट जोड़ी", heading: "शीर्षक", body: "मुख्य टेक्स्ट", storyAndLanguage: "कहानी और ब्रांड भाषा", story: "ब्रांड कहानी", names: "सुझाए गए नाम", slogans: "सुझाए गए नारे", socialBio: "सोशल मीडिया परिचय", audience: "दर्शक व्यक्तित्व", age: "आयु सीमा", occupation: "पेशा", interests: "रुचियाँ", painPoints: "समस्याएँ", campaign: "अभियान दिशा", campaignIdea: "मार्केटिंग अभियान विचार", logoConcept: "लोगो अवधारणा", chat: "ब्रांड व्यक्तित्व से बात करें", chatHelp: "देखें कि ग्राहक से बातचीत में यह ब्रांड कैसा सुनाई देना चाहिए।", chatEmpty: "मैसेजिंग, पोज़िशनिंग, दर्शकों या अभियान के बारे में पूछें।", chatLabel: "ब्रांड व्यक्तित्व के लिए संदेश", chatPlaceholder: "पूछें कि ब्रांड कैसे जवाब देगा…", send: "भेजें", sending: "सोच रहा है…", copy: "कॉपी करें", copied: "कॉपी हो गया", copyError: "संदेश कॉपी नहीं हो सका।", speak: "ज़ोर से पढ़ें", stopSpeaking: "पढ़ना रोकें", speechError: "इस डिवाइस पर ऑडियो उपलब्ध नहीं है।", chatError: "मैं अभी उत्तर नहीं दे सका। फिर प्रयास करें।", notAvailable: "उपलब्ध नहीं", invalidReport: "यह सहेजी रिपोर्ट अधूरी है और दिखाई नहीं जा सकती।", sectionNumber: "खंड {number}"
        },
        zh: {
            skip: "跳到主要内容", openMenu: "打开菜单", closeMenu: "关闭菜单", newDesign: "新建设计", history: "设计历史", historyLoading: "正在加载已保存的设计…", historyEmpty: "还没有已保存的设计。", historyError: "无法加载已保存的设计。", retry: "重试", language: "语言", eyebrow: "品牌策略工作区", briefTitle: "描述品牌", briefIntro: "提供足够背景，让策略选择更有依据。", descriptionLabel: "品牌概念", descriptionHelp: "说明受众、产品或服务、个性，以及希望形成的差异感。", descriptionPlaceholder: "示例：面向忙碌城市创意人群的可续杯咖啡品牌，带来更平静的日常仪式。", sampleLegend: "从示例开始", sampleCoffee: "可持续咖啡仪式", sampleWellness: "平静的职场健康", sampleLearning: "趣味语言学习", sampleCoffeeValue: "一个面向忙碌城市创意人群的可持续续杯咖啡品牌，帮助他们建立更平静、更有意识的晨间仪式。", sampleWellnessValue: "面向小型远程团队的实用职场健康服务，以温暖专业的语气提供五分钟引导式休息。", sampleLearningValue: "面向好奇成年人的趣味语言学习应用，强调实用对话、温和进步和无课堂压力。", privacySummary: "模式与数据使用", privacyDemo: "演示模式在本地创建示例报告。描述会保存在本应用历史中，直到你删除。", privacyLive: "AI 模式会把描述和角色消息发送给已配置的 AI 提供方。报告会保存在本地历史中，直到你删除。", modeDemo: "演示模式", modeLive: "AI 模式", generate: "生成品牌方向", generating: "正在生成方向…", generationNote: "完整报告通常需要一点时间。", resultsEyebrow: "品牌方向", resultsTitle: "你的策略报告", emptyTitle: "清晰的简报能转化为有用的系统。", emptyBody: "在上方描述想法，或从设计历史中打开已保存报告。", loadingTitle: "正在构建品牌方向", loadingBody: "正在连接个性、受众、语气和视觉线索…", errorTitle: "无法创建报告。", retryGenerate: "再试一次", required: "请先描述品牌，再生成报告。", tooShort: "请增加一些细节，至少 12 个字符。", generationStarted: "品牌生成已开始。", generationSuccess: "你的品牌方向已准备好。", generationError: "生成过程被中断。描述仍然保留，你可以重试。", historyDeleted: "已删除保存的设计。", confirmDelete: "删除这个已保存的设计？此操作无法撤销。", deleteDesign: "删除保存的设计", openDesign: "打开保存的设计", savedOn: "保存于 {date}", reportKicker: "品牌心理报告", reportTitle: "{name} 的策略方向", untitledBrand: "你的品牌", reportModeDemo: "演示报告", reportModeLive: "AI 报告", snapshot: "品牌识别摘要", archetype: "品牌原型", tone: "语气", values: "核心价值", visual: "视觉识别", logo: "生成的标志", logoAlt: "为 {name} 生成的标志", logoUnavailable: "标志不可用或地址不可信。", downloadLogo: "下载标志", downloading: "正在准备下载…", downloadError: "无法下载标志。", fonts: "推荐字体组合", heading: "标题", body: "正文", storyAndLanguage: "品牌故事与语言", story: "品牌故事", names: "建议名称", slogans: "建议口号", socialBio: "社交媒体简介", audience: "受众角色", age: "年龄范围", occupation: "职业", interests: "兴趣", painPoints: "痛点", campaign: "活动方向", campaignIdea: "营销活动创意", logoConcept: "标志概念", chat: "与品牌角色对话", chatHelp: "测试这个品牌在客户对话中应该如何表达。", chatEmpty: "可询问信息表达、定位、受众需求或活动创意。", chatLabel: "给品牌角色的消息", chatPlaceholder: "询问品牌会如何回应…", send: "发送", sending: "思考中…", copy: "复制", copied: "已复制", copyError: "无法复制消息。", speak: "朗读", stopSpeaking: "停止朗读", speechError: "此设备无法播放音频。", chatError: "暂时无法回应，请重试。", notAvailable: "暂无", invalidReport: "此保存报告不完整，无法显示。", sectionNumber: "第 {number} 部分"
        },
        ar: {
            skip: "انتقل إلى المحتوى الرئيسي", openMenu: "فتح القائمة", closeMenu: "إغلاق القائمة", newDesign: "تصميم جديد", history: "سجل التصاميم", historyLoading: "جارٍ تحميل التصاميم المحفوظة…", historyEmpty: "لا توجد تصاميم محفوظة بعد.", historyError: "تعذر تحميل التصاميم المحفوظة.", retry: "إعادة المحاولة", language: "اللغة", eyebrow: "مساحة استراتيجية العلامة", briefTitle: "صِف العلامة", briefIntro: "امنح الخبير سياقًا كافيًا لاتخاذ قرارات مدروسة.", descriptionLabel: "فكرة العلامة", descriptionHelp: "اذكر الجمهور والعرض والشخصية وما الذي يجب أن يبدو مختلفًا.", descriptionPlaceholder: "مثال: علامة قهوة قابلة لإعادة التعبئة للمبدعين في المدن ممن يريدون طقسًا يوميًا أكثر هدوءًا.", sampleLegend: "ابدأ بمثال", sampleCoffee: "طقس قهوة مستدام", sampleWellness: "عافية هادئة للعمل", sampleLearning: "تعلّم لغة ممتع", sampleCoffeeValue: "علامة قهوة مستدامة قابلة لإعادة التعبئة للمبدعين المشغولين في المدن ممن يريدون طقسًا صباحيًا أكثر هدوءًا وقصدًا.", sampleWellnessValue: "خدمة عافية عملية لفرق العمل الصغيرة عن بُعد، بصوت خبير ودافئ واستراحات موجهة مدتها خمس دقائق.", sampleLearningValue: "تطبيق ممتع لتعلم اللغات للبالغين الفضوليين الذين يريدون محادثات مفيدة وتقدمًا لطيفًا دون ضغط الصفوف.", privacySummary: "الوضع واستخدام البيانات", privacyDemo: "ينشئ الوضع التجريبي تقارير نموذجية محلية. تبقى الأوصاف في سجل التطبيق حتى تحذفها.", privacyLive: "يرسل وضع الذكاء الاصطناعي الأوصاف ورسائل الشخصية إلى المزوّد المضبوط. تبقى التقارير في السجل المحلي حتى تحذفها.", modeDemo: "الوضع التجريبي", modeLive: "وضع الذكاء الاصطناعي", generate: "إنشاء توجه العلامة", generating: "جارٍ إنشاء التوجه…", generationNote: "يستغرق التقرير الكامل عادةً بعض الوقت.", resultsEyebrow: "توجه العلامة", resultsTitle: "تقريرك الاستراتيجي", emptyTitle: "يتحول الملخص الواضح إلى نظام مفيد.", emptyBody: "صِف فكرتك أعلاه أو افتح تقريرًا محفوظًا من السجل.", loadingTitle: "جارٍ بناء توجه العلامة", loadingBody: "جارٍ ربط الشخصية والجمهور والصوت والإشارات البصرية…", errorTitle: "تعذر إنشاء التقرير.", retryGenerate: "حاول مجددًا", required: "صِف العلامة قبل إنشاء التقرير.", tooShort: "أضف مزيدًا من التفاصيل — 12 حرفًا على الأقل.", generationStarted: "بدأ إنشاء العلامة.", generationSuccess: "توجه علامتك جاهز.", generationError: "توقف الإنشاء. ما زال وصفك موجودًا لتتمكن من المحاولة مجددًا.", historyDeleted: "حُذف التصميم المحفوظ.", confirmDelete: "هل تريد حذف هذا التصميم المحفوظ؟ لا يمكن التراجع.", deleteDesign: "حذف التصميم المحفوظ", openDesign: "فتح التصميم المحفوظ", savedOn: "حُفظ في {date}", reportKicker: "تقرير سيكولوجية العلامة", reportTitle: "التوجه الاستراتيجي لـ {name}", untitledBrand: "علامتك", reportModeDemo: "تقرير تجريبي", reportModeLive: "تقرير ذكاء اصطناعي", snapshot: "ملخص الهوية", archetype: "النموذج الأصلي للعلامة", tone: "نبرة الصوت", values: "القيم الأساسية", visual: "الهوية البصرية", logo: "الشعار المُنشأ", logoAlt: "الشعار المُنشأ لـ {name}", logoUnavailable: "الشعار غير متاح أو أن عنوانه غير موثوق.", downloadLogo: "تنزيل الشعار", downloading: "جارٍ تجهيز التنزيل…", downloadError: "تعذر تنزيل الشعار.", fonts: "ازدواج الخطوط المقترح", heading: "العنوان", body: "المتن", storyAndLanguage: "القصة ولغة العلامة", story: "قصة العلامة", names: "الأسماء المقترحة", slogans: "الشعارات المقترحة", socialBio: "نبذة الشبكات الاجتماعية", audience: "شخصية الجمهور", age: "الفئة العمرية", occupation: "المهنة", interests: "الاهتمامات", painPoints: "نقاط الألم", campaign: "توجه الحملة", campaignIdea: "فكرة الحملة التسويقية", logoConcept: "فكرة الشعار", chat: "تحدث مع شخصية العلامة", chatHelp: "اختبر كيف ينبغي أن تتحدث هذه العلامة في حوار مع العميل.", chatEmpty: "اسأل عن الرسائل أو التموضع أو احتياجات الجمهور أو أفكار الحملات.", chatLabel: "رسالة إلى شخصية العلامة", chatPlaceholder: "اسأل كيف سترد العلامة…", send: "إرسال", sending: "جارٍ التفكير…", copy: "نسخ", copied: "تم النسخ", copyError: "تعذر نسخ الرسالة.", speak: "قراءة بصوت عالٍ", stopSpeaking: "إيقاف القراءة", speechError: "الصوت غير متاح على هذا الجهاز.", chatError: "تعذر الرد الآن. حاول مجددًا.", notAvailable: "غير متاح", invalidReport: "هذا التقرير المحفوظ غير مكتمل ولا يمكن عرضه.", sectionNumber: "القسم {number}"
        }
    };

    const currentLanguageCandidate = document.documentElement.lang.toLowerCase().split("-")[0];
    const currentLanguage = SUPPORTED_LANGUAGES.has(currentLanguageCandidate) ? currentLanguageCandidate : "en";
    const copy = Object.freeze({ ...ENGLISH_COPY, ...(LOCALIZED_COPY[currentLanguage] || {}) });

    const elements = {
        body: document.body,
        sidebar: document.getElementById("sidebar"),
        sidebarOverlay: document.getElementById("sidebar-overlay"),
        sidebarClose: document.getElementById("sidebar-close"),
        menuButton: document.getElementById("menu-button"),
        main: document.getElementById("main-content"),
        newDesign: document.getElementById("new-design"),
        languageSelect: document.getElementById("language-select"),
        brandForm: document.getElementById("brand-form"),
        description: document.getElementById("brand-description"),
        descriptionError: document.getElementById("description-error"),
        descriptionCount: document.getElementById("description-count"),
        generateButton: document.getElementById("generate-button"),
        generateLabel: document.getElementById("generate-label"),
        generateSpinner: document.getElementById("generate-spinner"),
        historyList: document.getElementById("history-list"),
        historyStatus: document.getElementById("history-status"),
        historyRetry: document.getElementById("history-retry"),
        resultsRegion: document.getElementById("results-region"),
        resultEmpty: document.getElementById("result-empty"),
        resultLoading: document.getElementById("result-loading"),
        resultError: document.getElementById("result-error"),
        resultErrorMessage: document.getElementById("result-error-message"),
        retryGeneration: document.getElementById("retry-generation"),
        brandOutput: document.getElementById("brand-output"),
        announcer: document.getElementById("app-announcer"),
        modeBadgeLabel: document.getElementById("mode-badge-label"),
        sidebarModeLabel: document.getElementById("sidebar-mode-label"),
        sidebarPrivacyNote: document.getElementById("sidebar-privacy-note"),
        privacyDetail: document.getElementById("privacy-detail")
    };

    const desktopQuery = window.matchMedia("(min-width: 64rem)");
    let currentHistory = [];
    let currentAnalysis = null;
    let currentDesignId = null;
    let currentLogoUrl = null;
    let currentMode = normalizeMode(elements.body.dataset.mode);
    let isGenerating = false;
    let lastFocusedBeforeSidebar = null;
    let reportToken = 0;
    let speechToken = 0;
    let activeSpeech = null;

    function normalizeMode(value) {
        return value === "openai" ? "openai" : "demo";
    }

    function translateStaticInterface() {
        document.querySelectorAll("[data-copy]").forEach((node) => {
            const key = node.getAttribute("data-copy");
            if (key && copy[key]) {
                node.textContent = copy[key];
            }
        });

        document.querySelectorAll("[data-copy-label]").forEach((node) => {
            const key = node.getAttribute("data-copy-label");
            if (key && copy[key]) {
                node.setAttribute("aria-label", copy[key]);
            }
        });

        elements.description.setAttribute("placeholder", copy.descriptionPlaceholder);
        elements.languageSelect.setAttribute("aria-label", copy.language);
        elements.generateLabel.textContent = copy.generate;
    }

    function interpolate(template, values) {
        return template.replace(/\{(\w+)\}/g, (match, key) => (
            Object.prototype.hasOwnProperty.call(values, key) ? String(values[key]) : match
        ));
    }

    function asText(value, fallback = copy.notAvailable) {
        if (typeof value === "string" && value.trim()) {
            return value.trim();
        }
        if (typeof value === "number" && Number.isFinite(value)) {
            return String(value);
        }
        return fallback;
    }

    function asList(value) {
        if (!Array.isArray(value)) {
            return [];
        }
        return value
            .filter((item) => typeof item === "string" && item.trim())
            .map((item) => item.trim())
            .slice(0, 24);
    }

    function isPlainObject(value) {
        return Boolean(value) && typeof value === "object" && !Array.isArray(value);
    }

    function createElement(tag, className, text) {
        const node = document.createElement(tag);
        if (className) {
            node.className = className;
        }
        if (text !== undefined) {
            node.textContent = text;
        }
        return node;
    }

    function setModelText(node, value, fallback = copy.notAvailable) {
        node.textContent = asText(value, fallback);
        node.setAttribute("dir", "auto");
        return node;
    }

    function createIcon(name) {
        const allowedIcons = new Set(["arrow", "brand", "chat", "check", "copy", "download", "send", "stop", "volume"]);
        const safeName = allowedIcons.has(name) ? name : "brand";
        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        const use = document.createElementNS("http://www.w3.org/2000/svg", "use");
        svg.setAttribute("class", "icon");
        svg.setAttribute("aria-hidden", "true");
        use.setAttribute("href", `#icon-${safeName}`);
        svg.appendChild(use);
        return svg;
    }

    function announce(message) {
        elements.announcer.textContent = "";
        window.requestAnimationFrame(() => {
            elements.announcer.textContent = message;
        });
    }

    function setMode(mode) {
        currentMode = normalizeMode(mode);
        elements.body.dataset.mode = currentMode;
        const isLive = currentMode === "openai";
        elements.modeBadgeLabel.textContent = isLive ? copy.modeLive : copy.modeDemo;
        elements.sidebarModeLabel.textContent = isLive ? copy.modeLive : copy.modeDemo;
        const privacyMessage = isLive ? copy.privacyLive : copy.privacyDemo;
        elements.sidebarPrivacyNote.textContent = privacyMessage;
        elements.privacyDetail.textContent = privacyMessage;
    }

    function getFocusableElements(container) {
        return Array.from(container.querySelectorAll(
            "a[href], button:not([disabled]), select:not([disabled]), textarea:not([disabled]), input:not([disabled]), summary, [tabindex]:not([tabindex='-1'])"
        )).filter((node) => !node.hidden && node.getClientRects().length > 0);
    }

    function openSidebar() {
        if (desktopQuery.matches) {
            return;
        }
        lastFocusedBeforeSidebar = document.activeElement;
        elements.sidebar.classList.add("is-open");
        elements.sidebarOverlay.classList.add("is-visible");
        elements.sidebar.setAttribute("aria-hidden", "false");
        elements.menuButton.setAttribute("aria-expanded", "true");
        elements.body.classList.add("sidebar-open");
        elements.main.inert = true;
        window.requestAnimationFrame(() => elements.sidebarClose.focus());
    }

    function closeSidebar(restoreFocus = true) {
        if (desktopQuery.matches) {
            return;
        }
        elements.sidebar.classList.remove("is-open");
        elements.sidebarOverlay.classList.remove("is-visible");
        elements.sidebar.setAttribute("aria-hidden", "true");
        elements.menuButton.setAttribute("aria-expanded", "false");
        elements.body.classList.remove("sidebar-open");
        elements.main.inert = false;
        if (restoreFocus) {
            const focusTarget = lastFocusedBeforeSidebar instanceof HTMLElement
                ? lastFocusedBeforeSidebar
                : elements.menuButton;
            focusTarget.focus();
        }
    }

    function syncSidebarForViewport() {
        if (desktopQuery.matches) {
            elements.sidebar.classList.remove("is-open");
            elements.sidebarOverlay.classList.remove("is-visible");
            elements.sidebar.setAttribute("aria-hidden", "false");
            elements.menuButton.setAttribute("aria-expanded", "false");
            elements.body.classList.remove("sidebar-open");
            elements.main.inert = false;
        } else if (!elements.sidebar.classList.contains("is-open")) {
            elements.sidebar.setAttribute("aria-hidden", "true");
        }
    }

    function handleSidebarKeydown(event) {
        if (desktopQuery.matches || !elements.sidebar.classList.contains("is-open")) {
            return;
        }
        if (event.key === "Escape") {
            event.preventDefault();
            closeSidebar(true);
            return;
        }
        if (event.key !== "Tab") {
            return;
        }
        const focusable = getFocusableElements(elements.sidebar);
        if (!focusable.length) {
            event.preventDefault();
            return;
        }
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first.focus();
        }
    }

    function updateCharacterCount() {
        const count = elements.description.value.length;
        elements.descriptionCount.textContent = `${count} / 1200`;
        if (elements.description.getAttribute("aria-invalid") === "true") {
            clearDescriptionError();
        }
    }

    function clearDescriptionError() {
        elements.description.removeAttribute("aria-invalid");
        elements.descriptionError.textContent = "";
    }

    function validateDescription() {
        const description = elements.description.value.trim();
        let message = "";
        if (!description) {
            message = copy.required;
        } else if (description.length < 12) {
            message = copy.tooShort;
        }
        if (message) {
            elements.description.setAttribute("aria-invalid", "true");
            elements.descriptionError.textContent = message;
            elements.description.focus();
            return null;
        }
        clearDescriptionError();
        return description;
    }

    function setGenerating(generating) {
        isGenerating = generating;
        elements.generateButton.disabled = generating;
        elements.description.disabled = generating;
        elements.languageSelect.disabled = generating;
        elements.generateSpinner.hidden = !generating;
        elements.generateLabel.textContent = generating ? copy.generating : copy.generate;
    }

    function setResultState(state, message = "") {
        elements.resultEmpty.hidden = state !== "empty";
        elements.resultLoading.hidden = state !== "loading";
        elements.resultError.hidden = state !== "error";
        elements.brandOutput.hidden = state !== "success";
        elements.resultsRegion.setAttribute("aria-busy", state === "loading" ? "true" : "false");
        if (state === "error") {
            elements.resultErrorMessage.textContent = message || copy.generationError;
        }
    }

    async function fetchJson(url, options = {}) {
        const response = await fetch(url, {
            credentials: "same-origin",
            ...options,
            headers: {
                Accept: "application/json",
                ...(options.headers || {})
            }
        });
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        return response.json();
    }

    function formatDate(value) {
        if (typeof value !== "string" && typeof value !== "number") {
            return "";
        }
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) {
            return "";
        }
        return new Intl.DateTimeFormat(LANGUAGE_LOCALES[currentLanguage], {
            year: "numeric",
            month: "short",
            day: "numeric"
        }).format(date);
    }

    function renderHistory() {
        elements.historyList.replaceChildren();
        if (!currentHistory.length) {
            elements.historyStatus.textContent = copy.historyEmpty;
            return;
        }

        elements.historyStatus.textContent = "";
        const fragment = document.createDocumentFragment();
        currentHistory.forEach((item) => {
            if (!isPlainObject(item)) {
                return;
            }
            const numericId = Number(item.id);
            if (!Number.isInteger(numericId) || numericId < 1) {
                return;
            }
            const description = asText(item.description, copy.untitledBrand);
            const row = createElement("li", "history-row");
            if (numericId === currentDesignId) {
                row.classList.add("is-active");
            }

            const openButton = createElement("button", "history-open");
            openButton.type = "button";
            openButton.setAttribute("aria-label", `${copy.openDesign}: ${description}`);
            if (numericId === currentDesignId) {
                openButton.setAttribute("aria-current", "page");
            }
            const title = setModelText(createElement("span", "history-title"), description);
            const formattedDate = formatDate(item.created_at);
            const date = createElement(
                "span",
                "history-date",
                formattedDate ? interpolate(copy.savedOn, { date: formattedDate }) : ""
            );
            openButton.append(title, date);
            openButton.addEventListener("click", () => openHistoryItem(item));

            const deleteButton = createElement("button", "history-delete");
            deleteButton.type = "button";
            deleteButton.setAttribute("aria-label", `${copy.deleteDesign}: ${description}`);
            deleteButton.appendChild(createIcon("brand"));
            const use = deleteButton.querySelector("use");
            use.setAttribute("href", "#icon-trash");
            deleteButton.addEventListener("click", () => deleteHistoryItem(numericId, deleteButton));

            row.append(openButton, deleteButton);
            fragment.appendChild(row);
        });
        elements.historyList.appendChild(fragment);
    }

    async function loadHistory() {
        elements.historyList.setAttribute("aria-busy", "true");
        elements.historyStatus.textContent = copy.historyLoading;
        elements.historyRetry.hidden = true;
        try {
            const data = await fetchJson("/api/history");
            if (!Array.isArray(data)) {
                throw new Error("Invalid history response");
            }
            currentHistory = data.slice(0, 50);
            renderHistory();
        } catch (_error) {
            currentHistory = [];
            elements.historyList.replaceChildren();
            elements.historyStatus.textContent = copy.historyError;
            elements.historyRetry.hidden = false;
        } finally {
            elements.historyList.setAttribute("aria-busy", "false");
        }
    }

    function openHistoryItem(item) {
        const id = Number(item.id);
        if (!Number.isInteger(id)) {
            return;
        }
        stopSpeech();
        currentDesignId = id;
        renderHistory();
        const rendered = displayReport(item.analysis, item.logo_url, item.mode, id);
        closeSidebar(false);
        if (rendered) {
            elements.resultsRegion.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    }

    async function deleteHistoryItem(id, button) {
        if (!window.confirm(copy.confirmDelete)) {
            return;
        }
        button.disabled = true;
        try {
            await fetchJson(`/api/history/${encodeURIComponent(String(id))}`, { method: "DELETE" });
            currentHistory = currentHistory.filter((item) => Number(item.id) !== id);
            if (currentDesignId === id) {
                showNewDesign(false);
            }
            renderHistory();
            announce(copy.historyDeleted);
        } catch (_error) {
            button.disabled = false;
            announce(copy.historyError);
        }
    }

    function showNewDesign(shouldFocus = true) {
        stopSpeech();
        reportToken += 1;
        currentAnalysis = null;
        currentDesignId = null;
        currentLogoUrl = null;
        elements.description.value = "";
        updateCharacterCount();
        clearDescriptionError();
        elements.brandOutput.replaceChildren();
        setResultState("empty");
        renderHistory();
        closeSidebar(false);
        if (shouldFocus) {
            elements.description.focus();
            elements.description.scrollIntoView({ behavior: "smooth", block: "center" });
        }
    }

    async function generateBrand() {
        if (isGenerating) {
            return;
        }
        const description = validateDescription();
        if (!description) {
            return;
        }

        stopSpeech();
        setGenerating(true);
        setResultState("loading");
        announce(copy.generationStarted);
        elements.resultsRegion.scrollIntoView({ behavior: "smooth", block: "start" });

        try {
            const data = await fetchJson("/api/generate-brand", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ description, language: currentLanguage })
            });
            if (!isPlainObject(data) || !isPlainObject(data.analysis)) {
                throw new Error("Invalid generation response");
            }
            const id = Number(data.id);
            currentDesignId = Number.isInteger(id) ? id : null;
            setMode(data.mode);
            const rendered = displayReport(data.analysis, data.logo_url, data.mode, currentDesignId);
            if (!rendered) {
                throw new Error("Invalid report");
            }
            announce(copy.generationSuccess);
            await loadHistory();
        } catch (_error) {
            setResultState("error", copy.generationError);
            announce(copy.generationError);
        } finally {
            setGenerating(false);
        }
    }

    function validateLogoUrl(value, designId) {
        if (typeof value !== "string" || !Number.isInteger(designId) || designId < 1) {
            return null;
        }
        try {
            const url = new URL(value, window.location.origin);
            const expectedPath = `/api/history/${designId}/logo`;
            if (
                url.origin !== window.location.origin ||
                url.protocol !== window.location.protocol ||
                url.pathname.replace(/\/$/, "") !== expectedPath ||
                url.search ||
                url.hash
            ) {
                return null;
            }
            return url.href;
        } catch (_error) {
            return null;
        }
    }

    function createCard(title, number, wide = false) {
        const card = createElement("article", wide ? "report-card report-card-wide" : "report-card");
        const heading = createElement("div", "report-card-heading");
        const titleNode = createElement("h3", "", title);
        const numberNode = createElement("span", "card-number", number);
        numberNode.setAttribute("aria-label", interpolate(copy.sectionNumber, { number }));
        heading.append(titleNode, numberNode);
        card.appendChild(heading);
        return card;
    }

    function appendMetric(list, label, value) {
        const wrapper = createElement("div", "metric");
        wrapper.append(createElement("dt", "", label), setModelText(createElement("dd"), value));
        list.appendChild(wrapper);
    }

    function appendPersonaFact(list, label, value) {
        const wrapper = createElement("div", "persona-fact");
        wrapper.append(createElement("dt", "", label), setModelText(createElement("dd"), value));
        list.appendChild(wrapper);
    }

    function createTagList(values) {
        const list = createElement("ul", "tag-list");
        const safeValues = asList(values);
        if (!safeValues.length) {
            list.appendChild(createElement("li", "tag", copy.notAvailable));
            return list;
        }
        safeValues.forEach((value) => list.appendChild(setModelText(createElement("li", "tag"), value)));
        return list;
    }

    function createNumberedList(values) {
        const list = createElement("ol", "numbered-list");
        const safeValues = asList(values);
        if (!safeValues.length) {
            list.appendChild(createElement("li", "", copy.notAvailable));
            return list;
        }
        safeValues.forEach((value) => list.appendChild(setModelText(createElement("li"), value)));
        return list;
    }

    function createContentBlock(label, value, className = "report-prose") {
        const block = createElement("div", "content-block");
        block.append(createElement("p", "content-label", label), setModelText(createElement("p", className), value));
        return block;
    }

    function createFontRow(label, fontData) {
        const row = createElement("div", "font-row");
        const data = isPlainObject(fontData) ? fontData : {};
        row.append(
            createElement("span", "font-label", label),
            setModelText(createElement("span", "font-name"), data.name),
            setModelText(createElement("span", "font-style"), data.style)
        );
        return row;
    }

    function createLogoPanel(logoUrl, brandName) {
        const layout = createElement("div", "logo-layout");
        const frame = createElement("div", "logo-frame");
        const details = createElement("div", "logo-actions");
        const trustedUrl = currentLogoUrl;

        if (trustedUrl) {
            const image = createElement("img", "generated-logo");
            image.setAttribute("src", trustedUrl);
            image.setAttribute("alt", interpolate(copy.logoAlt, { name: brandName }));
            image.setAttribute("width", "1024");
            image.setAttribute("height", "1024");
            image.setAttribute("decoding", "async");
            image.addEventListener("error", () => {
                frame.replaceChildren(createLogoPlaceholder());
                downloadButton.disabled = true;
            }, { once: true });
            frame.appendChild(image);
        } else {
            frame.appendChild(createLogoPlaceholder());
        }

        const downloadButton = createElement("button", "button button-secondary button-full download-logo");
        downloadButton.type = "button";
        downloadButton.disabled = !trustedUrl;
        downloadButton.append(createIcon("download"), createElement("span", "", copy.downloadLogo));
        downloadButton.addEventListener("click", () => downloadLogo(downloadButton, brandName));
        details.append(
            createElement("p", "content-label", copy.logo),
            downloadButton
        );
        layout.append(frame, details);
        return layout;
    }

    function createLogoPlaceholder() {
        const placeholder = createElement("div", "logo-placeholder");
        placeholder.append(createIcon("brand"), createElement("span", "", copy.logoUnavailable));
        return placeholder;
    }

    function safeFilename(value) {
        const normalized = asText(value, "brand-logo")
            .normalize("NFKD")
            .replace(/[^\p{L}\p{N}]+/gu, "-")
            .replace(/^-+|-+$/g, "")
            .slice(0, 48);
        return `${normalized || "brand-logo"}-logo`;
    }

    async function downloadLogo(button, brandName) {
        if (!currentLogoUrl || button.disabled) {
            return;
        }
        const label = button.querySelector("span");
        button.disabled = true;
        label.textContent = copy.downloading;
        try {
            const response = await fetch(currentLogoUrl, { credentials: "same-origin" });
            const contentType = response.headers.get("content-type") || "";
            if (!response.ok || !/^image\/(png|jpeg|webp|svg\+xml)$/i.test(contentType)) {
                throw new Error("Invalid image response");
            }
            const blob = await response.blob();
            if (!blob.size || blob.size > 12 * 1024 * 1024) {
                throw new Error("Invalid image size");
            }
            const objectUrl = URL.createObjectURL(blob);
            const link = document.createElement("a");
            const extension = contentType.includes("jpeg") ? "jpg" : contentType.includes("webp") ? "webp" : contentType.includes("svg") ? "svg" : "png";
            link.setAttribute("href", objectUrl);
            link.setAttribute("download", `${safeFilename(brandName)}.${extension}`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
        } catch (_error) {
            announce(copy.downloadError);
        } finally {
            button.disabled = false;
            label.textContent = copy.downloadLogo;
        }
    }

    function displayReport(analysis, logoUrl, mode, designId) {
        if (!isPlainObject(analysis) || analysis.error) {
            setResultState("error", copy.invalidReport);
            announce(copy.invalidReport);
            return false;
        }

        reportToken += 1;
        currentAnalysis = analysis;
        if (mode) {
            setMode(mode);
        }
        currentLogoUrl = validateLogoUrl(logoUrl, designId);

        const personality = isPlainObject(analysis.brand_personality) ? analysis.brand_personality : {};
        const visualIdentity = isPlainObject(analysis.visual_identity) ? analysis.visual_identity : {};
        const fontPairing = isPlainObject(visualIdentity.font_pairing) ? visualIdentity.font_pairing : {};
        const persona = isPlainObject(analysis.target_audience_persona) ? analysis.target_audience_persona : {};
        const campaign = isPlainObject(analysis.marketing_campaign_idea) ? analysis.marketing_campaign_idea : {};
        const names = asList(analysis.brand_names);
        const brandName = names[0] || copy.untitledBrand;

        const shell = createElement("div", "report-shell");
        const masthead = createElement("header", "report-masthead");
        const mastheadCopy = createElement("div");
        const kicker = createElement("p", "report-kicker", copy.reportKicker);
        const reportTitle = createElement("h2");
        reportTitle.setAttribute("tabindex", "-1");
        reportTitle.textContent = interpolate(copy.reportTitle, { name: brandName });
        reportTitle.setAttribute("dir", "auto");
        mastheadCopy.append(kicker, reportTitle);
        const modeLabel = createElement("span", "report-mode", currentMode === "openai" ? copy.reportModeLive : copy.reportModeDemo);
        masthead.append(mastheadCopy, modeLabel);
        shell.appendChild(masthead);

        const grid = createElement("div", "report-grid");

        const snapshotCard = createCard(copy.snapshot, "02");
        const metrics = createElement("dl", "metric-grid");
        appendMetric(metrics, copy.archetype, personality.archetype);
        appendMetric(metrics, copy.tone, personality.tone_of_voice);
        snapshotCard.append(metrics, createElement("p", "content-label", copy.values), createTagList(personality.values));
        grid.appendChild(snapshotCard);

        const audienceCard = createCard(copy.audience, "03");
        const personaHeading = createElement("div", "persona-heading");
        const personaName = asText(persona.name, copy.notAvailable);
        const initial = Array.from(personaName)[0] || "P";
        const monogram = createElement("span", "persona-monogram", initial);
        monogram.setAttribute("aria-hidden", "true");
        const personaHeadingCopy = createElement("div");
        personaHeadingCopy.append(setModelText(createElement("h3"), personaName), setModelText(createElement("p"), persona.occupation));
        personaHeading.append(monogram, personaHeadingCopy);
        const facts = createElement("dl", "persona-facts");
        appendPersonaFact(facts, copy.age, persona.age_range);
        appendPersonaFact(facts, copy.occupation, persona.occupation);
        audienceCard.append(personaHeading, facts, createElement("p", "content-label", copy.interests), createTagList(persona.interests), createElement("p", "content-label", copy.painPoints), createTagList(persona.pain_points));
        grid.appendChild(audienceCard);

        const visualCard = createCard(copy.visual, "04", true);
        const logoPanel = createLogoPanel(logoUrl, brandName);
        const visualDetails = logoPanel.lastElementChild;
        const fontsLabel = createElement("p", "content-label", copy.fonts);
        const fonts = createElement("div", "font-pairing");
        fonts.append(createFontRow(copy.heading, fontPairing.heading), createFontRow(copy.body, fontPairing.body));
        visualDetails.append(fontsLabel, fonts);
        visualCard.appendChild(logoPanel);
        grid.appendChild(visualCard);

        const storyCard = createCard(copy.storyAndLanguage, "05", true);
        storyCard.append(
            createContentBlock(copy.story, analysis.brand_story),
            createContentBlock(copy.socialBio, analysis.social_media_bio)
        );
        const namingLayout = createElement("div", "metric-grid content-block");
        const namesBlock = createElement("div");
        namesBlock.append(createElement("p", "content-label", copy.names), createNumberedList(analysis.brand_names));
        const slogansBlock = createElement("div");
        slogansBlock.append(createElement("p", "content-label", copy.slogans), createNumberedList(analysis.slogans));
        namingLayout.append(namesBlock, slogansBlock);
        storyCard.appendChild(namingLayout);
        grid.appendChild(storyCard);

        const campaignCard = createCard(copy.campaign, "06", true);
        const campaignBlock = createElement("div", "content-block");
        campaignBlock.append(
            createElement("p", "content-label", copy.campaignIdea),
            setModelText(createElement("p", "campaign-title"), campaign.title),
            setModelText(createElement("p", "campaign-concept"), campaign.concept)
        );
        campaignCard.append(campaignBlock, createContentBlock(copy.logoConcept, analysis.logo_concept_description));
        grid.appendChild(campaignCard);

        grid.appendChild(createChatCard());
        shell.appendChild(grid);
        elements.brandOutput.replaceChildren(shell);
        setResultState("success");
        window.requestAnimationFrame(() => reportTitle.focus({ preventScroll: true }));
        return true;
    }

    function createChatCard() {
        const card = createCard(copy.chat, "07", true);
        card.classList.add("chat-card");
        card.appendChild(createElement("p", "chat-help", copy.chatHelp));

        const log = createElement("div", "chat-log");
        log.setAttribute("role", "log");
        log.setAttribute("aria-live", "polite");
        log.setAttribute("aria-relevant", "additions");
        log.appendChild(createElement("p", "chat-empty", copy.chatEmpty));

        const form = createElement("form", "chat-form");
        const field = createElement("div", "chat-field");
        const inputId = `chat-input-${reportToken}`;
        const label = createElement("label", "", copy.chatLabel);
        label.setAttribute("for", inputId);
        const input = createElement("input", "chat-input");
        input.type = "text";
        input.id = inputId;
        input.name = "message";
        input.maxLength = 500;
        input.required = true;
        input.setAttribute("placeholder", copy.chatPlaceholder);
        field.append(label, input);

        const sendButton = createElement("button", "button button-primary chat-send");
        sendButton.type = "submit";
        sendButton.append(createIcon("send"), createElement("span", "", copy.send));
        const pending = createElement("p", "chat-pending");
        pending.setAttribute("role", "status");
        pending.hidden = true;

        form.append(field, sendButton);
        form.addEventListener("submit", (event) => {
            event.preventDefault();
            sendChatMessage(input, sendButton, pending, log, reportToken);
        });
        card.append(log, form, pending);
        return card;
    }

    function appendChatMessage(log, text, sender) {
        const empty = log.querySelector(".chat-empty");
        if (empty) {
            empty.remove();
        }
        const message = createElement("div", sender === "user" ? "chat-message is-user" : "chat-message is-persona");
        const bubble = setModelText(createElement("div", "message-bubble"), text, "");
        message.appendChild(bubble);
        if (sender === "persona") {
            const actions = createElement("div", "message-actions");
            actions.append(createChatAction(copy.copy, "copy", () => copyMessage(text, actions.firstElementChild)));
            actions.append(createChatAction(copy.speak, "volume", (button) => speakMessage(text, button)));
            message.appendChild(actions);
        }
        log.appendChild(message);
        log.scrollTop = log.scrollHeight;
    }

    function createChatAction(label, iconName, handler) {
        const button = createElement("button", "chat-action");
        button.type = "button";
        button.setAttribute("aria-label", label);
        button.append(createIcon(iconName), createElement("span", "", label));
        button.addEventListener("click", () => handler(button));
        return button;
    }

    async function sendChatMessage(input, button, pending, log, tokenAtSend) {
        const message = input.value.trim();
        if (!message || !currentAnalysis) {
            input.focus();
            return;
        }
        const analysisAtSend = currentAnalysis;
        appendChatMessage(log, message, "user");
        input.value = "";
        input.disabled = true;
        button.disabled = true;
        pending.textContent = copy.sending;
        pending.hidden = false;
        try {
            const data = await fetchJson("/api/chat-with-persona", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    analysis: analysisAtSend,
                    message,
                    language: currentLanguage
                })
            });
            if (tokenAtSend !== reportToken) {
                return;
            }
            const reply = asText(data.reply, copy.chatError);
            if (data.mode) {
                setMode(data.mode);
            }
            appendChatMessage(log, reply, "persona");
        } catch (_error) {
            if (tokenAtSend === reportToken) {
                appendChatMessage(log, copy.chatError, "persona");
            }
        } finally {
            if (tokenAtSend === reportToken) {
                input.disabled = false;
                button.disabled = false;
                pending.hidden = true;
                input.focus();
            }
        }
    }

    async function copyMessage(text, button) {
        try {
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(text);
            } else {
                const helper = document.createElement("textarea");
                helper.value = text;
                helper.setAttribute("readonly", "");
                helper.className = "sr-only";
                document.body.appendChild(helper);
                helper.select();
                const copied = document.execCommand("copy");
                helper.remove();
                if (!copied) {
                    throw new Error("Copy failed");
                }
            }
            setActionState(button, copy.copied, "check");
            announce(copy.copied);
            window.setTimeout(() => setActionState(button, copy.copy, "copy"), 1600);
        } catch (_error) {
            announce(copy.copyError);
        }
    }

    function setActionState(button, label, iconName) {
        button.replaceChildren(createIcon(iconName), createElement("span", "", label));
        button.setAttribute("aria-label", label);
    }

    async function speakMessage(text, button) {
        if (activeSpeech && activeSpeech.button === button) {
            stopSpeech();
            return;
        }
        stopSpeech();
        const token = ++speechToken;
        const controller = new AbortController();
        activeSpeech = { button, controller, audio: null, objectUrl: null, utterance: null };
        button.setAttribute("aria-pressed", "true");
        setActionState(button, copy.stopSpeaking, "stop");

        try {
            const response = await fetch("/api/tts", {
                method: "POST",
                credentials: "same-origin",
                headers: { "Content-Type": "application/json", Accept: "audio/*" },
                body: JSON.stringify({ text }),
                signal: controller.signal
            });
            const contentType = response.headers.get("content-type") || "";
            if (!response.ok || !contentType.toLowerCase().startsWith("audio/")) {
                throw new Error("TTS unavailable");
            }
            const blob = await response.blob();
            if (token !== speechToken || !activeSpeech) {
                return;
            }
            const objectUrl = URL.createObjectURL(blob);
            const audio = new Audio(objectUrl);
            activeSpeech.audio = audio;
            activeSpeech.objectUrl = objectUrl;
            audio.addEventListener("ended", stopSpeech, { once: true });
            audio.addEventListener("error", stopSpeech, { once: true });
            await audio.play();
        } catch (error) {
            if (error.name === "AbortError" || token !== speechToken) {
                return;
            }
            if (currentMode === "demo" && "speechSynthesis" in window && "SpeechSynthesisUtterance" in window) {
                const utterance = new SpeechSynthesisUtterance(text);
                utterance.lang = LANGUAGE_LOCALES[currentLanguage];
                utterance.addEventListener("end", stopSpeech, { once: true });
                utterance.addEventListener("error", stopSpeech, { once: true });
                if (activeSpeech) {
                    activeSpeech.utterance = utterance;
                }
                window.speechSynthesis.cancel();
                window.speechSynthesis.speak(utterance);
            } else {
                stopSpeech();
                announce(copy.speechError);
            }
        }
    }

    function stopSpeech() {
        speechToken += 1;
        if (!activeSpeech) {
            if ("speechSynthesis" in window) {
                window.speechSynthesis.cancel();
            }
            return;
        }
        const { button, controller, audio, objectUrl } = activeSpeech;
        activeSpeech = null;
        if (controller) {
            controller.abort();
        }
        if (audio) {
            audio.pause();
            audio.removeAttribute("src");
            audio.load();
        }
        if (objectUrl) {
            URL.revokeObjectURL(objectUrl);
        }
        if ("speechSynthesis" in window) {
            window.speechSynthesis.cancel();
        }
        if (button && button.isConnected) {
            button.setAttribute("aria-pressed", "false");
            setActionState(button, copy.speak, "volume");
        }
    }

    function attachEvents() {
        elements.menuButton.addEventListener("click", openSidebar);
        elements.sidebarClose.addEventListener("click", () => closeSidebar(true));
        elements.sidebarOverlay.addEventListener("click", () => closeSidebar(true));
        document.addEventListener("keydown", handleSidebarKeydown);
        desktopQuery.addEventListener("change", syncSidebarForViewport);

        elements.languageSelect.addEventListener("change", () => {
            const nextLanguage = elements.languageSelect.value;
            if (SUPPORTED_LANGUAGES.has(nextLanguage)) {
                window.location.assign(`/?lang=${encodeURIComponent(nextLanguage)}`);
            }
        });

        elements.description.addEventListener("input", updateCharacterCount);
        document.querySelectorAll("[data-sample-key]").forEach((button) => {
            button.addEventListener("click", () => {
                const key = `${button.getAttribute("data-sample-key")}Value`;
                if (copy[key]) {
                    elements.description.value = copy[key];
                    updateCharacterCount();
                    clearDescriptionError();
                    elements.description.focus();
                }
            });
        });

        elements.brandForm.addEventListener("submit", (event) => {
            event.preventDefault();
            generateBrand();
        });
        elements.retryGeneration.addEventListener("click", () => elements.brandForm.requestSubmit());
        elements.historyRetry.addEventListener("click", loadHistory);
        elements.newDesign.addEventListener("click", () => showNewDesign(true));
        window.addEventListener("pagehide", stopSpeech);
    }

    function initialize() {
        translateStaticInterface();
        setMode(currentMode);
        syncSidebarForViewport();
        updateCharacterCount();
        attachEvents();
        loadHistory();
    }

    initialize();
})();
