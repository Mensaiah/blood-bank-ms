/**
 * Alert Notification Helper
 * Displays dismissible alert toasts at the top of the page
 */

function showAlert(message, type = 'error', duration = 5000) {
  const alertContainer = document.getElementById('alert-container');
  
  if (!alertContainer) {
    console.error('Alert container not found');
    return;
  }

  const alertId = `alert-${Date.now()}`;
  const bgClass = {
    error: 'bg-danger',
    success: 'bg-success',
    warning: 'bg-warning',
    info: 'bg-info'
  }[type] || 'bg-danger';

  const textClass = type === 'warning' ? 'text-dark' : 'text-white';

  const alertElement = document.createElement('div');
  alertElement.id = alertId;
  alertElement.className = `alert ${bgClass} ${textClass} alert-dismissible fade show`;
  alertElement.setAttribute('role', 'alert');
  alertElement.style.marginBottom = '12px';
  alertElement.innerHTML = `
    <strong>${type.charAt(0).toUpperCase() + type.slice(1)}!</strong> ${message}
    <button type="button" class="btn-close ${type === 'warning' ? 'btn-close-dark' : ''}" data-bs-dismiss="alert" aria-label="Close"></button>
  `;

  alertContainer.appendChild(alertElement);

  const dismissAlert = () => {
    const currentAlert = document.getElementById(alertId);
    if (!currentAlert) {
      return;
    }

    currentAlert.classList.remove('show');
    currentAlert.classList.add('hide');

    setTimeout(() => {
      currentAlert.remove();
    }, 150);
  };

  if (duration > 0) {
    setTimeout(() => {
      dismissAlert();
    }, duration);
  }
}

function showError(message, duration = 2000) {
  showAlert(message, 'error', duration);
}

function showSuccess(message, duration = 2000) {
  showAlert(message, 'success', duration);
}

function showWarning(message, duration = 2000) {
  showAlert(message, 'warning', duration);
}

function showInfo(message, duration = 2000) {
  showAlert(message, 'info', duration);
}
