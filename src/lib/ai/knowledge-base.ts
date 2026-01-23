// ============================================
// Knowledge Base for AI Support Agent
// ============================================

export interface KnowledgeItem {
  id: string
  category: string
  question: string
  questionEn: string
  questionHe: string
  answer: string
  answerEn: string
  answerHe: string
  keywords: string[]
}

export const KNOWLEDGE_BASE: KnowledgeItem[] = [
  // === REGISTRATION & ACCOUNT ===
  {
    id: 'reg-1',
    category: 'registration',
    question: 'Как зарегистрироваться на платформе?',
    questionEn: 'How do I register on the platform?',
    questionHe: 'איך נרשמים לפלטפורמה?',
    answer: 'Для регистрации нажмите кнопку "Регистрация", введите номер телефона и подтвердите его кодом из SMS. Затем заполните базовую информацию о себе.',
    answerEn: 'To register, click the "Sign Up" button, enter your phone number and confirm it with the SMS code. Then fill in your basic information.',
    answerHe: 'להרשמה, לחץ על כפתור "הרשמה", הזן את מספר הטלפון שלך ואשר אותו עם קוד ה-SMS. לאחר מכן מלא את הפרטים הבסיסיים שלך.',
    keywords: ['регистрация', 'зарегистрироваться', 'аккаунт', 'register', 'sign up', 'account', 'הרשמה'],
  },
  {
    id: 'reg-2',
    category: 'registration',
    question: 'Я не получаю SMS с кодом подтверждения',
    questionEn: 'I am not receiving the SMS verification code',
    questionHe: 'אני לא מקבל את קוד האימות ב-SMS',
    answer: 'Проверьте правильность номера телефона. Подождите 1-2 минуты. Если код не приходит, нажмите "Отправить повторно". Убедитесь, что у вас есть связь и номер активен.',
    answerEn: 'Check that your phone number is correct. Wait 1-2 minutes. If the code doesn\'t arrive, click "Resend". Make sure you have signal and the number is active.',
    answerHe: 'בדוק שמספר הטלפון נכון. המתן 1-2 דקות. אם הקוד לא מגיע, לחץ על "שלח שוב". וודא שיש לך קליטה והמספר פעיל.',
    keywords: ['sms', 'код', 'подтверждение', 'не приходит', 'verification', 'code', 'קוד', 'אימות'],
  },

  // === WORKER FAQ ===
  {
    id: 'worker-1',
    category: 'worker',
    question: 'Как найти работу на платформе?',
    questionEn: 'How do I find work on the platform?',
    questionHe: 'איך מוצאים עבודה בפלטפורמה?',
    answer: 'Перейдите в раздел "Поиск работы", используйте фильтры по локации, типу работы и оплате. Нажмите на интересующую вакансию и отправьте отклик.',
    answerEn: 'Go to the "Find Work" section, use filters by location, job type and pay. Click on a job listing you\'re interested in and send your application.',
    answerHe: 'עבור לקטע "מצא עבודה", השתמש במסננים לפי מיקום, סוג עבודה ושכר. לחץ על משרה שמעניינת אותך ושלח מועמדות.',
    keywords: ['работа', 'поиск', 'вакансия', 'найти', 'work', 'job', 'find', 'search', 'עבודה', 'משרה'],
  },
  {
    id: 'worker-2',
    category: 'worker',
    question: 'Как получить оплату за выполненную работу?',
    questionEn: 'How do I get paid for completed work?',
    questionHe: 'איך מקבלים תשלום על עבודה שהושלמה?',
    answer: 'После завершения смены работодатель подтверждает выполнение работы. Оплата поступает на ваш счёт в течение 1-3 рабочих дней. Вы можете вывести средства в разделе "Заработок".',
    answerEn: 'After completing a shift, the employer confirms the work is done. Payment is credited to your account within 1-3 business days. You can withdraw funds in the "Earnings" section.',
    answerHe: 'לאחר סיום משמרת, המעסיק מאשר שהעבודה בוצעה. התשלום מועבר לחשבונך תוך 1-3 ימי עסקים. ניתן למשוך כספים בקטע "הכנסות".',
    keywords: ['оплата', 'деньги', 'заработок', 'вывод', 'payment', 'money', 'earnings', 'withdraw', 'תשלום', 'כסף'],
  },
  {
    id: 'worker-3',
    category: 'worker',
    question: 'Работодатель не подтверждает выполнение смены',
    questionEn: 'Employer is not confirming shift completion',
    questionHe: 'המעסיק לא מאשר השלמת משמרת',
    answer: 'Если работодатель не подтверждает смену в течение 24 часов, вы можете открыть спор в разделе "Мои задачи". Наша команда рассмотрит случай и поможет решить проблему.',
    answerEn: 'If the employer doesn\'t confirm the shift within 24 hours, you can open a dispute in the "My Tasks" section. Our team will review the case and help resolve the issue.',
    answerHe: 'אם המעסיק לא מאשר את המשמרת תוך 24 שעות, תוכל לפתוח סכסוך בקטע "המשימות שלי". הצוות שלנו יבדוק את המקרה ויעזור לפתור את הבעיה.',
    keywords: ['спор', 'подтверждение', 'проблема', 'dispute', 'confirm', 'problem', 'סכסוך', 'אישור'],
  },

  // === EMPLOYER FAQ ===
  {
    id: 'employer-1',
    category: 'employer',
    question: 'Как опубликовать вакансию?',
    questionEn: 'How do I post a job listing?',
    questionHe: 'איך מפרסמים משרה?',
    answer: 'Перейдите в раздел "Работодатель", нажмите "Создать смену". Заполните детали: название, описание, локацию, дату, время и оплату. После модерации вакансия появится в поиске.',
    answerEn: 'Go to the "Employer" section, click "Create Shift". Fill in the details: title, description, location, date, time and pay. After moderation, the listing will appear in search.',
    answerHe: 'עבור לקטע "מעסיק", לחץ על "צור משמרת". מלא את הפרטים: כותרת, תיאור, מיקום, תאריך, שעה ושכר. לאחר בדיקה, המשרה תופיע בחיפוש.',
    keywords: ['вакансия', 'опубликовать', 'создать', 'смена', 'job', 'post', 'create', 'shift', 'משרה', 'פרסום'],
  },
  {
    id: 'employer-2',
    category: 'employer',
    question: 'Сколько стоит размещение вакансии?',
    questionEn: 'How much does it cost to post a job?',
    questionHe: 'כמה עולה לפרסם משרה?',
    answer: 'Размещение вакансий бесплатно. Комиссия платформы (10%) взимается только при успешном найме работника и завершении смены.',
    answerEn: 'Posting jobs is free. The platform fee (10%) is only charged when a worker is successfully hired and the shift is completed.',
    answerHe: 'פרסום משרות הוא בחינם. עמלת הפלטפורמה (10%) נגבית רק כאשר עובד מגויס בהצלחה והמשמרת מושלמת.',
    keywords: ['цена', 'стоимость', 'комиссия', 'бесплатно', 'price', 'cost', 'fee', 'free', 'מחיר', 'עמלה'],
  },
  {
    id: 'employer-3',
    category: 'employer',
    question: 'Как выбрать работника из откликов?',
    questionEn: 'How do I choose a worker from applicants?',
    questionHe: 'איך בוחרים עובד מהמועמדים?',
    answer: 'В разделе "Отклики" вы увидите список кандидатов с их профилями, рейтингом и отзывами. Выберите подходящего работника и нажмите "Нанять". Работник получит уведомление.',
    answerEn: 'In the "Applicants" section you\'ll see a list of candidates with their profiles, ratings and reviews. Select a suitable worker and click "Hire". The worker will be notified.',
    answerHe: 'בקטע "מועמדים" תראה רשימת מועמדים עם הפרופילים, הדירוגים והביקורות שלהם. בחר עובד מתאים ולחץ על "גייס". העובד יקבל הודעה.',
    keywords: ['отклики', 'кандидаты', 'нанять', 'выбрать', 'applicants', 'candidates', 'hire', 'choose', 'מועמדים', 'גיוס'],
  },

  // === VERIFICATION ===
  {
    id: 'verify-1',
    category: 'verification',
    question: 'Как пройти верификацию?',
    questionEn: 'How do I get verified?',
    questionHe: 'איך עוברים אימות?',
    answer: 'Перейдите в "Профиль" → "Документы". Загрузите фото паспорта или теудат зеут. Проверка занимает 1-2 рабочих дня. Верифицированные пользователи получают больше откликов.',
    answerEn: 'Go to "Profile" → "Documents". Upload a photo of your passport or Teudat Zehut. Verification takes 1-2 business days. Verified users get more responses.',
    answerHe: 'עבור ל"פרופיל" → "מסמכים". העלה תמונה של הדרכון או תעודת הזהות שלך. האימות לוקח 1-2 ימי עסקים. משתמשים מאומתים מקבלים יותר תגובות.',
    keywords: ['верификация', 'документы', 'паспорт', 'verification', 'documents', 'passport', 'אימות', 'מסמכים'],
  },

  // === SAFETY ===
  {
    id: 'safety-1',
    category: 'safety',
    question: 'Как сообщить о мошенничестве?',
    questionEn: 'How do I report fraud?',
    questionHe: 'איך מדווחים על הונאה?',
    answer: 'Нажмите кнопку "Пожаловаться" на профиле или вакансии подозрительного пользователя. Опишите ситуацию. Наша команда безопасности рассмотрит жалобу в течение 24 часов.',
    answerEn: 'Click the "Report" button on the suspicious user\'s profile or job listing. Describe the situation. Our safety team will review the complaint within 24 hours.',
    answerHe: 'לחץ על כפתור "דווח" בפרופיל או במשרה של המשתמש החשוד. תאר את המצב. צוות הבטיחות שלנו יבדוק את התלונה תוך 24 שעות.',
    keywords: ['мошенник', 'жалоба', 'безопасность', 'fraud', 'report', 'safety', 'scam', 'הונאה', 'דיווח'],
  },

  // === CONTACT ===
  {
    id: 'contact-1',
    category: 'contact',
    question: 'Как связаться с поддержкой?',
    questionEn: 'How do I contact support?',
    questionHe: 'איך יוצרים קשר עם התמיכה?',
    answer: 'Вы можете написать нам через этот чат, отправить email на support@connector.app или позвонить по телефону +972-XX-XXX-XXXX в рабочие часы (9:00-18:00).',
    answerEn: 'You can write to us through this chat, send an email to support@connector.app or call +972-XX-XXX-XXXX during business hours (9:00-18:00).',
    answerHe: 'ניתן לכתוב לנו דרך הצ\'אט הזה, לשלוח מייל ל-support@connector.app או להתקשר ל-+972-XX-XXX-XXXX בשעות הפעילות (9:00-18:00).',
    keywords: ['поддержка', 'контакт', 'связаться', 'email', 'телефон', 'support', 'contact', 'phone', 'תמיכה', 'קשר'],
  },
]

// Find relevant knowledge items based on user query
export function findRelevantKnowledge(query: string, language: 'ru' | 'en' | 'he' = 'ru'): KnowledgeItem[] {
  const queryLower = query.toLowerCase()

  return KNOWLEDGE_BASE.filter(item => {
    // Check keywords
    const keywordMatch = item.keywords.some(keyword =>
      queryLower.includes(keyword.toLowerCase())
    )

    // Check question text
    const questionMatch =
      item.question.toLowerCase().includes(queryLower) ||
      item.questionEn.toLowerCase().includes(queryLower) ||
      item.questionHe.includes(queryLower)

    return keywordMatch || questionMatch
  }).slice(0, 3) // Return top 3 matches
}

// Format knowledge for AI context
export function formatKnowledgeContext(items: KnowledgeItem[], language: 'ru' | 'en' | 'he' = 'ru'): string {
  if (items.length === 0) return ''

  const formatted = items.map(item => {
    const question = language === 'en' ? item.questionEn :
                     language === 'he' ? item.questionHe : item.question
    const answer = language === 'en' ? item.answerEn :
                   language === 'he' ? item.answerHe : item.answer
    return `Q: ${question}\nA: ${answer}`
  }).join('\n\n')

  return `\nРелевантная информация из базы знаний:\n${formatted}\n`
}
