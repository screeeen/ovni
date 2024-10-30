import { setup, frame, win, onkey } from './game';
import { levels } from './maps/levels';
import { generateMap } from './maps/generateMap';
import { MAP } from './constants';
import { creationSound } from './sounds';
import { zzfx } from 'ZzFX';
import { Menus } from './menus';

if (!window.requestAnimationFrame) {
	window.requestAnimationFrame =
		window.webkitRequestAnimationFrame ||
		window.mozRequestAnimationFrame ||
		window.oRequestAnimationFrame ||
		window.msRequestAnimationFrame ||
		function (callback, element) {
			window.setTimeout(callback, 1000 / 60);
		};
}

function init() {
	Menus.startScreen();
}

export function genNewMap() {
	const width = MAP.tw;
	const height = MAP.th;
	const start = { x: 2, y: 2 };
	const end = { x: MAP.tw - 1, y: MAP.th - 1 };

	const lvl_0 = generateMap(width, height, start, end);

	console.table('* *', lvl_0.layers[0].data);
	console.table('* *', width, ' ', height);
	console.table('* *', MAP.tw, ' ', MAP.th);
	return lvl_0;
}

export let inProgress = false;

export function startGame() {
	Menus.removeText('playButton');
	Menus.removeText('titleText');
	inProgress = true;
	// zzfx(...creationSound);
	const lvl_0 = genNewMap();
	setup(lvl_0);
}

init();
frame();

document.addEventListener(
	'click',
	(ev) => {
		if (!inProgress) {
			startGame();
			return;
		}
	},
	false
);

document.addEventListener(
	'keydown',
	(ev) => {
		if (ev.keyCode === 32 && !inProgress) {
			startGame();
			return;
		}
		return inProgress && onkey(ev, ev.keyCode, false);
	},
	false
);

document.addEventListener(
	'keyup',
	(ev) => {
		if (ev.keyCode === 32 && !inProgress) return;
		// return onkey(ev, ev.keyCode, false);
	},
	false
);
