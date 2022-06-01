exports.canWearShortPants = function(rainChance, temperature) {
    return rainChance < 90 && temperature > 15;
}