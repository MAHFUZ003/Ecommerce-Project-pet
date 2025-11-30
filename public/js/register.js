
document.addEventListener('DOMContentLoaded', function() {
    const registerForm = document.getElementById('registerForm');
    const floatingMessage = document.getElementById('floatingMessage');

    registerForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = {
            email: document.getElementById('email').value,
            password: document.getElementById('password').value,
            confirmPassword: document.getElementById('confirm-password').value,
            termsAccepted: document.getElementById('terms').checked
        };

        if (!validateForm(formData)) return;
        registerUser(formData);
    });

    function validateForm(formData) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            showMessage('Please enter a valid email address', 'error');
            return false;
        }

        if (formData.password.length < 8) {
            showMessage('Password must be at least 8 characters long', 'error');
            return false;
        }

        if (formData.password !== formData.confirmPassword) {
            showMessage('Passwords do not match', 'error');
            return false;
        }

        if (!formData.termsAccepted) {
            showMessage('Please accept the terms and conditions', 'error');
            return false;
        }

        return true;
    }

    async function registerUser(userData) {
        try {
            const response = await fetch('/api/v1/users', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    email: userData.email,
                    password: userData.password
                })
            });

            const data = await response.json();

            if (data.error) {
                showMessage(data.message, 'error');
                return;
            }
            
            showMessage('Account created successfully! Redirecting to login...', 'success');
            
            setTimeout(() => {
                window.location.href = '/login/';
            }, 2000);

        } catch (error) {
            console.error('Error:', error);
            showMessage('Failed to create account. Please try again.', 'error');
        }
    }

    function showMessage(message, type) {
        const bgColor = type === 'success' ? 'bg-green-500' : 
                       type === 'error' ? 'bg-red-500' : 'bg-blue-500';
        
        floatingMessage.classList.remove('bg-green-500', 'bg-red-500', 'bg-blue-500');
        floatingMessage.classList.add(bgColor);
        
        floatingMessage.textContent = message;
        floatingMessage.classList.remove('translate-x-full', 'opacity-0');
        floatingMessage.classList.add('translate-x-0', 'opacity-100');
        
        setTimeout(() => {
            floatingMessage.classList.remove('translate-x-0', 'opacity-100');
            floatingMessage.classList.add('translate-x-full', 'opacity-0');
        }, 3000);
    }
});
