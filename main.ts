let awaiting = false
let can_handle = false
let is_playing = false
let timed_out = false
let isCursorActive = false
let currentlyShooting = false
let alreadyHit = false

let message = ""
let received = ""
let response = ""

let received_serial_num = 0
let event_channel = 0
let wait_until = -1
let this_id = -1
let player_count = 0
let targetedPlayer = 0
let cursorPosX = 2
let cursorPosY = 2

let playersHitBoard: number[][] = []
let player_statuses: number[] = []
let player_latest_pings: number[] = []
let player_serial_nums: number[] = []
let playerGrid: number[][] = [
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0]
]

radio.setGroup(101)
radio.setTransmitSerialNumber(true)

control.inBackground(function () {
    while (true) {
        control.waitForEvent(1024, 1)
        awaiting = true
        while (awaiting) {
            radio.sendString(message)
            basic.pause(500)
            if (wait_until != -1 && control.millis() > wait_until) {
                wait_until = -1
                timed_out = true
                awaiting = false
            }
        }
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

radio.onReceivedString(function (receivedString) {
    if (extract_to(receivedString) == 0 || extract_to(receivedString) == control.deviceSerialNumber()) {
        let handled_msgs: number[][] = []
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
            if (!awaiting) {
                if (handled_msgs.indexOf([radio.receivedPacket(RadioPacketProperty.SerialNumber), extract_id(receivedString)]) == -1) {
                    handled_msgs.push([radio.receivedPacket(RadioPacketProperty.SerialNumber), extract_id(receivedString)])
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
            if (!awaiting) {
                if (handled_msgs.indexOf([radio.receivedPacket(RadioPacketProperty.SerialNumber), extract_id(receivedString)]) == -1) {
                    handled_msgs.push([radio.receivedPacket(RadioPacketProperty.SerialNumber), extract_id(receivedString)])
                    received = extract_msg(receivedString)
                    received_serial_num = radio.receivedPacket(RadioPacketProperty.SerialNumber)
                    let tmp_str = req_handler(radio.receivedPacket(RadioPacketProperty.SerialNumber), extract_id(receivedString), extract_type(receivedString), extract_msg(receivedString))
                    if (can_handle) {
                        send_res(radio.receivedPacket(RadioPacketProperty.SerialNumber), extract_id(receivedString), tmp_str, extract_type(receivedString))
                    }
                }
            }
        } else {
            if (handled_msgs.indexOf([radio.receivedPacket(RadioPacketProperty.SerialNumber), extract_id(receivedString)]) == -1) {
                handled_msgs.push([radio.receivedPacket(RadioPacketProperty.SerialNumber), extract_id(receivedString)])
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

function req_handler(_from: number, id: number, _type: number, msg: string) {
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
    } else if (_type == 299) {
        return getFireResult(received)
    } else {
        can_handle = false
        return ""
    }
}

function send_req(to: number, _type: number, msg: string) {
    message = pack_msg(to, control.millis(), _type, msg)
    event_channel = 2
    control.raiseEvent(1024, 1)
    control.waitForEvent(1024, 2)
    return response
}

function send_msg(to: number, _type: number, msg: string) {
    message = pack_msg(to, control.millis(), _type, msg)
    event_channel = 2
    control.raiseEvent(
        1024,
        1
    )
    control.waitForEvent(1024, 2)
}

function send_res(to: number, id: number, msg: string, event: number) {
    message = pack_msg(to, id, 2, msg)
    event_channel = event
    control.raiseEvent(1024, 1)
}

function send_fin(to: number, id: number) {
    radio.sendString("" + (pack_msg(to, id, 1, "")))
}

function displayFireResult(receivedString: string) {
    if (receivedString == "hit") {
        basic.showIcon(IconNames.Happy)
    } else if (receivedString == "miss") {
        basic.showIcon(IconNames.Sad)
    }
}

function long_to_str(num: number) {
    return "" + String.fromCharCode(num % 2 ** 16) + String.fromCharCode(Math.trunc(num / 2 ** 16))
}

function str_to_long(str: string) {
    return str.charCodeAt(0) + str.charCodeAt(1) * 2 ** 16
}

function pack_msg(to: number, id: number, _type: number, msg: string) {
    return "" + long_to_str(to) + long_to_str(id) + String.fromCharCode(_type) + msg
}

function extract_to(msg: string) {
    return str_to_long(msg.substr(0, 2))
}

function extract_id(msg: string) {
    return str_to_long(msg.substr(2, 2))
}

function extract_type(msg: string) {
    return msg.charCodeAt(4)
}

function extract_msg(msg: string) {
    return msg.substr(5, msg.length - 5)
}

function set_timeout(time: number) {
    timed_out = false
    wait_until = control.millis() + time
}

function connect() {
    set_timeout(3000)
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

control.onEvent(1024, 299, function () {
    basic.showString(received)
})

input.onGesture(Gesture.Shake, function () {
    if (!is_playing) {
        connect()
        if (this_id != -1) {
            basic.showNumber(this_id)
        } else {
            basic.showIcon(IconNames.No)
        }
    }
})

input.onButtonPressed(Button.A, function () {
    if (!is_playing) {
        if (this_id != -1) {
            basic.showNumber(this_id)
        } else {
            basic.showIcon(IconNames.No)
        }
    } else {
        basic.clearScreen()
        targetedPlayer -= 1
        if (targetedPlayer < 0) {
            targetedPlayer = player_count - 1
        }
        if (targetedPlayer == this_id) {
            targetedPlayer -= 1
        }
        // Check if playersHitBoard[targetedPlayer] is init
        if (playersHitBoard[targetedPlayer] && playersHitBoard[targetedPlayer].length > 0) {
            showBoard(targetedPlayer)
        } else {
            basic.showString("No data")
        }
    }
})


input.onButtonPressed(Button.B, function () {
    if (!is_playing) {
        basic.showNumber(player_count)
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

input.onButtonPressed(Button.AB, function () {
    if (!is_playing) {
        if (this_id != -1) {
            is_playing = true
            basic.showIcon(IconNames.Yes)
        }
    } else {
        if (currentlyShooting) {
            hideCursor()
            basic.clearScreen()
            fireAtTarget(targetedPlayer)
        } else {
            alreadyHit = led.point(cursorPosX, cursorPosY)
            if (targetedPlayer != this_id) {
                showCursor()
                currentlyShooting = true
            }
        }
    }
})

function showBoard(target: number) {
    // Check playersHitBoard[targetedPlayer] is init before push
    if (!playersHitBoard[target] || playersHitBoard[target].length === 0) {
        basic.showString("No Hits")
        return;
    }

    for (let value of playersHitBoard[target]) {
        let tempValueX = convertToText(value).substr(2, 1)
        let tempValueY = convertToText(value).substr(3, 1)
        led.plot(parseInt(tempValueX), parseInt(tempValueY))
    }
}

loops.everyInterval(300, function () {
    if (isCursorActive) {
        updateCursor()
    }
})

function updateCursor() {
    let accX = input.acceleration(Dimension.X)
    let accY = input.acceleration(Dimension.Y)
    if (!alreadyHit) {
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
    led.plot(cursorPosX, cursorPosY)
}

function showCursor() {
    isCursorActive = true
    led.plot(cursorPosX, cursorPosY)
}

function hideCursor() {
    isCursorActive = false
    led.unplot(cursorPosX, cursorPosY)
}

function fireAtTarget(targetedPlayer: number) {
    let targetPos = "" + cursorPosX + cursorPosY
    let fireResult = send_req(player_serial_nums[targetedPlayer], 299, targetPos)
    displayFireResult(fireResult)

    let tempNewValue = "" + (targetedPlayer + 1) + "0" + cursorPosX + cursorPosY

    // Check playersHitBoard[targetedPlayer] is init before push
    if (!playersHitBoard[targetedPlayer]) {
        playersHitBoard[targetedPlayer] = []
    }

    playersHitBoard[targetedPlayer].push(parseInt(tempNewValue))

    currentlyShooting = false
    cursorPosX = 2
    cursorPosY = 2
    basic.pause(100)
    basic.clearScreen()
    // Remove this later when implementing turn mode
    showBoard(targetedPlayer)
}

function getFireResult(receivedString: string) {
    let x = parseInt(receivedString.charAt(0))
    let y = parseInt(receivedString.charAt(1))
    let checkFire = playerGrid[y][x]
    if (checkFire) {
        return "hit"
    } else {
        return "miss"
    }
}

function displayGrid(grid: number[][]) {
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

