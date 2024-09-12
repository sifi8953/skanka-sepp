function connect () {
    radio.setGroup(101)
}
input.onGesture(Gesture.Shake, function () {
	
})

basic.forever(function () {

})


let hideCursor = false
let cursorY = 2
let cursorX = 2

let myId = "A"
let opponent = "B"

let myGrid: number[][] = [
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
]

radio.setGroup(101)

led.plot(cursorX, cursorY)

loops.everyInterval(250, function () {
    if (!(hideCursor)) {
        // Only update cursor if a shot hasn't been fired
        // Get accelerometer values for X and Y
        let accX = input.acceleration(Dimension.X)
        let accY = input.acceleration(Dimension.Y)
        // Unplot current cursor position
        led.unplot(cursorX, cursorY)
        // Move left or right based on X acceleration
        if (accX < -500) {
            cursorX = (cursorX - 1 + 5) % 5
        } else if (accX > 500) {
            cursorX = (cursorX + 1) % 5
        }
        // Move up or down based on Y acceleration
        if (accY < -500) {
            cursorY = (cursorY - 1 + 5) % 5
        } else if (accY > 500) {
            cursorY = (cursorY + 1) % 5
        }
        // Plot new cursor position
        led.plot(cursorX, cursorY)
    }
})


// Check for incoming fire from other players
radio.onReceivedString(function (receivedMessage: string) {
    let parsedMessage
    try {
        parsedMessage = JSON.parse(receivedMessage)
    } catch (error) {
        // Handle invalid message here
        return // Exit if parsing fails
    }

    let target = parsedMessage.target
    let x = parseInt(parsedMessage.x)
    let y = parseInt(parsedMessage.y)

    // If player receives a string that matches their id, it will send "hit" or "miss"
    if (target == myId) {
        if (myGrid[y][x] == 1) {
            radio.sendString("hit")
        } else {
            radio.sendString("miss")
        }
    }
})




// Function for firing
function fire(target: string, x: number, y: number) {
    // Create a structured string using JSON-like formatting
    let message = `{"target": "${target}", "x": ${x}, "y": ${y}}`
    radio.sendString(message)
}

// Register radio listener globally, once
radio.onReceivedString(function (receivedMessage: string) {
    if (receivedMessage == "hit") {
        basic.showIcon(IconNames.Happy)
    } else if (receivedMessage == "miss") {
        basic.showIcon(IconNames.Sad)
    }
    basic.pause(500)
    basic.clearScreen()
    hideCursor = false // Allow cursor movement again after showing hit/miss result
})

// Function for firing
input.onButtonPressed(Button.AB, function () {
    // Hide cursor after firing
    led.unplot(cursorX, cursorY)
    hideCursor = true
    // Fire shot
    fire(opponent, cursorX, cursorY)
})
