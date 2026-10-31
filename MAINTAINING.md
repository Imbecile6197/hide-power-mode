# Maintainer walkthrough

Read `extension.js` alongside this explanation before submitting the extension.
AI assistance does not replace maintainer review or responsibility.

## What is modified

`Main.panel.statusArea.quickSettings._powerProfiles` is Shell's power profile
indicator container. Its `quickSettingsItems` array holds the menu tile. These
are Shell-owned actors: the extension must not destroy them.

The indicator's `_syncIndicatorsVisible()` normally sets its visibility from
its child icons. The tile's `_sync()` normally updates its visibility, checked
state, icon, and profile label from the power profile service.

## Lifecycle

1. `enable()` creates an `InjectionManager` and a map of actors. It connects
   `child-added` on the Quick Settings grid and immediately calls `_attach()`.
   The signal is needed because Shell constructs its indicators asynchronously.
2. `_attach()` looks up the power profile container. If it exists, it calls
   `_hideActor()` for that container and each power profile tile.
3. `_hideActor()` saves and wraps the corresponding update method. Its ordinary
   `function` expression retains the actor as `this`. The wrapper calls the
   original method first, then hides the actor. This preserves profile updates
   and the bindings between tile state and the panel icon. The map prevents
   wrapping the same actor twice.
4. A `destroy` signal removes the actor's override and map entry if Shell
   destroys it. Any open tile submenu is closed before the tile is hidden.
5. `disable()` disconnects the grid signal, clears the method overrides,
   disconnects actor signals, and calls the restored methods. Visibility is
   recomputed from current Shell state rather than restored from an old snapshot.
   It then clears the map and releases all retained objects.

## Why not a visibility notification on the tile?

The tile's normal `_sync()` first assigns `visible`, then immediately returns
if it is false. Hiding the tile from `notify::visible` would interrupt the
remaining profile and icon updates. Wrapping the full update avoids that issue.

## Scope

The extension does not set the active power profile, stop a system service,
access the network, spawn a process, or add settings or keyboard shortcuts.
Normal GNOME update methods still run. Hiding the indicator container also
removes its layout space from the panel.

## Before a release

- Check the named private properties and methods against the target Shell source.
- Run the included integration test on every advertised GNOME major version.
- Check actual login startup, lock/unlock, profile changes made in Settings, and
  interaction with any extension that also modifies the power profile controls.
- Keep only tested versions in `metadata.json`; let extensions.gnome.org assign
  the numeric submission version.
- Build and inspect the ZIP; do not include the personal shell installer or tests.
- Check that the public repository URL exists and accepts issue reports.
- Be ready to explain and fix the submitted code during GNOME review.
