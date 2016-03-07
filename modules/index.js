import Mn from 'backbone.marionette';
import Mustache from 'mustache.js';


import $ from 'jquery';

import Router from './Router/Router.js';
import LayoutView from './Layout/LayoutView.js';
import AuthView from './Auth/AuthView.js';

Mn.Renderer.render = function(template, data){
	console.log(Mustache, template, data);
  return Mustache.render(document.querySelector(template).innerText, data);
};

$(document).ready(() => {

	phantom.onConsoleMessage = function (msg) {
		console.log(msg);
	};

	window.app = new Mn.Application();

	app.rootView = new LayoutView();
	app.rootView.getRegion('login').show(new AuthView());

	app.start();
});
