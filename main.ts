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
    for (let index = 0; index < 50; index++) {
        if (connection_state == "searching") {
            radio.sendString("join request")
            basic.pause(100)
        } else {
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
            radio.sendValue("joining as", this_id)
        }
    }
})
let this_id = 0
let connection_state = ""
let player_count = 0
connect()
