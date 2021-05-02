const Gpio = require('pigpio').Gpio;

// The number of microseconds it takes sound to travel 1cm at 20 degrees celcius
const MICROSECDONDS_PER_CM = 1e6 / 34321;

const trigger = new Gpio(23, {mode: Gpio.OUTPUT});
const echo = new Gpio(24, {mode: Gpio.INPUT, alert: true});
const buzzer = new Gpio(25, {mode: Gpio.OUTPUT});

trigger.digitalWrite(0); // Make sure trigger is low
buzzer.digitalWrite(0); // Make sure buzzer is low

const watchHCSR04 = () => {
    let startTick;

    echo.on('alert', (level, tick) => {

        if (level === 1) {
            startTick = tick;
        } else {
            const endTick = tick;
            const diff = (endTick >> 0) - (startTick >> 0); // Unsigned 32 bit arithmetic
            console.log(diff / 2 / MICROSECDONDS_PER_CM);
            setBuzzer(10 * (diff / 2 / MICROSECDONDS_PER_CM))
        }
    });
};

watchHCSR04();

let readyForNew = true

async function setBuzzer(delay) {
    if (readyForNew === true) {
        readyForNew = false
        setTimeout(() => {
            buzzer.digitalWrite(1)
            setTimeout(() => {
                buzzer.digitalWrite(0)
                readyForNew = true
            }, delay)
        }, delay)
    }
}

// Trigger a distance measurement once per second
setInterval(() => {
    trigger.trigger(10, 1); // Set trigger high for 10 microseconds
}, 500);