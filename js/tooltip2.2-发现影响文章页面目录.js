function applyTooltip() {
  // 2024年11.18晚，发现与tab标签冲突，执行加载本 js 文件后，会导致tab标签切换失效
  // 于是加了下面的逻辑：排除 .content 内的 .tabs 标签
  // 获取 .content 下的所有元素，排除 .tabs 和 .tabs 的子代
  const allElements = document.querySelectorAll(".content *");
  const filteredElements = Array.from(allElements).filter(el => !el.closest(".tabs"));

  filteredElements.forEach(tag => {
    // 先处理《|》格式
    tag.innerHTML = tag.innerHTML.replace(/《(.*?)\|(.*?)》/g, function (match, text, tooltip) {
      return `<span class="tooltip" data-tooltip="${tooltip}">${text}</span>`;
    });

    // 处理「・」、「･」、「｜」和「|」格式 ps:「」符号没有半角版本
    tag.innerHTML = tag.innerHTML.replace(/「(.*?)([・｜|･])(.*?)」/g, function (match, text, separator, tooltip) {
      return `<span class="tooltip" data-tooltip="${tooltip}">${text}</span>`;
    });

    // 处理[|]格式，包括全角［|］和半角[|]
    tag.innerHTML = tag.innerHTML.replace(/[\［\[]([^［\[]+)[｜\|]([^］\]]+)[\］\]]/g, function (match, text, tooltip) {
      return `<span class="tooltip" data-tooltip="${tooltip}">${text}</span>`;
    });

    // 处理【|】格式，包括全角「【|】」和半角「[|]」
    tag.innerHTML = tag.innerHTML.replace(/[【\[](.*?)[｜\|](.*?)[】\]]/g, function (match, text, tooltip) {
      return `<span class="tooltip" data-tooltip="${tooltip}">${text}</span>`;
    });    
  });

  // 给所有生成的 .tooltip 元素添加悬停事件
  const tooltips = document.querySelectorAll(".tooltip");
  tooltips.forEach(tooltip => {
    const text = tooltip.getAttribute("data-tooltip");
    if (text) {
      tooltip.addEventListener("mouseenter", () => {
        // 创建悬浮提示框
        const tooltipDiv = document.createElement("div");
        tooltipDiv.className = "tooltip-popup";

        // 使用 innerHTML 解析 HTML
        tooltipDiv.innerHTML = text;

        document.body.appendChild(tooltipDiv);

        // 获取页面宽度，调整每行容纳的字数
        const screenWidth = window.innerWidth;
        const padding = 20; // 设定一个适当的内边距
        const maxTooltipWidth = screenWidth * 0.3; // 最大悬浮框宽度为页面宽度的30%
        const charCount = text.replace(/<\/?[^>]+(>|$)/g, "").length; // 去掉标签后计算字符数
        const baseWidth = 200; // 每行的基础宽度，可根据需要调整

        // 动态计算宽度
        let tooltipWidth = Math.min(maxTooltipWidth, baseWidth + (charCount * 16)); // 6px是每个字符的宽度，可根据字体调整
        tooltipDiv.style.maxWidth = `${tooltipWidth}px`;

        // 定位悬浮提示框
        const tooltipRect = tooltip.getBoundingClientRect();
        tooltipDiv.style.position = "absolute";
        tooltipDiv.style.left = `${tooltipRect.left + window.scrollX}px`;
        tooltipDiv.style.top = `${tooltipRect.top + window.scrollY - tooltipDiv.offsetHeight - 10}px`;

        // 设置样式
        tooltipDiv.style.padding = "5px 10px";
        tooltipDiv.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
        tooltipDiv.style.color = "#fff";
        tooltipDiv.style.borderRadius = "5px";
        tooltipDiv.style.fontSize = "16px";
        tooltipDiv.style.whiteSpace = "normal";
        tooltipDiv.style.wordWrap = "break-word";  // 自动换行
      });

      tooltip.addEventListener("mouseleave", () => {
        const tooltipDiv = document.querySelector(".tooltip-popup");
        if (tooltipDiv) tooltipDiv.remove();
      });
    }
  });
}

// 初次加载时调用
document.addEventListener("DOMContentLoaded", applyTooltip);

// 监听 PJAX 完成事件
document.addEventListener("pjax:complete", applyTooltip);
