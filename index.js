let express = require('express')
    , SerialPort = require('serialport')
    , bp = require('body-parser')
    , cors = require('cors')
    , app = express()
    , animations = {}
    , port = 3000;


let _port = new SerialPort('COM5', {
    baudRate: 115200
})

_port.on('open', startApp)

app.use(cors())
app.use(express.static(__dirname+'/public'))
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

    if(anim){
        playAnimation(anim)
    }

})

function playAnimation(anim){
    if(_port.isOpen){
        console.log("playing ", anim.name)
        for (var i = 0; i < anim.frames.length; i++) {
            var frame = anim.frames[i];
            for (var j = 0; j < frame.map.length; j++) {
                var pixels = frame.map[j];
                pixels.forEach(function(color) {
                    color = color.slice(1, color.length)
                    let r = parseInt(color[0]+color[1], 16)
                    let g = parseInt(color[2]+color[3], 16)
                    let b = parseInt(color[4]+color[5], 16)
                    _port.write(r)
                    _port.write(g)
                    _port.write(b)
                });
            }
        }
    }
}

function startApp() {
    console.log("Serial Port Open:", _port.isOpen())
}

app.listen(port, ()=>{
    console.log("ready for animations on port: ", port)
})