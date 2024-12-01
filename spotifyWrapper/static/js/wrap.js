let currentSlide = 1;
const totalSlides = document.querySelectorAll('.wrap-slide').length;

function showSlide(slideNumber) {
    // Hide all slides
    document.querySelectorAll('.wrap-slide').forEach(slide => {
        slide.classList.remove('active');
    });
    
    // Show the current slide
    document.getElementById(`slide-${slideNumber}`).classList.add('active');
    
    // Update button states
    document.getElementById('prevButton').disabled = slideNumber === 1;
    document.getElementById('nextButton').disabled = slideNumber === totalSlides;
}

function nextSlide() {
    if (currentSlide < totalSlides) {
        currentSlide++;
        showSlide(currentSlide);
    }
}

function previousSlide() {
    if (currentSlide > 1) {
        currentSlide--;
        showSlide(currentSlide);
    }
}

// Initialize first slide
document.addEventListener('DOMContentLoaded', () => {
    showSlide(1);
});
