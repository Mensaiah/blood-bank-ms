document.addEventListener('DOMContentLoaded', function() {
  const form = document.getElementById('createDonationForm');
  if (!form) return;

  const submitBtn = document.getElementById('createDonationSubmit');
  const donorSearch = document.getElementById('donorSearch');
  const donorIdInput = document.getElementById('donorId');
  const donorSearchResults = document.getElementById('donorSearchResults');

  const setSubmitting = (isSubmitting) => {
    if (!submitBtn) return;
    submitBtn.disabled = isSubmitting;
    submitBtn.dataset.originalText = submitBtn.dataset.originalText || submitBtn.innerHTML;
    submitBtn.innerHTML = isSubmitting ? 'Creating...' : (submitBtn.dataset.originalText || 'Create Donation');
  };

  const disableForm = () => {
    Array.from(form.elements).forEach((el) => {
      el.disabled = true;
    });
  };

  const setSelectedDonor = (donorLabel, donorId) => {
    if (donorSearch) {
      donorSearch.value = donorLabel;
    }

    if (donorIdInput) {
      donorIdInput.value = donorId;
    }

    if (donorSearchResults) {
      donorSearchResults.innerHTML = '';
    }
  };

  if (donorSearchResults) {
    donorSearchResults.addEventListener('click', function(event) {
      const donorItem = event.target.closest('.donor-search-item');
      if (!donorItem) return;

      const donorLabel = donorItem.dataset.donorLabel || '';
      const donorId = donorItem.dataset.donorId || '';
      setSelectedDonor(donorLabel, donorId);
    });
  }

  if (donorSearch) {
    donorSearch.addEventListener('input', function() {
      if (donorIdInput) {
        donorIdInput.value = '';
      }
    });
  }

  form.addEventListener('submit', async function(e) {
    e.preventDefault();

    const data = new FormData(form);
    const payload = {};
    data.forEach((v, k) => { payload[k] = v; });

    delete payload.searchText;

    if (!payload.donorId) {
      if (typeof showError === 'function') showError('Please select a donor from the search results');
      setSubmitting(false);
      return;
    }

    // convert datetime-local to ISO
    if (payload.donationDate) {
      payload.donationDate = new Date(payload.donationDate).toISOString();
    }

    setSubmitting(true);

    try {
      const res = await fetch('/api/donations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (!res.ok) {
        if (typeof showError === 'function') showError(result?.message || 'Failed to create donation');
        setSubmitting(false);
        return;
      }

      if (typeof showSuccess === 'function') showSuccess('Donation created successfully');

      // Disable form so it cannot be edited after creation
      disableForm();

      // Optionally redirect to donor page after a short delay
      const donorId = result?.data?.donorId || payload.donorId;
      setTimeout(() => {
        if (donorId) {
          globalThis.location.href = `/donors/${donorId}`;
        } else if (result?.data?._id) {
          globalThis.location.href = `/donations/${result.data._id}`;
        } else {
          setSubmitting(false);
        }
      }, 1200);

    } catch (err) {
      if (typeof showError === 'function') showError(err.message || 'Network error');
      setSubmitting(false);
    }
  });
});
