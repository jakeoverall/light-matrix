function GridService() {

  let frames = []
  let currentI = 0
  let animation = ''
  var defaultGrid = {
    settings: {
      width: 16,
      height: 16,
      tileResolution: {
        x: 32,
        y: 32
      }
    },
    map: [
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    ]
  }

  var activeColor = '#ffffff'

  this.sendFrames = () => {
    var anim = {
      name: animation,
      frames: frames
    }
    $.post('/api/animations', anim)
  }

  this.setGrid = (grid) => {
    activeGrid = grid
  }

  this.getGrid = () => {
    return activeGrid
  }

  this.setColor = (color) => {
    activeColor = color
  }

  this.getColor = () => {
    return activeColor
  }

  this.saveFrame = function () {
    var grid = JSON.parse(JSON.stringify(activeGrid))
    frames[currentI] = activeGrid
    saveFrames()
    console.log('saving frame', frames)
  }

  function saveFrames() {
    animation = animation || prompt('Name Animation')
    localStorage.setItem(animation, JSON.stringify(frames))
  }

  this.resetMap = (map) => {
    var newMap = [...Array(Number(activeGrid.settings.height))]
    newMap = newMap.map(x => x = [...Array(Number(activeGrid.settings.width))].map(c => c = 0))
    var i = 0;
    while (i < activeGrid.map.length) {
      if (activeGrid.map[i] && newMap[i]) {
        for (var j = 0; j < activeGrid.map[i].length; j++) {
          if (newMap[i][j] != undefined) {
            newMap[i][j] = activeGrid.map[i][j]
          }
        }
      }
      i++
    }
    return newMap
  }

  this.clearMap = () => {
    for (var i = 0; i < activeGrid.map; i++) {
      for (var j = 0; j < activeGrid.map[i].length; j++) {
        var cell = activeGrid.map[i][j];
        cell = 0
      }
    }
  }

  function loadFrames() {
    animation = prompt('Load an Animation')
    frames = JSON.parse(localStorage.getItem(animation) || '[]')
    activeGrid = frames[currentI] || defaultGrid
  }

  this.changeFrame = (i) => {
    currentI += i
    if (currentI > -1 && currentI < frames.length) {
      activeGrid = frames[currentI]
    } else {
      currentI -= i
    }
  }

  this.deleteFrame = function () {
    frames.splice(currentI, 1)
    activeGrid = frames[currentI] || defaultGrid
    this.saveFrame()
  }

  this.newFrame = () => {
    if(frames[currentI]){
      currentI++
    }
    activeGrid = JSON.parse(JSON.stringify(activeGrid))
  }

  this.getCurrentFrameI = () => {
    return currentI
  }

  loadFrames()
}