let awaiting = false
let event_channel = 0

let message = ""
let received = ""
let response = ""

let handled_ids: number[][] = []

radio.setGroup(101)
radio.setTransmitSerialNumber(true)

control.inBackground(function () {
    while (true) {
        control.waitForEvent(1024, 1)
        awaiting = true
        while (awaiting) {
            radio.sendString(message)
            basic.pause(500)
        }
        control.raiseEvent(1024, event_channel)
    }
})

control.onEvent(1024, 102, function () {
    basic.showString(received)
})

control.onEvent(1024, 203, function () {
    basic.showString(received)
})

// Event handler for receiving fire
control.onEvent(1024, 299, function () {
    basic.showString(received)
})

input.onButtonPressed(Button.A, function () {
    basic.showString("" + (send_req(0, 203, "hej")))
})

input.onButtonPressed(Button.B, function () {
    send_msg(0, 102, "123")
})

radio.onReceivedString(function (receivedString) {
    if (extract_to(receivedString) == 0 || extract_to(receivedString) == control.deviceSerialNumber()) {
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
                if (handled_ids.indexOf([radio.receivedPacket(RadioPacketProperty.SerialNumber), extract_id(receivedString)]) == -1) {
                    handled_ids.push([radio.receivedPacket(RadioPacketProperty.SerialNumber), extract_id(receivedString)])
                    received = extract_msg(receivedString)
                    control.raiseEvent(
                        1024,
                        extract_type(receivedString)
                    )
                }
                send_fin(radio.receivedPacket(RadioPacketProperty.SerialNumber), extract_id(receivedString))
            }
        } else if (200 <= extract_type(receivedString) && extract_type(receivedString) < 300) {
            if (!awaiting) {
                if (handled_ids.indexOf([radio.receivedPacket(RadioPacketProperty.SerialNumber), extract_id(receivedString)]) == -1) {
                    handled_ids.push([radio.receivedPacket(RadioPacketProperty.SerialNumber), extract_id(receivedString)])
                    received = extract_msg(receivedString)
                    send_res(radio.receivedPacket(RadioPacketProperty.SerialNumber), extract_id(receivedString), req_handler(radio.receivedPacket(RadioPacketProperty.SerialNumber), extract_id(receivedString), extract_type(receivedString), extract_msg(receivedString)), extract_type(receivedString))
                }
            }
        }
    }
})

function req_handler(_from: number, id: number, _type: number, msg: string) {
    if (_type == 203) {
        return "abcd"
    } else if (_type == 299) {
        return getFireResult(received)
    } else {
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

function send_res(to: number, id: number, msg: string, event: number) {
    message = pack_msg(to, id, 2, msg)
    event_channel = event
    control.raiseEvent(1024, 1)
}

function send_msg(to: number, _type: number, msg: string) {
    message = pack_msg(to, control.millis(), _type, msg)
    event_channel = 2
    control.raiseEvent(1024, 1)
    control.waitForEvent(1024, 2)
}

function send_fin(to: number, id: number) {
    radio.sendString("" + (pack_msg(to, id, 1, "")))
}

function pack_msg(to: number, id: number, _type: number, msg: string) {
    return "" + long_to_str(to) + long_to_str(id) + String.fromCharCode(_type) + msg
}

function extract_msg(msg: string) {
    return msg.substr(5, msg.length - 5)
}

function extract_type(msg: string) {
    return msg.charCodeAt(4)
}

function extract_to(msg: string) {
    return str_to_long(msg.substr(0, 2))
}

function extract_id(msg: string) {
    return str_to_long(msg.substr(2, 2))
}

function long_to_str(num: number) {
    return "" + String.fromCharCode(num % 2 ** 16) + String.fromCharCode(Math.trunc(num / 2 ** 16))
}

function str_to_long(str: string) {
    return str.charCodeAt(0) + str.charCodeAt(1) * 2 ** 16
}


// Variables for cursor state and position
let isCursorActive = false
let cursorPosX = 2
let cursorPosY = 2

// Player grid representing a 5x5 board where each cell can be 0 (empty) or 1 (occupied)
let playerGrid: number[][] = [
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0]
]

// Enemy ID for targeting in the game
let enemyId: number = 0

showCursor()

// Function to show the cursor
function showCursor() {
    isCursorActive = true
    led.plot(cursorPosX, cursorPosY)

    while (isCursorActive) {
        updateCursor()
        if (input.buttonIsPressed(Button.AB)) {
            hideCursor()
            fireAtTarget()
        }
        basic.pause(200)
    }
}

// Function to hide the cursor
function hideCursor() {
    isCursorActive = false
    led.unplot(cursorPosX, cursorPosY)
}

// Function to update the cursor position based on accelerometer data
function updateCursor() {
    let accX = input.acceleration(Dimension.X)
    let accY = input.acceleration(Dimension.Y)
    led.unplot(cursorPosX, cursorPosY)

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

    led.plot(cursorPosX, cursorPosY)
}

// Function to fire at the target based on the current cursor position
function fireAtTarget() {
    const targetPos = "" + cursorPosX + cursorPosY
    const fireResult = send_req(enemyId, 299, targetPos)
    displayFireResult(fireResult)
}

// Function to display the result of the fire action (hit or miss)
function displayFireResult(receivedString: string) {
    if (receivedString == "hit") {
        basic.showIcon(IconNames.Happy)
    } else if (receivedString == "miss") {
        basic.showIcon(IconNames.Sad)
    }
}

// Function to determine the result when the player receives an attack
function getFireResult(receivedString: string) {
    const x = parseInt(receivedString.charAt(0))
    const y = parseInt(receivedString.charAt(1))
    const checkFire = playerGrid[y][x]
    if (checkFire) {
        return "hit"
    } else {
        return "miss"
    }
}

// Function to display the current state of the grid on the LED
function displayGrid(grid: number[][]) {
    for (let x = 0; x <= 4; x++) {
        for (let y = 0; y <= 4; y++) {
            if (grid[y][x] == 1) {
                led.plot(x, y)
            } else {
                led.unplot(x, y)
            }
        }
    }
}
