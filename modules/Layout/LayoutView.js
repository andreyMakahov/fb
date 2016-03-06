import Mn from 'backbone.marionette';

class LayoutView extends Mn.LayoutView {
	constructor() {
		super({
			el: ".layout",
			regions: {
				login: '#login'
			}
		})
	}
}

export default LayoutView;
