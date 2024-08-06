const express = require('express');
const { createCanvas, loadImage } = require('canvas');
const cors = require('cors');
const app = express();
const PORT = 5000;

// Enable CORS middleware
app.use(cors());

// Simple in-memory cache
const imageCache = new Map();

app.get('/generate-og-image', async (req, res) => {
    const { title, content, image } = req.query;

    // Create a unique cache key based on the request parameters
    const cacheKey = `${title}-${content}-${image}`;

    // Check if the image is already in the cache
    if (imageCache.has(cacheKey)) {
        console.log('Serving from cache');
        const cachedImage = imageCache.get(cacheKey);
        return res.setHeader('Content-Type', 'image/png').send(cachedImage);
    }

    try {
        // Create a canvas of 1200x630 pixels
        const canvas = createCanvas(1200, 630);
        const ctx = canvas.getContext('2d');

        // Set background color
        ctx.fillStyle = '#f0f0f0'; // Light gray background
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Title styling
        ctx.fillStyle = '#333'; // Dark text
        ctx.font = 'bold 48px Arial';
        ctx.fillText(title || 'Default Title', 50, 100); // Default title if none provided

        // Content snippet styling
        ctx.font = '36px Arial';
        ctx.fillText(content ? content.substring(0, 100) + '...' : 'Default content snippet.', 50, 200); // Default content if none provided

        // Optional image handling
        if (image) {
            const img = await loadImage(image);
            ctx.drawImage(img, 50, 250, 400, 300); // Draw the image on the canvas
        }

        // Generate the image buffer
        const imageBuffer = canvas.toBuffer();

        // Store the generated image in the cache
        imageCache.set(cacheKey, imageBuffer);

        // Set the response header for image
        res.setHeader('Content-Type', 'image/png');
        res.send(imageBuffer); // Send the generated image buffer
    } catch (error) {
        console.error('Error generating OG image:', error);
        res.status(500).send('Error generating OG image');
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
