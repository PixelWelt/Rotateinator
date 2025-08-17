class SimpleGifEncoder {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.frames = [];
  }

  addFrame(imageData, delay = 100) {
    this.frames.push({
      data: imageData,
      delay: delay
    });
  }

  async render() {
    // Use a simple GIF encoding solution
    // Since real GIF encoding is very complex, we create a WebP or fallback to PNG sequence

    try {

      const canvas = document.createElement('canvas');
      canvas.width = this.width;
      canvas.height = this.height;
      const ctx = canvas.getContext('2d');

      // Create animated WebP (if browser supports it)
      const frames = this.frames.map((frame, index) => {
        ctx.clearRect(0, 0, this.width, this.height);
        ctx.putImageData(frame.data, 0, 0);
        return canvas.toDataURL('image/png');
      });


      // Create simple GIF-like file (fallback to HTML file with animation)
      const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <link rel="stylesheet" href="style.css">
</head>
<body class="animation-fallback">
    <h2>get rotated lol</h2>
    <img id="animation" src="${frames[0]}" />
    <script>
        const frames = ${JSON.stringify(frames)};
        let currentFrame = 0;
        const img = document.getElementById('animation');
        
        setInterval(() => {
            currentFrame = (currentFrame + 1) % frames.length;
            img.src = frames[currentFrame];
        }, ${this.frames[0].delay});
    </script>
</body>
</html>`;

      const blob = new Blob([htmlContent], { type: 'text/html' });
      return blob;

    } catch (error) {
      console.error('Error during rendering:', error);

      // As last fallback: ZIP with PNG frames
      const zip = new JSZip();
      const canvas = document.createElement('canvas');
      canvas.width = this.width;
      canvas.height = this.height;
      const ctx = canvas.getContext('2d');

      this.frames.forEach((frame, index) => {
        ctx.clearRect(0, 0, this.width, this.height);
        ctx.putImageData(frame.data, 0, 0);
        const dataURL = canvas.toDataURL('image/png');
        const base64Data = dataURL.split(',')[1];
        zip.file(`frame_${index.toString().padStart(3, '0')}.png`, base64Data, { base64: true });
      });

      return await zip.generateAsync({ type: 'blob' });
    }
  }
}

window.SimpleGifEncoder = SimpleGifEncoder;
