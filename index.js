let express = require('express')
    , SerialPort = require('serialport')
    , bp = require('body-parser')
    , cors = require('cors')
    , app = express()
    , animations = {}
    , port = 3000;



app.use(cors())
app.use(express.static(__dirname + '/public'))
app.use(bp.json())
app.use(bp.urlencoded({ extended: true }))

app.post('/api/animations', (req, res, next) => {
    let anim = req.body
    animations[anim.name] = anim
    res.send('Successfully added Animation')
})

app.get('/api/animations/:animName', (req, res, next) => {
    let anim = animations[req.params.animName]
    console.log(animations)
    res.send(anim || "Invalid Animation")

    if (anim) {
        anim.frameRate = req.query.framerate || anim.frameRate || 300
        anim.cycles = req.query.cycles || anim.cycles || 1
        playAnimation(anim)
    }

})

let _port = new SerialPort('COM3', {
    baudRate: 115200,
    parser: SerialPort.parsers.readline('\n')
})

_port.on('open', startApp)
_port.on('data', function (d) {
    console.log("RECIEVED FROM BOARD", d)
})

function playAnimation(anim, cycle) {
    if (_port.isOpen) {
        console.log("playing ", anim.name)
        playAnimationCycle(anim).then(() => {
            cycle = cycle + 1 || 1
            if (cycle < anim.cycles) {
                playAnimation(anim, cycle)
            } else {
                console.log("Animation Finished", anim.name)
            }
        })
    }
}

function playAnimationCycle(anim) {
    return Promise.all(anim.frames.map(frame => {
        return printFrame(frame, anim.frameRate)
    }))
}

function printFrame(frame, frameRate) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            let buffer = frameToBuffer(frame)
            _port.write(buffer, log)
            resolve()
        }, frameRate)
    })

}

function frameToBuffer(frame) {
    var m = []
    for (var j = 0; j < frame.map.length; j++) {
        var pixels = frame.map[j];
        pixels.forEach(function (color) {
            if (color.length != 7) { color = "#000000" }
            color = color.slice(1, color.length)
            console.log("color", color)
            let r = parseInt(color[0] + color[1], 16) || 0
            let g = parseInt(color[2] + color[3], 16) || 0
            let b = parseInt(color[4] + color[5], 16) || 0
            m.push(r, g, b)
        });
    }
    return Buffer.from(m)
}

function log(err, val) {
    if (err) console.log("Error Writting to board: ", err)
    if (val) console.log("Bytes Written:", val)
}

function startApp() {
    console.log("Serial Port Open:", _port.isOpen())
    _port.drain(() => {
        console.log('ready to recieve')
    })
}

app.listen(port, () => {
    console.log("ready for animations on port: ", port)
})