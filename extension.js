// SPDX-License-Identifier: GPL-3.0-or-later
import {Extension, InjectionManager} from 'resource:///org/gnome/shell/extensions/extension.js';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';

export default class HidePowerMode extends Extension {
    enable() {
        this._injections = new InjectionManager();
        this._actors = new Map();
        this._quickSettings = Main.panel.statusArea.quickSettings;
        this._grid = this._quickSettings.menu._grid;

        // Indicators are created asynchronously at login. Observe insertion
        // rather than polling or assuming the power tile already exists.
        this._childAddedId = this._grid.connect('child-added', () => this._attach());
        this._attach();
    }

    _attach() {
        const indicator = this._quickSettings._powerProfiles;
        if (!indicator)
            return;

        // Hide the entire panel container, so it leaves no empty icon gap.
        // Its child icon is still bound to the current profile by Shell.
        this._hideActor(indicator, '_syncIndicatorsVisible');
        for (const item of indicator.quickSettingsItems)
            this._hideActor(item, '_sync');
    }

    _hideActor(actor, syncMethod) {
        if (this._actors.has(actor))
            return;
        if (typeof actor[syncMethod] !== 'function') {
            console.warn(`${this.uuid}: unsupported power mode actor (${syncMethod})`);
            return;
        }

        // Run Shell's full update first. A notify::visible handler on the tile
        // would interrupt _sync() before it updates the current profile/icon.
        this._injections.overrideMethod(actor, syncMethod, original => function (...args) {
            original.apply(this, args);
            this.hide();
        });
        const destroyId = actor.connect('destroy', () => {
            this._injections.restoreMethod(actor, syncMethod);
            this._actors.delete(actor);
        });
        this._actors.set(actor, {destroyId, syncMethod});
        actor.menu?.close();
        actor.hide();
    }

    disable() {
        if (this._childAddedId)
            this._grid.disconnect(this._childAddedId);
        this._childAddedId = 0;

        this._injections?.clear();
        for (const [actor, {destroyId, syncMethod}] of this._actors ?? []) {
            actor.disconnect(destroyId);
            // Recompute visibility from the current service state instead of
            // restoring a stale value captured when the extension was enabled.
            actor[syncMethod]();
        }

        this._actors?.clear();
        this._actors = null;
        this._injections = null;
        this._grid = null;
        this._quickSettings = null;
    }
}
