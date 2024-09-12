function connect () {
    radio.setGroup(101)
    player_count = 0
    connection_state = "searching"
    basic.showLeds(`
        # # # . .
        . . . # .
        # # . . #
        . . # . #
        # . # . #
        `)
    t0 = control.millis()
    while (connection_state == "searching") {
        if (control.millis() - t0 < 1000) {
            radio.sendString("join_req")
            basic.pause(100)
        } else {
            this_id = 0
            player_count = 1
            connection_state = "connected"
        }
    }
    basic.showNumber(this_id)
}
input.onButtonPressed(Button.A, function () {
    if (connection_state == "connected") {
        basic.showNumber(this_id)
    }
})
input.onButtonPressed(Button.AB, function () {
    if (connection_state == "connected") {
        if (this_id == 0) {
            radio.sendString("start")
            connection_state = "playing"
            start()
        }
    }
})
radio.onReceivedString(function (receivedString) {
    if (receivedString == "join_req") {
        if (connection_state == "connected") {
            radio.sendValue("join_res", player_count)
        }
    } else if (receivedString == "start") {
        connection_state = "playing"
        start()
    }
})
input.onButtonPressed(Button.B, function () {
    if (connection_state == "connected") {
        basic.showNumber(player_count)
    }
})
input.onGesture(Gesture.Shake, function () {
    if (connection_state == "connected") {
        connect()
    }
})
radio.onReceivedValue(function (name, value) {
    if (name == "join_res") {
        if (connection_state == "searching") {
            this_id = value
            player_count = value + 1
            connection_state = "connected"
            radio.sendValue("join_as", this_id)
        }
    } else if (name == "join_as") {
        if (connection_state == "connected") {
            player_count = value + 1
        }
    }
})
function start () {
    basic.showLeds(`
        . . . . .
        . . . . .
        # . # . #
        . . . . .
        . . . . .
        `)
    basic.pause(100)
}
let this_id = 0
let t0 = 0
let connection_state = ""
let player_count = 0
connect()
