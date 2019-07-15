import "./css/style.css";
import GameController from "./js/GameController"

//Create a game controller that assigns application to the game-container canvas element
const gameController = new GameController(
    document.getElementById("game-container")
);