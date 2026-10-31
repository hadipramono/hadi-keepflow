# Category Persistence Test — v1.2.8.2

## Online test
1. Deploy the new version.
2. Open KeepFlow and wait until cloud loading completes.
3. Create a new category, for example `Proyek Baru`.
4. Confirm `Proyek Baru` appears immediately in the sidebar and in the note editor category dropdown.
5. Create a note and select `Proyek Baru`; save it.
6. Confirm the note appears when selecting `Proyek Baru`.
7. Reload the app. Confirm the category and note remain visible.

## Empty category persistence
1. Create another category, for example `Catatan Nanti`.
2. Do not create a note in it.
3. Reload the app.
4. Confirm `Catatan Nanti` remains in the sidebar and editor dropdown.

## Offline queue test
1. Load KeepFlow online, then disconnect the network.
2. Create a category and a note in that category.
3. Confirm the category appears locally and the note is queued.
4. Reconnect.
5. Confirm the pending category folder is created in Drive and the note syncs.
6. Reload and confirm both remain visible.

## Regression checks
- Existing categories and notes remain visible.
- Existing pending note operations remain in `hadi_keepflow_pending_v1`.
- No LocalStorage keys are manually cleared.
- Category names containing `/`, `\`, `?`, `%`, `*`, `:`, `|`, `"`, `<`, or `>` are normalized consistently.

