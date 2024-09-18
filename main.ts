/**
 * sifi8953
 */
/**
 * Fix for connect()
 */
/**
 * zayo7445
 */
/**
 * Variables for cursor state and position
 */
/**
 * Enemy ID for targeting in the game
 */
// Function to display the result of the fire action (hit or miss)
function displayFireResult (receivedString: string) {
    if (receivedString == "hit") {
        basic.showIcon(IconNames.Happy)
    } else if (receivedString == "miss") {
        basic.showIcon(IconNames.Sad)
    }
}
function long_to_str (num: number) {
    return "" + String.fromCharCode(num % 2 ** 16) + String.fromCharCode(Math.trunc(num / 2 ** 16))
}
// Function to update the cursor position based on accelerometer data
function updateCursor () {
    accX = input.acceleration(Dimension.X)
    accY = input.acceleration(Dimension.Y)
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
function connect () {
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
        }
        player_serial_nums[this_id] = control.deviceSerialNumber()
        player_statuses[received.charCodeAt(0)] = 2
    }
}
function extract_to (msg: string) {
    return str_to_long(msg.substr(0, 2))
}
function pack_msg (to: number, id: number, _type: number, msg: string) {
    return "" + long_to_str(to) + long_to_str(id) + String.fromCharCode(_type) + msg
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
    } else if (_type == 299) {
        return getFireResult(received)
    } else {
        can_handle = false
        return ""
    }
}
function extract_type (msg: string) {
    return msg.charCodeAt(4)
}
function extract_msg (msg: string) {
    return msg.substr(5, msg.length - 5)
}
control.onEvent(1024, 11, function () {
    while (player_serial_nums.length <= received.charCodeAt(0)) {
        player_serial_nums.push(-1)
        player_latest_pings.push(-1)
        player_statuses.push(-1)
    }
    player_serial_nums[received.charCodeAt(0)] = received_serial_num
    player_latest_pings[received.charCodeAt(0)] = control.millis()
    player_statuses[received.charCodeAt(0)] = 1
})
function send_fin (to: number, id: number) {
    radio.sendString("" + (pack_msg(to, id, 1, "")))
}
function str_to_long (str: string) {
    return str.charCodeAt(0) + str.charCodeAt(1) * 2 ** 16
}
input.onButtonPressed(Button.B, function () {
    if (!(is_playing)) {
        basic.showNumber(player_count)
    }
})
// Function to display the current state of the grid on the LED
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
input.onGesture(Gesture.Shake, function () {
    if (!(is_playing)) {
        // Fix for connect()
        connect()
        if (this_id != -1) {
            basic.showNumber(this_id)
        } else {
            basic.showIcon(IconNames.No)
        }
    }
})
function extract_id (msg: string) {
    return str_to_long(msg.substr(2, 2))
}
function set_timeout (time: number) {
    timed_out = false
    wait_until = control.millis() + time
}
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
            if (!(awaiting)) {
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
            if (!(awaiting)) {
                if (handled_msgs.indexOf([radio.receivedPacket(RadioPacketProperty.SerialNumber), extract_id(receivedString)]) == -1) {
                    handled_msgs.push([radio.receivedPacket(RadioPacketProperty.SerialNumber), extract_id(receivedString)])
                    received = extract_msg(receivedString)
                    received_serial_num = radio.receivedPacket(RadioPacketProperty.SerialNumber)
                    tmp_str = req_handler(radio.receivedPacket(RadioPacketProperty.SerialNumber), extract_id(receivedString), extract_type(receivedString), extract_msg(receivedString))
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
// Function to fire at the target based on the current cursor position
function fireAtTarget () {
    let enemyId = 0
    targetPos = "" + cursorPosX + cursorPosY
    fireResult = send_req(enemyId, 299, targetPos)
    displayFireResult(fireResult)
}
// Function to hide the cursor
function hideCursor () {
    isCursorActive = false
    led.unplot(cursorPosX, cursorPosY)
}
control.onEvent(1024, 299, function () {
    basic.showString(received)
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
input.onButtonPressed(Button.AB, function () {
    if (!(is_playing)) {
        if (this_id != -1) {
            is_playing = true
            basic.showIcon(IconNames.Yes)
            // Subject to change
            basic.clearScreen()
            showCursor()
        }
    }
})
input.onButtonPressed(Button.A, function () {
    if (!(is_playing)) {
        if (this_id != -1) {
            basic.showNumber(this_id)
        } else {
            basic.showIcon(IconNames.No)
        }
    }
})
// Function to determine the result when the player receives an attack
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
// Subject to change
// Function to show the cursor
function showCursor () {
    isCursorActive = true
    led.plot(cursorPosX, cursorPosY)
    while (isCursorActive) {
        updateCursor()
        if (input.buttonIsPressed(Button.AB)) {
            hideCursor()
            fireAtTarget()
        }
        basic.pause(300)
    }
}
let checkFire = 0
let y = 0
let x = 0
let isCursorActive = false
let fireResult = ""
let targetPos = ""
let tmp_str = ""
let awaiting = false
let event_channel = 0
let message = ""
let player_count = 0
let received_serial_num = 0
let is_playing = false
let can_handle = false
let received = ""
let player_statuses: number[] = []
let player_latest_pings: number[] = []
let player_serial_nums: number[] = []
let response = ""
let timed_out = false
let accY = 0
let accX = 0
let playerGrid: number[][] = []
let cursorPosY = 0
let cursorPosX = 0
let wait_until = 0
let this_id = 0
this_id = -1
wait_until = -1
radio.setGroup(101)
radio.setTransmitSerialNumber(true)
cursorPosX = 2
cursorPosY = 2
// Player grid representing a 5x5 board where each cell can be 0 (empty) or 1 (occupied)
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
