const CONFIG_KEY = "config";

// Get setting from local storage
const savedSetting = JSON.parse(
    localStorage.getItem(CONFIG_KEY)
);

// Get element from screen
const elm_askBeforeDone = document.getElementById("conf-ask_before_done");
const elm_successNotify = document.getElementById("conf-success_notify");
const elm_longPressPay = document.getElementById("conf-long_press_pay");

// config KEYs
const CONF_ASK_BEFORE_DONE = elm_askBeforeDone.value;
const CONF_SUCCESS_NOTIFY = elm_successNotify.value;
const CONF_LONG_PRESS_PAY = elm_longPressPay.value;

const config = {
    state: {},
    renderSavedSettingToScreen() {
        elm_askBeforeDone.checked = this.state[CONF_ASK_BEFORE_DONE];
        elm_successNotify.checked = this.state[CONF_SUCCESS_NOTIFY];
        elm_longPressPay.checked = this.state[CONF_LONG_PRESS_PAY];

        this.listenEvent(
            [
                elm_askBeforeDone,
                elm_successNotify,
                elm_longPressPay
            ]
        );
    },
    listenEvent(listElms) {
        listElms.forEach(elm => {
            elm.onchange = e => {
                this.state[e.target.value] = e.target.checked;
                this.syncToStorage();
            };
        });
    },
    syncToStorage() {
        localStorage.setItem(
            CONFIG_KEY,
            JSON.stringify(this.state)
        );
    },
    init() {
        // If has save setting then:
        if (savedSetting) {
            // Asign to state variable 
            this.state = savedSetting;
            // Render state to screen (reflect state to checkbox)
            this.renderSavedSettingToScreen();
        }
        // If not then init for it
        else {
            this.state[CONF_ASK_BEFORE_DONE] = true;
            this.state[CONF_SUCCESS_NOTIFY] = true;
            this.state[CONF_LONG_PRESS_PAY] = true;

            // Sync to local storage
            this.syncToStorage();
        }
    }
}

config.init();