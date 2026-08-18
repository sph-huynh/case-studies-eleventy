document.addEventListener('DOMContentLoaded', () => {
  const listItems = document.querySelectorAll('.cse-list-item');
  const panels = document.querySelectorAll('.cse-panel');
  const detail = document.querySelector('.cse-detail');
  if (!listItems.length || !panels.length || !detail) return;

  const slugs = Array.from(listItems).map((item) => item.dataset.slug);
  const isMobile = window.matchMedia('(max-width: 478px)').matches;

  const setActiveListItem = (slug) => {
    listItems.forEach((item) => {
      item.classList.toggle('active', item.dataset.slug === slug);
    });
  };

  if (!isMobile) {
    const activate = (slug) => {
      const target = slugs.includes(slug) ? slug : slugs[0];
      setActiveListItem(target);
      panels.forEach((panel) => {
        panel.hidden = panel.dataset.slug !== target;
      });
    };

    window.addEventListener('hashchange', () => {
      activate(window.location.hash.replace('#', ''));
    });

    activate(window.location.hash.replace('#', ''));
    return;
  }

  // Mobile: all panels sit in a horizontal scroll-snap strip.
  // Swiping the strip updates the active list item; tapping a list item scrolls the strip.
  const panelFor = (slug) => document.querySelector(`.cse-panel[data-slug="${slug}"]`);
  const itemFor = (slug) => document.querySelector(`.cse-list-item[data-slug="${slug}"]`);

  const scrollDetailTo = (slug, behavior) => {
    const panel = panelFor(slug);
    if (panel) panel.scrollIntoView({ behavior, inline: 'start', block: 'nearest' });
  };

  const scrollListTo = (slug, behavior) => {
    const item = itemFor(slug);
    if (item) item.scrollIntoView({ behavior, inline: 'center', block: 'nearest' });
  };

  let currentSlug = slugs.includes(window.location.hash.replace('#', ''))
    ? window.location.hash.replace('#', '')
    : slugs[0];
  setActiveListItem(currentSlug);
  if (window.location.hash) {
    scrollDetailTo(currentSlug, 'auto');
  }

  listItems.forEach((item) => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const slug = item.dataset.slug;
      currentSlug = slug;
      setActiveListItem(slug);
      scrollDetailTo(slug, 'smooth');
      history.replaceState(null, '', `#${slug}`);
    });
  });

  let scrollTimer = null;
  detail.addEventListener('scroll', () => {
    if (scrollTimer) clearTimeout(scrollTimer);
    scrollTimer = setTimeout(() => {
      const detailCenter = detail.scrollLeft + detail.clientWidth / 2;
      let closestSlug = currentSlug;
      let closestDistance = Infinity;
      panels.forEach((panel) => {
        const panelCenter = panel.offsetLeft + panel.offsetWidth / 2;
        const distance = Math.abs(panelCenter - detailCenter);
        if (distance < closestDistance) {
          closestDistance = distance;
          closestSlug = panel.dataset.slug;
        }
      });
      if (closestSlug !== currentSlug) {
        currentSlug = closestSlug;
        setActiveListItem(closestSlug);
        scrollListTo(closestSlug, 'smooth');
        history.replaceState(null, '', `#${closestSlug}`);
      }
    }, 120);
  });
});
