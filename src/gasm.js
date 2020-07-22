// CodeMirror, copyright (c) by Marijn Haverbeke and others
// Distributed under an MIT license: http://codemirror.net/LICENSE

(function(mod) {
    if (typeof exports == "object" && typeof module == "object") // CommonJS
	mod(require("../../lib/codemirror"));
    else if (typeof define == "function" && define.amd) // AMD
	define(["../../lib/codemirror"], mod);
    else // Plain browser env
	mod(CodeMirror);
})(function(CodeMirror) {
    "use strict";

    CodeMirror.defineMode('gasm', function() {
	var instructions = /^(add|addc|sub|subc|and|or|xor|mask|shl|shr|rol|ror|ldm|stm|inp|out|bz|bnz|bc|bnc|jmp|jsb|ret|reti|enai|disi|wait|stby)\b/i;
	var directives = /^(text|data|org)\b/i;
	var variables = /^(byte|bss|equ|ascii|asciz)\b/i;
	var labels = /^([a-z0-9-_]+):/i;
	var numbers = /^(0x[\da-f]*|bx[01]*|Bx[01]*|\d+)\b/i;

	return {
	    startState: function() {
		return {context: 0};
	    },
	    token: function(stream, state) {
		if (!stream.column())
		    state.context = 0;

		if (stream.eatSpace())
		    return null;

		var w;

		if (stream.eatWhile(/[a-z0-9-_:]/i)) {
		    w = stream.current();

		    if (labels.test(w))
			return 'tag';
		    if (variables.test(w))
			return 'keyword';

		    if (instructions.test(w))
			return 'keyword';

		    if (directives.test(w))
			return 'def';

		    if (numbers.test(w)) {
			return 'number';
		    }

		    return null;
		} else if (stream.eat(';')) {
		    stream.skipToEnd();
		    return 'comment';
		} else if (stream.eat('"')) {
		    while (w = stream.next()) {
			if (w == '"')
			    break;

			if (w == '\\')
			    stream.next();
		    }
		    return 'string';
		}
		stream.next();
		return null;
	    }
	};
    });

    CodeMirror.defineMIME("text/x-gasm", "gasm");

});
