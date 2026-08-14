# USHCE Design Direction

Last updated: 2026-08-14

## Approved public-site direction

The product owner approved the visual direction implemented in the Preview
branch `codex/public-homepage-refresh`. This is the reference direction for
future public-page work. It has not been approved for Production yet.

### Principles

- Use a restrained, editorial, healthcare-professional appearance.
- Prefer generous white space, crisp borders, and a clear grid over layered
  gradients, oversized rounded containers, and decorative card-heavy layouts.
- Use large, confident typography for public-page hierarchy.
- Use deep blue as the primary action and trust accent; use black and neutral
  gray for the core public composition.
- Keep the primary job search visible early on the homepage.
- Treat public metrics and trust claims as live-data statements, never static
  marketing claims. Platform demonstrations must not be presented as verified
  employers or real marketplace activity.
- Keep authenticated workspaces more utilitarian and calm; improve their
  visual consistency gradually without disrupting task-focused workflows.

### Homepage reference layout

1. Direct value proposition and search form above the fold.
2. Three concise product facts: live role count, U.S. location scope, and
   privacy-by-default profile control.
3. Recently published opportunities.
4. Employer value proposition and organization profiles.
5. A simple high-contrast call to action.

### Guardrails

- Do not change database schema, authorization, application workflows, or
  public visibility rules for a visual refresh alone.
- Preserve accessible contrast, keyboard focus, responsive layouts, and
  English-only public content.
- Refresh each public area in a separate Preview branch and verify it before a
  Production merge.
