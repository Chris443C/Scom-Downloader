// Enhanced SCORM content downloader with better file handling
async function downloadAllSCORMContent() {
    console.log('Starting SCORM content download...');
    
    // Get page resources
    const resources = {
        html: document.documentElement.outerHTML,
        title: document.title.replace(/[^a-zA-Z0-9]/g, '_'),
        url: window.location.href,
        images: [...document.querySelectorAll('img')].map(img => ({
            src: img.src,
            alt: img.alt || 'image'
        })).filter(img => img.src && !img.src.startsWith('data:')),
        audio: [...document.querySelectorAll('audio')].map(audio => ({
            src: audio.src || audio.currentSrc,
            id: audio.id || 'audio'
        })).filter(audio => audio.src),
        video: [...document.querySelectorAll('video')].map(video => ({
            src: video.src || video.currentSrc,
            id: video.id || 'video'
        })).filter(video => video.src),
    };
    
    console.log('Found resources:', resources);
    
    // Helper function to actually download files
    function forceDownload(blob, filename) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = filename;
        
        // Add to DOM, click, then remove
        document.body.appendChild(a);
        a.click();
        
        // Clean up
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 100);
    }
    
    // Download HTML first
    console.log('Downloading HTML...');
    const htmlBlob = new Blob([resources.html], { type: 'text/html;charset=utf-8' });
    forceDownload(htmlBlob, `${resources.title}_page.html`);
    
    // Download resource list as JSON
    const resourcesJson = JSON.stringify(resources, null, 2);
    const jsonBlob = new Blob([resourcesJson], { type: 'application/json' });
    forceDownload(jsonBlob, `${resources.title}_resources.json`);
    
    // Wait a bit before downloading media
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Download audio files
    console.log(`Downloading ${resources.audio.length} audio files...`);
    for (let i = 0; i < resources.audio.length; i++) {
        const audio = resources.audio[i];
        try {
            console.log(`Downloading audio ${i + 1}/${resources.audio.length}: ${audio.src}`);
            
            const response = await fetch(audio.src);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            
            const blob = await response.blob();
            const filename = `${resources.title}_audio_${i + 1}_${audio.id}.${audio.src.split('.').pop().split('?')[0]}`;
            
            forceDownload(blob, filename);
            
            // Wait between downloads to avoid overwhelming the server
            await new Promise(resolve => setTimeout(resolve, 2000));
        } catch (error) {
            console.error(`Failed to download audio ${i + 1}:`, error);
        }
    }
    
    // Download video files
    console.log(`Downloading ${resources.video.length} video files...`);
    for (let i = 0; i < resources.video.length; i++) {
        const video = resources.video[i];
        try {
            console.log(`Downloading video ${i + 1}/${resources.video.length}: ${video.src}`);
            
            const response = await fetch(video.src);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            
            const blob = await response.blob();
            const filename = `${resources.title}_video_${i + 1}_${video.id}.${video.src.split('.').pop().split('?')[0]}`;
            
            forceDownload(blob, filename);
            
            await new Promise(resolve => setTimeout(resolve, 2000));
        } catch (error) {
            console.error(`Failed to download video ${i + 1}:`, error);
        }
    }
    
    // Download images
    console.log(`Downloading ${resources.images.length} images...`);
    for (let i = 0; i < resources.images.length; i++) {
        const image = resources.images[i];
        try {
            console.log(`Downloading image ${i + 1}/${resources.images.length}: ${image.src}`);
            
            const response = await fetch(image.src);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            
            const blob = await response.blob();
            const extension = image.src.split('.').pop().split('?')[0];
            const filename = `${resources.title}_image_${i + 1}.${extension}`;
            
            forceDownload(blob, filename);
            
            await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error) {
            console.error(`Failed to download image ${i + 1}:`, error);
        }
    }
    
    console.log('Download process completed!');
}

// Alternative: Download specific media type only
function downloadAudioOnly() {
    const audioElements = [...document.querySelectorAll('audio')];
    const title = document.title.replace(/[^a-zA-Z0-9]/g, '_');
    
    console.log(`Found ${audioElements.length} audio elements`);
    
    audioElements.forEach(async (audio, index) => {
        const src = audio.src || audio.currentSrc;
        if (!src) return;
        
        try {
            const response = await fetch(src);
            const blob = await response.blob();
            const filename = `${title}_audio_${index + 1}.${src.split('.').pop().split('?')[0]}`;
            
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            console.log(`Downloaded: ${filename}`);
        } catch (error) {
            console.error(`Failed to download audio ${index + 1}:`, error);
        }
        
        // Wait between downloads
        await new Promise(resolve => setTimeout(resolve, 1500));
    });
}

// Quick test function to download just one file
function testDownload() {
    const testContent = "This is a test file to verify downloads work";
    const blob = new Blob([testContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'test_download.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    console.log('Test download triggered');
}

// Usage:
// testDownload(); // Test if downloads work at all
// downloadAudioOnly(); // Download just audio files
// downloadAllSCORMContent(); // Download everything

console.log('SCORM downloader loaded. Run one of these commands:');
console.log('- testDownload() - Test if downloads work');
console.log('- downloadAudioOnly() - Download only audio files');  
console.log('- downloadAllSCORMContent() - Download everything');
