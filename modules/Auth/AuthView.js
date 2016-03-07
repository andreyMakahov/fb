import Mn from 'backbone.marionette';
import ListView from '../List/ListView.js';
import MenuView from '../Menu/MenuView.js';
import $ from 'jquery';

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
			'click @ui.submitBtn': 'onLogin',
			'submit @ui.loginForm': 'onLogin'
		};
	}

	constructor() {
		super({
			template: '#LoginForm'
		});
		this.listIndex = 0;
	}

	onLogin(e) {
		e.preventDefault();
		
		let self = this;

		let email = this.ui.email.val();
		let password = this.ui.password.val();

		// todo че делать если не правильный пароль
		if(email.length && password.length) {
			app.startLoading();
			if(app.authorized) {
				this.logout()
				.then(() => {
					this.login(email, password);
				})
			} else {
				this.login(email, password);
			}
		}
	}

	login(email, password) {
		if(app.pageOnened) {
			page.evaluate(function() {
				location.href = 'https://facebook.com/login';
			});
			setTimeout(() => {
				this._login(email, password);
			}, 3000)
		} else {
			page.open('https://facebook.com/login')
			.then(() => {
				app.pageOnened = true;
				this._login(email, password);
			});
		}
	}

	_login(email, password) {
		let self = this;
		page.evaluate(function(params) {
		    var emailInput = document.getElementsByName("email")[0];
			var passInput = document.getElementsByName("pass")[0];
			var form = document.getElementById('login_form');
			emailInput.value = params.email;
			passInput.value = params.password;
			
			return form.submit();
		}, {
			email: email,
			password: password
		})
		.then(() => {
			setTimeout(() => {
				page.evaluate(function() {
		    		return document.querySelectorAll('[data-ownerid="pass"]').length;
				})
				.then((error) => {

					app.stopLoading();
					if(error) {
						alert('Неправильный пароль');
						this.ui.password.val('');
					} else {
						self.remove();
						app.rootView.getRegion('menu').show(new MenuView());
						app.authorized = true;
					}
				});
			}, 2000);
		});
	}

	logout() {
		let defer = $.Deferred();
		page.evaluate(function() {
			location.href = 'https://facebook.com/login';
		});
		setTimeout(() => {
			page.render('aaa.png')
			page.evaluate(function() {
				document.getElementById('userNavigationLabel').click();
			});
			setTimeout(() => {
				page.evaluate(function() {
					document.getElementsByClassName('_w0d')[0].parentNode.parentNode.parentNode.click();
				})
				.then(function() {
					setTimeout(function() {
						defer.resolve();
					}, 2000);
				})
			}, 3000);
		}, 3000);

		return defer.promise();
	}

}

export default AuthView;
