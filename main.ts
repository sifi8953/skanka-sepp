function Shoot (playerToShoot: number) {
    shootingTargetX = 0
    shootingTargetY = 0
    led.plot(shootingTargetX, shootingTargetY)
}
let shootingTargetY = 0
let shootingTargetX = 0
radio.setGroup(101)
Shoot(1)
basic.forever(function () {
	
})
