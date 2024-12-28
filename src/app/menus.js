import { TextGen } from './text_gen';

const generateRandomString = (length) => {
	const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	let result = '';
	const usedChars = new Set();

	while (result.length < length) {
		const randomChar = chars.charAt(Math.floor(Math.random() * chars.length));
		if (!usedChars.has(randomChar)) {
			usedChars.add(randomChar);
			result += randomChar;
		}
	}
	return result;
};

var Menus = {
	mosaic: () => {},
	startScreen: () => {
		var play = TextGen.generateWord('press space to play');
		TextGen.button(play, 'playButton');

		// var wor = generateRandomString(100);
		// var mosaic = TextGen.generateWord(wor);
		// TextGen.titleText(mosaic);

		var title = TextGen.generateWord('ovni raya perdido.');
		TextGen.titleText(title);
	},
	showIntroScreen: () => {
		var row1 = TextGen.generateWord('perdimos el control del platillo volante');
		TextGen.introText(row1, 'top', 190, 'row1');
	},
	gameOver: () => {
		var over = TextGen.generateWord('game over');
		TextGen.text(over, 'gameOver', 280, { scale: 6, margin: 25 });
	},
	endGame: () => {
		var title = TextGen.generateWord('congratulations');
		TextGen.endGameTitle(title);

		var completed = TextGen.generateWord('gems are on safe');
		TextGen.text(completed, 'endGameSubtitle', 305, { scale: 4, margin: 15 });

		var madeBy = TextGen.generateWord('by samirh');
		TextGen.madeByText(madeBy);
	},
	showCanvas: () => {
		document.getElementById('game').style.display = 'block';
	},
	removeText: (id) => {
		var el = document.getElementById(id);
		console.log(el);
		if (el) {
			console.log(el);
			el.remove();
		}
	},
};

export { Menus };
