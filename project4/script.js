document.addEventListener("DOMContentLoaded", () => {
    const lights = document.querySelectorAll(".light");
    const button = document.getElementById("toggleButton");
    const speedRange = document.getElementById("speedRange");

    let index = 0;
    let intervalTime = speedRange.value;
    let interval;

    function animateLights() {
        lights.forEach(light => light.classList.remove("active"));
        lights[index].classList.add("active");
        index = (index + 1) % lights.length;
    }

    function startAnimation() {
        if (!interval) {
            interval = setInterval(animateLights, intervalTime);
            button.textContent = "Parar";
        }
    }

    function stopAnimation() {
        clearInterval(interval);
        interval = null;
        button.textContent = "Iniciar";
    }

    button.addEventListener("click", () => {
        if (interval) {
            stopAnimation();
        } else {
            startAnimation();
        }
    });

    speedRange.addEventListener("input", () => {
        intervalTime = speedRange.value;
        if (interval) {
            stopAnimation();
            startAnimation();
        }
    });
});
