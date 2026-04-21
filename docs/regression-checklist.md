# Regression Checklist

Date: 2026-04-21

## Purpose

This checklist is the minimum manual verification set for refactoring work on the showcase app.

Use it after any change that touches:

- `client/src/pages/showcase.tsx`
- `client/src/pages/preview.tsx`
- `server/showcase.ts`
- `server/routes.ts`
- build or manifest generation
- file mutations such as rename, delete, move, or directory creation

## Baseline Commands

Run these before manual verification:

```bash
npm run check
npm run lint
npm run build
```

## Manual Flow

### 1. App Boot

- Start the app with `npm run dev`
- Open the root page
- Confirm the header renders
- Confirm the sidebar renders
- Confirm no immediate runtime error appears

### 2. Listing and Navigation

- Confirm the `Pages` tab renders
- Confirm the `Components` tab renders
- Confirm switching tabs updates the grid
- Confirm the file tree is populated from `showcase/`

### 3. JSX / TSX Preview

- Open at least one JSX or TSX page preview
- Confirm it renders inside the preview frame
- Open at least one JSX or TSX component preview
- Confirm it renders inside the isolated component preview area

### 4. HTML Preview

- Open at least one `.html` page from the showcase
- Confirm it renders in an iframe

### 5. File Mutations

- Rename one showcase file and confirm:
  - the operation succeeds
  - the updated item remains selectable
  - the new path is reflected in the UI
- Create one directory and confirm it appears in the file tree
- Move one file into a target directory and confirm it appears in the new location
- Delete one file and confirm it disappears from the tree and cards

### 6. Reload and Theme

- Trigger manual reload
- Confirm the success toast appears
- Toggle theme
- Confirm the visual theme changes and persists after refresh

### 7. Production Build

- Run `npm run build`
- Start the production server with `npm run start`
- Confirm the root page still loads
- Confirm the showcase list still renders from generated artifacts

## Notes

- If a change intentionally modifies one of the flows above, update this checklist in the same change.
- Prefer checking both a `page` entry and a `component` entry before closing a refactor task.
