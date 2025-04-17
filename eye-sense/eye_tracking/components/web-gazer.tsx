import "../eye-tracker.scss";

const WebGazer = () => {
  return (
    <div className="max-w-4xl ml-auto mr-auto p-5">
      <div className="m-5 rounded-2xl bg-white p-5">
        <iframe
          src="/web-gazer.html"
          title="WebGazer Heatmap"
          width="100%"
          height="700px"
          style={{ border: "none" }}
        />
      </div>
    </div>
  );
};

export default WebGazer;
