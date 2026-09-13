use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn animal_name(id: u8) -> String {
    match id {
        0 => "Chick",
        1 => "Hen",
        2 => "Rooster",
        3 => "Sheep",
        4 => "Pig",
        5 => "Donkey",
        6 => "Duck",
        7 => "Buffalo",
        8 => "Cow",
        _ => "Unknown",
    }
    .to_string()
}
