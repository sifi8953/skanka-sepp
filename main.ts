function showBoard (target: number) {
    for (let value of playersHitBoard[target]) {
        tempValueX = convertToText(value).substr(2, 1)
        tempValueY = convertToText(value).substr(3, 1)
        led.plot(parseInt(tempValueX), parseInt(tempValueY))
    }
}
input.onButtonPressed(Button.A, function () {
    if (currentlyShooting) {
        if (alreadyHit == false) {
            led.unplot(shootingTargetX, shootingTargetY)
        }
        shootingTargetX += 1
        if (shootingTargetX > 4) {
            shootingTargetX = 0
        }
        if (led.point(shootingTargetX, shootingTargetY)) {
            alreadyHit = true
        } else {
            alreadyHit = false
        }
        led.plot(shootingTargetX, shootingTargetY)
    } else {
        basic.clearScreen()
        targetedPlayer += -1
        if (targetedPlayer == -1) {
            targetedPlayer = player_count - 1
        }
        if (targetedPlayer == this_id) {
            targetedPlayer += -1
        }
        showBoard(targetedPlayer)
    }
})
function Shoot (playerToShoot: number) {
    shootingTargetX = 0
    shootingTargetY = 0
    if (led.point(shootingTargetX, shootingTargetY)) {
        alreadyHit = true
    } else {
        alreadyHit = false
    }
    led.plot(shootingTargetX, shootingTargetY)
    currentlyShooting = true
}
input.onButtonPressed(Button.AB, function () {
    if (currentlyShooting == false) {
        Shoot(targetedPlayer)
    } else {
        tempNewValue = "" + (targetedPlayer + 1) + "0" + shootingTargetX + shootingTargetY
        playersHitBoard[targetedPlayer].push(parseInt(tempNewValue))
        currentlyShooting = false
        basic.clearScreen()
    }
})
input.onButtonPressed(Button.B, function () {
    if (currentlyShooting) {
        if (alreadyHit == false) {
            led.unplot(shootingTargetX, shootingTargetY)
        }
        shootingTargetY += 1
        if (shootingTargetY > 4) {
            shootingTargetY = 0
        }
        if (led.point(shootingTargetX, shootingTargetY)) {
            alreadyHit = true
        } else {
            alreadyHit = false
        }
        led.plot(shootingTargetX, shootingTargetY)
    } else {
        basic.clearScreen()
        targetedPlayer += 1
        if (targetedPlayer == player_count) {
            targetedPlayer = 0
        }
        if (targetedPlayer == this_id) {
            targetedPlayer += 1
        }
        showBoard(targetedPlayer)
    }
})
let tempNewValue = ""
let shootingTargetY = 0
let shootingTargetX = 0
let alreadyHit = false
let tempValueY = ""
let tempValueX = ""
let playersHitBoard: number[][] = []
let targetedPlayer = 0
let player_count = 0
let this_id = 0
let currentlyShooting = false
radio.setGroup(101)
currentlyShooting = false
this_id = 2
player_count = 4
targetedPlayer = 0
playersHitBoard = [
[1024, 1041],
[2014],
[3011],
[4002, 4004]
]
basic.forever(function () {
    if (currentlyShooting && alreadyHit == false) {
        led.toggle(shootingTargetX, shootingTargetY)
        basic.pause(500)
        led.toggle(shootingTargetX, shootingTargetY)
        basic.pause(500)
    }
})
