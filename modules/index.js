import Mn from 'backbone.marionette';
import $ from 'jquery';
import LayoutView from './Layout/LayoutView.js';
import AuthView from './Auth/AuthView.js';
import Mustache from 'mustache.js';
import Spinner from './Spinner/Spinner.js';


$(document).ready(() => {

  phantom.onConsoleMessage = function(msg) {
    console.log(msg);
  };

  Mn.Renderer.render = function(template, data) {
    var template = $(template).html();
    Mustache.parse(template);
    return Mustache.render(template, data);
  };

  window.app = new Mn.Application();


  app.startLoading = () => {
    Spinner.show();
  };

  app.stopLoading = () => {
    Spinner.hide();
  };

  app.rootView = new LayoutView();
  app.rootView.getRegion('login').show(new AuthView());

  app.start();
});
