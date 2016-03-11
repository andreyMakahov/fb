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
    app.startLoading();
    page.evaluate(function(href) {
        location.href = href;
      }, item.get('href'))
      .then(() => {
        setTimeout(() => {
          this.showGuestList()
            .then(() => {
              setTimeout(() => {
                this.scrollToBot()
                  .then(() => {
                    this.waitForScroll(() => {
                      this.parseUsers()
                        .then((users) => {
                          console.log('!!!', users);
                          this.results = JSON.parse(users);
                          this.sendMail();
                        })
                    })
                  })
              }, 1500)
            })
        }, 3000)
      });
  }

  scrollToBot() {
    let result = Q.defer();
    page.evaluate(function() {
      var lastLength = 0;
      var repeatCount = 0;
      var loop = setInterval(function() {
        console.log(lastLength, repeatCount);
        var parentCont = document.getElementById('entries').parentNode.parentNode.parentNode;
        if (!lastLength) {
          lastLength = document.getElementById('entries').children.length;
        } else {
          length = document.getElementById('entries').children.length;
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
        parentCont.scrollTop = parentCont.scrollHeight;
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

  parseUsers() {
    //document.querySelectorAll('._54r9 ._3le5')[0].querySelectorAll('table')[0].querySelectorAll('td')[1].querySelectorAll(':scope > div')
    return page.evaluate(function() {
      var result = Array.prototype.map.call(document.getElementById('entries').children, function(el) {
        var cell = el.querySelectorAll('table');
        if (cell.length) {
          var cell2 = cell[0].querySelectorAll('td')[1].querySelectorAll(':scope > div');
          return {
            name: cell2[0].querySelector('a').innerText.split('(')[0].trim().split(' ').join(';'),
            href: cell2[0].querySelector('a').href,
            invited: cell2[1].innerText
          }
        }
      });
      document.getElementsByTagName('body')[0].innerText = JSON.stringify(result);
      return JSON.stringify(result);
    });
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
