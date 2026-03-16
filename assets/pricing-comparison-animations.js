// Pricing Comparison Animations - Optimized with Clear Cart & Add to Cart
(function() {
  'use strict';

  // Check if user prefers reduced motion
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  if (prefersReducedMotion) {
    document.querySelectorAll('[data-animate]').forEach(el => {
      el.classList.add('animated');
    });
  } else {
    // Intersection Observer for scroll animations
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

  // SharedSweeps - Set cart attributes from URL params
  async function setSharedSweepsCartAttributes() {
    var params = new URLSearchParams(window.location.search);
    var ref = params.get('ref');
    var orderId = params.get('order_id');

    if (!ref && !orderId) return;

    var attributes = {};
    if (ref) attributes['ss_ref'] = ref;
    if (orderId) attributes['ss_order_id'] = orderId;

    try {
      const res = await fetch('/cart/update.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ attributes: attributes }),
      });
      const data = await res.json();
      console.log('[SharedSweeps] Cart attributes set:', data.attributes);
    } catch (err) {
      console.error('[SharedSweeps] Failed to set cart attributes:', err);
    }
  }

  setSharedSweepsCartAttributes();

  // Clear Cart Function - Enhanced with better debugging
  async function clearCart() {
    console.log('🛒 Starting cart clear process...');
    
    try {
      // First, check what's in the cart
      const cartCheckResponse = await fetch('/cart.js');
      const currentCart = await cartCheckResponse.json();
      console.log('📦 Current cart:', currentCart);
      
      if (!currentCart.items || currentCart.items.length === 0) {
        console.log('✓ Cart is already empty');
        return true;
      }
      
      console.log(`🗑️ Cart has ${currentCart.items.length} items, clearing...`);
      
      // Method 1: Try /cart/clear endpoint
      try {
        const clearResponse = await fetch('/cart/clear', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });
        
        console.log('Clear response status:', clearResponse.status);
        
        if (clearResponse.ok || clearResponse.status === 303 || clearResponse.status === 302) {
          console.log('✅ Cart cleared via /cart/clear');
          
          // Verify cart is empty
          const verifyResponse = await fetch('/cart.js');
          const verifiedCart = await verifyResponse.json();
          console.log('✓ Verified cart after clear:', verifiedCart);
          
          return true;
        }
      } catch (clearError) {
        console.log('⚠️ /cart/clear failed, trying alternate method:', clearError);
      }
      
      // Method 2: Update all items to quantity 0
      console.log('🔄 Using update method to clear cart...');
      const updates = {};
      currentCart.items.forEach(item => {
        updates[item.key] = 0;
      });
      
      console.log('Updates to apply:', updates);
      
      const updateResponse = await fetch('/cart/update.js', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ updates })
      });
      
      const updateResult = await updateResponse.json();
      console.log('Update result:', updateResult);
      
      if (updateResponse.ok) {
        console.log('✅ Cart cleared via /cart/update.js');
        return true;
      }
      
      // Method 3: Use change.js for each item
      console.log('🔄 Trying change.js method...');
      for (const item of currentCart.items) {
        try {
          await fetch('/cart/change.js', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              id: item.key,
              quantity: 0
            })
          });
        } catch (e) {
          console.log('⚠️ Change failed for item:', item.key);
        }
      }
      
      console.log('✅ Cart cleared via change.js');
      return true;
      
    } catch (error) {
      console.error('❌ Error clearing cart:', error);
      return false;
    }
  }

  // Enhanced CTA Button Handler (for all CTA buttons)
  async function handleCTAClick(event) {
    event.preventDefault();
    
    const ctaButton = event.currentTarget;
    console.log('🔘 CTA button clicked:', ctaButton.textContent.trim());
    
    // Find the add to cart form
    const form = document.querySelector('form[action="/cart/add"]');
    
    if (!form) {
      console.error('❌ Add to cart form not found');
      return;
    }

    // Disable button
    ctaButton.style.pointerEvents = 'none';
    ctaButton.style.opacity = '0.7';
    const originalText = ctaButton.textContent;
    
    // Step 1: Clear cart
    console.log('📝 Step 1: Clearing cart...');
    ctaButton.textContent = 'Clearing cart...';
    ctaButton.style.transform = 'scale(0.95)';
    setTimeout(() => {
      ctaButton.style.transform = 'scale(1)';
    }, 200);
    
    const cartCleared = await clearCart();
    
    if (!cartCleared) {
      console.error('❌ Failed to clear cart');
      ctaButton.textContent = 'Error clearing cart';
      setTimeout(() => {
        ctaButton.textContent = originalText;
        ctaButton.style.pointerEvents = 'auto';
        ctaButton.style.opacity = '1';
      }, 2000);
      return;
    }
    
    // Step 2: Add to cart via Ajax
    console.log('📝 Step 2: Adding to cart...');
    await new Promise(resolve => setTimeout(resolve, 500));
    ctaButton.textContent = 'Adding to cart...';
    
    const formData = new FormData(form);
    
    try {
      const response = await fetch('/cart/add.js', {
        method: 'POST',
        headers: {
          'Accept': 'application/json'
        },
        body: formData
      });
      
      const result = await response.json();
      console.log('✓ Add to cart result:', result);
      
      if (!response.ok) {
        throw new Error('Failed to add to cart');
      }
      
      console.log('✅ Product added successfully');
      
      // Step 3: Proceed to checkout
      console.log('📝 Step 3: Proceeding to checkout...');
      ctaButton.textContent = 'Proceeding to checkout...';
      
      let countdown = 2;
      const countdownInterval = setInterval(() => {
        countdown--;
        if (countdown > 0) {
          ctaButton.textContent = `Redirecting in ${countdown}...`;
        } else {
          clearInterval(countdownInterval);
        }
      }, 1000);
      
      setTimeout(() => {
        console.log('🚀 Redirecting to checkout');
        window.location.href = '/checkout';
      }, 2000);
      
    } catch (error) {
      console.error('❌ Error adding to cart:', error);
      ctaButton.textContent = 'Error - Try again';
      setTimeout(() => {
        ctaButton.textContent = originalText;
        ctaButton.style.pointerEvents = 'auto';
        ctaButton.style.opacity = '1';
      }, 2000);
    }
  }

  // Direct Add to Cart Form Handler - Clear cart first, then submit
  async function handleDirectFormSubmit(event) {
    const form = event.currentTarget;
    
    // Check if cart clear is already in progress
    if (form.dataset.clearingCart === 'true') {
      console.log('⏳ Cart clear already in progress, skipping...');
      return;
    }
    
    // Prevent default form submission
    event.preventDefault();
    event.stopPropagation();
    
    console.log('📝 Direct add to cart form submission - clearing cart first');
    
    // Mark as processing
    form.dataset.clearingCart = 'true';
    
    // Find the button to update its text
    const button = form.querySelector('button[type="submit"]');
    const originalButtonText = button ? button.querySelector('.add-to-cart-text__content span span')?.textContent : null;
    
    if (button) {
      const textSpan = button.querySelector('.add-to-cart-text__content span span');
      if (textSpan) {
        textSpan.textContent = 'Clearing cart...';
      }
      button.style.opacity = '0.7';
      button.style.pointerEvents = 'none';
    }
    
    // Clear the cart
    const cartCleared = await clearCart();
    
    if (!cartCleared) {
      console.error('❌ Failed to clear cart');
      if (button) {
        const textSpan = button.querySelector('.add-to-cart-text__content span span');
        if (textSpan) {
          textSpan.textContent = 'Error - Try again';
        }
        setTimeout(() => {
          if (textSpan && originalButtonText) {
            textSpan.textContent = originalButtonText;
          }
          button.style.opacity = '1';
          button.style.pointerEvents = 'auto';
          form.dataset.clearingCart = 'false';
        }, 2000);
      }
      return;
    }
    
    // Update button text
    if (button) {
      const textSpan = button.querySelector('.add-to-cart-text__content span span');
      if (textSpan) {
        textSpan.textContent = 'Adding...';
      }
    }
    
    // Wait a moment, then submit the form
    await new Promise(resolve => setTimeout(resolve, 400));
    
    // Remove the flag
    form.dataset.clearingCart = 'false';
    
    // Submit the form via Ajax
    const formData = new FormData(form);
    
    try {
      const response = await fetch('/cart/add.js', {
        method: 'POST',
        headers: {
          'Accept': 'application/json'
        },
        body: formData
      });
      
      const result = await response.json();
      console.log('✓ Add to cart result:', result);
      
      if (response.ok) {
        console.log('✅ Product added to cart successfully');
        
        if (button) {
          const textSpan = button.querySelector('.add-to-cart-text__content span span');
          if (textSpan) {
            textSpan.textContent = 'Redirecting...';
          }
        }
        
        // Redirect to checkout after 1 second
        setTimeout(() => {
          console.log('🚀 Redirecting to checkout');
          window.location.href = '/checkout';
        }, 1000);
      } else {
        console.error('❌ Failed to add to cart:', result);
        if (button) {
          const textSpan = button.querySelector('.add-to-cart-text__content span span');
          if (textSpan && originalButtonText) {
            textSpan.textContent = originalButtonText;
          }
          button.style.opacity = '1';
          button.style.pointerEvents = 'auto';
        }
      }
    } catch (error) {
      console.error('❌ Error adding to cart:', error);
      if (button) {
        const textSpan = button.querySelector('.add-to-cart-text__content span span');
        if (textSpan && originalButtonText) {
          textSpan.textContent = originalButtonText;
        }
        button.style.opacity = '1';
        button.style.pointerEvents = 'auto';
      }
    }
  }

  // Attach handlers with retry logic
  let attachAttempts = 0;
  const maxAttempts = 10;
  
  function attachHandlers() {
    attachAttempts++;
    console.log(`🔧 Attempting to attach handlers (attempt ${attachAttempts}/${maxAttempts})`);
    
    // Find ALL CTA buttons with class .cta-action-btn
    const ctaButtons = document.querySelectorAll('.cta-action-btn');
    console.log(`🔍 Found ${ctaButtons.length} CTA button(s) with class .cta-action-btn`);
    
    ctaButtons.forEach((ctaButton, index) => {
      if (!ctaButton.dataset.handlerAttached) {
        ctaButton.addEventListener('click', handleCTAClick);
        ctaButton.dataset.handlerAttached = 'true';
        console.log(`✅ CTA button #${index + 1} (.cta-action-btn) handler attached - "${ctaButton.textContent.trim()}"`);
      }
    });
    
    // Also handle pricing comparison section CTA (backup selector)
    const pricingSection = document.querySelector('.pricing-comparison-section');
    if (pricingSection) {
      const pricingCtaButton = pricingSection.querySelector('[data-animate="fade-up"] a:not([data-handler-attached])');
      if (pricingCtaButton && !pricingCtaButton.dataset.handlerAttached) {
        pricingCtaButton.addEventListener('click', handleCTAClick);
        pricingCtaButton.dataset.handlerAttached = 'true';
        console.log('✅ Pricing section CTA handler attached (backup)');
      }
    }
    
    // Premium community section CTA (backup selector)
    const premiumSection = document.querySelector('.premium-community-section');
    if (premiumSection) {
      const premiumCtaButton = premiumSection.querySelector('[data-animate="fade-up"] a:not([data-handler-attached]), a[data-cta-pulse]:not([data-handler-attached])');
      if (premiumCtaButton && !premiumCtaButton.dataset.handlerAttached) {
        premiumCtaButton.addEventListener('click', handleCTAClick);
        premiumCtaButton.dataset.handlerAttached = 'true';
        console.log('✅ Premium Community CTA handler attached (backup)');
      }
    }
    
    // Find ALL add to cart forms on the page
    const forms = document.querySelectorAll('form[action="/cart/add"]');
    console.log(`🔍 Found ${forms.length} add-to-cart form(s)`);
    
    forms.forEach((form, index) => {
      if (!form.dataset.handlerAttached) {
        form.addEventListener('submit', handleDirectFormSubmit);
        form.dataset.handlerAttached = 'true';
        console.log(`✅ Add to cart form #${index + 1} handler attached (with cart clear)`);
      }
    });
    
    // Retry if elements not found yet
    if ((ctaButtons.length === 0 || forms.length === 0) && attachAttempts < maxAttempts) {
      setTimeout(attachHandlers, 500);
    } else {
      console.log('✅ All handlers attached successfully!');
    }
  }

  // Initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', attachHandlers);
  } else {
    attachHandlers();
  }

  // Also observe for dynamically added elements
  const mutationObserver = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.addedNodes.length) {
        // Check if any new CTAs or forms were added
        const newCtas = document.querySelectorAll('.cta-action-btn:not([data-handler-attached])');
        const newForms = document.querySelectorAll('form[action="/cart/add"]:not([data-handler-attached])');
        
        if (newCtas.length > 0 || newForms.length > 0) {
          console.log('🔄 Detected new CTA/form elements, attaching handlers...');
          attachHandlers();
        }
      }
    }
  });

  // Start observing the document for changes
  mutationObserver.observe(document.body, {
    childList: true,
    subtree: true
  });

})();