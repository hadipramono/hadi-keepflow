# Hadi KeepFlow v1.2.8.2 — Category Persistence Fix

## Problem
New categories were only assigned to `currentCategory` in the UI. The category renderer built its list from existing notes and hard-coded defaults, so an empty category was not included in the editor dropdown or could disappear after reload. No Drive folder was created by the add-category action.

## Changes
- Added backend `getCategories()` to return category folders, including empty folders.
- Added backend `createCategoryFolder()` with validation, a script lock, and idempotent folder creation.
- Added a local category registry and pending-create queue in LocalStorage (`hadi_keepflow_categories_v1`).
- Added cloud category refresh after the notes baseline loads.
- Added retry of pending category creations after connectivity returns.
- Updated category rendering to include categories known locally, categories returned by Drive, categories used by notes, and the currently selected category.
- Updated the add-category action to persist the category instead of only changing the active filter.

## Compatibility
- Existing note and sync queue LocalStorage keys are unchanged.
- No existing note files are migrated or rewritten.
- Empty category folders are now visible after reload.

## Files changed
- `NotesApi.gs`
- `AppScripts.html`
