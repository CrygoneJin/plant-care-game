// @ts-nocheck
// === i18n — Internationalisierung ===
// Drei Sprachen: Deutsch (de), Hebräisch (he), Arabisch (ar)
// RTL-Support für he/ar automatisch via dir-Attribut auf <html>

(function () {
    'use strict';

    const STRINGS = {
        de: {
            // Intro
            'intro.name_placeholder': 'Dein Name',
            'intro.avatar_child': 'Kind',
            'intro.avatar_boy': 'Junge',
            'intro.avatar_girl': 'Mädchen',
            'intro.avatar_chick': 'Küken',
            'intro.avatar_turtle': 'Schildkröte',

            // Header
            'header.title': '🏝️ Schatzinsel',

            // Toolbar — Tools
            'tool.build': 'Bauen (B)',
            'tool.harvest': 'Aufnehmen (E)',
            'tool.fill': 'Füllen (F)',
            'tool.weather': 'Wetter ändern',
            'tool.theme': 'Theme wechseln',
            'tool.mute': 'Ton an/aus',
            'tool.genre': 'Musik-Genre — klicken um zu wechseln',
            'tool.iso': 'Isometrische Ansicht (Tetraeder-Gitter)',
            'tool.code': 'Code-Ansicht',
            'tool.tutorial': 'Programmier-Tutorial',
            'tool.replay': 'Bauwerk als Song abspielen',
            'tool.rewind': 'Zeitreise: Baugeschichte rückwärts',
            'tool.bedtime': 'Gute-Nacht-Geschichte von Tommy Krab',

            // Toolbar — Project
            'project.name_placeholder': 'Mein Bauwerk',
            'tool.save': 'Speichern',
            'tool.load': 'Laden',
            'tool.new': 'Neu',
            'tool.postcard': 'Postkarte',
            'tool.share': 'Insel-Link kopieren',
            'tool.map': 'Schatzkarte für Eltern 🗺️',
            'tool.dashboard': 'Eltern-Dashboard — Spielstatistiken',
            'tool.craft': 'Werkbank',
            'tool.market': 'Schwarzmarkt — Rare Items tauschen',

            // Palette
            'palette.label': 'Die 5 Elemente',
            'palette.recent': 'Zuletzt',
            'palette.origin': '道 Ursprung',
            'palette.genesis_hint': '← Lege ☯️ auf die Insel',
            'palette.particles': '⚛️ Teilchen',
            'palette.elements': '五行 Elemente',
            'mat.tao': '☯ Tao — Hier fängt alles an!',
            'mat.yin': '⚫ Yin — Dunkelheit',
            'mat.yang': '⚪ Yang — Licht',
            'mat.qi': '✨ Qi — Energie!',
            'mat.metal': 'Metall — glänzend und hart',
            'mat.wood': 'Holz — wächst und lebt',
            'mat.fire': 'Feuer — heiß und wild',
            'mat.water': 'Wasser — fließt überall hin',
            'mat.earth': 'Erde — fest und warm',

            // Canvas
            'canvas.label': 'Insel Java — dein Baugrund. Wähle ein Material und klicke zum Bauen.',

            // Sidebar
            'sidebar.info': 'Insel-Info',
            'sidebar.inventory': 'Inventar',
            'sidebar.quests': 'Quests',
            'sidebar.achievements': 'Erfolge',
            'sidebar.blueprints': 'Baupläne',
            'info.title': 'Insel-Info',
            'info.welcome': 'Deine Insel wartet! 🏝️',
            'info.hint': 'Klick links, bau los!',
            'inventory.title': '🎒 Inventar',
            'inventory.empty': 'Ernte Bäume für Holz! ⛏️',
            'quests.title': '📜 Quests',
            'quests.empty': 'Bau was — die Bewohner melden sich! 💬',
            'achievements.title': '🏆 Erfolge',
            'blueprints.title': '🏗️ Baupläne',
            'blueprints.hint': 'Baue das Muster auf der Insel — wenn es passt, entsteht ein Gebäude!',

            // Dialogs
            'dialog.load_title': '📂 Projekt laden',
            'dialog.close': '❌ Schließen',
            'dialog.craft_title': '⚒️ Werkbank',
            'craft.inventory': 'Dein Inventar',
            'craft.hint': 'Leg Materialien rein und probier aus!',
            'craft.what_happens': '🔮 Was passiert?',
            'craft.discover': 'Mische die Elemente und finde heraus was entsteht!',
            'craft.do': '⚒️ Craften!',
            'craft.clear': '🔄 Leeren',

            // Chat
            'chat.label': 'Chat mit Inselbewohnern öffnen',
            'chat.placeholder': 'Sag was zu deinem Inselbewohner...',
            'chat.send': 'Nachricht senden',
            'chat.settings': 'API-Key',
            'chat.close': 'Chat schließen',

            // Dungeon
            'dungeon.title': '🕳️ Du bist in der Höhle!',
            'dungeon.intro': 'Tief unter der Insel liegt die Welt der Computer. Kannst du alle Ebenen erkunden?',
            'dungeon.bits': 'Ebene 1: Bits',
            'dungeon.bits_desc': 'An oder Aus. 0 oder 1. Alles fängt mit Strom an.',
            'dungeon.kernel': 'Ebene 2: Betriebssystem',
            'dungeon.kernel_desc': 'Der Kern des Computers. Er verteilt die Aufgaben.',
            'dungeon.browser': 'Ebene 3: Browser',
            'dungeon.browser_desc': 'Hier läuft Schatzinsel! HTML, CSS und JavaScript bauen deine Insel.',
            'dungeon.secret': '🏆 Du hast alle Ebenen entdeckt! Du bist ein echter Computer-Archäologe!',
            'dungeon.exit': '🚪 Höhle verlassen',

            // Dashboard
            'dash.title': 'Spielstatistiken',
            'dash.quote': '„Hier sind die Zahlen. Ob sie was bedeuten, weiß ich auch nicht."',
            'dash.playtime': 'Spielzeit gesamt',
            'dash.sessions': 'Sessions',
            'dash.blocks': 'Blöcke platziert',
            'dash.quests': 'Quests abgeschlossen',
            'dash.fav_material': 'Lieblingsmaterial',
            'dash.style': 'Baustil',
            'dash.materials': 'Materialien entdeckt',
            'dash.engagement': 'Engagement-Score',
            'dash.recent': 'Letzte 5 Sessions',
            'dash.no_sessions': 'Noch keine Session-Daten gespeichert.',
            'dash.chat_usage': 'Chat-Nutzung',
            'dash.no_chat': 'Noch keine Chat-Nachrichten gesendet.',
            'dash.local': 'Alle Daten lokal auf diesem Gerät gespeichert.',

            // Bedtime
            'bedtime.title': 'Gute-Nacht-Geschichte',
            'bedtime.no_story': 'Noch keine Geschichte',
            'bedtime.loading': 'Tommy denkt nach... klick-klack...',
            'bedtime.prev': '⬅️ Zurück',
            'bedtime.new': '📖 Neues Kapitel',
            'bedtime.next': 'Weiter ➡️',

            // API Dialog
            'api.title': '🔑 Dein Schlüssel zur Insel',
            'api.desc': 'Die Inselbewohner sprechen mit echten KI-Modellen.\nDafür brauchen sie einen API-Key — wie ein Passwort für die KI.',
            'api.provider': 'Welche KI soll sprechen?',
            'api.key_label': 'API-Key:',
            'api.key_toggle': 'API-Key anzeigen oder verbergen',
            'api.local_note': 'Einmal eingeben — bleibt in deinem Browser gespeichert. 🔒\nDein Key verlässt nie dieses Gerät. Kein Server, kein Tracking.',
            'api.save': '💾 Speichern',

            // Discovery
            'discovery.counter': '🔬 {n} / {total} entdeckt',

            // Language picker
            'lang.choose': 'Sprache',
        },

        he: {
            // Intro
            'intro.name_placeholder': 'השם שלך',
            'intro.avatar_child': 'ילד',
            'intro.avatar_boy': 'בן',
            'intro.avatar_girl': 'בת',
            'intro.avatar_chick': 'אפרוח',
            'intro.avatar_turtle': 'צב',

            // Header
            'header.title': '🏝️ אי המטמון',

            // Toolbar — Tools
            'tool.build': 'בנייה (B)',
            'tool.harvest': 'איסוף (E)',
            'tool.fill': 'מילוי (F)',
            'tool.weather': 'שינוי מזג אוויר',
            'tool.theme': 'החלפת ערכת נושא',
            'tool.mute': 'השתקה',
            'tool.genre': 'סגנון מוזיקה',
            'tool.iso': 'תצוגה איזומטרית',
            'tool.code': 'תצוגת קוד',
            'tool.tutorial': 'מדריך תכנות',
            'tool.replay': 'נגן את המבנה כשיר',
            'tool.rewind': 'מסע בזמן: היסטוריית בנייה',
            'tool.bedtime': 'סיפור לילה טוב',

            // Toolbar — Project
            'project.name_placeholder': 'המבנה שלי',
            'tool.save': 'שמירה',
            'tool.load': 'טעינה',
            'tool.new': 'חדש',
            'tool.postcard': 'גלויה',
            'tool.share': 'העתקת קישור',
            'tool.map': 'מפת אוצר להורים 🗺️',
            'tool.dashboard': 'לוח הורים — סטטיסטיקות',
            'tool.craft': 'שולחן עבודה',
            'tool.market': 'שוק — החלפת פריטים נדירים',

            // Palette
            'palette.label': 'חמשת היסודות',
            'palette.recent': 'אחרונים',
            'palette.origin': '道 מקור',
            'palette.genesis_hint': 'שים ☯️ על האי ←',
            'palette.particles': '⚛️ חלקיקים',
            'palette.elements': '五行 יסודות',
            'mat.tao': '☯ טאו — כאן הכל מתחיל!',
            'mat.yin': '⚫ יין — חושך',
            'mat.yang': '⚪ יאנג — אור',
            'mat.qi': '✨ צ\'י — אנרגיה!',
            'mat.metal': 'מתכת — נוצצת וקשה',
            'mat.wood': 'עץ — גדל וחי',
            'mat.fire': 'אש — חמה ופראית',
            'mat.water': 'מים — זורמים לכל מקום',
            'mat.earth': 'אדמה — יציבה וחמה',

            // Canvas
            'canvas.label': 'האי — המגרש שלך. בחר חומר ולחץ לבנות.',

            // Sidebar
            'sidebar.info': 'מידע על האי',
            'sidebar.inventory': 'מלאי',
            'sidebar.quests': 'משימות',
            'sidebar.achievements': 'הישגים',
            'sidebar.blueprints': 'תוכניות בנייה',
            'info.title': 'מידע על האי',
            'info.welcome': 'האי שלך מחכה! 🏝️',
            'info.hint': 'לחץ משמאל, התחל לבנות!',
            'inventory.title': '🎒 מלאי',
            'inventory.empty': 'קטוף עצים בשביל עץ! ⛏️',
            'quests.title': '📜 משימות',
            'quests.empty': 'בנה משהו — התושבים יגיבו! 💬',
            'achievements.title': '🏆 הישגים',
            'blueprints.title': '🏗️ תוכניות בנייה',
            'blueprints.hint': 'בנה את הדפוס על האי — אם זה מתאים, נוצר מבנה!',

            // Dialogs
            'dialog.load_title': '📂 טעינת פרויקט',
            'dialog.close': '❌ סגירה',
            'dialog.craft_title': '⚒️ שולחן עבודה',
            'craft.inventory': 'המלאי שלך',
            'craft.hint': 'שים חומרים ונסה!',
            'craft.what_happens': '🔮 מה יקרה?',
            'craft.discover': 'ערבב את היסודות וגלה מה נוצר!',
            'craft.do': '⚒️ יצירה!',
            'craft.clear': '🔄 ניקוי',

            // Chat
            'chat.label': 'פתח צ\'אט עם תושבי האי',
            'chat.placeholder': 'אמור משהו לתושב האי שלך...',
            'chat.send': 'שליחת הודעה',
            'chat.settings': 'מפתח API',
            'chat.close': 'סגירת צ\'אט',

            // Dungeon
            'dungeon.title': '🕳️ אתה במערה!',
            'dungeon.intro': 'עמוק מתחת לאי נמצא עולם המחשבים. תוכל לחקור את כל השכבות?',
            'dungeon.bits': 'שכבה 1: ביטים',
            'dungeon.bits_desc': 'דלוק או כבוי. 0 או 1. הכל מתחיל בחשמל.',
            'dungeon.kernel': 'שכבה 2: מערכת הפעלה',
            'dungeon.kernel_desc': 'ליבת המחשב. היא מחלקת את המשימות.',
            'dungeon.browser': 'שכבה 3: דפדפן',
            'dungeon.browser_desc': 'כאן רץ אי המטמון! HTML, CSS ו-JavaScript בונים את האי שלך.',
            'dungeon.secret': '🏆 גילית את כל השכבות! אתה ארכיאולוג מחשבים אמיתי!',
            'dungeon.exit': '🚪 עזיבת המערה',

            // Dashboard
            'dash.title': 'סטטיסטיקות משחק',
            'dash.quote': '״הנה המספרים. אם הם אומרים משהו, גם אני לא יודע.״',
            'dash.playtime': 'זמן משחק כולל',
            'dash.sessions': 'פגישות',
            'dash.blocks': 'בלוקים שהונחו',
            'dash.quests': 'משימות שהושלמו',
            'dash.fav_material': 'חומר אהוב',
            'dash.style': 'סגנון בנייה',
            'dash.materials': 'חומרים שהתגלו',
            'dash.engagement': 'ציון מעורבות',
            'dash.recent': '5 פגישות אחרונות',
            'dash.no_sessions': 'עדיין אין נתוני פגישות.',
            'dash.chat_usage': 'שימוש בצ\'אט',
            'dash.no_chat': 'עדיין לא נשלחו הודעות.',
            'dash.local': 'כל הנתונים שמורים מקומית במכשיר הזה.',

            // Bedtime
            'bedtime.title': 'סיפור לילה טוב',
            'bedtime.no_story': 'עדיין אין סיפור',
            'bedtime.loading': 'טומי חושב... קליק-קלאק...',
            'bedtime.prev': '⬅️ אחורה',
            'bedtime.new': '📖 פרק חדש',
            'bedtime.next': 'קדימה ➡️',

            // API Dialog
            'api.title': '🔑 המפתח שלך לאי',
            'api.desc': 'תושבי האי מדברים עם מודלי AI אמיתיים.\nבשביל זה הם צריכים מפתח API — כמו סיסמה ל-AI.',
            'api.provider': 'איזה AI ידבר?',
            'api.key_label': ':מפתח API',
            'api.key_toggle': 'הצג או הסתר מפתח API',
            'api.local_note': 'הכנס פעם אחת — נשמר בדפדפן שלך. 🔒\nהמפתח שלך אף פעם לא עוזב את המכשיר הזה.',
            'api.save': '💾 שמירה',

            // Discovery
            'discovery.counter': '🔬 {n} / {total} התגלו',

            // Language picker
            'lang.choose': 'שפה',
        },

        ar: {
            // Intro
            'intro.name_placeholder': 'اسمك',
            'intro.avatar_child': 'طفل',
            'intro.avatar_boy': 'ولد',
            'intro.avatar_girl': 'بنت',
            'intro.avatar_chick': 'كتكوت',
            'intro.avatar_turtle': 'سلحفاة',

            // Header
            'header.title': '🏝️ جزيرة الكنز',

            // Toolbar — Tools
            'tool.build': 'بناء (B)',
            'tool.harvest': 'جمع (E)',
            'tool.fill': 'ملء (F)',
            'tool.weather': 'تغيير الطقس',
            'tool.theme': 'تغيير المظهر',
            'tool.mute': 'كتم الصوت',
            'tool.genre': 'نوع الموسيقى',
            'tool.iso': 'عرض متساوي القياس',
            'tool.code': 'عرض الكود',
            'tool.tutorial': 'دليل البرمجة',
            'tool.replay': 'تشغيل البناء كأغنية',
            'tool.rewind': 'رحلة عبر الزمن: تاريخ البناء',
            'tool.bedtime': 'قصة ما قبل النوم',

            // Toolbar — Project
            'project.name_placeholder': 'بنائي',
            'tool.save': 'حفظ',
            'tool.load': 'تحميل',
            'tool.new': 'جديد',
            'tool.postcard': 'بطاقة بريدية',
            'tool.share': 'نسخ الرابط',
            'tool.map': 'خريطة الكنز للأهل 🗺️',
            'tool.dashboard': 'لوحة الأهل — إحصائيات',
            'tool.craft': 'طاولة العمل',
            'tool.market': 'السوق — تبادل العناصر النادرة',

            // Palette
            'palette.label': 'العناصر الخمسة',
            'palette.recent': 'الأخيرة',
            'palette.origin': '道 الأصل',
            'palette.genesis_hint': 'ضع ☯️ على الجزيرة ←',
            'palette.particles': '⚛️ جسيمات',
            'palette.elements': '五行 عناصر',
            'mat.tao': '☯ تاو — هنا يبدأ كل شيء!',
            'mat.yin': '⚫ يين — الظلام',
            'mat.yang': '⚪ يانغ — النور',
            'mat.qi': '✨ تشي — طاقة!',
            'mat.metal': 'معدن — لامع وصلب',
            'mat.wood': 'خشب — ينمو ويعيش',
            'mat.fire': 'نار — حارة وبرية',
            'mat.water': 'ماء — يتدفق في كل مكان',
            'mat.earth': 'تراب — ثابت ودافئ',

            // Canvas
            'canvas.label': 'الجزيرة — أرض البناء. اختر مادة وانقر للبناء.',

            // Sidebar
            'sidebar.info': 'معلومات الجزيرة',
            'sidebar.inventory': 'المخزون',
            'sidebar.quests': 'المهام',
            'sidebar.achievements': 'الإنجازات',
            'sidebar.blueprints': 'مخططات البناء',
            'info.title': 'معلومات الجزيرة',
            'info.welcome': 'جزيرتك بانتظارك! 🏝️',
            'info.hint': 'انقر يساراً، ابدأ البناء!',
            'inventory.title': '🎒 المخزون',
            'inventory.empty': 'اقطع الأشجار للحصول على خشب! ⛏️',
            'quests.title': '📜 المهام',
            'quests.empty': 'ابنِ شيئاً — السكان سيردون! 💬',
            'achievements.title': '🏆 الإنجازات',
            'blueprints.title': '🏗️ مخططات البناء',
            'blueprints.hint': 'ابنِ النمط على الجزيرة — إذا تطابق، يظهر مبنى!',

            // Dialogs
            'dialog.load_title': '📂 تحميل مشروع',
            'dialog.close': '❌ إغلاق',
            'dialog.craft_title': '⚒️ طاولة العمل',
            'craft.inventory': 'مخزونك',
            'craft.hint': 'ضع المواد وجرّب!',
            'craft.what_happens': '🔮 ماذا سيحدث؟',
            'craft.discover': 'اخلط العناصر واكتشف ما ينتج!',
            'craft.do': '⚒️ صنع!',
            'craft.clear': '🔄 تفريغ',

            // Chat
            'chat.label': 'افتح المحادثة مع سكان الجزيرة',
            'chat.placeholder': 'قل شيئاً لساكن جزيرتك...',
            'chat.send': 'إرسال رسالة',
            'chat.settings': 'مفتاح API',
            'chat.close': 'إغلاق المحادثة',

            // Dungeon
            'dungeon.title': '🕳️ أنت في الكهف!',
            'dungeon.intro': 'عميقاً تحت الجزيرة يقع عالم الحواسيب. هل تستطيع استكشاف كل الطبقات؟',
            'dungeon.bits': 'الطبقة 1: بتات',
            'dungeon.bits_desc': 'تشغيل أو إيقاف. 0 أو 1. كل شيء يبدأ بالكهرباء.',
            'dungeon.kernel': 'الطبقة 2: نظام التشغيل',
            'dungeon.kernel_desc': 'نواة الحاسوب. توزع المهام.',
            'dungeon.browser': 'الطبقة 3: المتصفح',
            'dungeon.browser_desc': 'هنا تعمل جزيرة الكنز! HTML وCSS وJavaScript تبني جزيرتك.',
            'dungeon.secret': '🏆 اكتشفت كل الطبقات! أنت عالم آثار حواسيب حقيقي!',
            'dungeon.exit': '🚪 مغادرة الكهف',

            // Dashboard
            'dash.title': 'إحصائيات اللعب',
            'dash.quote': '«هذه الأرقام. إن كانت تعني شيئاً، فأنا أيضاً لا أعرف.»',
            'dash.playtime': 'وقت اللعب الإجمالي',
            'dash.sessions': 'الجلسات',
            'dash.blocks': 'بلوكات موضوعة',
            'dash.quests': 'مهام مكتملة',
            'dash.fav_material': 'المادة المفضلة',
            'dash.style': 'أسلوب البناء',
            'dash.materials': 'مواد مكتشفة',
            'dash.engagement': 'نقاط المشاركة',
            'dash.recent': 'آخر 5 جلسات',
            'dash.no_sessions': 'لا توجد بيانات جلسات بعد.',
            'dash.chat_usage': 'استخدام المحادثة',
            'dash.no_chat': 'لم يتم إرسال رسائل بعد.',
            'dash.local': 'جميع البيانات محفوظة محلياً على هذا الجهاز.',

            // Bedtime
            'bedtime.title': 'قصة ما قبل النوم',
            'bedtime.no_story': 'لا توجد قصة بعد',
            'bedtime.loading': 'تومي يفكر... طق-طق...',
            'bedtime.prev': '⬅️ رجوع',
            'bedtime.new': '📖 فصل جديد',
            'bedtime.next': 'التالي ➡️',

            // API Dialog
            'api.title': '🔑 مفتاحك للجزيرة',
            'api.desc': 'سكان الجزيرة يتحدثون مع نماذج ذكاء اصطناعي حقيقية.\nلذلك يحتاجون مفتاح API — مثل كلمة مرور للذكاء الاصطناعي.',
            'api.provider': 'أي ذكاء اصطناعي سيتحدث؟',
            'api.key_label': ':مفتاح API',
            'api.key_toggle': 'إظهار أو إخفاء مفتاح API',
            'api.local_note': 'أدخله مرة واحدة — يبقى محفوظاً في متصفحك. 🔒\nمفتاحك لا يغادر هذا الجهاز أبداً.',
            'api.save': '💾 حفظ',

            // Discovery
            'discovery.counter': '🔬 {n} / {total} مكتشفة',

            // Language picker
            'lang.choose': 'اللغة',
        },
    };

    // RTL languages
    const RTL_LANGS = new Set(['he', 'ar']);

    // Current language — default from localStorage or 'de'
    let currentLang = localStorage.getItem('insel-lang') || 'de';

    /**
     * Get translated string. Falls back to German, then returns key.
     * @param {string} key
     * @param {Record<string, string|number>} [params] — placeholder replacements
     * @returns {string}
     */
    function t(key, params) {
        var str = (STRINGS[currentLang] && STRINGS[currentLang][key])
                || STRINGS.de[key]
                || key;
        if (params) {
            for (var k in params) {
                str = str.replace('{' + k + '}', String(params[k]));
            }
        }
        return str;
    }

    /**
     * Apply current language to all data-i18n elements in the DOM
     */
    function applyLanguage() {
        var html = document.documentElement;

        // Set lang and dir
        html.setAttribute('lang', currentLang);
        html.setAttribute('dir', RTL_LANGS.has(currentLang) ? 'rtl' : 'ltr');

        // Translate all data-i18n elements
        document.querySelectorAll('[data-i18n]').forEach(function (el) {
            var key = el.getAttribute('data-i18n');
            el.textContent = t(key);
        });

        // Translate data-i18n-title (for title/tooltip attributes)
        document.querySelectorAll('[data-i18n-title]').forEach(function (el) {
            var key = el.getAttribute('data-i18n-title');
            el.setAttribute('title', t(key));
        });

        // Translate data-i18n-placeholder (for input placeholders)
        document.querySelectorAll('[data-i18n-placeholder]').forEach(function (el) {
            var key = el.getAttribute('data-i18n-placeholder');
            el.setAttribute('placeholder', t(key));
        });

        // Translate data-i18n-label (for aria-label)
        document.querySelectorAll('[data-i18n-label]').forEach(function (el) {
            var key = el.getAttribute('data-i18n-label');
            el.setAttribute('aria-label', t(key));
        });

        // Save preference
        localStorage.setItem('insel-lang', currentLang);
    }

    /**
     * Switch language and re-apply
     * @param {string} lang — 'de', 'he', or 'ar'
     */
    function setLanguage(lang) {
        if (!STRINGS[lang]) return;
        currentLang = lang;
        applyLanguage();
    }

    /**
     * Get current language code
     * @returns {string}
     */
    function getLanguage() {
        return currentLang;
    }

    /**
     * Check if current language is RTL
     * @returns {boolean}
     */
    function isRTL() {
        return RTL_LANGS.has(currentLang);
    }

    // Export
    window.INSEL_I18N = {
        t: t,
        apply: applyLanguage,
        setLanguage: setLanguage,
        getLanguage: getLanguage,
        isRTL: isRTL,
        STRINGS: STRINGS,
    };

})();
