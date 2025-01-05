import React, { useState, useEffect, useCallback } from 'react';

const GRAVITY = 0.5;
const JUMP_FORCE = -10;
const PIPE_SPEED = 7;
const PIPE_SPAWN_INTERVAL = 1500;
const PIPE_GAP = 150;

function App() {
  const [birdPosition, setBirdPosition] = useState(300);
  const [birdVelocity, setBirdVelocity] = useState(0);
  const [pipes, setPipes] = useState([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);

  // Generate new pipe
  const generatePipe = useCallback(() => {
    const minHeight = 50;
    const maxHeight = 400;
    const height = Math.floor(Math.random() * (maxHeight - minHeight) + minHeight);
    return {
      x: 400,
      topHeight: height,
      bottomHeight: 600 - height - PIPE_GAP,
      passed: false,
    };
  }, []);

  // Handle jump
  const handleJump = useCallback(() => {
    if (!gameStarted) {
      setGameStarted(true);
    }
    if (!gameOver) {
      setBirdVelocity(JUMP_FORCE);
    }
  }, [gameOver, gameStarted]);

  // Reset game
  const resetGame = () => {
    setBirdPosition(300);
    setBirdVelocity(0);
    setPipes([]);
    setGameStarted(false);
    setGameOver(false);
    setScore(0);
  };

  // Handle keyboard events
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.code === 'Space') {
        handleJump();
      }
    };

    document.addEventListener('keypress', handleKeyPress);
    return () => {
      document.removeEventListener('keypress', handleKeyPress);
    };
  }, [handleJump]);

  // Game loop
  useEffect(() => {
    let gameLoop;
    if (gameStarted && !gameOver) {
      gameLoop = setInterval(() => {
        // Update bird position
        setBirdPosition((prev) => {
          const newPosition = prev + birdVelocity;
          if (newPosition < 0 || newPosition > 570) {
            setGameOver(true);
            return prev;
          }
          return newPosition;
        });

        // Update bird velocity (applies gravity)
        setBirdVelocity((prev) => prev + GRAVITY);

        // Update pipes
        setPipes((prevPipes) => {
          return prevPipes
            .map((pipe) => ({
              ...pipe,
              x: pipe.x - PIPE_SPEED,
            }))
            .filter((pipe) => pipe.x > -60);
        });

        // Check collisions
        pipes.forEach((pipe) => {
          const birdRight = 100 + 40;
          const birdLeft = 100;
          const pipeRight = pipe.x + 60;
          const pipeLeft = pipe.x;

          if (
            birdRight > pipeLeft &&
            birdLeft < pipeRight &&
            (birdPosition < pipe.topHeight || birdPosition + 30 > pipe.topHeight + PIPE_GAP)
          ) {
            setGameOver(true);
          }

          // Update score
          if (!pipe.passed && birdLeft > pipeRight) {
            setScore((prev) => prev + 1);
            pipe.passed = true;
          }
        });
      }, 16);  // Updates roughly 60 times per second
    }

    return () => {
      if (gameLoop) clearInterval(gameLoop);
    };
  }, [gameStarted, gameOver, birdPosition, birdVelocity, pipes]);

  // Spawn pipes
  useEffect(() => {
    let pipeSpawner;
    if (gameStarted && !gameOver) {
      pipeSpawner = setInterval(() => {
        setPipes((prev) => [...prev, generatePipe()]);
      }, PIPE_SPAWN_INTERVAL);
    }

    return () => {
      if (pipeSpawner) clearInterval(pipeSpawner);
    };
  }, [gameStarted, gameOver, generatePipe]);

  const handleTapClick = (e) => {
    e.stopPropagation(); // Prevent double triggering with game container click
    handleJump();
  };

  return (
    <div className="game-container" onClick={handleJump}>
      <div className="game">
        <div className="score">{score}</div>
        <div
          className="bird"
          style={{
            top: birdPosition,
            left: 100,
            transform: `rotate(${birdVelocity * 2}deg)`,
          }}
        >
          <img src="/peach.png" alt="Bird" />
        </div>
        {pipes.map((pipe, index) => (
          <React.Fragment key={index}>
            <div
              className="pipe"
              style={{
                top: 0,
                height: pipe.topHeight,
                left: pipe.x,
              }}
            />
            <div
              className="pipe"
              style={{
                bottom: 0,
                height: pipe.bottomHeight,
                left: pipe.x,
              }}
            />
          </React.Fragment>
        ))}
        {gameOver && (
          <div className="game-over">
            <h1>Game Over!</h1>
            <p>Score: {score}</p>
            <button className="start-button" onClick={resetGame}>
              Play Again
            </button>
          </div>
        )}
        {!gameStarted && !gameOver && (
          <div className="game-over">
            <h1>Flappy Bird</h1>
            <p>Click or press spacebar to start</p>
          </div>
        )}
        <div className="tap-button" onClick={handleTapClick}>
          <img src="/ass.png" alt="Tap" />
        </div>
      </div>
    </div>
  );
}

export default App;
