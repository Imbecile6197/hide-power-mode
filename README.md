# Hide Power Mode

A GNOME Shell extension that hides the Power Mode tile, its submenu, and the
power profile indicator in the top panel.

The active power profile and power management service are unchanged. Profiles
remain available in Settings. Disable the extension to restore the controls
according to the current system state.

## Compatibility

GNOME Shell 50 and 51. The automated test ran on Fedora Workstation 44 with
GNOME Shell 50.6. The maintainer confirmed that the extension works on GNOME
Shell 51.
Other desktop environments are not supported. Future GNOME major versions must
be checked and tested before they are added to `shell-version`.

## Build

Requires `gnome-extensions`, supplied by GNOME Shell. From this directory:

```sh
bash build.sh
```

The ZIP is created in `dist/`. It contains readable JavaScript, metadata, this
README, and the GPL license. No installer, test script, or executable is included
in the extension package submitted to extensions.gnome.org.

## Install locally

```sh
gnome-extensions install --force dist/hide-power-mode@Imbecile6197.github.io.shell-extension.zip
```

Log out and back in, then enable the extension:

```sh
gnome-extensions enable hide-power-mode@Imbecile6197.github.io
```

If you used the earlier personal package, disable it before enabling this one:

```sh
gnome-extensions disable hide-power-mode@libor.local
```

The public and personal packages have different UUIDs. Run only one of them at
a time, because both patch the same Shell actors.

## Test

```sh
dbus-run-session -- gnome-shell-test-tool --headless --disable-animations \
  --extension "$PWD/dist/hide-power-mode@Imbecile6197.github.io.shell-extension.zip" \
  "$PWD/tests/shell.js"
```

The test uses a separate session bus and temporary user configuration. It checks
hiding, Shell updates, menu opening, profile indicator bindings, restoration,
three enable/disable cycles, and cleanup. It does not switch the system power
profile. Interactions with other extensions require separate testing.

## Implementation and maintenance

`extension.js` uses GNOME's `InjectionManager` to hide two existing actors after
their normal updates. It observes grid insertions to handle asynchronous Shell
startup. All method overrides and signal connections are removed in `disable()`.

The extension relies on private Shell properties and methods: `_powerProfiles`,
`_grid`, `_sync`, and `_syncIndicatorsVisible`. See [MAINTAINING.md](MAINTAINING.md)
for the code walkthrough and release checks.

This extension was developed with AI assistance. Its publisher is responsible
for reviewing, understanding, testing, and maintaining the submitted code, as
required by the GNOME Extensions review guidelines.

## License

GPL-3.0-or-later. See [LICENSE](LICENSE).
