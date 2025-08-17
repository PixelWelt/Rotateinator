const upload = document.getElementById('upload');
const generate = document.getElementById('generate');
const canvas = document.getElementById('canvas');
const speedSlider = document.getElementById('speed');
const speedValue = document.getElementById('speedValue');
let img = new Image();
let imgLoaded = false;

// Update speed display
speedSlider.oninput = () => {
  speedValue.textContent = speedSlider.value;
};

upload.onchange = e => {
  const file = e.target.files[0];
  if (!file) return;
  imgLoaded = false;
  generate.disabled = true;
  img.src = URL.createObjectURL(file);
  img.onload = () => {
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);
    imgLoaded = true;
    generate.disabled = false;
  };
};

generate.onclick = async () => {
  if (!imgLoaded) return;

  generate.disabled = true;
  generate.textContent = 'Creating GIF...';

  const maxSize = 400;
  let width = img.width;
  let height = img.height;

  if (width > maxSize || height > maxSize) {
    const ratio = Math.min(maxSize / width, maxSize / height);
    width = Math.floor(width * ratio);
    height = Math.floor(height * ratio);
  }

  const frameDelay = parseInt(speedSlider.value) / 1000;

  const frames = [];

  for (let i = 0; i < 36; i++) {
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = width;
    tempCanvas.height = height;
    const ctx = tempCanvas.getContext('2d');

    // Add white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    ctx.save();
    const angle = (i * 10) * Math.PI / 180;
    const scaleX = Math.cos(angle);
    ctx.translate(width / 2, height / 2);
    ctx.scale(scaleX, 1);
    ctx.drawImage(img, -width / 2, -height / 2, width, height);
    ctx.restore();

    frames.push(tempCanvas.toDataURL('image/png'));
  }

  // Create GIF with gifshot
  gifshot.createGIF({
    images: frames,
    gifWidth: width,
    gifHeight: height,
    interval: frameDelay,
    numFrames: 36,
    frameDuration: frameDelay,
    fontWeight: 'normal',
    fontSize: '16px',
    fontFamily: 'sans-serif',
    fontColor: '#ffffff',
    textAlign: 'center',
    textBaseline: 'bottom',
    sampleInterval: 10,
    numWorkers: 2,
    transparent: 0x00ffffff
  }, function(obj) {
    if (!obj.error) {

      const link = document.createElement('a');
      link.download = 'rotation.gif';
      link.href = obj.image;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      console.log('GIF successfully created and downloaded!');
    } else {
      console.error('Error creating GIF:', obj.error);

      createGIFWithCustomEncoder();
    }

    generate.disabled = false;
    generate.textContent = 'Create GIF';
  });


  let currentFrame = 0;
  const animateCanvas = () => {
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = width;
    tempCanvas.height = height;
    const ctx = tempCanvas.getContext('2d');




    ctx.save();
    const angle = (currentFrame * 10) * Math.PI / 180;
    const scaleX = Math.cos(angle);
    ctx.translate(width / 2, height / 2);
    ctx.scale(scaleX, 1);
    ctx.drawImage(img, -width / 2, -height / 2, width, height);
    ctx.restore();

    const canvasCtx = canvas.getContext('2d');
    canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
    canvasCtx.drawImage(tempCanvas, 0, 0, canvas.width, canvas.height);

    currentFrame = (currentFrame + 1) % 36;
    setTimeout(animateCanvas, parseInt(speedSlider.value));
  };
  animateCanvas();


  async function createGIFWithCustomEncoder() {
    try {
      const encoder = new SimpleGifEncoder(width, height);

      for (let i = 0; i < 36; i++) {
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = width;
        tempCanvas.height = height;
        const ctx = tempCanvas.getContext('2d');


        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);

        ctx.save();
        const angle = (i * 10) * Math.PI / 180;
        const scaleX = Math.cos(angle);
        ctx.translate(width / 2, height / 2);
        ctx.scale(scaleX, 1);
        ctx.drawImage(img, -width / 2, -height / 2, width, height);
        ctx.restore();

        const imageData = ctx.getImageData(0, 0, width, height);
        encoder.addFrame(imageData, parseInt(speedSlider.value));
      }

      const gifBlob = await encoder.render();
      const link = document.createElement('a');
      link.download = 'rotation.gif';
      link.href = URL.createObjectURL(gifBlob);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

    } catch (error) {
      console.error('Custom encoder also failed:', error);
    }
  }
};

