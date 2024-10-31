let MAP = {
		tw: 16,
		th: 32,
		// tw: Math.floor(Math.random() * (32 - 8) + 8),
		// th: Math.floor(Math.random() * (16 - 10) + 10),
	},
	TILE = 16,
	KEY = {
		SPACE: 32,
		DOWN: 40, //debug only
	},
	fps = 60,
	step = 1 / fps,
	canvas = document.getElementById('game'),
	ctx = canvas.getContext('2d'),
	width = (canvas.width = MAP.tw * TILE),
	height = (canvas.height = MAP.th * TILE),
	assets = new Image(),
	font =
		'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAG8AAAAFAQMAAABxZCAfAAAABlBMVEX+/v4AAAAbQk4OAAAAU0lEQVQI12NYJqAkabJyGcskhwABBj4Gz2W3dhoIeV6ZFBk7uVKPgXWBwI4Ngk5XWrcGMkiAZC+tNBFmD3VaG74tMo/BTeCRKMvqjptBCwIMJPgAufkZ1sWwKkAAAAAASUVORK5CYII=';
// 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAAAgAQMAAADg7OJmAAAABlBMVEUAAAD///+l2Z/dAAABNklEQVQoz2WOP0pDQRDGp3pYDDHlFAGbHGCLFFsMwSKlRxAdRKYIyysfWyxbeARLS4/hGYInSuE3GwQlH+9t8WO+P0RSMlEVkUwQBzis6CSJDwIg+Lbvd/V8k/jrF9DHE1VK/NkBUoC35/tvwkUnBYAOj3SiyBASi4t8S53QcgF/tY5HJWfu2lRjRFLyXMrGnN1zgsXJhXnXbICkPAFIfp2a6J7IaNoAJO6TJ5/GhQBY4RngkoEWbZlVE1rWTGBX2mJCbU1d1e3Fsaa7FzNHvduyOKm7uZkBFOsdw7yZ1zp34ToAfvNheSh2nONiZCwuJUIDRIuhJXuLlis17EAzjruaCo0MGWBKiXUAC6DOAA4LQgGOspckjAysmsS3R4XjAubisugezsQBYoGo7Fy7IvNMtKJ/+gH5yXCcQewh0AAAAABJRU5ErkJggg==';

// assets.src = 'data:image/png;base64,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';
assets.src = 'src/image_edit.png';

assets.onload = function () {
	ctx.imageSmoothingEnabled = false;
};

const DIRECTIONS = [0, 1, 2, 3];

export { DIRECTIONS, MAP, TILE, KEY, fps, step, canvas, ctx, width, height, assets, font };
