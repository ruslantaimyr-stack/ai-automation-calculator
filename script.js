const questions = [
  { key: 'business', title: 'Какой у вас бизнес?', type: 'single', options: ['Услуги','Интернет-магазин','Розничный магазин','Производство','Обучение','Недвижимость','Другое'] },
  { key: 'sources', title: 'Откуда приходят заявки?', type: 'multiple', options: ['Telegram','WhatsApp','Сайт','Avito','VK','Телефон','Электронная почта','Другое'] },
  { key: 'manual', title: 'Что сотрудники делают вручную?', type: 'multiple', options: ['Отвечают клиентам','Принимают заявки','Переносят данные','Создают документы','Делают расчёты','Отправляют уведомления','Готовят отчёты','Работают с таблицами','Другое'] },
  { key: 'volume', title: 'Сколько заявок или операций происходит в месяц?', type: 'single', options: ['До 50','50–200','200–1000','Более 1000'] },
  { key: 'systems', title: 'Какие системы уже используются?', type: 'multiple', options: ['Excel / Google Sheets','CRM','Telegram','Airtable','1С','Сайт','Пока ничего','Другое'] },
  { key: 'problem', title: 'Какую главную проблему вы хотите решить?', type: 'text' }
];

let step = 0;
let answers = {};
let currentResult = null;
const $ = (selector) => document.querySelector(selector);
const hero = $('#hero');
const quiz = $('#quiz');
const results = $('#results');

function showQuiz() {
  hero.classList.add('hidden'); results.classList.add('hidden'); quiz.classList.remove('hidden');
  step = 0; renderQuestion(); window.scrollTo({ top: 0, behavior: 'smooth' });
}

function renderQuestion() {
  const question = questions[step];
  const percent = Math.round(((step + 1) / questions.length) * 100);
  $('#questionTitle').textContent = question.title;
  $('#stepNumber').textContent = `${step + 1} / ${questions.length}`;
  $('#progressPercent').textContent = `${percent}%`;
  $('#progressBar').style.width = `${percent}%`;
  $('#questionHint').textContent = question.type === 'multiple' ? 'Можно выбрать несколько вариантов' : question.type === 'text' ? 'Опишите ситуацию своими словами' : 'Выберите один вариант';
  $('#backButton').style.visibility = step === 0 ? 'hidden' : 'visible';
  $('#nextButton').innerHTML = step === questions.length - 1 ? 'Получить результат <span>→</span>' : 'Продолжить <span>→</span>';
  $('#validation').textContent = '';
  const options = $('#options');
  options.innerHTML = '';
  const textarea = $('#problemInput');
  textarea.classList.toggle('hidden', question.type !== 'text');
  if (question.type === 'text') { textarea.value = answers[question.key] || ''; setTimeout(() => textarea.focus(), 50); return; }
  const selected = answers[question.key] || (question.type === 'multiple' ? [] : '');
  question.options.forEach((value) => {
    const isSelected = question.type === 'multiple' ? selected.includes(value) : selected === value;
    const label = document.createElement('label');
    label.className = `option${isSelected ? ' selected' : ''}`;
    label.innerHTML = `<input type="${question.type === 'multiple' ? 'checkbox' : 'radio'}" name="answer" value="${value}" ${isSelected ? 'checked' : ''}><span class="option__check">${isSelected ? '✓' : ''}</span><span>${value}</span>`;
    options.appendChild(label);
  });
}

$('#options').addEventListener('change', (event) => {
  const question = questions[step];
  if (question.type === 'single') answers[question.key] = event.target.value;
  else answers[question.key] = [...document.querySelectorAll('#options input:checked')].map((input) => input.value);
  document.querySelectorAll('.option').forEach((label) => {
    const checked = label.querySelector('input').checked;
    label.classList.toggle('selected', checked); label.querySelector('.option__check').textContent = checked ? '✓' : '';
  });
  $('#validation').textContent = '';
});

$('#questionForm').addEventListener('submit', (event) => {
  event.preventDefault();
  const question = questions[step];
  if (question.type === 'text') answers[question.key] = $('#problemInput').value.trim();
  if (!answers[question.key] || answers[question.key].length === 0) { $('#validation').textContent = 'Пожалуйста, заполните ответ, чтобы продолжить'; return; }
  if (step < questions.length - 1) { step += 1; renderQuestion(); } else showResults();
});

$('#backButton').addEventListener('click', () => { if (step > 0) { step -= 1; renderQuestion(); } });
$('#startButton').addEventListener('click', showQuiz);
$('#restartButton').addEventListener('click', () => { answers = {}; currentResult = null; $('#actionStatus').textContent = ''; showQuiz(); });

const businessRules = {
  'Услуги': {
    automation: ['Сбор и распределение заявок', 'Онлайн-запись клиентов', 'Напоминания о записи', 'Автоматическая квалификация лидов'],
    tools: ['CRM'], later: ['Онлайн-оплату', 'Программу повторных продаж']
  },
  'Интернет-магазин': {
    automation: ['Сбор заявок и заказов', 'Уведомления о статусах заказов', 'Ведение товарной и клиентской базы'],
    tools: ['CRM', 'API'], later: ['Онлайн-оплату', 'Личный кабинет покупателя', 'Расширенную аналитику продаж']
  },
  'Розничный магазин': {
    automation: ['Учёт обращений и заявок', 'Уведомления клиентам', 'Управленческую отчётность', 'Сценарии повторных продаж'],
    tools: ['CRM'], later: ['Программу лояльности', 'Аналитику повторных продаж']
  },
  'Производство': {
    automation: ['Обработку заявок', 'Расчёт стоимости заказов', 'Формирование документов', 'Контроль этапов производства', 'Отчётность и уведомления сотрудникам'],
    tools: ['CRM'], later: ['Планирование загрузки производства', 'Интеграцию с оборудованием']
  },
  'Обучение': {
    automation: ['Сбор заявок учеников', 'Расписание занятий', 'Напоминания об уроках', 'Ведение базы учеников', 'Выдачу учебных материалов'],
    tools: ['Telegram Bot'], later: ['Приём оплаты', 'Личный кабинет ученика', 'Проверку домашних заданий с AI']
  },
  'Недвижимость': {
    automation: ['Сбор и квалификацию лидов', 'Ведение базы клиентов в CRM', 'Подбор объектов по параметрам', 'Уведомления клиентам и агентам'],
    tools: ['CRM'], later: ['Автоподбор объектов', 'Личный кабинет клиента', 'Голосового ассистента']
  },
  'Другое': {
    automation: ['Централизованный сбор заявок', 'Контроль повторяющихся операций'],
    tools: [], later: ['Расширенную аналитику', 'Личный кабинет']
  }
};

const channelRules = {
  'Telegram': { tool: 'Telegram Bot', automation: 'Сбор заявок через Telegram-бота', integration: 'Telegram Bot', reason: 'Telegram уже используется для заявок, поэтому бот сохранит привычный клиентам канал общения.' },
  'WhatsApp': { tool: 'API', automation: 'Приём и маршрутизацию обращений из WhatsApp', integration: 'WhatsApp через API или сервис интеграции', reason: 'WhatsApp следует подключить через официальный API или подходящий сервис, чтобы обращения не терялись.' },
  'Сайт': { tool: 'API', automation: 'Передачу заявок с формы сайта через webhook', integration: 'Форма сайта + webhook/API', reason: 'Форма сайта сможет сразу передавать данные в рабочую систему без ручного копирования.' },
  'Avito': { tool: 'CRM', automation: 'Передачу заявок Avito в единую систему обработки', integration: 'Avito → CRM/единая система', reason: 'Заявки Avito лучше объединить с остальными обращениями, чтобы менеджеры работали в одном окне.' },
  'VK': { tool: 'API', automation: 'Автоматическую обработку сообщений и лидов VK', integration: 'VK API/форма лидов', reason: 'Сообщения и лиды VK можно автоматически регистрировать и назначать ответственному.' },
  'Электронная почта': { tool: 'AI', automation: 'Классификацию писем и автоматическое создание задач', integration: 'Электронная почта', reason: 'Входящие письма можно классифицировать автоматически и превращать в задачи без ручного разбора.' },
  'Телефон': { tool: 'CRM', automation: 'Фиксацию телефонных обращений и задач на обратный звонок', integration: 'Телефония/CRM', reason: 'Телефонные обращения важно фиксировать вместе с цифровыми каналами, чтобы сохранить историю клиента.' }
};

const manualRules = {
  'Отвечают клиентам': { automation: 'AI-ассистента для первичных ответов и типовых вопросов', tool: 'AI', mvp: 'Подключить AI-ассистента для первичных ответов' },
  'Принимают заявки': { automation: 'Автоматический сбор и квалификацию заявок', tool: 'CRM', mvp: 'Настроить сбор и квалификацию заявок' },
  'Переносят данные': { automation: 'Передачу данных между системами через Make, n8n или API', tool: 'n8n', mvp: 'Автоматизировать передачу данных между системами' },
  'Создают документы': { automation: 'Генерацию документов по шаблонам', tool: 'Make', mvp: 'Добавить генерацию документов по шаблонам' },
  'Делают расчёты': { automation: 'Автоматический калькулятор стоимости и условий', tool: 'Make', mvp: 'Настроить автоматический калькулятор' },
  'Отправляют уведомления': { automation: 'Автоматические Telegram, email или CRM-уведомления', tool: 'Make', mvp: 'Запустить уведомления клиенту и менеджеру' },
  'Готовят отчёты': { automation: 'Автоматические отчёты и регулярные сводки', tool: 'Google Sheets', mvp: 'Собрать базовый автоматический отчёт' },
  'Работают с таблицами': { automation: 'Единую базу в Google Sheets или Airtable', tool: 'Google Sheets', mvp: 'Создать единую структуру данных' }
};

function unique(items) { return [...new Set(items.filter(Boolean))]; }

function calculateComplexity(channelCount, manualCount, integrationCount, systems) {
  const volumeScore = { 'До 50': 0, '50–200': 1, '200–1000': 3, 'Более 1000': 5 }[answers.volume] || 0;
  let score = volumeScore + Math.max(0, channelCount - 1) + Math.ceil(manualCount * 0.7) + Math.max(0, integrationCount - 2);
  if (systems.includes('CRM')) score += 1;
  if (systems.includes('1С')) score += 3;
  if (systems.includes('Сайт')) score += 1;
  let complexity = score <= 5 ? 'простая' : score <= 10 ? 'средняя' : 'сложная';
  if (answers.volume === '200–1000' && complexity === 'простая') complexity = 'средняя';
  if (answers.volume === 'Более 1000' && complexity === 'простая') complexity = 'средняя';
  return { complexity, score };
}

function calculateResult() {
  const manual = answers.manual || [];
  const sources = answers.sources || [];
  const systems = answers.systems || [];
  const business = businessRules[answers.business] || businessRules['Другое'];
  const selectedChannels = sources.map((source) => channelRules[source]).filter(Boolean);
  const selectedManual = manual.map((process) => manualRules[process]).filter(Boolean);
  const automation = unique([...business.automation, ...selectedChannels.map((rule) => rule.automation), ...selectedManual.map((rule) => rule.automation)]).slice(0, 7);
  const integrations = unique(selectedChannels.map((rule) => rule.integration));
  const tools = new Set([...business.tools, ...selectedChannels.map((rule) => rule.tool), ...selectedManual.map((rule) => rule.tool)]);

  if (systems.includes('CRM')) { tools.add('CRM'); integrations.push('Действующая CRM'); }
  if (systems.includes('Airtable')) { tools.add('Airtable'); integrations.push('Airtable'); }
  if (systems.includes('Excel / Google Sheets')) tools.add('Google Sheets');
  if (systems.includes('1С')) { tools.add('API'); integrations.push('1С через API, HTTP или регламентный обмен данными'); }
  if (systems.includes('Сайт')) { tools.add('API'); integrations.push('Действующий сайт'); }
  if (systems.includes('Пока ничего')) tools.add('Google Sheets');

  const assessment = calculateComplexity(sources.length, manual.length, unique(integrations).length, systems);
  const complexity = assessment.complexity;
  if (complexity !== 'простая' || answers.volume === 'Более 1000') { tools.delete('Make'); tools.add('n8n'); }
  else if (!tools.has('n8n')) tools.add('Make');
  if (answers.volume === 'Более 1000') { tools.add('API'); tools.add('CRM'); }
  const budgets = { простая:'15 000–30 000 ₽', средняя:'30 000–70 000 ₽', сложная:'70 000–150 000 ₽' };

  const entry = sources.includes('Telegram') ? 'Telegram' : sources.includes('Сайт') ? 'Сайт' : sources[0] || 'Канал заявки';
  const storage = systems.includes('CRM') ? 'Текущая CRM' : systems.includes('Airtable') ? 'Airtable' : complexity === 'простая' ? 'Google Sheets' : 'CRM / база';
  const scheme = ['Клиент', entry];
  if (tools.has('AI')) scheme.push('AI');
  scheme.push(storage, 'Менеджер');

  const benefits = [];
  if (manual.includes('Отвечают клиентам') || manual.includes('Принимают заявки')) benefits.push('Более быстрый ответ клиентам и меньше потерянных заявок');
  if (manual.includes('Переносят данные') || manual.includes('Работают с таблицами')) benefits.push('Меньше ошибок и повторного ручного ввода данных');
  if (manual.includes('Создают документы') || manual.includes('Готовят отчёты')) benefits.push('Документы и отчёты формируются за минуты, а не часы');
  if (manual.includes('Отправляют уведомления')) benefits.push('Клиенты и команда вовремя получают нужные уведомления');
  benefits.push(answers.volume === 'Более 1000' || answers.volume === '200–1000' ? 'Система выдержит рост объёма операций без расширения штата' : 'Команда освободит время для продаж и важных задач');
  benefits.push('Единая прозрачная история работы с каждой заявкой');

  const explanations = selectedChannels.map((rule) => rule.reason);
  if (systems.includes('CRM')) explanations.push('Уже используемую CRM не нужно заменять: автоматизация будет передавать данные в неё и дополнять текущий процесс.');
  if (systems.includes('Airtable')) explanations.push('Airtable можно сохранить как рабочую базу и связать с каналами заявок.');
  if (systems.includes('Excel / Google Sheets') && complexity === 'простая') explanations.push('При текущем масштабе Google Sheets достаточно для быстрого и недорогого запуска MVP.');
  if (systems.includes('1С')) explanations.push('Обмен с 1С нужно проектировать отдельно через API, HTTP или регламентную выгрузку данных.');
  if (systems.includes('Пока ничего')) explanations.push('Так как готовых систем пока нет, первый этап лучше собрать на простой архитектуре без лишних затрат.');
  if (answers.volume === 'Более 1000') explanations.push('Большой объём операций требует устойчивого сценария на n8n/API с контролем ошибок и централизованной базой.');
  if (!explanations.length) explanations.push(`Схема подобрана под процессы бизнеса типа «${answers.business.toLowerCase()}» и не требует лишних интеграций.`);

  const mvp = unique([
    selectedChannels.length ? `Объединить сбор заявок из каналов: ${sources.join(', ')}` : 'Настроить единый сбор заявок',
    systems.includes('CRM') ? 'Передавать новые обращения в действующую CRM' : `Создать единую базу в ${storage}`,
    ...selectedManual.map((rule) => rule.mvp),
    'Уведомлять ответственного менеджера о новой заявке'
  ]).slice(0, 4);
  const later = unique([...business.later, 'Расширенную аналитику', manual.includes('Создают документы') ? null : 'Автоматическое создание документов', systems.includes('1С') ? null : 'Интеграцию с 1С', 'Голосового ассистента']).slice(0, 5);
  const risks = unique([
    sources.length > 2 ? 'Разные форматы данных во входящих каналах — потребуется единая структура полей.' : null,
    systems.includes('1С') ? 'Возможности интеграции зависят от версии и доработок текущей конфигурации 1С.' : null,
    sources.includes('WhatsApp') ? 'Для стабильной работы WhatsApp потребуется официальный API или совместимый провайдер.' : null,
    tools.has('AI') ? 'Ответы AI нужно протестировать на реальных обращениях и ограничить правилами передачи менеджеру.' : null,
    answers.volume === 'Более 1000' ? 'Нужны журналирование, повторные попытки и мониторинг ошибок при высокой нагрузке.' : null,
    'Перед запуском потребуется согласовать доступы и ответственных за интегрируемые системы.'
  ]);
  return { automation, tools:[...tools], complexity, budget:budgets[complexity], scheme, benefits:unique(benefits).slice(0, 5), explanations:unique(explanations).slice(0, 4), mvp, later, integrations:unique(integrations), risks, score:assessment.score };
}

function showResults() {
  const result = calculateResult();
  currentResult = result;
  quiz.classList.add('hidden'); results.classList.remove('hidden');
  $('#automationList').innerHTML = result.automation.map((item) => `<li>${item}</li>`).join('');
  $('#tools').innerHTML = result.tools.map((item) => `<span class="tool">${item}</span>`).join('');
  $('#complexity').textContent = result.complexity; $('#budget').textContent = result.budget;
  $('#scheme').innerHTML = result.scheme.map((item, index) => `${index ? '<span class="scheme__arrow">→</span>' : ''}<span class="scheme__node">${item}</span>`).join('');
  $('#benefits').innerHTML = result.benefits.map((item) => `<div class="benefit">${item}</div>`).join('');
  $('#explanations').innerHTML = result.explanations.map((item) => `<li>${item}</li>`).join('');
  $('#mvpList').innerHTML = result.mvp.map((item) => `<li>${item}</li>`).join('');
  $('#laterList').innerHTML = result.later.map((item) => `<li>${item}</li>`).join('');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function resultText(result = currentResult) {
  return [
    'AI-калькулятор автоматизации бизнеса',
    `Бизнес: ${answers.business}`,
    `Проблема: ${answers.problem}`,
    '', 'Что автоматизировать:', ...result.automation.map((item) => `• ${item}`),
    '', `Схема: ${result.scheme.join(' → ')}`,
    `Инструменты: ${result.tools.join(', ')}`,
    `Сложность: ${result.complexity}`,
    `Бюджет: ${result.budget}`,
    '', 'MVP:', ...result.mvp.map((item, index) => `${index + 1}. ${item}`)
  ].join('\n');
}

function specText(result = currentResult) {
  const integrations = result.integrations.length ? result.integrations : ['Внешние интеграции на первом этапе не требуются'];
  return [
    'ТЕХНИЧЕСКОЕ ЗАДАНИЕ',
    '', `Описание задачи: автоматизация ключевых процессов бизнеса типа «${answers.business}».`,
    `Текущая проблема: ${answers.problem}`,
    'Цель автоматизации: сократить ручную работу, объединить обработку обращений и повысить прозрачность процессов.',
    `Рекомендуемая архитектура: ${result.scheme.join(' → ')}.`,
    '', 'Интеграции:', ...integrations.map((item) => `• ${item}`),
    '', 'Этапы разработки:', '1. Уточнение полей, ролей и доступов.', '2. Настройка интеграций и единой структуры данных.', '3. Реализация сценариев автоматизации.', '4. Тестирование, обучение и запуск.',
    '', 'MVP:', ...result.mvp.map((item, index) => `${index + 1}. ${item}`),
    '', 'Возможные риски:', ...result.risks.map((item) => `• ${item}`),
    '', `Ориентировочная сложность: ${result.complexity}.`, `Ориентировочный бюджет: ${result.budget}.`
  ].join('\n');
}

function renderSpec() {
  const result = currentResult;
  const sections = [
    ['Описание задачи', `Автоматизировать ключевые процессы бизнеса типа «${answers.business}» и связать каналы обращений с рабочими системами.`],
    ['Текущая проблема', answers.problem],
    ['Цель автоматизации', 'Сократить ручную работу, ускорить обработку заявок, исключить потерю данных и сделать процесс прозрачным для команды.'],
    ['Рекомендуемая архитектура', result.scheme.join(' → ')],
    ['Список интеграций', result.integrations.length ? result.integrations : ['Внешние интеграции на первом этапе не требуются']],
    ['Этапы разработки', ['Уточнение полей, ролей и доступов', 'Настройка интеграций и структуры данных', 'Реализация сценариев автоматизации', 'Тестирование на реальных заявках', 'Обучение команды и запуск']],
    ['MVP', result.mvp],
    ['Возможные риски', result.risks],
    ['Оценка', [`Сложность: ${result.complexity}`, `Бюджет: ${result.budget}`]]
  ];
  const documentElement = $('#specDocument');
  documentElement.innerHTML = '';
  sections.forEach(([title, content]) => {
    const section = document.createElement('section');
    section.className = 'spec-section';
    const heading = document.createElement('h3');
    heading.textContent = title;
    section.appendChild(heading);
    if (Array.isArray(content)) {
      const list = document.createElement(title === 'Этапы разработки' || title === 'MVP' ? 'ol' : 'ul');
      content.forEach((item) => { const li = document.createElement('li'); li.textContent = item; list.appendChild(li); });
      section.appendChild(list);
    } else {
      const paragraph = document.createElement('p'); paragraph.textContent = content; section.appendChild(paragraph);
    }
    documentElement.appendChild(section);
  });
}

async function copyToClipboard(text, successMessage) {
  try {
    await navigator.clipboard.writeText(text);
  } catch (error) {
    const textarea = document.createElement('textarea');
    textarea.value = text; textarea.style.position = 'fixed'; textarea.style.opacity = '0';
    document.body.appendChild(textarea); textarea.select();
    const copied = document.execCommand('copy'); textarea.remove();
    if (!copied) throw error;
  }
  $('#actionStatus').textContent = successMessage;
  setTimeout(() => { $('#actionStatus').textContent = ''; }, 3000);
}

$('#specButton').addEventListener('click', () => { renderSpec(); $('#specModal').showModal(); });
$('#closeSpecButton').addEventListener('click', () => $('#specModal').close());
$('#specModal').addEventListener('click', (event) => { if (event.target === $('#specModal')) $('#specModal').close(); });
$('#copyButton').addEventListener('click', () => copyToClipboard(resultText(), 'Краткий результат скопирован'));
$('#copySpecButton').addEventListener('click', () => copyToClipboard(specText(), 'Техническое задание скопировано'));
$('#printButton').addEventListener('click', () => { if ($('#specModal').open) $('#specModal').close(); window.print(); });
$('#printSpecButton').addEventListener('click', () => { document.body.classList.add('print-spec'); window.print(); document.body.classList.remove('print-spec'); });
