exports.canWearShortPants = function(rainChance, temperature) {
    return rainChance < 30 && temperature > 15;
}