import Mn from 'backbone.marionette';

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
				emailInput.value = params.email;
				passInput.value = params.password;
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
			page.evaluate(function(params) {
			    location.href = 'https://www.facebook.com/bookmarks/lists';
			})
			.then(function() {
				setTimeout(function() {
					page.render('test.png');
				}, 3000);
			});
		}, 3000)
	}
}

export default AuthView;