let express = require('express')
    , SerialPort = require('serialport')
    , bp = require('body-parser')
    , cors = require('cors')
    , app = express()
    , animations = {}
    , port = 3000;


let _port = new SerialPort('COM3', {
    baudRate: 115200
})

_port.on('open', startApp)

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
        playAnimation(anim)
    }

})

function playAnimation(anim) {
    if (_port.isOpen) {
        console.log("playing ", anim.name)
        for (var i = 0; i < anim.frames.length; i++) {
            var frame = anim.frames[i];
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
                    // _port.write(r, log)
                    // log(null, r)
                    // _port.write(g, log)
                    // log(null, g)
                    // _port.write(b, log)
                    // log(null, b)
                });
                // _port.write(Buffer.from(m), log)
            }
            let buffer = Buffer.from(m)
            // console.log("Buffer Length:", m)
            m.forEach(val => {
                console.log(val)
                _port.write(val)
            })
        }
    }
}
function log(err, val) {
    console.log("LOG:", val)
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