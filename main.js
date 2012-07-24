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
/*global window, define, brackets, $ */

define(function (require, exports, module) {
	'use strict';

	// Brackets modules
	var EditorManager           = brackets.getModule("editor/EditorManager"),
		ProjectManager          = brackets.getModule("project/ProjectManager");

	// Local modules
	var InlineColorPicker       = require("InlineColorPicker");

	var _colorPickers = {};

	function loadCSS() {
		$("<link rel='stylesheet' type='text/css'>")
			.attr("href", require.toUrl("css/colorpicker.css"))
			.appendTo(window.document.head);
	}

	// Return the token string that is at the specified position.
	function getColorTokenAtPos(hostEditor, pos) {
		var line = hostEditor._codeMirror.getLine(pos.line);
		var colors = line.split("#");
		
		var index = 0;
		for (var i in colors) {
			// skip the first match of the split operation (not a color)
			if (index > 0) {
				// match a color (3 or 6 hex characters)
				var matches = colors[i].match(/^[0-9a-f]{3,6}/i);
				if (matches.length > 0 && (matches[0].length === 3 || matches[0].length === 6)) {
					// return the token if the cursor is located inside the color
					if (pos.ch - 1 <= index + matches[0].length) {
						return { string: matches[0], start: index };
					}
				}
			}
			// advance the index and stop if we are beyond the cursor position
			// pos.ch - 1 is countered by index - 1
			// (a cursor positioned on the # should also match the color)
			index += colors[i].length + 1;
			if (index > pos.ch) {
				break;
			}
		}

		return null;
	}

	// remove a closed color picker from the index
	function onClose(colorPicker) {
		delete _colorPickers[colorPicker.pos.line];
	}

	// provide a new color picker or close an existing one
	function colorPickerProvider(hostEditor, pos) {

		// Only provide color picker if there is a HEX color under the cursor
		var colorToken = getColorTokenAtPos(hostEditor, pos);
		if (!colorToken) {
			return null;
		}

		// update the position to the color start
		pos.ch = colorToken.start;

		// get an existing color picker and close it
		var colorPicker = _colorPickers[pos.line];
		if (colorPicker) {
			colorPicker.close();
			if (pos.ch === colorPicker.pos.ch) {
				return null;
			}
		}


		// create a new color picker
		colorPicker = new InlineColorPicker(colorToken.string, pos);
		colorPicker.onClose = onClose;
		colorPicker.load(hostEditor);
		_colorPickers[pos.line] = colorPicker;

		// resolve
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
