const questions = [
  { key: 'business', title: 'Какой у вас бизнес?', type: 'single', options: ['Услуги', 'Интернет-магазин', 'Розничный магазин', 'Производство', 'Обучение', 'Недвижимость', 'Другое'] },
  { key: 'sources', title: 'Откуда приходят заявки?', type: 'multiple', options: ['Telegram', 'WhatsApp', 'Сайт', 'Avito', 'VK', 'Телефон', 'Электронная почта', 'Другое'] },
  { key: 'manual', title: 'Что сотрудники делают вручную?', type: 'multiple', options: ['Отвечают клиентам', 'Принимают заявки', 'Переносят данные', 'Создают документы', 'Делают расчёты', 'Отправляют уведомления', 'Готовят отчёты', 'Работают с таблицами', 'Другое'] },
  { key: 'volume', title: 'Сколько заявок или операций происходит в месяц?', type: 'single', options: ['До 50', '50–200', '200–1000', 'Более 1000'] },
  { key: 'systems', title: 'Какие системы уже используются?', type: 'multiple', options: ['Excel / Google Sheets', 'CRM', 'Telegram', 'Airtable', '1С', 'Сайт', 'Пока ничего', 'Другое'] },
  { key: 'problem', title: 'Какую главную проблему вы хотите решить?', type: 'text' }
];

let step = 0;
let answers = {};
let currentResult = null;
let lastFocusedElement = null;
const $ = (selector) => document.querySelector(selector);
const hero = $('#hero');
const quiz = $('#quiz');
const results = $('#results');

function showQuiz() {
  closeSpec();
  hero.classList.add('hidden');
  results.classList.add('hidden');
  quiz.classList.remove('hidden');
  step = 0;
  renderQuestion();
  window.scrollTo({ top: 0, behavior: 'smooth' });
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
  options.replaceChildren();
  const textarea = $('#problemInput');
  textarea.classList.toggle('hidden', question.type !== 'text');
  if (question.type === 'text') {
    textarea.value = answers[question.key] || '';
    setTimeout(() => textarea.focus(), 50);
    return;
  }
  const selected = answers[question.key] || (question.type === 'multiple' ? [] : '');
  question.options.forEach((value) => {
    const isSelected = question.type === 'multiple' ? selected.includes(value) : selected === value;
    const label = document.createElement('label');
    label.className = `option${isSelected ? ' selected' : ''}`;
    const input = document.createElement('input');
    input.type = question.type === 'multiple' ? 'checkbox' : 'radio';
    input.name = 'answer';
    input.value = value;
    input.checked = isSelected;
    const check = document.createElement('span');
    check.className = 'option__check';
    check.textContent = isSelected ? '✓' : '';
    const text = document.createElement('span');
    text.textContent = value;
    label.append(input, check, text);
    options.append(label);
  });
}

$('#options').addEventListener('change', (event) => {
  const question = questions[step];
  if (question.type === 'single') answers[question.key] = event.target.value;
  else answers[question.key] = [...document.querySelectorAll('#options input:checked')].map((input) => input.value);
  document.querySelectorAll('.option').forEach((label) => {
    const checked = label.querySelector('input').checked;
    label.classList.toggle('selected', checked);
    label.querySelector('.option__check').textContent = checked ? '✓' : '';
  });
  $('#validation').textContent = '';
});

$('#questionForm').addEventListener('submit', (event) => {
  event.preventDefault();
  const question = questions[step];
  if (question.type === 'text') answers[question.key] = $('#problemInput').value.trim();
  if (!answers[question.key] || answers[question.key].length === 0) {
    $('#validation').textContent = 'Пожалуйста, заполните ответ, чтобы продолжить';
    return;
  }
  if (step < questions.length - 1) {
    step += 1;
    renderQuestion();
  } else showResults();
});

function unique(items) {
  return [...new Set(items)];
}

function calculateResult() {
  const { business, volume, problem } = answers;
  const manual = answers.manual || [];
  const sources = answers.sources || [];
  const systems = answers.systems || [];
  const has = (value) => systems.includes(value);
  const automation = [];
  const firstStage = [];
  const laterStage = [];
  const integrations = unique([...sources, ...systems.filter((item) => item !== 'Пока ничего')]);

  const businessFocus = {
    'Услуги': 'квалификацию лидов, запись и контроль следующего контакта',
    'Интернет-магазин': 'обработку заказов, статусы оплаты и доставки',
    'Розничный магазин': 'учёт обращений, остатков и повторных продаж',
    'Производство': 'передачу заказа в производство, расчёты и статусы выполнения',
    'Обучение': 'регистрацию учеников, оплату и учебные уведомления',
    'Недвижимость': 'квалификацию лида, подбор объектов и сопровождение сделки',
    'Другое': 'единый маршрут заявки и контроль выполнения операций'
  };
  automation.push(`Настроить ${businessFocus[business] || businessFocus.Другое}`);
  if (manual.includes('Отвечают клиентам')) automation.push('Автоматизировать первичные ответы и типовые вопросы с передачей сложных диалогов сотруднику');
  if (manual.includes('Принимают заявки')) automation.push('Собирать и распределять заявки из всех каналов без ручного копирования');
  if (manual.some((item) => ['Переносят данные', 'Работают с таблицами'].includes(item))) automation.push('Синхронизировать данные между каналами и рабочими системами');
  if (manual.includes('Создают документы')) automation.push('Формировать документы по шаблонам из данных заявки');
  if (manual.includes('Делают расчёты')) automation.push('Автоматизировать расчёт стоимости и предварительного предложения');
  if (manual.includes('Отправляют уведомления')) automation.push('Запускать уведомления клиентам и ответственным по событиям');
  if (manual.includes('Готовят отчёты')) automation.push('Собирать операционные показатели в автоматический отчёт');

  const tools = new Set([sources.length > 2 || manual.length > 3 || volume === 'Более 1000' ? 'n8n' : 'Make']);
  if (sources.includes('Telegram') || has('Telegram')) tools.add('Telegram Bot');
  if (manual.includes('Отвечают клиентам') || manual.includes('Создают документы') || /ответ|текст|клиент|документ/i.test(problem)) tools.add('AI');
  if (has('CRM')) tools.add('Текущая CRM');
  else if (manual.includes('Принимают заявки') || sources.length > 1) tools.add('CRM');
  if (has('Airtable')) tools.add('Airtable');
  if (has('Excel / Google Sheets') || has('Пока ничего')) tools.add('Google Sheets');
  if (has('1С')) tools.add('1С');
  if (has('1С') || has('Сайт') || sources.includes('Сайт')) tools.add('API / вебхуки');

  const volumePoints = { 'До 50': 0, '50–200': 1, '200–1000': 3, 'Более 1000': 5 };
  let score = 1 + Math.ceil(manual.length * 0.8) + Math.max(0, sources.length - 1) + (volumePoints[volume] || 0);
  score += has('1С') ? 3 : 0;
  score += has('CRM') ? 1 : 0;
  score += has('Airtable') ? 1 : 0;
  score += has('Excel / Google Sheets') ? 1 : 0;
  score += systems.filter((item) => !['Пока ничего', 'Другое'].includes(item)).length > 3 ? 2 : 0;
  const complexity = score <= 6 ? 'простая' : score <= 13 ? 'средняя' : 'сложная';
  const budgets = { простая: '25 000–50 000 ₽', средняя: '50 000–120 000 ₽', сложная: '120 000–250 000 ₽' };

  const storage = has('CRM') ? 'Текущая CRM' : has('Airtable') ? 'Airtable' : has('Excel / Google Sheets') ? 'Google Sheets' : 'CRM';
  const entry = sources.length > 1 ? 'Все каналы' : sources[0] || 'Канал заявки';
  const scheme = ['Клиент', entry, 'Make / n8n'];
  if (tools.has('AI')) scheme.push('AI-помощник');
  scheme.push(storage);
  if (has('1С')) scheme.push('1С');
  scheme.push('Ответственный');

  firstStage.push(`Объединить ${sources.length > 1 ? `${sources.length} канала заявок` : 'канал заявок'} в едином маршруте`);
  firstStage.push(`Настроить карточку и статусы в ${storage}`);
  firstStage.push(`Автоматизировать 1–2 приоритетных процесса: ${manual.slice(0, 2).join(' и ').toLowerCase() || 'приём и обработку заявок'}`);
  firstStage.push('Добавить журнал ошибок, уведомления ответственным и базовый отчёт');
  if (tools.has('AI')) laterStage.push('Расширить AI-помощника базой знаний и контролем качества ответов');
  else laterStage.push('Подключить AI для классификации заявок и подготовки ответов');
  if (!has('CRM')) laterStage.push('Перенести процесс в полноценную CRM при росте команды и объёма');
  if (!has('1С') && ['Интернет-магазин', 'Розничный магазин', 'Производство'].includes(business)) laterStage.push('Добавить интеграцию с учётной системой и синхронизацию остатков');
  laterStage.push('Добавить управленческий дашборд, сквозную аналитику и новые сценарии');

  const reasons = [
    `Для направления «${business}» важнее всего ${businessFocus[business] || businessFocus.Другое}.`,
    `${sources.length > 1 ? `Заявки идут из ${sources.length} каналов, поэтому их нужно свести в один маршрут.` : 'Выбранный канал можно подключить напрямую без избыточной архитектуры.'}`,
    `${manual.length} ручных ${manual.length === 1 ? 'процесс' : 'процесса/процессов'} при объёме «${volume}» определяют приоритеты и запас производительности.`,
    has('CRM') || has('Airtable') || has('Excel / Google Sheets') || has('1С') ? 'Существующие системы сохраняются и связываются интеграционным слоем — без лишней миграции на старте.' : 'Так как готовой системы пока нет, предлагается начать с простого центра данных и не усложнять MVP.'
  ];

  const benefits = ['Единая прозрачная история работы с каждой заявкой'];
  if (manual.some((item) => ['Отвечают клиентам', 'Принимают заявки'].includes(item))) benefits.unshift('Более быстрый ответ и меньше потерянных заявок');
  if (manual.some((item) => ['Переносят данные', 'Работают с таблицами'].includes(item))) benefits.push('Меньше ошибок и повторного ручного ввода');
  if (manual.some((item) => ['Создают документы', 'Готовят отчёты'].includes(item))) benefits.push('Документы и отчёты формируются за минуты');
  benefits.push(['200–1000', 'Более 1000'].includes(volume) ? 'Рост объёма без пропорционального расширения штата' : 'Больше времени команды на продажи и ключевые задачи');

  return {
    automation: unique(automation).slice(0, 6), tools: [...tools], complexity, budget: budgets[complexity], score,
    scheme, benefits: unique(benefits).slice(0, 5), reasons, firstStage, laterStage: unique(laterStage), integrations,
    description: `Автоматизация ключевого процесса для бизнеса «${business}» с обработкой объёма «${volume}» в месяц.`,
    problem, goal: `Сократить ручную работу (${manual.join(', ').toLowerCase()}) и обеспечить контролируемую обработку заявок из каналов: ${sources.join(', ')}.`,
    architecture: scheme.join(' → '),
    mvp: firstStage.join('; '),
    risks: [has('1С') ? 'Доступность и ограничения API используемой версии 1С' : null, has('CRM') ? 'Качество данных и доступы к API текущей CRM' : null, 'Изменения регламентов после запуска', 'Ошибки или неполные исходные данные'].filter(Boolean)
  };
}

function fillList(selector, items) {
  const container = $(selector);
  container.replaceChildren(...items.map((item) => {
    const element = document.createElement('li');
    element.textContent = item;
    return element;
  }));
}

function showResults() {
  currentResult = calculateResult();
  quiz.classList.add('hidden');
  results.classList.remove('hidden');
  fillList('#automationList', currentResult.automation);
  $('#tools').replaceChildren(...currentResult.tools.map((item) => {
    const tool = document.createElement('span');
    tool.className = 'tool';
    tool.textContent = item;
    return tool;
  }));
  $('#complexity').textContent = currentResult.complexity;
  $('#budget').textContent = currentResult.budget;
  const schemeNodes = [];
  currentResult.scheme.forEach((item, index) => {
    if (index) {
      const arrow = document.createElement('span');
      arrow.className = 'scheme__arrow';
      arrow.textContent = '→';
      schemeNodes.push(arrow);
    }
    const node = document.createElement('span');
    node.className = 'scheme__node';
    node.textContent = item;
    schemeNodes.push(node);
  });
  $('#scheme').replaceChildren(...schemeNodes);
  $('#benefits').replaceChildren(...currentResult.benefits.map((item) => {
    const benefit = document.createElement('div');
    benefit.className = 'benefit';
    benefit.textContent = item;
    return benefit;
  }));
  $('#rationale').replaceChildren(...currentResult.reasons.map((item) => {
    const paragraph = document.createElement('p');
    paragraph.textContent = item;
    return paragraph;
  }));
  fillList('#firstStage', currentResult.firstStage);
  fillList('#laterStage', currentResult.laterStage);
  $('#resultStatus').textContent = '';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function resultText() {
  const r = currentResult;
  return [
    'ПЛАН АВТОМАТИЗАЦИИ', `Бизнес: ${answers.business}`, `Объём: ${answers.volume}`,
    `\nЧто автоматизировать:\n• ${r.automation.join('\n• ')}`, `\nСхема:\n${r.architecture}`,
    `\nИнструменты: ${r.tools.join(', ')}`, `Сложность: ${r.complexity}`, `Бюджет: ${r.budget}`,
    `\nПочему именно такая схема:\n${r.reasons.join(' ')}`, `\nПервый этап:\n• ${r.firstStage.join('\n• ')}`,
    `\nПозже:\n• ${r.laterStage.join('\n• ')}`
  ].join('\n');
}

function specData() {
  const r = currentResult;
  const implementationSteps = ['Аудит данных и доступов', ...r.firstStage, 'Тестирование, обучение и запуск']
    .map((item, index) => `${index + 1}. ${item}`)
    .join(' ');
  return [
    ['Описание задачи', r.description], ['Текущая проблема', r.problem], ['Цель автоматизации', r.goal],
    ['Рекомендуемая архитектура', r.architecture], ['Интеграции', r.integrations.length ? r.integrations.join(', ') : 'Подключение новых систем не требуется на этапе MVP'],
    ['Этапы', implementationSteps],
    ['MVP', r.mvp], ['Риски', r.risks.join('; ')], ['Сложность', `${r.complexity} (расчётный балл: ${r.score})`], ['Бюджет', r.budget]
  ];
}

function renderSpec() {
  const sections = specData().map(([title, content]) => {
    const section = document.createElement('section');
    section.className = 'spec-section';
    const heading = document.createElement('h3');
    heading.textContent = title;
    const paragraph = document.createElement('p');
    paragraph.textContent = content;
    section.append(heading, paragraph);
    return section;
  });
  $('#specSections').replaceChildren(...sections);
}

function openSpec() {
  if (!currentResult) return;
  renderSpec();
  lastFocusedElement = document.activeElement;
  $('#specModal').classList.remove('hidden');
  document.body.classList.add('modal-open');
  $('#specStatus').textContent = '';
  $('#specDocument').focus();
}

function closeSpec() {
  const modal = $('#specModal');
  if (modal.classList.contains('hidden')) return;
  modal.classList.add('hidden');
  document.body.classList.remove('modal-open');
  if (lastFocusedElement) lastFocusedElement.focus();
}

async function copyText(text, statusElement) {
  try {
    if (navigator.clipboard && window.isSecureContext) await navigator.clipboard.writeText(text);
    else {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.append(textarea);
      textarea.select();
      if (!document.execCommand('copy')) throw new Error('copy failed');
      textarea.remove();
    }
    statusElement.textContent = 'Скопировано';
  } catch (error) {
    statusElement.textContent = 'Не удалось скопировать';
  }
  setTimeout(() => { statusElement.textContent = ''; }, 2500);
}

function printDocument(type) {
  document.body.classList.add(`print-${type}`);
  const cleanup = () => document.body.classList.remove(`print-${type}`);
  window.addEventListener('afterprint', cleanup, { once: true });
  window.print();
  setTimeout(cleanup, 1000);
}

$('#backButton').addEventListener('click', () => { if (step > 0) { step -= 1; renderQuestion(); } });
$('#startButton').addEventListener('click', showQuiz);
$('#restartButton').addEventListener('click', () => { answers = {}; currentResult = null; showQuiz(); });
$('#specButton').addEventListener('click', openSpec);
$('#closeSpecButton').addEventListener('click', closeSpec);
$('#specModal').addEventListener('click', (event) => { if (event.target.matches('[data-close-modal]')) closeSpec(); });
document.addEventListener('keydown', (event) => { if (event.key === 'Escape') closeSpec(); });
$('#copyResultButton').addEventListener('click', () => copyText(resultText(), $('#resultStatus')));
$('#printResultButton').addEventListener('click', () => printDocument('result'));
$('#copySpecButton').addEventListener('click', () => copyText(`ТЕХНИЧЕСКОЕ ЗАДАНИЕ\n\n${specData().map(([title, content]) => `${title.toUpperCase()}\n${content}`).join('\n\n')}`, $('#specStatus')));
$('#printSpecButton').addEventListener('click', () => printDocument('spec'));
