// Premium Community Animations - Optimized
(function() {
  'use strict';

  // Check if user prefers reduced motion
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  if (prefersReducedMotion) {
    // Show everything immediately
    document.querySelectorAll('[data-animate]').forEach(el => {
      el.classList.add('animated');
    });
    return;
  }

  // Intersection Observer for scroll animations - more aggressive
  const observerOptions = {
    threshold: 0.05, // Trigger earlier
    rootMargin: '100px 0px 0px 0px' // Start animations before element enters viewport
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const element = entry.target;
        const delay = element.dataset.delay || 0;
        
        // Reduce delays by half
        const optimizedDelay = parseInt(delay) / 2;
        
        setTimeout(() => {
          element.classList.add('animated');
        }, optimizedDelay);
        
        observer.unobserve(element);
      }
    });
  }, observerOptions);

  // Observe all animated elements
  document.querySelectorAll('[data-animate]').forEach(el => {
    observer.observe(el);
  });

  // Number counter animation for stats - faster
  function animateNumber(element, target, duration = 1200) { // Reduced from 2000ms
    const start = 0;
    const increment = target / (duration / 16);
    let current = start;

    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }
      element.textContent = Math.floor(current).toLocaleString();
    }, 16);
  }

  // Extract and animate numbers from stats text
  function highlightAndAnimateNumbers() {
    const statsElement = document.querySelector('[data-counter-text]');
    if (!statsElement) return;

    const text = statsElement.textContent;
    const numberPattern = /(\d[\d,]*)/g;
    
    // Replace numbers with spans
    const highlightedText = text.replace(numberPattern, '<span class="highlight-number">$1</span>');
    statsElement.innerHTML = highlightedText;

    // Animate numbers when visible
    const numbersObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const numbers = statsElement.querySelectorAll('.highlight-number');
          numbers.forEach((numEl, index) => {
            const targetValue = parseInt(numEl.textContent.replace(/,/g, ''));
            if (!isNaN(targetValue) && targetValue > 10) {
              setTimeout(() => {
                numEl.textContent = '0';
                animateNumber(numEl, targetValue, 1200); // Faster animation
              }, index * 100); // Reduced from 200ms
            }
          });
          numbersObserver.unobserve(entry.target);
        }
      });
    }, observerOptions);

    numbersObserver.observe(statsElement);
  }

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', highlightAndAnimateNumbers);
  } else {
    highlightAndAnimateNumbers();
  }

})();