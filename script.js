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
$('#restartButton').addEventListener('click', () => { answers = {}; showQuiz(); });
$('#specButton').addEventListener('click', () => { $('#notice').classList.remove('hidden'); $('#notice').scrollIntoView({ behavior: 'smooth', block: 'center' }); });

function includes(key, value) { return (answers[key] || []).includes(value); }

function calculateResult() {
  const manual = answers.manual || [];
  const sources = answers.sources || [];
  const systems = answers.systems || [];
  const automation = [];
  if (manual.includes('Отвечают клиентам')) automation.push('Первичные ответы клиентам и обработку типовых вопросов');
  if (manual.includes('Принимают заявки')) automation.push('Сбор, квалификацию и распределение входящих заявок');
  if (manual.includes('Переносят данные') || manual.includes('Работают с таблицами')) automation.push('Перенос данных между каналами, таблицами и учётными системами');
  if (manual.includes('Создают документы')) automation.push('Автоматическое формирование документов по шаблонам');
  if (manual.includes('Делают расчёты')) automation.push('Расчёты стоимости и подготовку предварительных предложений');
  if (manual.includes('Отправляют уведомления')) automation.push('Уведомления клиентам и напоминания сотрудникам');
  if (manual.includes('Готовят отчёты')) automation.push('Сбор показателей и регулярную подготовку отчётов');
  if (!automation.length) automation.push('Централизованный сбор и обработку повторяющихся операций');

  const tools = new Set();
  tools.add(sources.length > 2 || manual.length > 3 ? 'n8n' : 'Make');
  if (sources.includes('Telegram') || systems.includes('Telegram')) tools.add('Telegram Bot');
  if (manual.includes('Отвечают клиентам') || manual.includes('Создают документы') || /ответ|текст|клиент/i.test(answers.problem)) tools.add('AI');
  if (manual.includes('Принимают заявки') || systems.includes('CRM')) tools.add('CRM');
  if (systems.includes('Airtable')) tools.add('Airtable');
  if (systems.includes('Excel / Google Sheets') || systems.includes('Пока ничего')) tools.add('Google Sheets');
  if (systems.includes('1С') || systems.includes('Сайт') || sources.includes('Сайт')) tools.add('API');

  let score = manual.length + Math.max(0, sources.length - 2) + Math.max(0, systems.length - 2);
  if (answers.volume === '200–1000') score += 2;
  if (answers.volume === 'Более 1000') score += 4;
  if (systems.includes('1С')) score += 2;
  const complexity = score <= 5 ? 'простая' : score <= 10 ? 'средняя' : 'сложная';
  const budgets = { простая:'15 000–30 000 ₽', средняя:'30 000–70 000 ₽', сложная:'70 000–150 000 ₽' };

  const entry = sources.includes('Telegram') ? 'Telegram' : sources.includes('Сайт') ? 'Сайт' : sources[0] || 'Канал заявки';
  const storage = systems.includes('CRM') ? 'CRM' : systems.includes('Airtable') ? 'Airtable' : 'Google Sheets';
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
  return { automation: automation.slice(0, 5), tools:[...tools], complexity, budget:budgets[complexity], scheme, benefits:[...new Set(benefits)].slice(0, 5) };
}

function showResults() {
  const result = calculateResult();
  quiz.classList.add('hidden'); results.classList.remove('hidden'); $('#notice').classList.add('hidden');
  $('#automationList').innerHTML = result.automation.map((item) => `<li>${item}</li>`).join('');
  $('#tools').innerHTML = result.tools.map((item) => `<span class="tool">${item}</span>`).join('');
  $('#complexity').textContent = result.complexity; $('#budget').textContent = result.budget;
  $('#scheme').innerHTML = result.scheme.map((item, index) => `${index ? '<span class="scheme__arrow">→</span>' : ''}<span class="scheme__node">${item}</span>`).join('');
  $('#benefits').innerHTML = result.benefits.map((item) => `<div class="benefit">${item}</div>`).join('');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
