// GardenGlitch C speed core alternative.
#include <math.h>

float gg_speed_scale(float base, float multiplier) {
    return multiplier < 0.0f ? 0.0f : base * multiplier;
}

float gg_clamp_speed(float speed, float max_speed) {
    if (speed < 0.0f || max_speed < 0.0f) return 0.0f;
    return speed > max_speed ? max_speed : speed;
}

float gg_step_speed(float current, float target, float acceleration, float delta_time) {
    float dt = delta_time < 0.0f ? 0.0f : delta_time;
    float accel = acceleration < 0.0f ? 0.0f : acceleration;
    float step = accel * dt;
    float delta = target - current;
    if (delta > step) return current + step;
    if (delta < -step) return current - step;
    return target;
}
