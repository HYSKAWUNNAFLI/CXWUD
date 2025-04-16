// Profile page functionality
document.addEventListener('DOMContentLoaded', function() {
    // Initialize password strength meter
    initializePasswordStrengthMeter();
    
    // Initialize form validation
    initializeFormValidation();
    
    // Initialize avatar upload
    initializeAvatarUpload();
    
    // Initialize activity timeline
    initializeActivityTimeline();
});

// Initialize password strength meter
function initializePasswordStrengthMeter() {
    var passwordInputs = document.querySelectorAll('input[type="password"]');
    passwordInputs.forEach(function(input) {
        input.addEventListener('input', function() {
            var password = this.value;
            var strength = 0;
            
            // Length check
            if (password.length >= 8) strength++;
            
            // Contains number
            if (/\d/.test(password)) strength++;
            
            // Contains lowercase
            if (/[a-z]/.test(password)) strength++;
            
            // Contains uppercase
            if (/[A-Z]/.test(password)) strength++;
            
            // Contains special character
            if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++;
            
            // Update strength indicator
            var strengthIndicator = this.parentElement.querySelector('.password-strength');
            if (strengthIndicator) {
                strengthIndicator.className = 'password-strength strength-' + strength;
            }
        });
    });
}

// Initialize form validation
function initializeFormValidation() {
    var forms = document.querySelectorAll('.profile-form');
    forms.forEach(function(form) {
        form.addEventListener('submit', function(event) {
            if (!form.checkValidity()) {
                event.preventDefault();
                event.stopPropagation();
            }
            form.classList.add('was-validated');
        });
    });
}

// Initialize avatar upload
function initializeAvatarUpload() {
    var avatarInput = document.getElementById('avatarInput');
    var avatarPreview = document.getElementById('avatarPreview');
    
    if (avatarInput && avatarPreview) {
        avatarInput.addEventListener('change', function() {
            var file = this.files[0];
            if (file) {
                // Validate file type
                if (!file.type.match('image.*')) {
                    alert('Please select an image file');
                    return;
                }
                
                // Validate file size (max 5MB)
                if (file.size > 5 * 1024 * 1024) {
                    alert('File size must be less than 5MB');
                    return;
                }
                
                var reader = new FileReader();
                reader.onload = function(e) {
                    avatarPreview.src = e.target.result;
                }
                reader.readAsDataURL(file);
            }
        });
    }
}

// Initialize activity timeline
function initializeActivityTimeline() {
    var timeline = document.querySelector('.activity-timeline');
    if (timeline) {
        // Add animation to timeline items
        var items = timeline.querySelectorAll('.activity-item');
        items.forEach(function(item, index) {
            item.style.opacity = '0';
            item.style.transform = 'translateX(-20px)';
            
            setTimeout(function() {
                item.style.transition = 'all 0.3s ease';
                item.style.opacity = '1';
                item.style.transform = 'translateX(0)';
            }, index * 100);
        });
    }
}

// Handle profile update
document.addEventListener('DOMContentLoaded', function() {
    var profileForm = document.getElementById('profileForm');
    if (profileForm) {
        profileForm.addEventListener('submit', function(event) {
            event.preventDefault();
            
            var formData = new FormData(this);
            
            fetch('/users/profile', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    showAlert('success', 'Profile updated successfully');
                } else {
                    showAlert('danger', data.message || 'Error updating profile');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                showAlert('danger', 'Error updating profile');
            });
        });
    }
});

// Handle password change
document.addEventListener('DOMContentLoaded', function() {
    var passwordForm = document.getElementById('passwordForm');
    if (passwordForm) {
        passwordForm.addEventListener('submit', function(event) {
            event.preventDefault();
            
            var formData = new FormData(this);
            
            fetch('/users/change-password', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    showAlert('success', 'Password changed successfully');
                    passwordForm.reset();
                } else {
                    showAlert('danger', data.message || 'Error changing password');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                showAlert('danger', 'Error changing password');
            });
        });
    }
});

// Show alert message
function showAlert(type, message) {
    var alertContainer = document.getElementById('alertContainer');
    if (alertContainer) {
        var alert = document.createElement('div');
        alert.className = `alert alert-${type} alert-dismissible fade show`;
        alert.role = 'alert';
        alert.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;
        
        alertContainer.appendChild(alert);
        
        // Auto-hide after 5 seconds
        setTimeout(function() {
            alert.classList.remove('show');
            setTimeout(function() {
                alert.remove();
            }, 150);
        }, 5000);
    }
} 