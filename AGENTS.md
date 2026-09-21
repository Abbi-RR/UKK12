# RuangKerja - AI Coding Instructions

## Project Context

RuangKerja adalah platform coworking space berbasis Next.js untuk reservasi
Personal Desk, Private Office, dan Meeting Room.

Frontend menggunakan:
- Next.js App Router
- TypeScript
- Tailwind CSS
- lucide-react
- Plus Jakarta Sans

## Source of Truth

Before making changes:
1. Read `.clinerules`.
2. Inspect the existing project structure.
3. Follow existing components and conventions.
4. Do not assume files or APIs that do not exist.

`.clinerules` is the source of truth for the project's visual design system.

## Coding Rules

- Use TypeScript.
- Avoid `any`.
- Use reusable components when appropriate.
- Use semantic HTML.
- Keep components maintainable.
- Do not install unnecessary dependencies.
- Do not create fake APIs.
- Do not remove existing functionality.
- Do not modify unrelated files.

## Styling Rules

- Follow `.clinerules` for colors, typography, spacing, responsive behavior, and UI patterns.
- Use existing Tailwind tokens when available.
- Do not create `tailwind.config.ts` unless explicitly required.
- Do not introduce unnecessary gradients, glassmorphism, or visual effects.

## API Rules

- Do not invent API endpoints.
- Inspect the existing API documentation or project configuration before integrating APIs.
- Keep API integration easy to modify.
- Never expose secrets in client-side code.
- Never store passwords or API credentials in localStorage.

## Before Finishing

After implementation:
1. Check TypeScript errors.
2. Check for obvious lint errors.
3. Check responsive behavior.
4. Confirm that unrelated functionality was not changed.
5. Summarize files created or modified.