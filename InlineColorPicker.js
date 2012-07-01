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


/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define, brackets, $, window */

define(function (require, exports, module) {
	'use strict';

	// Load modules
	var InlineWidget = brackets.getModule("editor/InlineWidget").InlineWidget;
	var ColorPicker = require("ColorPicker");

	function InlineColorPicker(color, pos) {
		this.color = color;
		this.pos = pos;
		InlineWidget.call(this);
	}
	InlineColorPicker.prototype = new InlineWidget();
	InlineColorPicker.prototype.constructor = InlineColorPicker;
	InlineColorPicker.prototype.parentClass = InlineWidget.prototype;

	InlineColorPicker.prototype.color = null;
	InlineColorPicker.prototype.$wrapperDiv = null;

	InlineColorPicker.prototype.setColor = function (hex) {
		var end = { line: this.pos.line, ch: this.pos.ch + this.color.length };
		this.editor.document.replaceRange(hex, this.pos, end);
		this.color = hex;
	};

	InlineColorPicker.prototype.load = function (hostEditor) {
		var self = this;
		this.editor = hostEditor;
		this.parentClass.load.call(this, hostEditor);

		this.$wrapperDiv = $("<div>");
		this.$wrapperDiv.ColorPicker({
			flat: true,
			color: this.color,
			onChange: function (hsb, hex, rgb) {
				self.setColor(hex);
			}
		});

		this.$htmlContent.append(this.$wrapperDiv);
		this.$wrapperDiv.on('mousedown', this.onWrapperClick.bind(this));
	};

	// Close the color picker when clicking on the wrapper outside the picker
	InlineColorPicker.prototype.onWrapperClick = function (event) {
		event.preventDefault();
		if ($(event.target).closest('div.colorpicker').length === 0) {
			this.close();
		}
	};

	InlineColorPicker.prototype.close = function () {
		if (this.closed) return;
		this.closed = true;
		this.hostEditor.removeInlineWidget(this);
		if (this.onClose) this.onClose(this);
	};

	InlineColorPicker.prototype.onAdded = function () {
		window.setTimeout(this._sizeEditorToContent.bind(this));
	};

	InlineColorPicker.prototype._sizeEditorToContent = function () {
		this.hostEditor.setInlineWidgetHeight(this, this.$wrapperDiv.height(), true);
	};

	module.exports = InlineColorPicker;
});
