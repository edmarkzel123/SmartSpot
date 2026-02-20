import { Component } from "react";

class AppErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, message: "" };
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      message: error?.message || "Unexpected application error."
    };
  }

  componentDidCatch(error) {
    // Keep console trace for debugging in browser devtools.
    console.error("SmartSpot runtime error:", error);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <main style={{ padding: "2rem", fontFamily: "Segoe UI, sans-serif" }}>
        <h1>SmartSpot</h1>
        <p>The app hit a runtime error, but recovery is available.</p>
        <p><strong>Error:</strong> {this.state.message}</p>
        <button type="button" onClick={this.handleReload}>Reload App</button>
      </main>
    );
  }
}

export default AppErrorBoundary;
