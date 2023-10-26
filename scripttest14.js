let cardModel;
const idcarddetect = document.getElementById('idcarddetect');
const completedetect = document.getElementById('completedetect');
async function loadModel() {
    try {
        cardModel = await tf.loadGraphModel("/models/idcard/model.json");
    } catch (error) {
        console.error("Failed to load the card model:", error);
    }
}

function getDataAndLog() {
    // Get the element by its ID

    var preElement = document.getElementById("base64Output");
    if (!preElement || !preElement.textContent) {
        console.log("return 0"); // ไม่เจอใบหน้า
        return;
    }
    var data = preElement.textContent;
    const cake = new Image();
    cake.src = data;
    //console.log(cake);
    cake.onload = async () => {
        console.log("start");
        let cakeTensor = tf.browser.fromPixels(cake);
        const h = cakeTensor.shape[0];
        const w = cakeTensor.shape[1];
        const c = cakeTensor.shape[2];

        const output = await cardModel.executeAsync(cakeTensor.reshape([1, h, w, c]));

        const output2 = output[2].dataSync();
        const output7 = output[7].dataSync();

        const y1 = output7[0];
        const x1 = output7[1];
        const y2 = output7[2];
        const x2 = output7[3];

        const score = output2[0];

        if (score > 0.97) {
            const datasent = data.split(',')[1];
            idcarddetect.textContent = "ตรวจพบบัตร  score = " + score;
            sendImageToServer(datasent)
            console.log(`${y1} ${y2} ${x1} ${x2}`);
            console.log("Id card", score);
        } else {
            idcarddetect.textContent = "ไม่พบบัตร";
        }
    };
}
function sendImageToServer(base64ImageData) {
    console.log(base64ImageData);
    const api = "https://apis.aigen.online/aiface/selfie-doc-compare/v1";
    const headers = {
        "x-aigen-key": "SB3ezk9fvv360gjc86bsktilshc3zbnka8",
    };
    const data = {
        image: base64ImageData
    };

    axios.post(api, data, { headers: headers })
        .then((res) => {
            console.log(res.data[1]);
            console.log(res.data["confidence"]);

            if (res.data["confidence"] > 35) {
                isCapturing = false;
                document.getElementById('autoCaptureButton').innerText = "Auto Capture";
                document.getElementById('completedetect').innerText = "detect complete";
                clearInterval(intervalId);
                return
            }
        })
        .catch((err) => {
            console.error(err.response.data);
        });
}

loadModel();
var isCapturing = false;
var intervalId;
document.getElementById('autoCaptureButton').addEventListener('click', function() {
    console.log("isCapturing",isCapturing);
    //clearInterval(intervalId);
    if (isCapturing) {
        
        console.log("close already");
        isCapturing = false;
        document.getElementById('autoCaptureButton').innerText = "Auto Capture";
        clearInterval(intervalId);
        return 
    } else {
        intervalId = setInterval(getDataAndLog, 2000);
        isCapturing = true;
        document.getElementById('autoCaptureButton').innerText = "Stopped Auto Capture";
    }
});
