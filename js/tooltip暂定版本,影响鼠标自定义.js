document.addEventListener("DOMContentLoaded", function () {
  // 查找包含《|》格式的文本并替换为 tooltip span
  document.body.innerHTML = document.body.innerHTML.replace(/《(.*?)\|(.*?)》/g, function (match, text, tooltip) {
    return `<span class="tooltip" data-tooltip="${tooltip}">${text}</span>`;
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
        tooltipDiv.innerText = text;
        document.body.appendChild(tooltipDiv);

        // 获取页面宽度，调整每行容纳的字数
        const screenWidth = window.innerWidth;
        const padding = 20; // 设定一个适当的内边距
        const maxTooltipWidth = screenWidth * 0.3; // 最大悬浮框宽度为页面宽度的30%
        const charCount = text.length; // 获取悬浮文字的字符数
        const baseWidth = 200; // 每行的基础宽度，您可以根据需要调整

        // 动态计算宽度
        let tooltipWidth = Math.min(maxTooltipWidth, baseWidth + (charCount * 6)); // 6px是每个字符的宽度，可根据字体调整
        tooltipDiv.style.maxWidth = `${tooltipWidth}px`;

        // 定位悬浮提示框
        const tooltipRect = tooltip.getBoundingClientRect();
        tooltipDiv.style.position = "absolute";
        tooltipDiv.style.left = `${tooltipRect.left + window.scrollX}px`;
        tooltipDiv.style.top = `${tooltipRect.top + window.scrollY - tooltipDiv.offsetHeight - 10}px`; // 再上浮5像素

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
});
