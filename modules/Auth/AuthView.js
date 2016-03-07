import Mn from 'backbone.marionette';
import ELV from '../Events/EventsListView.js';

class AuthView extends Mn.LayoutView {

	ui () {
		return {
			email: '#inputEmail',
			password: '#inputPassword',
			submitBtn: '.js-login',
			loginForm: '.form-signin'
		};
	}

	events () {
		return {
			'click @ui.submitBtn': 'login',
			'submit @ui.loginForm': 'login'
		};
	}

	constructor() {
		super({
			template: '#LoginForm'
		});
	}

	login(e) {
		e.preventDefault();

		let self = this;

		let email = this.ui.email.val();
		let password = this.ui.password.val();

		page.open('https://facebook.com/login')
		.then(function(status) {
			page.evaluate(function(params) {
			    var emailInput = document.getElementsByName("email")[0];
				var passInput = document.getElementsByName("pass")[0];
				var form = document.getElementById('login_form');
				emailInput.value = 'mikrowelt@gmail.com';//params.email;
				passInput.value = 'QWERlmd23';//params.password;
				return form.submit();
			}, {
				email: email,
				password: password
			})
			.then(function() {
				self.goToLists();
			});
		});
	}

	goToLists() {
		setTimeout(function() {
			let elv = new ELV();
			console.log('go ELV', elv, app);
			app.rootView.getRegion('login').show(elv);
		}, 3000)
	}
}

export default AuthView;
