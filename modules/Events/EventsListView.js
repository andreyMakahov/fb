import Mn from 'backbone.marionette';
import EventsCollection from './EventsListCollection.js';
import Q from 'q';
import $ from 'jquery';

var asd = 0;

export default class EventsListView extends Mn.ItemView {

  ui() {
    return {
      eventItem: '.event-item'
    };
  }

  events() {
    return {
      'click @ui.eventItem': 'getCSV',
      'click .more-info': 'setMore'
    };
  }

  constructor() {
    super({
      template: '#EventsList'
    });
    this.collection = new EventsCollection();
    this.collection.fetch()
      .then(() => {
        console.log(this.collection);
        this.render();
        app.stopLoading();
        if (!this.collection.models.length) {
            alert('У вас пока нет событий');
        }
      });
  }

  serializeData() {
    return {
      collection: this.collection.toJSON()
    };
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
		var url = data.href;
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

  getCSV(e) {
    e.preventDefault();
    let id = this.$el.find(e.target).data('id');
    let item = this.collection.get(id);
    this.title = this.$el.find(e.target).text();
    this.results = [];
    app.startLoading();
    page.evaluate(function(href) {
        location.href = href;
      }, item.get('href'))
      .then(() => {
        setTimeout(() => {
        console.log('process going list');
          this.processGoingList()
          .then(() => {
            console.log('process maybe list');
            this.processMaybeList()
            .then(() => {
              console.log('process inv list');
              this.processInvitedList()
              .then(() => {
                console.log('process cant list');
                this.processCantList()
                .then(() => {
                  if (this.getInfo) {
                    this.usersList = this.results;
                    console.log(this.usersList);
                    this.results = [];
                    this.fLoop();
                  } else {
                    this.sendMail();
                  }
                })
              })
            })
          })
        }, 3000);
      })
  }

  setMore() {
    this.getInfo = !this.getInfo;
  }

  processGoingList() {
    var defer = $.Deferred();
    this.showGuestList()
      .then(() => {
        setTimeout(() => {
          this.processUsers(defer, 'going');
        }, 2000)
      });
      return defer.promise();
  }

  processMaybeList() {
    var defer = $.Deferred();
    page.evaluate(function() {
        var dialog = document.querySelectorAll('[role="dialog"]');
        var link = dialog[dialog.length - 1].querySelectorAll('[data-intl-translation]')[1].parentNode;
        link.click();
    })
    .then(() => {
      setTimeout(() => {
        this.processUsers(defer, 'maybe');
      }, 3000)
    });
    return defer.promise();
  }

  processInvitedList() {
    var defer = $.Deferred();
    page.evaluate(function() {
        var dialog = document.querySelectorAll('[role="dialog"]');
        var link = dialog[dialog.length - 1].querySelectorAll('[data-intl-translation]')[2].parentNode;
        link.click();
    })
    .then(() => {
      setTimeout(() => {
        this.processUsers(defer, 'invited');
      }, 3000)
    });
    return defer.promise();
  }

  processCantList() {
    var defer = $.Deferred();
    page.evaluate(function() {
        var dialog = document.querySelectorAll('[role="dialog"]');
        var link = dialog[dialog.length - 1].querySelectorAll('[data-intl-translation]')[3].parentNode;
        link.click();
    })
    .then(() => {
      setTimeout(() => {
        this.processUsers(defer, 'can\'t');
      }, 3000)
    });
    return defer.promise();
  }

  processUsers(defer, status) {
    this.scrollToBot()
    .then(() => {
      this.waitForScroll(() => {
        this.parseUsers(status)
          .then((users) => {
            this.results = this.results.concat(JSON.parse(users));
            defer.resolve();
          })
      })
    });
  }

  scrollToBot() {
    let result = Q.defer();
    page.evaluate(function() {
      var lastLength = 0;
      var repeatCount = 0;
      var loop = setInterval(function() {
        console.log(lastLength, repeatCount);

      var scrolable = document.querySelectorAll('.uiScrollableAreaContent'),
        length = scrolable.length,
        parentCont = scrolable[length - 1];

        if (!lastLength) {
          lastLength = parentCont.children.length;
        } else {
          length = parentCont.children.length;
          if (lastLength == length) {
            repeatCount++;
            if (repeatCount > 5) {
              window.loopIsReady = true;
              clearInterval(loop);
              return;
            }
          } else {
            lastLength = length;
            repeatCount = 0;
          }
        }
        window.__lastLength = lastLength;
        window.__repeatCount = repeatCount;
        parentCont.parentNode.parentNode.scrollTop = parentCont.scrollHeight;
      }, 2000);
    })
    .then(() => {
      this.checkReady(() => {
        result.resolve();
      });
    });
    return result.promise;
  }

  checkReady(callback) {
    setTimeout(() => {
      page.evaluate(function(lastLength, repeatCount) {
        return window.loopIsReady;
      })
      .then((ready) => {
        console.log('ready', ready);
        if (ready) {
          callback();
        } else {
          this.checkReady(callback);
        }
      });
    }, 2000)
  }

  showGuestList() {
    return page.evaluate(function() {
      var link = document.getElementById('event_guest_list').querySelectorAll('._3enj')[0];
      var event = document.createEvent('MouseEvents');
      event.initMouseEvent('click', true, true, window, 1, 0, 0);
      link.dispatchEvent(event);
    });
  }

  parseUsers(status) {
    //document.querySelectorAll('._54r9 ._3le5')[0].querySelectorAll('table')[0].querySelectorAll('td')[1].querySelectorAll(':scope > div')
    return page.evaluate(function(status) {
      var scrolable = document.querySelectorAll('.uiScrollableAreaContent'),
        contLen = scrolable.length,
        list = scrolable[contLen - 1];

      list = Array.prototype.filter.call(list.children, function(el) {
        return el.querySelectorAll('table').length;
      });

      var result = Array.prototype.map.call(list, function(el) {
        var cell = el.querySelectorAll('table');
        if (cell.length) {
          var cell2 = cell[0].querySelectorAll('td')[1].querySelectorAll(':scope > div');
          var name;
          if (cell2[0].querySelector('a')) {
              name = cell2[0].querySelector('a').querySelector('span').innerText.split('(')[0].trim().split(' ');
          } else {
              name = cell2[0].querySelector('span').innerText.split('(')[0].trim().split(' ');
          }
          var toAdd = 3 - name.length;
          while (toAdd--) {
            name.push('');
          }
          return {
            name: name.join(';'),
            href: cell2[0].querySelector('a') ? cell2[0].querySelector('a').href : '',
            invited: cell2[1].innerText,
            status: status
          }
        }
      });
      return JSON.stringify(result);
    }, status);
  }

  waitForScroll(callback) {
    page.evaluate(function() {
        return window.loopIsReady;
      })
      .then((done) => {
        setTimeout(() => {
          if (!done) {
            this.waitForScroll(callback);
          } else {
            callback();
          }
        }, 5000)
      });
  }

  sendMail () {
		console.log('send');
		var cArr = [];
		for (var i = 0, l = this.results.length;i<l;i++) {
			var item = this.results[i];
			if (item) {
                delete item.url;
            }
			var arr = [];
			for (var name in item) {
				arr.push(item[name]);
			}
			cArr.push(arr.join(';'));
		}
    console.log(item);
		var csv = cArr.join('\n');
    console.log(csv);
    $('<input type="file" nwsaveas="' + (this.title.replace(/ /g,"_") + '_event.csv') + '" style="visibility:hidden;">')
    .appendTo('body').click().on('change', (e) => {
      app.stopLoading();
      fs.writeFile(e.target.value, csv, function(err) {
  		    if(err) {
  		        console.log('error');
  		    }

  		});
    });


	}


};
