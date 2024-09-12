function connect () {
    radio.setGroup(101)
    player_count = 0
    connection_state = "searching"
    basic.showLeds(`
        . . . . .
        . . . . .
        # . # . #
        . . . . .
        . . . . .
        `)
    t0 = control.millis()
    while (connection_state == "searching") {
        if (control.millis() - t0 < 5000) {
            radio.sendString("join request")
            basic.pause(100)
        } else {
            this_id = 0
            player_count = 1
            connection_state = "connected"
            break;
        }
    }
}
radio.onReceivedString(function (receivedString) {
    if (connection_state == "connected") {
        if (receivedString == "join request") {
            radio.sendValue("join answer", player_count)
        }
    }
})
radio.onReceivedValue(function (name, value) {
    if (connection_state == "searching") {
        if (name == "join anwer") {
            this_id = value
            player_count = value + 1
            connection_state = "connected"
            radio.sendValue("joining as", this_id)
        }
    } else if (connection_state == "connected") {
        if (name == "joinging as") {
            player_count = value + 1
            radio.sendValue("joining as", this_id)
        }
    }
})
let this_id = 0
let t0 = 0
let connection_state = ""
let player_count = 0
connect()
