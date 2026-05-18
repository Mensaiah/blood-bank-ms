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
    donorForm.addEventListener('submit', async function(event) {
      if (uploadInProgress) {
        event.preventDefault();
        return;
      }

      const selectedFile = fileInput.files?.[0];
      const imageValue = imageHiddenInput?.value?.trim();

      if (selectedFile && !imageValue) {
        event.preventDefault();

        try {
          setSubmittingState(true);
          await (uploadPromise || uploadSelectedImage(selectedFile));
          donorForm.requestSubmit();
        } catch (error) {
          console.error('Upload before submit failed:', error);
        } finally {
          setSubmittingState(false);
        }
      }
    });
  }

  // Show preview if image already exists (edit mode)
  if (imageHiddenInput?.value && imagePreview) {
    const imgElement = imagePreview.querySelector('img');
    imgElement.src = imageHiddenInput.value;
    imagePreview.style.display = 'block';
  }
});
