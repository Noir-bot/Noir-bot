export const urlRegex = /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/i
export const durationRegex = /^(((\d|\d.\d){1,3})(s|secs?|seconds?|m|mins?|minutes?|h|hours?|d|days?|w|weeks?|y|yrs?|years?)){1,2}|permanent$/i
export const sapphireDurationRegex = /(-?\d*\.?\d+(?:e[-+]?\d+)?)\s*([a-zμ]*)/gi // Steal from 
export const colorRegex = /^#[0-9A-F]{6}$/i