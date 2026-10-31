# Category Management Test — v1.2.8.3

## Default category
1. Open KeepFlow online and wait for cloud loading to finish.
2. Confirm `Umum` is the only built-in category.
3. Confirm `Pekerjaan` and `Pribadi` are not injected automatically.
4. If either category already has a Drive folder or a note, confirm it remains visible. No existing folder or note is automatically deleted.

## Delete an empty category
1. Create a category named `Kategori Sementara`.
2. Confirm it appears in the sidebar and editor category dropdown.
3. Do not create a note in it.
4. Click the trash icon next to the category and confirm the dialog.
5. Confirm it disappears from the sidebar and editor dropdown.
6. Reload the app and confirm it remains absent.
7. Check Google Drive Trash: the empty category folder should be there. It is not permanently deleted.

## Protected categories and contents
1. Confirm the `Umum` category has no delete action.
2. Create a category with a note. Confirm the UI does not offer deletion.
3. Attempt `deleteCategoryFolder('Umum')` from Apps Script; it must return an error.
4. Attempt to delete a category containing a file; it must return an error.
5. Attempt to delete an otherwise empty category containing a nested subfolder; it must return an error.
6. Archived notes still count as notes and prevent deletion.

## Offline behavior
1. Load the application while online.
2. Disconnect the network.
3. Confirm a category's delete action is blocked with a clear message.
4. Reconnect and verify the category remains available.

## Regression checks
- Existing notes, drafts, LocalStorage note data, and pending note operations remain intact.
- Empty categories remain persistent after reload until explicitly deleted.
- Existing `Pekerjaan`, `Pribadi`, and other categories are not removed automatically.
- Category deletion is rechecked by the backend while holding the script lock; frontend note counts are not treated as authoritative.
