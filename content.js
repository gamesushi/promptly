(function() {
  function injectSidebar() {
    if (document.getElementById('awesome-gpt4o-sidebar')) return;
    
    const sidebar = document.createElement('div');
    sidebar.id = 'awesome-gpt4o-sidebar';
    sidebar.style.position = 'fixed';
    sidebar.style.top = '0';
    sidebar.style.right = '0';
    sidebar.style.width = '380px';
    sidebar.style.height = '100vh';
    sidebar.style.zIndex = '999999';
    sidebar.style.border = 'none';
    sidebar.style.background = 'transparent';
    sidebar.style.boxShadow = 'none';
    sidebar.style.overflow = 'hidden';
    sidebar.style.pointerEvents = 'none';
    
    // 创建 iframe 来加载 sidebar.html
    const iframe = document.createElement('iframe');
    iframe.src = chrome.runtime.getURL('sidebar.html');
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.style.border = 'none';
    iframe.style.background = 'transparent';
    iframe.style.pointerEvents = 'auto';
    sidebar.appendChild(iframe);
    
    document.body.appendChild(sidebar);
  }

  // 首次注入
  injectSidebar();

  // 定时检测 sidebar 是否被移除
  setInterval(injectSidebar, 1500);

  // 监听 sidebar 发送的消息，将提示词填入 ChatGPT 输入框
  window.addEventListener('message', function(event) {
    if (event.data && event.data.prompt) {
      // 优先查找 textarea
      let textarea = document.querySelector('textarea');
      if (textarea) {
        textarea.value = event.data.prompt;
        textarea.dispatchEvent(new Event('input', { bubbles: true }));
        textarea.focus();
      } else {
        // 精确查找新版ChatGPT输入框
        let prosemirrorDiv = document.querySelector('#prompt-textarea.ProseMirror[contenteditable="true"]');
        if (prosemirrorDiv) {
          prosemirrorDiv.focus();
          // 清空内容
          prosemirrorDiv.innerHTML = '';
          // 插入提示词（支持多行）
          event.data.prompt.split('\n').forEach((line, idx, arr) => {
            document.execCommand('insertText', false, line);
            if (idx < arr.length - 1) {
              document.execCommand('insertParagraph');
            }
          });
        } else {
          // 兼容其它 contenteditable
          let editableDiv = document.querySelector('[contenteditable="true"]');
          if (editableDiv) {
            editableDiv.focus();
            editableDiv.innerHTML = '';
            document.execCommand('insertText', false, event.data.prompt);
          }
        }
      }
    } else if (event.data && event.data.type === 'copy_to_clipboard') {
      const url = event.data.text;
      if (/^chrome-extension:\/\//.test(url) && /\.(png|jpg|jpeg|gif|webp)$/i.test(url)) {
        fetch(url)
          .then(res => res.blob())
          .then(blob => {
            if (blob.type === 'image/jpeg' || blob.type === 'image/jpg') {
              const img = new Image();
              img.src = URL.createObjectURL(blob);
              img.onload = function() {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);
                canvas.toBlob(function(pngBlob) {
                  const item = new ClipboardItem({ 'image/png': pngBlob });
                  navigator.clipboard.write([item]);
                }, 'image/png');
              };
            } else {
              const type = blob.type || 'image/png';
              const item = new ClipboardItem({ [type]: blob });
              navigator.clipboard.write([item]);
            }
          });
      } else {
        navigator.clipboard.writeText(event.data.text);
      }
    }
  }, false);
})();