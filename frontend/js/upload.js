document.addEventListener('DOMContentLoaded', () => {
    const uploadForm = document.getElementById('upload-form');
    if (!uploadForm) {
      console.error('Upload form not found!');
      return;
    }
    
    const resultsSection = document.getElementById('results-section');
    const resultsContainer = document.getElementById('results');
    
    uploadForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const image = document.getElementById('image').files[0];
      const analysisType = document.getElementById('analysis-type').value;
    
      const formData = new FormData();
      formData.append('image', image);
      formData.append('analysis-type', analysisType);
    
      try {
        // Now using the Express endpoint (same origin) to avoid CORS issues.
        const res = await fetch('/api/upload-image', {
          method: 'POST',
          headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') },
          body: formData
        });
    
        const data = await res.json();
        if (res.ok) {
          resultsSection.classList.remove('hidden');
          resultsContainer.innerHTML = `
            <h3>Analysis Type: ${data.analysisType}</h3>
            <p>Prediction: ${data.prediction}</p>
            <p>Confidence: ${data.confidence}%</p>
          `;
        } else {
          alert('Error analyzing the image: ' + data.message);
        }
      } catch (error) {
        console.error('Error:', error);
        alert('Something went wrong during image upload.');
      }
    });
  });
  