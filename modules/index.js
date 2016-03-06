import $ from 'jquery';
import Mn from 'backbone.marionette';
import Router from './Router/Router.js';
import LayoutView from './Layout/LayoutView.js';
import AuthView from './Auth/AuthView.js';

$(document).ready(() => {

	phantom.onConsoleMessage = function (msg) {
		console.log(msg);
	};

	window.app = new Mn.Application();

	app.rootView = new LayoutView();
	app.rootView.getRegion('login').show(new AuthView());
	
	app.start();
});