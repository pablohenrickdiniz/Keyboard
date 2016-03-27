(function(window){
    var KeyReader = function (element) {
        var self = this;
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

    KeyReader.prototype.key = function (name) {
        if (KeyReader.Keys[name] !== undefined) {
            return KeyReader.Keys[name];
        }
        return null;
    };


    KeyReader.prototype.on = function (sequence, callback) {
        var self = this;
        sequence = sequence.map = function(name){
            return KeyReader.Keys[name];
        };

        self.on_sequence_callbacks.push({
            sequence: sequence,
            callback: callback
        });
    };

    KeyReader.prototype.keydown = function(key,callback){
        var self = this;
        if(self.key_down_callbacks[key] === undefined){
            self.key_down_callbacks[key] = [];
        }
        self.key_down_callbacks[key].push(callback);
    };

    KeyReader.prototype.keyup = function(key,callback){
        var self = this;
        if(self.key_up_callbacks[key] === undefined){
            self.key_up_callbacks[key] = [];
        }
        self.key_up_callbacks[key].push(callback);
    };

    KeyReader.prototype.sequenceIs = function (sequence, ordered, exactLength) {
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

    KeyReader.prototype.denyAll = function () {
        this.deny = true;
    };

    KeyReader.prototype.allowAll = function () {
        this.deny = false;
    };

    KeyReader.prototype.allow = function () {
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

    KeyReader.prototype.initialize = function () {
        var self = this;
        $(document).ready(function () {
            console.log('key reader initialize...');
            $(self.element).attr('tabindex', 1);
            $(self.element).on('click',function () {
                $(this).focus();
            });
            $(self.element).on('keydown',function (e) {
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
            });

            $(self.element).on('keyup',function (e) {
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
            });
        });
    };

    KeyReader.Keys = {
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

    KeyReader.prototype.isActive = function(name){
       var self = this;
       var key = KeyReader.Keys[name];
       if(key !== undefined){
           return self.keys[key] !== undefined && self.keys[key] === true;
       }
       return false;
    };

    window.KeyReader = KeyReader;
})(window);