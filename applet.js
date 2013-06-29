/*
 * Cinnamon RSS feed reader applet
 *
 * Author: jonbrett.dev@gmail.com
 * Date: 2013
 *
 * Cinnamon RSS feed reader applet is free software: you can redistribute it
 * and/or modify it under the terms of the GNU General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or (at your
 * option) any later version.
 *
 * Cinnamon RSS feed reader applet is distributed in the hope that it will be
 * useful, but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General
 * Public License for more details.
 * You should have received a copy of the GNU General Public License along
 * with Cinnamon RSS feed reader applet.  If not, see
 * <http://www.gnu.org/licenses/>.
 */

const UUID = "feeds@jonbrettdev.wordpress.com"

imports.searchPath.push( imports.ui.appletManager.appletMeta[UUID].path );

const Applet = imports.ui.applet;
const FeedReader = imports.feedreader;
const GLib = imports.gi.GLib;
const Gettext = imports.gettext.domain('cinnamon-applets');
const Lang = imports.lang;
const PopupMenu = imports.ui.popupMenu;
const St = imports.gi.St;
const Util = imports.misc.util;
const _ = Gettext.gettext;

/* Menu item for displaying an feed item */
function FeedMenuItem() {
    this._init.apply(this, arguments);
}

FeedMenuItem.prototype = {
    __proto__: PopupMenu.PopupBaseMenuItem.prototype,

    _init: function (label, url, read, params) {
        PopupMenu.PopupBaseMenuItem.prototype._init.call(this, params);

        this.url = url;
        this.read = read;
        this.addActor(new St.Label({ text: label }));
    },
};


function FeedApplet(orientation) {
    this._init(orientation);
}

FeedApplet.prototype = {
    __proto__: Applet.IconApplet.prototype,

    _init: function(orientation) {
        Applet.IconApplet.prototype._init.call(this, orientation);

        try {
            this.set_applet_icon_name("news-feed");
            this.set_applet_tooltip(_("Feed reader"));

            this.menuManager = new PopupMenu.PopupMenuManager(this);
            this.menu = new Applet.AppletPopupMenu(this, orientation);
            this.menuManager.addMenu(this.menu);

            this.reader = new FeedReader.FeedReader(
                    'http://segfault.linuxmint.com/feed/',
                    5,
                    {
                        'onUpdate' : Lang.bind(this, this.on_update)
                    });

            this.refresh();
            this.timeout = GLib.timeout_add_seconds(0, 60, Lang.bind(this, this.refresh));
        } catch (e) {
            global.logError(e);
        }

    },

    on_update: function() {
        this.set_applet_tooltip(this.reader.title);

        this.menu.removeAll();

        var item = new PopupMenu.PopupMenuItem(this.reader.title);
        this.menu.addMenuItem(item);
        item = new PopupMenu.PopupSeparatorMenuItem();
        this.menu.addMenuItem(item);

        for (var i = 0; i < this.reader.items.length; i++) {
            var item = new FeedMenuItem(
                    this.reader.items[i].title,
                    this.reader.items[i].link,
                    this.reader.items[i].read);
            item.connect("activate", function(actor, event) {
                Util.spawnCommandLine('xdg-open ' + actor.url);
            });
            this.menu.addMenuItem(item);
        }
    },

    refresh: function() {
        this.reader.get()
    },

    on_applet_clicked: function(event) {
        this.menu.toggle();
    }
};

function main(metadata, orientation) {
    return new FeedApplet(orientation);
}