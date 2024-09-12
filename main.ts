input.onButtonPressed(Button.A, function () {
    targetedPlayer += -1
    if (targetedPlayer == -1) {
        targetedPlayer = player_count - 1
    }
    if (targetedPlayer == this_id) {
        targetedPlayer += -1
    }
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
    targetedPlayer += 1
    if (targetedPlayer == player_count) {
        targetedPlayer = 0
    }
    if (targetedPlayer == this_id) {
        targetedPlayer += 1
    }
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
let targetedPlayer = 0
let player_count = 0
let this_id = 0
let currentlyShooting = false
radio.setGroup(101)
currentlyShooting = false
this_id = 2
player_count = 4
targetedPlayer = 0
basic.forever(function () {
    basic.showNumber(targetedPlayer)
})
