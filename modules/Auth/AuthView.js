import Mn from 'backbone.marionette';
import ListView from '../List/ListView.js';

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
		this.listIndex = 0;
	}

	login(e) {
		e.preventDefault();
		

		let self = this;

		let email = this.ui.email.val();
		let password = this.ui.password.val();

		// todo че делать если не правильный пароль
		if(email.length && password.length) {
			app.startLoading();
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
	}

	goToLists() {
		setTimeout(() => {
			page.evaluate((params) => {
			    location.href = 'https://www.facebook.com/bookmarks/lists';
			})
			.then(() => {
				setTimeout(() => {
					this.parseList()
					.then((list) => {
						app.rootView.getRegion('list').show(new ListView({
							list: list
						}));
						this.remove();
						app.stopLoading();
					});
				}, 2000);
			});
		}, 2000)
	}

	parseList() {
		return page.evaluate(function() {
			var items = document.getElementById('bookmarksSeeAllEntSection').getElementsByClassName('sideNavItem');
			var result = [];
			for(let i = 0; i < items.length; i++) {
				// Ограниченные не учитываем
				if(items[i].getElementsByTagName('A').length > 1) {
					result.push({
						title: items[i].getElementsByClassName('linkWrap')[0].getElementsByTagName('span')[0].innerHTML,
						link: items[i].getElementsByTagName('A')[1].href
					});
				}
			}
			return result;
		});
	}

}

export default AuthView;