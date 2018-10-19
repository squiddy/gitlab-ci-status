import React from "react";

export class Duration extends React.Component {
  constructor(props) {
    super(props);
    this.state = { value: Math.floor(props.value), lastUpdate: null };
    this.counter = null;
  }

  componentDidMount() {
    if (this.props.ticking) {
      this.setState(state => ({
        lastUpdate: Date.now()
      }));
      this.counter = setInterval(this.tick.bind(this), 1000);
    }
  }

  tick() {
    this.setState(state => {
      const now = Date.now();
      const diff = Math.floor((Date.now() - state.lastUpdate) / 1000);
      return {
        value: state.value + diff,
        lastUpdate: now
      };
    });
  }

  componentWillUnmount() {
    if (this.counter) {
      clearInterval(this.counter);
    }
  }

  render() {
    return (
      <>
        {Math.floor(this.state.value / 60)}m {this.state.value % 60}s
      </>
    );
  }
}
