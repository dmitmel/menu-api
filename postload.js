///
/// CCMenuAPI - API for cross-modloader menu button adding
/// Written starting in 2019 by 20kdc
/// To the extent possible under law, the author(s) have dedicated all copyright and related and neighboring rights to this software to the public domain worldwide. This software is distributed without any warranty.
/// You should have received a copy of the CC0 Public Domain Dedication along with this software. If not, see <http://creativecommons.org/publicdomain/zero/1.0/>.
///

sc.menuAPI = {
  quickAccessButtons: [],
  buttons: [],
};

ig.module('menu-api.icons')
  .requires('game.feature.font.font-system')
  .defines(() => {
    const ICON_FONT = new ig.Font(
      'mods/menu-api/icons.png',
      16,
      ig.MultiFont.ICON_START,
    );

    const ICON_LIST = ['menu-api-mod-menus'];

    let ourFontIndex = sc.fontsystem.font.iconSets.length;
    sc.fontsystem.font.pushIconSet(ICON_FONT);

    let iconMapping = ICON_LIST.reduce((mapping, iconName, iconIndex) => {
      mapping[iconName] = [ourFontIndex, iconIndex];
      return mapping;
    }, {});
    sc.fontsystem.font.setMapping(iconMapping);
  });

ig.module('menu-api')
  .requires(
    'menu-api.icons',
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

    sc.menuAPI.QuickAccessButtonsGui = ig.GuiElementBase.extend({
      buttons: [],

      init() {
        this.parent();
        this.updateButtons();
      },

      updateButtons() {
        for (let i = 0, len = this.buttons.length; i < len; i++) {
          this.removeChildGui(this.buttons[i]);
        }
        this.buttons.length = 0;

        let configs = [
          {
            id: 'modMenus',
            label: '\\i[menu-api-mod-menus]',
            onPress: openModMenus,
          },
          ...sc.menuAPI.quickAccessButtons,
        ];

        for (let i = 0, len = configs.length; i < len; i++) {
          this.addButton(configs[i], len);
        }
      },

      addButton(config, totalCount) {
        let btnType = sc.BUTTON_TYPE.DEFAULT;
        let index = this.buttons.length;
        if (totalCount != null && totalCount > 1) {
          if (index === 0) {
            btnType = sc.BUTTON_TYPE.GROUP_LEFT_MEDIUM;
          } else if (index === totalCount - 1) {
            btnType = sc.BUTTON_TYPE.GROUP_RIGHT_MEDIUM;
          } else {
            btnType = sc.BUTTON_TYPE.GROUP_MEDIUM;
          }
        }

        let btn = new sc.ButtonGui(config.label, config.width, true, btnType);
        if (config.width == null) {
          let width = Math.max(
            btn.textChild.hook.size.x +
              2 * this.constructor.BUTTON_PADDING_DEFAULT,
            btn.hook.size.y,
          );
          width = Math.ceil(width / 2) * 2;
          btn.setWidth(width);
        }
        btn.onButtonPress = config.onPress;
        if (typeof config.onCreate === 'function') config.onCreate.call(btn);

        btn.hook.pos.x = this.hook.size.x;
        this.hook.size.x += btn.hook.size.x;
        this.addChildGui(btn);
        this.buttons.push(btn);

        return btn;
      },
    });
    sc.menuAPI.QuickAccessButtonsGui.BUTTON_PADDING_DEFAULT = 8;

    function openModMenus() {
      sc.menu.setDirectMode(true, sc.MENU_SUBMENU.MOD_MENUS);
      sc.model.enterMenu(true);
    }

    sc.TitleScreenButtonGui.inject({
      modQuickAccessButtons: null,

      init(...args) {
        this.parent(...args);

        this.modQuickAccessButtons = new sc.menuAPI.QuickAccessButtonsGui();
        this.modQuickAccessButtons.setAlign(
          ig.GUI_ALIGN.X_LEFT,
          ig.GUI_ALIGN.Y_TOP,
        );
        this.modQuickAccessButtons.setPos(
          this.namedButtons.setOptions.hook.pos.x,
          this.changelogButton.hook.pos.y,
        );
        this.addChildGui(this.modQuickAccessButtons);

        let quickAccessBtnGuis = this.modQuickAccessButtons.buttons;

        let btnGroup = this.buttonGroup;
        let defaultBtnTransitions = this.changelogButton.hook.transitions;
        for (let i = 0, len = quickAccessBtnGuis.length; i < len; i++) {
          let btn = quickAccessBtnGuis[i];
          btn.hook.transitions = {
            DEFAULT: {
              state: {},
              time: defaultBtnTransitions.DEFAULT.time,
              timeFunction: defaultBtnTransitions.DEFAULT.timeFunction,
            },
            HIDDEN: {
              time: defaultBtnTransitions.HIDDEN.time,
              timeFunction: defaultBtnTransitions.HIDDEN.timeFunction,
              state: {
                offsetY: -(
                  this.modQuickAccessButtons.hook.pos.y +
                  btn.hook.pos.y +
                  btn.hook.size.y
                ),
              },
            },
          };
          btn.doStateTransition('HIDDEN', true);
          btnGroup.addFocusGui(btn, btnGroup.largestIndex.x + 1, 0);

          // Let's piggyback on the default implementation here instead of
          // rolling the more or less same loops in this mod. Unfortunately
          // `this.buttons` is iterated backwards in the game code, so I have to
          // push our buttons in the reverse order as well.
          this.buttons.push(quickAccessBtnGuis[len - i - 1]);
        }
      },
    });

    sc.PauseScreenGui.inject({
      modQuickAccessButtons: null,

      init(...args) {
        this.parent(...args);

        this.modQuickAccessButtons = new sc.menuAPI.QuickAccessButtonsGui();
        this.modQuickAccessButtons.setAlign(
          ig.GUI_ALIGN.X_LEFT,
          ig.GUI_ALIGN.Y_TOP,
        );
        this.modQuickAccessButtons.setPos(
          this.toTitleButton.hook.pos.x,
          this.toTitleButton.hook.pos.y,
        );
        this.addChildGui(this.modQuickAccessButtons);
      },

      updateButtons(...args) {
        this.parent(...args);

        let btnGroup = this.buttonGroup;
        let quickAccessBtnGuis = this.modQuickAccessButtons.buttons;
        for (let i = 0, len = quickAccessBtnGuis.length; i < len; i++) {
          let btn = quickAccessBtnGuis[i];
          btnGroup.addFocusGui(btn, btnGroup.largestIndex.x + 1, 0);
        }

        // TODO: is proper refocusing possible here?
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
