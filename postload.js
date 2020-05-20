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
    'game.feature.gui.base.button',
    'impact.feature.bgm.bgm',
    'impact.feature.interact.interact',
    'impact.feature.interact.button-interact',
    'game.feature.interact.button-group',
    'game.feature.menu.gui.list-boxes',
  )
  .defines(() => {
    sc.TitleScreenButtonGui.inject({
      modMenusButton: null,

      init() {
        this.parent();

        this.modMenusGui = new sc.menuAPI.ModsGui(this);

        this.modMenusButton = new sc.ButtonGui('+', 32);
        this.modMenusButton.setAlign(
          ig.GUI_ALIGN.X_LEFT,
          ig.GUI_ALIGN.Y_BOTTOM,
        );
        this.modMenusButton.setPos(160, 40);
        this.modMenusButton.hook.transitions = {
          DEFAULT: {
            state: {},
            time: 0.4,
            timeFunction: KEY_SPLINES.LINEAR,
          },
          HIDDEN: {
            state: {
              offsetX: -192,
              alpha: 0,
            },
            time: 0.4,
            timeFunction: KEY_SPLINES.LINEAR,
          },
        };

        this.modMenusButton.onButtonPress = () => {
          ig.bgm.pause('SLOW');
          ig.interact.removeEntry(this.buttonInteract);
          this.background.doStateTransition('DEFAULT');

          this.modMenusGui.takeControl();
        };

        this.modMenusButton.doStateTransition('HIDDEN', true);
        this.insertChildGui(this.modMenusButton, 0);
        this.buttonGroup.addFocusGui(this.modMenusButton, 1, 4);
      },

      postInit(...args) {
        this.parent(...args);
        this.addChildGui(this.modMenusGui);
      },

      hide(a) {
        this.parent(a);
        this.modMenusButton.doStateTransition('HIDDEN', a);
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
