const scoreEl = document.querySelector('#scoreEl')

const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')

canvas.width = 1024
canvas.height = 576

class Player {
    constructor() {        
        this.velocity = {
            x: 0,
            y: 0
        }

        this.rotation = 0

        this.opacity = 1

        const image = new Image()
        image.src = './images/spaceship.png'
        image.onload = () => {
            const scale = 0.20
            this.image = image

            this.width = this.image.width * scale,
            this.height = this.image.height * scale

            this.position = {
                x: canvas.width/2 - this.width/2,
                y: canvas.height - this.height - 20
            }
    
        }
        
    }

    drawPlayer() {
        c.save()
        c.globalAlpha = this.opacity
        c.translate(
            this.position.x + this.width/2, 
            this.position.y + this.height/2
        )

        c.rotate(this.rotation)

        c.translate(
            -(this.position.x + this.width/2), 
            -(this.position.y + this.height/2)
        )

        c.drawImage(
            this.image, 
            this.position.x, this.position.y, 
            this.width, this.height
        )

        c.restore()
    }

    updatePlayer() {
        if (this.image) { 
            this.drawPlayer()
            this.position.x += this.velocity.x
        }
    }
}

class Projectile {
    constructor({position, velocity}) {
        this.position = position 
        this.velocity = velocity 

        this.radius = 4
    }

    drawProjectile() {
        c.beginPath()
        c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI*2)
        c.fillStyle = 'orange'
        c.fill()
        c.closePath()
    }

    updateProjectile() {
        this.drawProjectile()
        this.position.x += this.velocity.x
        this.position.y += this.velocity.y
    }
}

class Invader {
    constructor({position}) {        
        // this.velocity = {
        //     x: 0,
        //     y: 0
        // }

        const image = new Image()
        image.src = './images/orange-red-invader.png'
        image.onload = () => {
            const scale = 0.15
            this.image = image

            this.width = this.image.width * scale,
            this.height = this.image.height * scale

            this.position = {
                x: position.x,
                y: position.y
            }
        }
    }

    drawInvader() {
        c.drawImage(
            this.image, 
            this.position.x, this.position.y, 
            this.width, this.height
        )
    }

    updateInvader({velocity}) {
        if (this.image) { 
            this.drawInvader()
            this.position.x += velocity.x
            this.position.y += velocity.y
        }
    }

    shootInvader(invaderProjectiles) {
        invaderProjectiles.push(new InvaderProjectile({
            position: {
                x: this.position.x + this.width/2,
                y: this.position.y + this.height
            },
            velocity: {
                x: 0, y: 5
            }
        }))
    }
}

class Grid {
    constructor() {
        this.position = {x: 0, y: 0}
        this.velocity = {x: 2, y: 0}
        this.invaders = []

        const rows = Math.floor(Math.random()*3) + 3
        const columns = Math.floor(Math.random()*4) + 8

        this.width = columns*60.5
        this.height = rows*50

        for (let x=0; x<columns; x++) {
            for (let y=0; y<rows; y++) {
            this.invaders.push(new Invader({
                position: {x: x*60.5, y: y*50}
            }))
            }
        }
    }

    updateGrid() {
        this.position.x += this.velocity.x
        this.position.y += this.velocity.y

        this.velocity.y = 0

        if (this.position.x + this.width >= canvas.width || this.position.x <= 0) {
            this.velocity.x = -this.velocity.x
            this.velocity.y = 50
        }
    }
}

class InvaderProjectile {
    constructor({position, velocity}) {
        this.position = position 
        this.velocity = velocity 

        this.width = 4
        this.height = 20

    }

    drawInvaderProjectile() {
        c.fillStyle = 'green'
        c.fillRect(this.position.x, this.position.y, this.width, this.height)
    }

    updateInvaderProjectile() {
        this.drawInvaderProjectile()
        this.position.x += this.velocity.x
        this.position.y += this.velocity.y
    }
}

class Particle {
    constructor({position, velocity, radius, color, fades}) {
        this.position = position 
        this.velocity = velocity 

        this.radius = radius
        this.color = color
        this.opacity = 1
        this.fades = fades
    }

    drawParticle() {
        c.save()
        c.globalAlpha = this.opacity
        c.beginPath()
        c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI*2)
        c.fillStyle = this.color
        c.fill()
        c.closePath()
        c.restore()
    }

    updateParticle() {
        this.drawParticle()

        this.position.x += this.velocity.x
        this.position.y += this.velocity.y

        if (this.fades) {
            this.opacity -= 0.01
        }
    }
}


// Player & Projectile
const player = new Player()
const projectiles = []
const grids = []
const invaderProjectiles = []
const particles = []

// Keys
const keys = {
    left: {pressed: false},
    right: {pressed: false},
    space: {pressed: false}
}

// Frames
let frames = 0
let randomInterval = Math.floor((Math.random()*500) + 500)

// Game
const game = {
    over: false,
    active: true
}

// Score
let score = 0

// Game Loop
function animate() {
    // Game
    if (!game.active) return

    // Canvas
    requestAnimationFrame(animate)
    c.fillStyle = 'black '
    c.fillRect(0, 0, canvas.width, canvas.height)

    // Player
    player.updatePlayer()

    // Projectiles
    projectiles.forEach((each, index) => {
        if (each.position.y + each.radius <= 0) {
            setTimeout(() => {
                projectiles.splice(index, 1)
            }, 0)
        } else {
            each.updateProjectile()
        }
    })

    // Grids
    grids.forEach((eachGrid, indexGrid) => {
        eachGrid.updateGrid()

        // Invader Projectiles
        if (frames % 40 ===0 && eachGrid.invaders.length > 0) {
            eachGrid.invaders[Math.floor(Math.random() * eachGrid.invaders.length)].shootInvader(invaderProjectiles)
        }    

        eachGrid.invaders.forEach((eachInvader, indexInvader) => {
            eachInvader.updateInvader({velocity: eachGrid.velocity})

            // Collision Detection
            projectiles.forEach((eachProjectile, indexProjectile) => {
                if (eachProjectile.position.y - eachProjectile.radius <= eachInvader.position.y + eachInvader.height &&
                    eachProjectile.position.x + eachProjectile.radius >= eachInvader.position.x &&
                    eachProjectile.position.x - eachProjectile.radius <= eachInvader.position.x + eachInvader.width &&
                    eachProjectile.position.y + eachProjectile.radius >= eachInvader.position.y
                    ) {
                        setTimeout(() => {
                            const invaderFound = eachGrid.invaders.find((invader) => {
                                return invader === eachInvader
                            })

                            const projectileFound = projectiles.find((projectile) => {
                                return projectile === eachProjectile
                            })

                            if (invaderFound && projectileFound) {
                                score += 10
                                scoreEl.innerHTML = score

                                createParticles({object: eachInvader, fades: true})

                                eachGrid.invaders.splice(indexInvader, 1)
                                projectiles.splice(indexProjectile, 1) 
                                
                                // New Grid Width
                                if (eachGrid.invaders.length > 0) {
                                    const firstInvader = eachGrid.invaders[0]
                                    const lastInvader = eachGrid.invaders[eachGrid.invaders.length - 1]
                                
                                    eachGrid.width = lastInvader.position.x - firstInvader.position.x + lastInvader.width
                                    eachGrid.position.x = firstInvader.position.x
                                } else {
                                    grids.splice(indexGrid, 1)
                                }
                            }
                        }, 0)
                }
            })
        })
    })

    // Invader Projectiles
    invaderProjectiles.forEach((eachInvaderProjectile, indexInvaderProjectile) => {
        if (eachInvaderProjectile.position.y + eachInvaderProjectile.height >= canvas.height) {
            setTimeout(() => {
                invaderProjectiles.splice(indexInvaderProjectile, 1)
            }, 0)
        } else {
            eachInvaderProjectile.updateInvaderProjectile()
        }

        // Collision Detection
        if (eachInvaderProjectile.position.y + eachInvaderProjectile.height >= player.position.y &&
            eachInvaderProjectile.position.x + eachInvaderProjectile.width >= player.position.x &&
            eachInvaderProjectile.position.x  <= player.position.x + player.width
            ) {
                setTimeout(() => {
                    invaderProjectiles.splice(indexInvaderProjectile, 1)
                    player.opacity = 0
                    game.over = true
                }, 0)

                setTimeout(() => {
                    game.active = false
                }, 1000)

                createParticles({object: player, color: 'white', fades: true})
        }
    })

    // Particles
    particles.forEach((each, index) => {
        if (each.position.y - each.radius >= canvas.height) {
            each.position.x = Math.random() * canvas.width
            each.position.y = -each.radius
        }

        if (each.opacity <= 0) {
            setTimeout(() => {
                particles.splice(index, 1)
            }, 0)
        } else {
            each.updateParticle()
        }
    })

    // Keys
    if (keys.left.pressed && player.position.x >= 0) {
        player.velocity.x = -7
        player.rotation = -0.15
    } else if (keys.right.pressed && player.position.x+player.width <= canvas.width) {
        player.velocity.x = 7
        player.rotation = 0.15
    } else {
        player.velocity.x = 0
        player.rotation = 0
    } 

    // Frames
    if (frames % randomInterval === 0) { // for every 1000 frames
        grids.push(new Grid)
        frames = 0
        randomInterval = Math.floor((Math.random()*500) + 500)
    }
    frames++
}
animate()

// Player Controls
// Key Down
addEventListener('keydown', event => {
    if (game.over) return

    switch (event.key.toLowerCase()) {
        case 'a':
        case 'ArrowLeft':
            keys.left.pressed = true
            break
        case 'd':
        case 'ArrowRight':
            keys.right.pressed = true
            break
        case ' ':
            projectiles.push(
                new Projectile({
                    position: {
                        x: player.position.x + player.width/2, 
                        y: player.position.y
                    },
                    velocity: {x: 0, y: -10}
                })
            )
            break
        default:
            console.log('Not a case')
    }
})

// Key Up
addEventListener('keyup', event => {
    switch (event.key) {
        case 'a':
        case 'ArrowLeft':
            keys.left.pressed = false
            break
        case 'd':
        case 'ArrowRight':
            keys.right.pressed = false
            break
        case ' ':
            keys.space.pressed = false
            break
        default:
            console.log('Not a case')
    }
})

// Particles 
function createParticles({object, color, fades}) {
    for (let i=0; i<15; i++) {
        particles.push(new Particle({
            position: {
                x: object.position.x + object.width/2,
                y: object.position.y + object.height/2
            },
            velocity: {
                x: (Math.random() - 0.5)*2,
                y: (Math.random() - 0.5)*2
            },
            radius: Math.random() * 3,
            color: color || '#FDA172',
            fades: true
        }))
    }
}

// Stars
for (let i=0; i<50; i++) {
    particles.push(new Particle({
        position: {
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height
        },
        velocity: {
            x: 0,
            y: 0.3
        },
        radius: Math.random() * 3,
        color: 'white'
    }))
}
