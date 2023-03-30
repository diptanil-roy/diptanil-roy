// Define constants for the game
let GAME_WIDTH = 800;
let GAME_HEIGHT = 600;
let PLAYER_SIZE = 60;
let PLAYER_SPEED = 1;
const PLAYER_COLOR = "red";
const OBSTACLE_COLOR = "blue";
const PRIZE_COLOR = "green";
const SCORE_COLOR = "red";
const GAME_OVER_COLOR = "black";
const GAME_OVER_FONT = "times";
const SCORE_FONT = "times";
const GAME_OVER_MESSAGE = "over";
const MAX_OBSTACLES = 10;
let OBSTACLE_SIZE = 40;
let PRIZE_SIZE = 40;
let OBSTACLE_SPEED = 1;
const OBSTACLE_MASS = 1;
const OBSTACLE_VX = 1;
const OBSTACLE_VY = 1;
const PRIZE_POINTS = 1;
const MAX_PRIZES = 10;

const SCORE_X = 0;
const SCORE_Y = 0;

const GAME_OVER_X = 200;
const GAME_OVER_Y = 200;

const GAME_OVER_SCORE_X = 1000;
const GAME_OVER_SCORE_Y = 1000;

let messageorder = [1,2,3,4,5,6,7,8,9];
for (let i = messageorder.length - 1; i > 0; i--) {
  const j = Math.floor(Math.random() * (i + 1));
  [messageorder[i], messageorder[j]] = [messageorder[j], messageorder[i]];
}

messageorder.push(10);

var animationPlaying = false;

let keys = {};

let playArea = document.getElementById("play-area");

const upButton = document.getElementById("up-btn");
const downButton = document.getElementById("down-btn");
const leftButton = document.getElementById("left-btn");
const rightButton = document.getElementById("right-btn");

// Define the game object
const game = {
  canvas: null,
  ctx: null,
  player: null,
  obstacles: [],
  prizes: [],
  score: 0,
  isPlaying: false,
  isGameOver: false,
  donotshowanimation: false,
  obstacleHitSound: null,
  prizeSound: null,
  lastTime: 0,
  init: async function() {

    if (window.innerWidth < 100 || window.innerHeight < 100) {
      alert("Increase Window Size To Play Game.");
      return;
    }

    var orientation = window.orientation;
    if (orientation === 90 || orientation === -90){
      alert("Change Orientation To Portrait.");
      return;
    }

    this.obstacleHitSound = document.getElementById('obstacleHitSound');
    this.prizeSound = document.getElementById('prizeSound');
    
    this.canvas = document.createElement("canvas");
    if (playArea.children.length != 0) playArea.removeChild(playArea.firstElementChild);
    playArea.appendChild(this.canvas);
    this.ctx = this.canvas.getContext("2d");
    
    playArea.style.width = Math.min(window.innerWidth * 0.8, 800) + "px";
    playArea.style.height = Math.min(window.innerHeight * 0.6, 600) + "px";
    this.canvas.width = playArea.clientWidth - 2;
    this.canvas.height = playArea.clientHeight - 2;

    PLAYER_SIZE = Math.floor(0.075*this.canvas.width);
    OBSTACLE_SIZE = Math.floor(0.05*this.canvas.width);
    PRIZE_SIZE = Math.floor(0.05*this.canvas.width);

    // console.log(PLAYER_SIZE, OBSTACLE_SIZE, PRIZE_SIZE);

    GAME_WIDTH = playArea.clientWidth - 2;
    GAME_HEIGHT = playArea.clientHeight - 2;


    this.ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Initialize the player
    this.player = {
      x: GAME_WIDTH / 2 - PLAYER_SIZE / 2,
      y: GAME_HEIGHT - PLAYER_SIZE,
      size: PLAYER_SIZE,
      color: PLAYER_COLOR,
    };
    
    // Initialize the game state
    this.obstacles = [];
    this.prizes = [];
    this.score = 0;
    this.isPlaying = false;
    this.isGameOver = false;

    this.lastTime = Date.now();
    
    window.addEventListener("keydown",this.keyEventHandler.bind(this));
    window.addEventListener("keyup",this.keyEventHandler.bind(this));
        
    this.spawnObstacles();
    this.spawnPrizes();

    this.drawPrizes();
    this.drawObstacles();
    this.drawPlayer();

    // let fps = null;
    // this.countfps().then((mean) => {console.log(mean);});
    
    let fps = await this.countfps();

    // console.log(fps);

    if (fps < 90){
      PLAYER_SPEED = PLAYER_SPEED + (90 - fps)/90*PLAYER_SPEED;
      OBSTACLE_SPEED = OBSTACLE_SPEED + (90 - fps)/90*OBSTACLE_SPEED;
    }

    // console.log(this.messages);
    // for (let i = 0; i < messageorder.length; i++){
    //   console.log(messageorder[i]-1, this.messages[messageorder[i]-1]);
    // }
    // Add canvas to the DOM

    if ('ontouchstart' in window || navigator.maxTouchPoints){
      this.addtouchcontrols();
    }

    // game.start();
  },
  addtouchcontrols: function(){

    upButton.addEventListener("touchstart", (event) => {this.keyEventHandler(event); upButton.style.backgroundColor = "white"; event.stopPropagation();}, { passive: false });
    downButton.addEventListener("touchstart", (event) => {this.keyEventHandler(event); downButton.style.backgroundColor = "white"; event.stopPropagation();}, { passive: false });
    leftButton.addEventListener("touchstart", (event) => {this.keyEventHandler(event); leftButton.style.backgroundColor = "white"; event.stopPropagation();}, { passive: false });
    rightButton.addEventListener("touchstart", (event) => {this.keyEventHandler(event); rightButton.style.backgroundColor = "white"; event.stopPropagation();}, { passive: false });

    upButton.addEventListener("touchmove", (event) => {this.keyEventHandler(event); button.classList.add('active'); event.stopPropagation();}, { passive: false });
    downButton.addEventListener("touchmove", (event) => {this.keyEventHandler(event); button.classList.add('active'); event.stopPropagation();}, { passive: false });
    leftButton.addEventListener("touchmove", (event) => {this.keyEventHandler(event); button.classList.add('active'); event.stopPropagation();}, { passive: false });
    rightButton.addEventListener("touchmove", (event) => {this.keyEventHandler(event); button.classList.add('active'); event.stopPropagation();}, { passive: false });

    upButton.addEventListener("touchend", (event) => {this.keyEventHandler(event); upButton.style.backgroundColor = "#04AA6D";});
    downButton.addEventListener("touchend", (event) => {this.keyEventHandler(event); downButton.style.backgroundColor = "#04AA6D";});
    leftButton.addEventListener("touchend", (event) => {this.keyEventHandler(event); leftButton.style.backgroundColor = "#04AA6D";});
    rightButton.addEventListener("touchend", (event) => {this.keyEventHandler(event); rightButton.style.backgroundColor = "#04AA6D";});

    // upButton.addEventListener("touchend", this.keyEventHandler.bind(this));
    // downButton.addEventListener("touchend", this.keyEventHandler.bind(this));
    // leftButton.addEventListener("touchend", this.keyEventHandler.bind(this));
    // rightButton.addEventListener("touchend", this.keyEventHandler.bind(this));

  },
  countfps: function () {
    return new Promise((resolve) => {
      let intervalarray = [];
      let counter = 0;
      let startTime = performance.now();
      let previousTime = startTime;
      let currentTime = 0;
      let deltaTime = 0;

      function animatetocount() {
        currentTime = performance.now();
        deltaTime = currentTime - previousTime;
        previousTime = currentTime;
        counter++;
        intervalarray.push(1000 / deltaTime);

        if (intervalarray.length < 20) {
          requestAnimationFrame(animatetocount);
        } else {
          intervalarray = intervalarray.splice(-10);
          let mean = intervalarray.reduce((a, b) => a + b) / intervalarray.length;
          resolve(mean);
        }
      }

      requestAnimationFrame(animatetocount);
    });
  },
  start: function() {

    this.isPlaying = true;

    // Start the game loop
    if (!animationPlaying) this.loop();
  },
  spawnObstacles: function() {
    
    while (this.obstacles.length < MAX_OBSTACLES){
      const x = Math.random() * (GAME_WIDTH - OBSTACLE_SIZE);
      const y = Math.random() * (GAME_HEIGHT - OBSTACLE_SIZE);
      const angle = Math.random() * Math.PI * 2;
      const speed = OBSTACLE_SPEED;

      const obstacle = {x, y, size: OBSTACLE_SIZE, color: OBSTACLE_COLOR, speed,
                        angle,
                        vx: Math.cos(angle) * speed,
                        vy: Math.sin(angle) * speed,
                        mass: OBSTACLE_MASS, // optional
                      };

      // console.log(obstacle.speed, obstacle.angle, obstacle.mass);

      if (!this.isColliding(this.player, obstacle)) {
        this.obstacles.push(obstacle);
      }
    }

    // console.log(OBSTACLE_MASS);
    // console.log(this.obstacles.length);
    // console.log(this.prizes.length);
  },
  spawnPrizes: function() {
      // Generate random positions for prizes

    // console.log(this.prizes.length)

    while (this.prizes.length < MAX_PRIZES){
      const x = Math.random() * (GAME_WIDTH - PRIZE_SIZE);
      const y = Math.random() * (GAME_HEIGHT - PLAYER_SIZE*4 - PRIZE_SIZE);
      const prize = {x, y, size: PRIZE_SIZE, color: PRIZE_COLOR};

      let overlap = false;
      for (const obstacle of this.obstacles) {
        if (this.isColliding(prize, obstacle)) {
          overlap = true;
          continue;
        }
      }

      for (const other of this.prizes){
        if (this.isColliding(prize, other)) {
          overlap = true;
          continue;
        }
        const distance = Math.sqrt((other.x - prize.x) ** 2 + (other.y - prize.y) ** 2);

        if (distance < Math.max(GAME_WIDTH, GAME_HEIGHT)/MAX_PRIZES) overlap = true;
        continue;
      }

      if (this.isColliding(prize, this.player)) overlap = true;

      if (!overlap) this.prizes.push(prize);
    }
  },

  keyEventHandler: function(event){
    keys[event.code] = event.type === "keydown";
    event.preventDefault();

    // console.log(keys);
    if (!this.isPlaying) {
      this.start();

      document.getElementById('start-the-game').disabled = true;
    }

    if (event.type === "touchstart" || event.type === "touchmove") {
    // if (event.type === "touchmove") {
      for (let i = 0; i < event.touches.length; i++) {
        let touch = event.touches[i];
        // if (upButton && touch.target === upButton) {
        //   keys["ArrowUp"] = true; keys["ArrowDown"] = false; keys["ArrowLeft"] = false; keys["ArrowRight"] = false;
        // } else if (downButton && touch.target === downButton) {
        //   keys["ArrowUp"] = false; keys["ArrowDown"] = true; keys["ArrowLeft"] = false; keys["ArrowRight"] = false;
        // } else if (leftButton && touch.target === leftButton) {
        //   keys["ArrowUp"] = false; keys["ArrowDown"] = false; keys["ArrowLeft"] = true; keys["ArrowRight"] = false;
        // } else if (rightButton && touch.target === rightButton) {
        //   keys["ArrowUp"] = false; keys["ArrowDown"] = false; keys["ArrowLeft"] = false; keys["ArrowRight"] = true;
        // }

        if (upButton && touch.target === upButton) {
          keys["ArrowUp"] = true;
        }
        if (downButton && touch.target === downButton) {
          keys["ArrowDown"] = true;
        }
        if (leftButton && touch.target === leftButton) {
          keys["ArrowLeft"] = true;
        }
        if (rightButton && touch.target === rightButton) {
          keys["ArrowRight"] = true;
        }
      }
    } else if (event.type === "touchend" || event.type === "touchcancel") {
      keys = {};
    }
  },

  movePlayer: function() {
    // Move the player based on arrow key input

    // const now = Date.now();

    // if (!this.lastTime) {
    //   this.lastTime = now;
    // }

    // let deltaTime = (now - this.lastTime) / 1000; // convert to seconds
    // this.lastTime = now;

    let deltaTime = 1;

    var playerSpeed = PLAYER_SPEED + 0.5 * this.score/MAX_PRIZES * PLAYER_SPEED;

    if (this.isPlaying) {
      if (keys.ArrowLeft) {

        let tmp = this.player.x - playerSpeed * deltaTime;
        if (tmp <= 0) this.player.x = 0;
        else this.player.x = tmp;

      } 
      if (keys.ArrowRight) {
        let tmp = this.player.x + this.player.size + playerSpeed * deltaTime;
        if (tmp >= this.canvas.width) this.player.x = this.canvas.width - this.player.size;
        else this.player.x = tmp - this.player.size;
      }

      if (keys.ArrowUp) {
        let tmp = this.player.y - playerSpeed * deltaTime;
        if (tmp <= 0) this.player.y = 0;
        else this.player.y = tmp;
      } 

      if (keys.ArrowDown) {
        let tmp = this.player.y + this.player.size + playerSpeed * deltaTime;
        if (tmp >= this.canvas.height) this.player.y = this.canvas.height - this.player.size;
        else this.player.y = tmp - this.player.size;
      }
    } 
  },

  loop: function() {
    // Clear the canvas
    this.ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // console.log(animationPlaying);

    // Move the obstacles and prizes
    const now = Date.now();
    const dt = (now - this.lastTime) / 10;  // Time elapsed since last frame, in seconds
    this.lastTime = now;

    // this.moveObstacles(1);

    this.moveObstacles(1);
    // this.movePrizes();

    this.movePlayer(1);
    
    // Check for collisions
    this.checkCollisions();
    
    // Draw the player, obstacles, and prizes
    
    this.drawPrizes();
    this.drawObstacles();
    this.drawPlayer();
    
    // console.log(this.obstacles.length);
    
    // Check if the game is over
    if (!this.isGameOver) {
      if (!animationPlaying) {
        requestAnimationFrame(this.loop.bind(this));
        // console.log("Perf = ", 1000/performance.now());
      }
    } else {
      this.drawGameOver();
    }
  },
  
  moveObstacles: function(){
  // Move the obstacles and handle collisions
    for (const obstacle of this.obstacles) {
      // Update the obstacle's position based on its velocity
      obstacle.x += obstacle.vx;
      obstacle.y += obstacle.vy;

      // Check for collisions between the obstacle and the edges of the play area
      if (obstacle.x < 0 || obstacle.x + obstacle.size > this.canvas.width) {
        obstacle.vx *= -1;
      }
      if (obstacle.y < 0 || obstacle.y + obstacle.size > this.canvas.height) {
        obstacle.vy *= -1;
      }

      // Check for collisions between the obstacle and other obstacles
      for (const other of this.obstacles) {
        if (obstacle !== other && this.isColliding(obstacle, other)) {
          // Calculate the direction from the obstacle to the other obstacle
          const dx = other.x - obstacle.x;
          const dy = other.y - obstacle.y;
          const angle = Math.atan2(dy, dx);

          // Calculate the components of the obstacle's velocity in the direction of the collision
          const v1x = obstacle.vx * Math.cos(angle) + obstacle.vy * Math.sin(angle);
          const v1y = obstacle.vy * Math.cos(angle) - obstacle.vx * Math.sin(angle);
          const v2x = other.vx * Math.cos(angle) + other.vy * Math.sin(angle);
          const v2y = other.vy * Math.cos(angle) - other.vx * Math.sin(angle);

          // Calculate the new velocities of the obstacles after the collision
          const m1 = OBSTACLE_MASS;
          const m2 = OBSTACLE_MASS;
          const u1x = ((m1 - m2) * v1x + 2 * m2 * v2x) / (m1 + m2);
          const u1y = v1y;
          const u2x = ((m2 - m1) * v2x + 2 * m1 * v1x) / (m1 + m2);
          const u2y = v2y;

          // Update the velocities of the obstacles
          obstacle.vx = u1x * Math.cos(angle) - u1y * Math.sin(angle);
          obstacle.vy = u1y * Math.cos(angle) + u1x * Math.sin(angle);
          other.vx = u2x * Math.cos(angle) - u2y * Math.sin(angle);
          other.vy = u2y * Math.cos(angle) + u2x * Math.sin(angle);

          // Check for overlap and move the objects apart if necessary
          if (this.isColliding(obstacle, other)) {
            // Calculate the distance between the objects
            const distance = Math.sqrt((other.x - obstacle.x) ** 2 + (other.y - obstacle.y) ** 2);

            // Calculate the amount to move each object to separate them
            const overlap = (obstacle.size + other.size - distance) / 8;
            const dx = overlap * (obstacle.x - other.x) / distance;
            const dy = overlap * (obstacle.y - other.y) / distance;

            // Move the objects apart
            obstacle.x += dx;
            obstacle.y += dy;
            other.x -= dx;
            other.y -= dy;

            const divfactor = 1.0;

            if (obstacle.x < obstacle.size / divfactor) {
              obstacle.x = obstacle.size / divfactor;
            }
            if (obstacle.x > this.canvas.width - obstacle.size / divfactor) {
              obstacle.x = this.canvas.width - obstacle.size / divfactor;
            }
            if (obstacle.y < obstacle.size / divfactor) {
              obstacle.y = obstacle.size / divfactor;
            }
            if (obstacle.y > this.canvas.height - obstacle.size / divfactor) {
              obstacle.y = this.canvas.height - obstacle.size / divfactor;
            }
            if (other.x < other.size / divfactor) {
              other.x = other.size / divfactor;
            }
            if (other.x > this.canvas.width - other.size / divfactor) {
              other.x = this.canvas.width - other.size / divfactor;
            }
            if (other.y < other.size / divfactor) {
              other.y = other.size / divfactor;
            }
            if (other.y > this.canvas.height - other.size / divfactor) {
              other.y = this.canvas.height - other.size / divfactor;
            }
          }
        }
      }
    }
  },

  checkCollisions: function() {
    // Check for collisions between the player and obstacles
    for (const obstacle of this.obstacles) {
      if (this.isColliding(this.player, obstacle)) {
        this.resetplayer();
        this.obstacleHitSound.currentTime = 0;
        this.obstacleHitSound.play();
        return;
      }
    }
    
    // Check for collisions between the player and prizes
    for (let i = 0; i < this.prizes.length; i++) {
      const prize = this.prizes[i];
      if (this.isColliding(this.player, prize)) {
        this.prizes.splice(i, 1);
        i--;
        this.prizeSound.currentTime = 0;
        this.prizeSound.play();
        this.score += PRIZE_POINTS;
        if (!this.donotshowanimation) this.showPrizeAnimation();

        if (this.score > 2 && this.score < MAX_PRIZES){
          const x = Math.random() * (GAME_WIDTH - OBSTACLE_SIZE);
          const y = Math.random() * (GAME_HEIGHT - OBSTACLE_SIZE);
          const angle = Math.random() * Math.PI * 2;
          const speed = OBSTACLE_SPEED*(1 + (this.score-0)*0.1);

          const obstacle = {x, y, size: OBSTACLE_SIZE, color: OBSTACLE_COLOR, speed,
                            angle,
                            vx: Math.cos(angle) * speed,
                            vy: Math.sin(angle) * speed,
                            mass: OBSTACLE_MASS, // optional
                          };

          this.obstacles.push(obstacle);
        }
        // animationPlaying = false;
      }
    }
    
    // Check if the player has collected all the prizes
    if (this.prizes.length === 0) {
      this.endGame();
      return;
    }
  },
    isColliding: function(a, b) {
    // Check if two objects are colliding
    return (
      a.x < b.x + b.size &&
      a.x + a.size > b.x &&
      a.y < b.y + b.size &&
      a.y + a.size > b.y
    );
  },

  drawPlayer: function() {
    // Draw the player on the canvas
    // this.ctx.fillStyle = this.player.color;
    // this.ctx.fillRect(this.player.x, this.player.y, this.player.size, this.player.size);
    var playerim = new Image();
    playerim.src = '8bitpunk.png';
    this.ctx.drawImage(playerim, this.player.x, this.player.y, this.player.size, this.player.size);
  },
  drawObstacles: function() {
    // Draw the obstacles on the canvas
    for (const obstacle of this.obstacles) {
      // this.ctx.fillStyle = obstacle.color;
      // this.ctx.fillRect(obstacle.x, obstacle.y, obstacle.size, obstacle.size);

      const image = new Image();
      image.src = 'obst.png';
      this.ctx.drawImage(image, obstacle.x, obstacle.y, obstacle.size + 5, obstacle.size + 5);
    }
  },
  drawPrizes: function() {
    // Draw the prizes on the canvas
    for (const prize of this.prizes) {
      // this.ctx.fillStyle = prize.color;
      // this.ctx.fillRect(prize.x, prize.y, prize.size, prize.size);

      const image = new Image();
      image.src = 'envelope.png';
      this.ctx.drawImage(image, prize.x, prize.y, PRIZE_SIZE, PRIZE_SIZE*0.75);
    }
  },
  drawScore: function() {
    // Draw the score on the canvas
    this.ctx.fillStyle = SCORE_COLOR;
    this.ctx.font = SCORE_FONT;
    this.ctx.fillText(`Score: ${this.score}`, SCORE_X, SCORE_Y);
  },
  drawGameOver: function() {
    // Draw the game over message on the canvas
    // this.ctx.fillStyle = GAME_OVER_COLOR;
    // this.ctx.font = GAME_OVER_FONT;
    // this.ctx.fillText(GAME_OVER_MESSAGE, GAME_OVER_X, GAME_OVER_Y);
    // this.ctx.fillText(`Final Score: ${this.score}`, GAME_OVER_SCORE_X, GAME_OVER_SCORE_Y);
  },
  resetplayer: function() {
    this.player.x = Math.random() * (GAME_WIDTH - PLAYER_SIZE);
    this.player.y = GAME_HEIGHT - PLAYER_SIZE;
  },
  showWinAnimation: function() {
  // Clear the canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Display the message
    this.ctx.font = "50px Arial";
    this.ctx.fillStyle = "white";
    this.ctx.textAlign = "center";
    this.ctx.fillText("Congratulations, you won!", this.canvas.width / 2, this.canvas.height / 2);

    // Wait for a few seconds before restarting the game
    setTimeout(() => {
      this.start();
    }, 3000);
  },
  ToggleMessages: function() {
    this.donotshowanimation = !this.donotshowanimation;
    console.log(this.donotshowanimation);
  },
  showPrizeAnimation: function() {
    animationPlaying = true;
    let animationCanvas = document.createElement('canvas');
    animationCanvas.width = GAME_WIDTH*0.6;
    animationCanvas.height = GAME_HEIGHT*0.6;
    if ('ontouchstart' in window || navigator.maxTouchPoints){
      animationCanvas.width = GAME_WIDTH*0.8;
      animationCanvas.height = GAME_HEIGHT*0.8;
    }
    animationCanvas.style.position = 'absolute';
    animationCanvas.style.top = playArea.offsetTop + GAME_HEIGHT*0.2 + 'px';
    animationCanvas.style.left = playArea.offsetLeft + GAME_WIDTH*0.2 + 'px';
    if ('ontouchstart' in window || navigator.maxTouchPoints){
      animationCanvas.style.top = playArea.offsetTop + GAME_HEIGHT*0.1 + 'px';
      animationCanvas.style.left = playArea.offsetLeft + GAME_WIDTH*0.1 + 'px';
    }

    animationCanvas.style.zIndex = '2';
    playArea.appendChild(animationCanvas);
    
    let ctx = animationCanvas.getContext('2d');
    ctx.fillStyle = '#0ff30f';
    ctx.fillRect(0, 0, animationCanvas.width, animationCanvas.height);

    var message = null;

    // while ( this.messages.length ){
    //   let index = Math.floor( Math.random()*this.messages.length );
    //   message = this.messages[index];
    //   this.messages.splice( index, 1 );
    // }

    // console.log(this.score);

    message = this.messages[messageorder[this.score - 1] - 1];

    let fontval = Math.min(animationCanvas.width * 0.05, animationCanvas.height * 0.05); // adjust the multiplier as needed

    if ('ontouchstart' in window || navigator.maxTouchPoints){
      fontval = Math.min(animationCanvas.width * 0.03, animationCanvas.height * 0.03); // adjust the multiplier as needed
    }
    // message = 'You won a prize!';
    ctx.fillStyle = 'white';
    // ctx.font = `bold ${fontSize}vw sans-serif`;

    let lineHeight = 20; // set the line height
    // if ('ontouchstart' in window || navigator.maxTouchPoints) lineHeight = 10;

    let lines = message.split('\n');
    let longestLineIndex = 0;

    let maxmessagewidth = 10000000;

    let iter = 0;

    while (maxmessagewidth > animationCanvas.width){

      fontval = Math.min(animationCanvas.width * (0.05 - 0.001*iter), animationCanvas.height * (0.05 - 0.001*iter)); // adjust the multiplier as needed

      let messageWidth = 0;

      ctx.font = 'bold ' + fontval + 'px sans-serif';

      // find the longest line and its width
      for (let i = 0; i < lines.length; i++) {
        let lineWidth = ctx.measureText(lines[i]).width;
        if (lineWidth > messageWidth) {
            messageWidth = lineWidth;
            longestLineIndex = i;
        }
      }

      maxmessagewidth = messageWidth;

      iter+=1;
    }
    
    

    // let lineX = (animationCanvas.width - messageWidth) / 2;
    // let lineY = (animationCanvas.height - lineHeight * lines.length) / 2 + lineHeight * longestLineIndex;

    // // let lineY = animationCanvas.height / 2 - lines.length * 25;
    // let lineY = animationCanvas.height / 2 - (lines.length - 1) / 2 * lineHeight;

    for (let i = 0; i < lines.length; i++) {
        let line = lines[i];
        let lineX = (animationCanvas.width - ctx.measureText(line).width) / 2;
        let lineY = (animationCanvas.height - lineHeight * lines.length) / 2 + lineHeight * i;
        
        ctx.fillText(line, lineX, lineY);
    }

    let animationDuration = 15000; // 15 seconds
    let animationStartTime = performance.now();

    let animate = () => {
      let elapsedTime = performance.now() - animationStartTime;
      let progress = elapsedTime/ animationDuration;
      if (progress >= 1) {
        playArea.removeChild(animationCanvas);
        animationPlaying = false;
        // playArea.removeChild(playArea.lastElementChild)
        this.loop();
        return;
      }
      ctx.clearRect(0, 0, animationCanvas.width, animationCanvas.height);
      ctx.fillStyle = 'rgba(255, 255, 255, ' + (1 - progress/2) + ')';
      // ctx.fillStyle = 'rgba(15, 243, 15, ' + (1 - progress) + ')';
      // ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, animationCanvas.width, animationCanvas.height);
      // ctx.fillStyle = '#0ff30f';
      ctx.fillStyle = 'black';
      ctx.font = 'bold ' + fontval + 'px sans-serif';
      // messageWidth = ctx.measureText(message).width;
      // x = (animationCanvas.width) / 2 - messageWidth / 2;
      // y = animationCanvas.height / 2;
      // ctx.fillText(message, x, y);
      for (let i = 0; i < lines.length; i++) {
        let line = lines[i];
        let lineX = (animationCanvas.width - ctx.measureText(line).width) / 2;
        let lineY = (animationCanvas.height - lineHeight * lines.length) / 2 + lineHeight * i;
        ctx.fillText(line, lineX, lineY);
      }
      requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  },
  endGame: function() {
    // End the game and display the game over message
    this.isGameOver = true;
  },
  messages: [
    "Pritha says:\nHey Pankti, a very happy birthday to you!\nI hope you find all the great results from your work too!\nThank you for being a positive support,\nwise beyond your years,\nand reigniting a passion for old clothes! 😛❤️\nHere's hoping you have an amazing day, year and life.\nI cannot wait to be reunited with my friend\n(the look on Diptanil's face)! ❤️",
    "Zeel says:\nHey pancake! I know you don't like the name\nbut I'll still call you that.\nAnd yes a berry happy birthday to you.\nYou age like a fine wine and drink a lot of it \n so you can forget your ass is getting older. ;)",
    "Cheshta says:\nHappy Birthday Babe, I love you soo much!!!\nYou are the perfect combo of caring and sassy\nand you have an ass that just won't quit.\nI love our silly inside jokes\nand every little moment together.\nCheers to another year of some science ish,\nmore jokes, shit ton of food and good orgasms!!\nCelebrate mega mega hard ❤️",
    "Rucha says:\nHappy birthday, Pankti!\nHere's me wishing you\nlove, peace, and happiness in abundance!\nYou're a beautiful human inside out,\nand I am glad I have got\nto share all these years with you.\nI love you! God bless! 🌻",
    "Vishv says:\nHappy birthday, PANKTIII!!\nWassup? \nHope you're still up for that threesome?",
    "Harshil says:\nYou have taught me many things \nand inspired me to improve.\nYou have impacted my life beyond measure,\nfor that I am grateful.\nHave the best birthday,\nand best of luck for your next adventures.",
    "Mauli says:\nHappy Birthday Sister.\nI believe this year will bring wonderful things to your life.\nI’m so thankful to have a sister like you \nto share life’s ups and downs with.\nLove you",
    "Indira says:\nHappy birthday, Pankti.\nI hope you had a great day.\nI don't know when you're gonna get this message,\nbut I hope you have a great birthday\nand we're going to have a lot of fun,\nmake you drunk and party.",
    "Shubham says:\nOn Pankti's special day,\nFrom London to New Jersey, we say,\nHappy Birthday to our dear friend,\nwhose Gujarati roots and veggie trends,\nBring us dabeli delights that never end.",
    "Neil says:\nHi baby, I love you.\nHappy birthday to you.\nI can't wait to see the amazing things \nyou do and achieve in your life ahead.\nJust know that I am always in your corner,\nno matter where we are in life."
  ]
};

// Start the game when the DOM is ready
document.addEventListener("DOMContentLoaded", function() {

  game.init();

  const title = document.getElementById("Title");
  const l1 = document.getElementById("Line1");
  const l2 = document.getElementById("Line2");
  const l3 = document.getElementById("Line3");
  const l4 = document.getElementById("Line4");

  if ('ontouchstart' in window || navigator.maxTouchPoints) {
    // Show touch control buttons
    document.getElementById('touch-controls').style.display = 'block';
    title.style.fontSize = 4 + 'vw';
    l1.style.fontSize = 2 + 'vw';
    l2.style.fontSize = 2 + 'vw';
    l3.style.fontSize = 2 + 'vw';
    l4.style.fontSize = 2 + 'vw';
  }

  // Call the function whenever the window is resized
  window.addEventListener("resize", function(){ window.location.reload() });

  const startbutton = document.getElementById('start-the-game');

  startbutton.addEventListener('click', function() {
    startbutton.disabled = true;
  });

  // if (game.isPlaying) startbutton.disabled = true;

  const button = document.getElementById("message-toggle");

  button.addEventListener("click", function() {
  if (button.textContent === "Do Not Show Messages") {
    button.textContent = "Show Messages";
  } else {
    button.textContent = "Do Not Show Messages";
  }

});
});

