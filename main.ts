function long_to_str (num: number) {
    return "" + String.fromCharCode(Math.trunc(num / 2 ** (8 * 0) % 2 ** 8)) + String.fromCharCode(Math.trunc(num / 2 ** (8 * 1) % 2 ** 8)) + String.fromCharCode(Math.trunc(num / 2 ** (8 * 2) % 2 ** 8)) + String.fromCharCode(Math.trunc(num / 2 ** (8 * 3) % 2 ** 8))
}
function updateCursor () {
    accX = input.acceleration(Dimension.X)
    accY = input.acceleration(Dimension.Y)
    if (!(alreadyHit)) {
        led.unplot(cursorPosX, cursorPosY)
    }
    if (accX < -500) {
        cursorPosX = (cursorPosX - 1 + 5) % 5
    } else if (accX > 500) {
        cursorPosX = (cursorPosX + 1) % 5
    }
    if (accY < -500) {
        cursorPosY = (cursorPosY - 1 + 5) % 5
    } else if (accY > 500) {
        cursorPosY = (cursorPosY + 1) % 5
    }
    alreadyHit = led.point(cursorPosX, cursorPosY)
    if (!(alreadyHit)) {
        led.plot(cursorPosX, cursorPosY)
    }
}
function connect () {
    set_timeout(5000)
    send_req(0, 201, "")
    if (timed_out) {
        this_id = 0
    } else {
        this_id = response.charCodeAt(0)
    }
    if (this_id == 65535) {
        this_id = -1
    }
    if (this_id != -1) {
        while (player_serial_nums.length <= this_id) {
            player_serial_nums.push(-1)
            player_latest_pings.push(-1)
            player_statuses.push(-1)
            playersHitBoard.push([])
        }
        player_serial_nums[this_id] = control.deviceSerialNumber()
        player_statuses[received.charCodeAt(0)] = 2
    }
}
function extract_to (msg: string) {
    return str_to_long(msg.substr(0, 4))
}
function pack_msg (to: number, id: number, _type: number, msg: string) {
    return "" + long_to_str(to) + long_to_str(id) + String.fromCharCode(_type) + msg
}
function showBoard (target: number) {
    // Check playersHitBoard[targetedPlayer] is init before push
    if (!(playersHitBoard[target]) || playersHitBoard[target].length == 0) {
        return
    }
    for (let value of playersHitBoard[target]) {
        tempValueX = convertToText(value).substr(2, 1)
        tempValueY = convertToText(value).substr(3, 1)
        temp_has_hit = convertToText(value).substr(4, 1)
        led_value = 255
        if (temp_has_hit == "0") {
            led_value = 32
        }
        led.plotBrightness(parseInt(tempValueX), parseInt(tempValueY), led_value)
    }
}
function req_handler (_from: number, id: number, _type: number, msg: string) {
    can_handle = true
    if (_type == 201) {
        if (this_id == -1) {
            can_handle = false
            return ""
        } else {
            if (player_serial_nums.indexOf(_from) != -1) {
                return String.fromCharCode(player_serial_nums.indexOf(_from))
            } else if (is_playing) {
                return String.fromCharCode(65535)
            } else {
                return String.fromCharCode(player_serial_nums.length)
            }
        }
    } else if (_type == 219) {
        has_hit = false
        ifHit(parseInt(msg.substr(0, 1)), parseInt(msg.substr(1, 1)), allX, allY)
        if (has_hit) {
            return "1"
        } else {
            return "0"
        }
    } else {
        can_handle = false
        return ""
    }
}
function extract_type (msg: string) {
    return msg.charCodeAt(8)
}
function extract_msg (msg: string) {
    return msg.substr(9, msg.length - 9)
}
input.onButtonPressed(Button.A, function () {
    if (!(is_playing)) {
        if (this_id != -1) {
            basic.showNumber(this_id)
        } else {
            basic.showIcon(IconNames.No)
        }
    } else if (isThisTurn) {
        basic.clearScreen()
        targetedPlayer += 0 - 1
        if (targetedPlayer < 0) {
            targetedPlayer = player_count - 1
        }
        if (targetedPlayer == this_id) {
            targetedPlayer += 0 - 1
        }
        // Check if playersHitBoard[targetedPlayer] is init
        if (playersHitBoard[targetedPlayer] && playersHitBoard[targetedPlayer].length > 0) {
            showBoard(targetedPlayer)
        }
    }
})
function send_fin (to: number, id: number) {
    radio.sendString("" + (pack_msg(to, id, 1, "")))
}
function str_to_long (str: string) {
    return str.charCodeAt(0) * 2 ** (8 * 0) + str.charCodeAt(1) * 2 ** (8 * 1) + str.charCodeAt(2) * 2 ** (8 * 2) + str.charCodeAt(3) * 2 ** (8 * 3)
}
function displayGrid (grid: number[][]) {
    for (let x2 = 0; x2 <= 4; x2++) {
        for (let y2 = 0; y2 <= 4; y2++) {
            if (grid[y2][x2] == 1) {
                led.plot(x2, y2)
            } else {
                led.unplot(x2, y2)
            }
        }
    }
}
function send_res (to: number, id: number, msg: string, event: number) {
    message = pack_msg(to, id, 2, msg)
    event_channel = event
    control.raiseEvent(
    1024,
    1
    )
}
function showShips () {
    basic.clearScreen()
    for (let index2 = 0; index2 <= allX.length - 1; index2++) {
        led.plotBrightness(allX[index2], allY[index2], 255)
    }
    for (let index3 = 0; index3 <= hitX.length - 1; index3++) {
        led.plotBrightness(hitX[index3], hitY[index3], 32)
    }
}
function extract_id (msg: string) {
    return str_to_long(msg.substr(4, 4))
}
control.onEvent(1024, 1, function () {
    awaiting = true
})
function set_timeout (time: number) {
    timed_out = false
    wait_until = control.millis() + time
}
input.onButtonPressed(Button.AB, function () {
    if (this_id == -1) {
        connect()
        if (this_id != -1) {
            basic.showNumber(this_id)
        } else {
            basic.showIcon(IconNames.No)
        }
    } else if (!(is_playing)) {
        if (this_id != -1) {
            is_playing = true
            basic.showIcon(IconNames.Yes)
            basic.pause(500)
            generateShips(4)
            generateShips(3)
            generateShips(2)
            if (this_id == 0) {
                isThisTurn = true
                basic.showIcon(IconNames.Happy)
            }
        }
    } else if (isThisTurn) {
        if (currentlyShooting) {
            hideCursor()
            basic.clearScreen()
            fireAtTarget(targetedPlayer)
            send_msg(player_serial_nums[(this_id + 1) % player_count], 199, "")
            isThisTurn = false
        } else {
            if (targetedPlayer != this_id) {
                basic.clearScreen()
                showBoard(targetedPlayer)
                alreadyHit = led.point(cursorPosX, cursorPosY)
                showCursor()
                currentlyShooting = true
            }
        }
    }
})
radio.onReceivedString(function (receivedString) {
    if (extract_to(receivedString) == 0 || extract_to(receivedString) == control.deviceSerialNumber() || true) {
        let handled_msgs: string[] = []
        if (extract_type(receivedString) == 1) {
            if (awaiting && extract_id(receivedString) == extract_id(message)) {
                awaiting = false
            }
        } else if (extract_type(receivedString) == 2) {
            if (awaiting && extract_id(receivedString) == extract_id(message)) {
                response = extract_msg(receivedString)
                awaiting = false
            }
            send_fin(radio.receivedPacket(RadioPacketProperty.SerialNumber), extract_id(receivedString))
        } else if (100 <= extract_type(receivedString) && extract_type(receivedString) < 200) {
            if (!(awaiting)) {
                if (handled_msgs.indexOf("" + long_to_str(radio.receivedPacket(RadioPacketProperty.SerialNumber)) + long_to_str(extract_id(receivedString))) == -1) {
                    handled_msgs.push("" + long_to_str(radio.receivedPacket(RadioPacketProperty.SerialNumber)) + long_to_str(extract_id(receivedString)))
                    received = extract_msg(receivedString)
                    received_serial_num = radio.receivedPacket(RadioPacketProperty.SerialNumber)
                    control.raiseEvent(
                    1024,
                    extract_type(receivedString)
                    )
                }
                send_fin(radio.receivedPacket(RadioPacketProperty.SerialNumber), extract_id(receivedString))
            }
        } else if (200 <= extract_type(receivedString) && extract_type(receivedString) < 300) {
            if (!(awaiting)) {
                if (handled_msgs.indexOf("" + long_to_str(radio.receivedPacket(RadioPacketProperty.SerialNumber)) + long_to_str(extract_id(receivedString))) == -1) {
                    handled_msgs.push("" + long_to_str(radio.receivedPacket(RadioPacketProperty.SerialNumber)) + long_to_str(extract_id(receivedString)))
                    received = extract_msg(receivedString)
                    received_serial_num = radio.receivedPacket(RadioPacketProperty.SerialNumber)
                    tmp_str = req_handler(radio.receivedPacket(RadioPacketProperty.SerialNumber), extract_id(receivedString), extract_type(receivedString), extract_msg(receivedString))
                    if (can_handle) {
                        send_res(radio.receivedPacket(RadioPacketProperty.SerialNumber), extract_id(receivedString), tmp_str, extract_type(receivedString))
                    }
                }
            }
        } else {
            if (handled_msgs.indexOf("" + long_to_str(radio.receivedPacket(RadioPacketProperty.SerialNumber)) + long_to_str(extract_id(receivedString))) == -1) {
                handled_msgs.push("" + long_to_str(radio.receivedPacket(RadioPacketProperty.SerialNumber)) + long_to_str(extract_id(receivedString)))
                received = extract_msg(receivedString)
                received_serial_num = radio.receivedPacket(RadioPacketProperty.SerialNumber)
                control.raiseEvent(
                1024,
                extract_type(receivedString)
                )
            }
        }
    }
})
function send_req (to: number, _type: number, msg: string) {
    message = pack_msg(to, control.millis(), _type, msg)
    event_channel = 2
    control.raiseEvent(
    1024,
    1
    )
    control.waitForEvent(1024, 2)
    return response
}
input.onButtonPressed(Button.B, function () {
    if (!(is_playing)) {
        basic.showNumber(player_count)
    } else if (isThisTurn) {
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
function fireAtTarget (targetedPlayer: number) {
    targetPos = "" + cursorPosX + cursorPosY
    fireResult = send_req(player_serial_nums[targetedPlayer], 219, targetPos)
    tempNewValue = "" + (targetedPlayer + 1) + "0" + cursorPosX + cursorPosY + fireResult
    // Check playersHitBoard[targetedPlayer] is init before push
    if (!(playersHitBoard[targetedPlayer])) {
        playersHitBoard[targetedPlayer] = []
    }
    playersHitBoard[targetedPlayer].push(parseInt(tempNewValue))
    currentlyShooting = false
    cursorPosX = 2
    cursorPosY = 2
    if (fireResult == "0") {
        basic.showIcon(IconNames.No)
    } else {
        basic.showIcon(IconNames.Yes)
    }
    basic.pause(500)
    basic.clearScreen()
    // Remove this later when implementing turn mode
    showBoard(targetedPlayer)
}
function hideCursor () {
    isCursorActive = false
    led.unplot(cursorPosX, cursorPosY)
}
control.onEvent(1024, 199, function () {
    if (is_dead) {
        send_msg(player_serial_nums[(this_id + 1) % player_count], 199, "")
    } else {
        isThisTurn = true
        basic.showIcon(IconNames.Happy)
    }
})
function send_msg (to: number, _type: number, msg: string) {
    message = pack_msg(to, control.millis(), _type, msg)
    event_channel = 2
    control.raiseEvent(
    1024,
    1
    )
    control.waitForEvent(1024, 2)
}
function genPos (num: number, num2: number, num3: number, array: number[], array2: number[]) {
    for (let index22 = 0; index22 <= num - 2; index22++) {
        if (changePos < 4 && changedDirection == false) {
            changePos = changePos + 1
        } else {
            if (changedDirection == false) {
                changePos = num2
            }
            changedDirection = true
            changePos = changePos - 1
        }
        array.push(changePos)
        array2.push(num3)
    }
}
function didCollide (length2: number) {
    done = false
    colided = false
    for (let lengthPoint = 0; lengthPoint <= length2 - 1; lengthPoint++) {
        for (let allPoint = 0; allPoint <= allX.length - (1 + length2); allPoint++) {
            newPoint = allX[allX.length - (1 + lengthPoint)]
            newPointY = allY[allY.length - (1 + lengthPoint)]
            if (newPoint == allX[allPoint] && newPointY == allY[allPoint]) {
                done = true
            }
        }
        if (done == true) {
            colided = true
        }
    }
}
control.onEvent(1024, 11, function () {
    while (player_serial_nums.length <= received.charCodeAt(0)) {
        player_serial_nums.push(-1)
        player_latest_pings.push(-1)
        player_statuses.push(-1)
        playersHitBoard.push([])
    }
    player_serial_nums[received.charCodeAt(0)] = received_serial_num
    player_latest_pings[received.charCodeAt(0)] = control.millis()
    player_statuses[received.charCodeAt(0)] = 1
})
function generateShips (length: number) {
    while (0 == 0) {
        generated = false
        colided = true
        posY = randint(0, 4)
        posX = randint(0, 4)
        allX.push(posX)
        allY.push(posY)
        xOrY = Math.randomBoolean()
        changedDirection = false
        if (xOrY == true) {
            changePos = posX
            amountGenerated += 1
            genPos(length, posX, posY, allX, allY)
            didCollide(length)
            if (colided == true) {
                for (let index32 = 0; index32 <= length - 1; index32++) {
                    allX.pop()
                    allY.pop()
                }
            } else {
                break;
            }
        } else {
            changePos = posY
            amountGenerated += 1
            genPos(length, posY, posX, allY, allX)
            didCollide(length)
            if (colided == true) {
                for (let index42 = 0; index42 <= length - 1; index42++) {
                    allX.pop()
                    allY.pop()
                }
            } else {
                break;
            }
        }
    }
}
function getFireResult (receivedString: string) {
    x = parseInt(receivedString.charAt(0))
    y = parseInt(receivedString.charAt(1))
    checkFire = playerGrid[y][x]
    if (checkFire) {
        return "hit"
    } else {
        return "miss"
    }
}
function ifHit (x: number, y: number, xPos: any[], yPos: any[]) {
    while (countingInt < allX.length) {
        if (x == allX[countingInt] && y == allY[countingInt]) {
            tmp_bool = true
            for (let index4 = 0; index4 <= hitX.length - 1; index4++) {
                if (hitX[index4] == x && hitY[index4] == y) {
                    tmp_bool = false
                }
            }
            if (tmp_bool) {
                hitX.push(x)
                hitY.push(y)
                has_hit = true
            }
            if (allX.length == hitX.length) {
                is_dead = true
            }
            break;
        }
        countingInt += 1
    }
    countingInt = 0
}
function showCursor () {
    isCursorActive = true
    led.plot(cursorPosX, cursorPosY)
}
let prev_awaiting = false
let tmp_bool = false
let countingInt = 0
let checkFire = 0
let y = 0
let x = 0
let amountGenerated = 0
let xOrY = false
let posX = 0
let posY = 0
let generated = false
let newPointY = 0
let newPoint = 0
let colided = false
let done = false
let changedDirection = false
let changePos = 0
let is_dead = false
let isCursorActive = false
let tempNewValue = ""
let fireResult = ""
let targetPos = ""
let tmp_str = ""
let received_serial_num = 0
let currentlyShooting = false
let awaiting = false
let hitY: number[] = []
let hitX: number[] = []
let event_channel = 0
let message = ""
let player_count = 0
let targetedPlayer = 0
let isThisTurn = false
let allY: number[] = []
let allX: number[] = []
let has_hit = false
let is_playing = false
let can_handle = false
let led_value = 0
let temp_has_hit = ""
let tempValueY = ""
let tempValueX = ""
let received = ""
let playersHitBoard: number[][] = []
let player_statuses: number[] = []
let player_latest_pings: number[] = []
let player_serial_nums: number[] = []
let response = ""
let timed_out = false
let alreadyHit = false
let accY = 0
let accX = 0
let playerGrid: number[][] = []
let cursorPosY = 0
let cursorPosX = 0
let this_id = 0
let wait_until = 0
let timesHit = 0
wait_until = -1
this_id = -1
cursorPosX = 2
cursorPosY = 2
playerGrid = [
[
0,
0,
0,
0,
0
],
[
0,
0,
0,
0,
0
],
[
0,
0,
0,
0,
0
],
[
0,
0,
0,
0,
0
],
[
0,
0,
0,
0,
0
]
]
radio.setGroup(286)
radio.setTransmitSerialNumber(true)
loops.everyInterval(1000, function () {
    if (awaiting) {
        prev_awaiting = true
        radio.sendString(message)
        if (wait_until != -1 && control.millis() > wait_until) {
            wait_until = -1
            timed_out = true
            awaiting = false
        }
    } else if (prev_awaiting) {
        prev_awaiting = false
        control.raiseEvent(
        1024,
        event_channel
        )
    }
})
loops.everyInterval(1000, function () {
    player_count = 0
    for (let index = 0; index <= player_serial_nums.length - 1; index++) {
        if (index != this_id) {
            if (control.millis() > player_latest_pings[index] + 10000) {
                player_statuses[index] = 0
            } else {
                player_count += 1
            }
        }
    }
    if (this_id != -1) {
        player_count += 1
        radio.sendString("" + (pack_msg(0, control.millis(), 11, String.fromCharCode(this_id))))
    }
})
loops.everyInterval(500, function () {
    if (is_playing && !(isThisTurn)) {
        showShips()
    } else if (isCursorActive) {
        updateCursor()
    }
})
