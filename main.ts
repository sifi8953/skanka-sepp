let opponentId = 0

let target = 0
let status = false

let cursorActive = false
let cursorY = 0
let cursorX = 0
let accY = 0
let accX = 0

let y = 0
let x = 0
let coord = ""

let myGrid: number[][] = []
myGrid = [
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0]
]


initComms()

function initComms () {
    radio.setGroup(101)
    radio.setTransmitSerialNumber(true)
}


initCursor()

function initCursor () {
    cursorX = 2
    cursorY = 2
    showCursor()
    while (cursorActive) {
        updateCursor()
        if (input.buttonIsPressed(Button.AB)) {
            hideCursor()
        }
        basic.pause(200)
    }
}

function updateCursor () {
    accX = input.acceleration(Dimension.X)
    accY = input.acceleration(Dimension.Y)
    led.unplot(cursorX, cursorY)
    if (accX < -500) {
        cursorX = (cursorX - 1 + 5) % 5
    } else if (accX > 500) {
        cursorX = (cursorX + 1) % 5
    }
    if (accY < -500) {
        cursorY = (cursorY - 1 + 5) % 5
    } else if (accY > 500) {
        cursorY = (cursorY + 1) % 5
    }
    led.plot(cursorX, cursorY)
}

function hideCursor () {
    cursorActive = false
    led.unplot(cursorX, cursorY)
}

function showCursor () {
    cursorActive = true
    led.plot(cursorX, cursorY)
}


// Fire to send x and y coordinates to opponent
function fire () {
    coord = "" + cursorX + cursorY
    // Add code for sending fire coordinates to opponent
}

// Respond to opponent if incoming fire hit or miss
function sendHitStatus (receivedString: string) {
    opponentId = 0  // Temporary
    x = parseFloat(receivedString.charAt(0))
    y = parseFloat(receivedString.charAt(1))
    status = isHit(x, y)
    // Add code for responding fire status to oppontent
}

// Check if opponent fire hit or missed
function isHit (x: number, y: number) {
    target = myGrid[y][x]
    if (target == 1) {
        return true
    } else {
        return false
    }
}

// Show if player fire is a hit or miss
function fireFeedback (receivedString: string) {
    if (receivedString == "hit") {
        basic.showIcon(IconNames.Happy)
    } else {
        basic.showIcon(IconNames.Sad)
    }
}
