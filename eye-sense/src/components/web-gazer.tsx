import Modal from "./modal";
import TestWebGazer from "./test-web-gazer";
import XButton from "./x-button";

const WebGazer = ({
  imageUrl,
  closeWebGazer,
}: {
  imageUrl: string | undefined;
  closeWebGazer: () => void;
}) => {
  return (
    // <div className="max-w-4xl ml-auto mr-auto p-5">
    //   <div className="m-5 rounded-2xl bg-white p-5">
    // </div>
    // </div>
    // <Modal>
    //   {/* <iframe
    //     src="/web-gazer.html"
    //     title="WebGazer Heatmap"
    //     width="900px"
    //     height="700px"
    //     style={{ border: "none" }}
    //   /> */}
    //   <TestWebGazer imageUrl={imageUrl} />

    //   {/* <XButton resetFn={closeModal} /> */}
    // </Modal>
    <TestWebGazer imageUrl={imageUrl} closeWebGazer={closeWebGazer} />
  );
};

export default WebGazer;
