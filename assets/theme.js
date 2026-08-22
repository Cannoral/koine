/* Переключатель темы. Ждёт кнопку с id="themeToggle"; выбор общий для всех страниц. */
(function () {
  var html = document.documentElement;
  var KEY = 'koine-theme';
  function set(v) { html.setAttribute('data-bs-theme', v); localStorage.setItem(KEY, v); }
  set(localStorage.getItem(KEY) || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'));
  document.addEventListener('DOMContentLoaded', function () {
    var btn = document.getElementById('themeToggle');
    if (btn) btn.addEventListener('click', function () {
      set(html.getAttribute('data-bs-theme') === 'dark' ? 'light' : 'dark');
    });
  });
})();
