import Modal from "../../src/components/modal";

const WebGazer = () => {
  return (
    // <div className="max-w-4xl ml-auto mr-auto p-5">
    //   <div className="m-5 rounded-2xl bg-white p-5">
    // </div>
    // </div>
    <Modal>
      <iframe
        src="/web-gazer.html"
        title="WebGazer Heatmap"
        width="900px"
        height="700px"
        style={{ border: "none" }}
      />
    </Modal>
  );
};

export default WebGazer;
