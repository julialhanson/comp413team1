import React from "react";
import "../eye-tracker.scss";
import Container from "../../src/components/container";

const WebGazer = () => {
  return (
    <Container>
      <iframe
        src="/web-gazer.html"
        title="WebGazer Heatmap"
        width="100%"
        height="700px"
        style={{ border: "none" }}
      />
    </Container>
  );
};

export default WebGazer;
