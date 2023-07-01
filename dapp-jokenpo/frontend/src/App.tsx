import { useState, useEffect } from "react";
import Header from "./Header";
import {
  Leaderboard,
  Options,
  getResult,
  play,
  getLeaderboard,
} from "./Web3Service";

function App() {
  const [message, setMessage] = useState("");
  const [leaderboard, setLeaderboard] = useState<Leaderboard>();

  useEffect(() => {
    getLeaderboard()
      .then((leaderboard) => setLeaderboard(leaderboard))
      .catch((err) => setMessage(err.message));
  }, []);

  function onPlay(option: Options) {
    setLeaderboard((prevState) => ({
      ...prevState,
      result: "Sending your choice...",
    }));
    play(option)
      .then((tx) => getResult())
      .then((result) =>
        setLeaderboard((prevState) => ({ ...prevState, result }))
      )
      .catch((err) => setMessage(err.message));
  }

  return (
    <div className="container">
      <Header />
      <main>
        <div className="py-5 text-center">
          <img
            className="d-block mx-auto mb-4"
            src="/logo512.png"
            alt="JoKenPo"
            width={72}
          />
          <h2>Leaderboard</h2>
          <p className="lead">
            Check the best players' score and play the game.
          </p>
          <p className="lead text-danger">{message}</p>
        </div>
        <div className="col-md-8 col-lg-12">
          <div className="col-sm-6"></div>
          <div className="col-sm-6">
            <h4 className="mb-3">Games</h4>
            <div className="card card-body border-0 shadow">
              <h5 className="mb-3 text-primary">Current Status:</h5>
              <div className="alert alert-success">
                {leaderboard && leaderboard.result
                  ? leaderboard.result
                  : "Loading..."}
              </div>
              <h5 className="mb-3 text-primary">
                {(leaderboard && leaderboard.result?.indexOf("won") !== -1) ||
                !leaderboard?.result
                  ? "Start a new game:"
                  : "Play this game:"}
              </h5>
              <div className="d-flex">
                <div className="col-sm-4">
                  <div
                    onClick={() => onPlay(Options.PAPER)}
                    className="alert alert-info play-button me-3"
                  >
                    <img src="src/assets/paper.png" width={100} alt="Paper" />
                  </div>
                </div>
                <div className="col-sm-4">
                  <div
                    onClick={() => onPlay(Options.ROCK)}
                    className="alert alert-info play-button"
                  >
                    <img src="src/assets/rock.png" width={100} alt="Rock" />
                  </div>
                </div>
                <div className="col-sm-4">
                  <div
                    onClick={() => onPlay(Options.SCISSORS)}
                    className="alert alert-info play-button ms-3"
                  >
                    <img
                      src="src/assets/scissors.png"
                      width={100}
                      alt="Scissors"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
