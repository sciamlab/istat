/**
 * @author alteredq / http://alteredqualia.com/
 * @author mr.doob / http://mrdoob.com/
 */

var Detector = {

	canvas: !! window.CanvasRenderingContext2D,
	webgl: ( function () { try { var canvas = document.createElement( 'canvas' ); return !! window.WebGLRenderingContext && ( canvas.getContext( 'webgl' ) || canvas.getContext( 'experimental-webgl' ) ); } catch( e ) { return false; } } )(),
	workers: !! window.Worker,
	fileapi: window.File && window.FileReader && window.FileList && window.Blob,

	getWebGLErrorMessage: function () {

		var element = document.createElement( 'div' );
		element.id = 'webgl-error-message';
		element.style.fontFamily = 'monospace';
		element.style.fontSize = '13px';
		element.style.fontWeight = 'normal';
		element.style.textAlign = 'center';
		element.style.background = '#fff';
		element.style.color = '#000';
		element.style.padding = '1.5em';
		element.style.width = '450px';
		element.style.margin = '5em auto 0';

		if ( ! this.webgl ) {

			element.innerHTML = window.WebGLRenderingContext ? [
				'Your graphics card or your browser does not seem to support <a href="http://khronos.org/webgl/wiki/Getting_a_WebGL_Implementation" style="color:#000">WebGL</a>.<br />',
				'Find out how to get it <a href="http://get.webgl.org/" style="color:#000">here</a><br />.',
				'You can also try with browsers like <a href="http://www.mozilla.org/firefox" style="color:#000">Firefox</a> or <a href="https://www.google.com/chrome/browser/" style="color:#000">Chrome</a> ! <br /><br />',
				'La tua scheda grafica non sembra supporti <a href="http://khronos.org/webgl/wiki/Getting_a_WebGL_Implementation" style="color:#000">WebGL</a>.<br />',
				'Controlla esattamente come supportarla <a href="http://get.webgl.org/" style="color:#000">qui</a>.<br />',
				'Puoi anche provari con altri browser come <a href="http://www.mozilla.org/firefox" style="color:#000">Firefox</a> oppure <a href="https://www.google.com/chrome/browser/" style="color:#000">Chrome</a> ! <br /><br />'
			].join( '\n' ) : [
				'Your graphics card or your browser does not seem to support <a href="http://khronos.org/webgl/wiki/Getting_a_WebGL_Implementation" style="color:#000">WebGL</a>.<br />',
				'Find out how to get it <a href="http://get.webgl.org/" style="color:#000">here</a><br />.',
				'You can also try with browsers like <a href="http://www.mozilla.org/firefox" style="color:#000">Firefox</a> or <a href="https://www.google.com/chrome/browser/" style="color:#000">Chrome</a> ! <br /><br />',
				'La tua scheda grafica non sembra supporti <a href="http://khronos.org/webgl/wiki/Getting_a_WebGL_Implementation" style="color:#000">WebGL</a>.<br />',
				'Controlla esattamente come supportarla <a href="http://get.webgl.org/" style="color:#000">qui</a>.<br />',
				'Puoi anche provari con altri browser come <a href="http://www.mozilla.org/firefox" style="color:#000">Firefox</a> oppure <a href="https://www.google.com/chrome/browser/" style="color:#000">Chrome</a> ! <br /><br />'
			].join( '\n' );

		}

		return element;

	},

	addGetWebGLMessage: function ( parameters ) {

		var parent, id, element;

		parameters = parameters || {};

		parent = parameters.parent !== undefined ? parameters.parent : document.getElementById('3dcontainer');
		id = parameters.id !== undefined ? parameters.id : 'oldie';

		element = Detector.getWebGLErrorMessage();
		element.id = id;

		parent.appendChild( element );

	}

};
