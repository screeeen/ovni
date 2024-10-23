import { timestamp } from './helpers';
import { DIRECTIONS, MAP, TILE, KEY, step, canvas, ctx, width, height, assets } from './constants';
import { startGame, inProgress } from './main';

var player = {},
	camera = {},
	cells = [],
	win = false,
	gameOver = false;

var t2p = (t) => {
		return t * TILE;
	},
	p2t = (p) => {
		return Math.floor(p / TILE);
	},
	tcell = (tx, ty) => {
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
		case KEY.DOWN:
			startGame();
			return;
	}
}

function update() {
	if (inProgress) movePlayer(player.orientation);
	renderCamera(camera);
}

function changePlayerDirection() {
	// TODO: randomize more
	const orientation = (player.orientation + 1) % 4;
	player.orientation = DIRECTIONS[orientation];
}

// check out of the map
function checkPlayerPositions(entity) {
	const roundedY = Math.round(entity.y);
	const roundedX = Math.round(entity.x);

	if (roundedY >= TILE * (MAP.th - 1)) {
		startGame();
	} else if (roundedY <= 0) {
		player.orientation = 2;
		entity.y = 0.5;
	}
	const bottomCamY = (camera.y + camera.h) * TILE - TILE;
	const topBoundY = camera.y * TILE - TILE;
	const rightBoundX = (camera.x + camera.w) * TILE - TILE;
	const leftBoundX = camera.x * TILE - TILE;

	if (roundedY >= bottomCamY) {
		camera.y = camera.y + camera.h;
	} else if (roundedY <= topBoundY) {
		camera.y = camera.y - camera.h;
	} else if (roundedX >= rightBoundX) {
		camera.x = camera.x + camera.w;
	} else if (roundedX <= leftBoundX) {
		camera.x = camera.x - camera.w;
	}
}

const checkCollisionLeft = (newX, player) => {
	const topLeft = tcell(p2t(newX), p2t(player.y));
	const bottomLeft = tcell(p2t(newX), p2t(player.y + TILE - 2));
	return topLeft !== 0 || bottomLeft !== 0;
};

const checkCollisionRight = (newX, player) => {
	const topRight = tcell(p2t(newX + TILE - 2), p2t(player.y));
	const bottomRight = tcell(p2t(newX + TILE - 2), p2t(player.y + TILE - 2));
	return topRight !== 0 || bottomRight !== 0;
};

const checkCollisionUp = (newY, player) => {
	const topLeft = tcell(p2t(player.x), p2t(newY));
	const topRight = tcell(p2t(player.x + TILE - 2), p2t(newY));
	return topLeft !== 0 || topRight !== 0;
};

const checkCollisionDown = (newY, player) => {
	const bottomLeft = tcell(p2t(player.x), p2t(newY + TILE - 2));
	const bottomRight = tcell(p2t(player.x + TILE - 2), p2t(newY + TILE - 2));
	return bottomLeft !== 0 || bottomRight !== 0;
};

const movePlayer = (direction) => {
	let newX = player.x;
	let newY = player.y;

	checkPlayerPositions(player);

	switch (direction) {
		case 0:
			newY -= 1;
			if (!checkCollisionUp(newY, player)) player.y = newY;
			else player.orientation = 2;
			break;
		case 2:
			newY += 1;

			if (!checkCollisionDown(newY, player)) player.y = newY;
			else player.orientation = 0;
			break;
		case 1:
			newX -= 1;
			if (!checkCollisionLeft(newX, player)) player.x = newX;
			else player.orientation = 3;
			break;
		case 3:
			newX += 1;
			if (!checkCollisionRight(newX, player)) player.x = newX;
			else player.orientation = 1;
			break;
	}
};

function renderCamera(camera) {
	// if (cameraX < 0) cameraX = 0;
	// if (cameraY < 0) cameraY = 0;
	// if (cameraX + width > MAP.tw) cameraX = MAP.tw - width;
	// if (cameraY + height > MAP.th) cameraY = MAP.th - height;
	// console.log(width, height);
	// console.log('player-', player.x, player.y);

	// Limpiar el canvas
	ctx.clearRect(0, 0, width, height);

	// Guardar el estado actual de la transformación
	// ctx.save();

	// Mover la cámara (desplazar el mundo en sentido contrario)
	// ctx.translate(-cameraX, -cameraY);

	renderMap({ ctx, camera });
	renderPlayer(ctx);

	// Restaurar la transformación
	// ctx.restore();
}

function renderMap({ ctx, camera }) {
	const cameraX = camera.x;
	const cameraY = camera.y;
	const viewW = camera.w;
	const viewH = camera.h;

	for (var y = cameraY; y < cameraY + viewH; y++) {
		for (var x = cameraX; x < cameraX + viewW; x++) {
			var cell = tcell(x, y, false);
			if (cell === 0) {
				ctx.drawImage(assets, 0, 0, TILE, TILE, x * TILE, y * TILE, TILE, TILE);
			} else if (cell) {
				ctx.drawImage(assets, (cell - 1) * TILE, 0, TILE, TILE, x * TILE, y * TILE, TILE, TILE);
			}
		}
	}
}

function renderPlayer(ctx) {
	var or = player.orientation === 'right' ? 12 : 11;
	ctx.drawImage(assets, or * TILE, 0, TILE, TILE, player.x, player.y, TILE, TILE);
}

function setup(map) {
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

	setupCamera(player);

	cells = data;
}

function setupEntity(obj) {
	if (!obj.properties) obj.properties = {};

	var entity = {
		x: obj.x,
		y: obj.y,

		player: obj.type == 'player',
		camera: obj.type == 'camera',
		type: obj.properties.type,
		orientation: obj.orientation,
		start: {
			x: obj.x,
			y: obj.y,
		},
	};

	return entity;
}

function setupCamera(player) {
	var _camera = {};
	_camera.x = 0;
	_camera.y = 0;
	_camera.w = 18;
	_camera.h = 10;

	camera = _camera;
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
		update();
	}
	// if (!win && !gameOver) render(ctx, counter, dt);

	last = now;
	counter++;
	requestAnimationFrame(frame, canvas);
}

export { setup, frame, onkey };
