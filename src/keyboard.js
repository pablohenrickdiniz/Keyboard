(function (w) {
    var letter_codes = {
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
        LT: 188,
        GT: 190,
        SBR: 220,
        SBL: 221
    };

    var numeric_codes =
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

    var isNumericCode = function(code){
        for(var i =0; i <= 9;i++){
            if(numeric_codes[i].indexOf(code) != -1){
                return true;
            }
        }
        return false;
    };

    var getCodeNumber = function(code){
        for(var i =0; i <= 9;i++){
            var index = numeric_codes[i].indexOf(code);
            if(index != -1){
                return i;
            }
        }
        return null;
    };

    var sequenceContainsNumeric = function(code,sequence){
        var length = sequence.length;
        for(i = 0; i < length;i++){
            if(getCodeNumber(sequence[i]) == getCodeNumber(code)){
                return true;
            }
        }
        return false;
    };

    var cleanShortcut = function (string) {
        return string.replace(/\s/g, '').toUpperCase();
    };

    var shortcutToKeycode = function (shortcut) {
        var keySequence = [];
        var letter_keys = Object.keys(letter_codes);
        shortcut = shortcut.split('+');
        var length = shortcut.length;
        var i;
        for (i = 0; i < length; i++) {
            if(numeric_codes[shortcut[i]] != undefined){
                keySequence.push(numeric_codes[shortcut[i]]);
            }
            else if (letter_keys.indexOf(shortcut[i]) != -1) {
                keySequence.push(letter_codes[shortcut[i]]);
            }
        }
        return keySequence;
    };

    var keyCodeToName = function (code) {
        var keys = Object.keys(letter_codes);
        var length = keys.length;
        var i;
        var key;
        for (i = 0; i < length; i++) {
            key = keys[i];
            if (letter_codes[key] == code) {
                return key;
            }
        }

        for(i =0; i <= 9;i++){
            if(numeric_codes[i].indexOf(code) != -1){
                return i+'';
            }
        }

        return null;
    };

    var keySequenceToShortcut = function (keySequence) {
        var lengthB = keySequence.length;
        var i;
        var shortcut = [];
        for (i = 0; i < lengthB; i++) {
            var keyName = keyCodeToName(keySequence[i]);
            if (keyName != null) {
                shortcut.push(keyName);
            }
        }

        return shortcut.join('+');
    };

    var compareShortcut = function (shortcutA, shortcutB) {
        var lengthA = shortcutA.length;
        var lengthB = shortcutB.length;

        if (lengthA != lengthB) {
            return false;
        }

        for (i = 0; i < lengthA && i < lengthB; i++) {
            if(((isNumericCode(shortcutA[i]) || isNumericCode(shortcutB[i])) && (getCodeNumber(shortcutA[i]) != getCodeNumber(shortcutB[i])) || shortcutA[i] != shortcutB[i])){
                return false;
            }
        }

        return true;
    };

    var indexOfShortcut = function (sca, array) {
        var length = array.length;
        var scb = null;

        for (i = 0; i < length; i++) {
            scb = array[i];
            if (sca.callback == scb.callback && compareShortcut(sca.shortcut, scb.shortcut)) {
                return i;
            }
        }
        return -1;
    };


    var bind = function(){
        var self = this;
        self.element.setAttribute('tabindex', 1);
        self.element.addEventListener('click', self.click_event);
        self.element.addEventListener('keydown', self.keydown_event);
        self.element.addEventListener('keyup', self.keyup_event);
        self.element.addEventListener('blur', self.blur_event);
        w.addEventListener('blur', self.blur_event);
    };

    var unbind = function(){
        var self = this;
        self.element.removeEventListener('click', self.click_event);
        self.element.removeEventListener('keydown', self.keydown_event);
        self.element.removeEventListener('keypress', self.keydown_event);
        self.element.removeEventListener('keyup', self.keyup_event);
        self.element.removeEventListener('blur', self.blur_event);
        window.removeEventListener('blur', self.blur_event);
    };

    var initialize = function () {
        var self = this;
        self.click_event = function () {
            self.element.focus();
        };

        self.keydown_event = function (e) {
            var which = e.which;
            e.preventDefault();
            if (self.state[which] != true) {
                self.state[which] = true;
                var i;
                var length;

                var changed = false;

                if(isNumericCode(which)){
                    if(!sequenceContainsNumeric(which,self.key_sequence)){
                        self.key_sequence.push(which);
                        changed = true;
                    }
                }
                else{
                    if (self.key_sequence.indexOf(which) === -1) {
                        self.key_sequence.push(which);
                        changed = true;
                    }
                }

                if(changed){
                    length = self.state_change_callbacks.length;
                    for (i = 0; i < length; i++) {
                        self.state_change_callbacks[i]();
                    }
                }

                length = self.shortcut_callbacks.length;
                for (i = 0; i < length; i++) {
                    var shortcut_callback = self.shortcut_callbacks[i];
                    if (compareShortcut(shortcut_callback.shortcut, self.key_sequence)) {
                        shortcut_callback.callback();
                    }
                }
            }
        };

        self.keyup_event = function (e) {
            var which = e.which;
            e.preventDefault();
            self.state[which] = false;
            var index = self.key_sequence.indexOf(which);
            if (index !== -1) {
                self.key_sequence.splice(index, 1);
                var length = self.state_change_callbacks.length;
                var i;
                for (i = 0; i < length; i++) {
                    self.state_change_callbacks[i]();
                }
            }
        };

        self.blur_event = function () {
            var keys = Object.keys(self.state);
            var length = keys.length;
            var i;
            var key;
            var code;

            for (i = 0; i < length; i++) {
                key = keys[i];
                code = letter_codes[key];
                if (self.state[code]) {
                    self.state[code] = false;
                }
            }

            self.key_sequence = [];
            length = self.state_change_callbacks.length;
            for (i = 0; i < length; i++) {
                self.state_change_callbacks[i]();
            }
        };
        bind.apply(this);
    };

    var Keyboard = function (element) {
        var self = this;
        if (!(element instanceof  Element)) {
            throw new TypeError('Invalid Element!');
        }
        self.element = element;
        self.key_sequence = [];
        self.shortcut_callbacks = [];
        self.state_change_callbacks = [];
        self.state = {};
        initialize.apply(self);
    };

    var keys = Object.keys(letter_codes);
    var length = keys.length;
    var i;
    for (i = 0; i < length; i++) {
        var key = keys[i];
        Keyboard[key] = letter_codes[key];
    }


    Keyboard.prototype.addShortcutListener = function (str, callback) {
        var self = this;
        str = cleanShortcut(str);
        var shortcut = shortcutToKeycode(str);

        var sc = {
            shortcut: shortcut,
            callback: callback
        };

        if (indexOfShortcut(sc, self.shortcut_callbacks) == -1) {
            self.shortcut_callbacks.push(sc);
        }
        else {
            console.error('This callback is already registered with shortcut \'' + str + '\'');
        }
    };

    Keyboard.prototype.removeShortcutListener = function (shortcut, callback) {
        var self = this;
        var sc = {
            shortcut: shortcut,
            callback: callback
        };
        var index = indexOfShortcut(sc, self.shortcut_callbacks);
        if (index != -1) {
            self.shortcut_callbacks.splice(index, 1);
        }
    };

    Keyboard.prototype.addStateChangeListener = function (callback) {
        var self = this;
        if (self.state_change_callbacks.indexOf(callback) == -1) {
            self.state_change_callbacks.push(callback);
        }
    };

    Keyboard.prototype.removeStateChangeListener = function (callback) {
        var self = this;
        var index = self.state_change_callbacks.indexOf(callback);
        if (index != -1) {
            self.state_change_callbacks.splice(index, 1);
        }
    };

    Keyboard.prototype.setElement = function (element) {
        var self = this;
        if (element instanceof  Element && element != self.element) {
            unbind().apply(this);
            self.element = element;
            bind.apply(self);
        }
    };

    Keyboard.prototype.getCurrentShortcut = function () {
        var self = this;
        return keySequenceToShortcut(self.key_sequence)
    };

    w.Keyboard = Keyboard;
})(window);