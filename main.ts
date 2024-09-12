input.onButtonPressed(Button.A, function () {
    if (currentlyShooting) {
        led.unplot(shootingTargetX, shootingTargetY)
        shootingTargetX += 1
        if (shootingTargetX > 4) {
            shootingTargetX = 0
        }
        led.plot(shootingTargetX, shootingTargetY)
    }
})
function Shoot (playerToShoot: number) {
    shootingTargetX = 0
    shootingTargetY = 0
    currentlyShooting = true
    led.plot(shootingTargetX, shootingTargetY)
}
input.onButtonPressed(Button.B, function () {
    if (currentlyShooting) {
        led.unplot(shootingTargetX, shootingTargetY)
        shootingTargetY += 1
        if (shootingTargetY > 4) {
            shootingTargetY = 0
        }
        led.plot(shootingTargetX, shootingTargetY)
    }
})
let shootingTargetY = 0
let shootingTargetX = 0
let currentlyShooting = false
radio.setGroup(101)
currentlyShooting = false
Shoot(1)
basic.forever(function () {
	
})
