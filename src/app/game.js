import { timestamp, overlap } from './helpers';
import {
	DIRECTIONS,
	MAP,
	TILE,
	MAXDX,
	MAXDY,
	KEY,
	step,
	canvas,
	ctx,
	width,
	height,
	assets,
	maxTileY,
} from './constants';
import { startGame, inProgress } from './main';

var player = {},
	cells = [],
	win = false,
	gameOver = false;

var t2p = (t) => {
		return t * TILE;
	},
	p2t = (p) => {
		return Math.floor(p / TILE);
	},
	tcell = (tx, ty, notRend = true) => {
		var cell = cells[tx + ty * MAP.tw];
		return cell;
	};

function onkey(ev, key, down) {
	switch (key) {
		case KEY.SPACE:
			if (inProgress) {
				if (!down) changePlayerDirection();
				ev.preventDefault();
				return false;
			}
	}
}

function update(dt) {
	if (inProgress) updatePlayer4ways(dt);
}

function changePlayerDirection() {
	const orientation = (player.orientation + 1) % 4;
	player.orientation = DIRECTIONS[orientation];
}

function updatePlayer4ways() {
	// chequea que no esta fuera del canvas
	checkPlayerPositions(player);

	switch (player.orientation) {
		case 0: // Arriba
			player.y -= 1;
			break;
		case 1: // Derecha
			player.x += 1;
			break;
		case 2: // Abajo
			player.y += 1;
			break;
		case 3: // Izquierda
			player.x -= 1;
			break;
	}

	// Calcula las posiciones en la cuadrícula
	const tx = p2t(player.x),
		ty = p2t(player.y),
		nx = p2t(player.x + 16), //player.x % TILE,
		ny = p2t(player.y + 16); //player.y % TILE;

	// Celdas actuales y vecinas
	const cell = tcell(tx, ty),
		cellUp = tcell(tx, ty),
		cellUpLeft = tcell(tx - nx, ty),
		cellUpRight = tcell(tx + nx, ty),
		cellLeft = tcell(tx, ty),
		cellRight = tcell(tx + 1, ty),
		cellDown = tcell(tx, ty + 1);

	if (player.orientation === 0) {
		console.log('**', player.orientation);
		console.log(cellUpLeft, cellUp, cellUpRight);
		console.log(cellLeft, cell, cellRight);
		console.log(' ', cellDown, ' ');
		console.log('T', tx, ty);
		console.log('N', nx, ny);
		console.log('P', player.x, player.y);
		console.log('-----');
	}

	// colisiones verticales
	//  abajo
	if (player.orientation === 2 && cellDown === 10) {
		player.orientation = 0;
		return;
		//  arriba
	} else if (player.orientation === 0 && cellUp === 10) {
		player.orientation = 2;
		return;
	}

	// colisiones horizontales
	// derecha
	if (player.orientation === 1 && cellRight === 10) {
		player.orientation = 3;
		return;
	} else if (player.orientation === 3 && cellLeft === 10) {
		// izquierda
		player.orientation = 1;
		return;
	}
}

function checkPlayerPositions(entity) {
	// const roundedX = Math.round(entity.x);
	const roundedY = Math.round(entity.y);

	// // Verifica si está en el borde derecho del mapa
	// if (roundedX >= maxTileX) {
	// 	console.log('*** borde', roundedX, maxTileX);
	// 	entity.x = maxTileX - 0.5;
	// }
	// // Verifica si está en el borde izquierdo del mapa
	// else if (roundedX <= 0) {
	// 	console.log('*** borde', roundedX, 0);
	// 	entity.x = 0.5;
	// }
	// // Verifica si está en el borde inferior del mapa
	// else
	if (roundedY >= maxTileY) {
		console.log('*** borde', roundedY, maxTileY);
		startGame();
	}
	// Verifica si está en el borde superior del mapa
	else if (roundedY <= 0) {
		console.log('*** borde arriba', roundedY, 0);
		player.orientation = 2;
		entity.y = 0.5;
	}
}

function render(ctx, frame, dt) {
	// console.log(frame);
	ctx.clearRect(0, 0, width, height);
	renderMap(ctx);
	renderPlayer(ctx, dt);
}

function renderMap(ctx) {
	// console.log('renderMap');
	for (var y = 0; y < MAP.th; y++) {
		for (var x = 0; x < MAP.tw; x++) {
			var cell = tcell(x, y, false);
			if (cell === 0) {
				ctx.drawImage(assets, 0, 0, TILE, TILE, x * TILE, y * TILE, TILE, TILE);
			} else if (cell) {
				ctx.drawImage(assets, (cell - 1) * TILE, 0, TILE, TILE, x * TILE, y * TILE, TILE, TILE);
			}
		}
	}
}

function renderPlayer(ctx, dt) {
	var or = player.orientation === 'right' ? 12 : 11;
	ctx.drawImage(assets, or * TILE, 0, TILE, TILE, player.x, player.y, TILE, TILE);
}

function setup(map) {
	console.log('setup');
	player = {};
	cells = [];
	win = false;
	gameOver = false;

	var data = map.layers[0].data,
		objects = map.layers[1].objects;

	for (var n = 0; n < objects.length; n++) {
		var obj = objects[n];
		var entity = setupEntity(obj);

		switch (obj.type) {
			case 'player':
				player = entity;
				break;
		}
	}

	cells = data;
}

function setupEntity(obj) {
	if (!obj.properties) obj.properties = {};

	var entity = {
		x: obj.x,
		y: obj.y,

		maxdx: TILE * (obj.properties.maxdx || MAXDX),
		maxdy: TILE * (obj.properties.maxdy || MAXDY),

		player: obj.type == 'player',
		left: obj.properties.left,
		right: obj.properties.right,
		color: obj.properties.color,
		type: obj.properties.type,
		orientation: 2,
		start: {
			x: obj.x,
			y: obj.y,
		},
	};

	entity.accel = 100; //entity.maxdx / (obj.properties.accel || ACCEL);
	// entity.friction = entity.maxdx / (obj.properties.friction || FRICTION);

	return entity;
}

var counter = 0,
	dt = 0,
	now,
	last = timestamp();

function frame() {
	now = timestamp();
	dt = dt + Math.min(1, (now - last) / 1000);
	while (dt > step) {
		dt = dt - step;
		update(step);
	}
	if (!win && !gameOver) render(ctx, counter, dt);

	last = now;
	counter++;
	requestAnimationFrame(frame, canvas);
}

export { setup, frame, onkey };
