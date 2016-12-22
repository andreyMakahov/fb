import Backbone from 'backbone';
import Q from 'q';

export default class EventsListCollection extends Backbone.Collection {

  fetch() {
    let result = Q.defer();
    page.evaluate(function () {
      location.href = 'https://www.facebook.com/events/hosting';
    });
    setTimeout(() => {
      page.evaluate(function () {
        var uid = 0;
        return Array.prototype.map.call(document.querySelectorAll('.fbEventDashboardItem'), function (el) {
          var link = el.querySelector('._1qdd a');
          return {
            id: ++uid,
            name: link.innerText,
            href: link.href
          }
        });
      })
      .then((eventsList) => {
        this.set(eventsList);
        result.resolve(eventsList);
      });
    }, 8000);
    return result.promise;
  }

};
