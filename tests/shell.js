// Run in an isolated GNOME Shell session; never change the real power profile.
import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import * as Scripting from 'resource:///org/gnome/shell/ui/scripting.js';

const UUID = 'hide-power-mode@Imbecile6197.github.io';

function assert(value, message) {
    if (!value)
        throw new Error(message);
}

export async function run() {
    for (let attempt = 0; attempt < 100; attempt++) {
        if (Main.panel.statusArea.quickSettings._powerProfiles &&
            Main.extensionManager.lookup(UUID)?.stateObj?._actors?.size)
            break;
        await Scripting.sleep(100);
    }

    const quickSettings = Main.panel.statusArea.quickSettings;
    const extension = Main.extensionManager.lookup(UUID);
    assert(extension?.stateObj, 'Extension did not load');
    const indicator = quickSettings._powerProfiles;
    const tile = indicator.quickSettingsItems[0];
    const originalIndicatorSync = Object.getPrototypeOf(indicator)._syncIndicatorsVisible;
    const otherItems = quickSettings.menu._grid.get_children()
        .filter(item => item !== tile);
    const originalSync = Object.getPrototypeOf(tile)._sync;
    assert(extension.stateObj._actors.has(tile), 'Tile was not attached');
    assert(!tile.visible, 'Tile is visible while enabled');
    assert(extension.stateObj._actors.has(indicator), 'Panel indicator was not attached');
    assert(!indicator.visible, 'Panel indicator is visible while enabled');

    // Exercise the actual checked -> icon visible binding without changing
    // the system profile or sending a D-Bus property update.
    for (const checked of [false, true, false, true]) {
        tile.checked = checked;
        indicator._syncIndicatorsVisible();
        assert(!indicator.visible, 'Profile binding revealed panel indicator');
    }

    tile._sync();
    assert(!tile.visible, 'Shell update revealed tile');
    quickSettings.menu.open();
    await Scripting.sleep(100);
    assert(!tile.mapped, 'Hidden tile is mapped in open menu');
    assert(!tile.menu.isOpen, 'Power submenu is open');
    quickSettings.menu.close();

    for (let cycle = 0; cycle < 3; cycle++) {
        Main.extensionManager.disableExtension(UUID);
        await Scripting.sleep(100);
        assert(tile._sync === originalSync, 'Original update method not restored');
        assert(indicator._syncIndicatorsVisible === originalIndicatorSync,
            'Original indicator update method not restored');
        assert(indicator.visible === indicator.get_children().some(child => child.visible),
            'Incorrect restored panel indicator visibility');
        assert(tile.visible === (tile._proxy.g_name_owner !== null),
            'Incorrect restored visibility');
        assert(extension.stateObj._grid === null, 'Grid reference was retained');
        assert(extension.stateObj._actors === null, 'Tile reference was retained');
        Main.extensionManager.enableExtension(UUID);
        await Scripting.sleep(100);
        assert(!tile.visible, 'Tile visible after re-enable');
        tile._sync();
        assert(!tile.visible, 'Update revealed tile after re-enable');
        assert(!indicator.visible, 'Panel indicator visible after re-enable');
    }

    const afterItems = quickSettings.menu._grid.get_children()
        .filter(item => item !== tile);
    assert(otherItems.length === afterItems.length &&
        otherItems.every((item, index) => item === afterItems[index]),
    'Other menu items were changed or reordered');
    print('PASS: hide, update, open menu, restore, re-enable, cleanup, other items, panel icon and profile binding');
}
