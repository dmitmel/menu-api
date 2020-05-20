///
/// CCMenuAPI - API for cross-modloader menu button adding
/// Written starting in 2019 by 20kdc
/// To the extent possible under law, the author(s) have dedicated all copyright and related and neighboring rights to this software to the public domain worldwide. This software is distributed without any warranty.
/// You should have received a copy of the CC0 Public Domain Dedication along with this software. If not, see <http://creativecommons.org/publicdomain/zero/1.0/>.
///

sc.menuAPI = {
  buttons: [],
};

ig.module('menu-api')
  .requires(
    'impact.feature.gui.gui',
    'game.feature.gui.screen.title-screen',
    'game.feature.gui.screen.pause-screen',
    'impact.feature.gui.base.box',
    'game.feature.gui.base.button',
    'impact.feature.bgm.bgm',
    'impact.feature.interact.interact',
    'game.feature.menu.gui.list-boxes',
    'game.feature.menu.menu-model',
  )
  .defines(() => {
    sc.BUTTON_TYPE.GROUP_LEFT_MEDIUM = {
      height: 24,
      ninepatch: new ig.NinePatch('mods/menu-api/buttons.png', {
        width: 8,
        height: 0,
        left: 8,
        top: 24,
        right: 8,
        bottom: 0,
        offsets: {
          default: { x: 0, y: 0 },
          focus: { x: 0, y: 24 },
          pressed: { x: 0, y: 24 },
        },
      }),
      highlight: {
        startX: 0,
        endX: 24,
        leftWidth: 9,
        rightWidth: 4,
        offsetY: 48,
        gfx: new ig.Image('mods/menu-api/buttons.png'),
        pattern: new ig.ImagePattern(
          'mods/menu-api/buttons.png',
          9,
          48,
          11,
          24,
          ig.ImagePattern.OPT.REPEAT_X,
        ),
      },
    };

    sc.BUTTON_TYPE.GROUP_MEDIUM = {
      height: 24,
      ninepatch: new ig.NinePatch('mods/menu-api/buttons.png', {
        width: 8,
        height: 0,
        left: 4,
        top: 24,
        right: 4,
        bottom: 0,
        offsets: {
          default: { x: 24, y: 0 },
          focus: { x: 24, y: 24 },
          pressed: { x: 24, y: 24 },
        },
      }),
      highlight: {
        startX: 24,
        endX: 40,
        leftWidth: 4,
        rightWidth: 4,
        offsetY: 48,
        gfx: new ig.Image('mods/menu-api/buttons.png'),
        pattern: new ig.ImagePattern(
          'mods/menu-api/buttons.png',
          28,
          48,
          8,
          24,
          ig.ImagePattern.OPT.REPEAT_X,
        ),
      },
    };

    sc.BUTTON_TYPE.GROUP_RIGHT_MEDIUM = {
      height: 24,
      ninepatch: new ig.NinePatch('mods/menu-api/buttons.png', {
        width: 8,
        height: 0,
        left: 8,
        top: 24,
        right: 8,
        bottom: 0,
        offsets: {
          default: { x: 40, y: 0 },
          focus: { x: 40, y: 24 },
          pressed: { x: 40, y: 24 },
        },
      }),
      highlight: {
        startX: 40,
        endX: 64,
        leftWidth: 4,
        rightWidth: 9,
        offsetY: 48,
        gfx: new ig.Image('mods/menu-api/buttons.png'),
        pattern: new ig.ImagePattern(
          'mods/menu-api/buttons.png',
          43,
          48,
          13,
          24,
          ig.ImagePattern.OPT.REPEAT_X,
        ),
      },
    };

    sc.ButtonGui.inject({
      setButtonTypeGfx(type) {
        this.buttonType = type;
        // this.hook.size.y = this.buttonType.height;
        // this.hook.align.x = this.buttonType.alignX || ig.GUI_ALIGN.X_CENTER;
        // this.hook.pos.x = this.buttonType.alignXPadding || 0;

        // let bgGuiIndex = this.getChildGuiIndex(this.bgGui);
        // this.removeChildGuiByIndex(bgGuiIndex);
        // this.bgGui = new sc.ButtonBgGui(this.hook.size.x, this.buttonType);
        // this.insertChildGui(this.bgGui, 0);
        // console.log(bgGuiIndex);

        this.bgGui.ninepatch = this.buttonType.ninepatch;
        for (let firstKey in this.buttonType.ninepatch.tile.offsets) {
          this.currentTileOffset = firstKey;
          break;
        }

        if (this.buttonType.highlight) {
          this.highlightGui.highlight = this.buttonType.highlight;
          this.highlightGui.pattern = this.buttonType.highlight.pattern;
          this.highlightGui.gfx = this.buttonType.highlight.gfx;
        }
      },
    });

    function createModMenusButton(btnType) {
      let btn = new sc.ButtonGui('+', 24, true, btnType);
      btn.onButtonPress = () => {
        sc.menu.setDirectMode(true, sc.MENU_SUBMENU.MOD_MENUS);
        sc.model.enterMenu(true);
      };
      return btn;
    }

    sc.TitleScreenButtonGui.inject({
      modMenusButton: null,

      init(...args) {
        this.parent(...args);

        let optionsBtn = this.namedButtons.setOptions;
        optionsBtn.setButtonTypeGfx(sc.BUTTON_TYPE.GROUP_LEFT_MEDIUM);

        this.modMenusButton = createModMenusButton(
          sc.BUTTON_TYPE.GROUP_RIGHT_MEDIUM,
        );
        this.modMenusButton.setAlign(ig.GUI_ALIGN.X_RIGHT, ig.GUI_ALIGN.Y_TOP);
        this.modMenusButton.hook.transitions = {
          DEFAULT: {
            ...optionsBtn.hook.transitions.DEFAULT,
            state: { offsetX: -this.modMenusButton.hook.size.x },
          },
          HIDDEN: {
            ...optionsBtn.hook.transitions.HIDDEN,
            state: {},
          },
        };
        this.modMenusButton.doStateTransition('HIDDEN', true);

        optionsBtn.insertChildGui(this.modMenusButton, 0);
        this.buttonGroup.addFocusGui(this.modMenusButton, 1, 4);
      },

      hide(skipTransition) {
        this.parent(skipTransition);
        this.modMenusButton.doStateTransition('HIDDEN', skipTransition);
      },

      show() {
        this.parent();
        this.modMenusButton.doStateTransition('DEFAULT', false);
      },
    });

    sc.PauseScreenGui.inject({
      modMenusButton: null,

      init(...args) {
        this.parent(...args);

        this.optionsButton.setButtonTypeGfx(sc.BUTTON_TYPE.GROUP_RIGHT_MEDIUM);

        this.modMenusButton = createModMenusButton(
          sc.BUTTON_TYPE.GROUP_LEFT_MEDIUM,
        );
        this.modMenusButton.setAlign(ig.GUI_ALIGN.X_LEFT, ig.GUI_ALIGN.Y_TOP);
        this.optionsButton.insertChildGui(this.modMenusButton, 0);
      },

      updateButtons(...args) {
        this.optionsButton.removeChildGui(this.modMenusButton);

        this.parent(...args);

        this.optionsButton.insertChildGui(this.modMenusButton, 0);
        this.modMenusButton.setPos(-this.modMenusButton.hook.size.x, 0);
        // TODO: copy the vertical focus index from `this.optionsButton`
        this.buttonGroup.addFocusGui(
          this.modMenusButton,
          this.buttonGroup.largestIndex.x + 1,
          0,
        );

        // TODO: is refocusing possible here?
      },
    });

    sc.menuAPI.ModMenusMenu = sc.BaseMenu.extend({
      list: null,
      background: null,

      init() {
        this.parent();
        this.setSize(ig.system.width, ig.system.height);
        this.doStateTransition('DEFAULT');

        this.list = new sc.ButtonListBox(
          0, // paddingTop
          0, // paddingBetween
          20, // pageSize
          sc.LIST_COLUMNS.TWO,
          0, // columnPadding
        );
        this.list.setAlign(ig.GUI_ALIGN.X_CENTER, ig.GUI_ALIGN.Y_CENTER);
        this.list.setSize(436, 258);
        this.list.buttonWidth = Math.floor((this.list.hook.size.x - 5) / 2);

        for (let i = 0; i < sc.menuAPI.buttons.length; i++) {
          let config = sc.menuAPI.buttons[i];
          let btn = new sc.ButtonGui(config.text, this.list.buttonWidth);
          btn.onButtonPress = config.runnable;
          this.list.addButton(btn, true);
          this.list.buttonGroup.insertFocusGui(
            btn,
            i % 2,
            1 + Math.floor(i / 2),
          );
        }

        this.background = new sc.MenuScanLines();
        this.background.setSize(this.list.hook.size.x, this.list.hook.size.y);
        this.background.setAlign(ig.GUI_ALIGN.X_CENTER, ig.GUI_ALIGN.Y_CENTER);
        this.background.hook.transitions = {
          DEFAULT: { state: {}, time: 0.2, timeFunction: KEY_SPLINES.LINEAR },
          HIDDEN: {
            state: { alpha: 0, offsetX: this.background.hook.size.x / 2 },
            time: 0.2,
            timeFunction: KEY_SPLINES.LINEAR,
          },
        };
        this.background.doStateTransition('HIDDEN', true);

        this.background.addChildGui(this.list);
        this.addChildGui(this.background);
      },

      addObservers() {
        sc.Model.addObserver(sc.menu, this);
      },

      removeObservers() {
        sc.Model.removeObserver(sc.menu, this);
      },

      showMenu() {
        this.addObservers();
        sc.menu.pushBackCallback(this.onBackButtonPress.bind(this));
        sc.menu.moveLeaSprite(0, 0, sc.MENU_LEA_STATE.HIDDEN);
        this.list.activate();
        ig.interact.setBlockDelay(0.2);
        this.onAddHotkeys();

        this.background.doStateTransition('DEFAULT');
        ig.bgm.pause('MEDIUM');
      },

      hideMenu() {
        this.removeObservers();
        sc.menu.moveLeaSprite(0, 0, sc.MENU_LEA_STATE.LARGE);
        this.exitMenu();
      },

      exitMenu() {
        this.list.deactivate();
        this.background.doStateTransition('HIDDEN');
        ig.bgm.resume('MEDIUM');
      },

      onAddHotkeys() {
        sc.menu.commitHotkeys();
      },

      onBackButtonPress() {
        sc.menu.popBackCallback();
        sc.menu.popMenu();
      },

      modelChanged() {},
    });

    sc.MENU_SUBMENU.MOD_MENUS = Object.keys(sc.MENU_SUBMENU).length;
    sc.SUB_MENU_INFO[sc.MENU_SUBMENU.MOD_MENUS] = {
      Clazz: sc.menuAPI.ModMenusMenu,
      name: 'modMenus',
    };
  });
