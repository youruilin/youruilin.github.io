document.addEventListener("DOMContentLoaded", function () {
  // 查找包含《|》格式的文本并替换为 tooltip span
  document.body.innerHTML = document.body.innerHTML.replace(/《(.*?)\|(.*?)》/g, function (match, text, tooltip) {
    return `<span class="tooltip" data-tooltip="${tooltip}">${text}</span>`;
  });
});
