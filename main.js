/*
 * Copyright (c) 2012 Adobe Systems Incorporated. All rights reserved.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 *
 */


/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global define, brackets, $ */

define(function (require, exports, module) {
	'use strict';
	
	// Brackets modules
	var EditorManager           = brackets.getModule("editor/EditorManager"),
		ProjectManager          = brackets.getModule("project/ProjectManager");
	
	// Local modules
	var InlineColorPicker       = require("InlineColorPicker");

	function loadCSS() {
		$("<link rel='stylesheet' type='text/css'>").attr("href", require.toUrl("css/colorpicker.css")).appendTo(window.document.head);
	}
	
	// Return the token string that is at the specified position.
	function getColorTokenAtPos(hostEditor, pos) {
		var token = hostEditor._codeMirror.getTokenAt(pos);

		// If the pos is at the beginning of a name, token will be the
		// preceding whitespace or dot. In that case, try the next pos.
		if (token.string.trim().length === 0 || token.string === ".") {
			token = hostEditor._codeMirror.getTokenAt({line: pos.line, ch: pos.ch + 1});
		}
		
		if (token.className === "atom") {
			// check for #...
			var string = token.string;
			
			if (string.match(/^#[0-9a-f]{3}$/i) || string.match(/^#[0-9a-f]{6}$/i)) {
				return token;
			}
			return null;
		}
		
		return null;
	}

	function colorPickerProvider(hostEditor, pos) {
		
		// Only provide color picker if there is a HEX color under the cursor
		var colorToken = getColorTokenAtPos(hostEditor, pos);
		if (!colorToken) return null;

		var color = colorToken.string.substr(1);
		pos.ch = colorToken.start + 1;

		var colorPicker = new InlineColorPicker(color, pos);
		colorPicker.load(hostEditor);
		
		var result = new $.Deferred();
		result.resolve(colorPicker);
		return result.promise();
	}

	function init() {
		loadCSS();
		EditorManager.registerInlineEditProvider(colorPickerProvider);
	}

	function unload() {
		// this is missing
		// EditorManager.unregisterInlineEditProvider(colorPickerProvider);
	}

	$(init);

	exports.init = init;
	exports.unload = unload;
});
