document.addEventListener('DOMContentLoaded', function() {
  const fileInput = document.getElementById('donorImage');
  const imageHiddenInput = document.getElementById('image');
  const imagePreview = document.getElementById('imagePreview');
  const uploadStatus = document.getElementById('uploadStatus');
  const statusText = document.getElementById('statusText');
  const spinner = uploadStatus?.querySelector('.spinner-border');
  const donorForm = fileInput?.closest('form');
  const submitButton = donorForm?.querySelector('button[type="submit"]');

  let uploadInProgress = false;
  let uploadPromise = null;

  if (!fileInput) return;

  const setSubmittingState = (isSubmitting) => {
    if (!submitButton) return;
    submitButton.disabled = isSubmitting;
    submitButton.dataset.originalText = submitButton.dataset.originalText || submitButton.innerHTML;
    submitButton.innerHTML = isSubmitting ? 'Uploading image...' : submitButton.dataset.originalText;
  };

  const uploadSelectedImage = async (file) => {
    if (!file) {
      return null;
    }

    uploadInProgress = true;
    setSubmittingState(true);

    if (uploadStatus) {
      uploadStatus.style.display = 'block';
      if (spinner) spinner.style.display = 'inline-block';
      if (statusText) statusText.textContent = 'Uploading...';
    }

    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/files/upload', {
      method: 'POST',
      body: formData,
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Upload failed');
    }

    const uploadedFile = Array.isArray(result.data) ? result.data[0] : result.data;
    const imageUrl = uploadedFile?.url || uploadedFile?.cloudinaryUrl;

    if (!imageUrl) {
      throw new Error('Upload succeeded but no image URL was returned');
    }

    imageHiddenInput.value = imageUrl;

    if (imagePreview) {
      const imgElement = imagePreview.querySelector('img');
      imgElement.src = imageUrl;
      imagePreview.style.display = 'block';
    }

    if (statusText) {
      statusText.textContent = 'Upload successful! Image will be saved with donor.';
      statusText.style.color = '#28a745';
    }
    if (spinner) spinner.style.display = 'none';

    setTimeout(() => {
      if (uploadStatus) uploadStatus.style.display = 'none';
    }, 3000);

    return imageUrl;
  };

  fileInput.addEventListener('change', async function(event) {
    const file = event.target.files[0];
    
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file');
      fileInput.value = '';
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      alert('File size should not exceed 5MB');
      fileInput.value = '';
      return;
    }

    try {
      uploadPromise = uploadSelectedImage(file);
      await uploadPromise;
    } catch (error) {
      console.error('Upload error:', error);
      
      // Show error status
      if (statusText) {
        statusText.textContent = `Upload failed: ${error.message}`;
        statusText.style.color = '#dc3545';
      }
      if (spinner) spinner.style.display = 'none';

      // Reset file input
      fileInput.value = '';
      imageHiddenInput.value = '';

      // Clear error status after 5 seconds
      setTimeout(() => {
        if (uploadStatus) uploadStatus.style.display = 'none';
      }, 5000);
    } finally {
      uploadInProgress = false;
      setSubmittingState(false);
    }
  });

  if (donorForm) {
    donorForm.addEventListener('submit', handleDonorFormSubmit);
  }
});

async function handleDonorFormSubmit(event) {
  event.preventDefault();
  
  const fileInput = document.getElementById('donorImage');
  const imageHiddenInput = document.getElementById('image');
  const donorForm = fileInput?.closest('form');
  
  if (!donorForm) return;

  let uploadInProgress = false;

  if (uploadInProgress) {
    return;
  }

  const selectedFile = fileInput.files?.[0];
  const imageValue = imageHiddenInput?.value?.trim();

  if (selectedFile && !imageValue) {
    await handleImageUploadBeforeSubmit(selectedFile, donorForm);
    if (!imageHiddenInput?.value?.trim()) {
      return;
    }
  }

  await submitDonorForm(donorForm);
}

async function handleImageUploadBeforeSubmit(selectedFile, donorForm) {
  const submitButton = donorForm?.querySelector('button[type="submit"]');
  
  try {
    if (submitButton) {
      submitButton.disabled = true;
    }
    
    const formData = new FormData();
    formData.append('file', selectedFile);

    const response = await fetch('/api/files/upload', {
      method: 'POST',
      body: formData,
    });

    const result = await response.json();
    if (!response.ok) throw new Error(result.message || 'Upload failed');

    const uploadedFile = Array.isArray(result.data) ? result.data[0] : result.data;
    const imageUrl = uploadedFile?.url || uploadedFile?.cloudinaryUrl;
    if (!imageUrl) throw new Error('Upload succeeded but no image URL returned');

    document.getElementById('image').value = imageUrl;
  } catch (error) {
    console.error('Upload before submit failed:', error);
    if (typeof showError === 'function') {
      showError(error.message);
    }
  } finally {
    if (submitButton) {
      submitButton.disabled = false;
    }
  }
}

async function submitDonorForm(donorForm) {
  const submitButton = donorForm?.querySelector('button[type="submit"]');
  
  try {
    if (submitButton) {
      submitButton.disabled = true;
    }
    
    const formData = new FormData(donorForm);
    const method = donorForm.getAttribute('method')?.toUpperCase() || 'POST';
    const action = donorForm.getAttribute('action');

    const response = await fetch(action, {
      method: method,
      body: formData,
      headers: method === 'PUT' ? { 'X-HTTP-Method-Override': 'PUT' } : {}
    });

    const result = await response.json();

    if (!response.ok) {
      if (typeof showError === 'function') {
        showError(result.message || `Error: ${response.status} ${response.statusText}`);
      }
      return;
    }

    if (typeof showSuccess === 'function') {
      showSuccess(result.message || 'Donor saved successfully');
    }

    setTimeout(() => {
      globalThis.location.href = '/donors';
    }, 1500);
  } catch (error) {
    console.error('Form submission error:', error);
    if (typeof showError === 'function') {
      showError(error.message || 'Failed to save donor');
    }
  } finally {
    if (submitButton) {
      submitButton.disabled = false;
    }
  }
}

// Show preview if image already exists (edit mode)
document.addEventListener('DOMContentLoaded', function() {
  const imageHiddenInput = document.getElementById('image');
  const imagePreview = document.getElementById('imagePreview');
  
  if (imageHiddenInput?.value && imagePreview) {
    const imgElement = imagePreview.querySelector('img');
    imgElement.src = imageHiddenInput.value;
    imagePreview.style.display = 'block';
  }
});
