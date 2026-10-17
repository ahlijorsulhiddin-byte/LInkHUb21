(() => {
  'use strict';
  const STORAGE_KEY = 'linkhub_sites_v2';
  const SETTINGS_KEY = 'linkhub_settings_v1';
  const VIEW_KEY = 'linkhub_view_v1';
  const HISTORY_KEY = 'linkhub_history_v1';
  const categories = ['Все сайты','ИИ и инструменты','Обучение','Игры','Развлечения','Работа','Дизайн','Другое'];
  const starterSites = [
    {id:'starter-chatgpt',name:'ChatGPT',url:'https://chatgpt.com/',category:'ИИ и инструменты',description:'ИИ-помощник для идей, обучения, письма и программирования.',createdAt:1},
    {id:'starter-youtube',name:'YouTube',url:'https://www.youtube.com/',category:'Развлечения',description:'Видео, музыка, обучающие ролики и каналы по интересам.',createdAt:2},
    {id:'starter-wikipedia',name:'Wikipedia',url:'https://www.wikipedia.org/',category:'Обучение',description:'Свободная энциклопедия для поиска информации и изучения тем.',createdAt:3},
    {id:'starter-github',name:'GitHub',url:'https://github.com/',category:'Работа',description:'Платформа для хранения кода, совместной разработки и проектов.',createdAt:4},
    {id:'starter-canva',name:'Canva',url:'https://www.canva.com/',category:'Дизайн',description:'Создавай дизайны, презентации, постеры и публикации.',createdAt:5},
    {id:'starter-crazygames',name:'CrazyGames',url:'https://www.crazygames.com/',category:'Игры',description:'Большая коллекция браузерных игр.',createdAt:6}
  ];
  const $ = id => document.getElementById(id);
  const grid = $('siteGrid'), categoryRow = $('categoryRow'), dialog = $('siteDialog'), form = $('siteForm'), settingsDialog = $('settingsDialog');
  let activeCategory = 'Все сайты', toastTimer = null, openMenuId = null;
  function loadView() { try { return JSON.parse(localStorage.getItem(VIEW_KEY) || '{}'); } catch { return {}; } }
  const savedView = loadView();
  const defaultSettings = {theme:'neon',density:'comfortable',columns:'auto',motion:'on',glow:'medium',radius:'soft',background:'aurora',language:'ru'};
  let favoritesOnly = false;
  let settings = loadSettings();

  function normalizeUrl(value) {
    let raw = String(value || '').trim();
    if (!raw) throw new Error('Введи ссылку на сайт.');
    if (!/^[a-zA-Z][a-zA-Z\d+.-]*:/.test(raw)) raw = 'https://' + raw;
    let parsed;
    try { parsed = new URL(raw); } catch { throw new Error('Проверь адрес ссылки. Например: https://example.com'); }
    if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error('Разрешены только ссылки http:// или https://.');
    if (!parsed.hostname || (!parsed.hostname.includes('.') && parsed.hostname !== 'localhost')) throw new Error('Введи корректный адрес сайта, например example.com.');
    if (parsed.username || parsed.password) throw new Error('Ссылки с логином или паролем в адресе не разрешены.');
    return parsed.href;
  }
  function loadSites() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === null) { localStorage.setItem(STORAGE_KEY, JSON.stringify(starterSites)); return [...starterSites]; }
      const parsed = JSON.parse(saved);
      if (!Array.isArray(parsed)) throw new Error('Invalid storage format');
      return parsed.filter(s => s && typeof s.id === 'string' && typeof s.name === 'string' && typeof s.url === 'string' && typeof s.category === 'string');
    } catch (error) {
      console.error('LINK HUB storage error:', error);
      showToast('Не удалось прочитать хранилище. Проверь настройки браузера.');
      return [...starterSites];
    }
  }
  function loadSettings() {
    try { const raw = localStorage.getItem(SETTINGS_KEY); return raw ? {...defaultSettings, ...JSON.parse(raw)} : {...defaultSettings}; }
    catch { return {...defaultSettings}; }
  }
  let sites = loadSites();
  function saveSites() {
    try { const old = localStorage.getItem(STORAGE_KEY); if (old) { let history = []; try { history = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]'); } catch {} history.unshift({time:Date.now(),data:JSON.parse(old)}); localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0,10))); } localStorage.setItem(STORAGE_KEY, JSON.stringify(sites)); return true; }
    catch (error) { console.error(error); showToast('Не удалось сохранить данные. Проверь свободное место браузера.'); return false; }
  }
  function saveSettings() {
    try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)); return true; }
    catch { showToast('Не удалось сохранить настройки в браузере.'); return false; }
  }
  function saveView() {
    try { localStorage.setItem(VIEW_KEY, JSON.stringify({category: activeCategory, query: $('searchInput').value, sort: $('sortSelect').value})); }
    catch (error) { console.error('LINK HUB view save error:', error); }
  }
  function escapeHTML(value) {
    return String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  }
  function hostname(url) { try { return new URL(url).hostname.replace(/^www\./,''); } catch { return url; } }
  function favicon(url) { try { return 'https://www.google.com/s2/favicons?domain=' + encodeURIComponent(new URL(url).hostname) + '&sz=64'; } catch { return ''; } }
  function showToast(message) {
    const el = $('toast'); el.textContent = tr(message); el.classList.add('show');
    clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.remove('show'), 3000);
  }
  const translations = {
    en: {
      'Каталог ссылок':'Link catalog','⚙ Настройки':'⚙ Settings','⌂ Главное меню':'⌂ Main menu','＋ Добавить ссылку':'＋ Add link','ТВОЁ ПРОСТРАНСТВО В ИНТЕРНЕТЕ':'YOUR SPACE ON THE INTERNET','Все сайты.':'All websites.','В одном месте.':'In one place.','Собирай полезные ссылки, открывай новые сайты и создавай собственную коллекцию.':'Collect useful links, discover websites, and build your own collection.','＋ Добавить сайт':'＋ Add website','Исследовать каталог':'Explore catalog','Сайтов в каталоге':'Websites in catalog','Категорий':'Categories','Возможностей':'Possibilities','Поиск сайтов...':'Search websites...','Сначала новые':'Newest first','По названию A–Я':'Name A–Z','Сначала старые':'Oldest first','Ничего не найдено':'Nothing found','Попробуй изменить запрос или добавь сайт в каталог.':'Try changing your search or add a website to the catalog.','Открыть сайт ↗':'Open website ↗','Импорт JSON ↑':'Import JSON ↑','Экспорт данных ↓':'Export data ↓','Настройки стиля':'Style settings','ВНЕШНИЙ ВИД':'APPEARANCE','Цветовая тема':'Color theme','Размер карточек':'Card size','Обычный':'Comfortable','Компактный':'Compact','Количество колонок':'Number of columns','Автоматически (3)':'Automatic (3)','2 колонки':'2 columns','3 колонки':'3 columns','4 колонки':'4 columns','5 колонок':'5 columns','6 колонок':'6 columns','7 колонок':'7 columns','8 колонок':'8 columns','9 колонок':'9 columns','10 колонок':'10 columns','☆ Избранное':'☆ Favorites','★ Избранное':'★ Favorites','Только избранное':'Favorites only','Анимации':'Animations','Включены':'On','Выключены':'Off','Неоновое свечение':'Neon glow','Среднее':'Medium','Мягкое':'Soft','Сильное':'Strong','Выключено':'Off','Скругление карточек':'Card corners','Угловатое':'Sharp','Сильно скруглённое':'Rounded','Эффект фона':'Background effect','Неоновая дымка':'Neon haze','Звёздная сетка':'Star field','Минимализм':'Minimal','Сбросить':'Reset','Сохранить':'Save','Добавить сайт':'Add website','Изменить сайт':'Edit website','Название сайта':'Website name','Ссылка на сайт':'Website URL','Категория':'Category','Описание':'Description','Отмена':'Cancel','Сохранить сайт':'Save website','Сохранить изменения':'Save changes','Все сайты':'All websites','ИИ и инструменты':'AI & Tools','Обучение':'Learning','Игры':'Games','Развлечения':'Entertainment','Работа':'Work','Дизайн':'Design','Другое':'Other','Избранное':'Favorites','Изменить':'Edit','Копировать URL':'Copy URL','Удалить':'Delete','Ссылка скопирована.':'Link copied.','Сайт добавлен в каталог.':'Website added to catalog.','Изменения сохранены.':'Changes saved.','Ссылка удалена.':'Link deleted.','Настройки автоматически сохранены.':'Settings saved automatically.','Настройки сброшены и сохранены.':'Settings reset and saved.','Сбросить фильтры ×':'Clear filters ×'
    }
  };
  Object.assign(translations.en, {
    'ВНЕШНИЙ ВИД':'APPEARANCE','Настройки <span>стиля</span>':'<span>Style</span> settings','Язык сайта / Website language':'Website language','Русский':'Russian','Сине-фиолетовая':'Blue-violet','Изумрудная':'Emerald green','Розовая':'Pink','Морская синяя':'Ocean blue','Оранжево-красная':'Orange-red','Золотая':'Gold','Ледяная голубая':'Ice blue','Бирюзово-розовая':'Teal and pink','Глубокий фиолетовый':'Deep violet','Красный неон':'Red neon','Мятный и бирюзовый':'Mint and teal','Лавандовый свет':'Lavender glow','Кибер-зелёный':'Cyber green','Кофейный и бронзовый':'Coffee and bronze','Светлый интерфейс':'Light interface','Ретро-неон':'Retro neon',
    'Введи название сайта.':'Enter a website name.','Введи ссылку на сайт.':'Enter a website URL.','Проверь адрес ссылки. Например: https://example.com':'Check the URL. Example: https://example.com','Разрешены только ссылки http:// или https://.':'Only http:// and https:// links are allowed.','Введи корректный адрес сайта, например example.com.':'Enter a valid website address, e.g. example.com.','Ссылки с логином или паролем в адресе не разрешены.':'URLs containing a username or password are not allowed.','Можно вводить адрес с https:// или без него. Разрешены только веб-ссылки HTTP/HTTPS.':'Enter a URL with or without https://. Only HTTP/HTTPS web links are allowed.','Например, Wikipedia':'For example, Wikipedia','Коротко расскажи, чем полезен этот сайт...':'Briefly describe what this website is useful for...','РЕДАКТИРОВАНИЕ ЗАКЛАДКИ':'EDIT BOOKMARK','НОВАЯ ЗАКЛАДКА':'NEW BOOKMARK','Изменить <span>сайт</span>':'Edit <span>website</span>','Добавить <span>сайт</span>':'Add <span>website</span>','Открой сайт, чтобы узнать больше.':'Open the website to learn more.','Удалено из избранного.':'Removed from favorites.','Добавлено в избранное.':'Added to favorites.','Не удалось прочитать хранилище. Проверь настройки браузера.':'Could not read browser storage. Check your browser settings.','Не удалось сохранить данные. Проверь свободное место браузера.':'Could not save data. Check available browser storage.','Не удалось сохранить настройки в браузере.':'Could not save settings in the browser.','Ссылка скопирована.':'Link copied.','Не удалось скопировать автоматически. Адрес: ':'Could not copy automatically. URL: ','Ссылка удалена.':'Link deleted.','Экспорт каталога подготовлен.':'Catalog export is ready.','Настройки автоматически сохранены.':'Settings saved automatically.','Настройки сброшены и сохранены.':'Settings reset and saved.','Язык изменён на русский.':'Language changed to Russian.','Ошибка импорта: ':'Import error: ','Импорт завершён. Добавлено ссылок: ':'Import complete. Links added: ','Файл должен содержать JSON-массив ссылок.':'The file must contain a JSON array of links.','Название сайта':'Website name','Ссылка на сайт':'Website URL','Категория':'Category','Описание':'Description','Отмена':'Cancel','Сохранить сайт':'Save website','Сохранить изменения':'Save changes','Сбросить фильтры ×':'Clear filters ×','Все сайты':'All websites','ИИ и инструменты':'AI & Tools','Другое':'Other','Убрать из':'Remove from','Добавить в':'Add to','избранное':'favorites','Действия для':'Actions for','✎ Изменить':'✎ Edit','⧉ Копировать URL':'⧉ Copy URL','× Удалить':'× Delete','сайт':'website','сайта':'websites','сайтов':'websites','Сайтов в каталоге':'Websites in catalog','Категорий':'Categories','Возможностей':'Features','Поиск':'Search','Все сайты':'All websites','Автоматически (3)':'Automatic (3)','2 колонки':'2 columns','3 колонки':'3 columns','4 колонки':'4 columns','5 колонок':'5 columns','6 колонок':'6 columns','7 колонок':'7 columns','8 колонок':'8 columns','9 колонок':'9 columns','10 колонок':'10 columns','Обычный':'Comfortable','Компактный':'Compact','Включены':'On','Выключены':'Off','Среднее':'Medium','Мягкое':'Soft','Сильное':'Strong','Выключено':'Off','Угловатое':'Sharp','Сильно скруглённое':'Rounded','Неоновая дымка':'Neon haze','Звёздная сетка':'Star field','Минимализм':'Minimal','Кибер-сетка':'Cyber grid','Градиентный поток':'Gradient flow','Полезные сайты':'Useful websites','Всё под рукой':'Everything at hand','Умный поиск':'Smart search','Находи быстрее':'Find things faster','Твоя коллекция':'Your collection','Твой порядок':'Your way to stay organized','Собирай полезное. Открывай больше.':'Collect useful things. Discover more.','Введи название сайта.':'Enter a website name.','Похожая ссылка уже есть у сайта «':'A similar link already exists for “','». Всё равно сохранить?':'”. Save anyway?','Удалить «':'Delete “','» из каталога?':'” from the catalog?','У записи №':'Entry #',' нет названия или URL.':' is missing a name or URL.','Введи ссылку на сайт.':'Enter a website URL.','Новая закладка':'New bookmark'
  });
  function tr(value) { return settings.language === 'en' ? (translations.en[value] || value) : value; }
  function applyLanguage() {
    const en = settings.language === 'en';
    document.documentElement.lang = en ? 'en' : 'ru';
    $('languageSelect').value = settings.language || 'ru';
    const ids = {settingsBtn:'⚙ Настройки',mainMenuBtn:'⌂ Главное меню',addTopBtn:'＋ Добавить ссылку',heroAddBtn:'＋ Добавить сайт',exploreBtn:'Исследовать каталог',searchInput:'Поиск сайтов...',emptyAddBtn:'＋ Добавить ссылку',closeSettingsBtn:'×',saveSettingsBtn:'Сохранить',resetSettingsBtn:'Сбросить',favoritesFilterBtn:$('favoritesFilterBtn').textContent.startsWith('★')?'★ Избранное':'☆ Избранное'};
    for (const [id,ru] of Object.entries(ids)) { const el=$(id); if(!el) continue; if(id==='searchInput'){el.placeholder=tr(ru);el.setAttribute('aria-label',tr(ru));} else el.textContent=tr(ru); }
    const staticTexts = [['.local-badge','Каталог ссылок'],['.eyebrow','ТВОЁ ПРОСТРАНСТВО В ИНТЕРНЕТЕ'],['.hero-copy h1','Все сайты.<br><span>В одном месте.</span>'],['.hero-copy>p','Собирай полезные ссылки, открывай новые сайты и создавай собственную коллекцию.'],['.stat-card:nth-child(1) div span','Сайтов в каталоге'],['.stat-card:nth-child(2) div span','Категорий'],['.stat-card:nth-child(3) div span','Возможностей'],['#emptyState h3','Ничего не найдено'],['#emptyState p','Попробуй изменить запрос или добавь сайт в каталог.'],['#settingsTitle','Настройки <span>стиля</span>']];
    staticTexts.forEach(([sel,ru])=>{const el=document.querySelector(sel);if(el)el.innerHTML=tr(ru);});
    const labels = {'[for="languageSelect"]':'Язык сайта / Website language','[for="densitySelect"]':'Размер карточек','[for="columnsSelect"]':'Количество колонок','[for="motionSelect"]':'Анимации','[for="glowSelect"]':'Неоновое свечение','[for="radiusSelect"]':'Скругление карточек','[for="backgroundSelect"]':'Эффект фона'};
    Object.entries(labels).forEach(([sel,ru])=>{const el=document.querySelector(sel);if(el)el.textContent=tr(ru);});
    document.querySelectorAll('.settings-dialog .eyebrow').forEach(el=>{if(el.textContent.includes('ВНЕШНИЙ')||el.textContent.includes('APPEARANCE'))el.textContent=tr('ВНЕШНИЙ ВИД');});
    const fieldLabels=[['label[for="siteName"]','Название сайта'],['label[for="siteUrl"]','Ссылка на сайт'],['label[for="siteCategory"]','Категория'],['label[for="siteDescription"]','Описание']];
    fieldLabels.forEach(([sel,ru])=>{const el=document.querySelector(sel);if(el){const star=el.querySelector('span');el.textContent=tr(ru)+' ';if(star)el.appendChild(star);}});
    const fieldHints=document.querySelector('.field-hint');if(fieldHints)fieldHints.textContent=tr('Можно вводить адрес с https:// или без него. Разрешены только веб-ссылки HTTP/HTTPS.');
    $('siteName').placeholder=tr('Например, Wikipedia');$('siteDescription').placeholder=tr('Коротко расскажи, чем полезен этот сайт...');
    $('cancelBtn').textContent=tr('Отмена');
    const sort=$('sortSelect'); if(sort){const opts=[['newest','Сначала новые'],['az','По названию A–Я'],['oldest','Сначала старые']];opts.forEach(([v,ru])=>{const o=sort.querySelector(`option[value="${v}"]`);if(o)o.textContent=tr(ru);});}
    const optionGroups=[['densitySelect',[['comfortable','Обычный'],['compact','Компактный']]],['columnsSelect',[['auto','Автоматически (3)'],['2','2 колонки'],['3','3 колонки'],['4','4 колонки'],['5','5 колонок'],['6','6 колонок'],['7','7 колонок'],['8','8 колонок'],['9','9 колонок'],['10','10 колонок']]],['motionSelect',[['on','Включены'],['off','Выключены']]],['glowSelect',[['medium','Среднее'],['low','Мягкое'],['high','Сильное'],['off','Выключено']]],['radiusSelect',[['soft','Мягкое'],['sharp','Угловатое'],['round','Сильно скруглённое']]],['backgroundSelect',[['aurora','Неоновая дымка'],['stars','Звёздная сетка'],['plain','Минимализм'],['grid','Кибер-сетка'],['gradient','Градиентный поток']]]];
    optionGroups.forEach(([id,opts])=>opts.forEach(([v,ru])=>{const o=$(id).querySelector(`option[value="${v}"]`);if(o)o.textContent=tr(ru);}));
    document.querySelectorAll('[data-theme-choice]').forEach(btn=>{const small=btn.querySelector('small');if(small){const map={neon:'Сине-фиолетовая',emerald:'Изумрудная',pink:'Розовая',ocean:'Морская синяя',sunset:'Оранжево-красная',gold:'Золотая',ice:'Ледяная голубая','aurora-glow':'Бирюзово-розовая',violet:'Глубокий фиолетовый',crimson:'Красный неон',mint:'Мятный и бирюзовый',lavender:'Лавандовый свет',matrix:'Кибер-зелёный',coffee:'Кофейный и бронзовый',light:'Светлый интерфейс',synthwave:'Ретро-неон'};small.textContent=tr(map[btn.dataset.themeChoice]||'');}});
    const catSelect=$('siteCategory'); if(catSelect) Array.from(catSelect.options).forEach(o=>{const original=o.dataset.ruLabel || o.textContent;if(!o.dataset.ruLabel)o.dataset.ruLabel=original;o.textContent=tr(original);});
    document.querySelectorAll('.float-chip b, .float-chip small, .footer>span').forEach(el=>{const original=el.dataset.ruLabel || el.textContent;if(!el.dataset.ruLabel)el.dataset.ruLabel=original;el.textContent=tr(original);});
    renderCategories();
  }
  function applySettings() {
    document.body.dataset.theme = settings.theme;
    applyLanguage();
    document.body.dataset.density = settings.density;
    document.body.dataset.motion = settings.motion;
    document.body.dataset.glow = settings.glow || 'medium';
    document.body.dataset.radius = settings.radius || 'soft';
    document.body.dataset.background = settings.background || 'aurora';
    document.documentElement.style.setProperty('--card-columns', settings.columns === 'auto' ? '3' : settings.columns);
    $('densitySelect').value = settings.density;
    $('columnsSelect').value = settings.columns;
    $('motionSelect').value = settings.motion;
    $('glowSelect').value = settings.glow || 'medium'; $('radiusSelect').value = settings.radius || 'soft'; $('backgroundSelect').value = settings.background || 'aurora';
    document.querySelectorAll('[data-theme-choice]').forEach(btn => btn.classList.toggle('active', btn.dataset.themeChoice === settings.theme));
  }
  function renderCategories() {
    const present = new Set(sites.map(s => s.category));
    const visible = categories.filter((c,i) => i === 0 || present.has(c));
    categoryRow.innerHTML = visible.map(c => `<button class="category-chip ${activeCategory===c?'active':''}" data-category="${escapeHTML(c)}" aria-pressed="${activeCategory===c}" type="button">${escapeHTML(tr(c))}${c==='Все сайты' ? ` <span>${sites.length}</span>` : ''}</button>`).join('');
  }
  function filteredSites() {
    const query = $('searchInput').value.trim().toLocaleLowerCase('ru');
    const result = sites.filter(s => {
      const matchesCategory = activeCategory === 'Все сайты' || s.category === activeCategory;
      return matchesCategory && (!favoritesOnly || s.favorite) && [s.name,s.url,s.description,s.category].join(' ').toLocaleLowerCase('ru').includes(query);
    });
    const sort = $('sortSelect').value;
    if (sort === 'az') result.sort((a,b) => a.name.localeCompare(b.name,'ru'));
    else if (sort === 'oldest') result.sort((a,b) => a.createdAt - b.createdAt);
    else result.sort((a,b) => b.createdAt - a.createdAt);
    return result;
  }
  function localizedSiteText(site) {
    if (settings.language !== 'en') return {description: site.description || 'Открой сайт, чтобы узнать больше.', category: site.category};
    const starterText = {
      'starter-chatgpt': {description: 'AI assistant for ideas, learning, writing, and programming.', category: 'AI & Tools'},
      'starter-youtube': {description: 'Videos, music, tutorials, and channels for every interest.', category: 'Entertainment'},
      'starter-wikipedia': {description: 'A free encyclopedia for finding information and exploring topics.', category: 'Learning'},
      'starter-github': {description: 'A platform for code hosting, collaboration, and software projects.', category: 'Work'},
      'starter-canva': {description: 'Create designs, presentations, posters, and publications.', category: 'Design'},
      'starter-crazygames': {description: 'A huge collection of browser games.', category: 'Games'}
    };
    if (starterText[site.id]) return starterText[site.id];
    return {description: site.description || 'Open this website to learn more.', category: site.category};
  }
  function render() {
    renderCategories();
    const result = filteredSites();
    $('statTotal').textContent = sites.length;
    $('statCategories').textContent = new Set(sites.map(s => s.category)).size;
    $('resultsCount').textContent = settings.language==='en' ? `${result.length} ${result.length===1?'website':'websites'}` : `${result.length} ${result.length === 1 ? 'сайт' : result.length >= 2 && result.length <= 4 ? 'сайта' : 'сайтов'}`;
    $('clearSearchBtn').hidden = !$('searchInput').value && activeCategory === 'Все сайты';
    $('emptyState').hidden = result.length !== 0;
    grid.hidden = result.length === 0;
    grid.innerHTML = result.map(s => {
      const localized = localizedSiteText(s);
      const icon = favicon(s.url), initial = escapeHTML((s.name.trim()[0] || '↗').toLocaleUpperCase('ru'));
      return `<article class="site-card" data-site-id="${escapeHTML(s.id)}">
        <div class="card-top"><div class="site-identity"><div class="site-favicon">${icon ? `<img src="${icon}" alt="" loading="lazy" referrerpolicy="no-referrer" onerror="this.outerHTML='${initial}'">` : initial}</div><div style="min-width:0"><h3 class="site-name" title="${escapeHTML(s.name)}">${escapeHTML(s.name)}</h3><div class="site-domain">${escapeHTML(hostname(s.url))}</div></div></div>
        <div class="card-menu"><button class="icon-button favorite-trigger" data-action="favorite" data-id="${escapeHTML(s.id)}" aria-label="${s.favorite?'Убрать из':'Добавить в'} избранное" title="Избранное" type="button">${s.favorite?'★':'☆'}</button><button class="icon-button menu-trigger" data-action="menu" data-id="${escapeHTML(s.id)}" aria-label="Действия для ${escapeHTML(s.name)}" aria-expanded="${openMenuId===s.id}" type="button">⋯</button>
        ${openMenuId===s.id ? `<div class="card-menu-pop"><button type="button" data-action="edit" data-id="${escapeHTML(s.id)}">✎ Изменить</button><button type="button" data-action="copy" data-id="${escapeHTML(s.id)}">⧉ Копировать URL</button><button type="button" class="danger" data-action="delete" data-id="${escapeHTML(s.id)}">× Удалить</button></div>` : ''}</div></div>
        <p class="site-description">${escapeHTML(localized.description)}</p>
        <div class="card-bottom"><span class="category-label">${escapeHTML(settings.language==='en' ? localized.category : s.category)}</span><a class="open-link" href="${escapeHTML(s.url)}" target="_blank" rel="noopener noreferrer"> ${escapeHTML(tr('Открыть сайт ↗'))}</a></div>
      </article>`;
    }).join('');
  }
  function openForm(site = null) {
    form.reset(); $('formError').hidden = true; $('formError').textContent = '';
    $('editId').value = site ? site.id : '';
    $('dialogEyebrow').textContent = tr(site ? 'РЕДАКТИРОВАНИЕ ЗАКЛАДКИ' : 'НОВАЯ ЗАКЛАДКА');
    $('dialogTitle').innerHTML = tr(site ? 'Изменить <span>сайт</span>' : 'Добавить <span>сайт</span>');
    $('saveBtn').textContent = tr(site ? 'Сохранить изменения' : 'Сохранить сайт');
    if (site) {
      $('siteName').value = site.name; $('siteUrl').value = site.url;
      $('siteCategory').value = categories.includes(site.category) && site.category !== 'Все сайты' ? site.category : 'Другое';
      $('siteDescription').value = site.description || '';
    } else $('siteCategory').value = 'ИИ и инструменты';
    if (!dialog.open) dialog.showModal();
    setTimeout(() => $('siteName').focus(), 50);
  }
  function closeForm() { if (dialog.open) dialog.close(); }
  function showError(message) { $('formError').textContent = message; $('formError').hidden = false; }
  form.addEventListener('submit', event => {
    event.preventDefault();
    const name = $('siteName').value.trim();
    if (!name) { showError('Введи название сайта.'); $('siteName').focus(); return; }
    let url;
    try { url = normalizeUrl($('siteUrl').value); } catch (error) { showError(error.message); $('siteUrl').focus(); return; }
    const id = $('editId').value;
    const duplicate = sites.find(s => s.url.replace(/\/$/,'').toLowerCase() === url.replace(/\/$/,'').toLowerCase() && s.id !== id);
    if (duplicate && !confirm(`Похожая ссылка уже есть у сайта «${duplicate.name}». Всё равно сохранить?`)) return;
    const existing = sites.find(s => s.id === id);
    const site = {id: id || (window.crypto && crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) + Math.random().toString(16).slice(2)),name,url,category:$('siteCategory').value,description:$('siteDescription').value.trim(),createdAt:existing ? existing.createdAt : Date.now()};
    const previous = sites;
    if (id) sites = sites.map(s => s.id === id ? site : s); else sites.push(site);
    if (!saveSites()) { sites = previous; return; }
    activeCategory = 'Все сайты'; $('searchInput').value = ''; closeForm(); render();
    showToast(id ? 'Изменения сохранены.' : 'Сайт добавлен в каталог.');
  });
  function getSite(id) { return sites.find(s => s.id === id); }
  categoryRow.addEventListener('click', e => {
    const btn = e.target.closest('[data-category]'); if (!btn) return;
    activeCategory = btn.dataset.category; openMenuId = null; render();
  });
  grid.addEventListener('click', async e => {
    const btn = e.target.closest('[data-action]'); if (!btn) return;
    const {action,id} = btn.dataset, site = getSite(id); if (!site) return;
    if (action === 'menu') { openMenuId = openMenuId === id ? null : id; render(); return; }
    if (action === 'favorite') { const prev=sites; sites=sites.map(x=>x.id===id?{...x,favorite:!x.favorite}:x); if(!saveSites()){sites=prev;} render(); showToast(site.favorite?'Удалено из избранного.':'Добавлено в избранное.'); return; }
    openMenuId = null;
    if (action === 'edit') openForm(site);
    if (action === 'copy') {
      try {
        if (navigator.clipboard && window.isSecureContext) await navigator.clipboard.writeText(site.url);
        else { const temp = document.createElement('textarea'); temp.value = site.url; temp.style.position='fixed'; temp.style.opacity='0'; document.body.appendChild(temp); temp.select(); const ok=document.execCommand('copy'); temp.remove(); if(!ok) throw new Error('copy failed'); }
        showToast('Ссылка скопирована.');
      } catch { showToast('Не удалось скопировать автоматически. Адрес: ' + site.url); }
      render();
    }
    if (action === 'delete') {
      if (!confirm(`Удалить «${site.name}» из каталога?`)) { render(); return; }
      const previous = sites; sites = sites.filter(s => s.id !== id);
      if (!saveSites()) { sites = previous; render(); return; }
      render(); showToast('Ссылка удалена.');
    }
  });
  $('searchInput').addEventListener('input', () => { openMenuId = null; render(); });
  $('sortSelect').addEventListener('change', render);
  $('clearSearchBtn').addEventListener('click', () => { $('searchInput').value = ''; activeCategory = 'Все сайты'; render(); $('searchInput').focus(); });
  ['addTopBtn','heroAddBtn','emptyAddBtn'].forEach(id => $(id).addEventListener('click', () => openForm()));
  $('closeDialogBtn').addEventListener('click', closeForm);
  $('cancelBtn').addEventListener('click', closeForm);
  dialog.addEventListener('click', e => { if (e.target === dialog) closeForm(); });
  $('exploreBtn').addEventListener('click', () => $('catalog').scrollIntoView({behavior:settings.motion==='off'?'auto':'smooth'}));
  $('mainMenuBtn').addEventListener('click', () => { activeCategory='Все сайты'; favoritesOnly=false; $('favoritesFilterBtn').classList.remove('active'); $('favoritesFilterBtn').setAttribute('aria-pressed','false'); $('searchInput').value=''; $('sortSelect').value='newest'; window.scrollTo({top:0,behavior:settings.motion==='off'?'auto':'smooth'}); render(); saveView(); });
  $('favoritesFilterBtn').addEventListener('click', () => { favoritesOnly=!favoritesOnly; $('favoritesFilterBtn').classList.toggle('active',favoritesOnly); $('favoritesFilterBtn').setAttribute('aria-pressed',String(favoritesOnly)); $('favoritesFilterBtn').textContent=favoritesOnly?'★ Избранное':'☆ Избранное'; activeCategory='Все сайты'; render(); saveView(); });
  $('languageSelect').addEventListener('change', () => { settings.language=$('languageSelect').value; saveSettings(); applySettings(); render(); showToast(settings.language==='en'?'Language changed to English.':'Язык изменён на русский.'); });
  $('settingsBtn').addEventListener('click', () => { applySettings(); if (!settingsDialog.open) settingsDialog.showModal(); });
  $('closeSettingsBtn').addEventListener('click', () => settingsDialog.close());
  $('saveSettingsBtn').addEventListener('click', () => { settings.density=$('densitySelect').value; settings.columns=$('columnsSelect').value; settings.motion=$('motionSelect').value; settings.glow=$('glowSelect').value; settings.radius=$('radiusSelect').value; settings.background=$('backgroundSelect').value; applySettings(); saveSettings(); settingsDialog.close(); render(); showToast('Настройки автоматически сохранены.'); });
  document.querySelectorAll('[data-theme-choice]').forEach(btn => btn.addEventListener('click', () => { settings.theme=btn.dataset.themeChoice; applySettings(); saveSettings(); }));
  $('densitySelect').addEventListener('change', () => { settings.density=$('densitySelect').value; applySettings(); saveSettings(); });
  $('columnsSelect').addEventListener('change', () => { settings.columns=$('columnsSelect').value; applySettings(); saveSettings(); });
  $('motionSelect').addEventListener('change', () => { settings.motion=$('motionSelect').value; settings.glow=$('glowSelect').value; settings.radius=$('radiusSelect').value; settings.background=$('backgroundSelect').value; applySettings(); saveSettings(); });
  $('resetSettingsBtn').addEventListener('click', () => { settings={...defaultSettings}; applySettings(); saveSettings(); render(); showToast('Настройки сброшены и сохранены.'); });
  settingsDialog.addEventListener('click', e => { if (e.target === settingsDialog) settingsDialog.close(); });
  document.addEventListener('click', e => { if (openMenuId && !e.target.closest('.card-menu')) { openMenuId = null; render(); } });
  document.addEventListener('keydown', e => {
    if (e.key === '/' && !dialog.open && !settingsDialog.open && !['INPUT','TEXTAREA','SELECT'].includes(document.activeElement.tagName)) { e.preventDefault(); $('searchInput').focus(); }
    if (e.key === 'Escape' && !dialog.open && !settingsDialog.open && openMenuId) { openMenuId = null; render(); }
  });
  if (categories.includes(savedView.category)) activeCategory = savedView.category;
  if (typeof savedView.query === 'string') $('searchInput').value = savedView.query;
  if (['newest','oldest','az'].includes(savedView.sort)) $('sortSelect').value = savedView.sort;
  $('searchInput').addEventListener('input', () => { saveView(); });
  $('sortSelect').addEventListener('change', saveView);
  categoryRow.addEventListener('click', e => { if (e.target.closest('[data-category]')) saveView(); });
  applySettings();
  render();
})();