function GridController(gridService) {
  var brushElem = document.getElementById('brush')
  var colorPicker = document.getElementById('color-picker')
  var gridElem = document.getElementById('grid')
  var frameElemNum = document.getElementById('frame-i')

  function drawGrid() {
    var grid = gridService.getGrid()
    var currentFrame = gridService.getCurrentFrameI()
    frameElemNum.innerText = "Frame " + (currentFrame + 1)
    gridElem.style.width = grid.settings.width * grid.settings.tileResolution.x + 'px'
    gridElem.style.height = grid.settings.height * grid.settings.tileResolution.y + 'px'
    var template = ''
    gridElem.innerHTML = ''

    for (var row = 0; row < grid.settings.height; row++) {
      for (var col = 0; col < grid.settings.width; col++) {
        var tile = grid.map[row][col];
        tile ?
          template += `<div id="${row}-${col}" class="cell empty" 
			style="background-color: ${tile};
			height: ${grid.settings.tileResolution.y}px; 
			width: ${grid.settings.tileResolution.x}px"></div>`
          :
          template += `<div id="${row}-${col}" class="cell empty" 
			style="height: ${grid.settings.tileResolution.y}px; 
			width: ${grid.settings.tileResolution.x}px"></div>`
      }
    }
    gridElem.innerHTML = template
  }

  colorPicker.addEventListener('change', updateBrush)

  function updateBrush(e){
    var color = e.target.value
    var grid = gridService.getGrid()
    console.log('CHANGING BRUSH', color)
    gridService.setColor(color)
    brushElem.style.backgroundColor = color
    brushElem.style.height = grid.settings.tileResolution.y + 'px'
    brushElem.style.width = grid.settings.tileResolution.x + 'px'
  }

  gridElem.addEventListener('mousemove', moveBrush)
  gridElem.addEventListener('mousedown', draw)
  gridElem.addEventListener('mouseup', removeDraw)

  function draw(e) {
    var grid = gridService.getGrid()
    var activeTile = gridService.getColor()
    gridElem.addEventListener('mousemove', draw)
    var cell = e.target
    var id = cell.id.split('-')
    if (e.shiftKey) {
      grid.map[id[0]][id[1]] = '#000000'
    }
    else if (activeTile) {
      grid.map[id[0]][id[1]] = activeTile
    }
    gridService.setGrid(grid)
    drawGrid(grid)
  }

  function removeDraw() {
    gridElem.removeEventListener('mousemove', draw)
    gridElem.addEventListener('mousemove', moveBrush)
  }

  function moveBrush(e) {
    var grid = gridService.getGrid()
    brushElem.style.left = (e.clientX - (grid.settings.tileResolution.x / 2)) + 'px'
    brushElem.style.top = (e.clientY - (grid.settings.tileResolution.y / 2)) + 'px'
  }

  this.updateGrid = function updateGrid(e) {
    e.preventDefault();
    var grid = gridService.getGrid()
    var form = e.target
    var color = form['tile-color'].value
    grid.settings.height = form['grid-height'].value || grid.settings.height
    grid.settings.width = form['grid-width'].value || grid.settings.width
    grid.settings.tileResolution.x = form['tile-height'].value || grid.settings.tileResolution.x
    grid.settings.tileResolution.y = form['tile-width'].value || grid.settings.tileResolution.y
    
    brushElem.style.height = (grid.settings.tileResolution.y || brushElem.style.height) + 'px'
    brushElem.style.width = (grid.settings.tileResolution.x || brushElem.style.width) + 'px'

    var newMap = gridService.resetMap()

    grid.map = newMap
    gridService.setGrid(grid)
    gridService.setColor(color)
    drawGrid(grid)
  }

  this.saveFrame = function(){
    gridService.saveFrame()
    drawGrid()
  }

  this.sendFrames = function(e){
    e.preventDefault()
    gridService.sendFrames()
  }

  this.changeFrame = (i) => {
    gridService.changeFrame(i)
    drawGrid()
  }

  this.clearGrid = () => {
    gridService.clearGrid()
    drawGrid()
  }

  this.deleteFrame = () => {
    gridService.deleteFrame()
    drawGrid()
  }

  this.newFrame = () => {
    gridService.saveFrame()
    gridService.newFrame()
    drawGrid()
  }


  drawGrid()
}