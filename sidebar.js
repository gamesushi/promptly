const examples = window.GPT4O_EXAMPLES || [];
const list = document.getElementById('examples-list');

// 美化样式
const style = document.createElement('style');
style.innerHTML = `
#examples-list {
  background: var(--sidebar-bg, #f7f7f8);
  border-radius: 16px;
  box-shadow: 0 2px 16px 0 rgba(0,0,0,0.08);
  padding: 12px 0 0 0;
  margin: 0;
  min-height: 100vh;
}
.example-block {
  background: #fff;
  border-radius: 12px;
  margin: 0 12px 18px 12px;
  box-shadow: 0 1px 4px 0 rgba(0,0,0,0.04);
  padding: 16px 12px 12px 12px;
  transition: box-shadow 0.2s;
}
.example-block:hover {
  box-shadow: 0 4px 16px 0 rgba(0,0,0,0.10);
}
.prompt-text {
  font-size: 14px;
  color: #444;
  background: #f3f3f5;
  border-radius: 6px;
  padding: 8px 12px;
  margin-bottom: 8px;
  word-break: break-all;
}
.copy-btn {
  color: #6b7280;
  background: #fff; /* 改为白色 */
  border: none;
  border-radius: 6px;
  padding: 4px 12px;
  font-size: 13px;
  cursor: pointer;
  transition: background 0.2s;
  margin-left: 8px;
}
.copy-btn:hover {
  background: #e5e7eb;
  color: #111;
}
input.sidebar-search {
  width: 90%;
  margin: 16px 5% 12px 5%;
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  font-size: 15px;
  background: #fff;
  outline: none;
  transition: border 0.2s;
}
input.sidebar-search:focus {
  border: 1.5px solid #a3a3a3;
}
`;
document.head.appendChild(style);

// 新增：创建搜索框并插入到顶部
const searchWrapper = document.createElement('div');
const searchInput = document.createElement('input');
searchInput.type = 'text';
searchInput.placeholder = '搜索关键词...';
searchInput.className = 'sidebar-search';
searchWrapper.appendChild(searchInput);
list.parentNode.insertBefore(searchWrapper, list);

// 默认语言设置
let currentLanguage = 'zh-CN';
let currentExamples = [];

// 加载语言数据
function loadLanguageData(lang) {
  return new Promise((resolve, reject) => {
    // 移除之前加载的数据文件
    const oldScripts = document.querySelectorAll('script[data-lang]');
    oldScripts.forEach(script => script.remove());
    
    // 加载新的数据文件
    const script = document.createElement('script');
    // 修改文件路径格式
    const fileName = lang.replace('-', '') + 'data.js';
    script.src = chrome.runtime.getURL(fileName);
    script.setAttribute('data-lang', lang);
    script.onload = () => {
      // 数据加载完成后更新当前示例
      currentExamples = window.GPT4O_EXAMPLES || [];
      console.log(`Loaded ${lang} data:`, currentExamples.length, 'examples');
      // 更新UI
      updateUI();
      renderExamples(searchInput.value);
      resolve();
    };
    script.onerror = (error) => {
      console.error(`Failed to load ${lang} data:`, error);
      // 如果加载失败，使用空数组作为默认值
      currentExamples = [];
      updateUI();
      renderExamples(searchInput.value);
      resolve(); // 仍然resolve，但使用空数据
    };
    document.head.appendChild(script);
  });
}

// 切换语言
function changeLanguage(lang) {
  console.log('Changing language to:', lang);
  currentLanguage = lang;
  loadLanguageData(lang).catch(error => {
    console.error('Failed to change language:', error);
  });
}

// 渲染函数，支持传入搜索关键词
function renderExamples(keyword = '') {
  // 使用当前语言的数据，确保有默认值
  const examples = currentExamples || [];
  console.log('Rendering examples for language:', currentLanguage, 'count:', examples.length);
  
  let filtered = [];
  let rest = [];
  if (keyword.trim()) {
    const lower = keyword.trim().toLowerCase();
    filtered = examples.filter(item =>
      (item.name && item.name.toLowerCase().includes(lower)) ||
      (item.prompt && item.prompt.toLowerCase().includes(lower))
    );
    rest = examples.filter(item => !filtered.includes(item));
  } else {
    filtered = examples;
    rest = [];
  }
  const showList = [...filtered, ...rest];

  if (!showList.length) {
    list.innerHTML = `<p style="padding:24px;text-align:center;color:#aaa;">${window.I18N[currentLanguage].noExamples}</p>`;
    return;
  }
  
  list.innerHTML = '';
  showList.forEach((item, idx) => {
    const block = document.createElement('div');
    block.className = 'example-block';

    // 名称（标题，点击可折叠/展开）
    const title = document.createElement('div');
    title.style.fontWeight = 'bold';
    title.style.fontSize = '16px';
    title.style.marginBottom = '6px';
    title.style.cursor = 'pointer';
    title.style.display = 'flex';
    title.style.alignItems = 'center';
    title.textContent = item.name;
    // 微缩图像
    const thumb = document.createElement('img');
    if (/^https?:\/\//i.test(item.image)) {
      thumb.src = item.image;
    } else {
      thumb.src = chrome.runtime.getURL(item.image);
    }
    thumb.alt = item.alt;
    thumb.title = item.name;
    thumb.style.height = '24px';
    thumb.style.width = 'auto';
    thumb.style.marginLeft = 'auto';
    thumb.style.borderRadius = '4px';
    thumb.style.objectFit = 'cover';
    thumb.style.maxWidth = '48px';
    thumb.style.maxHeight = '32px';

    // 只插入文本和图片
    const titleText = document.createElement('span');
    title.appendChild(titleText);
    title.appendChild(thumb);

    // 折叠内容容器
    const content = document.createElement('div');
    content.className = 'example-content';
    content.style.display = 'none';
    content.style.transition = 'all 0.2s';

    // 图片容器
    const imgWrapper = document.createElement('div');
    imgWrapper.style.position = 'relative';
    imgWrapper.style.display = 'inline-block';

    // 图片
    const img = document.createElement('img');
    if (/^https?:\/\//i.test(item.image)) {
      img.src = item.image;
    } else {
      img.src = chrome.runtime.getURL(item.image);
    }
    img.alt = item.alt;
    img.title = item.name;
    img.style.display = 'block';
    img.style.margin = '0 auto 10px auto';
    img.style.maxWidth = '100%';
    img.style.borderRadius = '8px';
    imgWrapper.appendChild(img);

    // 提示词容器
    const promptWrapper = document.createElement('div');
    promptWrapper.style.position = 'relative';

    // 提示词
    const prompt = document.createElement('div');
    prompt.className = 'prompt-text';
    prompt.textContent = item.prompt;

    // 提示词copy按钮
    const promptCopyBtn = document.createElement('button');
    promptCopyBtn.textContent = 'copy';
    promptCopyBtn.className = 'copy-btn';
    promptCopyBtn.style.position = 'absolute';
    promptCopyBtn.style.right = '8px';
    promptCopyBtn.style.bottom = '8px';
    promptCopyBtn.style.marginLeft = '0';
    promptCopyBtn.onclick = (e) => {
      e.stopPropagation();
      window.parent.postMessage({ type: 'copy_to_clipboard', text: item.prompt }, '*');
      promptCopyBtn.textContent = '已复制';
      setTimeout(() => { promptCopyBtn.textContent = 'copy'; }, 1000);
    };

    promptWrapper.appendChild(prompt);
    promptWrapper.appendChild(promptCopyBtn);

    // 内容部分组装
    content.appendChild(imgWrapper);
    content.appendChild(promptWrapper);

    // 点击标题展开/收起
    title.addEventListener('click', function() {
      if (content.style.display === 'none') {
        content.style.display = 'block';
      } else {
        content.style.display = 'none';
      }
    });

    block.appendChild(title);
    block.appendChild(content);

    list.appendChild(block);
  });
}

// 初始渲染
renderExamples();

// 监听搜索输入
searchInput.addEventListener('input', function() {
  renderExamples(this.value);
});


// 新增：创建顶部栏和设置按钮
const topBar = document.createElement('div');
topBar.style.display = 'flex';
topBar.style.justifyContent = 'space-between';
topBar.style.alignItems = 'center';
topBar.style.padding = '0 16px 0 16px';
topBar.style.height = '48px';

const topBarTitle = document.createElement('div');
topBarTitle.textContent = '示例列表';
topBarTitle.style.fontWeight = 'bold';
topBarTitle.style.fontSize = '18px';

const settingsBtn = document.createElement('button');
settingsBtn.innerHTML = '<img src="img/setting.svg" alt="设置" style="width:22px;height:22px;vertical-align:middle;">';
settingsBtn.title = '设置';
settingsBtn.style.background = 'none';
settingsBtn.style.border = 'none';
settingsBtn.style.cursor = 'pointer';
settingsBtn.style.fontSize = '20px';
settingsBtn.style.padding = '4px';

topBar.appendChild(topBarTitle);
topBar.appendChild(settingsBtn);

// 插入顶部栏到 sidebar
list.parentNode.insertBefore(topBar, searchWrapper);

// 新增：设置页面DOM
const settingsPage = document.createElement('div');
settingsPage.style.display = 'none';
settingsPage.style.padding = '0';
settingsPage.style.height = '100vh';
settingsPage.style.background = 'var(--sidebar-bg, #f7f7f8)';
settingsPage.style.borderRadius = '16px';
settingsPage.style.boxShadow = '0 2px 16px 0 rgba(0,0,0,0.08)';
settingsPage.style.overflowY = 'auto';

settingsPage.innerHTML = `
  <div style="padding:32px 24px 24px 24px;">
    <div style="margin-top:32px;text-align:center;">
      <button id="credits-btn" class="copy-btn" style="margin:0 auto;display:inline-block;float:none;position:relative;font-size:16px;">
        Credits
      </button>
      <div id="credits-list" style="display:none;margin-top:28px;background:#fff;border-radius:12px;box-shadow:0 1px 8px 0 rgba(0,0,0,0.06);padding:24px 18px;">
        <!-- 动态填充 -->
      </div>
    </div>
    <div style="margin-top:40px;color:#888;font-size:14px;text-align:center;">
    更多功能敬请期待</div>
  </div>
`;
// 插入设置页面到 sidebar
list.parentNode.insertBefore(settingsPage, list);

// 设置按钮/返回按钮点击事件
settingsBtn.onclick = function() {
  if (settingsPage.style.display === 'none') {
    // 进入设置页
    list.style.display = 'none';
    searchWrapper.style.display = 'none';
    settingsPage.style.display = 'block';
    topBarTitle.textContent = window.I18N[currentLanguage].settings;
    settingsBtn.innerHTML = '←';
    settingsBtn.title = '返回';
    settingsBtn.style.fontSize = '22px';
    
    // 检查是否已存在语言选择器
    let languageSection = settingsPage.querySelector('.language-section');
    if (!languageSection) {
      // 创建语言选择器
      languageSection = document.createElement('div');
      languageSection.className = 'language-section';
      languageSection.style.margin = '24px 0';
      languageSection.style.padding = '0 24px';
      
      const languageLabel = document.createElement('label');
      languageLabel.textContent = window.I18N[currentLanguage].language;
      languageLabel.style.display = 'block';
      languageLabel.style.marginBottom = '8px';
      languageLabel.style.fontWeight = 'bold';
      
      const languageSelect = document.createElement('select');
      languageSelect.className = 'language-select';
      languageSelect.style.width = '100%';
      languageSelect.style.padding = '8px';
      languageSelect.style.borderRadius = '4px';
      languageSelect.style.border = '1px solid #e5e7eb';
      languageSelect.style.backgroundColor = '#fff';
      
      Object.entries(window.I18N[currentLanguage].languages).forEach(([code, name]) => {
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
        // 更新设置页面的文本
        topBarTitle.textContent = window.I18N[currentLanguage].settings;
        languageLabel.textContent = window.I18N[currentLanguage].language;
      });
      
      languageSection.appendChild(languageLabel);
      languageSection.appendChild(languageSelect);
      
      // 将语言选择器插入到设置页面的顶部
      const settingsContent = settingsPage.querySelector('div');
      settingsContent.insertBefore(languageSection, settingsContent.firstChild);
    } else {
      // 更新现有语言选择器的状态
      const languageSelect = languageSection.querySelector('select');
      const languageLabel = languageSection.querySelector('label');
      languageLabel.textContent = window.I18N[currentLanguage].language;
      
      // 更新选择器的选中项
      Array.from(languageSelect.options).forEach(option => {
        option.selected = option.value === currentLanguage;
      });
    }
    
    // 每次进入设置页时隐藏 credits-list
    const creditsDiv = settingsPage.querySelector('#credits-list');
    if (creditsDiv) creditsDiv.style.display = 'none';
  } else {
    // 返回主列表
    list.style.display = '';
    searchWrapper.style.display = '';
    settingsPage.style.display = 'none';
    topBarTitle.textContent = '示例列表';
    settingsBtn.innerHTML = '<img src="img/setting.svg" alt="设置" style="width:22px;height:22px;vertical-align:middle;">';
    settingsBtn.title = '设置';
    settingsBtn.style.fontSize = '20px';
  }
};

// Credits按钮点击事件
settingsPage.querySelector('#credits-btn').onclick = function() {
  const creditsDiv = settingsPage.querySelector('#credits-list');
  if (creditsDiv.style.display === 'none') {
    creditsDiv.style.display = 'block';
    creditsDiv.innerHTML = `<h3 style="font-size:16px;font-weight:bold;color:#222;margin-bottom:18px;text-align:center;">贡献者名单</h3>`;
    if (window.GPT4O_CREDITS && window.GPT4O_CREDITS.length) {
      window.GPT4O_CREDITS.forEach(item => {
        // 创建类似 example-block 的卡片
        const block = document.createElement('div');
        block.className = 'example-block';
        block.style.margin = '12px 0';
        block.style.padding = '14px 18px';
        block.style.borderRadius = '10px';
        block.style.background = '#f9f9f9';
        block.style.boxShadow = '0 1px 4px 0 rgba(0,0,0,0.04)';
        block.style.display = 'flex';
        block.style.alignItems = 'center';
        block.style.fontSize = '16px'; // 与标题一致

        // 贡献者名称和链接
        const name = document.createElement('a');
        name.href = item.url;
        name.target = '_blank';
        name.textContent = item.name;
        name.style.color = '#888'; // 灰色
        name.style.textDecoration = 'none';
        name.style.fontWeight = 'bold';
        name.style.flex = '1';

        block.appendChild(name);
        creditsDiv.appendChild(block);
      });
    }
    // 删除"完整名单及说明请见 README 致谢"字段
  } else {
    creditsDiv.style.display = 'none';
  }
};

// 新增：折叠按钮点击事件
const toggleBtn = document.getElementById('toggle-sidebar');
const sidebarRoot = document.getElementById('sidebar-root');

toggleBtn.addEventListener('click', function() {
  sidebarRoot.classList.toggle('collapsed');
  if (sidebarRoot.classList.contains('collapsed')) {
    toggleBtn.textContent = '◀';
    toggleBtn.style.right = '0';
  } else {
    toggleBtn.textContent = '▶';
    toggleBtn.style.right = '320px';
  }
});

// 更新界面文本
function updateUI() {
  const i18n = window.I18N[currentLanguage];
  // 更新标题
  document.querySelector('h2').textContent = i18n.title;
  // 更新搜索框占位符
  document.querySelector('.sidebar-search').placeholder = i18n.searchPlaceholder;
  // 更新Credits按钮文本
  document.querySelector('#credits-btn').textContent = i18n.credits;
  // 更新顶部栏标题
  topBarTitle.textContent = i18n.exampleList;
  // 更新设置按钮标题
  settingsBtn.title = i18n.settings;
  
  // 更新语言选择器
  const languageSection = settingsPage.querySelector('.language-section');
  if (languageSection) {
    const languageLabel = languageSection.querySelector('label');
    const languageSelect = languageSection.querySelector('select');
    languageLabel.textContent = i18n.language;
    
    // 更新选择器的选中项
    Array.from(languageSelect.options).forEach(option => {
      option.selected = option.value === currentLanguage;
    });
  }
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
  // 加载默认语言
  loadLanguageData(currentLanguage).catch(error => {
    console.error('Failed to load initial language data:', error);
  });
});
