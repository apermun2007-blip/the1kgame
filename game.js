kaboom({
  global: true,
  fullscreen: true,
  scale: 2,
  background: [0, 0, 0],
});

// ------------------------------------------
// Array donde guardamos inputs
let inputs = [];

// Captura teclado
onKeyPress("left", () => inputs.push({ action: "left", time: Date.now() }));
onKeyPress("right", () => inputs.push({ action: "right", time: Date.now() }));
onKeyPress("space", () => inputs.push({ action: "jump", time: Date.now() }));
// ------------------------------------------

setGravity(1600);
const TILE_SIZE = 16;
const mapWidth = 127 * TILE_SIZE;
const mapHeight = 127 * TILE_SIZE;

// --- constantes ---
let isJumping = false;
let jumpTimer = 0;
let springActive = false;

let moveSpeed = 0;           
const maxSpeed = 160;        
const accel = 300;           
const decel = 800;           
const baseSpeed = 80;

const jumpForce = 230;    
const holdAccel = 1750;    
const maxJumpTime = 0.25 
const startPos = vec2(105,1770);


// Keep track which is the current font
let curFont = 0
let curSize = 62
const pad = 36
// ---------------------------------------

// --- Sprites del jugador ---
loadSprite("idle", "assets/player/idle.png");
loadSprite("jump", "assets/player/jump.png");
loadSprite("run1", "assets/player/run1.png");
loadSprite("run2", "assets/player/run2.png");
loadSprite("run3", "assets/player/run3.png");
loadSprite("run4", "assets/player/run4.png");
loadSprite("run5", "assets/player/run5.png");

loadFont("2p", "/assets/sfx/2p.ttf")

// --- Jugador ---
const player = add([
  sprite("idle"),
  pos(startPos),
  area({ shape: new Rect(vec2(1, 2), 12, 15) }),
  body(),
  scale(1),
  anchor("topleft"),  
  "player",
]);

loadSound("end", "/assets/sfx/end.ogg")

const music = play("end", {
	loop: true,
  volume: 0.5,
})

// --- Animación correr ---
const runSprites = ["run1", "run2", "run3", "run4", "run5"];
let runIndex = 0;
let runTimer = 0;
const runSpeed = 0.1; 

loadSprite("map", "assets/map.png");
add([
  sprite("map"),
  pos(0, 50),
  anchor("topleft"), // lugar de origen
 ]);
// --- Función principal ---
async function main() {


  // Cargar datos JSON del mapa
  const mapData = await (await fetch("assets/map.json")).json();

  // Crear colliders desde la capa "colliders"
  for (const layer of mapData.layers) {
    if (layer.name === "colliders" && layer.type === "objectgroup") {
      for (const obj of layer.objects) {
        add([
          rect(obj.width, obj.height),
          pos(obj.x, obj.y + 51),
          area(),
          body({ isStatic: true }),
          anchor("topleft"),
          opacity(0),
          "solid",
        ]);
      }
    }

    if (layer.name === "spikes" && layer.type === "objectgroup") {
      for (const obj of layer.objects) {
        add([
          rect(obj.width, obj.height),
          pos(obj.x, obj.y + 51 ),
          area(),
          body({ isStatic: true }),
          anchor("topleft"),
          opacity(0),
          "spike",
        ]);
      }
    }
    if (layer.name === "springs" && layer.type === "objectgroup") {
      for (const obj of layer.objects) {
        add([
          rect(obj.width, obj.height),
          pos(obj.x, obj.y + 51 ),
          area(),
          body({ isStatic: true }),
          anchor("topleft"),
          opacity(0),
          "spring",
        ]);
      }
    }
    if (layer.name === "usprings" && layer.type === "objectgroup") {
      for (const obj of layer.objects) {
        add([
          rect(obj.width, obj.height),
          pos(obj.x, obj.y + 51 ),
          area(),
          body({ isStatic: true }),
          anchor("topleft"),
          opacity(0),
          "uspring",
        ]);
      }
    }
    if (layer.name === "colliders2" && layer.type === "objectgroup") {
      for (const obj of layer.objects) {
        add([
          rect(obj.width, obj.height),
          pos(obj.x, obj.y + 51 ),
          area(),
          body({ isStatic: true }),
          anchor("topleft"),
          opacity(0),
          "colliders2",
        ]);
      }
    }
    if (layer.name === "colliders4" && layer.type === "objectgroup") {
      for (const obj of layer.objects) {
        add([
          rect(obj.width, obj.height),
          pos(obj.x, obj.y + 51 ),
          area(),
          body({ isStatic: true }),
          anchor("topleft"),
          opacity(0),
          "colliders4",
        ]);
      }
    }
  }
}

// --- Muerte ---
player.onCollide("spike", () => {
  player.pos = startPos.clone();
  player.vel = vec2(0, 0);
});
// --- Muelle ---
player.onCollide("spring", () => {
  player.jump(650);   
  player.use(sprite("jump"));
  springActive = true;
  wait(1, () => {
    springActive = false;
  });
});
player.onCollide("uspring", () => {
  player.jump(1070);   
  player.use(sprite("jump"));
  springActive = true;
  wait(2, () => {
    springActive = false;
  });
});

player.onCollide("colliders4", () => {
  const input3 = add([
    pos(465, 1812),
    text("GG", {
      font: "2p",
      width: 160,
      size: 2*curSize,
      align: "left",
      lineSpacing: 8,
      letterSpacing: 0.2,
      transform: (idx, ch) => ({
        color: hsl2rgb((time() * 0.2 + idx * 0.1) % 1, 0.7, 0.8),
        pos: vec2(0, wave(-2, 2, time() * 2 + idx * 0.5)),
        scale: wave(0.6, 0.8, time() * 2 + idx),
        angle: wave(-1, 1, time() * 2 + idx),
      }),
    }),
  ])
});

player.onCollide("colliders2", () => {

  console.log("Victoria, inputs:", inputs);

  fetch("save_inputs.php?key=CLAVE_SECRETA", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(inputs),
  })
  .then(res => res.text())
  .then(msg => console.log("Servidor responde:", msg))
  .catch(err => console.error("Error enviando:", err));


  player.pos = startPos.clone();
  player.vel = vec2(0, 0);
  const input = add([
  pos(58, 1770),
    text("You  win...", {
      font: "2p",
      width: 160,
      size: curSize,
      align: "left",
      lineSpacing: 8,
      letterSpacing: 1.2,
      transform: (idx, ch) => ({
        color: hsl2rgb((time() * 0.2 + idx * 0.1) % 1, 0.7, 0.8),
        pos: vec2(0, wave(-2, 2, time() * 2 + idx * 0.5)),
        scale: wave(0.6, 0.8, time() * 2 + idx),
        angle: wave(-4, 4, time() * 1.5 + idx),
      }),
    }),
  ])
  const input2 = add([
    pos(196, 1800),
    // Render text with the text() component
    text("You  are  a  legend!", {
      // What font to use
      font: "2p",
      // It'll wrap to next line if the text width exceeds the width option specified here
      width: 160,
      // The height of character
      size: curSize,
      // Text alignment ("left", "center", "right", default "left")
      align: "left",
      lineSpacing: 8,
      letterSpacing: 1.2,
      // Transform each character for special effects
      transform: (idx, ch) => ({
        color: hsl2rgb((time() * 0.2 + idx * 0.1) % 1, 0.7, 0.8),
        pos: vec2(0, wave(-2, 2, time() * 2 + idx * 0.5)),
        scale: wave(0.6, 0.8, time() * 2 + idx),
        angle: wave(-4, 4, time() * 1.5 + idx),
      }),
    }),
  ])

});

main();

// --- Controles del jugador ---

onKeyPress("space", () => {
  if (player.isGrounded()) {
    player.jump(jumpForce);
    player.use(sprite("jump"));
    isJumping = true;
    jumpTimer = 0;
  }
});
onKeyDown("space", () => {
  if (isJumping) {
    jumpTimer += dt();
    if (jumpTimer < maxJumpTime) {
      // Añadir impulso progresivo: modifica la velocidad vertical
      // Restamos porque en Kaboom vel.y positivo = bajar
      player.vel.y -= holdAccel * dt();
    }
  }
});
onKeyRelease("space", () => {
  isJumping = false;
  jumpTimer = 0;
});
onUpdate(() => {
  if (player.isGrounded()) {
    isJumping = false;
    jumpTimer = 0;
  }
});

onKeyDown("right", () => {
 
  moveSpeed = Math.min(moveSpeed + accel * dt(), maxSpeed);
  if (moveSpeed < baseSpeed) moveSpeed = baseSpeed;

  player.move(moveSpeed, 0);
  player.flipX = false;
});
onKeyDown("left", () => {
  
  moveSpeed = Math.max(moveSpeed - accel * dt(), -maxSpeed);
  if (moveSpeed > -baseSpeed) moveSpeed = -baseSpeed;

  player.move(moveSpeed, 0);
  player.flipX = true;
});
onKeyDown("d", () => {
 
  moveSpeed = Math.min(moveSpeed + accel * dt(), maxSpeed);
  if (moveSpeed < baseSpeed) moveSpeed = baseSpeed;

  player.move(moveSpeed, 0);
  player.flipX = false;
});
onKeyDown("a", () => {
  
  moveSpeed = Math.max(moveSpeed - accel * dt(), -maxSpeed);
  if (moveSpeed > -baseSpeed) moveSpeed = -baseSpeed;

  player.move(moveSpeed, 0);
  player.flipX = true;
});


onKeyRelease(["left", "right", "a", "d"], () => {
  moveSpeed = 0; 
});


// Animaciones idle
onUpdate(() => {
  if (player.isGrounded()) {
    if (!isKeyDown("left") && !isKeyDown("right") && !isKeyDown("a") && !isKeyDown("d")) {
      player.use(sprite("idle"));
    }
  }
  if (player.isGrounded()) {
    if (isKeyDown("left") || isKeyDown("right") || isKeyDown("a") || isKeyDown("d")) {
      runTimer += dt();
      if (runTimer >= runSpeed) {
        runIndex = (runIndex + 1) % runSprites.length;
        player.use(sprite(runSprites[runIndex]));
        runTimer = 0;
    }
  }
}
});

onUpdate(() => {
  let x = player.pos.x;
  let y = player.pos.y;
  if (springActive) {


    x = Math.max(width() / 2, Math.min(x, mapWidth - width() / 2));

    y = Math.max(height() / 2, Math.min(y, mapHeight - height() / 2));

    camPos(x, y);
  } else {

    // límites en X (igual que antes)
    x = Math.max(width() / 2, Math.min(x, mapWidth - width() / 2));

    // --- Nuevo control en Y ---
    const yMargin = 120; 
    const currentCamY = camPos().y;

    if (y < currentCamY - yMargin) {
      y = y;
    } else if (y > currentCamY + yMargin) {
      y = y;
    } else {
      y = currentCamY;
    }

    // límites en Y
    y = Math.max(height() / 2, Math.min(y, mapHeight - height() / 2));

    camPos(x, y);
  }
});

onUpdate(() => {
  if (player.pos.y > 1400) {
    if (player.vel.y > 250) { // límite de caída
      player.vel.y = 250;
  } else {
      if (player.vel.y > 300) { // límite de caída
        player.vel.y = 300;
      }
    }
  }
});