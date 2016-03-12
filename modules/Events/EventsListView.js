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
      'click @ui.eventItem': 'getCSV'
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
      });
  }

  serializeData() {
    return {
      collection: this.collection.toJSON()
    };
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
                  this.sendMail();
                })
              })
            })
          })
        }, 3000);
      })
  }

  processGoingList() {
    var defer = $.Deferred();
    this.showGuestList()
      .then(() => {
        setTimeout(() => {
          this.processUsers(defer, 'going');
        }, 1500)
      });
      return defer.promise();
  }

  processMaybeList() {
    var defer = $.Deferred();
    page.evaluate(function() {
      var scrolable = document.querySelectorAll('.uiScrollableArea'); 
      var link = scrolable[scrolable.length - 1].previousSibling.querySelectorAll('a')[1];
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
      var scrolable = document.querySelectorAll('.uiScrollableArea'); 
      var link = scrolable[scrolable.length - 1].previousSibling.querySelectorAll('a')[2];
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
      var scrolable = document.querySelectorAll('.uiScrollableArea'); 
      var link = scrolable[scrolable.length - 1].previousSibling.querySelectorAll('a')[3];
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
            if (repeatCount > 2) {
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
          return {
            name: cell2[0].querySelector('a').innerText.split('(')[0].trim().split(' ').join(';'),
            href: cell2[0].querySelector('a').href,
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
			var arr = [];
			for (var name in item) {
				arr.push(item[name]);
			}
			cArr.push(arr.join(';'));
		}
		var csv = cArr.join('\n');
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
