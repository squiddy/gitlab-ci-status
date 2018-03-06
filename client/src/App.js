import React, { Component } from "react";

import "./App.css";
import { Pipeline } from "./Pipeline";

class App extends Component {
  constructor(props) {
    super(props);

    this.state = { pipelines: [] };
  }

  update() {
    fetch("/initial")
      .then(res => res.json())
      .then(data => {
        this.setState({ pipelines: data });
      });
  }

  componentDidMount() {
    this.timer = setInterval(this.update.bind(this), 10000);
    this.update();
  }

  componentWillUnmount() {
    clearInterval(this.timer);
  }

  render() {
    return (
      <main>
        <div className="queue">
          {this.state.pipelines.map((p, idx) => {
            return <Pipeline pipeline={p} key={idx} />;
          })}
        </div>
      </main>
    );
  }
}

export default App;
