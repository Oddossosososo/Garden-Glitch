// GardenGlitch Zig speed core.
// Build for WebAssembly and expose these functions to JavaScript/WASM glue.

export fn speed_scale(base: f32, multiplier: f32) f32 {
    if (multiplier < 0.0) return 0.0;
    return base * multiplier;
}

export fn clamp_speed(speed: f32, max_speed: f32) f32 {
    if (speed < 0.0) return 0.0;
    if (max_speed < 0.0) return 0.0;
    return if (speed > max_speed) max_speed else speed;
}

export fn step_speed(current: f32, target: f32, acceleration: f32, delta_time: f32) f32 {
    const dt = if (delta_time < 0.0) 0.0 else delta_time;
    const accel = if (acceleration < 0.0) 0.0 else acceleration;
    const max_step = accel * dt;
    const delta = target - current;
    if (delta > max_step) return current + max_step;
    if (delta < -max_step) return current - max_step;
    return target;
}
