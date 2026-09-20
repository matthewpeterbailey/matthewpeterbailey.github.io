const filters = document.querySelector('[data-tag-filters]');
const posts = [...document.querySelectorAll('[data-post-tag]')];
const status = document.querySelector('[data-filter-status]');
function applyFilter() {
  const requested = new URL(location.href).searchParams.get('tag');
  const tag = posts.some(post => post.dataset.postTag === requested) ? requested : null;
  let count = 0;
  for (const post of posts) {
    post.hidden = Boolean(tag && post.dataset.postTag !== tag);
    if (!post.hidden) count++;
  }
  for (const link of filters.querySelectorAll('a')) {
    if ((link.dataset.tag || null) === tag) link.setAttribute('aria-current', 'true');
    else link.removeAttribute('aria-current');
  }
  status.textContent = `${count} ${count === 1 ? 'post' : 'posts'}${tag ? ` tagged ${tag}` : ''}`;
}
filters.addEventListener('click', event => {
  const link = event.target.closest('a');
  if (!link || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || event.button !== 0) return;
  event.preventDefault();
  history.pushState(null, '', link.href);
  applyFilter();
});
addEventListener('popstate', applyFilter);
applyFilter();
