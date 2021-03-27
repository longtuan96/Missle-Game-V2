//Initialize the canvas

const canvas = document.getElementById("canvas");
canvas.width = innerWidth; //make the canvas full screen
canvas.height = innerHeight; //^ same
const ctx = canvas.getContext("2d");
const scoreEl = document.getElementById("scoreEl");

//define a player
class Player {
  constructor(x, y, radius, color) {
    //constructor is a builder for a class. it will create a object with below property
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
  }
  //adding draw function for class Player
  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    ctx.fillStyle = this.color;
    ctx.fill();
  }
}

//define the bullet
class Projectile {
  constructor(x, y, xEnd, yEnd, radius, color, velocity) {
    this.x = x;
    this.y = y;
    this.xEnd = xEnd;
    this.yEnd = yEnd;
    this.radius = radius;
    this.color = color;
    this.velocity = velocity;
  }
  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    ctx.fillStyle = this.color;
    ctx.fill();
  }

  update() {
    this.draw();
    this.x = this.x + this.velocity.x;
    this.y = this.y + this.velocity.y;
  }
}
//define the explosion
class Explosion {
  constructor(x, y, radius, color) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.alpha = 0.5;
  }
  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    ctx.fillStyle = this.color;
    ctx.fill();
  }

  update() {
    this.draw();
    this.alpha -= 0.01;
  }
}

//define Enemy
class Enemy {
  constructor(x, y, radius, color, velocity) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.velocity = velocity;
  }
  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    ctx.fillStyle = this.color;
    ctx.fill();
  }

  update() {
    this.draw();
    this.x = this.x + this.velocity.x;
    this.y = this.y + this.velocity.y;
  }
}

//define Particles
const friction = 0.98;
class Particle {
  constructor(x, y, radius, color, velocity) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.velocity = velocity;
    this.alpha = 1.5; //value for disappear after sometime
  }
  draw() {
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.restore();
  }

  update() {
    this.draw();
    this.velocity.x *= friction;
    this.velocity.y *= friction;
    this.x = this.x + this.velocity.x;
    this.y = this.y + this.velocity.y;
    this.alpha -= 0.01;
  }
}

//Creating a player
const x = canvas.width / 2;
const y = canvas.height;
const player = new Player(x, y, 30, "white");

//create enemies\
const enemies = [];
//Function to spawn Enemies
function spawnEnemy() {
  setInterval(() => {
    let radius = Math.random() * (30 - 4) + 4;
    let x;
    let y;
    //Enemy spawn point
    if (Math.random() < 0.5) {
      x = Math.random() < 0.5 ? 0 - radius : canvas.width + radius;
      y = Math.random() * canvas.height;
    } else if (Math.random() > 0.5) {
      y = 0 - radius;
      x = Math.random() * canvas.width;
    }

    let color = `hsl(${Math.random() * 360},50%,50%)`;
    const angle = Math.atan2(canvas.height - y, canvas.width / 2 - x);
    const velocity = {
      x: Math.cos(angle),
      y: Math.sin(angle),
    };
    enemies.push(new Enemy(x, y, radius, color, velocity));
  }, 5000);
}
//creating bullet
const particles = [];
const projectiles = []; //array contains all the bullet current onscreen
const explosions = [];
let animation;
let score = 0;

//ANIMATION
function animate() {
  animation = requestAnimationFrame(animate);
  ctx.fillStyle = "rgba(0,0,0,0.1)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  player.draw();
  projectiles.forEach((projectile, projectileIndex) => {
    projectile.update();
    //remove bullet at the clicked spot
    if (projectile.y < projectile.yEnd) {
      explosions.push(
        new Explosion(
          projectile.xEnd,
          projectile.yEnd,
          projectile.radius,
          "white"
        )
      );
      console.log(explosions);
      setTimeout(function () {
        projectiles.splice(projectileIndex, 1);
      }, 0);
    }
  });
  explosions.forEach((explosion, explosionIndex) => {
    if (explosion.alpha <= 0) {
      explosions.splice(explosionIndex, 1);
    } else {
      explosion.update();
      gsap.to(explosion, {
        radius: explosion.radius + 10,
      });
    }
  });

  enemies.forEach((enemy, enemyIndex) => {
    enemy.update();
    const distToPlayer = Math.hypot(player.x - enemy.x, player.y - enemy.y);
    if (distToPlayer - enemy.radius - player.radius < 1) {
      cancelAnimationFrame(animation);
    }
    //hit on enemy detection
    explosions.forEach((explosion, explosionIndex) => {
      const dist = Math.hypot(explosion.x - enemy.x, explosion.y - enemy.y);
      if (dist - enemy.radius - explosion.radius < 1) {
        //create particles on hit
        for (let index = 0; index < enemy.radius * 2; index++) {
          particles.push(
            new Particle(
              explosion.x,
              explosion.y,
              Math.random() * 2,
              enemy.color,
              {
                x: (Math.random() - 0.5) * (Math.random() * 6),
                y: (Math.random() - 0.5) * (Math.random() * 6),
              }
            )
          );
        }

        setTimeout(() => {
          score += 250;
          scoreEl.innerHTML = score;
          enemies.splice(enemyIndex, 1);
          // explosions.splice(explosionIndex, 1);
        }, 0);
      }
    });
  });

  particles.forEach((particle, particleIndex) => {
    if (particle.alpha <= 0) {
      particles.splice(particleIndex, 1);
    } else {
      particle.update();
    }
  });
}
animate();
spawnEnemy();
//every time clicked spawn a bullet in the middle
addEventListener("click", (event) => {
  //everytime there is an event, do below
  const angle = Math.atan2(
    //angle to destionation
    //atan2 function using x axis first then y axis
    event.clientY - canvas.height,
    event.clientX - canvas.width / 2
  );
  const speedBullet = 5;
  const velocity = {
    x: Math.cos(angle) * speedBullet,
    y: Math.sin(angle) * speedBullet,
  };
  projectiles.push(
    new Projectile(
      canvas.width / 2,
      canvas.height,
      event.clientX,
      event.clientY,
      5,
      "white",
      velocity
    )
  );
  console.log(`clientX: ${event.clientX}`);
  console.log(`clientY: ${event.clientY}`);
});
