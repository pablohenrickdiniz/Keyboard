(function(w){
    var KeyboardReader = function (element) {
        var self = this;
        if(!(element instanceof  Element)){
            throw new TypeError('Elemento inválido');
        }
        self.element = element;
        self.deny = false;
        self.key_sequence = [];
        self.allowed_sequences = [];
        self.last_key_down = null;
        self.last_key_up = null;
        self.on_sequence_callbacks = [];
        self.key_down_callbacks = [];
        self.key_up_callbacks = [];
        self.keys = [];
        self.initialize();
    };

    KeyboardReader.prototype.key = function (name) {
        if (KeyboardReader.Keys[name] !== undefined) {
            return KeyboardReader.Keys[name];
        }
        return null;
    };


    KeyboardReader.prototype.on = function (sequence, callback) {
        var self = this;
        sequence = sequence.map(function(name){
            return KeyboardReader.Keys[name];
        });

        self.on_sequence_callbacks.push({
            sequence: sequence,
            callback: callback
        });
    };

    KeyboardReader.prototype.keydown = function(key,callback){
        key = KeyboardReader.Keys[key];
        if(key !== undefined){
            var self = this;
            if(self.key_down_callbacks[key] === undefined){
                self.key_down_callbacks[key] = [];
            }
            self.key_down_callbacks[key].push(callback);
        }
    };

    KeyboardReader.prototype.keyup = function(key,callback){
        key = KeyboardReader.Keys[key];
        if(key !== undefined){
            var self = this;
            if(self.key_up_callbacks[key] === undefined){
                self.key_up_callbacks[key] = [];
            }
            self.key_up_callbacks[key].push(callback);
        }
    };

    KeyboardReader.prototype.sequenceIs = function (sequence, ordered, exactLength) {
        var self = this;
        ordered = ordered === undefined ? false : ordered;
        exactLength = exactLength === undefined ? false : exactLength;
        if (exactLength && sequence.length !== self.key_sequence.length) {
            return false;
        }

        for (var i = 0; i < sequence.length; i++) {
            if (ordered) {
                if (sequence[i] !== self.key_sequence[i]) {
                    return false;
                }
            }
            else {
                if (self.key_sequence.indexOf(sequence[i]) === -1) {
                    return false;
                }
            }
        }

        return true;
    };

    KeyboardReader.prototype.denyAll = function () {
        this.deny = true;
    };

    KeyboardReader.prototype.allowAll = function () {
        this.deny = false;
    };

    KeyboardReader.prototype.allow = function () {
        var self = this;
        var size = arguments.length;
        for (var i = 0; i < size; i++) {
            var sequence = arguments[i];
            if (!(sequence instanceof Array)) {
                sequence = [sequence];
            }
            self.allowed_sequences.push(sequence);
        }
    };

    KeyboardReader.prototype.initialize = function () {
        var self = this;
        self.click_event = function(){
            self.element.focus();
        };

        self.keydown_event = function (e) {
            var which = e.which;
            self.keys[which] = true;
            if (self.key_sequence.indexOf(which) === -1) {
                self.key_sequence.push(which);
            }

            if (self.deny) {
                var size = self.allowed_sequences.length;
                var allowed = false;
                for (var i = 0; i < size; i++) {
                    var sequence = self.allowed_sequences[i];
                    if (self.sequenceIs(sequence, false, true)) {
                        allowed = true;
                    }
                }
                if (!allowed) {
                    e.preventDefault();
                }
            }

            self.on_sequence_callbacks.forEach(function (sequence) {
                if (self.sequenceIs(sequence.sequence)) {
                    sequence.callback();
                }
            });

            if(self.key_down_callbacks[which] !== undefined){
                self.key_down_callbacks[which].forEach(function(callback){
                    callback();
                });
            }
        };

        self.keyup_event = function (e) {
            var which = e.which;
            self.keys[which] = false;
            var index = self.key_sequence.indexOf(which);
            if (index !== -1) {
                self.key_sequence.splice(index, 1);
            }
            if(self.key_up_callbacks[which] !== undefined){
                self.key_up_callbacks[which].forEach(function(callback){
                    callback();
                });
            }
        };

        self.fousout_event = function(){
            self.keys.forEach(function(active,which){
                if(active){
                    if(self.key_up_callbacks[which] !== undefined){
                        self.key_up_callbacks[which].forEach(function(callback){
                            callback();
                        });
                    }
                    self.keys[which] = false;
                }
            });
        };

        self.element.setAttribute('tabindex',1);
        self.element.addEventListener("click",self.click_event);
        self.element.addEventListener("keydown",self.keydown_event);
        self.element.addEventListener("keyup",self.keyup_event);
        self.element.addEventListener("focusout",self.fousout_event);
        window.addEventListener("resize",self.fousout_event);
    };

    KeyboardReader.prototype.setElement = function(element){
        var self= this;
        if(element instanceof  Element && element != self.element){
            self.element.removeEventListener("click",self.click_event);
            self.element.removeEventListener("keydown",self.keydown_event);
            self.element.removeEventListener("keyup",self.keyup_event);
            self.element.removeEventListener("focusout",self.fousout_event);
            window.removeEventListener("resize",self.fousout_event);
            self.element = element;
            self.initialize();
        }
    };

    KeyboardReader.Keys = {
        KEY_GT:190,
        KEY_LT:188,
        KEY_DOWN: 40,
        KEY_UP: 38,
        KEY_LEFT: 37,
        KEY_RIGHT: 39,
        KEY_END: 35,
        KEY_BEGIN: 36,
        KEY_BACK_TAB: 8,
        KEY_TAB: 9,
        KEY_SH_TAB: 16,
        KEY_ENTER: 13,
        KEY_ESC: 27,
        KEY_SPACE: 32,
        KEY_DEL: 46,
        KEY_A: 65,
        KEY_B: 66,
        KEY_C: 67,
        KEY_D: 68,
        KEY_E: 69,
        KEY_F: 70,
        KEY_G: 71,
        KEY_H: 72,
        KEY_I: 73,
        KEY_J: 74,
        KEY_K: 75,
        KEY_L: 76,
        KEY_M: 77,
        KEY_N: 78,
        KEY_O: 79,
        KEY_P: 80,
        KEY_Q: 81,
        KEY_R: 82,
        KEY_S: 83,
        KEY_T: 84,
        KEY_U: 85,
        KEY_V: 86,
        KEY_W: 87,
        KEY_X: 88,
        KEY_Y: 89,
        KEY_Z: 90,
        KEY_PLUS: 107,
        KEY_MINUS: 109,
        KEY_PF1: 112,
        KEY_PF2: 113,
        KEY_PF3: 114,
        KEY_PF4: 115,
        KEY_PF5: 116,
        KEY_PF6: 117,
        KEY_PF7: 118,
        KEY_PF8: 119,
        KEY_CTRL: 17,
        KEY_ALT_GR: 18,
        KEY_SBL: 221,
        KEY_SBR: 220
    };

    KeyboardReader.prototype.isActive = function(name){
        var self = this;
        var key = KeyboardReader.Keys[name];
        if(key !== undefined){
            return self.keys[key] !== undefined && self.keys[key] === true;
        }
        return false;
    };

    w.KeyboardReader = KeyboardReader;
})(window);