# Validation

Release: 1.1.0, public UUID `hide-power-mode@Imbecile6197.github.io`.
Date: 2026-10-31.

The final extension ZIP passed the included integration test on Fedora
Workstation 44 with GNOME Shell 50.6 in a headless Wayland Shell session, using
a separate session bus and temporary user configuration. Exit status: 0.

Verified:

- The submitted ZIP loads and attaches to the power profile tile and indicator.
- The tile stays hidden after Shell updates and menu opening.
- Its submenu is closed and the tile is not mapped in the open menu.
- The panel indicator stays hidden when its child icon visibility binding changes.
- Disable restores the native update methods and current visibility.
- Three disable/enable cycles pass and extension references are cleared on disable.
- Other Quick Settings actors are not removed or reordered.

The test changes the tile's local `checked` property to exercise the icon
binding, without setting the system power profile over D-Bus. It does not test
every third-party extension combination, real login startup, or lock/unlock.
## Release 1.1.1

The maintainer confirmed that the extension works on GNOME Shell 51. The
release metadata now advertises GNOME Shell 50 and 51. The extension JavaScript
is identical to release 1.1.0.
