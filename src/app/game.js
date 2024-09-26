import { timestamp, bound } from './helpers';
import {
	DIRECTIONS,
	MAP,
	TILE,
	GRAVITY,
	MAXDX,
	MAXDY,
	ACCEL,
	FRICTION,
	IMPULSE,
	KEY,
	step,
	canvas,
	ctx,
	width,
	height,
	assets,
	font,
} from './constants';
import { startGame } from './main';

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
	cellAvailable = (x, y) => {
		return tcell(p2t(x), p2t(y));
	},
	tcell = (tx, ty, notRend = true) => {
		var cell = cells[tx + ty * MAP.tw];
		return cell;
	};

function onkey(ev, key, down) {
	switch (key) {
		case KEY.SPACE:
			if (!down) changePlayerDirection();
			ev.preventDefault();
			return false;
	}
}

function update(dt) {
	updatePlayer4ways(dt);
}

function changePlayerDirection() {
	const orientation = (player.orientation + 1) % 4;
	player.orientation = DIRECTIONS[orientation];
}

function updatePlayer4ways() {
	const accel = player.accel;

	// Inicializa aceleraciones y posiciones
	checkPlayerPositions(player);
	player.ddx = 0;
	player.ddy = 0;

	// Ajusta aceleraciones y velocidades según la orientación del jugador
	switch (player.orientation) {
		case 0: // Arriba
			player.ddy -= accel;
			player.ddx = 0;
			player.dx = 0;
			break;
		case 1: // Derecha
			player.ddx += accel;
			player.ddy = 0;
			player.dy = 0;
			break;
		case 2: // Abajo
			player.ddy += accel;
			player.ddx = 0;
			player.dx = 0;
			break;
		case 3: // Izquierda
			player.ddx -= accel;
			player.ddy = 0;
			player.dy = 0;
			break;
	}

	// Actualiza posición y velocidad limitando a los máximos
	player.x += dt * player.dx;
	player.y += dt * player.dy;
	player.dx = bound(player.dx + dt * player.ddx, -player.maxdx, player.maxdx);
	player.dy = bound(player.dy + dt * player.ddy, -player.maxdy, player.maxdy);

	// Calcula las posiciones en la cuadrícula
	const tx = p2t(player.x),
		ty = p2t(player.y),
		nx = player.x % TILE,
		ny = player.y % TILE;

	// Celdas actuales y vecinas
	const cell = tcell(tx, ty),
		cellRight = tcell(tx + 1, ty),
		cellDown = tcell(tx, ty + 1),
		cellDiag = tcell(tx + 1, ty + 1);

	// Verificación de colisiones verticales (arriba/abajo)
	if (player.dy > 0) {
		// Moviendo hacia abajo
		if ((cellDown && !cell) || (cellDiag && !cellRight && nx)) {
			player.y = t2p(ty);
			player.dy = 0;
			player.orientation = 0; // Cambio de orientación
		}
	} else if (player.dy < 0) {
		// Moviendo hacia arriba
		if ((cell && !cellDown) || (cellRight && !cellDiag && nx)) {
			player.y = t2p(ty + 1);
			player.orientation = 2; // Cambio de orientación
		}
	}

	// Verificación de colisiones horizontales (derecha/izquierda)
	if (player.dx > 0) {
		// Moviendo hacia la derecha
		if ((cellRight && !cell) || (cellDiag && !cellDown && ny)) {
			player.x = t2p(tx);
			player.orientation = 3; // Cambio de orientación
		}
	} else if (player.dx < 0) {
		// Moviendo hacia la izquierda
		if ((cell && !cellRight) || (cellDown && !cellDiag && ny)) {
			player.x = t2p(tx + 1);
			player.orientation = 1; // Cambio de orientación
		}
	}
}

function checkPlayerPositions(entity) {
	const roundedX = Math.round(entity.x);
	const roundedY = Math.round(entity.y);
	const maxTileX = TILE * (MAP.tw - 1);
	const maxTileY = TILE * (MAP.th - 1);

	// Verifica si está en el borde derecho del mapa
	if (roundedX >= maxTileX) {
		if (cellAvailable(0, entity.y) === 0 && cellAvailable(1, entity.y) === 0) {
			entity.x = 0.5;
		} else {
			entity.x = maxTileX - 0.5;
		}
	}
	// Verifica si está en el borde izquierdo del mapa
	else if (roundedX <= 0) {
		if (cellAvailable(maxTileX, entity.y) === 0 && cellAvailable(maxTileX - 1, entity.y) === 0) {
			entity.x = maxTileX - 0.5;
		} else {
			entity.x = 0.5;
		}
	}
	// Verifica si está en el borde inferior del mapa
	else if (roundedY >= maxTileY) {
		startGame(); // Reinicia el juego si llega al borde inferior
		if (cellAvailable(entity.x, 0) === 0 && cellAvailable(entity.x, 1) === 0) {
			entity.y = 0.5;
		} else {
			entity.y = maxTileY - 0.5;
		}
	}
	// Verifica si está en el borde superior del mapa
	else if (roundedY <= 0) {
		player.orientation = 2; // Cambia la orientación del jugador
		if (cellAvailable(entity.x, maxTileY) === 0 && cellAvailable(entity.x, maxTileY - 1) === 0) {
			entity.y = maxTileY - 0.5;
		} else {
			entity.y = 0.5;
		}
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
		dx: 0,
		dy: 0,
		gravity: TILE * (obj.properties.gravity || GRAVITY),
		maxdx: TILE * (obj.properties.maxdx || MAXDX),
		maxdy: TILE * (obj.properties.maxdy || MAXDY),
		impulse: TILE * (obj.properties.impulse || IMPULSE),
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

	entity.accel = entity.maxdx / (obj.properties.accel || ACCEL);
	entity.friction = entity.maxdx / (obj.properties.friction || FRICTION);

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
