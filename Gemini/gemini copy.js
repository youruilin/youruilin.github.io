  function initGeminiAiSummary() {
    const unFinishFlag = 'data-code-input';
    const lastUnFinishCode = new RegExp(`<code\\s${unFinishFlag}="">(.*?)<\\/code>`);
    const parseCodeString = (content, contentElement, needEscape) => {
      let replaceEscapeString = needEscape
        ? content
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#39;')
        : content;

      const codeSymbol = '`';
      let result = '';
      let codeContent = '';
      let isInCode = false;

      const fullContent = contentElement.innerHTML;
      const hasUnFinishCode = fullContent.includes(unFinishFlag);
      // 处理未结束的 code
      if (hasUnFinishCode) {
        const codeEndIndex = replaceEscapeString.indexOf(codeSymbol);
        // 说明当前 string 仍没有 end
        if (codeEndIndex < 0) {
          contentElement.innerHTML = fullContent.replace(
            lastUnFinishCode,
            `<code ${unFinishFlag}>$1${replaceEscapeString}</code>`,
          );
          return '';
        }

        contentElement.innerHTML = fullContent.replace(
          lastUnFinishCode,
          `<code>$1${replaceEscapeString.slice(0, codeEndIndex)}</code>`,
        );

        replaceEscapeString = replaceEscapeString.slice(codeEndIndex + 1);

        if (!replaceEscapeString) {
          return '';
        }
      }

      /**
       * 处理剩下 code
       * 将字符串中符合条件的 code 内容，先储存，等遇到完整的 `` 的符号后再设置为标签
       * 通过 isInCode 变量作为 flag，每次遇到 ` 符号时取反，默认 false
       * 后面根据 isInCode 当前字符是否为 code 内容，再存储至 codeContent 变量中
       *
       * 若循环结束 isInCode 仍为 true，说明后面还有剩余的 code 内容，通过给 code 增加标签来处理
       */
      for (let i = 0; i < replaceEscapeString.length; i += 1) {
        const str = replaceEscapeString[i];
        if (str === codeSymbol) {
          if (isInCode) {
            // end code
            result += `<code>${codeContent}</code>`;
          }

          codeContent = '';
          isInCode = !isInCode;
        } else if (isInCode) {
          codeContent += str;
        } else {
          result += str;
        }
      }

      // code 仍剩余
      if (isInCode) {
        result += `<code ${unFinishFlag}>${codeContent}</code>`;
      }

      return result;
    };

    const geminiAiTextQueue = [];
    const geminiAiTextLimit = () => Math.max(Math.round(Math.random() * 3), 1);

    const fakeAiTypedInput = async (text, element) => {
      return new Promise(async (resolve) => {
        if (text.length) {
          geminiAiTextQueue.push(text);
        }
        if (geminiAiTextQueue.length === 0) {
          resolve();
          return;
        }
        const paragraph = geminiAiTextQueue.shift();

        const typeIn = async (textContent, index = 0) => {
          if (!textContent.length || index >= textContent.length) {
            await new Promise(async (resolveContent) => {
              // element.innerHTML = parseCodeString(element.innerHTML, element);
              setTimeout(resolveContent);
            });
            resolve();
            // fakeAiTypedInput('', element);
            return;
          }
          // element.textContent += String(textContent).charAt(index);
          const slicedContent = String(textContent).slice(index, index + geminiAiTextLimit());

          const nextContent = parseCodeString(slicedContent, element);
          if (nextContent) {
            element.innerHTML += nextContent;
          }
          setTimeout(() => {
            requestAnimationFrame(() => {
              typeIn(textContent, index + slicedContent.length);
            });
          }, 50);
        };

        typeIn(paragraph);
      });
    };

    let postAI = document.querySelector('.post-gemini-ai');
    let postTile = document.querySelector('.post-title')?.textContent;

    postAI.addEventListener('click', geminiAI);

    async function geminiAI() {
      const postAiTrigger = document.querySelector('.ai-summary-trigger');

      // 插入新的 HTML 结构
      postAI.insertAdjacentHTML(
        'afterend',
        '<div class="post-gemini-ai-result-wrap"><div class="ai-title"><a class="ai-title-left" href="/" title="查看详情" data-pjax-state><i class="iconfont icon-jiqiren ai-title-icon"></i><div class="ai-title-text">文章摘要</div><div class="ai-link"><i class="fas fa-chevron-right ai-link-icon"></i></div></a><div class="ai-tag">IoGPT</div></div><div class="ai-explanation"><p class="post-gemini-ai-result"></p><span class="ai-typed-cursor">|</span></div><div class="ai-bottom"><div class="ai-tips">此内容根据文章内容由ai生成，仅用于对文章内容的概括和参考。</div></div></div>',
      );
      postAI.classList.add('post-gemini-noclick');
      let GeminiFetch = 'https://article-zhaiyao.youruilin.workers.dev/v1/chat/completions';
      try {
        let postAIResult = document.querySelector('.post-gemini-ai-result');
        let input = document.querySelector('.post-content').innerText;
        const postToc = document.querySelector('.toc-content');
        const updateTimeEl = document.querySelector('.post-meta-date-updated');
        const updateTime = Date.parse(updateTimeEl.getAttribute('datetime'));

        // 修改 trigger style
        postAiTrigger.classList.add('ai-summary-active');

        let inputContent = input
          .replace(/\n/g, '')
          .replace(/[ ]+/g, ' ')
          .replace(/<pre>[\s\S]*?<\/pre>/g, '')
          // max-token
          .substring(0, 300);
        let toAI = `文章标题：${postTile}；文章目录：${postToc?.textContent}；具体内容：${inputContent}`;
        const res = await fetch(GeminiFetch, {
          headers: {
           'X-Ca-Nonce': window.crypto.randomUUID()
          },
          method: 'POST',
          body: JSON.stringify({
            model: 'gpt-4o',
            messages: [
              {
                role: 'system',
                content: "You are a highly skilled AI trained in language comprehension and summarization. I would like you to read the text delimited by triple quotes and summarize it into a concise abstract paragraph. Aim to retain the most important points, providing a coherent and readable summary that could help a person understand the main points of the discussion without needing to read the entire text. Please avoid unnecessary details or tangential points. Only give me the output and nothing else. Do not wrap responses in quotes. Respond in the Japanese language.",
              },
              { role: 'user', content: toAI },
            ],
            temperature: 0.7,
            stream: true,
            updateTime,
            title: postTile,
          }),
        });

        if (!res.ok) {
          // 抛出错误，以便在 catch 块中捕获
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        const reader = res.body.getReader();
        while (true) {
          const { value, done } = await reader.read();
          if (done) {
            break;
          }
          const text = new TextDecoder().decode(value);
          const strList = text.split('\n').filter(Boolean);

          const str = strList.reduce((acc, currentValue) => {
            if (currentValue.includes('DONE')) {
              return acc;
            }
            const nextStr = JSON.parse(currentValue.substring(6))?.choices[0].delta.content;
            if (!nextStr) {
              return acc;
            }
            return `${acc}${nextStr}`;
          }, '');

          await fakeAiTypedInput(str, postAIResult);
        }
      } catch (error) {
        document.querySelector('.post-gemini-ai-result-wrap').remove();
        console.log(error);

        // 恢复 trigger style
        postAiTrigger.classList.remove('ai-summary-active');
      }
    }
    
  }

initGeminiAiSummary();
