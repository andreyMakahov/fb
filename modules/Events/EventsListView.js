import Mn from 'backbone.marionette';
import EventsCollection from './EventsListCollection.js';

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
    });
  }

  serializeData() {
    return {
      collection: this.collection.toJSON()
    };
  }

  getCSV(e) {
    let id = this.$el.find(e.target).data('id');
    let item = this.collection.get(id);
    page.evaluate(function (href) {
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
                })
              })
            })
          }, 1500)
        })
      }, 3000)
    });
  }

  scrollToBot() {
    return page.evaluate(function () {
      var lastLength = 0;
      var repeatCount = 0;
      var parentCont = document.querySelectorAll('._54r9');
      var cont = parentCont.querySelectorAll('.uiScrollableAreaBody');
      var count = 0;
      var loop = setInterval(function () {
        document.querySelectorAll('._58al').value = ++count;
        console.log('lastLength ' + lastLength);
        if (!lastLength) {
          lastLength = cont.querySelectorAll('._3le5').length;
        } else {
          length = cont.querySelectorAll('._3le5').length;
          if (lastLength == length) {
            repeatCount++;
            if (repeatCount > 2) {
              clearInterval(loop);
              window.loopIsReady = true;
              console.log('getFriendsList');
              return;
            }
          } else {
            lastLength = length;
            repeatCount = 0;
          }
        }
        cont.scrollTop = cont.scrollHeight;
      }, 2000);
    });
  }

  showGuestList() {
    return page.evaluate(function () {
      var link = document.getElementById('event_guest_list').querySelectorAll('._3enj')[0];
      var event = document.createEvent( 'MouseEvents' );
      event.initMouseEvent( 'click', true, true, window, 1, 0, 0 );
      link.dispatchEvent( event );
    });
  }

  parseUsers() {
    return page.evaluate(function () {
      return Array.prototype.map.call(document.querySelectorAll('._54r9 ._3le5'), function (el) {
        var cell = el.querySelectorAll('table')[0].querySelectorAll('td')[1].querySelectorAll('div');
        return {
          name: cell[0].querySelectorAll('a').innerText,
          href: cell[0].querySelectorAll('a').href,
          invited: cell[1].innerText
        }
      });

    });
  }

  waitForScroll(callback) {
    page.evaluate(function () {
      return window.loopIsReady;
    })
    .then((done) => {
      setTimeout(() => {
        page.render('qweqwe' + (++asd) + '.jpg');
        if (!done) {
          this.waitForScroll(callback);
        } else {
          callback();
        }
      }, 5000)
    });
  }

};
