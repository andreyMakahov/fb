import Mn from 'backbone.marionette';

class LayoutView extends Mn.LayoutView {
	constructor() {
		super({
			el: ".layout",
			regions: {
				menu: '#menu',
				login: '#login',
				list: '#list'
			}
		})
	}
}

export default LayoutView;
