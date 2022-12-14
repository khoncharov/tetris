import {
  GAME_PAUSED,
  GAME_STARTED,
  KEY_MOVE_DOWN,
  KEY_MOVE_LEFT,
  KEY_MOVE_RIGHT,
  KEY_ROTATE,
} from './const.js'
import { GameModel } from './model/model.js'
import { GameView } from './view/view.js'

class GameController {
  constructor(gameModel, gameView) {
    this.game = gameModel
    this.view = gameView
    this.timer = null
    this.checkbox = document.querySelector('#cb-dark-mode')
  }

  init = () => {
    document.querySelector('#btn-start').addEventListener('click', this.startBtnHandler)
    document.querySelector('#btn-reset').addEventListener('click', this.resetBtnHandler)
    document.querySelector('#btn-result-ok').addEventListener('click', this.resultsOkBtnHandler)
    this.checkbox.addEventListener('click', this.themeHandler)
    document.addEventListener('keyup', this.rotationHandler)
    document.addEventListener('keypress', this.movementHandler)
    this.setTheme()
  }

  startBtnHandler = () => {
    if (this.game.state === GAME_STARTED) {
      this.removerTimer(this.timer)
      this.game.pause()
      this.view.startBtn.textContent = 'Resume'
      this.view.showPauseAnimation()
    } else if (this.game.state === GAME_PAUSED) {
      this.game.resume()
      this.timer = this.addTimer()
      this.view.startBtn.textContent = 'Pause'
      this.view.showPauseAnimation()
    } else {
      this.game.start()
      this.timer = this.addTimer()
      this.view.startBtn.textContent = 'Pause'
      this.view.updateShape()
      this.view.updateNextShape()
      this.view.updateBoard()
      this.view.updateStats()
    }
  }

  resetBtnHandler = () => {
    this.removerTimer(this.timer)
    this.game.reset()
    this.view.startBtn.textContent = 'Start'
    this.view.showPauseAnimation()
    this.view.updateShape()
    this.view.updateNextShape()
    this.view.updateBoard()
    this.view.updateStats()
  }

  resultsOkBtnHandler = () => {
    this.view.hideResults()
  }

  rotationHandler = (e) => {
    const key = e.code
    if (this.game.state === GAME_STARTED) {
      if (key === KEY_ROTATE) {
        const canRotate = this.game.board.canRotate(this.game.shape)
        if (canRotate) {
          this.game.shape.rotate()
          this.view.updateShape()
        }
      }
    }
  }

  movementHandler = (e) => {
    const key = e.code
    if (this.game.state === GAME_STARTED) {
      switch (key) {
        case KEY_MOVE_LEFT:
          const canMoveLeft = this.game.board.canMoveLeft(this.game.shape)
          if (canMoveLeft) {
            this.game.shape.moveLeft()
            this.view.updateShapePosition()
          }
          break
        case KEY_MOVE_RIGHT:
          const canMoveRight = this.game.board.canMoveRight(this.game.shape)
          if (canMoveRight) {
            this.game.shape.moveRight()
            this.view.updateShapePosition()
          }
          break
        case KEY_MOVE_DOWN:
          const canMoveDown = this.game.board.canMoveDown(this.game.shape)
          if (canMoveDown) {
            this.game.shape.moveDown()
            this.view.updateShapePosition()
          }
          break
        default:
          break
      }
    }
  }

  addTimer = () => {
    this.timer = setTimeout(this.gameTimerHandler, this.game.levelTick)
  }

  removerTimer = () => {
    clearTimeout(this.timer)
  }

  gameTimerHandler = () => {
    if (this.game.state === GAME_STARTED) {
      if (this.game.board.canMoveDown(this.game.shape)) {
        this.game.shape.moveDown()
        this.view.updateShapePosition()
        this.addTimer()
      } else {
        this.game.board.merge(this.game.shape)

        const removedRows = this.game.board.removeFullRows()
        const hasRemovedRows = Boolean(removedRows.length)
        if (hasRemovedRows) {
          this.game.score += removedRows.length
          this.game.setLevel()
          this.view.updateStats()
        }

        this.game.changeShape()
        this.view.updateShape()
        this.view.updateNextShape()
        this.view.updateBoard()
        this.addTimer()

        if (this.game.board.isOverflown()) {
          this.removerTimer()
          this.view.showResults()
          this.game.finish()
          this.view.startBtn.textContent = 'Start'
          this.view.updateStats()
        }
      }
    }
  }

  themeHandler = () => {
    if (this.checkbox.checked) {
      document.body.classList.add('dark-theme')
      localStorage.setItem('dark-theme', true)
    } else {
      document.body.classList.remove('dark-theme')
      localStorage.setItem('dark-theme', false)
    }
  }

  setTheme = () => {
    const isDarkTheme = JSON.parse(localStorage.getItem('dark-theme')) ?? false

    if (isDarkTheme) {
      document.body.classList.add('dark-theme')
      this.checkbox.checked = true
    }
  }
}

const gameModel = new GameModel(localStorage)
const gameView = new GameView(gameModel)
export const controller = new GameController(gameModel, gameView)
