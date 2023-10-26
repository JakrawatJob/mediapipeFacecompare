import { Camera } from "https://code4fukui.github.io/Camera/Camera.js";
const facedetect = document.getElementById('facedetect');
const positionface = document.getElementById('positionface');
const copyButton = document.getElementById('copyButton');
const base64Output = document.getElementById('base64Output');
const g = canvasElement.getContext("2d");
const faceDetection = new FaceDetection({ locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_detection@0.4/${file}` });
const toggleButton = document.getElementById("toggleCamera");
let cameraOn = false;

faceDetection.setOptions({
    model: "short",
    minDetectionConfidence: 0.5,
});

faceDetection.onResults((res) => {
    var completedetect = document.getElementById("completedetect");
    //console.log(completedetect.innerText);
    if(completedetect.innerText == "detect complete"){
        console.log("closecamera")
        camera.stop();
        toggleButton.textContent = "เปิดกล้อง";
    }

    const w = canvasElement.width;
    const h = canvasElement.height;
    g.save();
    if (mirrormode.checked) {
        g.scale(-1, 1);
        g.translate(-w, 0);
    }
    g.clearRect(0, 0, w, h);
    if (showimg.checked) {
        g.drawImage(res.image, 0, 0, w, h);
    }
    const canvas = document.createElement("canvas");
    canvas.width = res.image.width;
    canvas.height = res.image.height;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(res.image, 0, 0);
    const base64Image = canvas.toDataURL("image/jpeg");
    base64Output.textContent = "";
    facedetect.textContent = "ไม่พบ";
    if (res.detections.length > 0) {
        facedetect.textContent = "ตรวจพบใบหน้า";
        //console.log("Base64 รูปภาพ:", base64Image);
        //base64Output.textContent = base64Image.split(',')[1];
        base64Output.textContent = base64Image;
        drawRectangle(
            g, res.detections[0].boundingBox,
            { color: 'blue', lineWidth: 4, fillColor: '#00000000' }
        );
    if (res.detections[0].landmarks) {
            // คำนวณค่าทิศทางการหันของตา //ตาขวา,ตาซ้าย ,ปาก ,จมูก,หูขวา,หูซ้าย
            const leftEyeLandmark = res.detections[0].landmarks[1].x;
            const leftearLandmark = res.detections[0].landmarks[5].x;
            const rightEyeLandmark = res.detections[0].landmarks[0].x;
            const rightearLandmark = res.detections[0].landmarks[4].x;
            //console.log(leftEyeLandmark-leftearLandmark)
            if(rightEyeLandmark-rightearLandmark<0.02){
              console.log("turn right");
              positionface.innerText = "turn right"
            }
            else if(leftearLandmark-leftEyeLandmark<0.02){
              console.log("turn left");
              positionface.innerText = "turn left"
            }else{positionface.innerText = "หน้าตรง"}
            //console.log(res.detections[0].landmarks[0],res.detections[0].landmarks[1],res.detections[0].landmarks[2],res.detections[0].landmarks[3],res.detections[0].landmarks[4],res.detections[0].landmarks[5]);
        }
    }
    g.restore();
});

const camera = new Camera(videoElement, {
    onFrame: async () => {
        //console.log("On frame");
        await faceDetection.send({ image: videoElement });
    },
    
    width: 1280,
    height: 720,
});

copyButton.addEventListener('click', function () {
    const copyText = document.createElement('textarea');
    copyText.value = base64Output.textContent;
    document.body.appendChild(copyText);
    copyText.select();
    copyText.setSelectionRange(0, 99999); 
    document.execCommand('copy');
    document.body.removeChild(copyText);
    copyButton.textContent = 'คัดลอกแล้ว';
    //copyButton.disabled = true;
});

toggleButton.addEventListener("click", () => {
    if (cameraOn) {
        camera.stop();
    } else {
        camera.start();
    }
    cameraOn = !cameraOn;
    toggleButton.textContent = cameraOn ? "ปิดกล้อง" : "เปิดกล้อง";
});
