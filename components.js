function loadNav() {
  var root = document.documentElement.getAttribute('data-root') || '/';
  var nav = document.createElement('nav');
  nav.innerHTML = '<a href="' + root + '" class="brand">noteasy<span>.</span></a>' +
    '<div class="nav-links">' +
    '<a href="' + root + '#services">服务</a>' +
    '<a href="' + root + '#contact">联系</a>' +
    '</div>';
  var placeholder = document.getElementById('nav-placeholder');
  if (placeholder) placeholder.replaceWith(nav);
}

function loadFooter() {
  var extra = document.getElementById('footer-extra');
  var extraHtml = extra ? extra.innerHTML : '';
  var footer = document.createElement('footer');
  footer.innerHTML = '<p>© 2026 noteasy · Built with passion' + (extraHtml ? ' · ' + extraHtml : '') + '</p>' +
    '<div class="socials">' +
    '<a href="https://github.com/no-teasy"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg></a>' +
    '<a href="mailto:3992412947@qq.com"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg></a>' +
    '<a href="#"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 2H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h7l-2 3v1h8v-1l-2-3h7c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg></a>' +
    '</div>';
  var placeholder = document.getElementById('footer-placeholder');
  if (placeholder) placeholder.replaceWith(footer);
}

document.addEventListener('DOMContentLoaded', function() {
  loadNav();
  loadFooter();
});
