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
    'impact.feature.gui.base.box',
    'game.feature.gui.base.button',
    'impact.feature.bgm.bgm',
    'impact.feature.interact.interact',
    'impact.feature.interact.button-interact',
    'game.feature.interact.button-group',
    'game.feature.menu.gui.list-boxes',
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

    sc.TitleScreenButtonGui.inject({
      modMenusButton: null,

      init() {
        this.parent();

        this.modMenusGui = new sc.menuAPI.ModsGui(this);

        let optionsBtn = this.namedButtons.setOptions;
        optionsBtn.bgGui.ninepatch = sc.BUTTON_TYPE.GROUP_LEFT_MEDIUM.ninepatch;
        optionsBtn.bgGui.currentTileOffset =
          sc.BUTTON_TYPE.GROUP_LEFT_MEDIUM.ninepatch.tile.offsets.default;
        optionsBtn.highlightGui.highlight =
          sc.BUTTON_TYPE.GROUP_LEFT_MEDIUM.highlight;
        optionsBtn.highlightGui.pattern =
          sc.BUTTON_TYPE.GROUP_LEFT_MEDIUM.highlight.pattern;
        optionsBtn.highlightGui.gfx =
          sc.BUTTON_TYPE.GROUP_LEFT_MEDIUM.highlight.gfx;

        let modMenusBtn = new sc.ButtonGui(
          '+',
          24,
          true,
          sc.BUTTON_TYPE.GROUP_RIGHT_MEDIUM,
        );
        this.modMenusButton = modMenusBtn;

        modMenusBtn.setAlign(ig.GUI_ALIGN.X_RIGHT, ig.GUI_ALIGN.Y_TOP);
        modMenusBtn.hook.transitions = {
          DEFAULT: {
            ...optionsBtn.hook.transitions.DEFAULT,
            state: { offsetX: -modMenusBtn.hook.size.x },
          },
          HIDDEN: {
            ...optionsBtn.hook.transitions.HIDDEN,
            state: {},
          },
        };
        modMenusBtn.doStateTransition('HIDDEN', true);

        modMenusBtn.onButtonPress = () => {
          ig.bgm.pause('SLOW');
          ig.interact.removeEntry(this.buttonInteract);
          this.background.doStateTransition('DEFAULT');

          this.modMenusGui.takeControl();
        };

        optionsBtn.insertChildGui(modMenusBtn, 0);
        this.buttonGroup.addFocusGui(modMenusBtn, 1, 4);
      },

      postInit(...args) {
        this.parent(...args);
        this.addChildGui(this.modMenusGui);
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

    sc.menuAPI.ModsGui = ig.GuiElementBase.extend({
      transitions: {
        DEFAULT: {
          state: {},
          time: 0.5,
          timeFunction: KEY_SPLINES.EASE,
        },
        HIDDEN: {
          state: {},
          time: 0.5,
          timeFunction: KEY_SPLINES.EASE,
        },
      },

      init(titleButtons) {
        this.parent();
        this.setSize(ig.system.width, ig.system.height);
        this.hook.transitions.HIDDEN.state.offsetY = ig.system.height;
        this.doStateTransition('HIDDEN', true);

        this.titleButtons = titleButtons;

        this.interact = new ig.ButtonInteractEntry();
        this.group = new sc.ButtonGroup();
        this.interact.pushButtonGroup(this.group);

        let back = new sc.ButtonGui('Back');
        back.setAlign(ig.GUI_ALIGN.X_LEFT, ig.GUI_ALIGN.Y_TOP);
        back.setPos(12, 12);
        back.onButtonPress = () => {
          ig.interact.removeEntry(this.interact);
          this.doStateTransition('HIDDEN');

          this.titleButtons.background.doStateTransition('HIDDEN');
          ig.interact.addEntry(this.titleButtons.buttonInteract);
          ig.bgm.resume('SLOW');
        };
        this.group.addFocusGui(back, 0, 0);
        this.addChildGui(back);

        this.buttonWidth = Math.floor((ig.system.width - 12) / 2);
        this.listBox = new sc.ButtonListBox(
          0,
          0,
          20,
          2,
          0,
          this.buttonWidth,
          this.interact,
        );
        let border = 4;
        this.listBox.setPos(border, 36 + border);
        this.listBox.setSize(
          ig.system.width - border * 2,
          ig.system.height - 36 - (border * 2 + 8),
        );
        this.listBox.setButtonGroup(this.group);
        this.addChildGui(this.listBox);

        for (let i = 0; i < sc.menuAPI.buttons.length; i++) {
          let bt = new sc.ButtonGui(
            sc.menuAPI.buttons[i].text,
            this.buttonWidth,
          );
          bt.onButtonPress = sc.menuAPI.buttons[i].runnable;
          this.listBox.addButton(bt, true);
          this.group.insertFocusGui(bt, i % 2, 1 + Math.floor(i / 2));
        }
      },

      takeControl() {
        this.doStateTransition('DEFAULT');
        ig.interact.addEntry(this.interact);
      },
    });
  });
