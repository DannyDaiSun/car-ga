
import { Jimp } from 'jimp';
import fs from 'fs';
import path from 'path';

const ART_DIR = 'public/art';
const ASSETS = [
    'geo_body_sport.png', 'geo_body_truck.png', 'geo_wheel_mag.png',
    'cyber_booster_rocket.png', 'cyber_engine_reactor.png', 'cyber_engine_v8cyber.png', 'cyber_engine_turbine.png'
];

async function processImages() {
    const dimensions = {};

    for (const file of ASSETS) {
        const filePath = path.join(ART_DIR, file);
        console.log(`Processing ${file}...`);

        try {
            const image = await Jimp.read(filePath);

            // 1. Threshold for white background (JPEGs might not be perfect white)
            // Iterate all pixels
            const width = image.bitmap.width;
            const height = image.bitmap.height;

            // Scan and set transparency
            image.scan(0, 0, width, height, function (x, y, idx) {
                const r = this.bitmap.data[idx + 0];
                const g = this.bitmap.data[idx + 1];
                const b = this.bitmap.data[idx + 2];

                // If close to white
                if (r > 240 && g > 240 && b > 240) {
                    this.bitmap.data[idx + 3] = 0; // Set Alpha to 0
                }
            });

            // 2. Autocrop (trim transparency)
            image.autocrop({ tolerance: 0.01 });

            // 3. Resize if too massive? 
            // 1024px is huge for physics. Let's resize to a base aesthetic size.
            // Say ~128px wide/tall is a good "HD Pixel Art" size for this game.
            // Current Scale is 20px/m. 128px = 6.4 meters. That's a good "large" visible size.
            // But we shouldn't force square.
            // Let's cap max dimension to 128px.
            if (image.bitmap.width > 200 || image.bitmap.height > 200) {
                image.scaleToFit({ w: 200, h: 200 }); // "Enlarge" user request -> 200px = 10m. Big!
            }

            // Save back
            await image.write(filePath);

            dimensions[path.basename(file, '.png')] = {
                w: image.bitmap.width,
                h: image.bitmap.height
            };

            console.log(`  -> New size: ${image.bitmap.width}x${image.bitmap.height}`);

        } catch (err) {
            console.error(`Error processing ${file}:`, err);
        }
    }

    // Output dimensions to a JSON file for our app to import or copy
    fs.writeFileSync('src/render/assetDimensions.json', JSON.stringify(dimensions, null, 2));
    console.log('Saved dimensions to src/render/assetDimensions.json');
}

processImages();
