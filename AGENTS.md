<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Keep invitation ornament imagery bundled as transparent assets and animate curtain/reveal elements with scoped GSAP; this supports SSR-safe artwork and coordinated transitions.
- Initialize browser animation libraries after mount and provide a reduced-motion opening; this prevents SSR failures and keeps the invitation accessible.
- Keep invitation details in the shared invitation module, and use a cleaned-up automatic opening timer with a library-failure fallback; this keeps date rules testable and prevents a trapped opening screen.
- Position floral artwork in symmetric paired wrappers and animate the wrappers separately from mirrored images; this preserves alignment during reveals and scrolling.
