import page from 'page';
import AuthView from '../Auth/AuthView.js';

class Router {
	constructor(options) {

		page('/index.html', function(ctx, next) {
			app.rootView.getRegion('login').show(new AuthView());
		});

		page(options);
	}
}

export default Router;