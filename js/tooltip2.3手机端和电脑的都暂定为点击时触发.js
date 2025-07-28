function applyTooltip() {
  // 获取 .content 下的所有元素，排除 .tabs 和 .tabs 的子代
  const allElements = document.querySelectorAll(".content *");
  const filteredElements = Array.from(allElements).filter(el => !el.closest(".tabs"));

  filteredElements.forEach(tag => {
    // 先处理《|》格式
    tag.innerHTML = tag.innerHTML.replace(/《(.*?)\|(.*?)》/g, function (match, text, tooltip) {
      return `<span class="tooltip" data-tooltip="${tooltip}">${text}</span>`;
    });

    // 处理「・」、「･」、「｜」和「|」格式
    tag.innerHTML = tag.innerHTML.replace(/「(.*?)([・｜|･])(.*?)」/g, function (match, text, separator, tooltip) {
      return `<span class="tooltip" data-tooltip="${tooltip}">${text}</span>`;
    });

    // 处理[|]格式
    tag.innerHTML = tag.innerHTML.replace(/[\［\[]([^［\[]+)[｜\|]([^］\]]+)[\］\]]/g, function (match, text, tooltip) {
      return `<span class="tooltip" data-tooltip="${tooltip}">${text}</span>`;
    });

    // 处理【|】格式
    tag.innerHTML = tag.innerHTML.replace(/[【\[](.*?)[｜\|](.*?)[】\]]/g, function (match, text, tooltip) {
      return `<span class="tooltip" data-tooltip="${tooltip}">${text}</span>`;
    });
  });

  // 状态存储，记录当前是否显示 Tooltip
  let activeTooltip = null;

  const handleTooltipToggle = (event) => {
    const tooltip = event.target.closest(".tooltip");
    const text = tooltip?.getAttribute("data-tooltip");

    // 如果点击了 Tooltip 外的区域，关闭当前显示的 Tooltip
    if (!tooltip || tooltip !== activeTooltip) {
      if (activeTooltip) {
        const existingTooltip = document.querySelector(".tooltip-popup");
        if (existingTooltip) existingTooltip.remove();
        activeTooltip = null;
      }
    }

    // 如果点击的是 Tooltip 且不是当前激活的 Tooltip，则显示悬浮框
    if (tooltip && tooltip !== activeTooltip) {
      const tooltipDiv = document.createElement("div");
      tooltipDiv.className = "tooltip-popup";
      tooltipDiv.innerHTML = text;
      document.body.appendChild(tooltipDiv);

      // 定位悬浮框
      const tooltipRect = tooltip.getBoundingClientRect();
      tooltipDiv.style.position = "absolute";
      tooltipDiv.style.left = `${tooltipRect.left + window.scrollX}px`;
      tooltipDiv.style.top = `${tooltipRect.top + window.scrollY - tooltipDiv.offsetHeight - 20}px`;
      tooltipDiv.style.padding = "5px 10px";
      tooltipDiv.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
      tooltipDiv.style.color = "#fff";
      tooltipDiv.style.borderRadius = "5px";
      tooltipDiv.style.fontSize = "16px";
      tooltipDiv.style.whiteSpace = "normal";
      tooltipDiv.style.wordWrap = "break-word";
      tooltipDiv.style.zIndex = "1000";

      activeTooltip = tooltip;
    }
  };

  // 添加全局点击监听器
  document.addEventListener("click", handleTooltipToggle);
}

// 初次加载时调用
document.addEventListener("DOMContentLoaded", applyTooltip);

// 监听 PJAX 完成事件
document.addEventListener("pjax:complete", applyTooltip);
