var app = {
  controllers: {
    gridCtrl: (function () { return new GridController(new GridService) }())
  }
}