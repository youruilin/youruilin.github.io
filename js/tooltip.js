function applyTooltip() {
  // 获取 .content 下的所有元素，排除 .tabs 标签
  const allElements = document.querySelectorAll(".content *");
  const filteredElements = Array.from(allElements).filter(el => {
    const foldingTag = el.closest(".folding-tag"); // 检查是否有最近的 .folding-tag
    const isInsideTabs = foldingTag && foldingTag.querySelector(".content .tabs"); // 是否在 .tabs 内
    const isFigure = foldingTag && foldingTag.querySelector(".content figure"); // 是否在 .content 内的 <figure> 中
    return !(isInsideTabs || isFigure); // 排除在 .tabs 或 .figure 内的元素
  });

  filteredElements.forEach(tag => {
    // 匹配成对的全角或半角括号（包括新增的《》和「」），并确保括号内部内容包含唯一的 ｜、| 或 ・（全角和半角的都匹配）
    tag.innerHTML = tag.innerHTML.replace(
      /(?:［|【|\[|《|「|｢)([^［【\[《「｢］】\]》」｣]*?[｜\|・][^［【\[《「｢］】\]》」｣]*?)(?:］|】|\]|》|」|｣)/g,
      function (match, content) {
        // 校验是否包含合法的分隔符 ｜ 或 | 或 ・（全角和半角）
        if ((content.match(/[｜\|・]/g) || []).length === 1) {
          const parts = content.split(/[｜\|・]/); // 按全角或半角 | 或 ・ 分割
          if (parts.length === 2 && parts[0].trim() && parts[1].trim()) {
            return `<span class="tooltip" data-tooltip="${parts[1].trim()}">${parts[0].trim()}</span>`;
          }
        }
        // 若括号内容不符合格式要求，返回原内容
        return match;
      }
    );
  });


  // 获取 .post-content 下的所有元素，排除特定标签
  const articleElements = document.querySelectorAll(".post-content *");

  const allFilteredElements = Array.from(articleElements).filter(el => {
    const foldingTag = el.closest(".folding-tag");
    const isInsideTabs = foldingTag && foldingTag.querySelector(".content .tabs");
    const isFigure = foldingTag && foldingTag.querySelector(".content figure");

    // 排除 .post-content 中的 figure 标签
    const isInsidePostContentFigure = el.closest(".post-content").querySelector("figure");

    // 返回排除掉不符合条件的元素
    return !(isInsideTabs || isFigure || isInsidePostContentFigure);
  });


  // 在所有符合条件的元素中执行替换高亮的逻辑
  allFilteredElements.forEach(tag => {
    tag.innerHTML = tag.innerHTML.replace(
      /（（([\s\S]*?)））/g, // 匹配【】中的内容（包括换行符）
      function (match, content) {
        return `<span class="highlight-text">${content}</span>`;
      }
    );
  });

  


  // 判断是否是移动端
const isMobile = window.matchMedia("(max-width: 768px)").matches;

// 给所有生成的 .tooltip 元素添加悬停事件
const tooltips = document.querySelectorAll(".tooltip");

tooltips.forEach(tooltip => {
  const text = tooltip.getAttribute("data-tooltip");
  if (text) {
    let hideTimeout; // 定义定时器

    tooltip.addEventListener("mouseenter", () => {
      // 创建悬浮提示框
      const tooltipDiv = document.createElement("div");
      tooltipDiv.className = "tooltip-popup";
      tooltipDiv.innerHTML = text;
      document.body.appendChild(tooltipDiv);

      // 获取页面宽度，调整每行容纳的字数
      const screenWidth = window.innerWidth;
      const padding = 20; // 设定一个适当的内边距
      const maxTooltipWidth = screenWidth * 0.3; // 最大悬浮框宽度为页面宽度的30%
      const charCount = text.replace(/<\/?[^>]+(>|$)/g, "").length; // 去掉标签后计算字符数
      const baseWidth = 200; // 每行的基础宽度，可根据需要调整

      // 动态计算宽度
      let tooltipWidth = Math.min(maxTooltipWidth, baseWidth + (charCount * 16)); // 16px是每个字符的宽度，可根据字体调整
      tooltipDiv.style.maxWidth = `${tooltipWidth}px`;

      // 定位悬浮提示框
      const tooltipRect = tooltip.getBoundingClientRect();
      tooltipDiv.style.position = "absolute";
      tooltipDiv.style.left = `${tooltipRect.left + window.scrollX}px`;
      tooltipDiv.style.top = `${tooltipRect.top + window.scrollY - tooltipDiv.offsetHeight - 20}px`;

      // 设置样式
      tooltipDiv.style.padding = "5px 10px";
      tooltipDiv.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
      tooltipDiv.style.color = "#fff";
      tooltipDiv.style.borderRadius = "5px";
      tooltipDiv.style.fontSize = "16px";
      tooltipDiv.style.whiteSpace = "normal";
      tooltipDiv.style.wordWrap = "break-word"; // 自动换行

      // 添加渐变效果
      tooltipDiv.style.transition = "opacity 0.5s ease";
      tooltipDiv.style.opacity = "1"; // 初始显示

      // 如果是移动端，10秒后自动隐藏
      if (isMobile) {
        hideTimeout = setTimeout(() => {
          tooltipDiv.style.opacity = "0"; // 渐变隐藏
          setTimeout(() => tooltipDiv.remove(), 500); // 500ms后完全移除元素
        }, 10000); // 延迟10秒
      }
    });

    tooltip.addEventListener("mouseleave", () => {
      const tooltipDiv = document.querySelector(".tooltip-popup");
      if (tooltipDiv) {
        clearTimeout(hideTimeout); // 清除定时器
        tooltipDiv.remove(); // 鼠标移出时立即移除提示框
      }
    });
  }
});

}

// 初次加载时调用
document.addEventListener("DOMContentLoaded", applyTooltip);

// 监听 PJAX 完成事件并延迟执行以确保内容已完全加载
document.addEventListener("pjax:complete", function () {
  // 延迟调用，确保 PJAX 内容已完全渲染
  setTimeout(applyTooltip, 100); // 延迟100ms以确保所有内容更新完成
});
