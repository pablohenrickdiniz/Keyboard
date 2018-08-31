'use strict';
(function (w) {
    let letter_codes = {
        BACK_TAB: 8,
        TAB: 9,
        ENTER: 13,
        SH_TAB: 16,
        CTRL: 17,
        ALT_GR: 18,
        ESC: 27,
        SPACE: 32,
        END: 35,
        BEGIN: 36,
        LEFT: 37,
        UP: 38,
        RIGHT: 39,
        DOWN: 40,
        DEL: 46,
        A: 65,
        B: 66,
        C: 67,
        D: 68,
        E: 69,
        F: 70,
        G: 71,
        H: 72,
        I: 73,
        J: 74,
        K: 75,
        L: 76,
        M: 77,
        N: 78,
        O: 79,
        P: 80,
        Q: 81,
        R: 82,
        S: 83,
        T: 84,
        U: 85,
        V: 86,
        W: 87,
        X: 88,
        Y: 89,
        Z: 90,
        PLUS: 107,
        MINUS: 109,
        F1: 112,
        F2: 113,
        F3: 114,
        F4: 115,
        F5: 116,
        F6: 117,
        F7: 118,
        F8: 119,
        F9:120,
        F10:121,
        F11:122,
        F12:123,
        LT: 188,
        GT: 190,
        SBR: 220,
        SBL: 221
    };

    let numeric_codes =
    {
        0: [48, 96],
        1: [49, 97],
        2: [50, 98],
        3: [51, 99],
        4: [52, 100],
        5: [53, 101],
        6: [54, 102],
        7: [55, 103],
        8: [56, 104],
        9: [57, 150]
    };

    /**
     *
     * @param code
     * @returns {boolean}
     */
    function isNumericCode(code) {
        for (let i = 0; i <= 9; i++) {
            if (numeric_codes[i].indexOf(code) !== -1) {
                return true;
            }
        }
        return false;
    }

    /**
     *
     * @param code
     * @returns {*}
     */
    function getCodeNumber (code) {
        for (let i = 0; i <= 9; i++) {
            let index = numeric_codes[i].indexOf(code);
            if (index !== -1) {
                return i;
            }
        }
        return null;
    }

    /**
     *
     * @param code
     * @param sequence
     * @returns {boolean}
     */
    function sequenceContainsNumeric(code, sequence) {
        let length = sequence.length;
        for (i = 0; i < length; i++) {
            if (getCodeNumber(sequence[i]) === getCodeNumber(code)) {
                return true;
            }
        }
        return false;
    }

    /**
     *
     * @param string
     * @returns {string}
     */
    function  cleanShortcut(string) {
        return string.replace(/\s/g, '').toUpperCase();
    }

    /**
     *
     * @param shortcut
     * @returns {Array}
     */
    function shortcutToKeycode(shortcut) {
        let keySequence = [];
        let letter_keys = Object.keys(letter_codes);
        shortcut = shortcut.split('+');
        let length = shortcut.length;
        let i;
        for (i = 0; i < length; i++) {
            if (numeric_codes[shortcut[i]] !== undefined) {
                keySequence.push(numeric_codes[shortcut[i]]);
            }
            else if (letter_keys.indexOf(shortcut[i]) !== -1) {
                keySequence.push(letter_codes[shortcut[i]]);
            }
        }
        return keySequence;
    }

    /**
     *
     * @param code
     * @returns {*}
     */
    function keyCodeToName(code) {
        let keys = Object.keys(letter_codes);
        let length = keys.length;
        let i;
        let key;
        for (i = 0; i < length; i++) {
            key = keys[i];
            if (letter_codes[key] === code) {
                return key;
            }
        }

        for (i = 0; i <= 9; i++) {
            if (numeric_codes[i].indexOf(code) !== -1) {
                return i + '';
            }
        }

        return null;
    }

    /**
     *
     * @param keySequence
     * @returns {string}
     */
    function keySequenceToShortcut(keySequence) {
        let lengthB = keySequence.length;
        let i;
        let shortcut = [];
        for (i = 0; i < lengthB; i++) {
            let keyName = keyCodeToName(keySequence[i]);
            if (keyName != null) {
                shortcut.push(keyName);
            }
        }

        return shortcut.join('+');
    }

    /**
     *
     * @param shortcutA
     * @param shortcutB
     * @returns {boolean}
     */
    function compareShortcut(shortcutA, shortcutB) {
        let lengthA = shortcutA.length;
        let lengthB = shortcutB.length;

        if (lengthA !== lengthB) {
            return false;
        }

        for (i = 0; i < lengthA && i < lengthB; i++) {
            if (((isNumericCode(shortcutA[i]) || isNumericCode(shortcutB[i])) && (getCodeNumber(shortcutA[i]) !== getCodeNumber(shortcutB[i])) || shortcutA[i] !== shortcutB[i])) {
                return false;
            }
        }

        return true;
    }

    /**
     *
     * @param sca
     * @param array
     * @returns {number}
     */
    function indexOfShortcut(sca, array) {
        let length = array.length;
        let scb = null;

        for (i = 0; i < length; i++) {
            scb = array[i];
            if (sca.callback === scb.callback && compareShortcut(sca.shortcut, scb.shortcut)) {
                return i;
            }
        }
        return -1;
    }

    /**
     *
     * @param self
     */
    function initialize(self) {
        let element = null;

        Object.defineProperty(self, 'element', {
            get: function () {
                return element;
            },
            set: function (e) {
                if (e instanceof  Element && element !== e) {
                    self.unbind();
                    element = e;
                    self.bind();
                }
            }
        });

        Object.defineProperty(self,'currentShortcut',{
            /**
             *
             * @returns {string}
             */
            get:function(){
                return keySequenceToShortcut(self.key_sequence)
            }
        });

        self.click_event = function () {
            self.element.focus();
        };

        self.keydown_event = function (e) {
            let which = e.which;
            if(self.propagate.indexOf(which) === -1){
                e.preventDefault();
            }

            if (self.state[which] !== true) {
                self.state[which] = true;
                let i;
                let length;

                let changed = false;

                if (isNumericCode(which)) {
                    if (!sequenceContainsNumeric(which, self.key_sequence)) {
                        self.key_sequence.push(which);
                        changed = true;
                    }
                }
                else {
                    if (self.key_sequence.indexOf(which) === -1) {
                        self.key_sequence.push(which);
                        changed = true;
                    }
                }

                if (changed) {
                    length = self.state_change_listeners.length;
                    for (i = 0; i < length; i++) {
                        self.state_change_listeners[i]();
                    }
                }

                length = self.shortcut_listeners.length;
                for (i = 0; i < length; i++) {
                    let shortcut_callback = self.shortcut_listeners[i];
                    if (compareShortcut(shortcut_callback.shortcut, self.key_sequence)) {
                        shortcut_callback.callback();
                    }
                }
            }
        };

        self.keyup_event = function (e) {
            let which = e.which;
            e.preventDefault();
            self.state[which] = false;
            let index = self.key_sequence.indexOf(which);
            if (index !== -1) {
                self.key_sequence.splice(index, 1);
                let length = self.state_change_listeners.length;
                let i;
                for (i = 0; i < length; i++) {
                    self.state_change_listeners[i]();
                }
            }
        };

        self.blur_event = function (e) {
            e.preventDefault();
            let keys = Object.keys(self.state);
            let length = keys.length;
            let i;
            let key;

            for (i = 0; i < length; i++) {
                key = keys[i];
                self.state[key] = false;
            }

            self.key_sequence = [];
            length = self.state_change_listeners.length;
            for (i = 0; i < length; i++) {
                self.state_change_listeners[i]();
            }
        };

        self.bind();
    }

    let Keyboard = function (options) {
        let self = this;
        initialize(self);
        self.element = options.element || null;
        self.key_sequence = [];
        self.shortcut_listeners = [];
        self.state_change_listeners = [];
        self.state = {};
        self.propagate = options.propagate || [];
    };

    let keys = Object.keys(letter_codes);
    let length = keys.length;
    let i;
    for (i = 0; i < length; i++) {
        let key = keys[i];
        Keyboard[key] = letter_codes[key];
    }

    Keyboard.prototype.addShortcutListener = function (str, callback) {
        let self = this;
        str = cleanShortcut(str);
        let shortcut = shortcutToKeycode(str);

        let sc = {
            shortcut: shortcut,
            callback: callback
        };

        if (indexOfShortcut(sc, self.shortcut_listeners) === -1) {
            self.shortcut_listeners.push(sc);
        }
        else {
            console.error('This callback is already registered with shortcut \'' + str + '\'');
        }
    };

    Keyboard.prototype.removeShortcutListener = function (shortcut, callback) {
        let self = this;
        let sc = {
            shortcut: shortcut,
            callback: callback
        };
        let index = indexOfShortcut(sc, self.shortcut_listeners);
        if (index !== -1) {
            self.shortcut_listeners.splice(index, 1);
        }
    };

    Keyboard.prototype.addStateChangeListener = function (callback) {
        let self = this;
        if (self.state_change_listeners.indexOf(callback) === -1) {
            self.state_change_listeners.push(callback);
        }
    };

    Keyboard.prototype.removeStateChangeListener = function (callback) {
        let self = this;
        let index = self.state_change_listeners.indexOf(callback);
        if (index !== -1) {
            self.state_change_listeners.splice(index, 1);
        }
    };

    Keyboard.prototype.unbind = function(){
        let self = this;
        let element = self.element;
        if(element != null){
            element.removeEventListener('click', self.click_event);
            element.removeEventListener('keydown', self.keydown_event);
           // element.removeEventListener('keypress', self.keydown_event);
            element.removeEventListener('keyup', self.keyup_event);
            element.removeEventListener('blur', self.blur_event);
        }
        w.removeEventListener('blur', self.blur_event);
    };

    Keyboard.prototype.bind = function(){
        let self = this;
        self.unbind();
        let element = self.element;
        if(element != null){
            element.setAttribute('tabindex', 1);
            element.addEventListener('click', self.click_event);
            element.addEventListener('keydown', self.keydown_event);
           //element.addEventListener('keypress', self.keydown_event);
            element.addEventListener('keyup', self.keyup_event);
            element.addEventListener('blur', self.blur_event);
        }
        w.addEventListener('blur', self.blur_event);
    };

    w.Keyboard = Keyboard;
})(window);