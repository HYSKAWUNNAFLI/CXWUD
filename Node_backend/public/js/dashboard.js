// Loading spinner functions
function showLoading() {
  const spinner = document.createElement('div');
  spinner.className = 'loading-spinner';
  spinner.innerHTML = `
    <div class="loading-spinner-content">
      <i class="fas fa-spinner fa-spin"></i>
      <p>Processing...</p>
    </div>
  `;
  document.body.appendChild(spinner);
  spinner.style.display = 'block';
}

function hideLoading() {
  const spinner = document.querySelector('.loading-spinner');
  if (spinner) {
    spinner.remove();
  }
}

// File upload handling
document.addEventListener('DOMContentLoaded', function() {
  const uploadArea = document.querySelector('.upload-area');
  const fileInput = document.getElementById('meeting_file');

  if (uploadArea && fileInput) {
    // Handle drag and drop
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
      uploadArea.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
      e.preventDefault();
      e.stopPropagation();
    }

    ['dragenter', 'dragover'].forEach(eventName => {
      uploadArea.addEventListener(eventName, highlight, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
      uploadArea.addEventListener(eventName, unhighlight, false);
    });

    function highlight(e) {
      uploadArea.classList.add('border-primary');
    }

    function unhighlight(e) {
      uploadArea.classList.remove('border-primary');
    }

    uploadArea.addEventListener('drop', handleDrop, false);

    function handleDrop(e) {
      const dt = e.dataTransfer;
      const files = dt.files;
      fileInput.files = files;
      updateFileName(files[0].name);
    }

    // Handle file selection
    fileInput.addEventListener('change', function() {
      if (this.files.length > 0) {
        updateFileName(this.files[0].name);
      }
    });
  }
});

function updateFileName(fileName) {
  const uploadArea = document.querySelector('.upload-area');
  if (uploadArea) {
    const fileNameElement = uploadArea.querySelector('p');
    if (fileNameElement) {
      fileNameElement.textContent = `Selected file: ${fileName}`;
    }
  }
}

// Error handling
function showError(message) {
  const alertDiv = document.createElement('div');
  alertDiv.className = 'alert alert-danger alert-dismissible fade show';
  alertDiv.innerHTML = `
    ${message}
    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
  `;
  
  const container = document.querySelector('.container');
  container.insertBefore(alertDiv, container.firstChild);
  
  // Auto dismiss after 5 seconds
  setTimeout(() => {
    alertDiv.remove();
  }, 5000);
}

// Success message
function showSuccess(message) {
  const alertDiv = document.createElement('div');
  alertDiv.className = 'alert alert-success alert-dismissible fade show';
  alertDiv.innerHTML = `
    ${message}
    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
  `;
  
  const container = document.querySelector('.container');
  container.insertBefore(alertDiv, container.firstChild);
  
  // Auto dismiss after 3 seconds
  setTimeout(() => {
    alertDiv.remove();
  }, 3000);
}

// Dashboard specific functionality
document.addEventListener('DOMContentLoaded', function() {
    // Initialize dashboard charts if they exist
    initializeCharts();
    
    // Initialize task filters
    initializeTaskFilters();
    
    // Initialize meeting filters
    initializeMeetingFilters();
    
    // Initialize quick action buttons
    initializeQuickActions();
});

// Initialize dashboard charts
function initializeCharts() {
    // Task completion chart
    var taskChart = document.getElementById('taskCompletionChart');
    if (taskChart) {
        new Chart(taskChart, {
            type: 'doughnut',
            data: {
                labels: ['Completed', 'In Progress', 'Pending'],
                datasets: [{
                    data: taskChart.dataset.data.split(',').map(Number),
                    backgroundColor: [
                        'rgba(40, 167, 69, 0.8)',
                        'rgba(255, 193, 7, 0.8)',
                        'rgba(108, 117, 125, 0.8)'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
    }
    
    // Meeting attendance chart
    var attendanceChart = document.getElementById('meetingAttendanceChart');
    if (attendanceChart) {
        new Chart(attendanceChart, {
            type: 'bar',
            data: {
                labels: JSON.parse(attendanceChart.dataset.labels),
                datasets: [{
                    label: 'Attendance Rate',
                    data: JSON.parse(attendanceChart.dataset.data),
                    backgroundColor: 'rgba(13, 110, 253, 0.8)'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100
                    }
                }
            }
        });
    }
}

// Initialize task filters
function initializeTaskFilters() {
    var taskFilter = document.getElementById('taskFilter');
    if (taskFilter) {
        taskFilter.addEventListener('change', function() {
            var status = this.value;
            var tasks = document.querySelectorAll('.task-card');
            
            tasks.forEach(function(task) {
                if (status === 'all' || task.dataset.status === status) {
                    task.style.display = 'block';
                } else {
                    task.style.display = 'none';
                }
            });
        });
    }
}

// Initialize meeting filters
function initializeMeetingFilters() {
    var meetingFilter = document.getElementById('meetingFilter');
    if (meetingFilter) {
        meetingFilter.addEventListener('change', function() {
            var filter = this.value;
            var meetings = document.querySelectorAll('.meeting-card');
            
            meetings.forEach(function(meeting) {
                if (filter === 'all' || meeting.dataset.filter === filter) {
                    meeting.style.display = 'block';
                } else {
                    meeting.style.display = 'none';
                }
            });
        });
    }
}

// Initialize quick action buttons
function initializeQuickActions() {
    // New meeting button
    var newMeetingBtn = document.getElementById('newMeetingBtn');
    if (newMeetingBtn) {
        newMeetingBtn.addEventListener('click', function() {
            window.location.href = '/meetings/new';
        });
    }
    
    // New task button
    var newTaskBtn = document.getElementById('newTaskBtn');
    if (newTaskBtn) {
        newTaskBtn.addEventListener('click', function() {
            window.location.href = '/tasks/new';
        });
    }
    
    // Upload minutes button
    var uploadMinutesBtn = document.getElementById('uploadMinutesBtn');
    if (uploadMinutesBtn) {
        uploadMinutesBtn.addEventListener('click', function() {
            var modal = new bootstrap.Modal(document.getElementById('uploadMinutesModal'));
            modal.show();
        });
    }
}

// Handle file upload preview
document.addEventListener('DOMContentLoaded', function() {
    var fileInput = document.getElementById('minutesFile');
    if (fileInput) {
        fileInput.addEventListener('change', function() {
            var fileName = this.files[0]?.name;
            var fileLabel = document.querySelector('.custom-file-label');
            if (fileLabel) {
                fileLabel.textContent = fileName || 'Choose file';
            }
        });
    }
});

// Handle task status updates
document.addEventListener('DOMContentLoaded', function() {
    var statusSelects = document.querySelectorAll('.task-status-select');
    statusSelects.forEach(function(select) {
        select.addEventListener('change', function() {
            var taskId = this.dataset.taskId;
            var newStatus = this.value;
            
            fetch(`/api/tasks/${taskId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status: newStatus })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Update UI to reflect new status
                    var taskCard = this.closest('.task-card');
                    if (taskCard) {
                        taskCard.dataset.status = newStatus;
                        taskCard.querySelector('.status-badge').className = 
                            'status-badge badge bg-' + getStatusColor(newStatus);
                    }
                }
            })
            .catch(error => console.error('Error:', error));
        });
    });
});

// Helper function to get status color
function getStatusColor(status) {
    switch (status) {
        case 'completed':
            return 'success';
        case 'in_progress':
            return 'warning';
        case 'pending':
            return 'secondary';
        default:
            return 'primary';
    }
} 