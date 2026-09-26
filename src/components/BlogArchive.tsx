import { useEffect, useMemo, useState } from 'react';

export interface BlogListItem {
  title: string;
  date: string;
  displayDate: string;
  tag: string;
  summary?: string;
  url: string;
}

export default function BlogArchive({ posts }: { posts: BlogListItem[] }) {
  const [selectedTag, setSelectedTag] = useState('');
  const tags = useMemo(() => [...new Set(posts.map((post) => post.tag))].sort((a, b) => a.localeCompare(b)), [posts]);
  const visiblePosts = selectedTag ? posts.filter((post) => post.tag === selectedTag) : posts;

  useEffect(() => {
    const readTag = () => {
      const requested = new URL(window.location.href).searchParams.get('tag') ?? '';
      setSelectedTag(posts.some((post) => post.tag === requested) ? requested : '');
    };
    readTag();
    addEventListener('popstate', readTag);
    return () => removeEventListener('popstate', readTag);
  }, [posts]);

  const selectTag = (tag: string) => {
    setSelectedTag(tag);
    const url = new URL(window.location.href);
    if (tag) url.searchParams.set('tag', tag);
    else url.searchParams.delete('tag');
    history.pushState(null, '', url);
  };

  return (
    <div className="blog-layout">
      <aside className="tag-sidebar" aria-label="Filter posts">
        <h2>Explore by topic</h2>
        <nav aria-label="Blog tags">
          <button type="button" onClick={() => selectTag('')} aria-current={selectedTag === '' ? 'true' : undefined}>
            All posts <span>{posts.length}</span>
          </button>
          {tags.map((tag) => (
            <button type="button" key={tag} onClick={() => selectTag(tag)} aria-current={selectedTag === tag ? 'true' : undefined}>
              {tag} <span>{posts.filter((post) => post.tag === tag).length}</span>
            </button>
          ))}
        </nav>
      </aside>
      <section aria-label="Blog posts">
        <p className="filter-status" role="status" aria-live="polite">
          {visiblePosts.length} {visiblePosts.length === 1 ? 'post' : 'posts'}{selectedTag ? ` tagged ${selectedTag}` : ''}
        </p>
        {visiblePosts.map((post) => (
          <a className="post" data-post-tag={post.tag} href={post.url} key={post.url}>
            <div className="post-meta">
              <time dateTime={post.date}>{post.displayDate}</time>
              <span className="tag">{post.tag}</span>
            </div>
            <div>
              <h3>{post.title}</h3>
              {post.summary && <p>{post.summary}</p>}
            </div>
            <span className="post-arrow" aria-hidden="true">↗</span>
          </a>
        ))}
      </section>
    </div>
  );
}
