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
        for (let i = 0; i < length; i++) {
            if (getCodeNumber(sequence[i]) === getCodeNumber(code)) {
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
                return keySequenceToShortcut(self.keySequence)
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

            if (!self.state[which]) {
                self.state[which] = true;
                let eventName = ['state',keyCodeToName(which),'active'].join();
                self.trigger(eventName);
                let changed = false;
                if (isNumericCode(which)) {
                    if (!sequenceContainsNumeric(which, self.keySequence)) {
                        self.keySequence.push(which);
                        changed = true;
                    }
                }
                else {
                    if (self.keySequence.indexOf(which) === -1) {
                        self.keySequence.push(which);
                        changed = true;
                    }
                }

                if (changed) {
                    if(self.keySequence.length > 1){
                        self.trigger(['shortcut',keySequenceToShortcut(self.keySequence)].join(','));
                    }
                }
            }
        };

        self.keyup_event = function (e) {
            let which = e.which;
            e.preventDefault();
            if(self.state[which]){
                self.state[which] = false;
                self.trigger(['state',keyCodeToName(which),'inactive'].join());
                let index = self.keySequence.indexOf(which);
                if (index !== -1) {
                    self.keySequence.splice(index, 1);
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
                self.trigger(['state',keyCodeToName(key),'inactive'].join(','));
            }
            self.keySequence = [];
        };
        self.bind();
    }

    let Keyboard = function (options) {
        let self = this;
        initialize(self);
        self.element = options.element || null;
        self.keySequence = [];
        self.state = {};
        self.propagate = options.propagate || [];
        self.listeners = [];
    };

    let keys = Object.keys(letter_codes);
    let length = keys.length;
    let i;
    for (i = 0; i < length; i++) {
        let key = keys[i];
        Keyboard[key] = letter_codes[key];
    }

    /**
     *
     * @param eventName {string}
     * @param callback function}
     * @returns {Keyboard}
     */
    Keyboard.prototype.on = function(eventName,callback){
        let self = this;
        if(typeof callback === 'function'){
            if(self.listeners[eventName] === undefined){
                self.listeners[eventName] = [];
            }
            if(self.listeners.indexOf(callback) === -1){
                self.listeners[eventName].push(callback);
            }
        }
        return self;
    };

    /**
     *
     * @param eventName
     * @param callback
     * @returns {Keyboard}
     */
    Keyboard.prototype.off = function(eventName,callback){
        let self = this;
        if(self.listeners[eventName] !== undefined){
            if(typeof callback === 'function'){
                let index = self.listeners[eventName].indexOf(callback);
                if(index !== -1){
                    self.listeners[eventName].splice(index,1);
                }
                if(self.listeners[eventName].length === 0){
                    delete self.listeners[eventName];
                }
            }
            else{
                delete self.listeners[eventName];
            }
        }
        return self;
    };

    /**
     *
     * @param eventName
     * @param args
     * @returns {Keyboard}
     */
    Keyboard.prototype.trigger = function(eventName, args){
        let self = this;
        if(self.listeners[eventName] !== undefined){
            for(let i = 0;i < self.listeners[eventName].length;i++){
                self.listeners[eventName][i].apply(null,args);
            }
        }
        return self;
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