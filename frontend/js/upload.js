document.addEventListener('DOMContentLoaded', () => {
    // Function to show error modal
    function showErrorModal(message) {
      const modal = document.getElementById('error-modal');
      const errorMessage = document.getElementById('error-message');
      errorMessage.textContent = message;
      modal.classList.remove('hidden');
    }
  
    // Function to hide error modal
    function hideErrorModal() {
      const modal = document.getElementById('error-modal');
      modal.classList.add('hidden');
    }
  
    // Attach event listener to close the error modal
    const closeErrorBtn = document.getElementById('close-error');
    if (closeErrorBtn) {
      closeErrorBtn.addEventListener('click', hideErrorModal);
    }
    
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
          showErrorModal('Error analyzing the image: ' + data.message);
        }
      } catch (error) {
        console.error('Error:', error);
        showErrorModal('Something went wrong during image upload.');
      }
    });
  });
  