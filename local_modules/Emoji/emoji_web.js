// Copyright (c) 2014-2017, MyMonero.com
//
// All rights reserved.
//
// Redistribution and use in source and binary forms, with or without modification, are
// permitted provided that the following conditions are met:
//
// 1. Redistributions of source code must retain the above copyright notice, this list of
//	conditions and the following disclaimer.
//
// 2. Redistributions in binary form must reproduce the above copyright notice, this list
//	of conditions and the following disclaimer in the documentation and/or other
//	materials provided with the distribution.
//
// 3. Neither the name of the copyright holder nor the names of its contributors may be
//	used to endorse or promote products derived from this software without specific
//	prior written permission.
//
// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY
// EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
// MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL
// THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
// SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
// PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
// INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT,
// STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF
// THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
//
"use strict"
//	
const emojione = require('./Vendor/emojione.min')
emojione.imageType = "png" // png instead of svg as svg appear too slow to display en-masse
emojione.sprites = true
//
const Views__cssRules = require('../Views/cssRules.web')
function stylesheetPaths_generatorFn(context)
{
	const assetsPath = context.crossPlatform_appBundledIndexRelativeAssetsRootPath
	const stylesheetPaths =
	[
		`${assetsPath}Emoji/Vendor/emojione.min.css`,
		`${assetsPath}Emoji/Vendor/emojione.spritesheet.css`
	]
	return stylesheetPaths
}
function __injectCSS_ifNecessary(context) 
{
	Views__cssRules.InjectCSSFiles_ifNecessary(
		stylesheetPaths_generatorFn,
		context
	) 
}
//
var cached_spritesheetImage;
function PreLoadAndSetUpEmojiOne(context)
{ // ^ be sure to call this in order to inject the stylesheets
	// preload sprites to prevent delay
	if (context.Emoji_renderWithNativeEmoji !== true) {
		const image = new Image()
		image.src = context.crossPlatform_appBundledIndexRelativeAssetsRootPath+"Emoji/Vendor/emojione.sprites.png"
		cached_spritesheetImage = image
		//
		__injectCSS_ifNecessary(context) // good time to do this
	}
}
exports.PreLoadAndSetUpEmojiOne = PreLoadAndSetUpEmojiOne
// 
function NativeEmojiTextToImageBackedEmojiText_orUnlessDisabled_NativeEmojiText(context, nativeEmojiText)
{
	if (context.Emoji_renderWithNativeEmoji !== true) {
		return nativeEmojiTextToImageBackedEmojiText(nativeEmojiText)
	}
	return nativeEmojiText
}
exports.NativeEmojiTextToImageBackedEmojiText_orUnlessDisabled_NativeEmojiText 
	= NativeEmojiTextToImageBackedEmojiText_orUnlessDisabled_NativeEmojiText
function nativeEmojiTextToImageBackedEmojiText(nativeEmojiText)
{
	if (typeof nativeEmojiText !== "string") { // to protect against numbers and such
		nativeEmojiText = "" + nativeEmojiText
	}
	// perhaps uncomment this in the near future, but ensure emoji font size (esp on retina):
	// if (process.platform === "darwin") { // because MacOS has good support for Emoji; add iOS here too
	// 	return nativeEmojiText
	// }
	const text = emojione.unicodeToImage(nativeEmojiText)
	return text
}