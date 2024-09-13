function long_to_str (num: number) {
    return "" + String.fromCharCode(num % 2 ** 16) + String.fromCharCode(Math.trunc(num / 2 ** 16))
}
function send_req_res (to: number, id: number, msg: string) {
    message = pack_msg(to, id, 2, msg)
    awaiting = true
    control.waitForEvent(EventBusSource.MICROBIT_ID_RADIO, 1)
}
function extract_to (msg: string) {
    return str_to_long(msg.substr(0, 2))
}
function pack_msg (to: number, id: number, _type: number, msg: string) {
    return "" + long_to_str(to) + long_to_str(id) + String.fromCharCode(_type) + msg
}
function extract_type (msg: string) {
    return msg.charCodeAt(4)
}
function extract_msg (msg: string) {
    return msg.substr(5, msg.length - 5)
}
input.onButtonPressed(Button.A, function () {
    basic.showString("" + (send_req(0, 99, "hej")))
})
function str_to_long (str: string) {
    return str.charCodeAt(0) + str.charCodeAt(1) * 2 ** 16
}
function send_res (to: number, id: number) {
    radio.sendString("" + (pack_msg(to, id, 1, "")))
}
function extract_id (msg: string) {
    return str_to_long(msg.substr(2, 2))
}
radio.onReceivedString(function (receivedString) {
    serial.writeLine("" + (extract_type(receivedString)))
    if (extract_to(receivedString) == 0 || extract_to(receivedString) == control.deviceSerialNumber()) {
        if (extract_type(receivedString) == 1) {
            if (awaiting && extract_id(receivedString) == extract_id(message)) {
                fin_res()
            }
        } else if (extract_type(receivedString) == 2) {
            if (awaiting && extract_id(receivedString) == extract_id(message)) {
                response = extract_msg(receivedString)
                fin_res()
            }
            send_res(radio.receivedPacket(RadioPacketProperty.SerialNumber), extract_id(receivedString))
        } else if (extract_type(receivedString) == 99) {
            basic.showString("" + (extract_msg(receivedString)))
            send_req_res(radio.receivedPacket(RadioPacketProperty.SerialNumber), extract_id(receivedString), "abc")
        }
    }
})
function send_req (to: number, _type: number, msg: string) {
    message = pack_msg(to, control.millis(), _type, msg)
    awaiting = true
    control.waitForEvent(EventBusSource.MICROBIT_ID_RADIO, 1)
    return response
}
function fin_res () {
    awaiting = false
    control.raiseEvent(
    EventBusSource.MICROBIT_ID_RADIO,
    1
    )
}
function send_msg (to: number, _type: number, msg: string) {
    message = pack_msg(to, control.millis(), _type, msg)
    awaiting = true
    control.waitForEvent(EventBusSource.MICROBIT_ID_RADIO, 1)
}
let response = ""
let awaiting = false
let message = ""
radio.setGroup(101)
radio.setTransmitSerialNumber(true)
loops.everyInterval(500, function () {
    if (awaiting) {
        radio.sendString(message)
    }
})
