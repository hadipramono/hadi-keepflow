# Phase 3.1 — Data Portability & Backup Test

## Before testing
- Deploy the new Apps Script version.
- Open KeepFlow while online.
- Wait until cloud sync is complete and the pending queue indicator is absent.
- Confirm at least one note exists in `Umum` and another category.
- If possible, create one empty category to verify category structure is included.

## A. Backup ZIP
1. Click **Backup ZIP**.
2. Confirm a `.zip` file is downloaded.
3. Open the ZIP with an archive manager.
4. Confirm it contains `manifest.json` and category folders.
5. Confirm each note is a `.md` file.
6. Confirm pinned/archive/tag metadata is retained in the `---JSON---` envelope.
7. Confirm empty categories appear as folder entries.

Expected: backup contains the current cloud snapshot and correct note/category counts.

## B. Restore preview
1. In a separate test environment or after making a safe test copy, select the ZIP using **Restore / Import ZIP**.
2. Review the preview counts.
3. Cancel once and confirm no data changes.
4. Run restore again and confirm.

Expected: new notes/categories are added; existing notes are not deleted or overwritten.

## C. Duplicate detection
1. Restore the same ZIP a second time.
2. Confirm exact duplicates are reported and skipped.
3. Create a same-category/same-title note with different content, then restore the original ZIP.
4. Confirm the title conflict is reported and skipped.

Expected: no duplicate files and no overwrite.

## D. Plain Markdown import
1. Prepare a ZIP containing `Umum/Contoh.md` and `Referensi/Contoh 2.md`.
2. Use plain Markdown content without a metadata envelope.
3. Restore it.

Expected: files are imported with category inferred from the first folder; root-level Markdown files are assigned to `Umum`.

## E. Safety checks
- Try backup while offline: it must be rejected.
- Try restore while offline: it must be rejected.
- Try restore while the sync queue has pending operations: it must be rejected.
- Try an invalid ZIP: it must show an error and not write notes.
- Verify a partial failure can be safely retried; previously imported exact duplicates should be skipped.

## Notes
Restore is merge-only. It never deletes or overwrites existing notes. Title conflicts with different content are skipped and must be resolved manually.


## F. Progress bar
1. Start Backup ZIP with several notes.
2. Confirm the progress dialog appears and moves through cloud snapshot, note collection, and ZIP compression.
3. Start Restore / Import ZIP.
4. Confirm the dialog shows ZIP inspection, file reading, category creation, and note saving stages.
5. Confirm completion reaches 100% and the dialog can be closed.
6. Try an invalid ZIP and confirm an error state is shown.

Expected: progress is visible and updates during long-running steps. While waiting for Apps Script or ZIP parsing, the dialog may show an animated indeterminate bar because those operations do not expose granular progress.
