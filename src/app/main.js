import { setup, frame, win, onkey } from './game';
import { levels } from './maps/levels';
import { generateMap } from './maps/generateMap';
import { MAP } from './constants';
import { creationSound } from './sounds';
import { zzfx } from 'ZzFX';

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

export function genNewMap() {
	// MAP.tw = Math.floor(Math.random() * (32 - 8) + 8);
	// MAP.th = Math.floor(Math.random() * (16 - 10) + 10);
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

console.log('inProgress', inProgress);

export function startGame() {
	inProgress = true;
	// Menus.showCanvas();
	// zzfx(...creationSound);
	console.log('start game');
	const lvl_0 = genNewMap();
	setup(lvl_0);
}

frame();

document.addEventListener(
	'keydown',
	(ev) => {
		if (ev.keyCode === 32 && !inProgress) {
			startGame();
			return;
		}
		return onkey(ev, ev.keyCode, true);
	},
	false
);

document.addEventListener(
	'keyup',
	(ev) => {
		if (ev.keyCode === 32 && !inProgress) return;
		return onkey(ev, ev.keyCode, false);
	},
	false
);
