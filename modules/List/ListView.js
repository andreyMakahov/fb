import Mn from 'backbone.marionette';
import _ from 'underscore';
import $ from 'jquery';

class ListView extends Mn.LayoutView {

	ui () {
		return {
			item: '.list-item'
		};
	}

	events () {
		return {
			'click @ui.item': 'parseItem'
		};
	}

	constructor(options) {
		super(_.extend({
			template: '#ListTemplate'
		}, options));
		this.results = [];
		this.title = '';
	}

	serializeData() {
		return {
			list: this.options.list
		};
	}

	parseItem(e) {
		e.preventDefault();

		this.results = [];

		let target = $(e.currentTarget),
			url = target.prop('href');

		this.title = target.text();

		app.startLoading();
		console.log(url)
		page.evaluate(function(href) {
			location.href = href;
		}, url)
		.then(() => {

			setTimeout(() => {
				page.evaluate(function () {
					var box;
					window.___result = {
						finished: false
					};
					box = document.getElementById('friend_list_members_box');
					var element;
					if(box) {
						element = box.getElementsByTagName('a')[0];

						var elStyle = window.getComputedStyle(element);

						if (elStyle.display != 'none') {
							// create a mouse click event
							var event = document.createEvent( 'MouseEvents' );
							event.initMouseEvent( 'click', true, true, window, 1, 0, 0 );

							// send click to element
							element.dispatchEvent( event );
							var lastLength = 0;
							var repeatCount = 0;

							var loop = setInterval(function () {
								console.log('lastLength ' + lastLength);
								var el = document.getElementsByClassName('fbProfileBrowserListContainer')[1],
									len = el && el.getElementsByClassName('friendListItem').length;
								if (!lastLength) {
									lastLength = len;
								} else {
									length = len;
									if (lastLength == length) {
										repeatCount++;
										if (repeatCount > 2 || (lastLength === 0 && length === 0)) {
											clearInterval(loop);
											window.___result.finished = true;
										}
									} else {
										lastLength = length;
										repeatCount = 0;
									}
								}
								var cont = el && el.getElementsByClassName('friendListItem')[0].parentElement.parentElement.parentElement.parentElement;
								if(cont) {
									cont.scrollTop = cont.scrollHeight;
								}
							}, 2000);
						} else {
							window.___result.finished = true;
							window.___result.isEmpty = true;
						}
					} else {
						window.___result.finished = true;
					}
					return window.___result;
				})
				.then(() => {
					this.checkFinish();
				})

			}, 3000);

		})
	}

	checkFinish() {
		console.log('check')
		page.evaluate(function() {
			return window.___result;
		})
		.then((result) => {
			if(!result.finished) {
				setTimeout(this.checkFinish.bind(this), 1000);
			} else if (result.isEmpty) {
				app.stopLoading();
				alert('Список пуст');
			} else {
				page.evaluate(function() {
					return typeof document != 'undefined' && document.getElementsByClassName('fbProfileBrowserListContainer')[1];
				})
				.then((issetDomElem) => {
					if(issetDomElem) {
						this.parseList();
					} else {
						app.stopLoading();
					}
				})
			}
		})
	}

	parseList() {
		console.log('parseList');
		page.evaluate(() => {
			var result = [];
			var friendsDom = document
				.getElementsByClassName('fbProfileBrowserListContainer')[1]
				.getElementsByClassName('friendListItem');
			for (var i = 0, l = friendsDom.length; i<l; i++) {
				var elem = friendsDom[i];
				var name = elem.getElementsByClassName('text')[0].innerText.split('(')[0].trim().split(' ').join(';');
				result.push({url: elem.getElementsByClassName('viewProfile')[0].href, name: name});
			}
			return result;
		})
		.then((result) => {
			var friendsArr = result;
			console.log('friendsArr ', friendsArr, friendsArr[0].url);
			this.usersList = JSON.parse(JSON.stringify(friendsArr));
			this.fLoop(this.sendMail.bind(this));
		});
	}

	fLoop (callback) {
		console.log('fLoop', this.usersList.length);
		let self = this;
		if (this.usersList.length) {
			var usr = this.usersList.splice(0, 1)[0];
			if (usr) {
				console.log(usr);
				self.doFriend(usr, () => {
					self.doFriendData(usr, () => {
						self.fLoop(this.sendMail.bind(this));
					});
				});
			}
		} else {
			callback();
		}
	}

	doFriend(data, callback) {
		var url = data.url;
		console.log('doFriend', url, !!callback);
		console.log('name', data.name);
		page.evaluate(function(url) {
			location.href = url;
		}, url);
		setTimeout(function() {
			page.evaluate(function () {
				return document.location.href;
			})
			.then((aboutUrl) => {
				console.log('!!!!', aboutUrl + '/about?section=education');
				data.url = aboutUrl;
				callback();
			});
		}, 2000);
	}

	doFriendData(data, callback) {
		var aboutUrl = data.url;
		let self = this;

		page.evaluate(function(aboutUrl) {
			location.href = aboutUrl + '/about?section=education';
		}, aboutUrl)
		.then(() => {
			setTimeout(() => {
				page.evaluate(function(aboutUrl) {
					var job = (function() {
						var elems = document.getElementById('pagelet_eduwork').getElementsByTagName('*');
						for (var i =0,l=elems.length;i<l;i++){
							var elem = elems[i];
							if (elem.getAttribute('data-pnref') == 'work') {
								break;
							}

						}
						if (elem){
							var el = elem.getElementsByTagName('li')[0];
							if (el) {
								return el.innerText || el.textContent;
							}
						}
						return false;
					})();
					return job;
				}, aboutUrl)
				.then((job) => {
					console.log('after eval');
					var result = [];
					if (job) {
						job = job.trim().split('\n');
						for (var i = 0,l = job.length;i<l;i++){
							if(job[i]){
								result.push(job[i]);
							}
						}
						console.log('job ', result);
						data.job = result.join(' ');
					} else {
						data.job = false;
					}

					page.evaluate(function(aboutUrl) {
						location.href = aboutUrl + '/friends';
					}, aboutUrl);
					setTimeout(() => {
						page.evaluate(function() {
							var elem = document.getElementsByName('Все друзья')[0];
							return elem ? elem.getElementsByTagName('span')[1].innerText : undefined;
						})
						.then((fCount) => {
							data.job = result.join(' ');
							data.friendsCount = fCount;
							self.results.push(data);
							callback && callback();
						});
					}, 2000);
				});
			}, 3000);
		})
	}

	sendMail () {
		console.log('send')
		var cArr = [];
		for (var i = 0, l = this.results.length;i<l;i++) {
			var item = this.results[i];
			var arr = [];
			for (var name in item) {
				arr.push(item[name]);
			}
			cArr.push(arr.join(';'));
		}
		var csv = cArr.join('\n');
		$('<input type="file" nwsaveas="' + (this.title.replace(/ /g,"_") + '_list.csv') + '" style="visibility:hidden;">')
    .appendTo('body').click().on('change', (e) => {
      app.stopLoading();
      fs.writeFile(e.target.value, csv, function(err) {
  		    if(err) {
  		        console.log('error');
  		    }
  		});
    });
	}

}

export default ListView;
