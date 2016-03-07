import Mn from 'backbone.marionette';
import $ from 'jquery';
import AuthView from '../Auth/AuthView.js';
import ListView from '../List/ListView.js';
import ELV from '../Events/EventsListView.js';

class MenuView extends Mn.LayoutView {
	
	ui () {
		return {
			'item': '.js-menu-item'
		};
	}

	events () {
		return {
			'click @ui.item': 'nav'
		};
	}

	constructor() {
		super({
			template: '#MenuTemplate'
		});
	}

	nav(e) {
		e.preventDefault();

		let target = $(e.currentTarget),
			view = target.data('view');

		let rootView = app.rootView;

		app.startLoading();

		switch (view) {
			case 'AuthView':
				rootView.getRegion('login').show(new AuthView());
				rootView.getRegion('menu').currentView && rootView.getRegion('menu').currentView.remove();
				rootView.getRegion('list').currentView && rootView.getRegion('list').currentView.remove();
				app.stopLoading();
				break;
			case 'ListView':
				this.goToLists(() => {
					app.stopLoading();
				});
				break;
			case 'EventListView':
				app.rootView.getRegion('list').show(new ELV());
				app.stopLoading();
				break;
		}
	}

	goToLists(callback) {
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
						callback();
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

export default MenuView;