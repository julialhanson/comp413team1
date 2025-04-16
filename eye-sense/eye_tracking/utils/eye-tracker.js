export default class EyeTracker {

  constructor(webgazer, pyodide) {
    this.webgazer = webgazer
    this.gazeData = []
    this.backgroundImageBase64 = ""
    this.pyodide = pyodide;
    this.pyodideReady = false;
  }

  // // Global variables
  // let this.gazeData = [];
  // let this.backgroundImageBase64 = "";
  // let this.pyodide, this.pyodideReady = false;

  // Utility: Load an image as Base64 (without the data prefix)
  loadImageAsBase64 = async (url) => {
    const res = await fetch(url);
    const blob = await res.blob();
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64data = reader.result.split(',')[1];
        this.backgroundImageBase64 = base64data;
        console.log("base64data:", base64data)
        resolve(base64data);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  // Load pyodide and required packages
  loadPyodideAndPackages = async () => {
    // this.pyodide = await loadPyodide();
    await this.pyodide.loadPackage(['numpy', 'matplotlib', 'pillow', 'scipy']);
    this.pyodideReady = true;
    console.log("Pyodide loaded!");
  }
  // loadPyodideAndPackages();

  // Create calibration dots (unchanged calibration phase)
  createCalibrationDots = () => {
    const calibrationPoints = [
    [10, 10], [50, 10], [90, 10],
    [10, 50], [50, 50], [90, 50],
    [10, 90], [50, 90], [90, 90]
    ];
    const clicksRequired = 5;
    let currentClicks = {};
    let completedPoints = 0;
    const instructions = document.getElementById('instructions');

    calibrationPoints.forEach(([xPercent, yPercent], i) => {
      const dot = document.createElement('div');
      dot.className = 'calibration-dot';
      dot.style.left = `calc(${xPercent}vw - 15px)`;
      dot.style.top = `calc(${yPercent}vh - 15px)`;
      dot.dataset.id = `${i}`;
      document.body.appendChild(dot);
      currentClicks[i] = 0;

      dot.addEventListener('click', () => {
        console.log("clicking")
        const x = window.innerWidth * (xPercent / 100);
        const y = window.innerHeight * (yPercent / 100);
        this.webgazer.recordScreenPosition(x, y, 'click');
        currentClicks[i]++;
        if (currentClicks[i] >= clicksRequired) {
          dot.style.display = 'none';
          completedPoints++;
        }
        if (completedPoints === calibrationPoints.length) {
          instructions.innerText = "Calibration complete. Starting tracking...";
          setTimeout(this.startTrackingPhase, 1000);
        }
      });
    });
  }

  // Start tracking phase: remove calibration dots, show background image, record gaze data for 10 seconds.
  startTrackingPhase = () => {
    console.log("tracking phase starting")

    document.querySelectorAll('.calibration-dot').forEach(dot => dot.remove());
    document.getElementById('instructions').style.display = 'none';
    document.getElementById('imagePhase').style.display = 'block';

    const gazeDot = document.getElementById('gazeDot');
    gazeDot.style.display = 'block';
    this.webgazer.clearGazeListener();
    this.webgazer.setRegression('weightedRidge')
      .setGazeListener((data, timestamp) => {
        if (data) {
          gazeDot.style.left = `${data.x - 7.5}px`;
          gazeDot.style.top = `${data.y - 7.5}px`;
          this.gazeData.push({ x: data.x, y: data.y, time: timestamp });
        }
      });
    this.webgazer.showVideo(false).showPredictionPoints(false);
    setTimeout(this.stopTrackingPhase, 10000);
  }

  // Stop tracking, run the Python code via pyodide, and display the composite heatmap image.
  stopTrackingPhase = async () => {
    this.webgazer.clearGazeListener();
    document.getElementById('gazeDot').style.display = 'none';
    document.getElementById('instructions').innerText = "Processing heatmap...";
    document.getElementById('imagePhase').style.background = 'black';

    console.log("this.pyodideReady:", this.pyodideReady)
    if (!this.pyodideReady) {
      alert("Pyodide is not loaded yet.");
      return;
    }

    // Set image base64 + display dimensions
    const trackingImg = document.getElementById('trackingImage');
    const width = trackingImg.clientWidth;
    const height = trackingImg.clientHeight;

    this.pyodide.globals.set("gaze_data_str", JSON.stringify(this.gazeData));

    const cleanedBase64 = this.backgroundImageBase64.replace(/^data:image\/\w+;base64,/, '');
    console.log("Base64 length:", cleanedBase64.length);
    console.log("Base64 preview:", cleanedBase64.slice(0, 100));
    this.pyodide.globals.set("image_base64", cleanedBase64);
    // this.pyodide.globals.set("image_base64", this.backgroundImageBase64);
    this.pyodide.globals.set("display_width", width);
    this.pyodide.globals.set("display_height", height);

    console.log("Running Python script...");
    try {
      let heatmapData = await this.pyodide.runPythonAsync(`
import json
import numpy as np
from PIL import Image
import matplotlib.pyplot as plt
from scipy.ndimage import gaussian_filter
from io import BytesIO
import base64

try:
  decoded = base64.b64decode(image_base64)
except Exception as e:
  raise Exception("Base64 decoding failed: " + str(e))

# Load and resize background image
img = Image.open(BytesIO(base64.b64decode(image_base64)))
img = img.resize((display_width, display_height), Image.BILINEAR)
img_width, img_height = img.size

# Load and filter gaze data
gaze_data = json.loads(gaze_data_str)
points = [(int(d['x']), int(d['y'])) for d in gaze_data if 0 <= d['x'] < img_width and 0 <= d['y'] < img_height]

# Create heatmap
heatmap = np.zeros((img_height, img_width))
for x, y in points:
  heatmap[y, x] += 1

heatmap_blurred = gaussian_filter(heatmap, sigma=30)
heatmap_normalized = heatmap_blurred / np.max(heatmap_blurred) if np.max(heatmap_blurred) != 0 else heatmap_blurred

# Plot image + heatmap as full-size with black outside
plt.figure(figsize=(img_width / 100, img_height / 100), dpi=100)
plt.imshow(img)
plt.imshow(heatmap_normalized, cmap='jet', alpha=0.4)
plt.axis('off')

buf = BytesIO()
plt.savefig(buf, format='png', bbox_inches='tight', pad_inches=0, facecolor='black')
plt.close()
buf.seek(0)
"data:image/png;base64," + base64.b64encode(buf.read()).decode('utf-8')
      `);

      // Set result as full-screen background
      document.body.style.setProperty('background-image', `url(${heatmapData})`, 'important');
      document.body.style.setProperty('background-size', 'cover', 'important');
      document.body.style.setProperty('background-position', 'center', 'important');
      document.body.style.setProperty('background-repeat', 'no-repeat', 'important');
      document.body.style.setProperty('background-color', 'black', 'important');

      // Optionally hide all other image elements
      document.getElementById('imagePhase').style.display = 'none';
      document.getElementById('instructions').innerText = "Heatmap generated!";
    } catch (err) {
      console.error("Error generating heatmap:", err);
      document.getElementById('instructions').innerText = "Error generating heatmap.";
    }
  }

  beginWebgazer = () => {
    // Start WebGazer so that the webcam is active (HTTPS/localhost required)
    this.webgazer.begin();
    this.webgazer.showVideo(true).showPredictionPoints(true);
  }
}