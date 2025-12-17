// Pricing Comparison Animations - Optimized with Enhanced Add to Cart
(function() {
  'use strict';

  // Check if user prefers reduced motion
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  if (prefersReducedMotion) {
    document.querySelectorAll('[data-animate]').forEach(el => {
      el.classList.add('animated');
    });
  } else {
    // [Previous animation code remains the same]
    const observerOptions = {
      threshold: 0.05,
      rootMargin: '100px 0px 0px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const element = entry.target;
          const delay = element.dataset.delay || 0;
          const optimizedDelay = Math.min(parseInt(delay), 600);
          
          setTimeout(() => {
            element.classList.add('animated');
            if (element.dataset.animate === 'slide-in') {
              setTimeout(() => animateIcons(element), 200);
            }
          }, optimizedDelay / 2);
          
          observer.unobserve(element);
        }
      });
    }, observerOptions);

    document.querySelectorAll('[data-animate]').forEach(el => {
      observer.observe(el);
    });

    function animateIcons(row) {
      const icons = row.querySelectorAll('.check-icon, .cross-icon');
      icons.forEach((icon, index) => {
        setTimeout(() => {
          icon.style.transform = 'scale(1.15)';
          setTimeout(() => {
            icon.style.transform = 'scale(1)';
          }, 150);
        }, index * 50);
      });
    }

    const featureRows = document.querySelectorAll('.comparison-table > div[data-animate="slide-in"]');
    featureRows.forEach(row => {
      row.addEventListener('mouseenter', function() {
        if (this.classList.contains('animated')) {
          this.style.transform = 'translateX(5px)';
        }
      });
      
      row.addEventListener('mouseleave', function() {
        if (this.classList.contains('animated')) {
          this.style.transform = 'translateX(0)';
        }
      });
    });
  }

  // Enhanced CTA Button - Add to Cart and Checkout functionality
  function handleCTAClick(event) {
    const ctaButton = event.currentTarget;
    const addToCartButton = document.querySelector('.add-to-cart-button');
    
    if (!addToCartButton) {
      console.warn('Add to cart button not found with class .add-to-cart-button');
      return; // Let default link behavior happen
    }

    // Prevent default link behavior
    event.preventDefault();
    
    // Disable CTA button to prevent multiple clicks
    ctaButton.style.pointerEvents = 'none';
    ctaButton.style.opacity = '0.7';
    
    // Store original button text
    const originalText = ctaButton.textContent;
    
    // Update button text to show processing
    ctaButton.textContent = 'Adding to cart...';
    
    // Add visual feedback
    ctaButton.style.transform = 'scale(0.95)';
    setTimeout(() => {
      ctaButton.style.transform = 'scale(1)';
    }, 200);
    
    // Trigger the add to cart button click
    addToCartButton.click();
    
    // Listen for cart update (if your theme dispatches custom events)
    const cartUpdateHandler = () => {
      ctaButton.textContent = 'Proceeding to checkout...';
      proceedToCheckout();
    };
    
    // Fallback: Wait for add to cart to complete
    setTimeout(() => {
      ctaButton.textContent = 'Proceeding to checkout...';
      
      // Show countdown (optional)
      let countdown = 3;
      const countdownInterval = setInterval(() => {
        countdown--;
        if (countdown > 0) {
          ctaButton.textContent = `Proceeding to checkout in ${countdown}...`;
        } else {
          clearInterval(countdownInterval);
        }
      }, 1000);
      
      // Redirect to checkout after 3 seconds
      setTimeout(() => {
        proceedToCheckout();
      }, 3000);
    }, 500); // Wait 500ms for add to cart to process
  }

  // Proceed to checkout function
  function proceedToCheckout() {
    // You can customize the checkout URL if needed
    window.location.href = '/checkout';
    
    // Alternative: Direct to cart first
    // window.location.href = '/cart';
  }

  // Attach event listener to CTA button in pricing comparison section
  function initCTAHandler() {
    const pricingSection = document.querySelector('.pricing-comparison-section');
    if (!pricingSection) return;
    
    const ctaButton = pricingSection.querySelector('[data-animate="fade-up"] a');
    if (ctaButton) {
      ctaButton.addEventListener('click', handleCTAClick);
      console.log('CTA handler attached to pricing comparison button');
    }
  }

  // Initialize CTA handler on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCTAHandler);
  } else {
    initCTAHandler();
  }

})();