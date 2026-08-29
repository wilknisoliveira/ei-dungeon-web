<!-- SPECKIT START -->
For additional context about technologies to be used, project structure,
shell commands, and other important information, read the current plan
<!-- SPECKIT END -->

## i18n

This project uses Angular built-in `$localize` for internationalization (en, pt-BR, es).

**When to update i18n:** Any modification that adds, removes, or changes a user-visible string must be followed by an i18n update.

**Steps:**

1. Run `ng extract-i18n` to regenerate `src/i18n/messages.xlf` (source/English).
2. Open `messages.pt-BR.xlf` and `messages.es.xlf`.
3. If a new string was added: add a `<trans-unit>` with the same ID and translated `<target>`.
4. If a string was removed: delete the corresponding `<trans-unit>` from all three files.
5. If a string was changed: update the `<source>` and `<target>` in all three files.
6. Run `ng build` to verify no i18n errors.
