export const dateHelper = (i) => {
    const date = new Date();
    date.setDate(date.getDate() - i * 7);
    return date;
};

export function randomHelper(min, max) {
    return Math.random() * (max - min) + min;
}

export function randomHelperRound(min, max) {
    return Math.round(randomHelper(min, max));
}
