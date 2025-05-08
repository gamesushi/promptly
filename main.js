// 默认语言设置
let currentLanguage = 'zh-CN';

// 加载语言数据
function loadLanguageData(lang) {
  const script = document.createElement('script');
  script.src = `${lang}data.js`;
  document.head.appendChild(script);
}

// 切换语言
function changeLanguage(lang) {
  currentLanguage = lang;
  loadLanguageData(lang);
  updateUI();
}

// 更新界面文本
function updateUI() {
  const i18n = window.I18N[currentLanguage];
  document.querySelector('.title').textContent = i18n.title;
  document.querySelector('.search-input').placeholder = i18n.searchPlaceholder;
  document.querySelector('.copy-button').textContent = i18n.copy;
  document.querySelector('.credits-button').textContent = i18n.credits;
  document.querySelector('.settings-button').textContent = i18n.settings;
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
  // 加载默认语言
  loadLanguageData(currentLanguage);
  
  // 添加语言选择器
  const settingsPanel = document.querySelector('.settings-panel');
  const languageSelect = document.createElement('select');
  languageSelect.className = 'language-select';
  
  const i18n = window.I18N[currentLanguage];
  Object.entries(i18n.languages).forEach(([code, name]) => {
    const option = document.createElement('option');
    option.value = code;
    option.textContent = name;
    if (code === currentLanguage) {
      option.selected = true;
    }
    languageSelect.appendChild(option);
  });
  
  languageSelect.addEventListener('change', (e) => {
    changeLanguage(e.target.value);
  });
  
  const languageLabel = document.createElement('label');
  languageLabel.textContent = i18n.language;
  languageLabel.appendChild(languageSelect);
  settingsPanel.appendChild(languageLabel);
  
  // 初始化界面
  updateUI();
}); 